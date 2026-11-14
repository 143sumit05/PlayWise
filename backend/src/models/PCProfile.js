import mongoose from 'mongoose';

const pcProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a PC Profile'],
      index: true,
    },
    profileName: {
      type: String,
      required: [true, 'Profile name is required (e.g., Main Rig, Laptop)'],
      trim: true,
      maxlength: [60, 'Profile name cannot exceed 60 characters'],
      default: 'Main Gaming Battlestation',
    },
    cpu: {
      type: String,
      required: [true, 'CPU specification is required'],
      trim: true,
    },
    gpu: {
      type: String,
      required: [true, 'GPU specification is required'],
      trim: true,
    },
    ram: {
      type: Number,
      required: [true, 'RAM in GB is required'],
      min: [2, 'RAM must be at least 2 GB'],
      max: [512, 'RAM cannot exceed 512 GB'],
    },
    storage: {
      type: Number,
      required: [true, 'Storage space in GB is required'],
      min: [10, 'Storage must be at least 10 GB'],
    },
    storageType: {
      type: String,
      enum: ['NVMe SSD', 'SATA SSD', 'HDD'],
      default: 'NVMe SSD',
    },
    operatingSystem: {
      type: String,
      required: [true, 'Operating System is required'],
      default: 'Windows 11 64-bit',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// If this profile is marked as default, ensure other profiles for the same user are not default
pcProfileSchema.pre('save', async function (next) {
  if (this.isModified('isDefault') && this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const PCProfile = mongoose.model('PCProfile', pcProfileSchema);
export default PCProfile;

