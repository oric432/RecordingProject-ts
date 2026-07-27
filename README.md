# RecordingProject-ts

A full-stack app for recording, storing, and playing back audio streams. It has two parts:

- **backend** — Express + TypeScript API that manages recording metadata (via Prisma/SQLite), stores audio files in MinIO, and streams recorded audio to clients over Socket.IO.
- **frontend** — React + TypeScript (Vite) app for browsing finished recordings, viewing recordings currently in progress, and playing them back in the browser.

## How it works

- A separate recording client (e.g. a device on the network) streams live audio to the backend over Socket.IO.
- The backend saves finished recordings' metadata in a SQLite database (via Prisma) and the raw audio files in MinIO object storage.
- The frontend calls the backend's REST API to list recordings and running recordings, and uses Socket.IO to fetch/stream a recording's audio for playback.

## Project structure

```
backend/
  src/
    app.ts                  Express + Socket.IO server entry point
    controllers/            Route handlers (recordings, running recordings)
    routes/                 Express routers
    utils/                  MinIO client, streaming logic, recording client, shared types
    errors/                 Custom API error classes + error handler middleware
  prisma/
    schema.prisma           Database schema (Recording, RunningRecording)
    migrations/             Prisma migration history

frontend/
  src/
    components/             UI components (recording list/table, audio player, etc.)
    hooks/                  Data-fetching hooks
    App.tsx, main.tsx       App entry points
```

## Requirements

- Node.js
- A MinIO server (for audio file storage)
- SQLite (used via Prisma; no separate server needed)

## Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
PORT=3001
RECORDING_BUCKET_NAME=<your-minio-bucket-name>
MINIO_ENDPOINT=<minio-host>
MINIO_PORT=<minio-port>
MINIO_ACCESS_KEY=<minio-access-key>
MINIO_SECRET_KEY=<minio-secret-key>
```

Also update the `datasource db` `url` in `backend/prisma/schema.prisma` to a valid SQLite file path for your machine.

Then apply migrations and start the server:

```bash
npx prisma migrate deploy
npm start
```

The API listens on `PORT` (default `3001`) and exposes:

- `GET /api/v1/recordings` — list all saved recordings
- `POST /api/v1/recordings` — save a new recording's metadata
- `GET /api/v1/recordings/object/:id` — download a recording's audio file
- `GET /api/v1/runningRecording` — list recordings currently in progress

It also runs a Socket.IO server on the same port for streaming a recording's audio (`requestRecording` event) to connected clients.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server. Open the printed local URL in your browser. The frontend expects the backend API to be reachable (see `frontend/src` for the base URL used by the data-fetching hooks).

## Building for production

```bash
# backend
cd backend && npm run build   # compiles TypeScript to dist/

# frontend
cd frontend && npm run build  # produces a static build in dist/
```
