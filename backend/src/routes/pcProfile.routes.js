import express from 'express';
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  setDefaultProfile,
} from '../controllers/pcProfile.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All PC profile routes are protected by JWT authentication
router.use(protect);

router.route('/')
  .get(getProfiles)
  .post(createProfile);

router.route('/:id')
  .get(getProfileById)
  .put(updateProfile)
  .delete(deleteProfile);

router.patch('/:id/default', setDefaultProfile);

export default router;

