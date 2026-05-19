# Smart Inventory ERP — Frontend (Phase 1)

Web UI for login, dashboard, products, and categories.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- React Hook Form + Zod
- lucide-react icons

## Setup

```bash
npm install

# .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start frontend (port 3000)
npm run dev
```

Ensure the backend is running on port 3001 before using the app.

## Deploy on Vercel

1. Push this frontend repo to GitHub.
2. Import the repo in Vercel.
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL, for example:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

4. Deploy. Vercel will use `npm run build` from `vercel.json`.

## Pages

- `/login` — authentication
- `/dashboard` — overview stats
- `/products` — list, search, filter, CRUD (admin)
- `/categories` — list, CRUD (admin)

Staff users can view products and categories; only ADMIN can create, edit, or delete.
