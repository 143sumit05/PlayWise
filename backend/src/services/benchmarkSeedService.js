import BenchmarkCPU from '../models/BenchmarkCPU.js';
import BenchmarkGPU from '../models/BenchmarkGPU.js';
import { BENCHMARK_CPUS, BENCHMARK_GPUS } from '../data/benchmarkData.js';

export const benchmarkSeedService = {
  /**
   * Seeds benchmark collections in MongoDB if they are empty
   */
  seedBenchmarksIfNeeded: async () => {
    try {
      const cpuCount = await BenchmarkCPU.countDocuments();
      if (cpuCount === 0) {
        console.log(`[PlayWise Benchmarks] Seeding ${BENCHMARK_CPUS.length} CPU benchmark profiles into MongoDB...`);
        await BenchmarkCPU.insertMany(BENCHMARK_CPUS);
        console.log('[PlayWise Benchmarks] CPU benchmarks seeded successfully.');
      }

      const gpuCount = await BenchmarkGPU.countDocuments();
      if (gpuCount === 0) {
        console.log(`[PlayWise Benchmarks] Seeding ${BENCHMARK_GPUS.length} GPU benchmark profiles into MongoDB...`);
        await BenchmarkGPU.insertMany(BENCHMARK_GPUS);
        console.log('[PlayWise Benchmarks] GPU benchmarks seeded successfully.');
      }

      return {
        success: true,
        cpus: Math.max(cpuCount, BENCHMARK_CPUS.length),
        gpus: Math.max(gpuCount, BENCHMARK_GPUS.length),
      };
    } catch (error) {
      console.error('[PlayWise Benchmarks] Error checking or seeding benchmark data:', error.message);
      return { success: false, error: error.message };
    }
  },
};
