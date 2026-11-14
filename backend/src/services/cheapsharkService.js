import axios from 'axios';
import {
  findBestCheapSharkMatch,
  isExcludedNonGame,
  isTitleRelevantToQuery,
  expandQueryAcronyms,
} from '../utils/gameMatcher.js';
import { rawgService } from './rawgService.js';

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';
const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// In-memory cache for API responses to respect rate limits and maximize performance
const cache = new Map();

const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key, data, ttlSeconds = 600) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

// Standard client with required User-Agent header (CheapShark requirement)
const cheapSharkClient = axios.create({
  baseURL: CHEAPSHARK_BASE_URL,
  timeout: 20000,
  headers: {
    'User-Agent': 'PlayWise-Gaming-Platform/1.0 (playwise.app)',
  },
});

// Resilient wrapper with exponential backoff retry for transient network drops (ECONNRESET, 429)
const fetchWithRetry = async (fn, retries = 2, delayMs = 300) => {
  try {
    return await fn();
  } catch (err) {
    const isTransient =
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNABORTED' ||
      err.response?.status === 429;

    if (retries > 0 && isTransient) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
};

// Fallback currency rates if exchange rate provider is temporarily unreachable
const FALLBACK_CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 86.5 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.38 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.0 },
};

export const cheapsharkService = {
  /**
   * Fetch all supported digital gaming stores
   */
  getStores: async () => {
    const cacheKey = 'cheapshark_stores';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await cheapSharkClient.get('/stores');
      const rawStores = response.data || [];

      // Format stores and create a fast lookup map
      const storesList = rawStores
        .filter((s) => s.isActive === 1)
        .map((s) => ({
          storeID: s.storeID,
          storeName: s.storeName,
          isActive: Boolean(s.isActive),
          images: {
            banner: s.images?.banner ? `https://www.cheapshark.com${s.images.banner}` : null,
            logo: s.images?.logo ? `https://www.cheapshark.com${s.images.logo}` : null,
            icon: s.images?.icon ? `https://www.cheapshark.com${s.images.icon}` : null,
          },
        }));

      const storesMap = {};
      storesList.forEach((s) => {
        storesMap[s.storeID] = s;
      });

      const result = { list: storesList, map: storesMap };
      // Cache stores for 24 hours
      setCache(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('[CheapShark] Failed to fetch stores:', error.message);
      // Fallback basic stores map
      return {
        list: [
          { storeID: '1', storeName: 'Steam', isActive: true },
          { storeID: '7', storeName: 'GOG', isActive: true },
          { storeID: '25', storeName: 'Epic Games Store', isActive: true },
          { storeID: '11', storeName: 'Humble Store', isActive: true },
        ],
        map: {
          '1': { storeID: '1', storeName: 'Steam', isActive: true },
          '7': { storeID: '7', storeName: 'GOG', isActive: true },
          '25': { storeID: '25', storeName: 'Epic Games Store', isActive: true },
          '11': { storeID: '11', storeName: 'Humble Store', isActive: true },
        },
      };
    }
  },

  /**
   * Fetch popular game deals with filtering, sorting and store enrichment.
   * If `title` search is present, routes through `searchDealsViaRAWG` to prioritize RAWG.
   */
  getDeals: async ({
    storeID,
    pageNumber = 0,
    pageSize = 24,
    sortBy = 'Savings',
    desc = 0,
    lowerPrice,
    upperPrice,
    title,
  } = {}) => {
    // If a title search query is provided, prioritize RAWG game catalog
    if (title && title.trim()) {
      return cheapsharkService.searchDealsViaRAWG(title.trim(), {
        storeID,
        pageNumber,
        pageSize,
        sortBy,
        desc,
        lowerPrice,
        upperPrice,
      });
    }

    const cacheKey = `deals_${storeID || 'all'}_${pageNumber}_${pageSize}_${sortBy}_${desc}_${lowerPrice || '0'}_${upperPrice || 'max'}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const { map: storesMap } = await cheapsharkService.getStores();

    const params = {
      pageNumber,
      pageSize,
      sortBy,
      desc,
    };

    if (storeID) params.storeID = storeID;
    if (lowerPrice !== undefined && lowerPrice !== '') params.lowerPrice = lowerPrice;
    if (upperPrice !== undefined && upperPrice !== '') params.upperPrice = upperPrice;

    try {
      const response = await cheapSharkClient.get('/deals', { params });
      const rawDeals = response.data || [];

      const normalizedDeals = rawDeals.map((d) => {
        const store = storesMap[d.storeID] || {
          storeName: `Store #${d.storeID}`,
          images: {},
        };

        const salePrice = parseFloat(d.salePrice) || 0;
        const normalPrice = parseFloat(d.normalPrice) || 0;
        const savings = Math.round(parseFloat(d.savings) || 0);
        const dealRating = parseFloat(d.dealRating) || 0;
        const cleanDealID = d.dealID?.includes('%') ? d.dealID : encodeURIComponent(d.dealID || '');

        return {
          dealID: d.dealID,
          gameID: d.gameID,
          title: d.title,
          internalName: d.internalName,
          storeID: d.storeID,
          storeName: store.storeName,
          storeIcon: store.images?.icon || null,
          storeLogo: store.images?.logo || null,
          salePrice,
          normalPrice,
          savings,
          isOnSale: d.isOnSale === '1' || savings > 0,
          dealRating,
          metacriticScore: d.metacriticScore ? parseInt(d.metacriticScore, 10) : null,
          steamRatingText: d.steamRatingText || null,
          steamRatingPercent: d.steamRatingPercent ? parseInt(d.steamRatingPercent, 10) : null,
          thumb: d.thumb,
          releaseDate: d.releaseDate ? d.releaseDate * 1000 : null,
          dealLink: `https://www.cheapshark.com/redirect?dealID=${cleanDealID}`,
        };
      });

      const totalDealsEstimate = rawDeals.length >= pageSize ? (pageNumber + 2) * pageSize : (pageNumber * pageSize) + rawDeals.length;

      const result = {
        deals: normalizedDeals,
        page: pageNumber,
        pageSize,
        total: totalDealsEstimate,
        hasMore: rawDeals.length >= pageSize,
        searchSource: 'cheapshark_curated',
      };

      setCache(cacheKey, result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      console.error('[CheapShark] Error fetching deals:', error.message);
      return {
        deals: [],
        page: pageNumber,
        pageSize,
        total: 0,
        hasMore: false,
        error: error.message,
      };
    }
  },

  /**
   * Search deals by prioritizing RAWG game catalogue first,
   * then matching each authentic game against CheapShark with strict rules.
   */
  searchDealsViaRAWG: async (query, {
    storeID,
    pageNumber = 0,
    pageSize = 24,
    sortBy = 'Savings',
    desc = 0,
    lowerPrice,
    upperPrice,
  } = {}) => {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return cheapsharkService.getDeals({
        storeID,
        pageNumber,
        pageSize,
        sortBy,
        desc,
        lowerPrice,
        upperPrice,
      });
    }

    const cacheKey = `rawg_deals_search_${cleanQuery.toLowerCase()}_${storeID || 'all'}_${pageNumber}_${pageSize}_${sortBy}_${desc}_${lowerPrice || '0'}_${upperPrice || 'max'}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    // 1. Search RAWG game catalog for PC titles matching the user query (with acronym expansion e.g. rdr2 -> red dead redemption 2)
    const rawgQuery = expandQueryAcronyms(cleanQuery);
    let rawgGames = [];
    try {
      const rawgResponse = await rawgService.getGames({
        search: rawgQuery,
        pageSize: 10,
        page: pageNumber + 1,
      });
      rawgGames = rawgResponse.results || [];

      // If acronym expansion was used and returned few or no results, try original cleanQuery as fallback
      if (rawgGames.length === 0 && rawgQuery !== cleanQuery) {
        const fallbackRes = await rawgService.getGames({
          search: cleanQuery,
          pageSize: 10,
          page: pageNumber + 1,
        });
        rawgGames = fallbackRes.results || [];
      }
    } catch (err) {
      console.warn('[CheapShark Search] RAWG search failed:', err.message);
    }

    // 2. Filter out non-games (REDkit, soundtracks, mods) and ensure relevance to user query
    const relevantGames = rawgGames.filter((g) => {
      if (isExcludedNonGame(g.title)) return false;
      return isTitleRelevantToQuery(g.title, cleanQuery);
    });

    const matchedDeals = [];

    // 3. Retrieve verified CheapShark offers for top relevant RAWG games
    // Sequential lookups (top 4 games) prevent CheapShark HTTP 429 burst rate limits
    const topCandidates = relevantGames.slice(0, 4);
    for (const game of topCandidates) {
      try {
        const offersData = await cheapsharkService.getGameOffers(game.id, {
          rawgTitle: game.title,
        });

        if (!offersData || !offersData.matched || !offersData.offers || offersData.offers.length === 0) {
          continue;
        }

        // Filter offers by storeID if requested
        let applicableOffers = offersData.offers;
        if (storeID) {
          applicableOffers = applicableOffers.filter((o) => String(o.storeID) === String(storeID));
        }

        // Filter offers by price range if requested
        if (lowerPrice !== undefined && lowerPrice !== '') {
          const minP = parseFloat(lowerPrice);
          applicableOffers = applicableOffers.filter((o) => o.price >= minP);
        }
        if (upperPrice !== undefined && upperPrice !== '') {
          const maxP = parseFloat(upperPrice);
          applicableOffers = applicableOffers.filter((o) => o.price <= maxP);
        }

        if (applicableOffers.length === 0) {
          continue;
        }

        // Pick the best / cheapest offer among the applicable offers
        const bestOffer = applicableOffers[0]; // Already sorted by price ascending

        matchedDeals.push({
          dealID: bestOffer.dealID,
          gameID: offersData.game?.gameID || game.id,
          rawgId: game.id,
          title: game.title, // Canonical title from RAWG
          matchedTitle: offersData.game?.title,
          internalName: offersData.game?.internalName || game.slug,
          storeID: bestOffer.storeID,
          storeName: bestOffer.storeName,
          storeIcon: bestOffer.storeIcon,
          storeLogo: bestOffer.storeLogo,
          salePrice: bestOffer.price,
          normalPrice: bestOffer.retailPrice,
          savings: bestOffer.savings,
          isOnSale: bestOffer.isOnSale,
          dealRating: game.rating || 0,
          metacriticScore: game.metacritic || null,
          thumb: game.coverImage || offersData.game?.thumb || null,
          releaseDate: game.releaseDate || null,
          dealLink: bestOffer.redirectUrl,
          cheapestPriceEver: offersData.cheapestPriceEver,
          totalOffers: offersData.offers.length,
          allOffers: applicableOffers,
        });
      } catch (err) {
        console.warn(`[CheapShark Search] Failed offers lookup for "${game.title}":`, err.message);
      }
    }

    // 4. Sort the matched deals according to user preference
    matchedDeals.sort((a, b) => {
      if (sortBy === 'Savings') {
        return desc ? a.savings - b.savings : b.savings - a.savings;
      } else if (sortBy === 'Price') {
        return desc ? b.salePrice - a.salePrice : a.salePrice - b.salePrice;
      } else if (sortBy === 'Deal Rating') {
        return desc ? a.dealRating - b.dealRating : b.dealRating - a.dealRating;
      } else if (sortBy === 'Title') {
        return desc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
      } else if (sortBy === 'Metacritic') {
        const metaA = a.metacriticScore || 0;
        const metaB = b.metacriticScore || 0;
        return desc ? metaA - metaB : metaB - metaA;
      }
      return b.savings - a.savings;
    });

    const result = {
      deals: matchedDeals,
      page: pageNumber,
      pageSize,
      total: matchedDeals.length,
      hasMore: false,
      searchSource: 'rawg_prioritized',
      query: cleanQuery,
    };

    setCache(cacheKey, result, 300); // 5 min cache
    return result;
  },

  /**
   * Search deals by game title (routes through RAWG-prioritized search)
   */
  searchDeals: async (query, options = {}) => {
    return cheapsharkService.searchDealsViaRAWG(query, options);
  },

  /**
   * Fetch all retailer offers for a specific game.
   * Accepts CheapShark gameID OR game title (from RAWG).
   */
  getGameOffers: async (gameIdOrTitle, { rawgTitle = '' } = {}) => {
    const targetQuery = (rawgTitle || gameIdOrTitle || '').toString().trim();
    const cacheKey = `game_offers_${targetQuery.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const { map: storesMap } = await cheapsharkService.getStores();

    let targetGameID = null;
    let matchedGame = null;

    // If already a purely numeric CheapShark ID
    if (/^\d+$/.test(targetQuery)) {
      targetGameID = targetQuery;
    } else {
      // It's a game title or slug, e.g. "Cyberpunk 2077" or "cyberpunk-2077"
      const cleanTitle = targetQuery.includes('-') && !targetQuery.includes(' ')
        ? targetQuery.replace(/-/g, ' ')
        : targetQuery;

      try {
        const searchRes = await fetchWithRetry(() =>
          cheapSharkClient.get('/games', {
            params: { title: cleanTitle, limit: 10 },
          })
        );

        const candidates = searchRes.data || [];
        matchedGame = findBestCheapSharkMatch(cleanTitle, candidates);

        if (matchedGame && matchedGame.gameID) {
          targetGameID = matchedGame.gameID;
        }
      } catch (err) {
        console.error('[CheapShark] Search candidates failed:', err.message);
      }
    }

    // If no verified match was found, return an explicit empty state
    if (!targetGameID) {
      const emptyResult = {
        matched: false,
        message: 'No verified retailer deals currently found for this title.',
        game: null,
        cheapestOffer: null,
        cheapestPriceEver: null,
        offers: [],
        totalOffers: 0,
      };
      setCache(cacheKey, emptyResult, 600);
      return emptyResult;
    }

    try {
      const response = await fetchWithRetry(() =>
        cheapSharkClient.get('/games', {
          params: { id: targetGameID },
        })
      );

      const { info, cheapestPriceEver, deals: rawDeals = [] } = response.data || {};

      const normalizedOffers = rawDeals.map((d) => {
        const store = storesMap[d.storeID] || {
          storeName: `Store #${d.storeID}`,
          images: {},
        };

        const price = parseFloat(d.price) || 0;
        const retailPrice = parseFloat(d.retailPrice) || 0;
        const savings = Math.round(parseFloat(d.savings) || 0);
        const cleanDealID = d.dealID?.includes('%') ? d.dealID : encodeURIComponent(d.dealID || '');

        return {
          storeID: d.storeID,
          storeName: store.storeName,
          storeIcon: store.images?.icon || null,
          storeLogo: store.images?.logo || null,
          dealID: d.dealID,
          price,
          retailPrice,
          savings,
          isOnSale: savings > 0,
          redirectUrl: `https://www.cheapshark.com/redirect?dealID=${cleanDealID}`,
          isCheapest: false,
        };
      });

      // Sort by price ascending (cheapest first)
      normalizedOffers.sort((a, b) => a.price - b.price);

      // Mark the absolute cheapest offer
      let cheapestOffer = null;
      if (normalizedOffers.length > 0) {
        normalizedOffers[0].isCheapest = true;
        cheapestOffer = normalizedOffers[0];
      }

      // Format historical lowest price
      let formattedCheapestEver = null;
      if (cheapestPriceEver && cheapestPriceEver.price) {
        formattedCheapestEver = {
          price: parseFloat(cheapestPriceEver.price) || 0,
          date: cheapestPriceEver.date
            ? new Date(cheapestPriceEver.date * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null,
        };
      }

      const result = {
        matched: true,
        game: {
          gameID: targetGameID,
          title: info?.title || matchedGame?.external || targetQuery,
          thumb: info?.thumb || matchedGame?.thumb || null,
          steamAppID: info?.steamAppID || null,
          matchConfidence: matchedGame?.matchConfidence || 1.0,
        },
        cheapestOffer,
        cheapestPriceEver: formattedCheapestEver,
        offers: normalizedOffers,
        totalOffers: normalizedOffers.length,
      };

      setCache(cacheKey, result, 600); // 10 minutes cache
      return result;
    } catch (error) {
      console.error('[CheapShark] Error fetching game offers for ID', targetGameID, error.message);
      return {
        matched: false,
        message: 'Failed to retrieve offers from retailer network.',
        game: null,
        cheapestOffer: null,
        cheapestPriceEver: null,
        offers: [],
        totalOffers: 0,
        error: error.message,
      };
    }
  },

  /**
   * Fetch live exchange rates against USD with local caching and static fallback
   */
  getExchangeRates: async () => {
    const cacheKey = 'currency_exchange_rates_usd';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(EXCHANGE_RATE_API_URL, { timeout: 8000 });
      const apiRates = response.data?.rates || {};

      const currencies = {
        USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
        EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: apiRates.EUR || FALLBACK_CURRENCIES.EUR.rate },
        GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: apiRates.GBP || FALLBACK_CURRENCIES.GBP.rate },
        INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: apiRates.INR || FALLBACK_CURRENCIES.INR.rate },
        CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: apiRates.CAD || FALLBACK_CURRENCIES.CAD.rate },
        AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: apiRates.AUD || FALLBACK_CURRENCIES.AUD.rate },
        JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: apiRates.JPY || FALLBACK_CURRENCIES.JPY.rate },
      };

      const result = {
        base: 'USD',
        lastUpdated: new Date().toISOString(),
        currencies,
        disclaimer: 'All non-USD prices are real-time estimated conversions from USD. Actual regional pricing may vary by retailer.',
      };

      // Cache for 12 hours
      setCache(cacheKey, result, 43200);
      return result;
    } catch (error) {
      console.warn('[Currency] Live rates unavailable, using fallback:', error.message);
      return {
        base: 'USD',
        lastUpdated: new Date().toISOString(),
        currencies: FALLBACK_CURRENCIES,
        disclaimer: 'All non-USD prices are estimated conversions from USD. Actual regional pricing may vary by retailer.',
      };
    }
  },
};
