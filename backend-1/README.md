Requirements: Docker installed and the backend host user can run docker.
1. Install dependencies:
 cd backend
 npm install
2. Start server:
 node server.js
3. POST /api/compile with JSON { language, code, stdin? }
Example request body:
{
 "language": "python",
 "code": "print(\"hello world\")"
}