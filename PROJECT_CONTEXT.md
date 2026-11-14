# PlayWise — Project Context & Architecture

**Project Tagline:** *Play smarter. Choose better.*

---

## 1. Project Overview

**PlayWise** is a full-stack gaming discovery and PC hardware compatibility platform built with the MERN stack. It empowers gamers to:
1. **Discover & Search Games:** Access an extensive live catalog of PC titles via the RAWG Video Games Database API across diverse genres, release dates, and ratings.
2. **PC Hardware Benchmarking:** Enter PC specifications manually or select pre-calibrated presets, saved to MongoDB Atlas multi-rig profiles.
3. **Compatibility Verdicts:** Immediately evaluate whether a specific PC configuration can run demanding titles (Optimal 60+ FPS, Playable Medium, Hardware Upgrade Required).
4. **Cross-Store Price Comparison:** Compare verified live pricing and discounts across authorized storefronts (Steam, Epic Games Store, GOG, Humble Store, Fanatical, etc.) via CheapShark API.
5. **Best Deal Tracking & Store Redirects:** Discover steep discounts, track all-time historical lows, and redirect directly to official retailer checkout pages.
6. **Global Currency Conversion:** Switch display currency (USD, EUR, GBP, INR, CAD, AUD, JPY) with real-time estimated currency conversions.

---

## 2. Complete Feature List & Progress

### Phase 1 Features (Completed):
- **Responsive Dark Gaming UI:** Custom dark charcoal styling (`#080b11`, `#0e1320`), electric cyan (`#00f0ff`) and purple (`#8b5cf6`) accents, glassmorphic panels, and neon glow effects.
- **Hero Showcase:** Dynamic banner transitions, spotlight title selector, quick platform statistics.
- **Gaming Catalog & Discovery:** Grid view with live search, genre filters, and multi-criteria sorting.
- **Detailed Game Profiles:** Backdrop banners, cover art, release info, ESRB/ratings, full descriptions, and official Minimum vs. Recommended system requirements.
- **Client-Side Compatibility Engine:** Real-time hardware comparison calculating verdicts and hardware bottleneck indicators.
- **Interactive Live Game Tester:** Immediate simulation of user specs against any selected game in the catalog.
- **Wishlist System:** Add/remove games with Redux Toolkit and `localStorage` persistence, total value and savings calculation.

### Phase 2 Features (Completed):
- **MongoDB Atlas Integration:** Express backend connected to MongoDB Atlas (`playwise` database) using Mongoose with robust connection and error handling.
- **Mongoose Data Models:**
  - `User`: Handles gamer accounts with secure password hashing via bcryptjs.
  - `PCProfile`: Enables users to manage multiple PC hardware configurations (Desktop, Laptop, HTPC) with automatic default rig management and user isolation.
- **Real JWT Authentication:**
  - Registration (`POST /api/auth/signup`) with duplicate email detection (409 Conflict) and automatic initial rig profile creation.
  - Login (`POST /api/auth/login`) with credential verification and secure HTTP-only cookies + Bearer token generation.
  - Logout (`POST /api/auth/logout`) with cookie invalidation.
  - Session verification (`GET /api/auth/me`).
  - Protected route middleware (`protect`) supporting both HTTP-only cookies and Authorization headers.
- **PC Profile RESTful APIs:**
  - Create Profile (`POST /api/pc-profiles`)
  - List User Profiles (`GET /api/pc-profiles`)
  - Get Profile by ID (`GET /api/pc-profiles/:id`)
  - Update Profile (`PUT /api/pc-profiles/:id`)
  - Delete Profile (`DELETE /api/pc-profiles/:id`)
  - Set Default Active Rig (`PATCH /api/pc-profiles/:id/default`)
- **Frontend Real Auth & Cloud Rig Integration:**
  - Login and Signup connected to real backend APIs with inline error alerts and loading states.
  - Session persistence in Redux with verification on app startup.
  - My PC page upgraded to display cloud-synced MongoDB profiles, multi-rig switcher, default rig toggling, profile deletion, and new profile creation.
  - Active profile selection dynamically feeds the game compatibility engine across the entire application.
  - Protected routes (`ProtectedRoute`) safeguarding private gamer views like `/profile`.
  - Non-authenticated Guest Mode preserved so casual visitors can still test specs locally without forced login.

### Phase 3 Features (Completed):
- **Backend RAWG Video Games Database Integration:**
  - Reusable backend RAWG service (`backend/src/services/rawgService.js`) consuming official RAWG API (`https://api.rawg.io/api`).
  - Strict security: `RAWG_API_KEY` stored exclusively in backend `.env`; never exposed to React or the client browser.
  - Filtered exclusively for PC titles (`parent_platforms=1`).
  - In-memory caching layer with TTL (10-15 minutes for catalog/games, 24 hours for genres) to prevent rate-limit throttling and provide instantaneous responses.
- **Game Data Normalization Pipeline (`backend/src/utils/rawgNormalizer.js`):**
  - Parses RAWG PC system requirements text into structured hardware attributes (CPU, GPU, RAM, VRAM, Storage, OS).
  - Normalizes game screenshots, genre arrays, release dates, and Metacritic/RAWG ratings.
- **Live Game RESTful Endpoints (`/api/games`):**
  - `GET /api/games`: Paginated PC catalog supporting `page`, `page_size`, `genres`, `ordering`, and `search`.
  - `GET /api/games/search?q=`: Dedicated real-time game search.
  - `GET /api/games/featured`: Curated homepage bundles (featured hero titles, trending, popular, and recent releases).
  - `GET /api/games/genres`: Complete genre listing for category filtering.
  - `GET /api/games/:id`: In-depth game details, high-res screenshots, full description, and parsed hardware requirements.
- **Frontend Live Data Integration:**
  - Redux `gameSlice.js` with async thunks (`fetchCatalogGames`, `fetchFeaturedSections`, `fetchGameDetails`, `fetchGenres`).
  - Home Page: Live hero showcase, trending, popular, and recently released games with `GameCardSkeleton`.
  - Explore Page: Live keyword search, dynamic genre pill filters from RAWG, sorting dropdown, and pagination.
  - Game Details Page: Live background imagery, screenshot gallery preview, and live Minimum vs. Recommended system requirement tabs.
  - Hardware Compatibility Engine: Evaluates active PC profile directly against parsed live requirements from RAWG.

### Phase 4 Features (Completed - Current State):
- **CheapShark API Integration:**
  - Reusable backend CheapShark service (`backend/src/services/cheapsharkService.js`) consuming public CheapShark API (`https://www.cheapshark.com/api/1.0`).
  - Configured with mandatory descriptive `User-Agent: PlayWise-Gaming-Platform/1.0 (playwise.app)`.
  - In-memory caching layer (5–10 minutes for deals, 24 hours for stores, 12 hours for currency rates).
  - No API key required for CheapShark; zero secrets exposed.
  - Resilient network retry layer (`fetchWithRetry`) handling transient socket drops and rate throttling with exponential backoff.
- **RAWG-Prioritized Deals Search & Game Matching (`gameMatcher.js` & `cheapsharkService.js`):**
  - Deals search prioritizes the canonical RAWG PC game catalogue: user search queries search RAWG first, retrieve authentic game titles and IDs, then match each game against CheapShark.
  - Strict numeral consistency verification: titles with numerals (e.g. `2077`, `3`, `5`, `V`, `IV`) must match the query's numerals, completely eliminating false positives (e.g. "CrashMetal - Cyberpunk" and "Cyberpunk SFX" rejected for "Cyberpunk 2077"; "Gears 5" rejected for "GTA V"; "The Witcher 2" rejected for "The Witcher 3").
  - Canonical gaming acronym expansion: automatically maps shorthand queries (`RDR2` / `rdr 2` -> `Red Dead Redemption 2`, `GTA 5` / `gta5` / `gta v` -> `Grand Theft Auto V`, `COD`, `GOW`, `AC`, etc.) and splits attached letter-digit patterns.
  - Explicit non-game filter: automatically excludes soundtracks, DLCs, tools, editors, mods, REDkits, costume packs, and guides.
  - Rate-limit resilient candidate evaluation: sequentially resolves top relevant candidates to prevent CheapShark HTTP 429 burst blocks.
  - Zero false-positive policy: games without verified CheapShark deals return `matched: false` with clear no-deal messaging rather than unrelated offers.
  - Never falls back to popular deals during search: non-empty queries only return matched offers; if no deals exist, an informative empty state is rendered.
  - Frontend async race-condition protection: `DealsPage.jsx` cancels stale in-flight requests on new keystrokes and clears prior deals immediately to prevent stale popular deals from overwriting search results.
- **Deals RESTful APIs (`/api/deals`):**
  - `GET /api/deals`: Curated popular deals when title is empty; routes through RAWG-prioritized search when title is supplied.
  - `GET /api/deals/search?q=`: Real-time RAWG-prioritized deal search with store filtering, price ranges, and sorting.
  - `GET /api/deals/game/:gameId`: Retailer offers for specific game; resolves CheapShark gameID or matches RAWG title; highlights cheapest offer and extracts all-time historical lowest price.
  - `GET /api/deals/stores`: Supported stores directory with IDs, names, and logos.
  - `GET /api/deals/currencies`: USD exchange rates with timestamp and estimate disclaimer.
- **Global Currency Engine:**
  - Real-time exchange rates from `https://open.er-api.com/v6/latest/USD` with fallback static rates.
  - Supported currencies: USD ($), EUR (€), GBP (£), INR (₹), CAD (C$), AUD (A$), JPY (¥).
  - Redux `currencySlice.js` managing active currency with `localStorage` persistence.
  - Currency switcher dropdown in `Navbar.jsx` (desktop & mobile).
  - Clear label disclaimers designating converted non-USD values as real-time estimates.
- **Frontend Deals & Price Comparison UI:**
  - Dedicated Deals Page (`/deals`): Live discount grid, store filters (Steam, Epic, GOG, Humble, etc.), price tiers (Free, Under $5, Under $10, Under $20), sort controls, pagination, and `DealCardSkeleton` shimmer states.
  - Deal Cards (`DealCard.jsx`): Cover thumbnail, savings badge (`-75%` or `100% FREE`), deal rating score, retailer store logo, converted price estimate, and "Get Deal on [Store]" button opening retailer checkout (`target="_blank" rel="noopener noreferrer"`).
  - Game Details Page (`GameDetailsPage.jsx`): Real-time store deals table, highlighted cheapest offer badge, all-time historical low callout banner, and direct store redirects.
  - Wishlist & Game Cards: Real-time currency estimation across the entire application.

### Phase 5 Features (Completed - Current State):
- **Database-Backed Hardware Benchmark Architecture:**
  - Mongoose models `BenchmarkCPU.js` and `BenchmarkGPU.js` with benchmark scores (1–100 scale), cores/threads/clocks, VRAM, release years, search aliases, and source metadata.
  - Seeded catalog with 45 CPUs and 48 GPUs (93+ components) in MongoDB Atlas (`playwise` database) covering modern and legacy hardware.
  - Auto-seeding service (`benchmarkSeedService.js`) running on server startup.
- **Hardware Classification & Fuzzy Matcher (`benchmarkService.js`):**
  - 5 standardized performance tiers (`Enthusiast`, `High End`, `Mid Range`, `Budget`, `Entry Level`).
  - Intelligent fuzzy matcher (`matchHardware`) mapping arbitrary user strings (e.g., "Intel(R) Core(TM) i7-13700K CPU @ 3.40GHz", "GeForce RTX 4070 12GB") to verified benchmark profiles with confidence scoring and heuristic fallback.
  - Model and alias hardware search.
- **Advanced Compatibility Engine (`compatibilityService.js`):**
  - Normalized 0–100 compatibility score computation (weighted: GPU 45%, CPU 35%, RAM 15%, Storage 5%).
  - Detailed component breakdown for CPU, GPU, RAM, VRAM, Storage, OS.
  - Limiting component detection identifying the specific bottleneck holding back gameplay.
  - Actionable, honest hardware upgrade recommendations.
- **Hardware Bottleneck & Resolution-Based FPS Engine (`bottleneckService.js`):**
  - Calculates approximate CPU vs. GPU bottleneck percentage and balance rating (Great Balance $\le 20\%$, Moderate $21-35\%$, Severe $> 35\%$).
  - Multi-resolution dynamics: 1080p (high CPU draw-call demand), 1440p (balanced), 4K (GPU-bound pipeline).
  - Resolution-based framerate projections across 720p, 1080p, 1440p, 4K for Low, Medium, High, Ultra presets with explicit synthetic benchmark disclaimers.
- **Frontend Integration:**
  - Services: `benchmarkService.js` and `compatibilityService.js`.
  - `SpecComparisonBar.jsx`: 0–100 score gauge, limiting component alert banner, hardware balance card, resolution-based FPS projection matrix with preset tabs, and upgrade suggestions.
  - `MyPcPage.jsx`: Active rig CPU/GPU benchmark tier badges, live Hardware Balance analyzer with resolution switcher, and live game benchmark tester integration.
  - `GameDetailsPage.jsx`: Asynchronous Phase 5 compatibility evaluation hook seamlessly upgrading the live verdict bar.

---

## 3. Fixed Technology Stack

### Frontend:
- **Framework:** React 19 with Vite (JavaScript, JSX — strictly no TypeScript)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **UI Components:** DaisyUI v5 (`@plugin "daisyui";`)
- **Routing:** React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **State Management:** Redux Toolkit (`pcSlice`, `wishlistSlice`, `authSlice`, `gameSlice`, `currencySlice`)
- **HTTP Client:** Axios (`axios`) with `withCredentials: true`
- **Icons & Graphics:** Custom lightweight SVG vector system (`Icons.jsx`)

### Backend:
- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express.js 4.x
- **Database:** MongoDB Atlas via Mongoose 8.x
- **External APIs:**
  - RAWG Video Games Database API (`https://api.rawg.io/api`)
  - CheapShark Deals API (`https://www.cheapshark.com/api/1.0`)
  - Exchange Rate API (`https://open.er-api.com/v6/latest/USD`)
- **Authentication & Security:** `jsonwebtoken` (JWT), `bcryptjs`, `cookie-parser`, `cors`, `dotenv`
- **Error Handling:** Centralized `errorHandler` and `notFoundHandler`

---

## 4. Database Schemas

### 1. `User` (`backend/src/models/User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim, Max: 50 | User's full name or gamer tag |
| `email` | String | Required, Unique, Lowercase, Trim | Valid email address |
| `password` | String | Required, Min: 6, `select: false` | Bcrypt-hashed password |
| `avatar` | String | Optional, Default URL | Gamer avatar image |
| `createdAt` | Date | Default: `Date.now` | Account creation timestamp |

### 2. `PCProfile` (`backend/src/models/PCProfile.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `userId` | ObjectId | Required, Ref: `'User'`, Indexed | Owning user reference |
| `profileName` | String | Required, Trim, Max: 60 | Rig name (e.g. "Main Battlestation") |
| `cpu` | String | Required, Trim | Processor specification |
| `gpu` | String | Required, Trim | Graphics card specification |
| `ram` | Number | Required, Min: 2, Max: 512 | RAM in GB |
| `storage` | Number | Required, Min: 10 | Free storage space in GB |
| `storageType` | String | Enum: `['NVMe SSD', 'SATA SSD', 'HDD']` | Storage drive type |
| `operatingSystem` | String | Required, Trim, Default: Win 11 | Operating system |
| `isDefault` | Boolean | Default: `false` | Primary rig flag (unique per user) |
| `createdAt` / `updatedAt` | Date | Timestamps | Auto-managed timestamps |

---

## 5. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user + auto-create initial rig |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT cookie/token |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user |

### PC Hardware Profiles (`/api/pc-profiles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/pc-profiles` | Private | List all PC profiles belonging to logged-in user |
| `POST` | `/api/pc-profiles` | Private | Create a new PC configuration profile |
| `GET` | `/api/pc-profiles/:id` | Private | Retrieve a single PC profile (ownership verified) |
| `PUT` | `/api/pc-profiles/:id` | Private | Update an existing PC profile (ownership verified) |
| `DELETE` | `/api/pc-profiles/:id` | Private | Delete a PC profile (re-assigns default if needed) |
| `PATCH` | `/api/pc-profiles/:id/default` | Private | Set profile as the active default rig |

### Game Catalog & Discovery (`/api/games`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/games` | Public | Paginated PC games catalog (`page`, `page_size`, `genres`, `ordering`, `search`) |
| `GET` | `/api/games/search` | Public | Search PC games by title query (`?q=`) |
| `GET` | `/api/games/featured` | Public | Curated featured, trending, popular, and recent games for Home |
| `GET` | `/api/games/genres` | Public | List available game genres with game counts and icons |
| `GET` | `/api/games/:id` | Public | Full game profile, screenshots gallery, and parsed PC requirements |

### Deals & Price Comparison (`/api/deals`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/deals` | Public | Curated popular deals with sorting, store filters, and price ranges |
| `GET` | `/api/deals/search` | Public | Search live deals by title keyword (`?q=`) |
| `GET` | `/api/deals/game/:gameId` | Public | Live retailer offers, cheapest deal highlight, historical low price (`?title=`) |
| `GET` | `/api/deals/stores` | Public | Supported digital PC stores directory with names and icons |
| `GET` | `/api/deals/currencies` | Public | Real-time exchange rates against USD and supported currencies list |

### Hardware Benchmarks & Catalog (Phase 5)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/benchmarks/search` | Public | Search hardware by query string (`?q=&type=&limit=`) |
| `POST` | `/api/benchmarks/match` | Public | Fuzzy match raw hardware string to verified benchmark profile |
| `GET` | `/api/benchmarks/tiers` | Public | Standardized performance tiers metadata and definitions |
| `GET` | `/api/benchmarks/catalog` | Public | Full benchmark hardware catalog (`?type=cpu\|gpu\|all`) |

### PC Compatibility & Benchmarking (Phase 5)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/compatibility/evaluate` | Public | Evaluate user PC specs against game requirements (0–100 score, limiting component, bottleneck, FPS) |
| `GET` | `/api/compatibility/game/:gameId` | Public / Auth | Evaluate game compatibility using active default rig or query params |
| `POST` | `/api/compatibility/bottleneck` | Public | Calculate approximate CPU vs. GPU bottleneck and resolution dynamics |
| `POST` | `/api/compatibility/fps` | Public | Project resolution-based FPS across presets (720p/1080p/1440p/4K) |

### System & Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and MongoDB connection state |

---

## 6. Environment Variables

### Backend (`backend/.env`):
- `PORT`: HTTP port for Express (default: `5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `CLIENT_URL`: Frontend origin allowed by CORS (default: `http://localhost:5173`)
- `MONGO_URI`: MongoDB Atlas connection string (read from environment)
- `JWT_SECRET`: Secret key for signing and verifying JWT tokens
- `JWT_EXPIRES_IN`: Token validity lifespan (default: `7d`)
- `RAWG_API_KEY`: Secret API key for RAWG Video Games Database (kept server-side only)

### Frontend (`frontend/.env`):
- `VITE_API_URL`: Backend API base URL (default: `http://localhost:5000/api`)
