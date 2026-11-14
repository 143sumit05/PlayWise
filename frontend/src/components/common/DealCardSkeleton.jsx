import React from 'react';

export const DealCardSkeleton = () => {
  return (
    <div className="bg-[#0e1320] rounded-2xl border border-white/5 overflow-hidden flex flex-col animate-pulse">
      {/* Thumbnail shimmer */}
      <div className="h-44 w-full bg-slate-800/60 relative">
        <div className="absolute top-3 left-3 w-16 h-6 bg-slate-700/60 rounded-full" />
        <div className="absolute top-3 right-3 w-12 h-6 bg-slate-700/60 rounded-lg" />
      </div>

      {/* Content Shimmer */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Store badge shimmer */}
          <div className="w-24 h-4 bg-slate-700/50 rounded mb-2" />
          {/* Title shimmer */}
          <div className="w-full h-5 bg-slate-700/70 rounded mb-1.5" />
          <div className="w-3/4 h-5 bg-slate-700/50 rounded" />
        </div>

        {/* Pricing Shimmer */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-16 h-4 bg-slate-700/40 rounded" />
            <div className="w-20 h-6 bg-slate-700/80 rounded" />
          </div>
          <div className="w-full h-10 bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default DealCardSkeleton;
