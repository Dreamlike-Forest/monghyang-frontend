'use client';

import React, { useState } from 'react';
import { checkUserByEmail, resetPassword } from '../../../utils/authApi';
import './FindPassword.css';

interface FindPasswordProps {
  onBack: () => void;
}

const FindPassword: React.FC<FindPasswordProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { email, newPassword, confirmPassword } = formData;

    // 1. 클라이언트 측 유효성 검사
    if (!email || !newPassword || !confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. 이메일 존재 여부 확인 API 호출
      const emailExists = await checkUserByEmail(email);
      
      if (!emailExists) {
        alert('가입되지 않은 이메일입니다. 이메일을 다시 확인해주세요.');
        setIsLoading(false);
        return;
      }

      // 3. 비밀번호 초기화 API 호출
      const result = await resetPassword(email, newPassword);
      
      if (result.success) {
        alert('비밀번호가 성공적으로 초기화되었습니다.\n로그인 페이지로 이동합니다.');
        onBack(); // 로그인 화면으로 이동
      } else {
        alert(`초기화 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="find-password-container">
      <form className="find-password-form" onSubmit={handleSubmit}>
        <button type="button" className="back-button" onClick={onBack} title="뒤로가기">
          ←
        </button>

        <h2 className="find-password-title">비밀번호 초기화</h2>

        <div className="find-form-group">
          <label className="find-form-label">이메일</label>
          <input
            type="email"
            name="email"
            className="find-form-input"
            placeholder="가입 시 등록한 이메일"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="find-form-group">
          <label className="find-form-label">새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            className="find-form-input"
            placeholder="8자 이상 입력"
            value={formData.newPassword}
            onChange={handleInputChange}
          />
        </div>

        <div className="find-form-group">
          <label className="find-form-label">새 비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            className="find-form-input"
            placeholder="비밀번호 다시 입력"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        <button 
          type="submit" 
          className="reset-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '비밀번호 초기화'}
        </button>
      </form>
    </div>
  );
};

export default FindPassword;