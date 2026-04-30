# Manual test matrix — Traveling Partner CRM

This document lists **manual** test cases and **edge cases** aligned with the current codebase (`src/app`, `src/services`, `src/store`, `src/lib`). Automated tests are not assumed; run these in a staging environment with a known backend.

---

## 0. Preconditions (every session)

| ID | Case | Expected |
|----|------|----------|
| P1 | `NEXT_PUBLIC_API_URL` missing or wrong host | App may fail API calls; verify env before blaming UI |
| P2 | Backend down / CORS / 502 | Toasts or empty states; no white screen |
| P3 | Login with valid admin credentials | Token in `localStorage`, redirect to `/dashboard` |
| P4 | Hard refresh on `/admin/dashboard` while logged in | Session restores via `AuthBootstrap`; no redirect loop |
| P5 | JWT expired (`exp` in past) | Redirect to `/login`, storage cleared |

---

## 1. Auth & session

| ID | Case | Expected |
|----|------|----------|
| A1 | Login: mobile + OTP flow | Second step sends OTP; success navigates to `/dashboard` |
| A2 | Wrong OTP | Error message; stays on login |
| A3 | Admin user `name` / `email` from login payload | Header shows name when API returns `data.name` (stored in Redux + `localStorage` user) |
| A4 | Logout from header | Clears auth, navigates to `/login` |
| A5 | Open `/admin/dashboard` as **AGENT** user | Redirect to `/agent/dashboard` per `rbac.ts` / `ProtectedRoute` |
| A6 | Open `/agent/dashboard` as **ADMIN** | Redirect to `/admin/dashboard` |
| A7 | Open protected URL with no token | Redirect to `/login` |
| A8 | Role not in `allowedRoles` (if route restricts) | Redirect to `/403` |

**Edge cases**

- Partial `user` in `localStorage` (missing `name`): UI should not crash; header fallback still works.
- Token present but corrupt / non-JWT: decode fails → logout path should behave safely.

---

## 2. Admin — Dashboard (`/admin/dashboard`)

| ID | Case | Expected |
|----|------|----------|
| D1 | Loads counts cards | Values from `/users/counts` (or zeros on error) |
| D2 | Driver status breakdown | From `/users/driver-status-counts` |
| D3 | Charts | Line chart from `/users/graph/last-14-days`; bar/pie from `/users/ride-status-count` |
| D4 | **Recent activity** | Fetches `/audit-logs/getAll?page={n}&size=8` with Bearer token |
| D5 | Recent activity row layout | Line 1: `description`; Line 2: `userType • mobileNumber`; Right: `createdAt` formatted |
| D6 | Recent activity pagination | `PaginationControls`: First/Last/Prev/Next + 5-page window; page changes refetch |
| D7 | Empty audit response | Friendly empty state message |

**Edge cases**

- `totalPages` = 1 → pagination hidden (component returns null when `totalPages <= 1`).
- Very long `description`: text should wrap without breaking layout.
- Missing `mobileNumber` in log: show `—` in subtitle part.

---

## 3. Admin — Drivers list (`/admin/drivers`)

| ID | Case | Expected |
|----|------|----------|
| DR1 | Search + status + city filters | Query params applied; table updates |
| DR2 | Pagination | Page index + `PaginationControls` |
| DR3 | Navigate to driver detail | `/admin/drivers/[id]` |

---

## 4. Admin — Driver detail (`/admin/drivers/[id]`)

| ID | Case | Expected |
|----|------|----------|
| DV1 | Load driver | `GET /users/drivers/:id` |
| DV2 | Vehicle section shows **names** | `modelNumberName`, `colorName` when API sends them; fallback to IDs |
| DV3 | Approval controls | **Approve** → status payload `ACTIVE`; **Restrict** (red) → `INACTIVE` |
| DV4 | **Suspend** removed | Button absent |
| DV5 | **Ride performance** | Section commented out — not visible |
| DV6 | Documents: preview modal + download links | Front/back behave (existing UI) |
| DV7 | Invalid `id` | Empty state “Driver not found” |

**Edge cases**

- API returns `vehicle` null → vehicle block still renders plate/model/color with `—` where missing.
- Document image URL 404 → fallback image path used.

---

## 5. Admin — Documents queue (`/admin/documents`)

| ID | Case | Expected |
|----|------|----------|
| DQ1 | Driver list + per-driver doc summary | Extra calls to `/users/documents/:id` for status badge |
| DQ2 | Preview modal | Images + optional approve/reject in modal |
| DQ3 | Table row **Action** dropdown | Approve / Reject opens confirm dialog (not raw POST) |
| DQ4 | Approve/Reject all (table scope) | PUT `/users/documents/status/:driverId` with all three statuses |
| DQ5 | Image modal + download | Front/back preview modal and blob download where implemented |

**Edge cases**

- Backend expects `REJECT` vs `REJECTED`: code retries with alternate value on reject path.
- Reject without reason: validation error toast (per current rules).

---

## 6. Admin — Partners list & detail

### List (`/admin/partners`)

| ID | Case | Expected |
|----|------|----------|
| PL1 | Filters, pagination | Same pattern as other admin lists |
| PL2 | Status update (if used) | API errors surfaced via toast |

### Detail (`/admin/partners/[id]`)

| ID | Case | Expected |
|----|------|----------|
| PD1 | **Vehicle**, **Status history**, **Recent rides** sections | Removed from UI (not rendered) |
| PD2 | Uploaded documents — ID front/back | Separate **Preview** + **Download** per side; image click opens modal |
| PD3 | Modal download | Downloads the side currently previewed (`front` vs `back`) |
| PD4 | Partner status toggle | Confirm dialog + PUT `/users/status/:id` |

**Edge cases**

- Same URL for front/back (duplicate URL): both controls still work independently.
- PDF vs image: partner modal still has PDF branch if filename/url suggests PDF.

---

## 7. Admin — Agents (`/admin/agents`)

| ID | Case | Expected |
|----|------|----------|
| AG1 | Table columns | Agent, Phone, Status, Actions |
| AG2 | **Onboarded** column | Commented out — column must **not** appear |
| AG3 | Create / View / Edit flows | Routes under `/admin/agents/...` |

---

## 8. Admin — Vehicle types (`/admin/vehicle-types`)

| ID | Case | Expected |
|----|------|----------|
| VT1 | Tabs: Types, Models, Colors, Brands | Each loads its `getAll` endpoint |
| VT2 | Brand form | No model number / color fields; brand maps to vehicle type + image + status |
| VT3 | Pagination on tab tables | Uses shared `PaginationControls` behavior |
| VT4 | Image upload fields | Uses `ImageUploadField` + token |

**Edge cases**

- Empty search → empty state cards/table rows.
- Large `totalPages` → sliding window + First/Last still work.

---

## 9. Admin — Blog (`/admin/blog`, create, edit)

| ID | Case | Expected |
|----|------|----------|
| B1 | List `GET` | Uses `apiUrl("/blog/getAll")` — verify env base matches backend (`/api` rules in `api-base.ts`) |
| B2 | **Views** column | Shows numeric views when present; `null` → em dash |
| B3 | Create/Edit | Rich editor + categories; submit uses blog service |
| B4 | Delete | Confirm + refresh list |

**Edge cases**

- API returns `views` as string `"6"` → still displays as number if parser accepts it.
- Mixed `views` / `viewCount` keys: extractor checks aliases.

---

## 10. Admin — Carousel (`/admin/carousel`)

| ID | Case | Expected |
|----|------|----------|
| C1 | List/create/edit | Uses carousel service + forms |
| C2 | Image upload | Token-based upload |

---

## 11. Admin — Rides (`/admin/rides`, detail)

| ID | Case | Expected |
|----|------|----------|
| R1 | List loads | Pagination/search per implementation |
| R2 | Detail page | Map/components render; API failures handled |

---

## 12. Admin — Other static/admin pages

Smoke-test: **Commissions**, **Notifications**, **Settings**, **Audit logs** (`/admin/audit-logs` — may still use mock data; dashboard audit uses live API).

---

## 13. Agent area (`/agent/*`)

| ID | Case | Expected |
|----|------|----------|
| G1 | Agent login → agent dashboard | Correct default route |
| G2 | Agent cannot access `/admin/*` | Redirect per RBAC |
| G3 | Profile / listings / commissions | Loads without auth errors |

---

## 14. Public blog (`/blog/[slug]`)

| ID | Case | Expected |
|----|------|----------|
| PB1 | Published post renders | HTML/content safe display |
| PB2 | Unknown slug | 404 or empty handling per page |

---

## 15. API proxy — Admin login (`/api/auth/admin/login`)

| ID | Case | Expected |
|----|------|----------|
| L1 | Route proxies to `${NEXT_PUBLIC_API_URL}/auth/admin/login` | Same JSON shape as backend |
| L2 | Missing `NEXT_PUBLIC_API_URL` on server | 500 JSON error from route |

---

## 16. Cross-cutting UI

| ID | Case | Expected |
|----|------|----------|
| U1 | Theme toggle (header) | Dark/light switch persists (`next-themes`) |
| U2 | Sidebar navigation | Active route highlight |
| U3 | Toasts | Success/error after mutations |
| U4 | Mobile sidebar (if applicable) | Opens/closes without layout break |

---

## 17. Regression checklist (release)

- [ ] Login + logout + refresh session  
- [ ] Admin vs Agent route guards  
- [ ] Dashboard: metrics + **audit log pagination + row mapping**  
- [ ] Drivers: list → detail → vehicle **names** → approval buttons (no suspend)  
- [ ] Documents: preview + approve/reject flows  
- [ ] Partners: detail without removed sections; ID doc **front/back** preview/download  
- [ ] Agents: **no** Onboarded column  
- [ ] Vehicle types: brand form fields  
- [ ] Blog: views column + list fetch URL  
- [ ] Pagination component: 5-window + First/Last on high page counts  

---

## Notes

- **Linked behavior**: Changing `NEXT_PUBLIC_API_URL` affects every direct API call; blog admin additionally applies `apiUrl()` rules — keep staging URLs consistent with Postman.
- **Token**: Almost all admin API calls use Redux `token` or `fetcher` fallback from `localStorage`.
- When backend contracts change (new fields, renamed keys), update this matrix and the relevant page’s TypeScript interfaces.
