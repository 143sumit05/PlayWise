
# PlayWise

### Play smarter. Choose better.

A PC gaming discovery and hardware compatibility platform that helps
players explore games, understand their PC requirements, evaluate
hardware compatibility, and compare game deals.

[![Live Demo](https://img.shields.io/badge/Live-Demo-00C7D9?style=for-the-badge)](https://playwise-six.vercel.app/)

------------------------------------------------------------------------

## Overview

Choosing a PC game is not only about finding a title you like. Players
also need to know whether their hardware can run it, what performance
they might expect, and where they can find a good price.

**PlayWise** brings these decisions together in one place. It combines
game discovery, PC profiles, hardware compatibility analysis, estimated
performance projections, wishlists, and game-deal discovery in a single
web application.

## Live Application

**[Open PlayWise](https://playwise-six.vercel.app/)**

The frontend is deployed on Vercel, the Express API is deployed on
Render, and application data is stored in MongoDB Atlas.

## Features

### Game discovery

-   Browse and search a catalogue of PC games.
-   Explore game information, genres, screenshots, and available system
    requirements.
-   View detailed game pages.

### PC profiles and compatibility

-   Create an account and manage saved PC configurations.
-   Evaluate a PC profile against a game's listed requirements.
-   Get a compatibility score and an explanation of the limiting
    hardware component.
-   View hardware balance and possible upgrade suggestions.

### Performance estimates

-   View estimated FPS projections at supported resolutions and quality
    presets.
-   Review potential CPU/GPU bottlenecks.
-   Understand whether a component may limit performance.

### Deals and wishlist

-   Search for PC game deals and compare listed prices.
-   View offers from supported digital storefronts.
-   Save games to a personal wishlist.
-   View converted price estimates in supported currencies.

## Technology Stack

  Area                  Technologies
  --------------------- ----------------------------------------------------
  Frontend              React 19, Vite, JavaScript
  Styling               Tailwind CSS 4, DaisyUI 5
  State management      Redux Toolkit, React Redux
  Routing and HTTP      React Router, Fetch-based API requests
  Backend               Node.js, Express.js
  Database              MongoDB Atlas, Mongoose
  Authentication        JSON Web Tokens (JWT), bcryptjs, HTTP-only cookies
  Game data             RAWG API
  Game deals            CheapShark API
  Currency conversion   Exchange-rate API integration
  Deployment            Vercel (frontend), Render (backend)

## Architecture

``` text
                         ┌─────────────────────────┐
                         │      PlayWise User      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │ React + Vite Frontend   │
                         │ Vercel                  │
                         └────────────┬────────────┘
                                      │ HTTP / JSON
                                      ▼
                         ┌─────────────────────────┐
                         │ Node.js + Express API   │
                         │ Render                  │
                         └──────┬──────────┬───────┘
                                │          │
                  ┌─────────────┘          └──────────────┐
                  ▼                                       ▼
       ┌─────────────────────┐               ┌────────────────────────┐
       │ MongoDB Atlas       │               │ External data services │
       │ Users, PC profiles  │               │ RAWG, CheapShark, FX   │
       └─────────────────────┘               └────────────────────────┘
```

The frontend communicates with the backend API. The backend handles
authentication, database operations, compatibility calculations, and
requests to external data providers. API credentials are kept on the
server side.

## Repository Structure

``` text
PlayWise/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── data/            # Hardware benchmark seed data
│   │   ├── middleware/      # Authentication and error handling
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # External APIs and business logic
│   │   ├── utils/             # Shared utilities
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Run Locally

### Prerequisites

-   Node.js (LTS recommended)
-   npm
-   A MongoDB Atlas database or local MongoDB instance
-   API credentials for the external services that require them

### 1. Clone the repository

``` bash
git clone https://github.com/143sumit05/PlayWise.git
cd PlayWise
```

### 2. Install backend dependencies

``` bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend/` directory using the example
file:

``` bash
# PowerShell
Copy-Item .env.example .env
```

Open `backend/.env` and provide your own values. Do not commit this
file.

### 4. Install frontend dependencies

Open a second terminal from the project root:

``` bash
cd frontend
npm install
```

Create the frontend environment file from its example:

``` bash
# PowerShell
Copy-Item .env.example .env
```

Set the frontend API base URL to your local backend API, using the
variable name documented in `frontend/.env.example`.

### 5. Start the backend

From the `backend/` directory:

``` bash
npm run dev
```

### 6. Start the frontend

From the `frontend/` directory:

``` bash
npm run dev
```

Open the local Vite URL printed in the terminal (typically
`http://localhost:5173`).

> Run the backend and frontend in separate terminals. The exact
> environment variable names and required values are documented in the
> corresponding `.env.example` files.

## API Overview

The backend exposes REST API route groups for the following areas:

  -----------------------------------------------------------------------
  Route group                         Purpose
  ----------------------------------- -----------------------------------
  `/api/health`                       Backend and database health check

  `/api/auth`                         Signup, login, logout, and
                                      current-user session

  `/api/pc-profiles`                  Create, retrieve, update, and
                                      manage PC profiles

  `/api/games`                        Game discovery, search, genres,
                                      featured games, and game details

  `/api/deals`                        Game deal search, offers, stores,
                                      and currency options

  `/api/benchmarks`                   Hardware benchmark information

  `/api/compatibility`                PC and game compatibility
                                      evaluation
  -----------------------------------------------------------------------

For exact request methods, parameters, and response formats, refer to
the route definitions in `backend/src/routes/`.

## Testing and Production Build

Run the backend test suite from the repository root:

``` bash
npm --prefix backend test
```

Create a production frontend build:

``` bash
cd frontend
npm run build
```

The project includes automated backend QA coverage for core application
logic. Run the commands above in your current checkout to verify its
state.

## Screenshots

Screenshots of the live application will be added here.

Suggested screenshots: - Home page - Explore games - Game details and
compatibility results - My PC profile - Deals and wishlist

## Deployment

  Component     Platform
  ------------- ------------------------------------------------
  Frontend      [Vercel](https://vercel.com/)
  Backend API   [Render](https://render.com/)
  Database      [MongoDB Atlas](https://www.mongodb.com/atlas)

-   Live application: https://playwise-six.vercel.app/
-   Backend health endpoint:
    https://playwise-backend-xd0v.onrender.com/api/health

Configure production environment variables in the respective hosting
dashboards. Never place private API keys, database credentials, or JWT
secrets in frontend code or commit them to Git.

## Notes and Limitations

-   **FPS projections are estimates.** They are calculated from the
    application's hardware data and estimation logic; they are not
    guaranteed results from controlled gameplay benchmarks.
-   **Currency conversions are estimates.** Final prices can differ
    because of exchange-rate changes, regional pricing, taxes, and
    retailer policies.
-   **Game and deal availability depends on external providers.** Their
    catalogues, pricing, and data may change or be temporarily
    unavailable.
-   **System requirements may not be available for every game.**
    Compatibility results depend on the data available for the selected
    title and hardware.

## Author

**Sumit Dhiman**

-   GitHub: [@143sumit05](https://github.com/143sumit05)
-   Project repository:
    [143sumit05/PlayWise](https://github.com/143sumit05/PlayWise)

------------------------------------------------------------------------

::: {align="center"}
**PlayWise --- Play smarter. Choose better.**
:::
