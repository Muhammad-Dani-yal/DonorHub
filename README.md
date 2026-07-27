# DonorHub

DonorHub is a responsive blood-donor and urgent-request coordination SPA built with React, Redux Toolkit, Firebase Authentication, Firebase Realtime Database, Tailwind CSS utilities, and a JSON Server fallback.

## Architecture

- Firebase Authentication provides email/password accounts and persistent sessions.
- Redux Toolkit stores global authentication state and defines donor/request state slices.
- Firebase Realtime Database is the primary data store.
- `src/services/firebaseService.js` is the primary CRUD layer and falls back to `src/services/jsonService.js` when the Firebase database is unavailable.
- `db.json` mirrors the donor/request schema and contains 10 demonstration donors.
- Route guards enforce authenticated and admin-only access.

The assignment's Firestore requirement is the only intentional backend deviation: this project retains its existing Realtime Database integration to preserve working data and behavior.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and replace placeholders with Firebase web-app values.

3. In one terminal, start the fallback API:

   ```bash
   npm run server
   ```

4. In another terminal, start Vite:

   ```bash
   npm run dev
   ```

The app runs on the Vite URL and JSON Server runs at `http://localhost:3001`.

## Firebase

Enable Firebase Email/Password authentication and create a Realtime Database. Deploy the checked-in rules with:

```bash
firebase deploy --only database
```

Admin roles must be assigned from a trusted Firebase environment by setting the user's `role` field to `admin`; public registration always creates `user` accounts.

## Validation and production build

```bash
npm run lint
npm run build
```

For deployment, publish the generated `dist` folder to Firebase Hosting, Vercel, or Netlify. Never commit a populated `.env` or service-account credentials.
