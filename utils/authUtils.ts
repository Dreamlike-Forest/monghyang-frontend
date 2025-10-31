export interface User {
  id: string;
  nickname: string;
  email: string;
}

// 환경 변수에서 API URL 가져오기 (보안 강화)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// 개발 환경에서 API URL 확인 (프로덕션에서는 제거됨)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// ==================== 로그인 관련 ====================

// 로그인 API 호출
export const login = async (email: string, password: string): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      // 응답 헤더에서 토큰 추출
      const sessionId = response.headers.get('X-Session-Id');
      const refreshToken = response.headers.get('X-Refresh-Token');
      
      if (sessionId && refreshToken) {
        // localStorage에 저장
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify({
          email: email,
          nickname: email.split('@')[0], // 임시로 이메일 앞부분을 닉네임으로
        }));
        
        return { success: true };
      } else {
        return { success: false, message: '인증 토큰을 받지 못했습니다.' };
      }
    } else {
      return { success: false, message: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' };
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return { success: false, message: '서버와의 연결에 실패했습니다.' };
  }
};

// ==================== 로그아웃 관련 ====================

// 로그아웃 API 호출
export const logout = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;

    const sessionId = localStorage.getItem('sessionId');
    const refreshToken = localStorage.getItem('refreshToken');

    // 서버에 로그아웃 요청
    if (sessionId && refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
            'X-Refresh-Token': refreshToken,
          },
        });
      } catch (error) {
        console.error('로그아웃 API 호출 오류:', error);
      }
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return false;
  }
};

// ==================== 토큰 갱신 관련 ====================

// 토큰 갱신 API 호출
export const refreshAccessToken = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: '클라이언트 환경이 아닙니다.' };
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return { success: false, message: '리프레시 토큰이 없습니다.' };
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/refresh?X-Refresh-Token=${encodeURIComponent(refreshToken)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      // 새로운 세션 ID 추출
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId) {
        localStorage.setItem('sessionId', newSessionId);
        return { success: true };
      } else {
        return { success: false, message: '새로운 세션을 받지 못했습니다.' };
      }
    } else {
      // 토큰 갱신 실패 시 로그아웃 처리
      await logout();
      return { success: false, message: '세션이 만료되었습니다.' };
    }
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    return { success: false, message: '토큰 갱신에 실패했습니다.' };
  }
};

// ==================== 인증 상태 확인 ====================

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    const sessionId = localStorage.getItem('sessionId');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('userData');
    
    return isAuthenticated && !!sessionId && !!refreshToken && !!userData;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
};

// 세션 ID 가져오기
export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('sessionId');
  } catch (error) {
    console.error('세션 ID 조회 오류:', error);
    return null;
  }
};

// 리프레시 토큰 가져오기
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('refreshToken');
  } catch (error) {
    console.error('리프레시 토큰 조회 오류:', error);
    return null;
  }
};

// ==================== 인증이 필요한 API 요청 ====================

// 인증이 필요한 API 요청을 위한 fetch 래퍼
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    throw new Error('로그인이 필요합니다.');
  }

  // 세션 ID를 헤더에 추가
  const headers = {
    ...options.headers,
    'X-Session-Id': sessionId,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 Unauthorized 응답인 경우 토큰 갱신 시도
    if (response.status === 401) {
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        // 새로운 세션 ID로 재시도
        const newSessionId = getSessionId();
        const retryHeaders = {
          ...options.headers,
          'X-Session-Id': newSessionId!,
        };
        
        return fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        redirectToLogin();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }

    return response;
  } catch (error) {
    console.error('인증된 요청 오류:', error);
    throw error;
  }
};

// ==================== 네비게이션 관련 ====================

// 로그인 페이지로 리다이렉트
export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // 현재 페이지 정보 저장 (로그인 후 돌아올 페이지)
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    } else {
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('returnUrl', currentPath);
    }
    
    // 로그인 페이지로 이동
    const loginUrl = new URL(window.location.pathname, window.location.origin);
    loginUrl.searchParams.set('view', 'login');
    
    window.location.href = loginUrl.toString();
  } catch (error) {
    console.error('로그인 페이지 이동 오류:', error);
    window.location.href = '/?view=login';
  }
};

// ==================== 커스텀 확인 다이얼로그 ====================

// 커스텀 확인 다이얼로그 생성
const showCustomConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('custom-confirm-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'custom-confirm-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: overlayFadeIn 0.3s ease-out;
    `;

    // 모달 컨테이너 생성
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      padding: 32px 28px;
      max-width: 420px;
      width: 90%;
      position: relative;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
      animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    `;

    // 장식용 상단 그라데이션 바
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5a3c, #f59e0b, #8b5a3c);
      border-radius: 20px 20px 0 0;
    `;

    // 아이콘 컨테이너
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #fef3c7, #f59e0b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
      position: relative;
    `;

    // 아이콘
    const icon = document.createElement('div');
    icon.innerHTML = '🔐';
    icon.style.cssText = `
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    `;

    // 메시지 텍스트
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      font-size: 17px;
      line-height: 1.6;
      color: #1f2937;
      margin-bottom: 28px;
      text-align: center;
      white-space: pre-line;
      font-weight: 500;
    `;
    messageElement.textContent = message;

    // 버튼 컨테이너
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 14px;
      justify-content: center;
    `;

    // 취소 버튼
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '취소';
    cancelButton.style.cssText = `
      padding: 14px 28px;
      border: 2px solid #e5e7eb;
      background: linear-gradient(145deg, #ffffff, #f9fafb);
      color: #6b7280;
      border-radius: 12px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-width: 100px;
    `;

    // 확인 버튼
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '로그인하기';
    confirmButton.style.cssText = `
      padding: 14px 28px;
      border: none;
      background: linear-gradient(135deg, #8b5a3c, #7c4d34);
      color: white;
      border-radius: 12px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(139, 90, 60, 0.3);
      min-width: 120px;
    `;

    // 버튼 호버 효과
    const addButtonEffects = (button: HTMLElement, isConfirm: boolean) => {
      button.addEventListener('mouseenter', () => {
        if (isConfirm) {
          button.style.background = 'linear-gradient(135deg, #7c4d34, #6d3d26)';
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 8px 25px rgba(139, 90, 60, 0.4)';
        } else {
          button.style.background = 'linear-gradient(145deg, #f9fafb, #f3f4f6)';
          button.style.borderColor = '#d1d5db';
          button.style.color = '#374151';
          button.style.transform = 'translateY(-1px)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (isConfirm) {
          button.style.background = 'linear-gradient(135deg, #8b5a3c, #7c4d34)';
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 6px 20px rgba(139, 90, 60, 0.3)';
        } else {
          button.style.background = 'linear-gradient(145deg, #ffffff, #f9fafb)';
          button.style.borderColor = '#e5e7eb';
          button.style.color = '#6b7280';
          button.style.transform = 'translateY(0)';
        }
      });

      button.addEventListener('mousedown', () => {
        button.style.transform = isConfirm ? 'translateY(-1px) scale(0.98)' : 'translateY(0) scale(0.98)';
      });

      button.addEventListener('mouseup', () => {
        button.style.transform = isConfirm ? 'translateY(-2px) scale(1)' : 'translateY(-1px) scale(1)';
      });
    };

    addButtonEffects(cancelButton, false);
    addButtonEffects(confirmButton, true);

    // 이벤트 리스너
    const closeModal = (result: boolean) => {
      overlay.style.animation = 'overlayFadeOut 0.3s ease-in';
      modal.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
      setTimeout(() => {
        overlay.remove();
        const styleElement = document.getElementById('custom-modal-styles');
        if (styleElement) {
          styleElement.remove();
        }
        resolve(result);
      }, 300);
    };

    cancelButton.addEventListener('click', () => closeModal(false));
    confirmButton.addEventListener('click', () => closeModal(true));
    
    // ESC 키로 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyDown);
        closeModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 오버레이 클릭으로 닫기
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(false);
      }
    });

    // DOM에 추가
    iconContainer.appendChild(icon);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(topBar);
    modal.appendChild(iconContainer);
    modal.appendChild(messageElement);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.id = 'custom-modal-styles';
    style.textContent = `
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes overlayFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes modalSlideIn {
        0% {
          opacity: 0;
          transform: scale(0.7) translateY(-50px);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05) translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes modalSlideOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateY(-30px);
        }
      }
      
      @media (max-width: 480px) {
        #custom-confirm-modal > div {
          padding: 28px 24px !important;
          margin: 20px !important;
          border-radius: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // 접근성: 첫 번째 버튼에 포커스
    setTimeout(() => {
      confirmButton.focus();
      confirmButton.style.outline = '2px solid #f59e0b';
      confirmButton.style.outlineOffset = '2px';
    }, 150);
  });
};

// ==================== 로그인 확인 및 프롬프트 ====================

// 로그인 확인 및 유도 다이얼로그
export const checkAuthAndPrompt = (
  actionName: string = '이 기능',
  onConfirm?: () => void,
  onCancel?: () => void
): boolean => {
  if (isLoggedIn()) {
    return true;
  }
  
  // 커스텀 모달을 사용하여 비동기적으로 처리
  showCustomConfirm(
    `${actionName}을 이용하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
  ).then((confirmed) => {
    if (confirmed) {
      if (onConfirm) {
        onConfirm();
      }
      redirectToLogin();
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  });
  
  return false;
};

// 커스텀 다이얼로그용 Promise 기반 함수
export const showLoginPrompt = (
  actionName: string = '이 기능'
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isLoggedIn()) {
      resolve(true);
      return;
    }
    
    showCustomConfirm(
      `${actionName}을 이용하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
    ).then((confirmed) => {
      if (confirmed) {
        redirectToLogin();
        resolve(false);
      } else {
        resolve(false);
      }
    });
  });
};