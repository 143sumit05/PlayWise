import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IconExternalLink, IconStar, IconTag } from './Icons.jsx';
import { formatPriceEstimate } from '../../redux/slices/currencySlice.js';

export const DealCard = ({ deal }) => {
  const { activeCurrency, currencies } = useSelector((state) => state.currency);

  const salePriceEst = formatPriceEstimate(deal.salePrice, activeCurrency, currencies);
  const normalPriceEst = formatPriceEstimate(deal.normalPrice, activeCurrency, currencies);

  const isFree = deal.salePrice === 0 || deal.savings >= 100;
  const gameDetailRoute = deal.rawgId ? `/game/${deal.rawgId}` : null;

  return (
    <div className="group relative bg-[#0e1320] rounded-2xl border border-white/5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] hover:-translate-y-1">
      {/* Thumbnail Banner */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {gameDetailRoute ? (
          <Link to={gameDetailRoute} className="block w-full h-full">
            <img
              src={deal.thumb || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
              alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </Link>
        ) : (
          <img
            src={deal.thumb || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-transparent to-black/40 pointer-events-none" />

        {/* Savings Badge */}
        {deal.savings > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-black tracking-wide shadow-lg shadow-rose-950/50 flex items-center gap-1 pointer-events-none">
            <span>{isFree ? '100% FREE' : `-${deal.savings}%`}</span>
          </div>
        )}

        {/* Deal Rating */}
        {deal.dealRating > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 pointer-events-none">
            <IconStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{deal.dealRating.toFixed(1)}</span>
          </div>
        )}

        {/* Store Identifier Pill */}
        <div className="absolute bottom-2 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 pointer-events-none">
          {deal.storeIcon && (
            <img src={deal.storeIcon} alt={deal.storeName} className="w-3.5 h-3.5 object-contain" />
          )}
          <span>{deal.storeName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {gameDetailRoute ? (
            <Link to={gameDetailRoute}>
              <h3
                className="text-base font-bold text-white hover:text-cyan-400 transition-colors line-clamp-1"
                title={deal.title}
              >
                {deal.title}
              </h3>
            </Link>
          ) : (
            <h3
              className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1"
              title={deal.title}
            >
              {deal.title}
            </h3>
          )}

          {/* Steam/Metacritic ratings preview if present */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            {deal.steamRatingText && (
              <span className="text-emerald-400 font-medium">
                {deal.steamRatingText} {deal.steamRatingPercent ? `(${deal.steamRatingPercent}%)` : ''}
              </span>
            )}
            {deal.metacriticScore && (
              <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                Meta: {deal.metacriticScore}
              </span>
            )}
            {deal.totalOffers > 1 && (
              <span className="text-cyan-400 text-[10px] font-semibold">
                {deal.totalOffers} stores
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Regular Price
              </span>
              <span className="text-xs text-slate-400 line-through">
                {activeCurrency === 'USD'
                  ? `$${deal.normalPrice.toFixed(2)}`
                  : normalPriceEst.formatted}
              </span>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-cyan-400 leading-none">
                {activeCurrency === 'USD'
                  ? isFree
                    ? 'FREE'
                    : `$${deal.salePrice.toFixed(2)}`
                  : salePriceEst.formatted}
              </div>
              {salePriceEst.isEstimate && (
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ({salePriceEst.usdDisplay} USD)
                </div>
              )}
            </div>
          </div>

          {/* Direct Retailer Redirect Button */}
          <a
            href={deal.dealLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <span>Get Deal on {deal.storeName}</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
