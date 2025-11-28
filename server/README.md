# StudyLab Backend (Node + Express + MongoDB)

## Overview
This backend provides authentication (register, login, refresh, logout) and saving learning history entries generated on the frontend. Each history entry stores combined source metadata (YouTube/blog/pdf), summary text, and quiz questions.

## Stack
- Express.js (API routing)
- MongoDB + Mongoose (data models)
- JWT (access + refresh tokens)
- bcrypt (password hashing)
- express-validator (input validation)
- cors + morgan (dev convenience)

## Environment Variables (.env)
Copy `.env.example` to `.env` and fill values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/studylab
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=15m
REFRESH_SECRET=another_long_random_secret
REFRESH_EXPIRES_IN=7d
```

## Installation
```bash
cd server
npm install
npm run dev
```
Server runs by default on http://localhost:5000.

## API Endpoints
Base path: `/api`

### Health
`GET /api/health` -> `{ status, time }`

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | `{ email, password, name? }` | Create user, returns access & refresh tokens |
| POST | /api/auth/login | `{ email, password }` | Returns access & refresh tokens |
| POST | /api/auth/refresh | `{ refreshToken }` | Returns new access token |
| POST | /api/auth/logout | `{ refreshToken }` | Revokes refresh token |

### History (Authenticated: `Authorization: Bearer <accessToken>`)
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /api/history | `{ sources:[{type,url,videoId,title,snippet}], summary, quiz? }` | Create history entry |
| GET | /api/history | - | List last 100 entries |
| GET | /api/history/:id | - | Get single entry |
| DELETE | /api/history/:id | - | Delete entry |

## Data Shapes
User public:
```json
{ "id": "...", "email": "user@example.com", "name": "Alice", "createdAt": "2025-11-25T..." }
```
History entry:
```json
{
  "_id": "...",
  "userId": "...",
  "sources": [ { "type": "youtube", "url": "https://...", "videoId": "abc123", "title": "Optional", "snippet": "Optional" } ],
  "summary": "...",
  "quiz": [ { "question": "...", "options": ["A","B","C","D"], "correct": 0 } ],
  "createdAt": "2025-11-25T..."
}
```

## Frontend Integration
Add a proxy in the CRA `package.json` or use full URLs. Example fetch with access token:
```js
const res = await fetch('/api/history', { headers: { Authorization: `Bearer ${accessToken}` } });
```
When creating an entry:
```js
await fetch('/api/history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ sources, summary, quiz })
});
```

## Refresh Flow
1. Store access + refresh tokens after login.
2. If a 401 due to expired access, call `/api/auth/refresh` with refreshToken.
3. Replace access token; keep refresh until logout or expiration.

## Security Notes
- Move AI API keys to backend if possible for production.
- Consider rate limiting, helmet middleware, and rotating refresh tokens.
- Use HTTPS in deployment.

## Next Enhancements
- Email verification & password reset.
- Pagination for history list.
- Source text storage (transcript blobs) with size limits.
- Role-based access control.
- Audit logging.

## License
Internal project; define license as needed.
