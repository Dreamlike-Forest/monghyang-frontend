'use client';

import React, { useState, useEffect } from 'react';
import { updateUserProfile, getUserInfo } from '../../../utils/userApi';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    curPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  useEffect(() => {
    const loadEmail = async () => {
      // API를 통해 이메일(식별자) 가져오기
      const data = await getUserInfo();
      if (data) {
        // users_email 또는 email 필드 사용
        setEmail(data.users_email || data.email || '');
      } else if (typeof window !== 'undefined') {
        // 실패 시 로컬 스토리지 폴백
        const localData = localStorage.getItem('userData');
        if (localData) {
          try {
             setEmail(JSON.parse(localData).email || '');
          } catch(e) {}
        }
      }
    };
    loadEmail();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.curPassword || !formData.newPassword || !formData.newPasswordConfirm) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.newPassword !== formData.newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.curPassword === formData.newPassword) {
      alert('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    const result = await updateUserProfile({
      email: email,
      curPassword: formData.curPassword,
      newPassword: formData.newPassword
    });

    if (result.success) {
      alert('비밀번호가 변경되었습니다. 보안을 위해 다시 로그인해주세요.');
      
      // [수정됨] 로그아웃 처리 및 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('refreshToken');

        window.location.href = '/?view=login';
      }
    } else {
      alert(`비밀번호 변경 실패: ${result.message}`);
    }
  };

  return (
    <div className="change-password-container">
      <h2 className="profile-heading">비밀번호 변경</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label>현재 비밀번호</label>
          <input
            type="password"
            name="curPassword"
            value={formData.curPassword}
            onChange={handleInputChange}
            placeholder="현재 비밀번호를 입력하세요"
            className="password-input"
          />
        </div>

        <div className="form-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 입력하세요"
            className="password-input"
          />
        </div>

        <div className="form-group">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            name="newPasswordConfirm"
            value={formData.newPasswordConfirm}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="password-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">변경하기</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;