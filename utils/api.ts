import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234',
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

// 응답 인터셉터: 401 에러 시 토큰 갱신 시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 아직 재시도하지 않았으면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const refreshed = await refreshSession();
        if (refreshed) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
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

// 세션 갱신 함수
async function refreshSession(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;

    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!refreshToken || !sessionId) return false;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/refresh`,
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
      // 새로운 세션 ID와 리프레시 토큰 저장
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
    
    // 409 에러 (중복 접속) 처리
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      alert('다른 기기에서 로그인되어 로그아웃됩니다.');
    }
    
    return false;
  }
}

export default apiClient;