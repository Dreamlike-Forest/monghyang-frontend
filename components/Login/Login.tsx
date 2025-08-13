'use client';

import { useState } from 'react';
import './Login.css';
import SignupContainer from './SignupContainer/SignupContainer';

const Login: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 시도:', formData);
    // 실제 로그인 로직 구현
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도`);
    // 소셜 로그인 로직 구현
  };

  const handleForgotPassword = () => {
    console.log('비밀번호 찾기');
    // 비밀번호 찾기 로직 구현
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleBackToLogin = () => {
    setShowSignup(false);
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      window.location.href = url.toString();
    }
  };

  // 회원가입 화면을 보여주는 경우
  if (showSignup) {
    return <SignupContainer onBackToLogin={handleBackToLogin} />;
  }

  // 기존 로그인 화면
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={handleBackToHome}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px'
          }}
          title="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="login-title">로그인</h1>
        
        {/* 이메일 입력 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            placeholder="이메일 주소를 입력하세요"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* 로그인 옵션 */}
        <div className="login-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="remember-checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe" className="remember-label">
              로그인 상태 유지
            </label>
          </div>
          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button type="submit" className="login-button">
          로그인
        </button>

        {/* 구분선 */}
        <div className="divider">
          <span className="divider-text">또는</span>
        </div>

        {/* 소셜 로그인 */}
        <div className="social-login">
          {/* 구글 로그인 - SVG 아이콘 사용 */}
          <button
            type="button"
            className="social-button google-login"
            onClick={() => handleSocialLogin('google')}
          >
            <img 
              src="/logo/Google_logo.svg" 
              alt="Google"
              className="google-icon"
            />
            Google로 계속하기
          </button>
        </div>

        {/* 회원가입 링크 */}
        <div className="signup-link">
          아직 계정이 없으신가요? <button type="button" onClick={handleSignupClick}>회원가입</button>
        </div>
      </form>
    </div>
  );
};

export default Login;