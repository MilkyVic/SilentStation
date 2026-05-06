import type { ChatApiErrorResponse, ChatApiSuccessResponse } from '../types/chat';

type ChatSendResult = {
  ok: true;
  data: {
    reply: string;
    sources: string[];
    handbookSectionIds: string[];
    usedFallback: boolean;
  };
} | {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

const CHAT_SESSION_STORAGE_KEY_PREFIX = 'tram_an_chat_session_id';
const DEFAULT_CHAT_OWNER = 'guest';

let activeChatOwner = DEFAULT_CHAT_OWNER;

const normalizeChatOwner = (owner?: string) => {
  const normalized = String(owner || '').trim().toLowerCase();
  return normalized || DEFAULT_CHAT_OWNER;
};

const getSessionStorageKey = (owner?: string) => (
  `${CHAT_SESSION_STORAGE_KEY_PREFIX}:${normalizeChatOwner(owner)}`
);

const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  const storageKey = getSessionStorageKey(activeChatOwner);
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = `chat-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
};

const setSessionId = (sessionId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getSessionStorageKey(activeChatOwner), sessionId);
};

const parseChatResponse = (
  payload: unknown,
): ChatApiSuccessResponse | ChatApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }
  return payload as ChatApiSuccessResponse | ChatApiErrorResponse;
};

export const chatService = {
  setActiveOwner(owner: string, resetSession = false) {
    activeChatOwner = normalizeChatOwner(owner);
    if (!resetSession || typeof window === 'undefined') return;
    window.localStorage.removeItem(getSessionStorageKey(activeChatOwner));
  },
  async sendMessage(message: string): Promise<ChatSendResult> {
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: getSessionId(),
          message: message.trim(),
          mode: 'support',
        }),
      });

      const raw = await response.json().catch(() => null);
      const parsed = parseChatResponse(raw);
      if (!parsed) {
        return {
          ok: false,
          error: {
            code: 'CHAT_SERVER_ERROR',
            message: 'Không đọc được phản hồi chatbot.',
          },
        };
      }

      if ('error' in parsed) {
        return {
          ok: false,
          error: {
            code: parsed.error.code || 'CHAT_SERVER_ERROR',
            message: parsed.error.message || 'Chatbot đang bận, vui lòng thử lại.',
          },
        };
      }

      setSessionId(parsed.sessionId);
      return {
        ok: true,
        data: {
          reply: parsed.reply,
          sources: parsed.sources || [],
          handbookSectionIds: Array.isArray(parsed.handbookSectionIds) ? parsed.handbookSectionIds : [],
          usedFallback: parsed.usedFallback,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: 'CHAT_NETWORK_ERROR',
          message: 'Không thể kết nối chatbot.',
        },
      };
    }
  },
};
