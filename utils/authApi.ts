import apiClient from './api';
import axios from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  nickname: string;
  role: string;
}

export interface UserData {
  nickname: string;
  email: string;
  role: string;
}

/**
 * 로그인 API
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns 로그인 성공 여부와 사용자 정보
 */
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; data?: UserData; error?: string }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, 
      }
    );

    const sessionId = response.headers['x-session-id'];
    const refreshToken = response.headers['x-refresh-token'];

    if (!sessionId || !refreshToken) {
      throw new Error('세션 정보를 받지 못했습니다.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      const userData: UserData = {
        nickname: response.data.nickname,
        email: email,
        role: response.data.role,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    }

    return {
      success: true,
      data: {
        nickname: response.data.nickname,
        email: email,
        role: response.data.role,
      },
    };
  } catch (error) {
    console.error('로그인 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 401) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 일치하지 않습니다.',
        };
      } else if (status === 404) {
        return {
          success: false,
          error: '존재하지 않는 계정입니다.',
        };
      } else if (status === 500) {
        return {
          success: false,
          error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        };
      }
    }

    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
    };
  }
};

// 로그아웃 API
export const logout = async (): Promise<boolean> => {
  try {
    await apiClient.post('/api/auth/logout');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
    }

    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
    }
    
    return false;
  }
};

/**
 * 이메일 중복 체크 API
 * @param email 체크할 이메일
 * @returns 사용 가능 여부
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/api/auth/check-email/${email}`);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return false;
    }
    throw error;
  }
};

// 회원가입 관련 타입 정의

export interface CommonSignupData {
  email: string;
  password: string;
  nickname: string;
  name: string;
  phone: string;
  birth: string; // YYYY-MM-DD
  gender: string; // 'man' | 'woman'
  address: string;
  address_detail: string;
  is_agreed: boolean;
}

export interface SellerSignupData extends CommonSignupData {
  business_registration_number: string;
  seller_account_number: string;
  seller_depositor: string;
  seller_bank_name: string;
  introduction?: string;
  is_agreed_seller: boolean;
  images?: File[];
}

export interface BrewerySignupData extends CommonSignupData {
  business_registration_number: string;
  brewery_depositor: string;
  brewery_account_number: string;
  brewery_bank_name: string;
  introduction?: string;
  brewery_website?: string;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  region_type_id: number;
  is_regular_visit: boolean;
  is_agreed_brewery: boolean;
  images?: File[];
}

export interface SignupResponse {
  success: boolean;
  message?: string;
}

// ==================== 회원가입 API ====================

// 일반 사용자 회원가입
export const signupCommonUser = async (data: CommonSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    
    // 모든 필드를 FormData에 추가
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/common-join`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '회원가입이 완료되었습니다.',
    };
  } catch (error) {
    console.error('일반 사용자 회원가입 오류:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '회원가입에 실패했습니다.',
      };
    }
    
    return {
      success: false,
      message: '회원가입 중 오류가 발생했습니다.',
    };
  }
};

// 판매자 회원가입
export const signupSeller = async (data: SellerSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    
    // 기본 필드 추가
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return; // 이미지는 별도 처리
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append(`images[${index}].image`, file);
        formData.append(`images[${index}].seq`, (index + 1).toString()); // 1부터 시작
      });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/seller-join`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '판매자 회원가입이 완료되었습니다.',
    };
  } catch (error) {
    console.error('판매자 회원가입 오류:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '판매자 회원가입에 실패했습니다.',
      };
    }
    
    return {
      success: false,
      message: '판매자 회원가입 중 오류가 발생했습니다.',
    };
  }
};

// 양조장 회원가입
export const signupBrewery = async (data: BrewerySignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    
    // 기본 필드 추가
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return; // 이미지는 별도 처리
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // 이미지 파일 추가 (첫번째 이미지가 대표 이미지)
    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append(`images[${index}].image`, file);
        formData.append(`images[${index}].seq`, (index + 1).toString()); // 1부터 시작
      });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/brewery-join`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '양조장 회원가입이 완료되었습니다.',
    };
  } catch (error) {
    console.error('양조장 회원가입 오류:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '양조장 회원가입에 실패했습니다.',
      };
    }
    
    return {
      success: false,
      message: '양조장 회원가입 중 오류가 발생했습니다.',
    };
  }
};