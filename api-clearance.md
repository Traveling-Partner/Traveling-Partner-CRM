Kyun kiya? (Problem kya thi)
Pehle zyada tar admin pages aise chal rahe the:
Is pattern se yeh masle aate the:
Duplicate API calls — Dashboard (aur baaki pages) par same API ek saath 2–3 dafa chal sakti thi, khaas tor par dev mode mein (reactStrictMode: true → component do dafa mount).
Koi shared cache nahi — Page change karke wapas aao to dubara poori fetch; search/filter badlo to purani request cancel nahi hoti thi properly.
Har page par alag logic — URL banana, token, error handling, loading — sab copy-paste jaisa.
Documents page par N+1 — Pehle drivers list, phir har driver ke liye alag document status API — bahut slow aur heavy.
Solution: TanStack Query (React Query) — ek jagah data cache, duplicate request merge, unmount par cancel (AbortSignal), mutation ke baad list refresh (invalidateQueries).
Architecture — 4 layers (samajhne ke liye)
HTTP (src/lib/fetcher.ts)
Services (src/services/)
Query hooks (src/hooks/queries/)
Admin pages (src/app/admin/...)
fetcher + token + AbortSignal
fetchDriversList, fetchDocumentsQueuePage, ...
useDriversListQuery, etc.
page.tsx
Layer	Folder	Kaam
Provider	src/providers/QueryProvider.tsx + src/store/ReduxProvider.tsx	Poori app React Query se wrap
Config	src/lib/api/query-client.ts, query-config.ts, query-keys.ts	Cache time, refetch rules, unique keys
Services	src/services/*.ts	Sirf API call — React nahi
Hooks	src/hooks/queries/*.ts	Page ke liye ready hook
Primitives	src/hooks/api/	useApiQuery, useApiMutation, debounce
Detail guide: docs/API-FETCHING.md
Admin pages — kahan migrate hua, kahan abhi purana
Migrate ho chuka (React Query + services)
Page	File	Read hook	Write (mutation)
Dashboard	src/app/admin/dashboard/page.tsx	useAdminDashboardQuery	—
Drivers list	src/app/admin/drivers/page.tsx	useDriversListQuery	—
Driver detail	src/app/admin/drivers/[id]/page.tsx	useDriverDetailQuery	Approve/Restrict → updateUserStatus
Partners list	src/app/admin/partners/page.tsx	usePartnersListQuery	—
Partner detail	src/app/admin/partners/[id]/page.tsx	usePartnerDetailQuery	Active/Inactive status
Agents list	src/app/admin/agents/page.tsx	useAgentsListQuery	—
Agent detail	src/app/admin/agents/[id]/page.tsx	useAgentDetailQuery	— (sirf view)
Documents queue	src/app/admin/documents/page.tsx	Neeche detail	Approve/Reject documents
Blog list	src/app/admin/blog/page.tsx	useBlogListQuery	Delete post
Carousel list	src/app/admin/carousel/page.tsx	useCarouselBannersQuery	Delete banner
Vehicle types	src/app/admin/vehicle-types/page.tsx	4 hooks (types/models/colors/brands)	Create/Update/Delete via src/services/vehicle.ts
Abhi purana pattern (ya mock / kam API)
Page	Status
agents/create, agents/[id]/edit	Abhi bhi direct fetcher
blog/create, blog/[id]	Purana useEffect / fetch
carousel/create, carousel/[id]	Purana load
settings, rides, notifications, commissions, audit-logs	Query migration is batch mein nahi hui
Har feature ke liye files (hook ↔ service)
Hook	Service	API roughly
use-admin-dashboard-query.ts	admin-dashboard.ts	Dashboard stats (parallel calls)
use-drivers-list-query.ts	users.ts → fetchDriversList	GET /users/drivers
use-driver-detail-query.ts	users.ts → fetchDriverDetail	Driver + documents ek saath
use-partners-list-query.ts	users.ts	GET /users/partners
use-partner-detail-query.ts	users.ts	GET /users/partners/{id}
use-agents-list-query.ts	users.ts	GET /users/sale-agents
use-agent-detail-query.ts	users.ts	GET /users/sale-agents/{id}
use-documents-queue-query.ts	documents.ts	List + har driver ka doc summary
use-driver-documents-query.ts	documents.ts	Preview ke liye full docs
use-blog-list-query.ts	blog-list.ts	GET /blog/getAll
use-carousel-banners-query.ts	carousel.ts	Banners list
use-vehicle-queries.ts	vehicle.ts	Types, models, colors, brands
Sab hooks export: src/hooks/queries/index.ts
Cache keys: src/lib/api/query-keys.ts — taake mutation ke baad sahi list refresh ho.
Documents page — alag se poora flow
File: src/app/admin/documents/page.tsx
Service: src/services/documents.ts
Helpers: src/lib/documents-utils.ts (status normalize, vehicle status pick, etc.)
Pehle kya hota tha
GET /users/drivers?page&size&search → table ki rows
Har row ke liye alag: GET /users/documents/{driverId} → summary status
Preview kholo → phir se GET /users/documents/{id}
Approve/Reject → PUT /users/documents/status/{id} → phir manually loadDrivers() dubara
→ Bahut requests, slow, duplicate.
Ab kya hota hai
1) Table data — useDocumentsQueueQuery
React Query is poori cheez ko ek query key se cache karti hai:
["users", "documents", "queue", { page, pageSize, status, search }]
Search 400ms debounce (useDebouncedValue) — har keystroke par API nahi.
2) Preview modal — useDriverDocumentsQuery
Jab preview open ho aur previewDriver set ho:
GET /users/documents/{id}
buildPreviewDocuments() → license, registration, CNIC cards
buildRawDocumentStatuses() → single-doc approve/reject ke liye
Alag cache key: ["users", "drivers", "documents", driverId]
3) Approve / Reject — useApiMutation + updateDriverDocumentStatus
Table se: teeno docs ek saath APPROVED / REJECTED
Preview se: sirf selected doc (license / vehicle / CNIC) update
Success par invalidate:
["users", "documents", "queue"] → table refresh
driverDocuments(driverId) → preview refresh
Purana loadDrivers() + manual setState hata diya.
Driver detail vs documents — farq
Driver detail [id]	Documents queue
Maqsad	Ek driver ki profile + docs dikhao	Saare drivers ki verification queue
Hook	useDriverDetailQuery	useDocumentsQueueQuery + preview par useDriverDocumentsQuery
Load	fetchDriverDetail = driver API + documents API ek bundle	List + har driver ka summary status
Status change	User account: PUT /users/status/{id} (Approve driver)	Documents: PUT /users/documents/status/{id}
Dono alag APIs hain — driver “ACTIVE/INACTIVE” alag, documents “APPROVED/REJECTED” alag.
Global rules (ab project mein)
Reads → query hook + service; page par useEffect + fetcher nahi
Writes → useApiMutation ya service + queryClient.invalidateQueries
Token → hooks andar Redux se (useAuthToken / useApiQuery)
Dedupe → React Query; fetcher mein dedupe: false jab Query signal de
Debug → .env.local mein NEXT_PUBLIC_DEBUG_API=true
Short summary (Urdu)
Kyun: duplicate calls, slow documents page, har jagah alag fetch logic.
Kya: TanStack Query + shared services/hooks.
Kahan: Admin ke main list/detail pages + documents + blog list + vehicle + carousel — upar wali table.
Documents: ek service se queue load, preview alag cached query, approve/reject ke baad auto refresh.
Agar chaho to agla step: agent create/edit, blog create/edit, carousel edit — wahi pattern laga denge.
