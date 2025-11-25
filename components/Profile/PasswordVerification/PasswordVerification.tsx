'use client';

import React, { useState } from 'react';
import { verifyPassword } from '../../../utils/userApi';
import './PasswordVerification.css';

interface PasswordVerificationProps {
  onSuccess: () => void;
  title?: string;
}

const PasswordVerification: React.FC<PasswordVerificationProps> = ({ onSuccess, title = "비밀번호 인증" }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    const isValid = await verifyPassword(password);
    if (isValid) {
      onSuccess();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
    setIsLoading(false);
  };

  return (
    <div className="password-verify-container">
      <div className="password-verify-box">
        <h2 className="password-verify-title">{title}</h2>
        <p className="password-verify-desc">
          회원님의 소중한 정보 보호를 위해 비밀번호를 다시 한 번 확인합니다.
        </p>
        
        <form onSubmit={handleSubmit} className="password-verify-form">
          <input
            type="password"
            className="password-input"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          
          <button type="submit" className="verify-btn" disabled={isLoading}>
            {isLoading ? '확인 중...' : '확인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordVerification;