import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Swap this for your Render URL once deployed. Kept as one constant so
// nothing else in the app needs to know or care where the API lives.
export const API_BASE_URL = 'https://your-render-service.onrender.com/api';

const TOKEN_KEYS = { access: 'accessToken', refresh: 'refreshToken' };

export const tokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(TOKEN_KEYS.access);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(TOKEN_KEYS.refresh);
  },
  async setTokens({ accessToken, refreshToken }) {
    await SecureStore.setItemAsync(TOKEN_KEYS.access, accessToken);
    if (refreshToken) await SecureStore.setItemAsync(TOKEN_KEYS.refresh, refreshToken);
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.access);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.refresh);
  },
};

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Used by both the response interceptor below AND any direct (non-axios)
// request — like FileSystem.downloadAsync for binary files — that needs to
// refresh a token outside axios's own request/response cycle.
export async function refreshAccessToken() {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token stored');

  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  await tokenStorage.setTokens({ accessToken: data.accessToken });
  return data.accessToken;
}

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A queue so that if five requests hit a 401 at the same moment, they don't
// each independently trigger their own refresh call — only the first one
// does, the rest wait for its result. Like five clocks syncing to one signal
// instead of each phoning the time server separately.
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      resolveQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      await tokenStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
