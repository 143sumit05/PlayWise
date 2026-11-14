import React from 'react';

export const GameCardSkeleton = () => {
  return (
    <div className="bg-[#0e121b] border border-white/5 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="aspect-[16/10] bg-slate-800/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="absolute top-3 left-3 w-14 h-5 bg-slate-700/60 rounded" />
        <div className="absolute top-3 right-3 w-10 h-5 bg-slate-700/60 rounded" />
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Genre tags */}
          <div className="flex gap-2">
            <div className="w-16 h-4 bg-slate-800 rounded" />
            <div className="w-12 h-4 bg-slate-800 rounded" />
          </div>
          {/* Title */}
          <div className="w-3/4 h-5 bg-slate-700/70 rounded" />
          {/* Description line */}
          <div className="w-full h-3 bg-slate-800 rounded" />
          <div className="w-4/5 h-3 bg-slate-800 rounded" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="w-16 h-5 bg-slate-800 rounded" />
          <div className="w-14 h-4 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export default GameCardSkeleton;

