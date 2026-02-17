import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId && config.headers) {
        config.headers['X-Session-Id'] = sessionId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshSession();
        if (refreshed) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sessionId');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('isLoggedIn');
          window.location.href = '/?view=login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

async function refreshSession(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;

    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!refreshToken || !sessionId) return false;

    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      {
        headers: {
          'X-Refresh-Token': refreshToken,
          'X-Session-Id': sessionId,
        },
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      const newSessionId = response.headers['x-session-id'];
      const newRefreshToken = response.headers['x-refresh-token'];

      if (newSessionId) {
        localStorage.setItem('sessionId', newSessionId);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('세션 갱신 실패:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      alert('다른 기기에서 로그인되어 로그아웃됩니다.');
    }
    
    return false;
  }
}

export default apiClient;