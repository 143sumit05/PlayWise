import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist, clearWishlist } from '../redux/slices/wishlistSlice.js';
import { formatPriceEstimate } from '../redux/slices/currencySlice.js';
import { checkCompatibility } from '../utils/compatibilityChecker.js';
import { mockGames } from '../data/mockGames.js';
import {
  IconHeart,
  IconGamepad,
  IconClose,
  IconStar,
  IconShieldCheck,
  IconAlertCircle,
} from '../components/common/Icons.jsx';

export const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const userSpecs = useSelector((state) => state.pc.specs);
  const { activeCurrency, currencies } = useSelector((state) => state.currency);

  // Normalize wishlist items
  const wishlistedGames = wishlistItems.map((item) => {
    if (typeof item === 'string') {
      const match = mockGames.find((g) => g.id === item);
      return (
        match || {
          id: item,
          title: item.replace(/-/g, ' ').toUpperCase(),
          coverImage:
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          price: 59.99,
          salePrice: 59.99,
          discount: 0,
          rating: 8.5,
          genres: ['Action'],
          developer: 'Featured Studio',
          releaseDate: '2023',
        }
      );
    }
    return item;
  });

  const totalOriginalPrice = wishlistedGames.reduce(
    (acc, game) => acc + (game.price || 59.99),
    0
  );
  const totalSalePrice = wishlistedGames.reduce(
    (acc, game) => acc + (game.salePrice || game.price || 59.99),
    0
  );
  const totalSavings = totalOriginalPrice - totalSalePrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <IconHeart className="w-4 h-4 fill-current" />
            Your Saved Library
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep track of titles you want to play and compare prices before buying.
          </p>
        </div>

        {wishlistedGames.length > 0 && (
          <button
            onClick={() => dispatch(clearWishlist())}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            Clear Entire Wishlist
          </button>
        )}
      </div>

      {wishlistedGames.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Wishlist Games List (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {wishlistedGames.map((game) => {
              const compat = checkCompatibility(userSpecs, game);
              return (
                <div
                  key={game.id}
                  className="bg-[#0e1320] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all group"
                >
                  {/* Image + Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link to={`/game/${game.id}`} className="shrink-0">
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl object-cover bg-slate-900 group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                          {game.genres?.[0] || 'Action'}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                          <IconStar className="w-3 h-3 fill-current" />
                          <span>{game.rating}</span>
                        </div>
                      </div>

                      <Link to={`/game/${game.id}`}>
                        <h3 className="font-bold text-white text-base sm:text-lg hover:text-cyan-400 transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                      </Link>

                      <p className="text-slate-400 text-xs line-clamp-1">
                        {game.developer} • {game.releaseDate}
                      </p>

                      {/* Compatibility Verdict Pill */}
                      {compat.status !== 'NOT_CONFIGURED' && (
                        <div className="pt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              compat.status === 'OPTIMAL'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : compat.status === 'PLAYABLE'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {compat.status === 'OPTIMAL' ? (
                              <IconShieldCheck className="w-3 h-3" />
                            ) : (
                              <IconAlertCircle className="w-3 h-3" />
                            )}
                            {compat.score ? <strong className="font-extrabold">{compat.score}/100</strong> : null}
                            <span>
                              {compat.status === 'OPTIMAL'
                                ? 'Runs 60+ FPS'
                                : compat.status === 'PLAYABLE'
                                ? 'Playable'
                                : 'Needs Upgrade'}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right">
                    <div className="text-white font-extrabold text-base sm:text-lg">
                      {formatPriceEstimate(game.salePrice || game.price || 59.99, activeCurrency, currencies).formatted}
                    </div>
                    {activeCurrency !== 'USD' ? (
                      <div className="text-[10px] text-slate-400 font-mono">
                        (${(game.salePrice || game.price || 59.99).toFixed(2)} USD)
                      </div>
                    ) : game.discount > 0 ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-slate-500 line-through">
                          ${(game.price || 59.99).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-cyan-400">
                          -{game.discount}%
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/game/${game.id}`}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black font-bold text-xs border border-cyan-500/30 transition-all"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => dispatch(removeFromWishlist(game.id))}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <IconClose className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wishlist Summary Card (Right 4 Cols) */}
          <div className="lg:col-span-4 bg-[#0e1320] border border-white/10 rounded-3xl p-6 shadow-xl space-y-5 sticky top-28">
            <h3 className="text-white font-extrabold text-lg pb-3 border-b border-white/5">
              Wishlist Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Items:</span>
                <span className="text-white font-bold">{wishlistedGames.length} Games</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Standard Value:</span>
                <span className="text-white font-bold">${totalOriginalPrice.toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>Current Discounts:</span>
                  <span>-${totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Estimated Total:</span>
                  <span className="text-2xl font-black text-cyan-400">
                    {formatPriceEstimate(totalSalePrice, activeCurrency, currencies).formatted}
                  </span>
                </div>
                {activeCurrency !== 'USD' && (
                  <span className="text-[10px] text-slate-400 font-mono text-right">
                    (${totalSalePrice.toFixed(2)} USD converted estimate)
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/explore"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all cursor-pointer"
            >
              <IconGamepad className="w-4 h-4" />
              <span>Explore More Games</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#0e1320] border border-white/5 rounded-3xl p-16 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-2">
            <IconHeart className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Your Wishlist is Empty</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Found a title you're interested in? Hit the heart button on any game card in the catalog to save it here for quick tracking and compatibility checks.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95 transition-all"
            >
              <IconGamepad className="w-4 h-4" />
              <span>Browse Live Games Catalog</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
