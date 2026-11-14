import api from './api.js';

export const authService = {
  signup: async ({ name, email, password, avatar }) => {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password,
      avatar,
    });
    return response.data;
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;

