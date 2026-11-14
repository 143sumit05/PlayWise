import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSearchQuery,
  setSelectedGenre,
  setSortBy,
  setCurrentPage,
  resetFilters,
  fetchCatalogGames,
  fetchGenres,
} from '../redux/slices/gameSlice.js';
import GameCard from '../components/common/GameCard.jsx';
import GameCardSkeleton from '../components/common/GameCardSkeleton.jsx';
import {
  IconSearch,
  IconSliders,
  IconClose,
  IconGamepad,
} from '../components/common/Icons.jsx';

export const ExplorePage = () => {
  const dispatch = useDispatch();
  const {
    searchQuery,
    selectedGenre,
    sortBy,
    currentPage,
    catalog,
    genresList,
  } = useSelector((state) => state.games);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Fetch available genres on mount
  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  // Debounced search sync to Redux
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, dispatch]);

  // Fetch games whenever search, genre, sort, or page changes
  useEffect(() => {
    dispatch(
      fetchCatalogGames({
        page: currentPage,
        pageSize: 20,
        search: searchQuery,
        genre: selectedGenre,
        sortBy,
      })
    );
  }, [dispatch, currentPage, searchQuery, selectedGenre, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' || selectedGenre !== 'All' || sortBy !== 'popularity';

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= catalog.totalPages) {
      dispatch(setCurrentPage(newPage));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    dispatch(resetFilters());
  };

  const genresToDisplay =
    genresList.length > 0
      ? genresList
      : [
          { id: 'all', name: 'All', slug: 'all' },
          { id: 'action', name: 'Action', slug: 'action' },
          { id: 'rpg', name: 'RPG', slug: 'role-playing-games-rpg' },
          { id: 'shooter', name: 'Shooter', slug: 'shooter' },
          { id: 'adventure', name: 'Adventure', slug: 'adventure' },
          { id: 'racing', name: 'Racing', slug: 'racing' },
          { id: 'strategy', name: 'Strategy', slug: 'strategy' },
          { id: 'indie', name: 'Indie', slug: 'indie' },
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Live RAWG PC Catalog & Benchmarking
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Explore PC Games
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access over 500,000+ benchmarked titles with live screenshots, official PC requirements, and cross-store pricing.
          </p>
        </div>

        {/* Total Count Badge & Reset */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-semibold">
            {catalog.loading ? (
              'Searching games...'
            ) : (
              <>
                Total: <strong className="text-cyan-400 font-extrabold">{catalog.count.toLocaleString()}</strong> games
              </>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <IconClose className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="bg-[#0e1320] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search over 500,000+ PC games by title (e.g. Witcher, Cyberpunk, Elden Ring)..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                dispatch(setSearchQuery(''));
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <IconClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <IconSliders className="w-5 h-5 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
            className="w-full md:w-56 py-3 px-4 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="popularity">Sort by: Popularity</option>
            <option value="rating">Sort by: Highest Rating</option>
            <option value="releaseDate">Sort by: Release Date</option>
            <option value="name">Sort by: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genresToDisplay.map((genre) => {
          const isSelected =
            selectedGenre === genre.name ||
            (selectedGenre === 'All' && (genre.slug === 'all' || genre.name === 'All'));

          return (
            <button
              key={genre.id || genre.slug}
              onClick={() =>
                dispatch(
                  setSelectedGenre(genre.slug === 'all' ? 'All' : genre.slug || genre.name)
                )
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-[#0d121c] text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Games Grid or Skeletons */}
      {catalog.loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : catalog.results.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {catalog.results.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Pagination Controls */}
          {catalog.totalPages > 1 && (
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Page <strong className="text-white">{catalog.page}</strong> of{' '}
                <strong className="text-white">{catalog.totalPages.toLocaleString()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(catalog.page - 1)}
                  disabled={!catalog.hasPrevious || catalog.page <= 1}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
                >
                  &larr; Previous Page
                </button>

                <div className="px-3 py-2 text-xs font-mono font-bold text-cyan-400 bg-black/40 rounded-xl border border-cyan-500/30">
                  {catalog.page}
                </div>

                <button
                  onClick={() => handlePageChange(catalog.page + 1)}
                  disabled={!catalog.hasNext || catalog.page >= catalog.totalPages}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
                >
                  Next Page &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#0e1320] border border-white/5 rounded-3xl p-16 text-center max-w-lg mx-auto">
          <IconGamepad className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">No Matching PC Games Found</h3>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't find any games matching your current search or genre filter. Try searching for a different keyword or reset your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-sm hover:bg-cyan-400 transition-colors shadow-lg cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
