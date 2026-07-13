# Express Session Labs

Small Express labs for learning:

- `Lab 1`: cookie-based session and authentication
- `Lab 2`: authorization by role

## Stack

- Node.js
- Express
- `cookie-parser`

## Project Structure

```text
.
├── labs
│   ├── lab1-cookie-session
│   │   ├── README.md
│   │   └── server.js
│   ├── lab2-authorization
│   │   ├── README.md
│   │   └── server.js
│   └── shared
│       └── users.js
├── package.json
└── package-lock.json
```

## Demo Accounts

| Username | Password   | Role   |
|----------|------------|--------|
| `admin`  | `password` | admin  |
| `user`   | `password` | user   |

## Getting Started

Install dependencies:

```bash
npm install
```

Run Lab 1:

```bash
npm run dev:lab1
```

Run Lab 2:

```bash
npm run dev:lab2
```

## Labs

### Lab 1: Cookie Session

Purpose:
Learn how the server creates a session, stores it in memory, and sends the session ID back in a cookie.

Server:
`http://localhost:3000`

Endpoints:

- `POST /login`
- `GET /profile`
- `POST /logout`
- `GET /debug-sessions`

Example login:

```bash
curl -i -c cookie.txt -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Example profile request:

```bash
curl -i -b cookie.txt http://localhost:3000/profile
```

### Lab 2: Authorization

Purpose:
Learn how authentication and authorization are different by checking user roles after login.

Server:
`http://localhost:3001`

Endpoints:

- `POST /login`
- `GET /profile`
- `GET /admin`
- `DELETE /users`
- `POST /logout`
- `GET /debug-sessions`

Example admin access:

```bash
curl -i -b cookie.txt http://localhost:3001/admin
```

## Key Concepts

- Authentication checks who the user is.
- Authorization checks what the user is allowed to do.
- The session store in these labs is in-memory only.
- Cookies use `httpOnly` and `sameSite: "lax"` for basic protection.

## Notes

- These labs are for learning only, not production use.
- Sessions disappear when the server restarts.
- Passwords are hardcoded in plain text.
- `/debug-sessions` is intentionally exposed for demonstration.
- In production, session storage should use Redis or a database.
- In production, cookies should usually be `secure: true` under HTTPS.

## Scripts

```bash
npm run dev
npm run dev:lab1
npm run dev:lab2
```
