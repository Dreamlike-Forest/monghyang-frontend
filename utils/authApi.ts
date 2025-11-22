import apiClient from './api';
import axios from 'axios';

// ==================== 인터페이스 정의 ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  nickname: string;
  role: string;
  [key: string]: any; 
}

export interface UserData {
  userId: number;
  nickname: string;
  email: string;
  role: string;
}

export interface CommonSignupData {
  email: string;
  password: string;
  nickname: string;
  name: string;
  phone: string;
  birth: string;
  gender: string;
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
  start_time: string;
  end_time: string;
  region_type_id: number;
  is_regular_visit: boolean;
  is_agreed_brewery: boolean;
  images?: File[];
}

export interface SignupResponse {
  success: boolean;
  message?: string;
}

// ==================== API 함수 정의 ====================

/**
 * 로그인 API
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

    console.log('🚀 [로그인 응답 원본 데이터]:', response.data);

    const sessionId = response.headers['x-session-id'];
    const refreshToken = response.headers['x-refresh-token'];

    if (!sessionId || !refreshToken) {
      throw new Error('세션 정보를 받지 못했습니다.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      const rawData = response.data;
      
      // 사용자 ID 추출 로직
      let foundId = 
        rawData.userId || 
        rawData.user_id || 
        rawData.users_id || 
        rawData.id || 
        rawData.no;

      if (!foundId && rawData.content) {
        foundId = 
          rawData.content.userId || 
          rawData.content.user_id || 
          rawData.content.users_id ||
          rawData.content.id;
      }

      if (!foundId && rawData.data) {
        foundId = 
          rawData.data.userId || 
          rawData.data.user_id || 
          rawData.data.id;
      }

      const nickname = rawData.nickname || rawData.content?.nickname || rawData.data?.nickname || '사용자';
      const role = rawData.role || rawData.content?.role || rawData.data?.role || 'USER';

      if (!foundId) {
        console.error('❌ [치명적 오류] 사용자 ID를 찾을 수 없습니다! 로그인 응답 로그를 확인해주세요.');
        foundId = 0; 
      } else {
        console.log('✅ 추출된 사용자 ID:', foundId);
      }

      const userData: UserData = {
        userId: foundId,
        nickname: nickname,
        email: email,
        role: role,
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
    }

    const savedUserData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('userData') || '{}') 
      : {};

    return {
      success: true,
      data: savedUserData,
    };

  } catch (error: any) {
    console.error('로그인 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
      if (status === 404) return { success: false, error: '존재하지 않는 계정입니다.' };
      if (status === 500) return { success: false, error: '서버 오류가 발생했습니다.' };
    }

    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 로그아웃 API
 */
export const logout = async (): Promise<boolean> => {
  try {
    await apiClient.post('/api/auth/logout');
    if (typeof window !== 'undefined') localStorage.clear();
    return true;
  } catch (error) {
    if (typeof window !== 'undefined') localStorage.clear();
    return false;
  }
};

/**
 * 이메일 중복 확인 API
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/api/auth/check-email/${email}`);
    return response.status === 200;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return false;
    }
    throw error;
  }
};

/**
 * 일반 사용자 회원가입 API
 */
export const signupCommonUser = async (data: CommonSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/common-join`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '회원가입이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('일반 사용자 회원가입 오류:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '회원가입에 실패했습니다.',
      };
    }
    return { success: false, message: '회원가입 중 오류가 발생했습니다.' };
  }
};

/**
 * 판매자 회원가입 API
 */
export const signupSeller = async (data: SellerSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return;
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append(`images[${index}].image`, file);
        formData.append(`images[${index}].seq`, (index + 1).toString());
      });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/seller-join`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '판매자 회원가입이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('판매자 회원가입 오류:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '판매자 회원가입에 실패했습니다.',
      };
    }
    return { success: false, message: '판매자 회원가입 중 오류가 발생했습니다.' };
  }
};

/**
 * 양조장 회원가입 API
 */
export const signupBrewery = async (data: BrewerySignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return;
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (data.images && data.images.length > 0) {
      data.images.forEach((file, index) => {
        formData.append(`images[${index}].image`, file);
        formData.append(`images[${index}].seq`, (index + 1).toString());
      });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/brewery-join`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.message || '양조장 회원가입이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('양조장 회원가입 오류:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || '양조장 회원가입에 실패했습니다.',
      };
    }
    return { success: false, message: '양조장 회원가입 중 오류가 발생했습니다.' };
  }
};