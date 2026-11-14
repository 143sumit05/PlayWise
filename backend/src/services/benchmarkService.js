import BenchmarkCPU from '../models/BenchmarkCPU.js';
import BenchmarkGPU from '../models/BenchmarkGPU.js';
import { BENCHMARK_CPUS, BENCHMARK_GPUS } from '../data/benchmarkData.js';

// Tier definitions with performance boundaries and descriptive labels
export const HARDWARE_TIERS = {
  Enthusiast: {
    tier: 'Enthusiast',
    minScore: 90,
    maxScore: 100,
    badgeColor: 'purple',
    description: 'Uncompromising Ultra 4K 120+ FPS & high-refresh gaming',
    targetResolution: '4K (2160p) & 1440p Ultrawide',
  },
  'High End': {
    tier: 'High End',
    minScore: 75,
    maxScore: 89,
    badgeColor: 'emerald',
    description: 'Flawless 1440p Ultra 100+ FPS / Entry 4K 60 FPS gaming',
    targetResolution: '1440p (QHD) & High-Refresh 1080p',
  },
  'Mid Range': {
    tier: 'Mid Range',
    minScore: 50,
    maxScore: 74,
    badgeColor: 'cyan',
    description: 'Solid 1080p Ultra 60-120 FPS / Balanced 1440p gaming',
    targetResolution: '1080p (FHD) Ultra / 1440p Medium',
  },
  Budget: {
    tier: 'Budget',
    minScore: 30,
    maxScore: 49,
    badgeColor: 'amber',
    description: 'Playable 1080p 45-60 FPS on Medium/Low settings',
    targetResolution: '1080p (FHD) Low-Medium',
  },
  'Entry Level': {
    tier: 'Entry Level',
    minScore: 1,
    maxScore: 29,
    badgeColor: 'rose',
    description: 'Casual, legacy, 720p/1080p Low, or competitive eSports',
    targetResolution: '720p / 1080p Low / eSports',
  },
};

/**
 * Normalizes hardware strings for token comparison
 */
const normalizeString = (str = '') => {
  return str
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[&]/g, 'and')
    .replace(/[\:–—\-_,!?#()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extracts identifying numeric tokens from hardware model names
 */
const extractNumbers = (str = '') => {
  const norm = normalizeString(str)
    .replace(/([a-z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)([a-z]+)/g, '$1 $2');
  return new Set(norm.split(' ').filter((w) => /^\d+$/.test(w)));
};

export const benchmarkService = {
  /**
   * Classify performance tier by benchmark score
   */
  classifyTier: (score = 50) => {
    const s = Math.max(1, Math.min(100, Number(score) || 50));
    if (s >= 90) return 'Enthusiast';
    if (s >= 75) return 'High End';
    if (s >= 50) return 'Mid Range';
    if (s >= 30) return 'Budget';
    return 'Entry Level';
  },

  /**
   * Returns metadata and definitions for all hardware performance tiers
   */
  getTiers: () => {
    return HARDWARE_TIERS;
  },

  /**
   * Search hardware by name or alias
   */
  searchHardware: async (query = '', type = 'all', limit = 10) => {
    const clean = normalizeString(query);
    if (!clean) return { cpus: [], gpus: [] };

    const regex = new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const results = { cpus: [], gpus: [] };

    if (type === 'all' || type === 'cpu') {
      try {
        const dbCpus = await BenchmarkCPU.find({
          $or: [{ name: regex }, { aliases: regex }, { series: regex }],
        })
          .limit(limit)
          .lean();
        results.cpus = dbCpus;
      } catch (err) {
        // Fallback to static dataset if DB is unreachable
        results.cpus = BENCHMARK_CPUS.filter(
          (c) =>
            regex.test(c.name) ||
            c.aliases.some((a) => regex.test(a)) ||
            (c.series && regex.test(c.series))
        ).slice(0, limit);
      }
    }

    if (type === 'all' || type === 'gpu') {
      try {
        const dbGpus = await BenchmarkGPU.find({
          $or: [{ name: regex }, { aliases: regex }, { series: regex }],
        })
          .limit(limit)
          .lean();
        results.gpus = dbGpus;
      } catch (err) {
        results.gpus = BENCHMARK_GPUS.filter(
          (g) =>
            regex.test(g.name) ||
            g.aliases.some((a) => regex.test(a)) ||
            (g.series && regex.test(g.series))
        ).slice(0, limit);
      }
    }

    return results;
  },

  /**
   * Intelligent fuzzy matching to map arbitrary user hardware strings
   * (e.g. "Intel(R) Core(TM) i7-13700K CPU @ 3.40GHz", "NVIDIA GeForce RTX 4070 12GB")
   * to a verified benchmark profile.
   */
  matchHardware: async (rawName = '', type = 'gpu') => {
    if (!rawName || typeof rawName !== 'string') {
      return {
        matched: false,
        name: rawName || 'Unknown Component',
        benchmarkScore: 40,
        tier: 'Budget',
        confidence: 0,
        isEstimate: true,
        disclaimer: 'Hardware component string was empty or invalid.',
      };
    }

    const normTarget = normalizeString(rawName);
    const targetNums = extractNumbers(normTarget);
    const isCpu = type.toLowerCase() === 'cpu';

    // Get catalog from DB or fallback
    let catalog = [];
    try {
      catalog = isCpu
        ? await BenchmarkCPU.find().lean()
        : await BenchmarkGPU.find().lean();
      if (!catalog || catalog.length === 0) {
        catalog = isCpu ? BENCHMARK_CPUS : BENCHMARK_GPUS;
      }
    } catch (err) {
      catalog = isCpu ? BENCHMARK_CPUS : BENCHMARK_GPUS;
    }

    let bestMatch = null;
    let highestScore = -1;

    for (const item of catalog) {
      const normName = normalizeString(item.name);
      const aliases = (item.aliases || []).map((a) => normalizeString(a));

      // Rule 1: Exact alias or name match (Score: 1.0)
      if (normTarget === normName || aliases.includes(normTarget)) {
        return {
          matched: true,
          profile: item,
          name: item.name,
          benchmarkScore: item.benchmarkScore,
          tier: item.tier,
          vram: item.vram,
          confidence: 1.0,
          matchType: 'exact',
          isEstimate: false,
        };
      }

      // Rule 2: Check if target contains an alias as a full word or phrase
      for (const alias of aliases) {
        if (alias.length >= 3 && normTarget.includes(alias)) {
          const score = 0.95;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = { item, confidence: score, matchType: 'alias_contains' };
          }
        }
      }

      // Rule 3: Check identifying numbers (e.g. 4070, 13700, 3600, 7800)
      const itemNums = extractNumbers(normName);
      if (targetNums.size > 0 && itemNums.size > 0) {
        let sharesNumber = false;
        for (const num of targetNums) {
          if (itemNums.has(num)) {
            sharesNumber = true;
            break;
          }
        }

        if (sharesNumber) {
          // Check suffix modifiers like 'ti', 'super', 'xt', 'x3d', 'k', 'f'
          const hasTi = normTarget.includes('ti') === normName.includes('ti');
          const hasSuper = normTarget.includes('super') === normName.includes('super');
          const hasXT = normTarget.includes('xt') === normName.includes('xt');
          const hasX3D = normTarget.includes('x3d') === normName.includes('x3d');

          let score = 0.85;
          if (hasTi && hasSuper && hasXT && hasX3D) score = 0.92;

          if (score > highestScore) {
            highestScore = score;
            bestMatch = { item, confidence: score, matchType: 'number_and_suffix' };
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence >= 0.7) {
      return {
        matched: true,
        profile: bestMatch.item,
        name: bestMatch.item.name,
        benchmarkScore: bestMatch.item.benchmarkScore,
        tier: bestMatch.item.tier,
        vram: bestMatch.item.vram,
        confidence: bestMatch.confidence,
        matchType: bestMatch.matchType,
        isEstimate: false,
      };
    }

    // Heuristic Fallback for uncatalogued or niche hardware
    // Approximate benchmark score & tier based on brand/keywords
    let estimatedScore = 40;
    let estimatedTier = 'Budget';
    let estimatedVram = 6;

    if (normTarget.includes('rtx 40') || normTarget.includes('rx 79') || normTarget.includes('i9 14') || normTarget.includes('7800x3d')) {
      estimatedScore = 88;
      estimatedTier = 'High End';
      estimatedVram = 12;
    } else if (normTarget.includes('rtx 30') || normTarget.includes('rx 67') || normTarget.includes('i7') || normTarget.includes('ryzen 7')) {
      estimatedScore = 65;
      estimatedTier = 'Mid Range';
      estimatedVram = 8;
    } else if (normTarget.includes('gtx 16') || normTarget.includes('rx 58') || normTarget.includes('i5') || normTarget.includes('ryzen 5')) {
      estimatedScore = 45;
      estimatedTier = 'Budget';
      estimatedVram = 6;
    } else if (normTarget.includes('gtx 10') || normTarget.includes('gtx 9') || normTarget.includes('uhd') || normTarget.includes('iris') || normTarget.includes('i3')) {
      estimatedScore = 22;
      estimatedTier = 'Entry Level';
      estimatedVram = 4;
    }

    return {
      matched: false,
      name: rawName,
      benchmarkScore: estimatedScore,
      tier: estimatedTier,
      vram: isCpu ? undefined : estimatedVram,
      confidence: 0.45,
      matchType: 'heuristic_estimate',
      isEstimate: true,
      disclaimer: `No exact benchmark entry for "${rawName}". Estimated relative score based on hardware generation heuristics.`,
    };
  },

  /**
   * Fetch complete hardware benchmark catalog (for frontend select / search autocomplete)
   */
  getCatalog: async (type = 'all') => {
    let cpus = [];
    let gpus = [];

    if (type === 'all' || type === 'cpu') {
      try {
        cpus = await BenchmarkCPU.find({}, 'name brand series tier benchmarkScore cores threads baseClock releaseYear')
          .sort({ benchmarkScore: -1 })
          .lean();
      } catch (e) {
        cpus = BENCHMARK_CPUS;
      }
    }

    if (type === 'all' || type === 'gpu') {
      try {
        gpus = await BenchmarkGPU.find({}, 'name brand series tier benchmarkScore vram vramType releaseYear')
          .sort({ benchmarkScore: -1 })
          .lean();
      } catch (e) {
        gpus = BENCHMARK_GPUS;
      }
    }

    return { cpus, gpus, tiers: HARDWARE_TIERS };
  },
};

export default benchmarkService;
