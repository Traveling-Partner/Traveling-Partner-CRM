# Traveling Partner CRM

Next.js 14 admin/agent portal for ride-hailing operations: authentication (Redux + JWT), role-based routes (`/admin/*`, `/agent/*`), and REST integration via `NEXT_PUBLIC_API_URL`.

## Prerequisites

- Node.js 18+
- `.env.local` with at least:

```bash
NEXT_PUBLIC_API_URL=https://your-api-host   # may include or omit trailing /api; blog helpers use `src/lib/api-base.ts`
```

## Scripts

| Command        | Description           |
|----------------|-----------------------|
| `npm run dev`  | Development server    |
| `npm run build`| Production build      |
| `npm run start`| Run production build  |
| `npm run lint` | ESLint                |

## Documentation

- **[TESTING.md](./TESTING.md)** — Manual test cases, edge cases, and cross-module checks (auth, dashboard, drivers, partners, documents, blog, vehicle management, etc.). Use this for QA and regression before releases.

## Architecture (high level)

- **App Router** — `src/app/` (auth group, admin, agent, public blog).
- **State** — Redux (`src/store/`), `AuthBootstrap` hydrates from `localStorage` + JWT.
- **API** — `src/lib/fetcher.ts` (JSON, `Authorization: Bearer`); most list pages call `${NEXT_PUBLIC_API_URL}/...` directly; blog admin uses `apiUrl()` for `/api/...` prefix rules.
- **Guards** — `ProtectedRoute` + `src/lib/rbac.ts` (admin vs agent route separation).

## License

Private project — see repository owner.
