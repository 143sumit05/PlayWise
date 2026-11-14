import PCProfile from '../models/PCProfile.js';

// @desc    Get all PC profiles for logged in user
// @route   GET /api/pc-profiles
// @access  Private
export const getProfiles = async (req, res, next) => {
  try {
    const profiles = await PCProfile.find({ userId: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single PC profile by ID
// @route   GET /api/pc-profiles/:id
// @access  Private
export const getProfileById = async (req, res, next) => {
  try {
    const profile = await PCProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'PC Profile not found.',
      });
    }

    // Ensure user owns profile
    if (profile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this PC profile.',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new PC profile
// @route   POST /api/pc-profiles
// @access  Private
export const createProfile = async (req, res, next) => {
  try {
    const {
      profileName,
      cpu,
      gpu,
      ram,
      storage,
      storageType,
      operatingSystem,
      isDefault,
    } = req.body;

    if (!cpu || !gpu || !ram || !storage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all essential hardware specs (CPU, GPU, RAM, Storage).',
      });
    }

    // Check if user has any existing profiles
    const existingCount = await PCProfile.countDocuments({ userId: req.user._id });
    const shouldBeDefault = existingCount === 0 ? true : Boolean(isDefault);

    // If this profile should be default, reset any existing default
    if (shouldBeDefault) {
      await PCProfile.updateMany(
        { userId: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const profile = await PCProfile.create({
      userId: req.user._id,
      profileName: profileName || 'Gaming PC Rig',
      cpu: cpu.trim(),
      gpu: gpu.trim(),
      ram: Number(ram),
      storage: Number(storage),
      storageType: storageType || 'NVMe SSD',
      operatingSystem: operatingSystem || 'Windows 11 64-bit',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: 'PC profile created successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PC profile
// @route   PUT /api/pc-profiles/:id
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    let profile = await PCProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'PC Profile not found.',
      });
    }

    // Ensure user owns profile
    if (profile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PC profile.',
      });
    }

    const {
      profileName,
      cpu,
      gpu,
      ram,
      storage,
      storageType,
      operatingSystem,
      isDefault,
    } = req.body;

    if (isDefault) {
      await PCProfile.updateMany(
        { userId: req.user._id, _id: { $ne: profile._id } },
        { $set: { isDefault: false } }
      );
      profile.isDefault = true;
    }

    if (profileName) profile.profileName = profileName.trim();
    if (cpu) profile.cpu = cpu.trim();
    if (gpu) profile.gpu = gpu.trim();
    if (ram !== undefined) profile.ram = Number(ram);
    if (storage !== undefined) profile.storage = Number(storage);
    if (storageType) profile.storageType = storageType;
    if (operatingSystem) profile.operatingSystem = operatingSystem.trim();

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'PC profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete PC profile
// @route   DELETE /api/pc-profiles/:id
// @access  Private
export const deleteProfile = async (req, res, next) => {
  try {
    const profile = await PCProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'PC Profile not found.',
      });
    }

    // Ensure user owns profile
    if (profile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this PC profile.',
      });
    }

    const wasDefault = profile.isDefault;
    await profile.deleteOne();

    // If deleted profile was default, make another profile default if one exists
    if (wasDefault) {
      const remainingProfile = await PCProfile.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (remainingProfile) {
        remainingProfile.isDefault = true;
        await remainingProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'PC profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set PC profile as default active rig
// @route   PATCH /api/pc-profiles/:id/default
// @access  Private
export const setDefaultProfile = async (req, res, next) => {
  try {
    const profile = await PCProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'PC Profile not found.',
      });
    }

    // Ensure user owns profile
    if (profile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this PC profile.',
      });
    }

    // Unset all other profiles for user
    await PCProfile.updateMany(
      { userId: req.user._id },
      { $set: { isDefault: false } }
    );

    // Set this profile as default
    profile.isDefault = true;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `"${profile.profileName}" is now your default active PC rig.`,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

