# PlayWise — Comprehensive Development Handoff Report

**Generated:** 2026-11-14  
**Purpose:** Safe continuation of development in a new Antigravity account / model session  
**Current Phase:** Phase 4 (Completed & Verified)  
**Project Tagline:** *Play smarter. Choose better.*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Environment Variables](#4-environment-variables)
5. [Start Commands](#5-start-commands)
6. [Phase-by-Phase Implementation Status](#6-phase-by-phase-implementation-status)
7. [Working Functionality — Must Not Break](#7-working-functionality--must-not-break)
8. [Phase 4 CheapShark Search Issue: Root Cause & Fix](#8-phase-4-cheapshark-search-issue-root-cause--fix)
9. [All Files Modified or Created in Phase 4](#9-all-files-modified-or-created-in-phase-4)
10. [Verification Test Results](#10-verification-test-results)
11. [Known Limitations](#11-known-limitations)
12. [Important Decisions & Restrictions](#12-important-decisions--restrictions)
13. [Next Phase — Phase 5](#13-next-phase--phase-5)
14. [Continuation Prompt for New Agent](#14-continuation-prompt-for-new-agent)

---

## 1. Project Overview

**PlayWise** is a full-stack MERN gaming discovery and PC hardware compatibility platform. Users can:

1. **Discover & Search PC Games** — Live catalog from RAWG Video Games Database API.
2. **Enter PC Specifications** — Save multiple rig profiles in MongoDB Atlas (or use Guest mode locally).
3. **Check PC Compatibility** — Instant verdicts: Optimal, Playable, or Upgrade Required.
4. **Compare Game Prices** — Live deals from CheapShark across Steam, Epic, GOG, Humble, Fanatical, etc.
5. **Find Best Deals & Redirect** — Deeplinks to actual retailer checkout pages.
6. **Global Currency Conversion** — USD, EUR, GBP, INR, CAD, AUD, JPY with real-time rates.

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | Latest | Build tool |
| JavaScript (JSX) | ES2022+ | Language (**no TypeScript**) |
| Tailwind CSS | v4 (`@tailwindcss/vite`) | Styling |
| DaisyUI | v5 (`@plugin "daisyui";` in CSS) | UI component library |
| React Router DOM | v7 | Client-side routing |
| Redux Toolkit | Latest | Global state management |
| Axios | Latest | HTTP client (`withCredentials: true`) |
| Custom Icons | `Icons.jsx` | Lightweight SVG icon system |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | v22.17.0 (ES Modules) | Runtime |
| Express.js | 4.x | Web framework |
| Mongoose | 8.x | MongoDB ODM |
| MongoDB Atlas | Cloud | Database (`playwise` DB) |
| jsonwebtoken | Latest | JWT authentication |
| bcryptjs | Latest | Password hashing |
| cookie-parser | Latest | HTTP-only cookie parsing |
| cors | Latest | CORS handling |
| dotenv | Latest | Environment config |

### External APIs
| API | URL | Key Required |
|---|---|---|
| RAWG Video Games Database | `https://api.rawg.io/api` | Yes (`RAWG_API_KEY` in backend `.env`) |
| CheapShark Deals API | `https://www.cheapshark.com/api/1.0` | No |
| Exchange Rate API | `https://open.er-api.com/v6/latest/USD` | No |

> [!IMPORTANT]
> The backend uses **ES Module syntax** (`import`/`export`, `"type": "module"` in `package.json`). Do NOT switch to `require()` CommonJS syntax.

---

## 3. Complete Folder Structure

```
d:\PlayWise\
├── HANDOFF.md                          # Quick developer handoff guide
├── PROGRESS.md                         # Detailed progress per phase
├── PROJECT_CONTEXT.md                  # Architecture, API docs, DB schemas
├── PLAYWISE_HANDOFF_REPORT.md          # This comprehensive report
├── .gitignore                          # Root gitignore
│
├── backend/
│   ├── .env                            # SECRET — do not overwrite, do not expose
│   ├── .env.example                    # Safe template with variable names only
│   ├── package.json                    # "type": "module", scripts: dev, start
│   ├── package-lock.json
│   └── src/
│       ├── server.js                   # Entry point (binds port, starts Express)
│       ├── app.js                      # Express app setup, all routes mounted
│       ├── config/
│       │   ├── db.js                   # Mongoose connection to MongoDB Atlas
│       │   └── index.js                # Exports config (PORT, JWT_SECRET, RAWG_API_KEY, etc.)
│       ├── controllers/
│       │   ├── auth.controller.js      # signup, login, logout, me
│       │   ├── game.controller.js      # getGames, getGameDetails, getFeatured, getGenres, searchGames
│       │   ├── health.controller.js    # GET /api/health
│       │   ├── pcProfile.controller.js # CRUD for PC profiles
│       │   └── deal.controller.js      # getDeals, searchDeals, getGameOffers, getStores, getCurrencies
│       ├── middleware/
│       │   ├── auth.js                 # JWT protect middleware (cookie + Bearer token)
│       │   └── errorHandler.js         # Centralized error handler + 404 handler
│       ├── models/
│       │   ├── User.js                 # Mongoose User schema (bcrypt, avatar, timestamps)
│       │   └── PCProfile.js            # Mongoose PCProfile schema (multi-rig, userId ref)
│       ├── routes/
│       │   ├── auth.routes.js          # /api/auth
│       │   ├── game.routes.js          # /api/games
│       │   ├── health.routes.js        # /api/health
│       │   ├── pcProfile.routes.js     # /api/pc-profiles
│       │   └── deal.routes.js          # /api/deals
│       ├── services/
│       │   ├── rawgService.js          # RAWG API client with caching (timeout: 20000ms)
│       │   └── cheapsharkService.js    # CheapShark API client, exchange rates, RAWG-first search
│       └── utils/
│           ├── gameMatcher.js          # Title normalization, numeral checking, Jaccard similarity
│           ├── rawgNormalizer.js       # Normalizes RAWG API responses for frontend
│           └── generateToken.js        # JWT generation helper
│
└── frontend/
    ├── .env                            # VITE_API_URL=http://localhost:5000/api
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js                  # @tailwindcss/vite plugin, @vitejs/plugin-react
    ├── index.html
    └── src/
        ├── App.jsx                     # Routes: /, /explore, /game/:id, /my-pc,
        │                               #         /wishlist, /login, /signup, /profile, /deals
        ├── main.jsx                    # Redux Provider + BrowserRouter wrapping App
        ├── index.css                   # Tailwind v4 + DaisyUI (@plugin "daisyui";)
        ├── components/
        │   ├── common/
        │   │   ├── Icons.jsx           # All custom SVG icons (do not add Lucide/Hero icons)
        │   │   ├── GameCard.jsx        # Game card with currency conversion
        │   │   ├── GameCardSkeleton.jsx
        │   │   ├── DealCard.jsx        # Deal card with store badge, savings, redirect button
        │   │   ├── DealCardSkeleton.jsx
        │   │   └── SpecComparisonBar.jsx # Hardware comparison bar
        │   └── layout/
        │       ├── Layout.jsx          # Wraps pages with Navbar + Footer
        │       ├── Navbar.jsx          # Nav links + currency switcher dropdown
        │       └── Footer.jsx          # Footer with nav links
        ├── pages/
        │   ├── HomePage.jsx            # Hero, trending, popular, recent sections
        │   ├── ExplorePage.jsx         # Search, genre filters, sort, pagination
        │   ├── GameDetailsPage.jsx     # Full game info + live CheapShark offers
        │   ├── MyPcPage.jsx            # PC profile manager + compatibility engine
        │   ├── WishlistPage.jsx        # Wishlist with currency conversion
        │   ├── LoginPage.jsx           # Login form
        │   ├── SignupPage.jsx          # Signup form
        │   ├── ProfilePage.jsx         # Protected user profile
        │   └── DealsPage.jsx           # Live deals: search, store filters, sort, pagination
        ├── redux/
        │   ├── store.js                # Registers: auth, pc, wishlist, game, currency
        │   └── slices/
        │       ├── authSlice.js        # User authentication state
        │       ├── pcSlice.js          # PC profile state
        │       ├── wishlistSlice.js    # Wishlist with localStorage persistence
        │       ├── gameSlice.js        # Game catalog, featured, details
        │       └── currencySlice.js    # Active currency + exchange rates
        ├── services/
        │   ├── api.js                  # Axios base instance (baseURL from VITE_API_URL)
        │   ├── authService.js          # Auth API calls
        │   ├── gameService.js          # Game catalog API calls
        │   ├── pcProfileService.js     # PC profile API calls
        │   └── dealService.js          # Deals API calls
        ├── utils/
        │   └── compatibilityChecker.js # Client-side PC spec compatibility engine
        └── data/
            └── mockGames.js            # Legacy mock data (kept for reference, not used)
```

---

## 4. Environment Variables

### Backend (`backend/.env`) — Never overwrite this file
| Variable | Purpose |
|---|---|
| `PORT` | Express HTTP port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend CORS origin (default: `http://localhost:5173`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifespan (e.g. `7d`) |
| `RAWG_API_KEY` | RAWG API secret key — **backend only, never expose to frontend** |

> [!CAUTION]
> Never overwrite `backend/.env`. Never log or expose secret values. The `RAWG_API_KEY` must stay server-side only. CheapShark requires no API key.

### Frontend (`frontend/.env`)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |

---

## 5. Start Commands

### Backend (port 5000)
```bash
cd d:\PlayWise\backend
npm run dev        # Development with nodemon auto-reload
npm start          # Production start
```

**Key endpoints to verify:**
- `http://localhost:5000/` — Root status (shows active phases)
- `http://localhost:5000/api/health` — MongoDB connection state
- `http://localhost:5000/api/games/featured` — RAWG featured games
- `http://localhost:5000/api/deals?pageSize=6&sortBy=Savings` — Popular deals
- `http://localhost:5000/api/deals/search?q=cyberpunk` — RAWG-prioritized deal search
- `http://localhost:5000/api/deals/game/cyberpunk-2077?title=Cyberpunk%202077` — Game offers
- `http://localhost:5000/api/deals/stores` — Supported stores
- `http://localhost:5000/api/deals/currencies` — Exchange rates

### Frontend (port 5173)
```bash
cd d:\PlayWise\frontend
npm run dev        # Vite dev server
npm run build      # Production build (should produce 141 modules, 0 errors)
npm run preview    # Preview production build
```

---

## 6. Phase-by-Phase Implementation Status

### ✅ Phase 1 — Foundation & UI (Completed)
- React 19 + Vite frontend with Tailwind CSS v4 and DaisyUI v5
- Dark gaming storefront UI inspired by Steam and Epic Games Store
  - Background: `#080b11` / `#0e1320`; Accents: electric cyan `#00f0ff` and purple `#8b5cf6`
  - Glassmorphic panels, neon glow effects
- 7 complete pages: Home, Explore, Game Details, My PC, Wishlist, Login, Signup
- Client-side PC hardware compatibility engine (`compatibilityChecker.js`)
- Modular Express backend skeleton with health check and error handling
- Redux Toolkit setup (pcSlice, wishlistSlice, authSlice, gameSlice)

### ✅ Phase 2 — MongoDB Atlas + Authentication + PC Profiles (Completed)
- Express connected to MongoDB Atlas (`playwise` database via Mongoose)
- `User` model: bcrypt-hashed passwords, email uniqueness, timestamps
- `PCProfile` model: multi-rig support, `isDefault` flag, user ownership via `userId` ref
- JWT auth (HTTP-only cookies + Bearer fallback): signup, login, logout, `/api/auth/me`
- PC Profile CRUD: list, create, get by ID, update, delete, set default (`/api/pc-profiles`)
- Frontend: real auth forms, session persistence, multi-rig switcher on My PC page
- Protected routes (`ProtectedRoute`) guarding `/profile`
- Guest mode preserved: unauthenticated users can still browse and test locally

### ✅ Phase 3 — Real Game Discovery with RAWG API (Completed)
- Reusable `rawgService.js` filtering for PC titles only (`parent_platforms=1`)
- In-memory caching: 10–15 min for catalog/games, 24h for genres
- `rawgNormalizer.js`: parses RAWG system requirements text into structured fields (CPU, GPU, RAM, Storage, OS)
- Endpoints: `/api/games`, `/api/games/search`, `/api/games/featured`, `/api/games/genres`, `/api/games/:id`
- Frontend: live integration on Home, Explore, and Game Details pages with skeletons
- RAWG client timeout: 20000ms (raised from 12000ms to handle concurrent CheapShark lookups)

### ✅ Phase 4 — CheapShark Live Deals & Price Comparison (Completed & Verified)
See Sections 8–10 for the detailed search fix and test verification.

**Backend:**
- `cheapsharkService.js`: full CheapShark integration with User-Agent, caching, retries
- `gameMatcher.js`: strict title matching with numeral consistency and exclusion rules
- `deal.controller.js`: 5 endpoints fully implemented
- `deal.routes.js`: mounted at `/api/deals` in `app.js`

**Frontend:**
- `currencySlice.js`: Redux currency state, `localStorage` persistence, `fetchCurrencyRates` thunk
- `dealService.js`: API client for all deal endpoints
- `DealCard.jsx` and `DealCardSkeleton.jsx`: deal display components
- `DealsPage.jsx`: live deals page with search, store filters, sort, quick price tiers, pagination
- `GameDetailsPage.jsx`: live CheapShark offers, cheapest badge, historical low
- `Navbar.jsx`: Deals tab + currency switcher (desktop & mobile)
- `App.jsx`: `/deals` route registered, `fetchCurrencyRates` dispatched on startup

---

## 7. Working Functionality — Must Not Break

> [!WARNING]
> Any new code changes must preserve all of the following. Test these after any modification.

| Feature | Test How |
|---|---|
| Guest browsing (no login required) | Open app without logging in; browse games, Explore, Game Details |
| User signup & login | Create new account, then login — JWT cookie should be set |
| MongoDB Atlas connection | `GET /api/health` must return `db: "connected"` |
| PC profile CRUD | Log in → My PC → create, edit, delete profiles; set default |
| Multi-rig compatibility | Select different PC profiles; compatibility verdict changes |
| RAWG game catalog | Home page shows featured/trending; Explore shows paginated games |
| RAWG search & genre filters | Explore page: search "cyberpunk", filter by "action" genre |
| Game Details page | Click any game; see cover, screenshots, requirements, compatibility |
| Popular deals (empty search) | Go to `/deals` with empty search bar; popular deals load |
| Deals search with RAWG | Search "Cyberpunk 2077" on Deals page; exact game appears, not unrelated titles |
| Store filter on Deals page | Select "Steam" filter; only Steam deals appear |
| Currency switcher | Switch from USD to INR in Navbar; all prices update with "Est." label |
| Wishlist | Add/remove games; wishlist persists on page reload |
| Deal redirect | "Get Deal on [Store]" button opens CheapShark redirect in new tab |
| Frontend production build | `npm run build` completes with 0 errors |

---

## 8. Phase 4 CheapShark Search Issue: Root Cause & Fix

### The Problem
When a user searched "Cyberpunk" on the Deals page, results included:
- ✅ Cyberpunk 2077 (correct)
- ❌ Cyberpunk SFX (audio pack)
- ❌ CrashMetal - Cyberpunk (unrelated game)
- ❌ Spinnortality (unrelated game — keyword match only)

**Root cause:** The original search queried CheapShark's `/deals?title=` endpoint directly. CheapShark performs substring keyword matching across its entire game catalog regardless of relevance or title accuracy. This produced false positives for any title containing the search keyword anywhere.

### The Fix: RAWG-Prioritized Search Flow

**New flow in `cheapsharkService.searchDealsViaRAWG()`:**

```
User query ("Cyberpunk 2077")
        ↓
1. Search RAWG game catalog: rawgService.getGames({ search: "Cyberpunk 2077" })
   → Returns authentic, relevance-ranked PC game titles
        ↓
2. Filter RAWG results:
   - isExcludedNonGame() → reject soundtracks, DLCs, tools, editors, mods
   - isTitleRelevantToQuery() → strict numeral/prefix/phrase match
        ↓
3. For each relevant RAWG game, concurrently call cheapsharkService.getGameOffers(game.id, { rawgTitle: game.title })
   → gameMatcher.findBestCheapSharkMatch() verifies each CheapShark candidate
        ↓
4. Only games with verified CheapShark matches are returned
   → matched: false games are silently excluded from results
```

### Key Functions Changed

#### `backend/src/utils/gameMatcher.js`

**`isTitleRelevantToQuery(gameTitle, query)`** — New function:
- Exact normalized match check
- GTA acronym handler: `gta v` → matches `grand theft auto v`
- **Numeral conflict check**: if query has numerals (2077, 3, 5, V), title MUST share at least one numeral from the same set
  - "CrashMetal - Cyberpunk" → rejected for "Cyberpunk 2077" (no shared numerals)
  - "Cyberpunk SFX" → rejected by `isExcludedNonGame()` (contains "sfx")
- Strict prefix match: `normTitle.startsWith(normQuery)` (e.g. "Cyberpunk 2077" starts with "cyberpunk" ✅)
- Multi-word phrase match: title must contain the full normalized query phrase

**`isExcludedNonGame(title)`** — New function:
- Checks title against `EXCLUDED_KEYWORDS` list: `soundtrack`, `ost`, `sfx`, `dlc`, `season pass`, `artbook`, `tool`, `editor`, `mod`, `redkit`, `demo`, `guide`, etc.

**`extractNumerals(str)`** — New function:
- Extracts digits (`2077`, `3`, `5`) and Roman numerals (`V`, `IV`) from a title
- Cross-maps: `5` ↔ `v`, `4` ↔ `iv`, `3` ↔ `iii`, etc.

**`hasConflictingNumerals(targetNorm, candNorm)`** — New function:
- If target has numerals, candidate must share at least one; else rejected

#### `backend/src/services/cheapsharkService.js`

**`searchDealsViaRAWG(query, options)`** — New function (replaces direct CheapShark title search):
- Fetches RAWG results first, filters, then concurrently fetches CheapShark offers
- Preserves all filters: storeID, price range, sort, pagination
- Returns `searchSource: 'rawg_prioritized'` for debugging

**`fetchWithRetry(fn, retries=2, delayMs=300)`** — New function:
- Exponential backoff retry for `ECONNRESET`, `ETIMEDOUT`, `ECONNABORTED`, HTTP 429
- Used for all CheapShark `/games` lookups

**`User-Agent` header** — Added to Axios client:
```
User-Agent: PlayWise-Gaming-Platform/1.0 (playwise.app)
```
CheapShark returned HTTP 400 without this header.

**`cleanDealID` logic** — Prevents double URL encoding:
```js
const cleanDealID = d.dealID?.includes('%') ? d.dealID : encodeURIComponent(d.dealID || '');
```

#### `backend/src/services/rawgService.js`

- Timeout raised from 12000ms to **20000ms**
- `ordering` parameter is **skipped when a search query is present**:
  ```js
  if (ordering && (!search.trim() || ordering !== '-added')) {
    params.ordering = ordering;
  }
  ```
  Sending `ordering=-added` alongside a search query caused RAWG to return unrelated results sorted by popularity rather than relevance.

#### `frontend/src/pages/DealsPage.jsx`

- Added `import { Link } from 'react-router-dom';` (was missing)
- Improved empty state messaging:
  - When searching: "No deals found for '[query]'. Try another title or clear the search."
  - When no search: "No deals match the selected filters."

---

## 9. All Files Modified or Created in Phase 4

### Backend — New Files
| File | Description |
|---|---|
| `backend/src/utils/gameMatcher.js` | Title normalization, Jaccard similarity, numeral checking, exclusion rules |
| `backend/src/services/cheapsharkService.js` | CheapShark API client + RAWG-prioritized search + exchange rates |
| `backend/src/controllers/deal.controller.js` | 5 deal endpoints: getDeals, searchDeals, getGameOffers, getStores, getCurrencies |
| `backend/src/routes/deal.routes.js` | Deals router mounted at `/api/deals` |

### Backend — Modified Files
| File | Change |
|---|---|
| `backend/src/app.js` | Mounted `/api/deals` router; updated root endpoint metadata |
| `backend/src/services/rawgService.js` | Timeout → 20000ms; skip `ordering` when searching |

### Frontend — New Files
| File | Description |
|---|---|
| `frontend/src/redux/slices/currencySlice.js` | Currency Redux state + `fetchCurrencyRates` thunk + `formatPriceEstimate()` |
| `frontend/src/services/dealService.js` | Axios calls to all `/api/deals` endpoints |
| `frontend/src/components/common/DealCard.jsx` | Deal card with cover, savings badge, store logo, redirect button |
| `frontend/src/components/common/DealCardSkeleton.jsx` | Shimmer skeleton for deal cards |
| `frontend/src/pages/DealsPage.jsx` | Full Deals page with search, filters, sort, pagination |

### Frontend — Modified Files
| File | Change |
|---|---|
| `frontend/src/redux/store.js` | Registered `currencyReducer` |
| `frontend/src/components/common/Icons.jsx` | Added `IconDollar`, `IconPercent`, `IconTrendingDown`, `IconGlobe` |
| `frontend/src/components/layout/Navbar.jsx` | Added Deals nav tab (with "HOT" badge) + currency selector dropdown |
| `frontend/src/components/layout/Footer.jsx` | Added Deals link |
| `frontend/src/components/common/GameCard.jsx` | Currency conversion estimates integrated |
| `frontend/src/pages/GameDetailsPage.jsx` | Live CheapShark offers, cheapest badge, historical low, redirects |
| `frontend/src/pages/WishlistPage.jsx` | Currency conversion estimates in list and total |
| `frontend/src/App.jsx` | Added `/deals` route; dispatches `fetchCurrencyRates` on startup |

### Documentation — Updated Files
| File | Change |
|---|---|
| `PROJECT_CONTEXT.md` | Phase 4 feature list, API endpoints table, known limitations |
| `PROGRESS.md` | Phase 4 checklist, verification results, known limitations |
| `HANDOFF.md` | Updated quick start, Phase 4 architecture summary |

### Deleted Temp Files
| File | Reason |
|---|---|
| `backend/test-deals-search-fix.js` | Temporary verification test — deleted after tests passed |
| `backend/test-phase4-full.js` | Temporary full integration test — deleted after tests passed |

---

## 10. Verification Test Results

All tests were run against the live backend with live external API connections. Results are verified — not assumed.

### Automated Integration Tests (Verified Passed)

| # | Test | Result |
|---|---|---|
| 1 | MongoDB Atlas connection to `playwise` cluster | ✅ Connected |
| 2 | `GET /api/health` | ✅ Healthy, DB connected |
| 3 | `GET /` root status | ✅ Phase 4 online |
| 4 | `GET /api/games/featured` | ✅ 6 featured titles returned (Phase 3 intact) |
| 5 | `GET /api/deals/stores` | ✅ 13 active stores returned |
| 6 | `GET /api/deals?pageSize=6&sortBy=Savings` | ✅ Popular deals returned (empty search path) |
| 7 | `GET /api/deals/search?q=witcher` | ✅ 24 matching deals returned |
| 8 | `GET /api/deals/game/cyberpunk-2077?title=Cyberpunk%202077` | ✅ 3 offers, cheapest identified, historical low extracted |
| 9 | Redirect URL format validation | ✅ No double-encoding (`%25` absent) |
| 10 | Unknown game strict match test | ✅ `matched: false`, 0 offers, no fabricated data |
| 11 | `GET /api/deals/currencies` | ✅ USD base + 6 currencies with live rates |
| 12 | Frontend production build | ✅ 141 modules, **0 errors**, 2.49s |

### Search Correctness Tests

| Search Query | Expected | Actual Result |
|---|---|---|
| `"Cyberpunk 2077"` | Cyberpunk 2077 found; Cyberpunk SFX, CrashMetal, Spinnortality excluded | ✅ Exact match, false positives excluded (2 deals) |
| `"The Witcher 3"` | The Witcher 3: Wild Hunt found; Skyrim, Metro, Witcher 2 excluded | ✅ Correct match (4 deals) |
| `"GTA V"` | Grand Theft Auto V found; Gears 5, GTA IV excluded | ✅ GTA acronym correctly resolved ($13.95 on GameBillet, -53%) |
| `"RDR2"` | Red Dead Redemption 2 found; unrelated titles excluded | ✅ Acronym expansion to Red Dead Redemption 2 verified (1 deal) |
| `"knight"` | Authentic knight games only; "GTR - FIA GT Racing Game" excluded | ✅ 2 deals (Knights of Honor, KNIGHTS); GTR strictly excluded |
| `"nonexistentgame12345xyz"` | 0 results, no fabricated data | ✅ 0 deals returned |
| Empty search field | Popular curated deals from CheapShark | ✅ Popular deals catalog loads |
| Steam store filter + "Cyberpunk" | Only Steam deals for Cyberpunk | ✅ Correct storeID filtering |

---

## 11. Known Limitations

1. **Digital-Only Coverage:** CheapShark indexes digital PC storefronts only. Console stores (PlayStation Store, Nintendo eShop, Xbox Store) and physical disc retailers are not covered.

2. **Regional Pricing:** CheapShark returns prices in USD from North American/Global stores. Currency conversion in PlayWise is an estimate from real-time exchange rates and does NOT reflect regional storefront policies (e.g. Steam India pricing). All non-USD values are explicitly labelled "Est." throughout the UI.

3. **Niche / Upcoming Games:** Niche indie games or unreleased titles in RAWG may have no CheapShark listing. PlayWise handles this gracefully with an empty state and official store fallback links.

4. **CheapShark Rate Limits:** `fetchWithRetry` handles transient 429 errors with exponential backoff (up to 2 retries, 300ms/600ms). If CheapShark rate-limits aggressively, some concurrent `Promise.all` offers lookups may fail silently.

5. **RAWG Search Timeout:** RAWG searches that trigger many concurrent CheapShark lookups could occasionally approach the 20s timeout. If this occurs in Phase 5, reduce `pageSize` from 10 to 5 in `searchDealsViaRAWG`.

---

## 12. Important Decisions & Restrictions

> [!IMPORTANT]
> These decisions are final for the existing codebase. Do not change them.

1. **JavaScript only** — No TypeScript. All files are `.js` or `.jsx`.
2. **Do NOT overwrite `backend/.env`** — Contains live secrets (MONGO_URI, JWT_SECRET, RAWG_API_KEY). Reference `backend/.env.example` for variable names.
3. **Do NOT add UI libraries** — No Lucide, Heroicons, Material UI, Chakra UI. The custom SVG system in `src/components/common/Icons.jsx` covers all icon needs. Add new SVG icons to that file.
4. **No fabricated data** — Never invent prices, historical lows, FPS estimates, or compatibility verdicts. If data is unavailable, show an empty state.
5. **Currency labels** — All non-USD prices MUST be labeled "Est." (e.g., "Est. ₹1,499"). Never display converted prices without this disclaimer.
6. **CheapShark redirect links** — `https://www.cheapshark.com/redirect?dealID=...` are for human browser navigation via `target="_blank"`. Never attempt to fetch or bypass them programmatically.
7. **No anti-bot bypass** — Never attempt to solve CAPTCHAs, Cloudflare challenges, or proof-of-work gates.
8. **Guest Mode must stay** — Unauthenticated visitors must always be able to browse games, view Game Details, check compatibility locally (with manually entered specs), and view live deals.
9. **No breaking changes to Phases 1–3** — Auth, MongoDB Atlas, RAWG game discovery must remain fully functional.
10. **No Phase 5 without user approval** — Do NOT begin Phase 5 implementation without explicit confirmation.

---

## 13. Next Phase — Phase 5

**Status:** Awaiting user approval. Do not start.

**Planned scope:**
1. Server-side CPU & GPU benchmark score hierarchy database (PassMark / 3DMark / Cinebench scores)
2. Hardware tier classification (Entry, Budget, Mid-Range, High-End, Enthusiast)
3. Real-time CPU vs. GPU bottleneck percentage calculator
4. Resolution-based FPS estimation engine (1080p, 1440p, 4K at Low / Medium / High / Ultra presets)
5. Optional: Community FPS benchmark submission system

---

## 14. Continuation Prompt for New Agent

Copy and paste the following as your first message in a new Antigravity session:

---

```
Continue PlayWise development from Phase 4.

Read PLAYWISE_HANDOFF_REPORT.md, PROJECT_CONTEXT.md, PROGRESS.md and HANDOFF.md before making any changes. These files are at d:\PlayWise\.

IMPORTANT before starting:
1. Do NOT overwrite backend/.env.
2. Do NOT install new UI libraries. Use Icons.jsx for all icons.
3. Do NOT use TypeScript. JavaScript only.
4. Do NOT start Phase 5 without explicit user approval.
5. Preserve all working Phase 1, 2, 3 and 4 functionality.
6. Do NOT fabricate prices, FPS data or compatibility verdicts.
7. Always label non-USD prices as estimates ("Est.").

Current state:
- Phase 1 (UI), Phase 2 (Auth + MongoDB), Phase 3 (RAWG), Phase 4 (CheapShark) are all COMPLETE and VERIFIED.
- The latest Phase 4 fix resolved Deals page search showing unrelated titles (Cyberpunk SFX, CrashMetal, Spinnortality) for a "Cyberpunk" search.
- The fix introduces RAWG-first search: query RAWG → filter with isTitleRelevantToQuery() → match via gameMatcher.findBestCheapSharkMatch() → return only verified deals.
- All 12 integration tests passed, all 6 search correctness tests passed, frontend build: 141 modules, 0 errors.

Start commands:
  Backend:  cd d:\PlayWise\backend && npm run dev    (port 5000)
  Frontend: cd d:\PlayWise\frontend && npm run dev   (port 5173)

Await my instructions for what to work on next.
```

---

*End of PlayWise Comprehensive Handoff Report*  
*Report generated: 2026-11-14 | Phase 4 Completed & Verified*
