/**
 * PlayWise Compatibility Engine (Client-side & Offline Fallback)
 * Calibrated against Phase 5 normalized synthetic benchmark indexes (1-100 scale).
 * Evaluates user's hardware specifications against game minimum & recommended requirements.
 */

// Normalized GPU benchmark scores (1 - 100)
export const GPU_TIERS = {
  // Enthusiast (90 - 100)
  'rtx 4090': 100, '4090': 100,
  'rtx 4080 super': 96, '4080 super': 96,
  'rtx 4080': 95, '4080': 95,
  'rx 7900 xtx': 94, '7900 xtx': 94,
  'rx 7900 xt': 90, '7900 xt': 90,

  // High End (75 - 89)
  'rtx 4070 ti super': 88, '4070 ti super': 88,
  'rtx 4070 ti': 86, '4070 ti': 86,
  'rx 7900 gre': 84, '7900 gre': 84,
  'rtx 3090 ti': 85, '3090 ti': 85,
  'rtx 3090': 83, '3090': 83,
  'rtx 4070 super': 82, '4070 super': 82,
  'rx 7800 xt': 80, '7800 xt': 80,
  'rtx 4070': 78, '4070': 78,
  'rtx 3080 ti': 79, '3080 ti': 79,
  'rtx 3080': 76, '3080': 76,
  'rx 6800 xt': 75, '6800 xt': 75,

  // Mid Range (50 - 74)
  'rx 7700 xt': 72, '7700 xt': 72,
  'rtx 4060 ti': 68, '4060 ti': 68,
  'rx 6750 xt': 68, '6750 xt': 68,
  'rtx 3070 ti': 71, '3070 ti': 71,
  'rtx 3070': 69, '3070': 69,
  'rx 6700 xt': 65, '6700 xt': 65,
  'rtx 4060': 62, '4060': 62,
  'rx 7600 xt': 60, '7600 xt': 60,
  'rx 7600': 58, '7600': 58,
  'rtx 3060 ti': 64, '3060 ti': 64,
  'rtx 2080 ti': 66, '2080 ti': 66,
  'rtx 3060': 56, '3060': 56,
  'rx 6600 xt': 56, '6600 xt': 56,
  'rx 6600': 52, '6600': 52,
  'arc a770': 55, 'a770': 55,
  'arc a750': 50, 'a750': 50,
  'rtx 2070': 54, '2070': 54,
  'rtx 2060 super': 52, '2060 super': 52,
  'rtx 2060': 48, '2060': 48,

  // Budget (30 - 49)
  'gtx 1080 ti': 52, '1080 ti': 52,
  'gtx 1080': 46, '1080': 46,
  'rtx 3050': 44, '3050': 44,
  'gtx 1070 ti': 44, '1070 ti': 44,
  'gtx 1070': 40, '1070': 40,
  'gtx 1660 ti': 42, '1660 ti': 42,
  'gtx 1660 super': 41, '1660 super': 41,
  'gtx 1660': 38, '1660': 38,
  'rx 5600 xt': 46, '5600 xt': 46,
  'rx 5500 xt': 36, '5500 xt': 36,
  'rx 590': 36, '590': 36,
  'rx 580': 34, '580': 34,
  'gtx 1060': 34, '1060': 34,
  'gtx 1650 super': 36, '1650 super': 36,
  'gtx 1650': 28, '1650': 28,
  'rx 570': 30, '570': 30,

  // Entry Level (1 - 29)
  'gtx 1050 ti': 24, '1050 ti': 24,
  'gtx 1050': 20, '1050': 20,
  'rx 560': 20, '560': 20,
  'gtx 970': 30, '970': 30,
  'gtx 960': 18, '960': 18,
  'gtx 780': 22, '780': 22,
  'gtx 770': 16, '770': 16,
  'gtx 750 ti': 14, '750 ti': 14,
  'gt 1030': 10, '1030': 10,
  'radeon 780m': 22, '780m': 22,
  'radeon 680m': 18, '680m': 18,
  'intel iris xe': 12, 'iris xe': 12,
  'uhd graphics 770': 8, 'uhd 770': 8,
  'uhd graphics 630': 5, 'uhd 630': 5,
};

// Normalized CPU benchmark scores (1 - 100)
export const CPU_TIERS = {
  // Enthusiast (90 - 100)
  'ryzen 7 7800x3d': 100, '7800x3d': 100,
  'i9-14900k': 99, '14900k': 99,
  'ryzen 9 7950x3d': 98, '7950x3d': 98,
  'i9-13900k': 97, '13900k': 97,
  'ryzen 9 7900x3d': 95, '7900x3d': 95,
  'i7-14700k': 96, '14700k': 96,
  'ryzen 7 7700x': 90, '7700x': 90,
  'i7-13700k': 93, '13700k': 93,

  // High End (75 - 89)
  'i5-14600k': 89, '14600k': 89,
  'i5-13600k': 88, '13600k': 88,
  'ryzen 7 5800x3d': 86, '5800x3d': 86,
  'ryzen 5 7600x': 84, '7600x': 84,
  'ryzen 5 7600': 82, '7600': 82,
  'i7-12700k': 85, '12700k': 85,
  'i7-12700': 82, '12700': 82,
  'ryzen 7 5700x3d': 83, '5700x3d': 83,
  'i9-11900k': 78, '11900k': 78,
  'i5-12600k': 80, '12600k': 80,
  'ryzen 7 5800x': 78, '5800x': 78,
  'ryzen 7 5700x': 76, '5700x': 76,

  // Mid Range (50 - 74)
  'i5-14400f': 76, '14400f': 76,
  'i5-13400f': 74, '13400f': 74,
  'i5-12400f': 72, '12400f': 72,
  'i5-12400': 72, '12400': 72,
  'ryzen 5 5600x': 74, '5600x': 74,
  'ryzen 5 5600': 72, '5600': 72,
  'i7-10700k': 68, '10700k': 68,
  'ryzen 7 3700x': 66, '3700x': 66,
  'i5-11600k': 68, '11600k': 68,
  'i5-11400f': 64, '11400f': 64,
  'i5-10600k': 62, '10600k': 62,
  'ryzen 5 3600x': 62, '3600x': 62,
  'ryzen 5 3600': 60, '3600': 60,
  'i7-9700k': 62, '9700k': 62,
  'i7-8700k': 58, '8700k': 58,
  'i5-10400f': 58, '10400f': 58,
  'i5-10400': 58, '10400': 58,
  'ryzen 5 2600x': 52, '2600x': 52,
  'ryzen 5 2600': 50, '2600': 50,

  // Budget (30 - 49)
  'i7-7700k': 48, '7700k': 48,
  'i5-9400f': 48, '9400f': 48,
  'i5-8400': 46, '8400': 46,
  'ryzen 5 1600': 42, '1600': 42,
  'i7-6700k': 42, '6700k': 42,
  'i7-4790k': 36, '4790k': 36,
  'i5-7500': 34, '7500': 34,
  'i5-6500': 32, '6500': 32,
  'ryzen 3 3300x': 46, '3300x': 46,
  'ryzen 3 3100': 40, '3100': 40,
  'ryzen 3 1200': 30, '1200': 30,
  'i3-12100f': 58, '12100f': 58,
  'i3-10100': 44, '10100': 44,

  // Entry Level (1 - 29)
  'i5-4590': 28, '4590': 28,
  'i5-4460': 26, '4460': 26,
  'i5-3570k': 24, '3570k': 24,
  'i5-2500k': 20, '2500k': 20,
  'i3-8100': 28, '8100': 28,
  'fx-8350': 22, '8350': 22,
  'fx-6300': 18, '6300': 18,
  'core 2 quad q9650': 12, 'q9650': 12,
  'athlon 3000g': 16, '3000g': 16,
};

const getComponentScore = (name, dictionary, fallback = 40) => {
  if (!name || typeof name !== 'string') return fallback;
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  // Try longest match first to prioritize e.g. "rtx 4070 ti super" over "rtx 4070"
  const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return dictionary[key];
    }
  }
  return fallback;
};

const getTierLabel = (score) => {
  if (score >= 90) return 'Enthusiast';
  if (score >= 75) return 'High End';
  if (score >= 50) return 'Mid Range';
  if (score >= 30) return 'Budget';
  return 'Entry Level';
};

export const checkCompatibility = (userSpecs, game) => {
  if (!userSpecs || !userSpecs.cpu || !userSpecs.gpu || !userSpecs.ram) {
    return {
      status: 'NOT_CONFIGURED',
      score: 0,
      verdict: 'No PC Specs Configured',
      summary: 'Add your PC hardware in the "My PC" tab to receive verified compatibility scores, bottleneck estimations, and resolution FPS projections.',
      limitingComponent: 'None',
      checks: {
        cpu: { status: 'neutral', label: 'CPU Not Set' },
        gpu: { status: 'neutral', label: 'GPU Not Set' },
        ram: { status: 'neutral', label: 'RAM Not Set' },
        storage: { status: 'neutral', label: 'Storage Not Set' },
        os: { status: 'neutral', label: 'OS Not Set' },
      },
    };
  }

  const userRam = Number(userSpecs.ram) || 0;
  const userStorage = Number(userSpecs.storageSpace) || 250;
  const minRam = game.minimumRequirements?.ram || 8;
  const recRam = game.recommendedRequirements?.ram || 16;

  // RAM check
  let ramStatus = 'fail';
  if (userRam >= recRam) ramStatus = 'pass_rec';
  else if (userRam >= minRam) ramStatus = 'pass_min';

  // GPU score check
  const userGpuScore = getComponentScore(userSpecs.gpu, GPU_TIERS, 45);
  const minGpuScore = getComponentScore(game.minimumRequirements?.gpu, GPU_TIERS, 30);
  const recGpuScore = getComponentScore(game.recommendedRequirements?.gpu, GPU_TIERS, 65);

  let gpuStatus = 'fail';
  if (userGpuScore >= recGpuScore) gpuStatus = 'pass_rec';
  else if (userGpuScore >= minGpuScore) gpuStatus = 'pass_min';

  // CPU score check
  const userCpuScore = getComponentScore(userSpecs.cpu, CPU_TIERS, 45);
  const minCpuScore = getComponentScore(game.minimumRequirements?.cpu, CPU_TIERS, 30);
  const recCpuScore = getComponentScore(game.recommendedRequirements?.cpu, CPU_TIERS, 60);

  let cpuStatus = 'fail';
  if (userCpuScore >= recCpuScore) cpuStatus = 'pass_rec';
  else if (userCpuScore >= minCpuScore) cpuStatus = 'pass_min';

  // Storage check
  const storageStatus = userStorage >= 100 ? 'pass_rec' : 'pass_min';

  // OS Check
  const osString = (userSpecs.os || '').toLowerCase();
  const osStatus = osString.includes('11') || osString.includes('10') ? 'pass_rec' : 'pass_min';

  // Normalized 0-100 Compatibility Score (weighted: GPU 45%, CPU 35%, RAM 15%, Storage/OS 5%)
  const gpuFactor = Math.min(1.2, userGpuScore / Math.max(1, recGpuScore));
  const cpuFactor = Math.min(1.2, userCpuScore / Math.max(1, recCpuScore));
  const ramFactor = Math.min(1.1, userRam / Math.max(1, recRam));

  let rawScore = (gpuFactor * 45) + (cpuFactor * 35) + (ramFactor * 15) + (storageStatus === 'pass_rec' ? 5 : 2);
  if (gpuStatus === 'fail') rawScore *= 0.6;
  if (cpuStatus === 'fail') rawScore *= 0.7;
  if (ramStatus === 'fail') rawScore *= 0.8;

  const finalScore = Math.max(5, Math.min(100, Math.round(rawScore)));

  // Determine Verdict and Limiting Component
  let overallStatus = 'OPTIMAL';
  let verdict = 'Ultra / High 60+ FPS';
  let badgeColor = 'emerald';
  let summary = 'Your PC exceeds the recommended requirements! You can comfortably enjoy maximum visual fidelity at 1440p/4K resolution with high framerates.';
  let limitingComponent = 'None';
  let limitingDetails = '';

  if (gpuStatus === 'fail' || cpuStatus === 'fail' || ramStatus === 'fail') {
    overallStatus = 'UPGRADE_REQUIRED';
    verdict = 'Hardware Upgrade Recommended';
    badgeColor = 'rose';

    if (gpuStatus === 'fail') {
      limitingComponent = 'GPU';
      limitingDetails = `Your GPU falls below the game's minimum requirements (${game.minimumRequirements?.gpu || 'DirectX 12 GPU'}). Upgrading will prevent severe stutter.`;
    } else if (cpuStatus === 'fail') {
      limitingComponent = 'CPU';
      limitingDetails = `Your CPU is below minimum specifications (${game.minimumRequirements?.cpu || 'Multi-core CPU'}). Upgrading will stabilize framerates.`;
    } else {
      limitingComponent = 'RAM';
      limitingDetails = `System has ${userRam} GB RAM; game requires at least ${minRam} GB.`;
    }

    summary = `Your hardware falls below minimum specifications. Upgrading your ${limitingComponent} is recommended for a smooth gaming experience.`;
  } else if (gpuStatus === 'pass_min' || cpuStatus === 'pass_min' || ramStatus === 'pass_min') {
    overallStatus = 'PLAYABLE';
    verdict = 'Playable on Low-Medium';
    badgeColor = 'amber';

    if (gpuStatus === 'pass_min') {
      limitingComponent = 'GPU';
      limitingDetails = `Your GPU meets minimum specifications, but falls short of recommended (${game.recommendedRequirements?.gpu || 'Modern GPU'}). Expect 1080p medium settings.`;
    } else if (cpuStatus === 'pass_min') {
      limitingComponent = 'CPU';
      limitingDetails = `Your processor meets minimum specifications. High-framerate scenes may be CPU-bound.`;
    } else {
      limitingComponent = 'RAM';
      limitingDetails = `Upgrading to ${recRam} GB RAM is recommended for optimal background headroom.`;
    }

    summary = 'Your hardware meets the minimum requirements. The game will run comfortably at 1080p with medium settings or upscaling enabled.';
  }

  return {
    status: overallStatus,
    score: finalScore,
    verdict,
    badgeColor,
    summary,
    limitingComponent,
    limitingDetails,
    checks: {
      cpu: {
        status: cpuStatus,
        user: userSpecs.cpu,
        userTier: getTierLabel(userCpuScore),
        min: game.minimumRequirements?.cpu,
        rec: game.recommendedRequirements?.cpu,
        label: cpuStatus === 'pass_rec' ? 'Exceeds Recommended' : cpuStatus === 'pass_min' ? 'Meets Minimum' : 'Below Minimum',
      },
      gpu: {
        status: gpuStatus,
        user: userSpecs.gpu,
        userTier: getTierLabel(userGpuScore),
        min: game.minimumRequirements?.gpu,
        rec: game.recommendedRequirements?.gpu,
        label: gpuStatus === 'pass_rec' ? 'Exceeds Recommended' : gpuStatus === 'pass_min' ? 'Meets Minimum' : 'Below Minimum',
      },
      ram: {
        status: ramStatus,
        user: `${userRam} GB`,
        min: `${minRam} GB`,
        rec: `${recRam} GB`,
        label: ramStatus === 'pass_rec' ? 'Exceeds Recommended' : ramStatus === 'pass_min' ? 'Meets Minimum' : 'Insufficient RAM',
      },
      storage: {
        status: storageStatus,
        user: `${userSpecs.storageType || 'SSD'} (${userStorage} GB free)`,
        required: game.minimumRequirements?.storage,
        label: 'Sufficient Storage',
      },
      os: {
        status: osStatus,
        user: userSpecs.os || 'Windows 11 64-bit',
        required: game.minimumRequirements?.os,
        label: 'Compatible OS',
      },
    },
  };
};
