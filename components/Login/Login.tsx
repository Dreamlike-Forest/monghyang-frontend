'use client';

import { useState } from 'react';
import './Login.css';
import SignupContainer from './SignupContainer/SignupContainer';
import { login } from '../../utils/authUtils';

const Login: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 입력 시 에러 메시지 제거
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('로그인 시도:', { email: formData.email });
      
      // authUtils의 login 함수 사용 (실제 API 호출)
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('로그인 성공, 리다이렉트 준비');
        
        // "로그인 상태 유지" 옵션 처리 (선택적)
        if (formData.rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // 로그인 성공 시 리다이렉트
        if (typeof window !== 'undefined') {
          // 저장된 리턴 URL 확인
          const returnUrl = sessionStorage.getItem('returnUrl');
          const returnProduct = sessionStorage.getItem('returnToProduct');
          
          // 세션 스토리지 정리
          sessionStorage.removeItem('returnUrl');
          sessionStorage.removeItem('returnToProduct');
          
          // 리다이렉트
          if (returnUrl) {
            console.log('저장된 URL로 리다이렉트:', returnUrl);
            window.location.href = returnUrl;
          } else if (returnProduct) {
            console.log('상품 페이지로 리다이렉트:', returnProduct);
            window.location.href = `/?view=shop&product=${returnProduct}`;
          } else {
            console.log('홈으로 리다이렉트');
            window.location.href = '/';
          }
        }
      } else {
        // 로그인 실패
        console.error('로그인 실패:', result.message);
        setError(result.message || '로그인에 실패했습니다.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('로그인 처리 중 예외 발생:', error);
      setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도`);
    alert(`${provider} 로그인 기능은 준비 중입니다.`);
  };

  const handleForgotPassword = () => {
    console.log('비밀번호 찾기');
    alert('비밀번호 찾기 기능은 준비 중입니다.');
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleBackToLogin = () => {
    setShowSignup(false);
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      // URL 파라미터 완전 제거하고 홈으로 이동
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.location.href = baseUrl;
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
          disabled={isLoading}
        >
          ←
        </button>
        
        <h1 className="login-title">로그인</h1>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
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
            disabled={isLoading}
            autoComplete="email"
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
            disabled={isLoading}
            autoComplete="current-password"
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
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="remember-label">
              로그인 상태 유지
            </label>
          </div>
          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              로그인 중...
            </div>
          ) : (
            '로그인'
          )}
        </button>

        {/* 로딩 애니메이션 CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />

        {/* 구분선 */}
        <div className="divider">
          <span className="divider-text">또는</span>
        </div>

        {/* 소셜 로그인 */}
        <div className="social-login">
          <button
            type="button"
            className="social-button google-login"
            onClick={() => handleSocialLogin('Google')}
            disabled={isLoading}
          >
            <img 
              src="/logo/Google_logo.svg" 
              alt="Google"
              className="google-icon"
              style={{ width: '18px', height: '18px' }}
            />
            Google로 계속하기
          </button>
        </div>

        {/* 회원가입 링크 */}
        <div className="signup-link">
          아직 계정이 없으신가요? 
          <button 
            type="button" 
            onClick={handleSignupClick}
            disabled={isLoading}
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;