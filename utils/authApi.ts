import apiClient from './api';
import axios from 'axios';

// 인터페이스 정의
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { status: number; nickname: string; role: string; [key: string]: any; }
export interface UserData { userId: number; nickname: string; email: string; role: string; }
export interface CommonSignupData { email: string; password: string; nickname: string; name: string; phone: string; birth: string; gender: string; address: string; address_detail: string; is_agreed: boolean; }
export interface SellerSignupData extends CommonSignupData { business_registration_number: string; seller_account_number: string; seller_depositor: string; seller_bank_name: string; introduction?: string; is_agreed_seller: boolean; images?: File[]; }
export interface BrewerySignupData extends CommonSignupData { business_registration_number: string; brewery_depositor: string; brewery_account_number: string; brewery_bank_name: string; introduction?: string; brewery_website?: string; start_time: string; end_time: string; region_type_id: number; is_regular_visit: boolean; is_agreed_brewery: boolean; images?: File[]; }
export interface SignupResponse { success: boolean; message?: string; }

// 로그인 API
export const login = async (email: string, password: string): Promise<{ success: boolean; data?: UserData; error?: string }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/login`,
      formData,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true, 
      }
    );

    const sessionId = response.headers['x-session-id'];
    const refreshToken = response.headers['x-refresh-token'];

    if (typeof window !== 'undefined' && sessionId && refreshToken) {
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      const rawData = response.data;
      let foundId = rawData.userId || rawData.user_id || rawData.users_id || rawData.id || rawData.no;
      if (!foundId && rawData.content) foundId = rawData.content.userId || rawData.content.id;
      if (!foundId && rawData.data) foundId = rawData.data.userId || rawData.data.id;

      const userData: UserData = {
        userId: foundId || 0,
        nickname: rawData.nickname || '사용자',
        email: email,
        role: rawData.role || 'USER',
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    return { success: true, data: JSON.parse(localStorage.getItem('userData') || '{}') };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) return { success: false, error: '정보가 일치하지 않습니다.' };
    return { success: false, error: '로그인 오류' };
  }
};

// 로그아웃 API
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

// 이메일 중복 확인
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/api/auth/check-email/${email}`);
    return response.status === 200;
  } catch (error) { return false; }
};

// 회원 존재 확인
export const checkUserByEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/api/user/email/${email}`);
    return response.status === 200 && !!response.data.content;
  } catch (error) { return false; }
};

// [수정됨] 비밀번호 초기화 (POST /api/auth/reset-pw)
export const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('newPassword', newPassword);

    // [핵심] Content-Type을 undefined로 설정하여 브라우저가 boundary를 자동으로 설정하게 함
    const response = await apiClient.post('/api/auth/reset-pw', formData, {
      headers: {
        'Content-Type': undefined 
      }
    });
    return { success: response.status === 200, message: '비밀번호가 초기화되었습니다.' };
  } catch (error: any) {
    console.error('비밀번호 초기화 에러:', error);
    return { success: false, message: error.response?.data?.message || '오류 발생' };
  }
};

// [수정됨] 일반 회원가입
export const signupCommonUser = async (data: CommonSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value.toString());
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/common-join`,
      formData,
      { withCredentials: true } 
      // axios 직접 호출 시에는 기본적으로 header 설정이 없으므로 자동 처리되지만, 
      // 만약 axios.create로 만든 인스턴스를 쓴다면 여기서도 헤더를 지워줘야 합니다.
      // 현재는 axios를 직접 import해서 쓰고 있으므로 별도 설정 불필요하나 안전을 위해 유지
    );
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || '회원가입 실패' };
  }
};

// [수정됨] 판매자 회원가입
export const signupSeller = async (data: SellerSignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return;
      if (value !== undefined && value !== null) formData.append(key, value.toString());
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
      { withCredentials: true }
    );
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || '가입 실패' };
  }
};

// [수정됨] 양조장 회원가입
export const signupBrewery = async (data: BrewerySignupData): Promise<SignupResponse> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') return;
      if (value !== undefined && value !== null) formData.append(key, value.toString());
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
      { withCredentials: true }
    );
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || '가입 실패' };
  }
};