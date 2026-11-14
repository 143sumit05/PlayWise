import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);

import { benchmarkService } from '../src/services/benchmarkService.js';
import { compatibilityService } from '../src/services/compatibilityService.js';
import { bottleneckService } from '../src/services/bottleneckService.js';
import { findBestCheapSharkMatch, isTitleRelevantToQuery, expandQueryAcronyms } from '../src/utils/gameMatcher.js';
import { parseSystemRequirements } from '../src/utils/rawgNormalizer.js';
import { checkCompatibility } from '../../frontend/src/utils/compatibilityChecker.js';

async function runComprehensiveQA() {
  console.log('================================================================');
  console.log('      PLAYWISE PHASE 6: FINAL QA & PRODUCTION SUITE            ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(category, testName, condition) {
    if (condition) {
      console.log(`[PASS] [${category}] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] [${category}] ${testName}`);
      failed++;
    }
  }

  // --- PHASE 1 & 5: CLIENT-SIDE COMPATIBILITY ENGINE ---
  const compClientOptimal = checkCompatibility(
    { cpu: 'AMD Ryzen 7 7800X3D', gpu: 'NVIDIA GeForce RTX 4080', ram: 32, storageSpace: 1000 },
    {
      minimumRequirements: { cpu: 'i5-8400', gpu: 'gtx 1060', ram: 8, storage: '80 GB' },
      recommendedRequirements: { cpu: 'Ryzen 5 5600X', gpu: 'rtx 3060', ram: 16, storage: '80 GB' },
    }
  );
  assert('Phase 1/5 Client', 'Client engine generates OPTIMAL verdict for high-end rig', compClientOptimal.status === 'OPTIMAL');
  assert('Phase 1/5 Client', 'Client engine generates score >= 90', compClientOptimal.score >= 90);
  assert('Phase 1/5 Client', 'Client engine sets limitingComponent to None on optimal', compClientOptimal.limitingComponent === 'None');

  const compClientLow = checkCompatibility(
    { cpu: 'Intel Core i5-2500K', gpu: 'NVIDIA GeForce GT 1030', ram: 4, storageSpace: 100 },
    {
      minimumRequirements: { cpu: 'i5-8400', gpu: 'gtx 1060', ram: 8, storage: '80 GB' },
      recommendedRequirements: { cpu: 'Ryzen 5 5600X', gpu: 'rtx 3060', ram: 16, storage: '80 GB' },
    }
  );
  assert('Phase 1/5 Client', 'Client engine generates UPGRADE_REQUIRED for low-end rig', compClientLow.status === 'UPGRADE_REQUIRED');
  assert('Phase 1/5 Client', 'Client engine detects limiting hardware', ['GPU', 'CPU', 'RAM'].includes(compClientLow.limitingComponent));

  // --- PHASE 3: RAWG NORMALIZER & PARSER ---
  const reqParsedGb = parseSystemRequirements('Processor: Intel Core i5\nMemory: 16 GB RAM\nGraphics: NVIDIA RTX 2060\nStorage: 70 GB SSD');
  assert('Phase 3 RAWG', 'Parses GB RAM accurately', reqParsedGb.ram === 16);

  const reqParsedMb = parseSystemRequirements('Processor: Intel Core i3\nMemory: 8192 MB RAM\nGraphics: GTX 960\nStorage: 30 GB');
  assert('Phase 3 RAWG', 'Converts 8192 MB to 8 GB RAM', reqParsedMb.ram === 8);

  const reqFallback = parseSystemRequirements('', 'recommended');
  assert('Phase 3 RAWG', 'Falls back gracefully on empty string', reqFallback.ram === 16 && reqFallback.gpu.includes('RTX 3060'));

  // --- PHASE 4: CHEAPSHARK MATCHER & ACENONYM EXPANSION ---
  assert('Phase 4 Deals', 'Expands GTA 5 acronym to Grand Theft Auto V', expandQueryAcronyms('gta 5').includes('grand theft auto'));
  assert('Phase 4 Deals', 'Expands RDR2 acronym to Red Dead Redemption 2', expandQueryAcronyms('rdr2').includes('red dead redemption'));
  assert('Phase 4 Deals', 'Expands CP2077 acronym to Cyberpunk 2077', expandQueryAcronyms('cp2077').includes('cyberpunk'));

  const csMatchCyber = findBestCheapSharkMatch('Cyberpunk 2077', [
    { external: 'Spinnortality' },
    { external: 'CrashMetal - Cyberpunk' },
    { external: 'Cyberpunk SFX - Sound Effects Pack' },
    { external: 'Cyberpunk 2077' },
  ]);
  assert('Phase 4 Deals', 'Strictly matches Cyberpunk 2077 and rejects unrelated/DLC', csMatchCyber && csMatchCyber.external === 'Cyberpunk 2077');

  const csMatchKnight = isTitleRelevantToQuery('GTR - FIA GT Racing Game', 'knight');
  assert('Phase 4 Deals', 'Rejects GTR racing game for query knight', !csMatchKnight);

  // --- PHASE 5: HARDWARE BENCHMARKS & BOTTLENECK ENGINE ---
  const tiers = benchmarkService.getTiers();
  assert('Phase 5 Benchmark', 'Benchmark service provides 5 distinct tiers', Object.keys(tiers).length === 5);

  const fuzzyGpu = await benchmarkService.matchHardware('NVIDIA GeForce RTX 4070 12GB GDDR6X', 'gpu');
  assert('Phase 5 Benchmark', 'Fuzzy matches RTX 4070 to High End tier', fuzzyGpu.matched && fuzzyGpu.tier === 'High End');

  const fuzzyCpu = await benchmarkService.matchHardware('Intel Core i5-12400F 6-Core', 'cpu');
  assert('Phase 5 Benchmark', 'Fuzzy matches i5-12400F to Mid Range tier', fuzzyCpu.matched && fuzzyCpu.tier === 'Mid Range');

  const bottleBalanced = await bottleneckService.calculateBottleneck('AMD Ryzen 5 5600X', 'NVIDIA GeForce RTX 3060', '1080p');
  assert('Phase 5 Bottleneck', 'Balanced setup (5600X + 3060) gets Great Balance', bottleBalanced.balanceRating === 'Great Balance');
  assert('Phase 5 Bottleneck', 'Balanced setup bottleneck <= 20%', bottleBalanced.bottleneckPercentage <= 20);

  const bottleCpuBound = await bottleneckService.calculateBottleneck('Intel Core i5-2500K', 'NVIDIA GeForce RTX 4090', '1080p');
  assert('Phase 5 Bottleneck', 'i5-2500K + RTX 4090 identifies CPU bottleneck', bottleCpuBound.bottleneckComponent === 'CPU' && bottleCpuBound.bottleneckPercentage >= 35);

  const bottleGpuBound = await bottleneckService.calculateBottleneck('AMD Ryzen 7 7800X3D', 'NVIDIA GeForce GTX 1050 Ti', '1080p');
  assert('Phase 5 Bottleneck', '7800X3D + GTX 1050 Ti identifies GPU bound', bottleGpuBound.bottleneckComponent === 'GPU' && bottleGpuBound.bottleneckPercentage >= 35);

  const fps = await bottleneckService.projectFPS(
    { cpu: 'AMD Ryzen 5 5600X', gpu: 'NVIDIA GeForce RTX 3060', ram: 16 },
    {
      recommendedRequirements: {
        cpu: 'Intel Core i7-10700K',
        gpu: 'NVIDIA GeForce RTX 3060 12GB',
        ram: 16,
      },
    }
  );
  assert('Phase 5 FPS', 'FPS projections generated for 4 resolutions', Object.keys(fps.projections).length === 4);
  assert('Phase 5 FPS', 'FPS scales logically across resolutions (1080p > 1440p > 4K)',
    fps.projections['1080p'].High.fps > fps.projections['1440p'].High.fps &&
    fps.projections['1440p'].High.fps > fps.projections['4k'].High.fps
  );
  assert('Phase 5 FPS', 'Includes explicit synthetic benchmark disclaimer', fps.disclaimer.length > 20);

  // --- PHASE 6: BACKEND COMPATIBILITY EVALUATION ---
  const compEval = await compatibilityService.evaluateCompatibility(
    { cpu: 'AMD Ryzen 7 7800X3D', gpu: 'NVIDIA GeForce RTX 4080', ram: 32, storage: 1000 },
    {
      recommendedRequirements: { cpu: 'Ryzen 5 5600X', gpu: 'RTX 3060', ram: 16 },
      minimumRequirements: { cpu: 'i5-8400', gpu: 'GTX 1060', ram: 8 },
    }
  );
  assert('Phase 6 Full Eval', 'Server evaluation returns valid score and verdict', compEval.score >= 90 && compEval.status === 'OPTIMAL');
  assert('Phase 6 Full Eval', 'Server evaluation attaches bottleneck object', Boolean(compEval.bottleneck?.available));
  assert('Phase 6 Full Eval', 'Server evaluation attaches fpsEstimates object', Boolean(compEval.fpsEstimates?.available));

  console.log('\n================================================================');
  console.log(`      TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED               `);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runComprehensiveQA().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

