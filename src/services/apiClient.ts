import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, TokenResponse } from '../types/api';

const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL !== undefined
    ? (import.meta.env.VITE_API_URL as string)
    : '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s để chờ Render cold-start khi backend đang ngủ
  headers: {
    'Content-Type': 'application/json',
  },
});

function getCleanToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return null;
  }
  return token.trim();
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
  localStorage.removeItem('currentUser');
  window.dispatchEvent(new Event('storage'));
}

const isPublicEndpoint = (url?: string, method?: string) => {
  if (!url) return false;
  if (url.includes('/annotations')) return false;
  // Các endpoint sát hạch và import đề thi cho phép hoạt động không cần đăng nhập tài khoản hệ thống
  if (url.includes('/api/v1/exams') || url.includes('/api/admin/exams/import')) {
    return true;
  }
  const isGet = !method || method.toUpperCase() === 'GET';
  if (!isGet) return false;
  if (url.includes('/api/v1/chapters') || url.includes('/api/v1/lessons')) {
    return true;
  }
  return false;
};

// 1. Gắn Access Token vào Header nếu có token hợp lệ
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Không gắn Authorization header cho endpoint auth công khai (login, register)
    // để tránh trường hợp token cũ/hết hạn trong localStorage gây lỗi 403/401 từ Spring Security
    const isAuthEndpoint =
      config.url?.includes('/api/v1/auth/login') ||
      config.url?.includes('/api/v1/auth/register');

    if (isAuthEndpoint) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = getCleanToken();
    // Giữ nguyên Authorization header nếu request đã chỉ định rõ (ví dụ sessionToken của thí sinh)
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Xử lý tự động Refresh Token khi hết hạn (HTTP 401)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tránh lặp vô tận nếu endpoint refresh-token hoặc login bị 401
      if (
        originalRequest.url?.includes('/api/v1/auth/refresh-token') ||
        originalRequest.url?.includes('/api/v1/auth/login')
      ) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const rawRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      const refreshToken = (rawRefreshToken && rawRefreshToken !== 'undefined' && rawRefreshToken !== 'null')
        ? rawRefreshToken.trim()
        : null;

      if (!refreshToken) {
        clearAuthStorage();
        // Nếu là GET endpoint công khai (như giáo trình, bài học), thử lại ngay mà không cần token
        if (isPublicEndpoint(originalRequest.url, originalRequest.method)) {
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
          isRefreshing = false;
          return apiClient(originalRequest);
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<ApiResponse<TokenResponse>>(
          `${API_BASE_URL}/api/v1/auth/refresh-token`,
          { refreshToken }
        );
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        clearAuthStorage();

        // Nếu refresh thất bại nhưng đây là GET endpoint công khai, thử lại không token
        if (isPublicEndpoint(originalRequest.url, originalRequest.method)) {
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
          return apiClient(originalRequest);
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
