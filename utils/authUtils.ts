export interface User {
  nickname: string;
  email: string;
  role: string;
}

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');
    return isAuthenticated && !!userData;
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

// 커스텀 확인 다이얼로그 생성
const showCustomConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
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
        // 스타일 태그도 정리
        const styleElement = document.getElementById('custom-modal-styles');
        if (styleElement) {
          styleElement.remove();
        }
        resolve(result);
      }, 300);
    };

    cancelButton.addEventListener('click', () => closeModal(false));
    confirmButton.addEventListener('click', () => closeModal(true));
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyDown);
        closeModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(false);
      }
    });

    iconContainer.appendChild(icon);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(topBar);
    modal.appendChild(iconContainer);
    modal.appendChild(messageElement);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    const style = document.createElement('style');
    style.id = 'custom-modal-styles';
    style.textContent = `
      @keyframes overlayFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes overlayFadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
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
      
      /* 반응형 스타일 */
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

    setTimeout(() => {
      confirmButton.focus();
      confirmButton.style.outline = '2px solid #f59e0b';
      confirmButton.style.outlineOffset = '2px';
    }, 150);
  });
};

export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    } else {
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('returnUrl', currentPath);
    }
    
    const loginUrl = new URL(window.location.pathname, window.location.origin);
    loginUrl.searchParams.set('view', 'login');
    
    window.location.href = loginUrl.toString();
  } catch (error) {
    console.error('로그인 페이지 이동 오류:', error);
    window.location.href = '/?view=login';
  }
};

export const checkAuthAndPrompt = (
  actionName: string = '이 기능',
  onConfirm?: () => void,
  onCancel?: () => void
): boolean => {
  if (isLoggedIn()) {
    return true;
  }
  
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