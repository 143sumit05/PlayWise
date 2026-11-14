import api from './api.js';

export const pcProfileService = {
  getProfiles: async () => {
    const response = await api.get('/pc-profiles');
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/pc-profiles', profileData);
    return response.data;
  },

  updateProfile: async (id, profileData) => {
    const response = await api.put(`/pc-profiles/${id}`, profileData);
    return response.data;
  },

  deleteProfile: async (id) => {
    const response = await api.delete(`/pc-profiles/${id}`);
    return response.data;
  },

  setDefaultProfile: async (id) => {
    const response = await api.patch(`/pc-profiles/${id}/default`);
    return response.data;
  },
};

export default pcProfileService;

