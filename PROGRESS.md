# PlayWise — Development Progress

**Current Development Phase:** Phase 6 (Completed — Production Ready)  
**Status:** All 6 Phases implemented, audited, tested, and verified. Complete end-to-end QA validation passed (26/26 automated tests), production build verified (143 modules, 0 errors), security and cookie policies hardened, and all responsive UI viewports verified.

---

## 1. Completed Tasks (Phase 4: CheapShark Live Deals and Global Price Comparison)

### Backend:
- [x] Created `backend/src/utils/gameMatcher.js`:
  - Intelligent title normalization algorithm that cleans punctuation, standardizes symbols, and strips edition tags (`GOTY`, `Deluxe`, `Remastered`, `Enhanced`).
  - Jaccard word-token similarity scoring with strict confidence thresholds (>= 0.70).
  - Explicit exclusion rules rejecting non-game candidates (DLCs, soundtracks, expansion passes, tools, editors, mods, REDkits, costume packs, guides).
  - Roman and Arabic numeral consistency verification: titles with numerals (e.g. `2077`, `3`, `5`, `V`, `IV`) must match the query's numerals, completely eliminating false positives (e.g. "CrashMetal - Cyberpunk" and "Cyberpunk SFX" rejected for "Cyberpunk 2077"; "Gears 5" rejected for "GTA V"; "The Witcher 2" rejected for "The Witcher 3").
  - Returns `matched: false` with empty offers when matching is uncertain to prevent displaying unrelated deals.
- [x] Implemented RAWG-Prioritized Deals Search (`searchDealsViaRAWG` in `cheapsharkService.js`):
  - Resolves Deals page search to query the canonical RAWG PC game catalog first, obtaining authentic game titles and IDs.
  - Matches each authentic game concurrently via `Promise.all` against CheapShark using `gameMatcher.js`.
  - Added resilient network retry layer (`fetchWithRetry`) with exponential backoff for transient socket resets and rate limits.
  - Preserves popular deals page when search is empty.
  - Filters verified offers by storeID and price range while maintaining sorting order.
- [x] Created `backend/src/services/cheapsharkService.js`:
  - Reusable Axios client consuming `https://www.cheapshark.com/api/1.0`.
  - Configured with mandatory descriptive `User-Agent: PlayWise-Gaming-Platform/1.0 (playwise.app)`.
  - In-memory TTL caching (5-10 minutes for deals, 24 hours for stores, 12 hours for currency rates).
  - Zero API keys required; no secrets exposed.
  - Implemented methods: `getStores()`, `getDeals()`, `searchDeals()`, `getGameOffers()`, and `getExchangeRates()`.
  - Fixes single vs. double URL encoding on CheapShark redirect deal IDs.
- [x] Implemented Deals Controller (`backend/src/controllers/deal.controller.js`):
  - `getDeals`: Supports `storeID`, `pageNumber`, `pageSize`, `sortBy`, `desc`, `lowerPrice`, `upperPrice`, `title` (routes title search through `searchDealsViaRAWG`).
  - `searchDeals`: Dedicated RAWG-prioritized deal search query endpoint (`?q=`).
  - `getGameOffers`: Retrieves retailer offers by CheapShark ID or matches RAWG title, highlights cheapest offer, and extracts all-time historical lowest price.
  - `getStores`: Delivers active stores list with logos.
  - `getCurrencies`: Delivers supported currencies and exchange rates against USD.
- [x] Implemented Deals Routes (`backend/src/routes/deal.routes.js`) and mounted at `/api/deals` in `app.js`.
- [x] Verified zero breaking changes to Auth, MongoDB Atlas, PC profiles, or RAWG API game discovery.

### Frontend:
- [x] Created `frontend/src/redux/slices/currencySlice.js`:
  - Manages active display currency (default: USD) with `localStorage` persistence.
  - Supports USD ($), EUR (€), GBP (£), INR (₹), CAD (C$), AUD (A$), and JPY (¥).
  - Implements `fetchCurrencyRates` async thunk fetching live rates on startup.
  - Implements `formatPriceEstimate` helper for formatted price estimates and USD original values.
- [x] Registered `currencyReducer` in Redux store (`frontend/src/redux/store.js`).
- [x] Created `frontend/src/services/dealService.js` for API communication.
- [x] Updated `frontend/src/components/common/Icons.jsx` with `IconDollar`, `IconPercent`, `IconTrendingDown`, and `IconGlobe`.
- [x] Updated `Navbar.jsx`:
  - Added "Deals" navigation item with an eye-catching "HOT" badge.
  - Added interactive currency selector dropdown with "Est." indicator.
  - Supported currency selection in both desktop and mobile navigation.
- [x] Created `frontend/src/components/common/DealCardSkeleton.jsx` for animated shimmer loading states.
- [x] Created `frontend/src/components/common/DealCard.jsx`:
  - Thumbnail banner with savings badge (`-75%` or `100% FREE`).
  - Deal rating score with star icon.
  - Store logo and store name badge.
  - Regular price (strikethrough) and sale price with active currency converted estimate.
  - "Get Deal on [Store]" button redirecting directly to retailer (`target="_blank" rel="noopener noreferrer"`).
- [x] Created `frontend/src/pages/DealsPage.jsx`:
  - Verified store discount hero banner.
  - Search input with debounce.
  - Store filter dropdown dynamically loaded from CheapShark stores directory.
  - Sorting dropdown (Discount %, Price Low/High, Deal Rating, Title, Metacritic).
  - Quick price filter chips (All Deals, 100% Free, Under $5, Under $10, Under $20).
  - Pagination controls (Previous/Next page).
  - Currency conversion estimate notice banner.
- [x] Updated `GameDetailsPage.jsx`:
  - Connected store deals section to live CheapShark offers fetched by game ID and title.
  - Highlighted cheapest offer with glowing emerald badge (`Cheapest Offer`).
  - Added All-Time Historical Low callout banner with price and date.
  - Added direct retailer checkout redirect buttons.
  - Integrated currency conversion estimates with USD original values.
  - Graceful fallback to official store pages if no digital retailer coupons are active.
- [x] Updated `GameCard.jsx` and `WishlistPage.jsx` to reflect converted currency estimates.
- [x] Added `/deals` route in `App.jsx` and startup currency dispatch.
- [x] Updated `Footer.jsx` with Deals navigation link.
- [x] Built frontend production bundle (`npm run build`) with zero errors.

---

## 2. Completed Foundation Phases Summary

### Phase 1: Foundation & UI
- [x] React 19 + Vite frontend with Tailwind CSS v4 and DaisyUI 5.
- [x] Dark gaming storefront design with electric cyan and purple accents.
- [x] 7 complete frontend pages with responsive navigation.
- [x] Client-side compatibility benchmark engine with 12+ pre-calibrated titles.
- [x] Modular Express backend with health checks and error handlers.

### Phase 2: MongoDB Atlas + Real Authentication + PC Profiles
- [x] Express backend connected to MongoDB Atlas (`playwise` database).
- [x] Mongoose models for `User` (bcrypt hashing) and `PCProfile` (multi-rig configurations).
- [x] JWT authentication with secure HTTP-only cookies and Bearer token fallback.
- [x] PC profile RESTful APIs with user ownership verification.
- [x] Multi-rig profile manager on frontend My PC page synced with compatibility engine.
- [x] Root `.gitignore` and `.env.example` templates.

### Phase 3: Real Game Discovery using RAWG API
- [x] Reusable RAWG service on backend filtering for PC titles (`parent_platforms=1`).
- [x] In-memory caching and intelligent system requirements parsing.
- [x] Endpoints `/api/games`, `/api/games/search`, `/api/games/featured`, `/api/games/genres`, `/api/games/:id`.
- [x] Frontend live game discovery on Home, Explore, and Game Details with skeletons.

---

## 3. Files Created and Modified in Phase 4

### Backend:
- `backend/src/utils/gameMatcher.js` (Created — title normalization, Jaccard token similarity, exclusion rules)
- `backend/src/services/cheapsharkService.js` (Created — CheapShark API client, stores, deals, game offers, exchange rates)
- `backend/src/controllers/deal.controller.js` (Created — deals, search, game offers, stores, currencies)
- `backend/src/routes/deal.routes.js` (Created — mounted deals endpoints)
- `backend/src/app.js` (Modified — mounted `/api/deals` routes and updated root endpoint)

### Frontend:
- `frontend/src/redux/slices/currencySlice.js` (Created — currency state, exchange rate thunk, price estimation formatter)
- `frontend/src/redux/store.js` (Modified — registered `currencyReducer`)
- `frontend/src/services/dealService.js` (Created — deals API client)
- `frontend/src/components/common/Icons.jsx` (Modified — added `IconDollar`, `IconPercent`, `IconTrendingDown`, `IconGlobe`)
- `frontend/src/components/common/DealCardSkeleton.jsx` (Created — shimmer skeleton card)
- `frontend/src/components/common/DealCard.jsx` (Created — deal card with store badge, discount, converted estimate, redirect)
- `frontend/src/components/layout/Navbar.jsx` (Modified — added Deals tab and currency dropdown)
- `frontend/src/components/layout/Footer.jsx` (Modified — added Deals link)
- `frontend/src/components/common/GameCard.jsx` (Modified — integrated currency estimation)
- `frontend/src/pages/DealsPage.jsx` (Created — dedicated deals page with filters, sorting, quick price tiers, pagination)
- `frontend/src/pages/GameDetailsPage.jsx` (Modified — live CheapShark store offers, cheapest offer badge, historical lows)
- `frontend/src/pages/WishlistPage.jsx` (Modified — integrated currency estimation into list and summary)
- `frontend/src/App.jsx` (Modified — registered `/deals` route and dispatched `fetchCurrencyRates`)

### Root Documentation:
- `PROJECT_CONTEXT.md` (Updated)
- `PROGRESS.md` (Updated)
- `HANDOFF.md` (Updated)

---

## 4. Verification Results

All 11 automated integration tests passed with zero errors:
1. **MongoDB Atlas:** Connected to `playwise` cluster (`ac-hgjvto5-shard-00-01.b9rx6f9.mongodb.net`).
2. **Health Check:** `GET /api/health` returned healthy state with active DB connection.
3. **Root Status:** `GET /` confirmed Phase 4 online with deals endpoints documented.
4. **RAWG API:** `GET /api/games/featured` returned 6 featured titles (Phase 3 intact).
5. **CheapShark Stores:** `GET /api/deals/stores` returned 13 active stores with Steam, Epic Games, GOG, Humble, etc.
6. **CheapShark Deals List:** `GET /api/deals?pageSize=6&sortBy=Savings` returned live deals (100% off Knightica).
7. **Deals Search:** `GET /api/deals/search?q=witcher` returned 24 matching deals.
8. **Game Offers:** `GET /api/deals/game/cyberpunk-2077?title=Cyberpunk%202077` matched successfully, returned 3 retailer offers, identified cheapest offer ($59.99 on Humble Store), and extracted historical low ($17.99 on Jun 17, 2026).
9. **Redirect URL Validation:** Confirmed clean redirect URL format (`https://www.cheapshark.com/redirect?dealID=...`) with no double encoding.
10. **Strict Matching Test:** Unknown game query returned `matched: false` and 0 offers with zero fabricated data.
11. **Global Currencies:** `GET /api/deals/currencies` returned USD base with live exchange rates for EUR, GBP, INR, CAD, AUD, JPY and estimate disclaimer.
12. **Frontend Production Build:** Vite build transformed 141 modules with **0 errors** in 2.49s.

---

## 5. Known Limitations & Notes

1. **Digital Store Coverage:** CheapShark indexes official digital PC storefronts (Steam, Epic Games Store, GOG, Humble Store, Fanatical, GreenManGaming, etc.), but does not index console stores (PlayStation Store, Nintendo eShop, Xbox Store) or physical disc retailers.
2. **Regional Pricing:** CheapShark returns prices in USD from North American / Global digital stores. While PlayWise converts these prices into EUR, GBP, INR, CAD, AUD, and JPY in real-time, regional storefront pricing policies (e.g. Steam India or GOG Regional Pricing) may have localized prices at checkout. This is clearly labeled with "Est." and disclaimer notices throughout the UI.
3. **Indie & Unreleased Games:** Certain niche indie games or upcoming unreleased games in RAWG may not have an active listing in CheapShark. PlayWise gracefully handles this by displaying official store fallback links or an informative empty state.

---

## 6. CheapShark Deals Search Refinement & Stale State Fix (2026-11-14)

### Resolved Issues:
1. **Unrelated Deal Overwrite ("knight" -> "GTR - FIA GT Racing Game")**:
   - **Root Cause**: An async race condition in `DealsPage.jsx` where the initial unconstrained popular deals request (or slow in-flight queries) completed after a search request, overwriting filtered search results with popular deals (which included GTR). Additionally, search error handlers were not resetting previous deal state.
   - **Fix**: Added request cancellation flags (`isCancelled`) and cleared deals state immediately upon initiating any search query. If a search returns 0 deals or encounters an error, it cleanly shows the dedicated empty state rather than stale popular deals.
2. **Gaming Acronym Expansion**:
   - Added canonical gaming acronym expansion (`COMMON_ACRONYMS` and `expandQueryAcronyms` in `gameMatcher.js`) supporting queries like `RDR2` / `rdr 2` -> `Red Dead Redemption 2`, `GTA 5` / `gta5` / `gta v` -> `Grand Theft Auto V`, `COD`, `GOW`, `AC`, etc.
   - Handled attached letter-digit patterns (e.g. `gta5` -> `gta 5`, `rdr2` -> `rdr 2`).
3. **CheapShark Burst Rate Limit Prevention**:
   - Replaced unthrottled `Promise.all` fan-out over 10 games with sequential lookups across the top 4 relevant candidates, preventing CheapShark HTTP 429 burst blocks.

### Live Verification Results:
| Test Query / Endpoint | Result | Notes |
|---|:---:|---|
| Health Check (`GET /api/health`) | ✅ PASS | MongoDB Atlas connected (`playwise` db) |
| Empty Search (`GET /api/deals`) | ✅ PASS | 4 curated deals loaded from `cheapshark_curated` |
| `Cyberpunk 2077` | ✅ PASS | 2 deals (Cyberpunk 2077, Phantom Liberty); CrashMetal/SFX strictly excluded |
| `GTA V` | ✅ PASS | Grand Theft Auto V ($13.95 on GameBillet -53%); Gears 5/GTA IV strictly excluded |
| `The Witcher 3` | ✅ PASS | 4 verified Witcher 3 deals; Witcher 2/Skyrim strictly excluded |
| `RDR2` | ✅ PASS | 1 deal (Red Dead Redemption 2); acronym cleanly resolved |
| `knight` | ✅ PASS | 2 deals (Knights of Honor, KNIGHTS); "GTR" and unrelated titles strictly excluded |
| Frontend Production Build | ✅ PASS | 141 modules transformed, **0 errors** in 2.53s |

A comprehensive handoff report has been created at [PLAYWISE_HANDOFF_REPORT.md](./PLAYWISE_HANDOFF_REPORT.md) for safe continuation in a new agent session.

---

## 7. Phase 5: Advanced PC Compatibility & Hardware Benchmarking (Completed)

### Checkpoints:
- [x] **P5.0: Workspace Audit and Implementation Plan**: Audited all compatibility files, planned modular 6-checkpoint architecture.
- [x] **P5.1: Hardware Benchmark Data Architecture and Database**:
  - Created `BenchmarkCPU.js` and `BenchmarkGPU.js` Mongoose models.
  - Created curated benchmark catalog (`benchmarkData.js`) covering 45 CPUs and 48 GPUs.
  - Implemented `benchmarkSeedService.js` and wired auto-seeding into `server.js`.
  - Seeded into MongoDB Atlas `playwise` database (verified 45 CPUs and 48 GPUs).
- [x] **P5.2: CPU/GPU Hardware Classification & Benchmark Services**:
  - Implemented `benchmarkService.js` with 5 performance tiers (`Enthusiast`, `High End`, `Mid Range`, `Budget`, `Entry Level`).
  - Added intelligent fuzzy hardware matcher (`matchHardware`) mapping user strings to verified benchmarks.
  - Implemented `/api/benchmarks` endpoints for search, matching, tiers, and catalog.
- [x] **P5.3: Advanced Compatibility Engine & Requirements Comparison**:
  - Implemented `compatibilityService.js` calculating normalized 0–100 scores across GPU (45%), CPU (35%), RAM (15%), and Storage (5%).
  - Detects limiting components holding back gameplay and generates specific upgrade recommendations.
  - REST endpoints at `/api/compatibility/evaluate` and `/api/compatibility/game/:gameId`.
- [x] **P5.4: Bottleneck Estimation & Resolution-based FPS Projections**:
  - Implemented `bottleneckService.js` calculating approximate CPU vs. GPU bottleneck percentages and balance ratings.
  - Resolution dynamics model for 1080p, 1440p, and 4K.
  - Generates realistic FPS estimates across 720p, 1080p, 1440p, 4K for Low, Medium, High, Ultra presets with synthetic benchmark disclaimers.
  - REST endpoints at `POST /api/compatibility/bottleneck` and `POST /api/compatibility/fps`.
- [x] **P5.5: Frontend Integration with My PC and Game Details**:
  - Created `frontend/src/services/benchmarkService.js` and `frontend/src/services/compatibilityService.js`.
  - Upgraded `SpecComparisonBar.jsx` with 0-100 score gauge, limiting component alert, hardware balance card, resolution-based FPS projection matrix with preset tabs, and upgrade suggestions.
  - Upgraded `MyPcPage.jsx` with active rig CPU/GPU benchmark tier badges, live Hardware Balance analyzer with resolution toggle, and live game benchmark tester integration.
  - Upgraded `GameDetailsPage.jsx` with live Phase 5 benchmark compatibility evaluation hook.
- [x] **P5.6: Testing, Production Build & Final Verification**:
  - Automated test suite: 29/29 assertions passed with 0 failures.
  - Frontend production build: transformed 143 modules with 0 errors in 2.31s.
  - Verified Phases 1–4 are completely preserved.

Detailed checkpoint logs and resume instructions are tracked in [PHASE5_HANDOFF.md](./PHASE5_HANDOFF.md).

---

## 8. Phase 6: Final QA & Production Readiness (Completed)

### Deliverables & Verified Tasks:
- [x] **Full-Stack Architectural & API Audit**:
  - Audited all backend routes (`/api/auth`, `/api/pc-profiles`, `/api/games`, `/api/deals`, `/api/benchmarks`, `/api/compatibility`, `/api/health`).
  - Audited all frontend pages, components, services, and Redux slices.
- [x] **Security, Auth & Data Ownership Hardening**:
  - Fixed cookie name check in `optionalAuth` middleware (`token` vs `jwt`), ensuring authenticated users' default PC profiles are properly resolved.
  - Aligned cookie clearing options (`sameSite`, `secure`) in `auth.controller.js` `logout` with `generateToken.js`.
  - Verified IDOR authorization checks on all PC profile mutations (`getProfileById`, `updateProfile`, `deleteProfile`, `setDefaultProfile`).
  - Verified password hashing via bcrypt (salt 10) and JWT expiration (7d).
- [x] **Input Validation & Dual-Parameter Resilience**:
  - Enhanced `benchmark.controller.js` to accept both `name` and `hardware` parameters.
  - Enhanced RAWG requirements parser (`rawgNormalizer.js`) to parse both GB and MB memory specifications.
- [x] **Image Resilience & Error Handling**:
  - Added robust `onError` image fallback handlers in `GameCard.jsx`, `DealCard.jsx`, and `GameDetailsPage.jsx` to prevent broken thumbnail icons from external CDNs.
- [x] **Frontend Polish & Cross-Platform UI**:
  - Added compatibility scores and badges to game cards on Explore and Wishlist pages.
  - Added active rig benchmark tier pill on Home hero showcase banner.
  - Modernized footer tag to `v1.0 Production Ready`.
  - Zero `console.log` debug statements in production frontend code.
- [x] **Environment & Configuration Verification**:
  - Updated `backend/.env.example` with `RAWG_API_KEY` template.
  - Verified `frontend/.env.example` with `VITE_API_URL`.
- [x] **Automated QA Test Suite & Production Build**:
  - Added permanent test script `backend/tests/playwise-qa.test.js` (`npm test` in backend).
  - All 26/26 tests passed with 0 failures across all phases.
  - Vite production build transformed 143 modules with 0 errors in 2.22s.
