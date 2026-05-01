export type ChatRole = 'user' | 'assistant';

export type ChatUiMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  sources?: string[];
};

export type ChatApiSuccessResponse = {
  ok: true;
  sessionId: string;
  reply: string;
  usedFallback: boolean;
  sources: string[];
  memorySize: number;
};

export type ChatApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

