import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  IconSearch,
  IconTag,
  IconSliders,
  IconFlame,
  IconGlobe,
  IconSparkles,
} from '../components/common/Icons.jsx';
import DealCard from '../components/common/DealCard.jsx';
import DealCardSkeleton from '../components/common/DealCardSkeleton.jsx';
import dealService from '../services/dealService.js';

export const DealsPage = () => {
  const { activeCurrency, currencies, disclaimer } = useSelector((state) => state.currency);

  const [deals, setDeals] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState('Savings');
  const [sortDesc, setSortDesc] = useState(0);
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, under5, under10, under20
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch stores list once
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storeList = await dealService.getStores();
        setStores(storeList);
      } catch (err) {
        console.error('Failed to load stores:', err);
      }
    };
    fetchStores();
  }, []);

  // Fetch deals whenever filters, sort or page change
  useEffect(() => {
    let isCancelled = false;

    const fetchDeals = async () => {
      const activeSearch = searchQuery.trim();

      setLoading(true);
      setError(null);

      // Clear deals immediately when initiating a search to prevent stale results from lingering
      if (activeSearch) {
        setDeals([]);
      }

      try {
        let upperPrice = undefined;
        let lowerPrice = undefined;

        if (priceFilter === 'free') {
          upperPrice = 0;
          lowerPrice = 0;
        } else if (priceFilter === 'under5') {
          upperPrice = 5;
        } else if (priceFilter === 'under10') {
          upperPrice = 10;
        } else if (priceFilter === 'under20') {
          upperPrice = 20;
        }

        const data = await dealService.getDeals({
          storeID: selectedStore || undefined,
          pageNumber: page,
          pageSize: 24,
          sortBy,
          desc: sortDesc,
          lowerPrice,
          upperPrice,
          title: activeSearch || undefined,
        });

        // Prevent stale asynchronous responses from replacing newer search results
        if (!isCancelled) {
          setDeals(data?.deals || []);
          setHasMore(data?.hasMore ?? false);
        }
      } catch (err) {
        if (!isCancelled) {
          // Never fall back to previous/popular deals on search error
          if (activeSearch) {
            setDeals([]);
          }
          setError(err.message || 'Failed to load game deals. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchDeals();
    }, searchQuery ? 400 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, selectedStore, sortBy, sortDesc, priceFilter, page]);

  // Handle sort select change
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'Savings') {
      setSortBy('Savings');
      setSortDesc(0);
    } else if (value === 'PriceAsc') {
      setSortBy('Price');
      setSortDesc(0);
    } else if (value === 'PriceDesc') {
      setSortBy('Price');
      setSortDesc(1);
    } else if (value === 'DealRating') {
      setSortBy('Deal Rating');
      setSortDesc(0);
    } else if (value === 'Title') {
      setSortBy('Title');
      setSortDesc(0);
    } else if (value === 'Metacritic') {
      setSortBy('Metacritic');
      setSortDesc(0);
    }
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[#080b11] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-[#0e1320] border border-cyan-500/20 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-wide uppercase">
              <IconFlame className="w-3.5 h-3.5" />
              <span>Verified Store Discounts</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              PC Game <span className="text-gradient">Deals & Price Comparison</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Track real-time digital game discounts across authorized retailers including Steam, Epic Games Store, GOG, and Humble Store. Compare prices and grab the best offers.
            </p>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Currency Notice Banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <IconGlobe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-white">Active Display Currency: </span>
            <span className="font-bold text-cyan-400">
              {activeCurrency} ({currencies[activeCurrency]?.symbol || '$'})
            </span>
            <span className="text-slate-400 ml-2">
              — {disclaimer}
            </span>
          </div>
        </div>

        {/* Controls & Filter Bar */}
        <div className="space-y-4 bg-[#0e1320] p-4 sm:p-6 rounded-2xl border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="md:col-span-5 relative">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search deals by game title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-white text-sm placeholder-slate-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Store Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-slate-200 text-sm cursor-pointer"
              >
                <option value="" className="bg-[#0e1320] text-white">
                  All Stores ({stores.length > 0 ? `${stores.length} Retailers` : 'All'})
                </option>
                {stores.map((s) => (
                  <option key={s.storeID} value={s.storeID} className="bg-[#0e1320] text-white">
                    {s.storeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3">
              <select
                onChange={handleSortChange}
                defaultValue="Savings"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-slate-200 text-sm cursor-pointer"
              >
                <option value="Savings" className="bg-[#0e1320] text-white">
                  Biggest Discount (% Off)
                </option>
                <option value="PriceAsc" className="bg-[#0e1320] text-white">
                  Price: Low to High
                </option>
                <option value="PriceDesc" className="bg-[#0e1320] text-white">
                  Price: High to Low
                </option>
                <option value="DealRating" className="bg-[#0e1320] text-white">
                  Best Deal Rating
                </option>
                <option value="Metacritic" className="bg-[#0e1320] text-white">
                  Metacritic Score
                </option>
                <option value="Title" className="bg-[#0e1320] text-white">
                  Title (A–Z)
                </option>
              </select>
            </div>
          </div>

          {/* Quick Price Range Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
              <IconSliders className="w-3.5 h-3.5" /> Price Filter:
            </span>

            {[
              { id: 'all', label: 'All Deals' },
              { id: 'free', label: '100% Free' },
              { id: 'under5', label: 'Under $5' },
              { id: 'under10', label: 'Under $10' },
              { id: 'under20', label: 'Under $20' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setPriceFilter(filter.id);
                  setPage(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  priceFilter === filter.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setPage(0)}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.dealID} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-[#0e1320] border border-white/5 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <IconTag className="w-8 h-8" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-xl font-bold text-white">
                  No verified discounts for "{searchQuery}"
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  We checked the PC game catalog for "{searchQuery}", but none of our authorized digital retailers currently have an active discount listed.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to={`/explore?search=${encodeURIComponent(searchQuery)}`}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-sm font-bold transition-all"
                  >
                    View in Game Catalog &rarr;
                  </Link>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStore('');
                      setPriceFilter('all');
                      setPage(0);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-bold transition-all cursor-pointer"
                  >
                    View All Popular Deals
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white">No game deals found</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  We couldn't find any deals matching your current store or price filters. Try resetting them.
                </p>
                <button
                  onClick={() => {
                    setSelectedStore('');
                    setPriceFilter('all');
                    setSortBy('Savings');
                    setPage(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-sm font-bold transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && deals.length > 0 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                page === 0
                  ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              Previous Page
            </button>

            <span className="text-xs font-semibold text-slate-400">
              Page <span className="text-white font-bold">{page + 1}</span>
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                !hasMore
                  ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
