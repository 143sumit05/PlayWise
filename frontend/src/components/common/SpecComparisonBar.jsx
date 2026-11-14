import React, { useState } from 'react';
import {
  IconShieldCheck,
  IconAlertCircle,
  IconCheck,
  IconCpu,
  IconGauge,
  IconMonitor,
  IconZap,
} from './Icons.jsx';

export const SpecComparisonBar = ({ compatibility }) => {
  const [activeFpsPreset, setActiveFpsPreset] = useState('High'); // 'Low' | 'Medium' | 'High' | 'Ultra'

  if (!compatibility || compatibility.status === 'NOT_CONFIGURED') {
    return (
      <div className="bg-[#0f1422] border border-cyan-500/20 rounded-2xl p-6 text-center">
        <IconAlertCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <h4 className="text-white font-bold text-lg mb-1">Set Your PC Hardware Specs</h4>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
          Configure your CPU, GPU, and RAM in the "My PC" tab to see real-time compatibility checks, FPS estimates, and bottleneck analysis for this game.
        </p>
        <a
          href="/my-pc"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold text-sm hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
        >
          Configure My PC &rarr;
        </a>
      </div>
    );
  }

  const {
    status = 'OPTIMAL',
    score = 85,
    verdict = 'Optimal Performance',
    summary = '',
    limitingComponent = 'None',
    limitingDetails = '',
    checks = {},
    bottleneck = null,
    fpsEstimates = null,
    upgradeSuggestions = [],
    disclaimer = '',
  } = compatibility;

  const badgeColorClass =
    status === 'OPTIMAL'
      ? {
          glow: 'bg-emerald-500',
          badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        }
      : status === 'PLAYABLE'
      ? {
          glow: 'bg-amber-500',
          badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
        }
      : {
          glow: 'bg-rose-500',
          badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
        };

  return (
    <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-6">
      {/* Background Accent Glow */}
      <div
        className={`absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${badgeColorClass.glow}`}
      />

      {/* 1. HEADER VERDICT & COMPATIBILITY GAUGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-start sm:items-center gap-4">
          {/* Circular Score Badge */}
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg ${
              status === 'OPTIMAL'
                ? 'bg-emerald-950/60 border-2 border-emerald-500/50 text-emerald-300'
                : status === 'PLAYABLE'
                ? 'bg-amber-950/60 border-2 border-amber-500/50 text-amber-300'
                : 'bg-rose-950/60 border-2 border-rose-500/50 text-rose-300'
            }`}
          >
            <span className="text-xl font-black leading-none">{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Compatibility Rating
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badgeColorClass.badge}`}>
                {status.replace('_', ' ')}
              </span>
              {limitingComponent && limitingComponent !== 'None' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                  Limited by {limitingComponent}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
              {verdict}
            </h3>
          </div>
        </div>

        <a
          href="/my-pc"
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 self-start sm:self-auto hover:underline"
        >
          Change Rig Specs &rarr;
        </a>
      </div>

      {/* 2. SUMMARY & LIMITING COMPONENT NOTIFICATION */}
      <div className="space-y-3">
        <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
        {limitingDetails && limitingComponent !== 'None' && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-200">
            <IconAlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Primary Bottleneck Detected:</strong>
              {limitingDetails}
            </div>
          </div>
        )}
      </div>

      {/* 3. HARDWARE COMPONENT BREAKDOWN GRID */}
      {checks && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* GPU */}
          {checks.gpu && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <IconGauge className="w-3.5 h-3.5 text-cyan-400" />
                    GPU
                  </span>
                  <span
                    className={`font-semibold text-[11px] ${
                      checks.gpu.status === 'pass_rec'
                        ? 'text-emerald-400'
                        : checks.gpu.status === 'pass_min'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {checks.gpu.label}
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate" title={checks.gpu.user}>
                  {checks.gpu.user}
                </div>
                {checks.gpu.userTier && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300">
                    Tier: {checks.gpu.userTier}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 truncate pt-2 border-t border-white/5">
                Target: {checks.gpu.rec || checks.gpu.min}
              </div>
            </div>
          )}

          {/* CPU */}
          {checks.cpu && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <IconCpu className="w-3.5 h-3.5 text-purple-400" />
                    CPU
                  </span>
                  <span
                    className={`font-semibold text-[11px] ${
                      checks.cpu.status === 'pass_rec'
                        ? 'text-emerald-400'
                        : checks.cpu.status === 'pass_min'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {checks.cpu.label}
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate" title={checks.cpu.user}>
                  {checks.cpu.user}
                </div>
                {checks.cpu.userTier && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300">
                    Tier: {checks.cpu.userTier}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 truncate pt-2 border-t border-white/5">
                Target: {checks.cpu.rec || checks.cpu.min}
              </div>
            </div>
          )}

          {/* RAM & Storage */}
          {checks.ram && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <IconZap className="w-3.5 h-3.5 text-amber-400" />
                    Memory & Storage
                  </span>
                  <span
                    className={`font-semibold text-[11px] ${
                      checks.ram.status === 'pass_rec'
                        ? 'text-emerald-400'
                        : checks.ram.status === 'pass_min'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {checks.ram.label}
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {checks.ram.user} RAM
                </div>
                {checks.storage && (
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {checks.storage.user}
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 truncate pt-2 border-t border-white/5">
                Rec: {checks.ram.rec} (Min: {checks.ram.min})
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTLENECK ANALYSIS CARD */}
      {bottleneck && bottleneck.available && (
        <div className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <IconMonitor className="w-4 h-4" />
                Hardware Balance & Bottleneck
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  bottleneck.balanceRating === 'Great Balance'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : bottleneck.balanceRating === 'Moderate Bottleneck'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                }`}
              >
                {bottleneck.balanceRating} ({bottleneck.bottleneckPercentage}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Primary: <strong className="text-white">{bottleneck.bottleneckComponent}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {bottleneck.summary}
          </p>

          {/* Resolution Dynamics Breakdown */}
          {bottleneck.resolutionImpact && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
              <div className="p-2.5 rounded-lg bg-black/30 text-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">1080p FHD</span>
                <span className="text-white text-[11px] font-semibold">{bottleneck.resolutionImpact['1080p']?.characteristic}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 text-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">1440p QHD</span>
                <span className="text-white text-[11px] font-semibold">{bottleneck.resolutionImpact['1440p']?.characteristic}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 text-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">4K UHD</span>
                <span className="text-white text-[11px] font-semibold">{bottleneck.resolutionImpact['4k']?.characteristic}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. RESOLUTION-BASED FPS PROJECTIONS */}
      {fpsEstimates && fpsEstimates.available && fpsEstimates.projections && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <IconZap className="w-4 h-4 text-cyan-400" />
                Resolution-Based Framerate Projections
              </h4>
              <p className="text-xs text-slate-400">
                Recommended Setting:{' '}
                <strong className="text-cyan-300">{fpsEstimates.recommendedSetting}</strong>
              </p>
            </div>

            {/* Quality Preset Tabs */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {['Low', 'Medium', 'High', 'Ultra'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setActiveFpsPreset(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFpsPreset === preset
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Matrix Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['720p', '1080p', '1440p', '4k'].map((resKey) => {
              const resData = fpsEstimates.projections[resKey]?.[activeFpsPreset];
              const fps = resData?.fps || 0;
              const rating = resData?.rating || 'Unrated';
              const isRecommended =
                fpsEstimates.recommendedSetting.toLowerCase().includes(resKey) &&
                fpsEstimates.recommendedSetting.toLowerCase().includes(activeFpsPreset.toLowerCase());

              return (
                <div
                  key={resKey}
                  className={`p-3.5 rounded-xl border transition-all text-center relative ${
                    isRecommended
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'bg-black/30 border-white/5'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500 text-black">
                      Sweet Spot
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {resKey === '4k' ? '4K UHD' : resKey.toUpperCase()}
                  </span>
                  <div className="text-2xl font-black text-white">
                    {fps} <span className="text-xs font-bold text-slate-400">FPS</span>
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      fps >= 60
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : fps >= 40
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                        : fps >= 30
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {rating}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mandatory Synthetic Benchmark Disclaimer */}
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            * {fpsEstimates.disclaimer || 'Framerate projections and bottleneck percentages are approximate calculations from normalized synthetic benchmarks and recommended system requirements. Actual in-game framerates vary based on driver versions, graphics settings, background processes, and individual scenes.'}
          </p>
        </div>
      )}

      {/* 6. UPGRADE SUGGESTIONS */}
      {upgradeSuggestions && upgradeSuggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <IconAlertCircle className="w-4 h-4 text-amber-400" />
            Recommended Upgrade Path for This Game
          </h4>
          <div className="space-y-2">
            {upgradeSuggestions.map((sug, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {sug.priority} Priority: Upgrade {sug.component}
                  </span>
                  <span>{sug.reason}</span>
                </div>
                <div className="text-[11px] text-right shrink-0">
                  <span className="text-slate-400">Target: </span>
                  <strong className="text-white">{sug.recommended}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecComparisonBar;
