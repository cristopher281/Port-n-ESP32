# Deployment Guide

## Clever Cloud MySQL

1. Create a MySQL add-on in Clever Cloud.
2. Copy connection details (host, port, database, user, password).
3. Add those values to `backend/.env` or to your deployment env variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

## Backend deployment (example: Render / Railway / Clever Cloud)

- Ensure `NODE_ENV=production` and proper `FRONTEND_URL`.
- On deploy, run `npm run init-db` once to create tables (or run migrations).

## Frontend deployment (Vercel / Netlify)

- Point the build output to the `frontend` project.
- Provide `VITE_API_BASE` pointing to the backend production API.

## SSL / HTTPS

- Use HTTPS for device communication. Configure TLS on your hosting provider or use CDN with automatic certs.
