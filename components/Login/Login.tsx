'use client';

import { useState } from 'react';
import './Login.css';
import SignupContainer from './SignupContainer/SignupContainer';
import FindPassword from './FindPassword/FindPassword';
import { login as loginApi } from '../../utils/authApi';

// 화면 상태 타입 정의
type LoginView = 'login' | 'signup' | 'findPassword';

const Login: React.FC = () => {
  const [currentView, setCurrentView] = useState<LoginView>('login');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginApi(formData.email, formData.password);

      if (result.success && result.data) {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.delete('brewery');
          window.location.href = url.toString();
        }
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('brewery');
      window.location.href = url.toString();
    }
  };

  if (currentView === 'signup') {
    return <SignupContainer onBackToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'findPassword') {
    return <FindPassword onBack={() => setCurrentView('login')} />;
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
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
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
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

        <div className="login-options" style={{ justifyContent: 'flex-end' }}>
          {/* 로그인 상태 유지 체크박스 제거됨 */}
          <button
            type="button"
            className="forgot-password"
            onClick={() => setCurrentView('findPassword')}
          >
            비밀번호 찾기
          </button>
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '24px' // 하단 여백 조정
          }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {/* 구분선 및 소셜 로그인 버튼 제거됨 */}

        <div className="signup-link">
          아직 계정이 없으신가요? <button type="button" onClick={() => setCurrentView('signup')}>회원가입</button>
        </div>
      </form>
    </div>
  );
};

export default Login;