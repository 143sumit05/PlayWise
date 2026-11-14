import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../redux/slices/wishlistSlice.js';
import { fetchGameDetails } from '../redux/slices/gameSlice.js';
import { formatPriceEstimate } from '../redux/slices/currencySlice.js';
import dealService from '../services/dealService.js';
import compatibilityService from '../services/compatibilityService.js';
import { checkCompatibility } from '../utils/compatibilityChecker.js';
import SpecComparisonBar from '../components/common/SpecComparisonBar.jsx';
import {
  IconHeart,
  IconStar,
  IconCpu,
  IconTag,
  IconExternalLink,
  IconShieldCheck,
  IconAlertCircle,
  IconGamepad,
  IconFlame,
  IconGlobe,
} from '../components/common/Icons.jsx';

export const GameDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data: game, loading, error } = useSelector((state) => state.games.currentGame);
  const userSpecs = useSelector((state) => state.pc.specs);
  const wishlistIds = useSelector((state) => state.wishlist.gameIds);
  const { activeCurrency, currencies, disclaimer } = useSelector((state) => state.currency);

  const [activeReqTab, setActiveReqTab] = useState('recommended'); // 'minimum' | 'recommended'
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);

  // Live CheapShark Deals State
  const [liveOffersData, setLiveOffersData] = useState(null);
  const [offersLoading, setOffersLoading] = useState(false);

  // Phase 5 Verified Benchmark Compatibility State
  const [liveCompatibility, setLiveCompatibility] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchGameDetails(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, dispatch]);

  // Fetch real-time CheapShark offers when game metadata is available
  useEffect(() => {
    let isMounted = true;
    if (game?.title) {
      setOffersLoading(true);
      dealService
        .getGameOffers(game.id, game.title)
        .then((data) => {
          if (isMounted) {
            setLiveOffersData(data);
          }
        })
        .catch((err) => {
          console.warn('[GameDetails] Failed to load live offers:', err.message);
        })
        .finally(() => {
          if (isMounted) setOffersLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [game?.id, game?.title]);

  // Fetch verified Phase 5 benchmark compatibility analytics
  useEffect(() => {
    let isMounted = true;
    if (game && userSpecs?.cpu && userSpecs?.gpu) {
      compatibilityService
        .evaluate(userSpecs, game)
        .then((data) => {
          if (isMounted && data) {
            setLiveCompatibility(data);
          }
        })
        .catch((err) => {
          console.warn('[GameDetails] Benchmark compatibility fallback:', err.message);
        });
    } else {
      setLiveCompatibility(null);
    }
    return () => {
      isMounted = false;
    };
  }, [game, userSpecs]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8 animate-pulse">
        <div className="h-72 bg-slate-800/40 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 h-96 bg-slate-800/40 rounded-2xl" />
          <div className="lg:col-span-8 space-y-4">
            <div className="h-10 w-2/3 bg-slate-800/60 rounded" />
            <div className="h-6 w-1/3 bg-slate-800/40 rounded" />
            <div className="h-32 bg-slate-800/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <IconGamepad className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-white mb-3">Game Not Found</h2>
        <p className="text-slate-400 mb-6">
          {error || 'The requested game could not be retrieved from the RAWG database.'}
        </p>
        <Link
          to="/explore"
          className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-sm"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(game.id) || wishlistIds.includes(game.slug);
  const baseCompatibility = checkCompatibility(userSpecs, game);
  const compatibility = liveCompatibility || baseCompatibility;

  const screenshots = game.screenshots || [];
  const activeScreenshotUrl = screenshots[selectedScreenshot] || game.bannerImage || game.coverImage;

  return (
    <div className="pb-24">
      {/* 1. HERO BANNER BACKDROP */}
      <div className="relative h-[420px] lg:h-[500px] w-full overflow-hidden border-b border-white/5">
        <img
          src={game.bannerImage || game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover object-top filter brightness-[0.35] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/60 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 text-xs font-bold backdrop-blur-md transition-colors"
          >
            &larr; Back to Catalog
          </Link>
        </div>
      </div>

      {/* 2. GAME OVERVIEW HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-52 sm:-mt-64 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cover Art (Left) */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <div className="w-64 sm:w-80 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-slate-900 group">
              <img
                src={game.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
                alt={game.title}
                className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            {/* Quick Pricing Card */}
            <div className="w-64 sm:w-80 mt-4 bg-[#0d121c] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white">
                    ${game.salePrice.toFixed(2)}
                  </span>
                  {game.discount > 0 && (
                    <span className="text-sm text-slate-500 line-through ml-2">
                      ${game.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {game.discount > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs">
                    -{game.discount}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist CTA Button */}
              <button
                onClick={() => dispatch(toggleWishlist(game.id))}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border cursor-pointer ${isWishlisted
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 hover:bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
              >
                <IconHeart className="w-5 h-5" filled={isWishlisted} />
                <span>{isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Quick Rig Status */}
              <div className="pt-2 border-t border-white/5 text-center">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${compatibility.status === 'OPTIMAL'
                    ? 'text-emerald-400'
                    : compatibility.status === 'PLAYABLE'
                      ? 'text-amber-400'
                      : compatibility.status === 'UPGRADE_REQUIRED'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                >
                  {compatibility.status === 'OPTIMAL' && <IconShieldCheck className="w-4 h-4" />}
                  {compatibility.status === 'PLAYABLE' && <IconAlertCircle className="w-4 h-4" />}
                  {compatibility.status === 'UPGRADE_REQUIRED' && <IconAlertCircle className="w-4 h-4" />}
                  {compatibility.status === 'NOT_CONFIGURED'
                    ? 'Configure PC for FPS score'
                    : compatibility.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Details (Right) */}
          <div className="lg:col-span-8 space-y-6 pt-4 lg:pt-16">
            {/* Genre Pills & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 bg-[#121826] border border-yellow-500/30 px-3 py-1 rounded-xl">
                <IconStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-extrabold text-sm">{game.rating}</span>
                <span className="text-slate-400 text-xs">/ 10</span>
                {game.metacritic && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    MC {game.metacritic}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
                {game.title}
              </h1>
              <p className="text-cyan-400 text-base sm:text-lg font-medium mt-1">
                {game.tagline}
              </p>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 rounded-2xl bg-[#0c101a] border border-white/5 text-xs">
              <div>
                <span className="text-slate-500 block">Developer</span>
                <span className="text-white font-bold">{game.developer}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Publisher</span>
                <span className="text-white font-bold">{game.publisher}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Release Date</span>
                <span className="text-white font-bold">{game.releaseDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Platform</span>
                <span className="text-cyan-400 font-bold">PC (Windows)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2">About the Game</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {game.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. SCREENSHOTS GALLERY */}
        {screenshots.length > 0 && (
          <section className="mt-16 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Official PC Screenshots
            </h3>

            {/* Main Preview */}
            <div className="aspect-[16/9] max-h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img
                src={activeScreenshotUrl}
                alt="Game Screenshot Preview"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {screenshots.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedScreenshot(idx)}
                  className={`w-28 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${selectedScreenshot === idx
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img
                    src={typeof s === 'string' ? s : s.image}
                    alt={`Screenshot ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 4. HARDWARE COMPATIBILITY BENCHMARK SECTION */}
        <section className="mt-16 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <IconCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                PC Compatibility Benchmark
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Live evaluation against your active hardware configuration
              </p>
            </div>
          </div>

          <SpecComparisonBar compatibility={compatibility} />
        </section>

        {/* 5. SYSTEM REQUIREMENTS TABLE */}
        <section className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Official System Requirements
            </h3>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#0d121c] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveReqTab('minimum')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeReqTab === 'minimum'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Minimum
              </button>
              <button
                onClick={() => setActiveReqTab('recommended')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeReqTab === 'recommended'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Recommended
              </button>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Box */}
            <div
              className={`p-6 rounded-2xl border transition-all ${activeReqTab === 'minimum'
                ? 'bg-[#0f1524] border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.1)]'
                : 'bg-[#0c101a] border-white/5 opacity-80'
                }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <h4 className="text-white font-bold text-base">Minimum Specifications</h4>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  Target: 1080p / 30 FPS Low
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">OS:</span>
                  <span className="text-white font-semibold">{game.minimumRequirements?.os}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Processor (CPU):</span>
                  <span className="text-white font-semibold">{game.minimumRequirements?.cpu}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Memory (RAM):</span>
                  <span className="text-white font-semibold">
                    {game.minimumRequirements?.ram} GB RAM
                  </span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Graphics (GPU):</span>
                  <span className="text-white font-semibold">{game.minimumRequirements?.gpu}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Storage:</span>
                  <span className="text-white font-semibold">{game.minimumRequirements?.storage}</span>
                </li>
              </ul>
            </div>

            {/* Recommended Box */}
            <div
              className={`p-6 rounded-2xl border transition-all ${activeReqTab === 'recommended'
                ? 'bg-[#0f1524] border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.1)]'
                : 'bg-[#0c101a] border-white/5 opacity-80'
                }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <h4 className="text-white font-bold text-base">Recommended Specifications</h4>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  Target: 1440p / 60+ FPS High
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">OS:</span>
                  <span className="text-white font-semibold">{game.recommendedRequirements?.os}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Processor (CPU):</span>
                  <span className="text-white font-semibold">{game.recommendedRequirements?.cpu}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Memory (RAM):</span>
                  <span className="text-white font-semibold">
                    {game.recommendedRequirements?.ram} GB RAM
                  </span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Graphics (GPU):</span>
                  <span className="text-white font-semibold">{game.recommendedRequirements?.gpu}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Storage:</span>
                  <span className="text-white font-semibold">{game.recommendedRequirements?.storage}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. STORE DEALS & PRICE COMPARISON */}
        <section className="mt-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <IconTag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Store Price Comparison & Live Deals
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Real-time verified pricing from authorized stores. Select an offer to purchase directly from the retailer.
                </p>
              </div>
            </div>

            <Link
              to="/deals"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-400 transition-colors self-start sm:self-auto"
            >
              <span>Explore All Deals</span>
              <IconExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Historical Low Callout Banner */}
          {liveOffersData?.cheapestPriceEver && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border border-cyan-500/30 text-xs text-slate-200 shadow-[0_0_20px_rgba(0,240,255,0.06)]">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <IconFlame className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-white">All-Time Historical Lowest Price: </span>
                <span className="font-black text-cyan-400 text-sm">
                  {activeCurrency === 'USD'
                    ? `$${liveOffersData.cheapestPriceEver.price.toFixed(2)}`
                    : formatPriceEstimate(liveOffersData.cheapestPriceEver.price, activeCurrency, currencies).formatted}
                </span>
                {liveOffersData.cheapestPriceEver.date && (
                  <span className="text-slate-400 ml-2">
                    (Recorded on {liveOffersData.cheapestPriceEver.date})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Deals Table */}
          <div className="bg-[#0e1320] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/40 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-4 px-6">Storefront</th>
                    <th className="py-4 px-6">Regular Price</th>
                    <th className="py-4 px-6">Discount</th>
                    <th className="py-4 px-6">Current Deal</th>
                    <th className="py-4 px-6 text-right">Store Redirect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {offersLoading ? (
                    // Skeleton Rows while fetching
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6">
                          <div className="w-32 h-5 bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-16 h-4 bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-12 h-4 bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-20 h-5 bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="w-24 h-8 bg-slate-800 rounded-xl ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : liveOffersData?.offers && liveOffersData.offers.length > 0 ? (
                    // Live CheapShark Store Offers
                    liveOffersData.offers.map((deal, index) => {
                      const salePriceEst = formatPriceEstimate(deal.price, activeCurrency, currencies);
                      const regularPriceEst = formatPriceEstimate(deal.retailPrice, activeCurrency, currencies);
                      const isFree = deal.price === 0;

                      return (
                        <tr
                          key={deal.dealID || index}
                          className={`hover:bg-white/5 transition-colors ${deal.isCheapest ? 'bg-cyan-950/20' : ''
                            }`}
                        >
                          <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                            {deal.storeIcon && (
                              <img
                                src={deal.storeIcon}
                                alt={deal.storeName}
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            <span>{deal.storeName}</span>
                            {deal.isCheapest && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                Cheapest Offer
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-400 line-through">
                            {activeCurrency === 'USD'
                              ? `$${deal.retailPrice.toFixed(2)}`
                              : regularPriceEst.formatted}
                          </td>
                          <td className="py-4 px-6">
                            {deal.savings > 0 ? (
                              <span className="text-rose-400 font-extrabold">-{deal.savings}%</span>
                            ) : (
                              <span className="text-slate-500 font-medium">0%</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-white text-base leading-none">
                              {activeCurrency === 'USD'
                                ? isFree
                                  ? 'FREE'
                                  : `$${deal.price.toFixed(2)}`
                                : salePriceEst.formatted}
                            </div>
                            {salePriceEst.isEstimate && (
                              <div className="text-[10px] text-slate-400 font-mono mt-1">
                                ({salePriceEst.usdDisplay} USD)
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={deal.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black text-xs font-black shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                            >
                              <span>Buy on {deal.storeName}</span>
                              <IconExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  ) : game.storeDeals && game.storeDeals.length > 0 ? (
                    // Fallback Official Store Links
                    game.storeDeals.map((deal, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                          <span>{deal.store}</span>
                          {deal.bestDeal && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                              Est. Store
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-400 line-through">
                          ${deal.regularPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {deal.discount > 0 ? (
                            <span className="text-cyan-400 font-bold">-{deal.discount}%</span>
                          ) : (
                            <span className="text-slate-500">0%</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-white text-base">
                          ${deal.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <a
                            href={deal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>Official Page</span>
                            <IconExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-6 text-center text-slate-400">
                        No active digital store discounts currently verified for this title.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Currency conversion label disclaimer */}
            <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <IconGlobe className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  All non-USD amounts are real-time estimated currency conversions from USD.
                </span>
              </div>
              <span className="text-slate-500 hidden sm:inline">
                Powered by CheapShark API
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GameDetailsPage;
