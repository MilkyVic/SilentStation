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

const CHAT_SESSION_STORAGE_KEY = 'tram_an_chat_session_id';

const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  if (existing) return existing;
  const generated = `chat-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, generated);
  return generated;
};

const setSessionId = (sessionId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, sessionId);
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
