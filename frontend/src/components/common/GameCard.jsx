import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../redux/slices/wishlistSlice.js';
import { formatPriceEstimate } from '../../redux/slices/currencySlice.js';
import { checkCompatibility } from '../../utils/compatibilityChecker.js';
import { IconHeart, IconStar, IconShieldCheck, IconAlertCircle } from './Icons.jsx';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';

export const GameCard = ({ game }) => {
  const dispatch = useDispatch();
  const wishlistIds = useSelector((state) => state.wishlist.gameIds);
  const userSpecs = useSelector((state) => state.pc.specs);
  const { activeCurrency, currencies } = useSelector((state) => state.currency);

  const isWishlisted = wishlistIds.includes(game.id) || wishlistIds.includes(game.slug);
  const compat = checkCompatibility(userSpecs, game);

  const rawPrice = game.salePrice ?? game.price ?? 59.99;
  const priceEst = formatPriceEstimate(rawPrice, activeCurrency, currencies);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(game));
  };

  return (
    <div className="group relative bg-[#0e121b] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col">
      {/* Cover Image Container */}
      <Link to={`/game/${game.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={game.coverImage || FALLBACK_COVER}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_COVER;
          }}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Discount Badge */}
          {game.discount > 0 ? (
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs px-2.5 py-1 rounded-md shadow-lg tracking-wider">
              -{game.discount}%
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-md border border-white/10 font-medium">
              Standard
            </span>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-yellow-500/30 text-yellow-400 text-xs font-bold">
            <IconStar className="w-3.5 h-3.5 fill-current text-yellow-400" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute bottom-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all duration-200 z-10 cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
              : 'bg-black/60 text-slate-300 hover:text-white border-white/10 hover:border-cyan-400 hover:bg-black/80'
          }`}
        >
          <IconHeart className="w-4 h-4" filled={isWishlisted} />
        </button>

        {/* Quick PC Compatibility Pill */}
        {compat.status !== 'NOT_CONFIGURED' && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-md border ${
                compat.status === 'OPTIMAL'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  : compat.status === 'PLAYABLE'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
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
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {game.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[11px] text-cyan-300/80 font-medium bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Title */}
          <Link to={`/game/${game.id}`}>
            <h3
              className="font-bold text-white text-base leading-snug hover:text-cyan-400 transition-colors line-clamp-1"
              title={game.title}
            >
              {game.title}
            </h3>
          </Link>
          <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-extrabold text-base leading-none">
                {priceEst.formatted}
              </span>
              {game.discount > 0 && activeCurrency === 'USD' && (
                <span className="text-slate-500 line-through text-xs">
                  ${(game.price || 59.99).toFixed(2)}
                </span>
              )}
            </div>
            {priceEst.isEstimate && (
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                ({priceEst.usdDisplay} USD)
              </span>
            )}
          </div>

          <Link
            to={`/game/${game.id}`}
            className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
