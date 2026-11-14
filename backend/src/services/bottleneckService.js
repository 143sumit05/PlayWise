import { benchmarkService } from './benchmarkService.js';

export const bottleneckService = {
  /**
   * Calculate approximate hardware bottleneck between CPU and GPU
   * Factors in resolution dynamics:
   * - 1080p: CPU load is higher (higher framerates demand fast draw-calls).
   * - 1440p: Balanced load between CPU and GPU.
   * - 4K (2160p): Heavily GPU-bound (graphics pipeline saturates before CPU).
   *
   * @param {Object} cpuInput - Matched CPU benchmark profile or user string
   * @param {Object} gpuInput - Matched GPU benchmark profile or user string
   * @param {string} resolution - '1080p' | '1440p' | '4k'
   */
  calculateBottleneck: async (cpuInput, gpuInput, resolution = '1080p') => {
    // 1. Resolve CPU & GPU benchmark profiles if raw strings were supplied
    const cpu = typeof cpuInput === 'string'
      ? await benchmarkService.matchHardware(cpuInput, 'cpu')
      : cpuInput;

    const gpu = typeof gpuInput === 'string'
      ? await benchmarkService.matchHardware(gpuInput, 'gpu')
      : gpuInput;

    if (!cpu || !gpu || !cpu.benchmarkScore || !gpu.benchmarkScore) {
      return {
        available: false,
        bottleneckPercentage: 0,
        bottleneckComponent: 'None',
        balanceRating: 'Unknown',
        summary: 'Both CPU and GPU must be specified to calculate hardware balance.',
        disclaimer: 'Hardware specifications required.',
      };
    }

    const cpuScore = cpu.benchmarkScore;
    const gpuScore = gpu.benchmarkScore;

    // Weight factors by resolution
    // Higher resolution naturally shifts computational demand to the GPU
    const resolutionMultipliers = {
      '720p': { cpuWeight: 1.1, gpuWeight: 0.95 },
      '1080p': { cpuWeight: 1.0, gpuWeight: 1.0 },
      '1440p': { cpuWeight: 0.95, gpuWeight: 1.1 },
      '4k': { cpuWeight: 0.85, gpuWeight: 1.25 },
    };

    const targetRes = resolution.toLowerCase();
    const mult = resolutionMultipliers[targetRes] || resolutionMultipliers['1080p'];

    const effectiveCpuScore = cpuScore * mult.cpuWeight;
    const effectiveGpuScore = gpuScore * mult.gpuWeight;

    const delta = Math.abs(effectiveCpuScore - effectiveGpuScore);
    const maxScore = Math.max(effectiveCpuScore, effectiveGpuScore);

    // Calculate approximate bottleneck percentage (0% to 50%)
    const rawPercentage = Math.round((delta / maxScore) * 100);
    const bottleneckPercentage = Math.min(50, Math.max(0, rawPercentage));

    let bottleneckComponent = 'Balanced';
    let balanceRating = 'Great Balance';
    let badgeColor = 'emerald';
    let summary = `Your CPU (${cpu.name}) and GPU (${gpu.name}) are well matched for ${resolution} gaming. Neither component creates a significant bottleneck.`;

    if (bottleneckPercentage > 20) {
      if (effectiveCpuScore < effectiveGpuScore) {
        bottleneckComponent = 'CPU';
        balanceRating = bottleneckPercentage > 35 ? 'Severe CPU Bottleneck' : 'Moderate CPU Bottleneck';
        badgeColor = bottleneckPercentage > 35 ? 'rose' : 'amber';
        summary = `Your processor (${cpu.name}) is slower relative to your graphics card (${gpu.name}) at ${resolution}. In fast-paced or CPU-heavy titles, your GPU may not reach 100% utilization.`;
      } else {
        bottleneckComponent = 'GPU';
        balanceRating = bottleneckPercentage > 35 ? 'Heavy GPU Bound' : 'Moderate GPU Bound';
        badgeColor = bottleneckPercentage > 35 ? 'rose' : 'amber';
        summary = `Your graphics card (${gpu.name}) is the primary performance limiter relative to your CPU (${cpu.name}). This is typical for graphics-intensive gaming.`;
      }
    }

    // Deliver multi-resolution comparison
    const resolutionBreakdown = {};
    for (const res of ['1080p', '1440p', '4k']) {
      const rm = resolutionMultipliers[res];
      const effCpu = cpuScore * rm.cpuWeight;
      const effGpu = gpuScore * rm.gpuWeight;
      const diff = Math.abs(effCpu - effGpu);
      const pct = Math.min(50, Math.round((diff / Math.max(effCpu, effGpu)) * 100));
      const comp = pct <= 20 ? 'Balanced' : effCpu < effGpu ? 'CPU Bottleneck' : 'GPU Bound';
      resolutionBreakdown[res] = {
        bottleneckPercentage: pct,
        bottleneckComponent: comp,
        isOptimal: pct <= 20,
      };
    }

    return {
      available: true,
      bottleneckPercentage,
      bottleneckComponent,
      balanceRating,
      badgeColor,
      summary,
      cpu: {
        name: cpu.name,
        score: cpuScore,
        tier: cpu.tier,
      },
      gpu: {
        name: gpu.name,
        score: gpuScore,
        tier: gpu.tier,
      },
      resolution: targetRes,
      resolutionBreakdown,
      disclaimer: 'Bottleneck estimates are approximate and based on normalized synthetic performance ratios. Real-world utilization depends on game engine optimization, background tasks, and thermal conditions.',
    };
  },

  /**
   * Project approximate resolution-based FPS (720p, 1080p, 1440p, 4K)
   * across graphic presets (Low, Medium, High, Ultra)
   *
   * @param {Object} userSpecs - User rig specifications
   * @param {Object} game - Game system requirements
   */
  projectFPS: async (userSpecs, gameReqs = {}) => {
    if (!userSpecs || !userSpecs.gpu || !userSpecs.cpu) {
      return {
        available: false,
        message: 'User PC specifications required to project framerates.',
      };
    }

    const userGpuMatch = await benchmarkService.matchHardware(userSpecs.gpu, 'gpu');
    const userCpuMatch = await benchmarkService.matchHardware(userSpecs.cpu, 'cpu');

    const recGpuString = gameReqs?.recommendedRequirements?.gpu || gameReqs?.gpu || 'NVIDIA GeForce RTX 3060';
    const recCpuString = gameReqs?.recommendedRequirements?.cpu || gameReqs?.cpu || 'Intel Core i7-10700K';

    const recGpuMatch = await benchmarkService.matchHardware(recGpuString, 'gpu');
    const recCpuMatch = await benchmarkService.matchHardware(recCpuString, 'cpu');

    const userGpuScore = userGpuMatch.benchmarkScore || 50;
    const userCpuScore = userCpuMatch.benchmarkScore || 50;
    const recGpuScore = recGpuMatch.benchmarkScore || 65;
    const recCpuScore = recCpuMatch.benchmarkScore || 60;
    const userVram = userGpuMatch.vram || 6;

    // Baseline calculation: Recommended specs target ~60 FPS at 1080p High
    // Hardware ratio determines the FPS multiplier
    const gpuRatio = userGpuScore / Math.max(1, recGpuScore);
    const cpuRatio = userCpuScore / Math.max(1, recCpuScore);

    // Primary driver is GPU (75%), secondary is CPU (25%)
    const performanceFactor = (gpuRatio * 0.75) + (cpuRatio * 0.25);

    // Resolution scaling multipliers relative to 1080p
    const resScale = {
      '720p': 1.45,
      '1080p': 1.0,
      '1440p': 0.68,
      '4k': 0.38,
    };

    // Preset multipliers relative to High
    const presetScale = {
      Low: 1.4,
      Medium: 1.18,
      High: 1.0,
      Ultra: 0.82,
    };

    // Base target: Recommended GPU produces ~65 FPS at 1080p High
    const base1080pHighFPS = 65 * performanceFactor;

    const projections = {};

    for (const [res, rMult] of Object.entries(resScale)) {
      projections[res] = {};

      // VRAM limitation penalty at higher resolutions
      let vramPenalty = 1.0;
      if (res === '1440p' && userVram < 6) vramPenalty = 0.75;
      if (res === '4k') {
        if (userVram < 8) vramPenalty = 0.45;
        else if (userVram < 12) vramPenalty = 0.78;
      }

      for (const [preset, pMult] of Object.entries(presetScale)) {
        let estimatedFPS = Math.round(base1080pHighFPS * rMult * pMult * vramPenalty);

        // Cap lower/upper boundaries reasonably
        estimatedFPS = Math.max(12, Math.min(240, estimatedFPS));

        // Rating tier based on FPS
        let rating = 'Playable';
        let badgeColor = 'amber';
        if (estimatedFPS >= 100) {
          rating = 'High Refresh';
          badgeColor = 'purple';
        } else if (estimatedFPS >= 60) {
          rating = 'Smooth 60+';
          badgeColor = 'emerald';
        } else if (estimatedFPS >= 30) {
          rating = 'Playable';
          badgeColor = 'amber';
        } else {
          rating = 'Stutter Warning';
          badgeColor = 'rose';
        }

        projections[res][preset] = {
          fps: estimatedFPS,
          rating,
          badgeColor,
        };
      }
    }

    // Recommended optimal resolution & preset for user's rig
    let recommendedSetting = '1080p Medium';
    if (projections['4k']?.High?.fps >= 60) recommendedSetting = '4K High';
    else if (projections['1440p']?.High?.fps >= 60) recommendedSetting = '1440p High';
    else if (projections['1080p']?.High?.fps >= 60) recommendedSetting = '1080p High';
    else if (projections['1080p']?.Medium?.fps >= 45) recommendedSetting = '1080p Medium';
    else if (projections['1080p']?.Low?.fps >= 30) recommendedSetting = '1080p Low';
    else recommendedSetting = '720p Low (or Upscaling Enabled)';

    return {
      available: true,
      recommendedSetting,
      projections,
      gpu: userGpuMatch.name,
      cpu: userCpuMatch.name,
      vram: `${userVram} GB`,
      disclaimer: 'Framerate projections are estimates calculated from normalized synthetic benchmark scores. Real-world performance depends on graphics drivers, resolution scaling technologies (DLSS/FSR/XeSS), and individual game scenes.',
    };
  },
};

export default bottleneckService;
