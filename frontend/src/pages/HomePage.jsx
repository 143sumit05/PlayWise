import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedSections } from '../redux/slices/gameSlice.js';
import GameCard from '../components/common/GameCard.jsx';
import GameCardSkeleton from '../components/common/GameCardSkeleton.jsx';
import benchmarkService from '../services/benchmarkService.js';
import {
  IconGamepad,
  IconCpu,
  IconFlame,
  IconStar,
  IconSparkles,
  IconShieldCheck,
  IconSearch,
  IconTag,
} from '../components/common/Icons.jsx';

export const HomePage = () => {
  const dispatch = useDispatch();
  const userSpecs = useSelector((state) => state.pc.specs);
  const { featured, trending, popular, recent, loading } = useSelector(
    (state) => state.games.featuredSections
  );

  const [activeHeroTab, setActiveHeroTab] = useState(0);
  const [matchedGpu, setMatchedGpu] = useState(null);

  useEffect(() => {
    dispatch(fetchFeaturedSections());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    if (userSpecs?.gpu) {
      benchmarkService
        .matchHardware(userSpecs.gpu, 'gpu')
        .then((res) => {
          if (isMounted) setMatchedGpu(res);
        })
        .catch(() => {});
    } else {
      setMatchedGpu(null);
    }
    return () => {
      isMounted = false;
    };
  }, [userSpecs?.gpu]);

  const currentHero = featured[activeHeroTab] || featured[0] || null;

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SHOWCASE SECTION */}
      <section className="relative min-h-[580px] lg:h-[680px] flex items-center overflow-hidden border-b border-white/5">
        {/* Dynamic Background Banner */}
        {currentHero && (
          <div className="absolute inset-0 z-0">
            <img
              src={currentHero.bannerImage || currentHero.coverImage}
              alt={currentHero.title}
              className="w-full h-full object-cover object-top filter brightness-[0.35] contrast-125 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/80 to-transparent" />
            <div className="absolute inset-0 bg-cyber-gradient opacity-30" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline & Hero Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
                  Play smarter. Choose better.
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight font-display tracking-tight">
                DISCOVER GAMES <br />
                <span className="text-gradient">THAT YOUR PC</span> CAN RUN.
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Benchmark your CPU, GPU, and RAM against over 500,000+ PC games powered by live RAWG data.
                Compare storefront prices and never buy an unplayable game again.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/explore"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-black font-extrabold text-sm sm:text-base hover:opacity-95 shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all flex items-center gap-2 group"
                >
                  <IconGamepad className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Explore Games Catalog</span>
                </Link>

                <Link
                  to="/my-pc"
                  className="px-6 py-3.5 rounded-xl bg-[#111726]/80 hover:bg-[#161e31] text-white font-bold text-sm sm:text-base border border-white/10 hover:border-cyan-500/50 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <IconCpu className="w-5 h-5 text-cyan-400" />
                  <span>Configure My PC Specs</span>
                </Link>
              </div>

              {/* Quick Spec Status */}
              <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active Rig:
                </span>
                <span>
                  {userSpecs?.gpu ? `${userSpecs.gpu} • ${userSpecs.ram}GB RAM` : 'Specs Not Configured'}
                </span>
                {matchedGpu?.tier && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    Tier: {matchedGpu.tier}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Hero Spotlight Selector Cards */}
            <div className="lg:col-span-4 hidden lg:flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Featured Spotlight
              </span>
              {loading && featured.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                featured.slice(0, 3).map((game, idx) => (
                  <button
                    key={game.id}
                    onClick={() => setActiveHeroTab(idx)}
                    className={`flex items-center gap-4 p-3 rounded-2xl text-left transition-all border ${
                      activeHeroTab === idx
                        ? 'bg-[#151c2c]/90 border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                        : 'bg-black/40 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-white font-bold text-sm truncate">{game.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-cyan-400 font-extrabold">
                          ${game.salePrice.toFixed(2)}
                        </span>
                        {game.discount > 0 && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 rounded font-bold">
                            -{game.discount}%
                          </span>
                        )}
                        <span className="text-[10px] text-yellow-400 font-bold ml-auto flex items-center gap-0.5">
                          ★ {game.rating}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS: HOW PLAYWISE WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <IconSearch className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">1. Discover Live PC Titles</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Explore 500,000+ games filtered by genre, release year, community ratings, and official PC system requirements.
            </p>
          </div>

          <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <IconCpu className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">2. Hardware Compatibility</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Benchmark your CPU, GPU, and RAM against minimum & recommended specifications to verify if your rig runs it smoothly.
            </p>
          </div>

          <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <IconTag className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">3. Digital Store Comparison</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Compare discounts across Steam, Epic Games, GOG, and authorized stores so you always score the best price.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TRENDING GAMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <IconFlame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Trending Now</h2>
              <p className="text-xs sm:text-sm text-slate-400">Most added and played PC games this season</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && trending.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
            : trending.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </section>

      {/* 4. POPULAR COMMUNITY FAVORITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              <IconStar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Top Rated & Popular</h2>
              <p className="text-xs sm:text-sm text-slate-400">Critically acclaimed PC masterpieces</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && popular.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
            : popular.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </section>

      {/* 5. INTERACTIVE MY PC PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-[#0c1424] via-[#101b33] to-[#15122e] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <IconCpu className="w-4 h-4" />
              Live PC Compatibility Benchmark
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Will your PC handle the latest AAA drops?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Don't waste gigabytes downloading games only to experience unplayable frame drops. Set your PC specs once, and PlayWise will badge every game in our live catalog with an instant compatibility verdict.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/my-pc"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm hover:opacity-95 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all"
              >
                Launch Spec Builder
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
              >
                Browse All Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENTLY RELEASED GAMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <IconSparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Recently Released</h2>
              <p className="text-xs sm:text-sm text-slate-400">Fresh additions to PC gaming</p>
            </div>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && recent.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
            : recent.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
