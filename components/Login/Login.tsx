'use client';

import { useState } from 'react';
import './Login.css';
import SignupContainer from './SignupContainer/SignupContainer';
import FindPassword from './FindPassword/FindPassword';
import { login as loginApi } from '../../utils/authApi';

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
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await loginApi(formData.email.trim(), formData.password);

      // 로그인 성공 처리
      if (result.success && result.data) {
        console.log('로그인 성공:', result.data);
        
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.delete('brewery');
          window.location.href = url.toString();
        }
      } else {
        // 로그인 실패 처리 - result.message 사용 (result.error 아님!)
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.');
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
          aria-label="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="login-title">로그인</h1>
        
        {error && (
          <div 
            role="alert"
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
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
            disabled={isLoading}
            required
            autoComplete="email"
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
            disabled={isLoading}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="login-options" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="forgot-password"
            onClick={() => setCurrentView('findPassword')}
            disabled={isLoading}
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
            marginBottom: '24px'
          }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <div className="signup-link">
          아직 계정이 없으신가요?{' '}
          <button 
            type="button" 
            onClick={() => setCurrentView('signup')}
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