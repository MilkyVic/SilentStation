import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { AuthHttpError } from './auth-core.js';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
  createdAt: number;
};

type ChatSession = {
  messages: ChatMessage[];
  updatedAt: number;
};

type KnowledgeChunk = {
  id: string;
  source: string;
  content: string;
  terms: Set<string>;
};

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash').trim();
const MAX_MESSAGE_LENGTH = Number(process.env.CHAT_MAX_MESSAGE_LENGTH || 1200);
const MAX_HISTORY_MESSAGES = Number(process.env.CHAT_MAX_HISTORY_MESSAGES || 8);
const MAX_CONTEXT_CHUNKS = Number(process.env.CHAT_MAX_CONTEXT_CHUNKS || 5);
const SESSION_TTL_MS = Number(process.env.CHAT_SESSION_TTL_MINUTES || 45) * 60 * 1000;
const MAX_SESSIONS = Number(process.env.CHAT_MAX_SESSIONS || 500);
const CHAT_KNOWLEDGE_DIR = (process.env.CHAT_KNOWLEDGE_DIR || 'chatbot-knowledge').trim();
const CHAT_SYSTEM_PROMPT_FILE = (process.env.CHAT_SYSTEM_PROMPT_FILE || 'SYSTEM_PROMPT_TRAM_AN.md').trim();

const chatSessions = new Map<string, ChatSession>();
let knowledgeChunksCache: KnowledgeChunk[] | null = null;
let systemPromptCache: string | null = null;
let geminiClient: GoogleGenAI | null = null;

const RED_CODE_RESPONSE = [
  'Trạm An đang ở đây và lắng nghe bạn. Những gì bạn vừa chia sẻ cho thấy bạn đang phải gánh chịu một nỗi đau quá lớn và mình thực sự rất lo lắng cho sự an toàn của bạn. Bạn không hề đơn độc trong bóng tối này đâu. Ngay lúc này, xin bạn hãy hít một hơi thật sâu và gọi ngay cho những người có chuyên môn để được bảo vệ kịp thời nhé. Sự an toàn của bạn là điều quan trọng nhất:',
  '📞 Tổng đài Quốc gia bảo vệ Trẻ em (Trực 24/7, Miễn phí): 111',
  '📞 Đường dây nóng Ngày Mai: 096 306 1414',
  '🏥 Cấp cứu Y tế / Bệnh viện Tâm thần Đà Nẵng (193 Nguyễn Lương Bằng, TP. Đà Nẵng): 115 hoặc 1900 1267.',
  'Hãy nắm lấy tay một người lớn mà bạn tin tưởng nhất lúc này, hoặc để lại số điện thoại để Phòng Tham vấn học đường hỗ trợ bạn ngay lập tức!',
].join('\n');

const OUT_OF_SCOPE_REDIRECT_RESPONSE = [
  'Mình là chatbot Trạm An nên sẽ tập trung vào sức khỏe tinh thần học đường nha.',
  'Mình đồng hành tốt ở mấy chủ đề như áp lực học tập, lo âu, mâu thuẫn bạn bè, chuyện gia đình, bắt nạt online, hoặc cách ổn định cảm xúc.',
  'Bạn muốn bắt đầu từ vấn đề nào để mình gỡ rối cùng bạn?',
].join('\n');

const normalizeForRiskDetection = (input: string) => (
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const compactForRiskDetection = (input: string) => normalizeForRiskDetection(input).replace(/\s+/g, '');

const RED_CODE_DIRECT_PATTERNS: RegExp[] = [
  /\btu\s*tu\b/,
  /\btu\s*sat\b/,
  /\btu\s*ket\s*lieu\b/,
  /\bquyen\s*sinh\b/,
  /\btu\s*van\b/,
  /\bmuon\s*chet\b/,
  /\btim\s*den\s*cai\s*chet\b/,
  /\br[aă]ch\s*tay\b/,
  /\bcat\s*tay\b/,
  /\br[aă]ch\s*co\s*tay\b/,
  /\bnhay\s*lau\b/,
  /\bnhay\s*cau\b/,
  /\buong\s*thuoc\s*ngu\b/,
  /\buong\s*thuoc\s*diet\s*co\b/,
  /\bthat\s*co\b/,
  /\btreo\s*co\b/,
  /\bgiet\s*nguoi\b/,
  /\bgiet\b/,
  /\bdam\b/,
  /\bchem\b/,
  /\btat\s*axit\b/,
  /\bdanh\s*hoi\s*dong\b/,
  /\bdan\s*mat\b/,
  /\bchan\s*duong\s*danh\b/,
  /\bmua\s*dao\b/,
  /\btim\s*vu\s*khi\b/,
  /\btra\s*thu\b/,
  /\bdam\s*chet\b/,
  /\bchem\s*chet\b/,
  /\bboc\s*phot\b/,
  /\btung\s*clip\b/,
  /\btung\s*anh\s*nong\b/,
  /\bkhong\s*muon\s*song\s*nua\b/,
  /\bsong\s*khong\s*bang\s*chet\b/,
  /\bmuon\s*bien\s*mat\s*mai\s*mai\b/,
  /\buoc\s*gi\s*minh\s*chua\s*tung\s*sinh\s*ra\b/,
  /\bday\s*la\s*lan\s*cuoi\b/,
  /\btin\s*nhan\s*cuoi\s*cung\b/,
  /\bmoi\s*thu\s*sap\s*ket\s*thuc\b/,
  /\btuyet\s*vong\s*tot\s*cung\b/,
  /\bkhong\s*con\s*loi\s*thoat\b/,
  /\bse\s*khong\s*con\s*ai\s*phai\s*ban\s*tam\s*ve\s*minh\s*nua\b/,
];

const RED_CODE_BYPASS_COMPACT_PATTERNS: RegExp[] = [
  /t\W*u\W*t\W*u/,
  /t\W*u\W*s\W*a\W*t/,
  /t\W*u\W*k\W*e\W*t\W*l\W*i\W*e\W*u/,
];

const RED_CODE_FALSE_POSITIVE_PATTERNS: RegExp[] = [
  /\bchet\s*minh\s*roi\b/,
  /\bcuoi\s*chet\s*mat\b/,
  /\bchet\s*that\b/,
  /\bchet\s*roi\b/,
  /\bngon\s*chet\s*di\s*duoc\b/,
  /\bmet\s*chet\s*di\s*duoc\b/,
  /\bso\s*chet\s*khiep\b/,
];

const RED_CODE_AMBIGUOUS_SLANG_PATTERNS: RegExp[] = [
  /\b44\b/,
  /\breset\b/,
  /\bdang\s*xuat\b/,
  /\bisekai\b/,
  /\bdi\s*ban\s*muoi\b/,
  /\bdi\s*ngam\s*ga\s*khoa\s*than\b/,
  /\bsang\s*the\s*gioi\s*ben\s*kia\b/,
];

const RED_CODE_AMBIGUOUS_CONTEXT_PATTERNS: RegExp[] = [
  /\bcuoc\s*doi\b/,
  /\bban\s*than\b/,
  /\bkhoi\s*trai\s*dat\b/,
  /\bkhoi\s*the\s*gioi\b/,
  /\bkhong\s*muon\s*song\b/,
  /\bmuon\s*chet\b/,
  /\bket\s*thuc\b/,
  /\btu\s*tu\b/,
  /\btu\s*sat\b/,
  /\bbien\s*mat\b/,
];

const CHAT_SCOPE_HINT_PATTERNS: RegExp[] = [
  /\bhoc\s*sinh\b/,
  /\bthpt\b/,
  /\bhoc\s*duong\b/,
  /\btruong\b/,
  /\bgiao\s*v(i|ie)n\b/,
  /\btham\s*van\b/,
  /\btam\s*ly\b/,
  /\btam\s*than\b/,
  /\bwell\s*being\b/,
  /\bsel\b/,
  /\bcam\s*xuc\b/,
  /\bcang\s*thang\b/,
  /\bstress\b/,
  /\blo\s*au\b/,
  /\bhoang\s*loan\b/,
  /\btram\s*cam\b/,
  /\bfomo\b/,
  /\bbat\s*nat\b/,
  /\bcyberbullying\b/,
  /\bap\s*luc\b/,
  /\bthi\s*cu\b/,
  /\bdinh\s*huong\b/,
  /\bban\s*be\b/,
  /\bgia\s*dinh\b/,
  /\btu\s*tin\b/,
  /\btu\s*ton\b/,
  /\bmat\s*ngu\b/,
];

const SCOPE_STOPWORDS = new Set([
  'a', 'anh', 'ban', 'bang', 'chi', 'cho', 'co', 'con', 'cua', 'dang', 'de', 'duoc',
  'em', 'gi', 'giup', 'hay', 'hon', 'khong', 'la', 'lam', 'minh', 'mot', 'nhe', 'neu',
  'nhung', 'qua', 'roi', 'sao', 'tai', 'the', 'thi', 'toi', 'tu', 've', 'va', 'voi',
  'viet', 'ham', 'code', 'javascript',
]);

const detectRedCode = (input: string) => {
  const normalized = normalizeForRiskDetection(input);
  const compact = compactForRiskDetection(input);
  if (!normalized) return { triggered: false, reason: 'empty' as const };

  const directHit = RED_CODE_DIRECT_PATTERNS.some((pattern) => pattern.test(normalized));
  const bypassHit = RED_CODE_BYPASS_COMPACT_PATTERNS.some((pattern) => pattern.test(compact));
  if (directHit || bypassHit) {
    const falsePositiveOnly = RED_CODE_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(normalized))
      && !/(tu\s*tu|tu\s*sat|muon\s*chet|khong\s*muon\s*song|giet|dam|chem|that\s*co|treo\s*co)/.test(normalized);
    if (!falsePositiveOnly) {
      return { triggered: true, reason: 'direct' as const };
    }
  }

  const slangHit = RED_CODE_AMBIGUOUS_SLANG_PATTERNS.some((pattern) => pattern.test(normalized));
  if (slangHit) {
    const contextHit = RED_CODE_AMBIGUOUS_CONTEXT_PATTERNS.some((pattern) => pattern.test(normalized));
    if (contextHit) {
      return { triggered: true, reason: 'slang_with_context' as const };
    }
  }

  return { triggered: false, reason: 'none' as const };
};

const detectOutOfScope = (input: string, knowledgeChunks: KnowledgeChunk[]) => {
  const normalized = normalizeForRiskDetection(input);
  if (!normalized) return false;

  const hasScopeHint = CHAT_SCOPE_HINT_PATTERNS.some((pattern) => pattern.test(normalized));
  if (hasScopeHint) return false;

  const terms = Array.from(new Set(tokenize(input))).filter(
    (term) => !SCOPE_STOPWORDS.has(term) && term.length >= 3,
  );
  if (!terms.length) return false;

  let matchedTerms = 0;
  for (const term of terms) {
    if (knowledgeChunks.some((chunk) => chunk.terms.has(term))) {
      matchedTerms += 1;
    }
  }

  const overlapRatio = matchedTerms / terms.length;
  if (matchedTerms >= 2 || overlapRatio >= 0.25) {
    return false;
  }

  return true;
};

const tokenize = (input: string) => (
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\u00C0-\u1EF9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((term) => term.length >= 2)
);

const sanitizeText = (value: unknown) => (
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
);

const buildChunkId = (source: string, index: number) => `${source}#${index}`;

const chunkMarkdown = (source: string, content: string): KnowledgeChunk[] => {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length >= 40);

  return blocks.map((block, index) => ({
    id: buildChunkId(source, index),
    source,
    content: block,
    terms: new Set(tokenize(block)),
  }));
};

const listMarkdownFiles = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await listMarkdownFiles(absolutePath);
      results.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push(absolutePath);
    }
  }

  return results;
};

const loadKnowledgeChunks = async (): Promise<KnowledgeChunk[]> => {
  if (knowledgeChunksCache) return knowledgeChunksCache;

  const chunks: KnowledgeChunk[] = [];
  const rootDir = process.cwd();
  const knowledgeDirPath = path.join(rootDir, CHAT_KNOWLEDGE_DIR);

  let markdownFiles: string[] = [];
  try {
    markdownFiles = await listMarkdownFiles(knowledgeDirPath);
  } catch {
    knowledgeChunksCache = [];
    return knowledgeChunksCache;
  }

  for (const absoluteFilePath of markdownFiles) {
    if (path.basename(absoluteFilePath) === CHAT_SYSTEM_PROMPT_FILE) {
      continue;
    }
    try {
      const content = await fs.readFile(absoluteFilePath, 'utf8');
      const relativeSource = path.relative(knowledgeDirPath, absoluteFilePath).replace(/\\/g, '/');
      chunks.push(...chunkMarkdown(relativeSource, content));
    } catch {
      // Skip unreadable files.
    }
  }

  knowledgeChunksCache = chunks;
  return chunks;
};

const loadSystemPrompt = async (): Promise<string> => {
  if (systemPromptCache) return systemPromptCache;

  const filePath = path.join(process.cwd(), CHAT_KNOWLEDGE_DIR, CHAT_SYSTEM_PROMPT_FILE);
  try {
    const content = (await fs.readFile(filePath, 'utf8')).trim();
    if (content) {
      systemPromptCache = content;
      return systemPromptCache;
    }
  } catch {
    // Use fallback prompt below when file is missing.
  }

  systemPromptCache = [
    'Ban la tro ly cho he thong Tram An, tra loi bang tieng Viet ro rang va ngan gon.',
    'Chi su dung thong tin trong ngu canh RAG duoc cung cap.',
    'Neu khong du du lieu, hay noi ro can them thong tin.',
  ].join('\n');
  return systemPromptCache;
};

const getSession = (sessionId: string): ChatSession => {
  const now = Date.now();
  const existing = chatSessions.get(sessionId);
  if (existing) {
    existing.updatedAt = now;
    return existing;
  }

  if (chatSessions.size >= MAX_SESSIONS) {
    let oldestKey: string | null = null;
    let oldestAt = Number.MAX_SAFE_INTEGER;
    for (const [key, value] of chatSessions.entries()) {
      if (value.updatedAt < oldestAt) {
        oldestAt = value.updatedAt;
        oldestKey = key;
      }
    }
    if (oldestKey) chatSessions.delete(oldestKey);
  }

  const created: ChatSession = { messages: [], updatedAt: now };
  chatSessions.set(sessionId, created);
  return created;
};

const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [key, value] of chatSessions.entries()) {
    if (now - value.updatedAt > SESSION_TTL_MS) {
      chatSessions.delete(key);
    }
  }
};

const retrieveKnowledge = async (query: string): Promise<KnowledgeChunk[]> => {
  const chunks = await loadKnowledgeChunks();
  if (!chunks.length) return [];

  const queryTerms = new Set(tokenize(query));
  if (!queryTerms.size) return chunks.slice(0, MAX_CONTEXT_CHUNKS);

  const scored = chunks
    .map((chunk) => {
      let score = 0;
      for (const term of queryTerms) {
        if (chunk.terms.has(term)) score += 1;
      }
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return chunks.slice(0, Math.min(MAX_CONTEXT_CHUNKS, chunks.length));
  }

  return scored.slice(0, MAX_CONTEXT_CHUNKS).map((item) => item.chunk);
};

const buildPrompt = (
  systemPrompt: string,
  message: string,
  contextChunks: KnowledgeChunk[],
  history: ChatMessage[],
  metadata: Record<string, string>,
) => {
  const contextText = contextChunks
    .map((chunk, index) => `[${index + 1}] (${chunk.source}) ${chunk.content}`)
    .join('\n\n');

  const historyText = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => `${item.role === 'user' ? 'Nguoi dung' : 'Tro ly'}: ${item.content}`)
    .join('\n');

  return [
    'SYSTEM PROMPT:',
    systemPrompt,
    '',
    `Metadata: ${JSON.stringify(metadata)}`,
    '',
    'Lich su hoi thoai gan day:',
    historyText || '(chua co)',
    '',
    'Ngu canh RAG:',
    contextText || '(khong co tai lieu)',
    '',
    `Cau hoi moi: ${message}`,
    '',
    'Hay tra loi ngan gon, de hieu, khong nen liet ke ten file tai lieu noi bo.',
  ].join('\n');
};

const fallbackAnswer = (message: string, chunks: KnowledgeChunk[]) => {
  if (!chunks.length) {
    return `Mình chưa có đủ dữ liệu trong Trạm An để trả lời chuẩn cho câu: "${message}". Bạn nói rõ thêm bối cảnh một chút, mình sẽ hỗ trợ sát hơn nha.`;
  }

  return [
    'Mình đang bám theo tài liệu nội bộ gần nhất của Trạm An để trả lời nè:',
    '- Bạn hỏi cụ thể hơn một chút để mình trả lời sát đúng phần bạn cần nhé.',
  ].join('\n');
};

const getGeminiClient = () => {
  if (!GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return geminiClient;
};

export const sendChatMessage = async (payload: unknown) => {
  cleanupExpiredSessions();

  const body = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  const incomingMessage = sanitizeText(body.message);
  if (!incomingMessage) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Noi dung tin nhan khong hop le.');
  }
  if (incomingMessage.length > MAX_MESSAGE_LENGTH) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', `Tin nhan vuot qua ${MAX_MESSAGE_LENGTH} ky tu.`);
  }

  const requestedSessionId = sanitizeText(body.sessionId);
  const sessionId = requestedSessionId || `chat-${crypto.randomUUID()}`;
  const session = getSession(sessionId);

  const redCode = detectRedCode(incomingMessage);
  if (redCode.triggered) {
    const reply = RED_CODE_RESPONSE;
    session.messages.push(
      { role: 'user', content: incomingMessage, createdAt: Date.now() },
      { role: 'assistant', content: reply, createdAt: Date.now() },
    );
    session.messages = session.messages.slice(-(MAX_HISTORY_MESSAGES * 2));
    session.updatedAt = Date.now();

    return {
      sessionId,
      reply,
      usedFallback: false,
      sources: ['red-code-protocol'],
      memorySize: session.messages.length,
      safetyTriggered: true,
    };
  }

  const knowledgeChunks = await loadKnowledgeChunks();
  const outOfScope = detectOutOfScope(incomingMessage, knowledgeChunks);
  if (outOfScope) {
    const reply = OUT_OF_SCOPE_REDIRECT_RESPONSE;
    session.messages.push(
      { role: 'user', content: incomingMessage, createdAt: Date.now() },
      { role: 'assistant', content: reply, createdAt: Date.now() },
    );
    session.messages = session.messages.slice(-(MAX_HISTORY_MESSAGES * 2));
    session.updatedAt = Date.now();

    return {
      sessionId,
      reply,
      usedFallback: false,
      sources: ['scope-guard'],
      memorySize: session.messages.length,
      scopeRedirected: true,
    };
  }

  const systemPrompt = await loadSystemPrompt();
  const contextChunks = await retrieveKnowledge(incomingMessage);
  const prompt = buildPrompt(
    systemPrompt,
    incomingMessage,
    contextChunks,
    session.messages,
    {
      app: 'tram-an',
      mode: sanitizeText(body.mode) || 'default',
    },
  );

  let reply = '';
  let usedFallback = false;

  const client = getGeminiClient();
  if (!client) {
    usedFallback = true;
    reply = fallbackAnswer(incomingMessage, contextChunks);
  } else {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      reply = sanitizeText(response.text);
      if (!reply) {
        usedFallback = true;
        reply = fallbackAnswer(incomingMessage, contextChunks);
      }
    } catch (error) {
      console.error('[chat-core] Gemini generate failed', error);
      usedFallback = true;
      reply = fallbackAnswer(incomingMessage, contextChunks);
    }
  }

  session.messages.push(
    { role: 'user', content: incomingMessage, createdAt: Date.now() },
    { role: 'assistant', content: reply, createdAt: Date.now() },
  );
  session.messages = session.messages.slice(-(MAX_HISTORY_MESSAGES * 2));
  session.updatedAt = Date.now();

  return {
    sessionId,
    reply,
    usedFallback,
    sources: contextChunks.length ? ['knowledge-base'] : [],
    memorySize: session.messages.length,
  };
};
