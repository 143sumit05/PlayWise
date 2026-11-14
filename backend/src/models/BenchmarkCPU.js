import mongoose from 'mongoose';

const benchmarkCPUSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'CPU model name is required'],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      enum: ['Intel', 'AMD', 'Apple', 'Qualcomm', 'Other'],
      default: 'Intel',
    },
    series: {
      type: String,
      trim: true,
    },
    tier: {
      type: String,
      required: true,
      enum: ['Enthusiast', 'High End', 'Mid Range', 'Budget', 'Entry Level'],
      default: 'Mid Range',
    },
    benchmarkScore: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true,
    },
    singleCoreScore: {
      type: Number,
      default: 50,
    },
    multiCoreScore: {
      type: Number,
      default: 50,
    },
    cores: {
      type: Number,
      default: 6,
    },
    threads: {
      type: Number,
      default: 12,
    },
    baseClock: {
      type: String,
      default: '3.0 GHz',
    },
    boostClock: {
      type: String,
      default: '4.5 GHz',
    },
    releaseYear: {
      type: Number,
    },
    aliases: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    source: {
      type: String,
      default: 'Normalized Synthetic CPU Mark Index (PassMark / Geekbench methodology)',
    },
  },
  {
    timestamps: true,
  }
);

benchmarkCPUSchema.index({ name: 'text', aliases: 'text' });

const BenchmarkCPU = mongoose.model('BenchmarkCPU', benchmarkCPUSchema);
export default BenchmarkCPU;
