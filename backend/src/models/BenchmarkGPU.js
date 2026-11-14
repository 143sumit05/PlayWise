import mongoose from 'mongoose';

const benchmarkGPUSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'GPU model name is required'],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      enum: ['NVIDIA', 'AMD', 'Intel', 'Apple', 'Other'],
      default: 'NVIDIA',
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
    vram: {
      type: Number,
      required: true,
      default: 8,
    },
    vramType: {
      type: String,
      default: 'GDDR6',
    },
    directX: {
      type: String,
      default: '12 Ultimate',
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
      default: 'Normalized Synthetic 3D Graphics Index (3DMark TimeSpy / PassMark G3D methodology)',
    },
  },
  {
    timestamps: true,
  }
);

benchmarkGPUSchema.index({ name: 'text', aliases: 'text' });

const BenchmarkGPU = mongoose.model('BenchmarkGPU', benchmarkGPUSchema);
export default BenchmarkGPU;
