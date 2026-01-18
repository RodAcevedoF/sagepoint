import axios from 'axios';

const API_URL = 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (e) {
        console.error('Logout failed', e);
    }
  window.location.reload();
};
