# Image Processing Service 🖼️

A lightweight Express + **TypeScript** service for handling image uploads, storage (ImageKit), and simple image transformations. It uses MongoDB for metadata and Redis for short-lived token handling.

---

## ✅ Quick overview

- **Language:** TypeScript
- **Framework:** Express
- **Storage:** MongoDB (Mongoose)
- **Uploads:** multer → ImageKit
- **Queue / cache:** Redis (used for token revocation)
- **Default HTTP port:** **5600**

---

## 🔧 Prerequisites

- Node.js (recommended >= 18)
- npm or Yarn
- Docker & Docker Compose (optional)

> On Windows, make sure Docker Desktop is running before using Docker Compose.

---

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/Debanjan2007/image-processor.git
cd image-processor
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (see **Environment** below). For local development put the `.env` in `app/src` (the app loads `.env` relative to the compiled runtime).

4. Build and run:

```bash
npm run build
npm start
# server will be available at http://localhost:5600
```

For faster iteration during development, consider adding a `dev` script that uses `ts-node-dev` or running `npm run build && npm run dev` (current `dev` script runs `nodemon` against the compiled `dist`).

---

## 🧩 Environment variables (.env)

Minimum recommended variables:

```env
NODE_ENV=development
MONGO_URI=mongodb://<user>:<pass>@localhost:27017/<dbname>?authSource=admin
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
REDIS_URL=redis://<host>:<port>
REDIS_PASS=
```

- `MONGO_URI` — connection string to your MongoDB
- `JWT_SECRET` — used to sign access tokens
- `IMAGEKIT_*` — ImageKit credentials (private key used at runtime)
- `REDIS_URL`, `REDIS_PASS` — used by Redis client in the app

---

## ▶️ Scripts

- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled app from `dist/`
- `npm run dev` — currently starts `nodemon` against `dist` (consider updating to `ts-node-dev` for true source-level dev)

---

## 🐳 Docker

Build the production image and run locally:

```bash
docker build -t image-processing:latest .
docker run -p 5600:5600 --env-file ./path/to/.env image-processing:latest
```

The included Dockerfile exposes port **5600** and creates an `uploads` folder in the built image (used temporarily during uploads).

To start the bundled MongoDB + UI (Mongo Express) for local testing, use the provided compose in `docker/`:

```bash
cd docker
docker-compose up -d
# Mongo on 27017, Mongo Express UI on http://localhost:8081
```

---

## 🧭 HTTP API (routes)

Base path: `http://localhost:5600/api/v1`

All `/user` endpoints are mounted under `/api/v1/user` and most require a valid access token (cookie `accessToken`) set by login/registration.

- POST `/api/v1/user/register` — Register a new user
  - Body (JSON): `{ "username": "string", "password": "string" }`
  - Response: `201` with `{ accessToken, user }` and `accessToken` set as an HTTP-only cookie

- POST `/api/v1/user/login` — Login
  - Body (JSON): `{ "username": "string", "password": "string" }`
  - Response: `200` with `{ accessToken, user }` and cookie

- POST `/api/v1/user/upload-image` — Upload image (protected)
  - Auth: cookie `accessToken`
  - Form: `multipart/form-data` field name: `image` (file)
  - Response: `200` with `{ url, id }`

- GET `/api/v1/user/images` — List images (protected)
  - Query: `?page=1&limit=10`

- GET `/api/v1/user/images/:id` — Get image metadata by ImageKit file id (protected)

- PATCH `/api/v1/user/images/:id/transform` — Transform image (protected)
  - Body (JSON): uses the shape below (see `image.types.ts`):

```json
{
  "transformations": {
    "resize": { "width": 200, "height": 200 },
    "format": "jpg"
  }
}
```

- DELETE `/api/v1/user/delete-image/:id` — Delete image from user's metadata (protected)
- POST `/api/v1/user/logout` — Logout (protected)
- DELETE `/api/v1/user/delete-account` — Delete user account (protected)

Healthcheck endpoint (note):

- GET `/api/v1/heathcheck` — returns "Healthcheck OK"
  - Important: this route is implemented as `/heathcheck` (missing the 'l'). If you want, I can fix it to `/healthcheck` in a follow-up change.

---

## 🔁 Upload & image flow

- Uploads are first stored on disk by `multer` then forwarded to **ImageKit**.
- After successful upload to ImageKit, the local temp file is removed.
- Metadata (file id, url, dimensions) is stored in MongoDB under the user document.

---

## 🔧 Examples (curl)

Register and save cookie:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}' \
  http://localhost:5600/api/v1/user/register
```

Login and save cookie:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}' \
  http://localhost:5600/api/v1/user/login
```

Upload an image using the saved cookie:

```bash
curl -X POST -b cookies.txt -F "image=@/path/to/photo.jpg" \
  http://localhost:5600/api/v1/user/upload-image
```

Request a transformed image:

```bash
curl -X PATCH -H "Content-Type: application/json" -b cookies.txt \
  -d '{"transformations":{"resize":{"width":200,"height":200}}}' \
  http://localhost:5600/api/v1/user/images/<fileId>/transform
```

---

## 🚧 Notes & TODOs

- Consider fixing the healthcheck route name from `/heathcheck` → `/healthcheck`.
- Add unit tests (Jest + ts-jest) and integration tests for endpoints.
- Improve the `dev` script to use `ts-node-dev` for an in-source dev loop.

---

## 🤝 Contributing

Contributions are welcome — please open a PR with tests and a clear description.

---

## 📄 License

This repository is currently licensed under **ISC** (see `package.json`).
