# File Sharing App

A small full-stack app for uploading and managing personal files. Users register, log in, upload documents and images, and can search, filter, download and delete their own files. Files are stored on the local filesystem and their metadata is kept in PostgreSQL.

## Features

- Register and log in with email and password (JWT auth)
- Upload files with progress, size and type validation
- List files with search, type filter and pagination
- Download and delete files, with a confirmation before deleting
- Users can only see and access their own files

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, React Router, Axios, CSS

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Multer, Helmet

**Testing:** Jest, Supertest, React Testing Library

**DevOps:** Docker, Docker Compose, GitHub Actions

## Architecture

```text
client/                 React app (Vite)
  src/
    components/         FileUpload, FileList, FileItem
    pages/              Login, Register, Files
    services/           Axios instance and API calls
    hooks/useAuth.tsx   Auth context (current user, login, logout)
    utils/              formatFileSize
  nginx.conf            Serves the build and proxies /api in Docker

server/                 Express API
  src/
    controllers/        Request handlers for auth and files
    middleware/         JWT auth, Multer upload config, error handler
    routes/             /api/auth and /api/files
    services/           File queries, ownership checks, disk cleanup
  prisma/               Schema and migrations
  tests/                API tests
```

The client talks to the API under `/api`. In development Vite proxies `/api` to `localhost:5000`, and in Docker nginx does the same for the `server` container.

Uploaded files are saved to `UPLOAD_DIR/<userId>/<random-uuid>.<ext>`. The original file name is only stored in the database and is used when the file is downloaded. The user ID always comes from the verified JWT, never from the request body.

## Local Setup

Requirements: Node.js 20+ and PostgreSQL 16. If you don't have PostgreSQL installed, you can start one with Docker:

```bash
docker run -d --name filesharing-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=filesharing postgres:16-alpine
```

### Environment variables

Copy `server/.env.example` to `server/.env` and fill in the values:

| Variable       | Description                                          | Example                                                     |
| -------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `PORT`         | API port                                             | `5000`                                                      |
| `DATABASE_URL` | PostgreSQL connection string                         | `postgresql://postgres:postgres@localhost:5432/filesharing` |
| `JWT_SECRET`   | Secret used to sign tokens (use a long random value) | `openssl rand -hex 32`                                      |
| `UPLOAD_DIR`   | Folder where uploaded files are stored               | `uploads`                                                   |
| `CLIENT_URL`   | Allowed CORS origin                                  | `http://localhost:5173`                                     |

### Database setup

```bash
cd server
npm install
npx prisma migrate deploy
```

Use `npx prisma migrate dev` instead when you change `schema.prisma`.

### Backend

```bash
cd server
npm run dev
```

The API runs on `http://localhost:5000`. On macOS, AirPlay Receiver can take port 5000. If it does, change `PORT` and the proxy target in `client/vite.config.ts`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker Setup

Runs PostgreSQL, the API and the frontend (nginx). Only `JWT_SECRET` needs to be provided:

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
docker compose up --build
```

Open `http://localhost:8080`. Migrations run automatically when the server container starts. Uploaded files are kept in the `uploads` volume and database data in the `pgdata` volume.

## API Endpoints

All file endpoints need an `Authorization: Bearer <token>` header.

| Method | Endpoint                  | Description                                         |
| ------ | ------------------------- | --------------------------------------------------- |
| POST   | `/api/auth/register`      | Create an account, returns user and token           |
| POST   | `/api/auth/login`         | Log in, returns user and token                      |
| GET    | `/api/auth/me`            | Current user                                        |
| GET    | `/api/files`              | List files (`search`, `type`, `page`, `limit`)      |
| POST   | `/api/files`              | Upload a file (`multipart/form-data`, field `file`) |
| GET    | `/api/files/:id`          | File details                                        |
| GET    | `/api/files/:id/download` | Download the file                                   |
| DELETE | `/api/files/:id`          | Delete the file                                     |

`type` can be `pdf`, `doc`, `txt`, `image` or `zip`. `limit` defaults to 10 and is capped at 50.

Responses use the same shape:

```json
{ "success": true, "data": {} }
{ "success": false, "message": "File not found" }
```

Requests for another user's file return `403`. Missing files return `404`, files over the size limit return `413`, and a duplicate email returns `409`.

## Upload Restrictions

- Allowed types: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, ZIP
- Maximum size: 10 MB, one file per request
- The extension and the MIME type must match (for example, a `.pdf` must be sent as `application/pdf`)

The frontend checks type and size before uploading, and the API checks them again.

## Testing

```bash
cd server && npm test
cd client && npm test
```

The server tests run against the database in `DATABASE_URL`. They only create users with `@test.local` emails and delete them afterwards, but using a separate database is still a good idea:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/filesharing_test npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/filesharing_test npm test
```

GitHub Actions runs type checks, tests and builds for both apps on every push and pull request to `master`.
