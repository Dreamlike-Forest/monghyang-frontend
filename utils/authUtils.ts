const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// 로컬 스토리지 키 상수
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn'
} as const;

// API 응답 타입 정의
interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      user_id: number;
      email: string;
      nickname: string;
      name?: string;
      phone?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      sessionId: string;
    };
  };
}

interface RefreshResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    sessionId: string;
  };
}

interface LogoutResponse {
  success: boolean;
  message?: string;
}

// 사용자 정보 타입
export interface UserData {
  id: string;
  email: string;
  nickname: string;
  name?: string;
  phone?: string;
  user_type?: 'user' | 'seller' | 'brewery';
}


// 로그인 함수 
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // API 호출 
    const url = new URL(`${API_BASE_URL}/api/auth/login`);
    url.searchParams.append('email', email);
    url.searchParams.append('password', password);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
      },

    });

    const data: LoginResponse = await response.json();

    if (response.ok && data.success && data.data) {
      const { user, tokens } = data.data;

      // 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, tokens.sessionId);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');

        // 사용자 정보 저장
        const userData: UserData = {
          id: user.user_id.toString(),
          email: user.email,
          nickname: user.nickname,
          name: user.name,
          phone: user.phone,
        };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        console.log('로그인 성공:', userData);
      }

      return {
        success: true,
        message: data.message || '로그인에 성공했습니다.',
      };
    } else {
      return {
        success: false,
        message: data.message || '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
    }
  } catch (error) {
    console.error('로그인 API 호출 오류:', error);
    return {
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
    };
  }
};

// 토큰 갱신 함수 (Postman과 일치)
export const refreshToken = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;

    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshTokenValue) {
      console.warn('리프레시 토큰이 없습니다.');
      return false;
    }

    // API 호출
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshTokenValue, //
      },
    });

    const data: RefreshResponse = await response.json();

    if (response.ok && data.success && data.data) {
      // 새로운 액세스 토큰 및 세션 ID 저장
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, data.data.sessionId);

      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.warn('토큰 갱신 실패:', data.message);
      // 토큰 갱신 실패 시 로그아웃 처리
      await logout();
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 API 호출 오류:', error);
    return false;
  }
};
// 로그아웃 함수 (Postman과 일치)
export const logout = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;

    const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // API 호출 (선택적 - 서버에 로그아웃 알림)
    if (sessionId && refreshTokenValue) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId, //
            'X-Refresh-Token': refreshTokenValue, //
          },
        });

        const data: LogoutResponse = await response.json();
        console.log('로그아웃 API 응답:', data.message);
      } catch (error) {
        console.error('로그아웃 API 호출 오류:', error);
        // API 호출 실패해도 로컬 데이터는 정리
      }
    }

    // 로컬 스토리지 정리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // 세션 스토리지 정리
    sessionStorage.removeItem('returnToProduct');
    sessionStorage.removeItem('returnUrl');

    console.log('로그아웃 완료');
    return true;
  } catch (error) {
    console.error('로그아웃 처리 오류:', error);
    return false;
  }
};
 //로그인 상태 확인
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    return isAuthenticated && !!accessToken && !!userData;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
};
// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userDataString = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userDataString) return null;

    return JSON.parse(userDataString) as UserData;
  } catch (error) {
    console.error('사용자 정보 파싱 오류:', error);
    return null;
  }
};
// 액세스 토큰 가져오기
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
};

export const getAuthHeaders = (): Record<string, string> => {
  const accessToken = getAccessToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  return headers;
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // 첫 번째 시도
  let response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // 401 에러 (인증 실패) 시 토큰 갱신 후 재시도
  if (response.status === 401) {
    console.log('토큰 만료, 갱신 시도...');
    const refreshSuccess = await refreshToken();

    if (refreshSuccess) {
      // 토큰 갱신 성공 시 재요청
      response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });
    } else {
      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      console.error('토큰 갱신 실패, 로그인 페이지로 이동');
      if (typeof window !== 'undefined') {
        window.location.href = '/?view=login';
      }
    }
  }

  return response;
};

export const checkAuthAndPrompt = (
  featureName: string = '이 기능',
  onLoginRedirect?: () => void,
  onCancel?: () => void
): boolean => {
  if (isLoggedIn()) {
    return true;
  }

  // 로그인하지 않은 경우
  const shouldLogin = confirm(
    `${featureName}을(를) 이용하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
  );

  if (shouldLogin) {
    // 현재 페이지 URL 저장
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnUrl', window.location.href);
    }

    // 로그인 페이지로 이동
    if (onLoginRedirect) {
      onLoginRedirect();
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/?view=login';
      }
    }
  } else {
    // 사용자가 취소한 경우
    if (onCancel) {
      onCancel();
    }
  }

  return false;
};

// 회원가입 API 호출
export const signup = async (
  userData: any, 
  userType: 'user' | 'seller' | 'brewery' = 'user'
): Promise<{ success: boolean; message: string }> => {
  try {
    let endpoint = '';
    switch (userType) {
      case 'user':
        endpoint = `${API_BASE_URL}/api/auth/common-join`;
        break;
      case 'seller':
        endpoint = `${API_BASE_URL}/api/auth/seller-join`;
        break;
      case 'brewery':
        endpoint = `${API_BASE_URL}/api/auth/brewery-join`;
        break;
    }

    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      const value = userData[key];

      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: File) => {
          formData.append('images', file); 
        });
      } else if (value !== undefined && value !== null) {
        if (key.startsWith('is_agreed') && typeof value === 'boolean') {
          formData.append(key, String(value));
        }
        else if (key === 'is_regular_visit' && typeof value === 'boolean') {
          formData.append(key, String(value));
        }
        // 나머지 필드
        else {
          formData.append(key, value);
        }
      }
    });

    console.log(`[${userType}] 회원가입 요청 데이터:`);
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData, 

    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(data.message || '회원가입이 완료되었습니다. 로그인해주세요.');
      return {
        success: true,
        message: data.message || '회원가입이 완료되었습니다. 로그인해주세요.',
      };
    } else {
      alert(data.message || '회원가입에 실패했습니다. 입력 내용을 확인해주세요.');
      return {
        success: false,
        message: data.message || '회원가입에 실패했습니다.',
      };
    }
  } catch (error) {
    console.error('회원가입 API 호출 오류:', error);
    alert('회원가입 처리 중 오류가 발생했습니다. 네트워크를 확인해주세요.');
    return {
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.',
    };
  }
};

export const checkEmailAvailability = async (
  email: string
): Promise<{ available: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
       return {
         available: data.available === true,
         message: data.message || (data.available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'),
       };
    } else {
       return {
         available: false,
         message: data.message || '이메일 확인 중 오류가 발생했습니다.',
       };
    }
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    return {
      available: false,
      message: '이메일 확인 중 네트워크 오류가 발생했습니다.',
    };
  }
};

// 모든 기능 내보내기
export default {
  login,
  logout,
  refreshToken,
  isLoggedIn,
  getCurrentUser,
  getAccessToken,
  getSessionId,
  getAuthHeaders,
  authenticatedFetch,
  checkAuthAndPrompt,
  signup,
  checkEmailAvailability,
};