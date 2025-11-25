import apiClient from './api';
import axios from 'axios';

// 회원 정보 조회
export const getUserInfo = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/user/my');
    return response.data.content || response.data;
  } catch (error) {
    console.error('회원 정보 조회 실패:', error);
    return null;
  }
};

// [수정됨] 비밀번호 검증
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('password', password);

    // headers 제거
    const response = await apiClient.post('/api/auth/verify-pw', formData);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export interface UserUpdateData {
  email?: string; nickname?: string; name?: string; phone?: string;
  birth?: string; gender?: string; address?: string; address_detail?: string;
  curPassword?: string; newPassword?: string;
}

// [수정됨] 회원 정보 수정
export const updateUserProfile = async (data: UserUpdateData): Promise<{ success: boolean; message: string }> => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    // headers 제거
    const response = await apiClient.post('/api/user/update', formData);

    if (response.status === 200 && typeof window !== 'undefined') {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = { ...currentUser, ...data };
      delete (updatedUser as any).curPassword;
      delete (updatedUser as any).newPassword;
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }

    return { success: true, message: response.data.message || '수정 성공' };
  } catch (error: any) {
    let msg = '수정 중 오류가 발생했습니다.';
    if (error.response?.data?.message) msg = error.response.data.message;
    return { success: false, message: msg };
  }
};

export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => true;

export const deleteUserAccount = async (): Promise<boolean> => {
  try {
    const response = await apiClient.delete('/api/user');
    return response.status === 200;
  } catch (error) { return false; }
};