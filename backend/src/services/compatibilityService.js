import { benchmarkService } from './benchmarkService.js';
import { rawgService } from './rawgService.js';
import { bottleneckService } from './bottleneckService.js';

export const compatibilityService = {
  /**
   * Evaluate a user's PC hardware configuration against a game's system requirements
   */
  evaluateCompatibility: async (userSpecs, gameInput) => {
    // 1. Validate user specifications
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
        upgradeSuggestions: [],
        disclaimer: 'Configure your PC specifications to generate live compatibility analytics.',
      };
    }

    // 2. Resolve game requirements if gameId/slug passed instead of object
    let game = gameInput;
    if (typeof gameInput === 'string' || typeof gameInput === 'number') {
      try {
        game = await rawgService.getGameDetails(gameInput);
      } catch (err) {
        console.warn('[Compatibility] Failed to fetch game details from RAWG:', err.message);
      }
    }

    const minReq = game?.minimumRequirements || {
      cpu: 'Intel Core i5-8400 or AMD Ryzen 5 2600',
      gpu: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580',
      ram: 8,
      vram: 4,
      storage: '80 GB Space',
      os: 'Windows 10 64-bit',
    };

    const recReq = game?.recommendedRequirements || {
      cpu: 'Intel Core i7-10700K or AMD Ryzen 7 3700X',
      gpu: 'NVIDIA GeForce RTX 3060 12GB or AMD Radeon RX 6700 XT',
      ram: 16,
      vram: 8,
      storage: '80 GB SSD',
      os: 'Windows 11 / 10 64-bit',
    };

    // 3. Resolve user hardware benchmark matches
    const userGpuMatch = await benchmarkService.matchHardware(userSpecs.gpu, 'gpu');
    const userCpuMatch = await benchmarkService.matchHardware(userSpecs.cpu, 'cpu');

    // 4. Resolve min & rec hardware benchmark matches
    const minGpuMatch = await benchmarkService.matchHardware(minReq.gpu, 'gpu');
    const recGpuMatch = await benchmarkService.matchHardware(recReq.gpu, 'gpu');

    const minCpuMatch = await benchmarkService.matchHardware(minReq.cpu, 'cpu');
    const recCpuMatch = await benchmarkService.matchHardware(recReq.cpu, 'cpu');

    // 5. Evaluate GPU component
    const userGpuScore = userGpuMatch.benchmarkScore;
    const minGpuScore = minGpuMatch.benchmarkScore;
    const recGpuScore = recGpuMatch.benchmarkScore;

    let gpuStatus = 'fail';
    let gpuLabel = 'Below Minimum';
    if (userGpuScore >= recGpuScore) {
      gpuStatus = 'pass_rec';
      gpuLabel = 'Exceeds Recommended';
    } else if (userGpuScore >= minGpuScore) {
      gpuStatus = 'pass_min';
      gpuLabel = 'Meets Minimum';
    }

    // 6. Evaluate CPU component
    const userCpuScore = userCpuMatch.benchmarkScore;
    const minCpuScore = minCpuMatch.benchmarkScore;
    const recCpuScore = recCpuMatch.benchmarkScore;

    let cpuStatus = 'fail';
    let cpuLabel = 'Below Minimum';
    if (userCpuScore >= recCpuScore) {
      cpuStatus = 'pass_rec';
      cpuLabel = 'Exceeds Recommended';
    } else if (userCpuScore >= minCpuScore) {
      cpuStatus = 'pass_min';
      cpuLabel = 'Meets Minimum';
    }

    // 7. Evaluate RAM component
    const userRam = Number(userSpecs.ram) || 0;
    const minRam = Number(minReq.ram) || 8;
    const recRam = Number(recReq.ram) || 16;

    let ramStatus = 'fail';
    let ramLabel = 'Insufficient RAM';
    if (userRam >= recRam) {
      ramStatus = 'pass_rec';
      ramLabel = 'Exceeds Recommended';
    } else if (userRam >= minRam) {
      ramStatus = 'pass_min';
      ramLabel = 'Meets Minimum';
    }

    // 8. Evaluate Storage & OS
    const userStorage = Number(userSpecs.storage || userSpecs.storageSpace) || 250;
    const storageType = userSpecs.storageType || 'NVMe SSD';
    const isSSD = storageType.includes('SSD');
    const storageStatus = userStorage >= 100 && isSSD ? 'pass_rec' : userStorage >= 50 ? 'pass_min' : 'fail';
    const storageLabel = storageStatus === 'pass_rec' ? 'Fast SSD & Adequate Space' : storageStatus === 'pass_min' ? 'Meets Storage Capacity' : 'Low Free Storage Space';

    const osString = (userSpecs.operatingSystem || userSpecs.os || '').toLowerCase();
    const osStatus = osString.includes('11') || osString.includes('10') ? 'pass_rec' : 'pass_min';
    const osLabel = osStatus === 'pass_rec' ? 'Modern 64-bit OS' : 'Compatible OS';

    // 9. Calculate Overall 0-100 Compatibility Score
    // Weighting: GPU 45%, CPU 35%, RAM 15%, Storage/OS 5%
    const gpuFactor = Math.min(1.2, userGpuScore / Math.max(1, recGpuScore));
    const cpuFactor = Math.min(1.2, userCpuScore / Math.max(1, recCpuScore));
    const ramFactor = Math.min(1.1, userRam / Math.max(1, recRam));

    let rawScore = (gpuFactor * 45) + (cpuFactor * 35) + (ramFactor * 15) + (storageStatus === 'pass_rec' ? 5 : 2);
    // Heavy penalty if any core component is below minimum requirement
    if (gpuStatus === 'fail') rawScore *= 0.6;
    if (cpuStatus === 'fail') rawScore *= 0.7;
    if (ramStatus === 'fail') rawScore *= 0.8;

    const finalScore = Math.max(5, Math.min(100, Math.round(rawScore)));

    // 10. Determine Overall Verdict & Limiting Component
    let overallStatus = 'OPTIMAL';
    let verdict = 'Ultra / High 60+ FPS';
    let badgeColor = 'emerald';
    let summary = 'Your PC exceeds the recommended requirements. You can comfortably enjoy maximum visual fidelity at 1440p/4K resolution with high framerates.';

    let limitingComponent = 'None';
    let limitingDetails = 'All components perform above recommended requirements.';

    const upgradeSuggestions = [];

    if (gpuStatus === 'fail' || cpuStatus === 'fail' || ramStatus === 'fail') {
      overallStatus = 'UPGRADE_REQUIRED';
      verdict = 'Hardware Upgrade Recommended';
      badgeColor = 'rose';

      if (gpuStatus === 'fail') {
        limitingComponent = 'GPU';
        limitingDetails = `Your GPU (${userGpuMatch.name}, Score: ${userGpuScore}) falls below the game's minimum requirement (${minGpuMatch.name}, Score: ${minGpuScore}). This will cause severe stutter or low framerates.`;
        upgradeSuggestions.push({
          component: 'GPU',
          priority: 'High',
          current: userGpuMatch.name,
          recommended: recGpuMatch.name,
          reason: `Upgrading to a ${recGpuMatch.tier} graphics card like ${recGpuMatch.name} will significantly improve framerates and enable 1080p/1440p medium-high gaming.`,
        });
      } else if (cpuStatus === 'fail') {
        limitingComponent = 'CPU';
        limitingDetails = `Your CPU (${userCpuMatch.name}, Score: ${userCpuScore}) is below minimum specifications (${minCpuMatch.name}, Score: ${minCpuScore}).`;
        upgradeSuggestions.push({
          component: 'CPU',
          priority: 'High',
          current: userCpuMatch.name,
          recommended: recCpuMatch.name,
          reason: `Upgrading your processor to at least ${recCpuMatch.name} will eliminate core bottlenecks and physics stutters.`,
        });
      } else if (ramStatus === 'fail') {
        limitingComponent = 'RAM';
        limitingDetails = `Your system has ${userRam} GB of RAM, but this game requires at least ${minRam} GB to launch reliably without memory paging stutter.`;
        upgradeSuggestions.push({
          component: 'RAM',
          priority: 'Immediate',
          current: `${userRam} GB`,
          recommended: `${recRam} GB`,
          reason: `Adding RAM to reach at least ${recRam} GB is a cost-effective upgrade that will dramatically stabilize frame pacing.`,
        });
      }

      summary = `Your hardware falls below minimum specifications. Upgrading your ${limitingComponent} is recommended for a smooth gaming experience.`;
    } else if (gpuStatus === 'pass_min' || cpuStatus === 'pass_min' || ramStatus === 'pass_min') {
      overallStatus = 'PLAYABLE';
      verdict = 'Playable on Low-Medium';
      badgeColor = 'amber';

      if (gpuStatus === 'pass_min') {
        limitingComponent = 'GPU';
        limitingDetails = `Your GPU (${userGpuMatch.name}) meets minimum specifications, but falls short of the recommended target (${recGpuMatch.name}). Expect 1080p at 30–60 FPS with medium settings.`;
        upgradeSuggestions.push({
          component: 'GPU',
          priority: 'Medium',
          current: userGpuMatch.name,
          recommended: recGpuMatch.name,
          reason: `Upgrading from ${userGpuMatch.name} to a ${recGpuMatch.tier} GPU like ${recGpuMatch.name} will unlock 1440p resolution and 60+ FPS high settings.`,
        });
      } else if (cpuStatus === 'pass_min') {
        limitingComponent = 'CPU';
        limitingDetails = `Your CPU meets minimum requirements, but may limit framerates in dense multiplayer or CPU-heavy scenes.`;
      } else if (ramStatus === 'pass_min') {
        limitingComponent = 'RAM';
        limitingDetails = `Your system has ${userRam} GB RAM. Upgrading to ${recRam} GB is recommended for maximum background headroom.`;
      }

      summary = 'Your hardware meets the minimum requirements. The game will run comfortably at 1080p with medium settings or with upscaling (DLSS/FSR) enabled.';
    }

    // 11. Calculate Bottleneck and Projected Resolution FPS
    const bottleneck = await bottleneckService.calculateBottleneck(userCpuMatch, userGpuMatch, '1080p');
    const fpsEstimates = await bottleneckService.projectFPS(userSpecs, {
      recommendedRequirements: recReq,
      minimumRequirements: minReq,
    });

    return {
      score: finalScore,
      status: overallStatus,
      verdict,
      badgeColor,
      summary,
      limitingComponent,
      limitingDetails,
      bottleneck,
      fpsEstimates,
      userHardware: {
        cpu: userCpuMatch,
        gpu: userGpuMatch,
        ram: userRam,
        storageSpace: userStorage,
        storageType,
        os: userSpecs.operatingSystem || userSpecs.os,
      },
      checks: {
        gpu: {
          status: gpuStatus,
          user: userGpuMatch.name,
          userScore: userGpuScore,
          min: minGpuMatch.name,
          minScore: minGpuScore,
          rec: recGpuMatch.name,
          recScore: recGpuScore,
          userTier: userGpuMatch.tier,
          recTier: recGpuMatch.tier,
          userVram: userGpuMatch.vram,
          recVram: recGpuMatch.vram || recReq.vram,
          label: gpuLabel,
          delta: userGpuScore - recGpuScore,
        },
        cpu: {
          status: cpuStatus,
          user: userCpuMatch.name,
          userScore: userCpuScore,
          min: minCpuMatch.name,
          minScore: minCpuScore,
          rec: recCpuMatch.name,
          recScore: recCpuScore,
          userTier: userCpuMatch.tier,
          recTier: recCpuMatch.tier,
          label: cpuLabel,
          delta: userCpuScore - recCpuScore,
        },
        ram: {
          status: ramStatus,
          user: `${userRam} GB`,
          min: `${minRam} GB`,
          rec: `${recRam} GB`,
          label: ramLabel,
        },
        storage: {
          status: storageStatus,
          user: `${storageType} (${userStorage} GB free)`,
          required: minReq.storage,
          label: storageLabel,
        },
        os: {
          status: osStatus,
          user: userSpecs.operatingSystem || userSpecs.os || 'Windows 11 64-bit',
          required: minReq.os,
          label: osLabel,
        },
      },
      upgradeSuggestions,
      disclaimer: 'Compatibility scores are calculated against normalized synthetic hardware benchmarks. Actual performance may vary based on drivers, thermal conditions, and game updates.',
    };
  },
};

export default compatibilityService;
