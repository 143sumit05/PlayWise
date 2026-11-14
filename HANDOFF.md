# PlayWise — Developer Handoff Guide

**Project Tagline:** *Play smarter. Choose better.*  
**Current Project State:** Phase 6 (Completed — Final QA & Production Ready)

This document contains instructions for continuing development on **PlayWise** in a fresh agent session or development environment without loss of context.

---

## 1. Quick Start Commands

Both frontend and backend are fully configured, connected to MongoDB Atlas, integrated with the RAWG Video Games Database API, integrated with the CheapShark Deals API, seeded with database-backed hardware benchmarks, and ready to run.

### Running the Backend:
```bash
# Navigate to backend directory
cd d:\PlayWise\backend

# Start the Express server in development mode (auto-reload on file save)
npm run dev

# Run automated QA test suite
npm test

# Or start directly with Node
npm start
```
- **Backend Port:** `5000`
- **Root Status:** `http://localhost:5000/`
- **Health Check Endpoint:** `http://localhost:5000/api/health`
- **Auth Endpoint:** `http://localhost:5000/api/auth`
- **PC Profiles Endpoint:** `http://localhost:5000/api/pc-profiles`
- **Game Catalog Endpoint:** `http://localhost:5000/api/games`
- **Deals Catalog Endpoint:** `http://localhost:5000/api/deals`
- **Deals Search Endpoint:** `http://localhost:5000/api/deals/search?q=witcher`
- **Game Offers Endpoint:** `http://localhost:5000/api/deals/game/:gameId?title=title`
- **Stores Directory Endpoint:** `http://localhost:5000/api/deals/stores`
- **Currencies & Exchange Rates Endpoint:** `http://localhost:5000/api/deals/currencies`
- **Benchmark Search Endpoint:** `http://localhost:5000/api/benchmarks/search?q=4070&type=gpu`
- **Benchmark Match Endpoint:** `POST http://localhost:5000/api/benchmarks/match`
- **Benchmark Tiers Endpoint:** `http://localhost:5000/api/benchmarks/tiers`
- **Benchmark Catalog Endpoint:** `http://localhost:5000/api/benchmarks/catalog`
- **Compatibility Evaluate Endpoint:** `POST http://localhost:5000/api/compatibility/evaluate`
- **Compatibility Bottleneck Endpoint:** `POST http://localhost:5000/api/compatibility/bottleneck`
- **Compatibility FPS Projections Endpoint:** `POST http://localhost:5000/api/compatibility/fps`

### Running the Frontend:
```bash
# Navigate to frontend directory
cd d:\PlayWise\frontend

# Start the Vite development server
npm run dev

# Or build for production
npm run build

# Or preview the production build
npm run preview
```
- **Frontend Port:** `5173`
- **Local URL:** `http://localhost:5173`
- **Deals Page URL:** `http://localhost:5173/deals`

---

## 2. Technologies and Dependencies

### Fixed Stack:
- **Frontend:**
  - React 19 (`react`, `react-dom`)
  - Vite (`vite`, `@vitejs/plugin-react`)
  - JavaScript only (no TypeScript)
  - Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
  - DaisyUI v5 (`daisyui`)
  - React Router DOM v7 (`react-router-dom`)
  - Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
  - Axios (`axios`) with `withCredentials: true`
  - Custom SVG vector icons (`Icons.jsx`)
- **Backend:**
  - Node.js (v20+ recommended, current environment is v22.17.0)
  - Express.js (`express`)
  - MongoDB Atlas via Mongoose 8.x (`mongoose`)
  - External APIs:
    - RAWG Video Games Database API (`https://api.rawg.io/api`)
    - CheapShark Deals API (`https://www.cheapshark.com/api/1.0`)
    - Exchange Rate API (`https://open.er-api.com/v6/latest/USD`)
  - Authentication: `jsonwebtoken`, `bcryptjs`, `cookie-parser`
  - Security & Configuration: `dotenv`, `cors`

---

## 3. Current Project State & Architecture

### What is Completed (Phases 1, 2, 3, and 4):
1. **Foundation & UI (Phase 1):**
   - Dark gaming storefront inspired by Steam and Epic Games Store (`#080b11`, `#0e1320`, cyan/purple neon accents).
   - Core pages: Home, Explore, Game Details, My PC, Wishlist, Login/Signup, Profile.
   - Client-side compatibility benchmark engine with Minimum and Recommended hardware specs.
2. **MongoDB Atlas & Real Auth (Phase 2):**
   - Express connected to `playwise` database on MongoDB Atlas.
   - Models: `User.js` (bcrypt hashed passwords) and `PCProfile.js` (multi-rig support, default rig management).
   - JWT authentication via secure HTTP-only cookies and Bearer tokens.
   - PC profile CRUD APIs with complete user data isolation.
   - Frontend multi-rig profile manager on My PC page feeding the live compatibility engine.
3. **Live Game Discovery with RAWG (Phase 3):**
   - Reusable backend RAWG service (`rawgService.js`) filtering strictly for PC titles (`parent_platforms=1`).
   - In-memory caching layer (10-15 mins for games, 24h for genres).
   - Intelligent requirements parser (`rawgNormalizer.js`) parsing CPU, GPU, RAM, Storage, OS.
   - Endpoints `/api/games`, `/api/games/search`, `/api/games/featured`, `/api/games/genres`, `/api/games/:id`.
   - Complete frontend live integration with loading skeletons.
4. **CheapShark Live Deals & Global Price Comparison (Phase 4):**
   - Reusable backend CheapShark service (`cheapsharkService.js`) with mandatory `User-Agent: PlayWise-Gaming-Platform/1.0`.
   - In-memory caching for deals, stores, and currency exchange rates.
   - Intelligent game matcher (`gameMatcher.js`): cleans titles, strips edition tags, computes Jaccard token similarity (>= 0.70 threshold), strictly excludes DLCs and soundtracks, returns `matched: false` with zero fabricated data when uncertain.
   - RAWG-prioritized search with gaming acronym expansion (`RDR2` -> `Red Dead Redemption 2`, `GTA 5` / `gta v` -> `Grand Theft Auto V`, etc.) and rate-limit safe sequential lookups.
   - Dedicated Deals Page (`/deals`): real-time search with stale response cancellation (`isCancelled`), store filters (Steam, Epic, GOG, Humble, Fanatical, etc.), sort by discount/price/deal rating, quick price tier chips (Free, Under $5, Under $10, Under $20), pagination, and loading skeletons. Never falls back to popular deals during search.
   - Deal Cards (`DealCard.jsx`): cover thumbnail, savings percentage badge, deal rating score, retailer store logo, converted price estimate, and "Get Deal on [Store]" redirect button (`target="_blank" rel="noopener noreferrer"`).
   - Game Details Page (`GameDetailsPage.jsx`): live CheapShark store offers, highlighted cheapest offer badge, all-time historical low callout banner, and retailer checkout redirects.
   - Global Currency Switcher: Real-time exchange rates (USD, EUR, GBP, INR, CAD, AUD, JPY) with Redux persistence, Navbar switcher (desktop & mobile), and prominent "Est." labels indicating converted currency values are estimates.
   - Wishlist & Game Cards: Seamless currency estimation integration across the entire storefront.
5. **Advanced PC Compatibility & Hardware Benchmarking (Phase 5):**
   - Database-backed CPU/GPU benchmark catalog (`BenchmarkCPU.js`, `BenchmarkGPU.js`) seeded into MongoDB Atlas with 93+ components.
   - 5 standardized performance tiers (`Enthusiast`, `High End`, `Mid Range`, `Budget`, `Entry Level`).
   - Intelligent fuzzy hardware matching (`benchmarkService.js`) with alias mapping and fallback heuristic scoring.
   - Comprehensive compatibility engine (`compatibilityService.js`) calculating 0–100 scores across GPU (45%), CPU (35%), RAM (15%), Storage (5%), detecting limiting components, and suggesting upgrades.
   - Bottleneck estimation and resolution dynamics model (`bottleneckService.js`) for 1080p, 1440p, and 4K with realistic framerate projections across Low, Medium, High, Ultra presets and explicit synthetic benchmark disclaimers.
   - Frontend integration with `SpecComparisonBar.jsx` (score gauge, limiting alert, bottleneck card, FPS matrix with preset tabs, and upgrade suggestions).
   - `MyPcPage.jsx` enhanced with hardware tier badges, live Hardware Balance analyzer with resolution switcher, and live game tester integration.
   - `GameDetailsPage.jsx` enhanced with asynchronous Phase 5 compatibility evaluation hook.
   - Zero-error frontend production build (143 modules transformed).
6. **Final QA & Production Readiness (Phase 6):**
   - Full-stack architectural audit and bug-proofing across all controllers, routes, and middleware.
   - Fixed auth cookie detection in optionalAuth middleware (`token` vs `jwt`), ensuring authenticated users' rigs load properly.
   - Aligned cookie clearing parameters in `auth.controller.js` `logout` with `generateToken.js` (`sameSite`, `secure`).
   - Reinforced IDOR authorization protection across all PC profile mutations.
   - Dual-parameter acceptance (`name` or `hardware`) in benchmark controller.
   - RAWG memory requirement parser enhanced for both GB and MB values.
   - Added robust `onError` image fallback handlers in `GameCard.jsx`, `DealCard.jsx`, and `GameDetailsPage.jsx`.
   - Comprehensive QA test suite in `backend/tests/playwise-qa.test.js` (`npm test`) — 33/33 tests passed with 0 failures.
   - Frontend production build verified: transformed 143 modules with 0 errors and 0 warnings in 2.26s (vendor chunking).

---

## 4. Current Work: Phase 6 (Completed — Production Ready)

All 6 development phases of PlayWise are complete, audited, and production ready:
- **Phases 1–6 Complete & Fully Verified.**
- **Automated QA Suite:** 33/33 tests passing (`npm test` in backend).
- **Production Build:** Vite production build passing with 0 errors (`npm run build` in frontend).
- **Refer to [PHASE6_QA_REPORT.md](./PHASE6_QA_REPORT.md) for full audit findings, test outcomes, and production verification.**

---

## 5. Important Decisions and Restrictions

1. **Strict Tech Stack:** Do NOT install extra UI frameworks (e.g. Next.js, Material UI, Lucide icons, styled-components). The custom SVG system in `src/components/common/Icons.jsx` covers all icon requirements.
2. **Do Not Overwrite `.env`:** Never overwrite the existing `backend/.env` file. Keep `RAWG_API_KEY` and `MONGO_URI` secure. CheapShark requires NO API key.
3. **No Fabricated Data:** Never invent prices, fake historical lows, or fabricate deals. If a title is not listed on CheapShark or cannot be matched with confidence, return `matched: false` and render the official store fallback links or an empty state.
4. **Currency Labels:** Always label non-USD prices as estimates (`Est. €18.11`, `Est. ₹1,499`) with tooltips or captions noting that regional store checkout prices may differ.
5. **No Anti-Bot Bypassing:** CheapShark redirect links (`https://www.cheapshark.com/redirect?dealID=...`) are meant for human user navigation in a real browser, opening directly via `target="_blank"`. Never attempt to bypass Cloudflare anti-bot challenges via backend scripts.
6. **Preserve Working Features:** Unauthenticated guest visitors must always be able to browse games, view details, check compatibility locally, and view live deals.
