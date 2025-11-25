import apiClient from './api';
import axios from 'axios';

// ==================== API 함수 정의 ====================

// [수정] 회원 정보 조회 (GET /api/user/my)
export const getUserInfo = async (): Promise<any> => {
  try {
    // 명세서에 따른 정확한 경로
    const response = await apiClient.get('/api/user/my');
    console.log('회원 정보 조회 결과:', response.data);
    
    // 응답 구조: { content: { users_email: "...", ... } }
    return response.data.content || response.data;
  } catch (error) {
    console.error('회원 정보 조회 실패:', error);
    return null;
  }
};

// 비밀번호 검증 (POST /api/auth/verify-pw)
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('password', password);

    const response = await apiClient.post('/api/auth/verify-pw', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.status === 200;
  } catch (error) {
    console.error('비밀번호 검증 실패:', error);
    return false;
  }
};

// 회원 정보 수정 데이터 인터페이스 (선택적)
export interface UserUpdateData {
  email?: string;
  nickname?: string;
  name?: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
  address_detail?: string;
  curPassword?: string;
  newPassword?: string;
}

// 회원 정보 수정 (POST /api/user/update)
export const updateUserProfile = async (data: UserUpdateData): Promise<{ success: boolean; message: string }> => {
  try {
    const formData = new FormData();
    
    // 값이 있는 필드만 FormData에 추가
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await apiClient.post('/api/user/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 수정 성공 시 로컬 스토리지 정보 업데이트
    if (response.status === 200 && typeof window !== 'undefined') {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = { ...currentUser, ...data };
      delete (updatedUser as any).curPassword;
      delete (updatedUser as any).newPassword;
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }

    return {
      success: response.status === 200,
      message: response.data.message || '수정 성공'
    };
  } catch (error: any) {
    console.error('회원 정보 수정 실패:', error);
    let msg = '수정 중 오류가 발생했습니다.';
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) msg = '비밀번호가 일치하지 않습니다.';
        else if (error.response?.data?.message) msg = error.response.data.message;
    }
    return { success: false, message: msg };
  }
};

// 닉네임 중복 확인 (임시 구현)
export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  try {
    return true; 
  } catch (error) {
    return false;
  }
};

// 회원 탈퇴 (DELETE /api/user)
export const deleteUserAccount = async (): Promise<boolean> => {
  try {
    const response = await apiClient.delete('/api/user');
    return response.status === 200;
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    return false;
  }
};