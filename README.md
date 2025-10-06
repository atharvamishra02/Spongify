## Deploying to Vercel

This is a Next.js (App Router) project backed by MongoDB. Follow these steps to deploy on Vercel.

### 1) Environment Variables

Create the following in your Vercel Project → Settings → Environment Variables:

- `MONGODB_URI` — your MongoDB connection string (MongoDB Atlas recommended)

For local development, create a `.env.local` file at the project root:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

Our Mongo client loader (`lib/mongodb.js`) reads `process.env.MONGODB_URI`. The app will crash at boot if it's missing, which helps catch misconfig early.

### 2) Build & Run

Scripts are already configured:

- `npm run dev` — local development
- `npm run build` — production build
- `npm start` — production server

### 3) Vercel Setup

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it into Vercel.
3. Add `MONGODB_URI` in Project Settings.
4. Deploy.

### 4) Notes

- API routes under `app/api/**` run on the server automatically in Vercel.
- Audio streaming endpoint is `/api/songs/[id]` and sets `Content-Type: audio/mpeg`.
- Remote images domain `upload.wikimedia.org` is whitelisted in `next.config.mjs`.
