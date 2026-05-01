# Chatbot RAG + Session Memory Plan

## Muc tieu

- Ap dung RAG de chatbot hieu noi dung noi bo.
- Ap dung session memory ngan han de giu ngu canh hoi thoai.

## Quy uoc du lieu RAG moi

- Chatbot CHI doc file `.md` trong thu muc: `chatbot-knowledge/`.
- Cac file `.md` nam ngoai thu muc nay KHONG duoc su dung cho RAG.

## Da trien khai

1. API chat backend
- `POST /api/chat/send`

2. RAG
- Quet de quy tat ca file `.md` trong `chatbot-knowledge/`.
- Chunk theo doan van, truy hoi theo tu khoa cau hoi.

3. Session memory
- Luu lich su hoi thoai theo `sessionId` (in-memory).
- Co TTL va gioi han so luong tin.

4. Gemini server-side
- Goi Gemini tu backend, khong lo API key o frontend.
- Co fallback neu thieu key/loi provider.

## Luong request

1. Client gui:
```json
{
  "sessionId": "chat-...",
  "message": "..."
}
```

2. Server:
- Lay memory gan day theo session.
- Retrieve context tu `chatbot-knowledge/`.
- Ghep prompt (system + memory + context + user message).
- Goi Gemini va tra reply.

3. Response:
```json
{
  "ok": true,
  "sessionId": "chat-...",
  "reply": "...",
  "usedFallback": false,
  "sources": ["README.md", "AUTH_API_CONTRACT.md"],
  "memorySize": 6
}
```

## Bien moi truong lien quan

- `GEMINI_API_KEY`
- `GEMINI_CHAT_MODEL`
- `CHAT_MAX_MESSAGE_LENGTH`
- `CHAT_MAX_HISTORY_MESSAGES`
- `CHAT_MAX_CONTEXT_CHUNKS`
- `CHAT_SESSION_TTL_MINUTES`
- `CHAT_MAX_SESSIONS`
- `CHAT_KNOWLEDGE_DIR` (mac dinh: `chatbot-knowledge`)

## Nang cap tiep theo

1. Dung embeddings + vector DB (`pgvector`/`qdrant`) de retrieve chinh xac hon.
2. Luu memory vao DB de khong mat session khi restart.
3. Them rate limit, guard prompt injection, monitoring latency/token/fallback.
