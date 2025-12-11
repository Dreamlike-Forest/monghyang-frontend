import apiClient from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// API 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// 로그인 응답 타입 (백엔드 LoginDto)
interface LoginResponse {
  status: number;
  nickname: string;
  role: string;
}

// 이메일 중복 확인 (수정됨: 경로 변수 사용)
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/api/auth/check-email/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (response.status === 200) {
      return true;
    } else if (response.status === 409) {
      return false;
    } else {
      throw new Error('이메일 확인 실패');
    }
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    throw error;
  }
};

// 전화번호 중복 확인 (추가)
export const checkPhoneAvailability = async (phone: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/api/auth/check-phone/${encodeURIComponent(phone)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (response.status === 200) {
      return true;
    } else if (response.status === 409) {
      return false;
    } else {
      throw new Error('전화번호 확인 실패');
    }
  } catch (error) {
    console.error('전화번호 중복 확인 오류:', error);
    throw error;
  }
};

// 일반 사용자 회원가입 (수정됨: FormData 사용)
export const signupCommonUser = async (data: any): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(`${API_URL}/api/auth/common-join`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || '회원가입이 완료되었습니다.',
        data: result.content || result.data
      };
    } else {
      return {
        success: false,
        message: result.message || '회원가입에 실패했습니다.'
      };
    }
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    return {
      success: false,
      message: error.message || '회원가입 중 오류가 발생했습니다.'
    };
  }
};

// 판매자 회원가입 (수정됨: FormData 사용)
export const signupSeller = async (data: any, images: File[] = []): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append(`images[${index}].image`, image);
        formData.append(`images[${index}].seq`, String(index + 1));
      });
    }

    if (!data.introduction) {
      formData.set('introduction', '');
    }

    const response = await fetch(`${API_URL}/api/auth/seller-join`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || '판매자 회원가입이 완료되었습니다.',
        data: result.content || result.data
      };
    } else {
      return {
        success: false,
        message: result.message || '판매자 회원가입에 실패했습니다.'
      };
    }
  } catch (error: any) {
    console.error('판매자 회원가입 오류:', error);
    return {
      success: false,
      message: error.message || '판매자 회원가입 중 오류가 발생했습니다.'
    };
  }
};

// 양조장 회원가입 (수정됨: FormData 사용)
export const signupBrewery = async (data: any, images: File[] = []): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append(`images[${index}].image`, image);
        formData.append(`images[${index}].seq`, String(index + 1));
      });
    }

    if (!data.brewery_website) {
      formData.set('brewery_website', '');
    }
    if (!data.introduction) {
      formData.set('introduction', '');
    }

    const response = await fetch(`${API_URL}/api/auth/brewery-join`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || '양조장 회원가입이 완료되었습니다.',
        data: result.content || result.data
      };
    } else {
      return {
        success: false,
        message: result.message || '양조장 회원가입에 실패했습니다.'
      };
    }
  } catch (error: any) {
    console.error('양조장 회원가입 오류:', error);
    return {
      success: false,
      message: error.message || '양조장 회원가입 중 오류가 발생했습니다.'
    };
  }
};

// 로그인 함수 (수정됨: response body 처리 추가)
export const login = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
    });

    // 헤더에서 세션 정보 추출
    const sessionId = response.headers.get('X-Session-Id');
    const refreshToken = response.headers.get('X-Refresh-Token');

    if (response.ok) {
      // ✅ response body 읽기 (LoginDto)
      let loginData: LoginResponse | null = null;
      try {
        loginData = await response.json();
        console.log('로그인 응답:', loginData);
      } catch (e) {
        console.warn('로그인 응답 파싱 실패:', e);
      }

      // 세션 정보 저장
      if (typeof window !== 'undefined') {
        if (sessionId) {
          localStorage.setItem('sessionId', sessionId);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');

        // ✅ LoginDto 정보도 저장 (nickname, role)
        if (loginData) {
          localStorage.setItem('loginInfo', JSON.stringify({
            nickname: loginData.nickname,
            role: loginData.role,
            status: loginData.status
          }));
        }
      }

      // 사용자 상세 정보 가져오기 (/api/user/my)
      const userInfo = await getUserInfo();
      if (userInfo) {
        localStorage.setItem('userData', JSON.stringify(userInfo));
      }

      return {
        success: true,
        message: '로그인 성공',
        data: {
          // LoginDto 정보
          nickname: loginData?.nickname,
          role: loginData?.role,
          // 상세 정보
          userInfo: userInfo
        }
      };
    } else {
      // 에러 응답 처리
      let errorMessage = '로그인에 실패했습니다.';
      try {
        const result = await response.json();
        errorMessage = result.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error: any) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      message: error.message || '로그인 중 오류가 발생했습니다.'
    };
  }
};

// 로그아웃 함수
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('loginInfo');
      localStorage.removeItem('isLoggedIn');
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
  }
};

// 사용자 정보 조회
export const getUserInfo = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/user/my');
    return response.data.content || response.data;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }
};

// 이메일로 사용자 존재 여부 확인
export const checkUserByEmail = async (email: string): Promise<boolean> => {
  try {
    const isAvailable = await checkEmailAvailability(email);
    return !isAvailable;
  } catch (error) {
    console.error('이메일 확인 오류:', error);
    return false;
  }
};

// 비밀번호 초기화
export const resetPassword = async (email: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('newPassword', newPassword);

    const response = await fetch(`${API_URL}/api/auth/reset-pw`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || '비밀번호가 초기화되었습니다.'
      };
    } else {
      return {
        success: false,
        message: result.message || '비밀번호 초기화에 실패했습니다.'
      };
    }
  } catch (error: any) {
    console.error('비밀번호 초기화 오류:', error);
    return {
      success: false,
      message: error.message || '비밀번호 초기화 중 오류가 발생했습니다.'
    };
  }
};