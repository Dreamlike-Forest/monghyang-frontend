export type UserRole = 'ROLE_ADMIN' | 'ROLE_BREWERY' | 'ROLE_SELLER' | 'ROLE_USER';

// 역할 계층 (숫자가 높을수록 더 많은 권한)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ROLE_ADMIN: 4,
  ROLE_BREWERY: 3,
  ROLE_SELLER: 2,
  ROLE_USER: 1,
};

// 역할 한글 표시
export const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_ADMIN: '관리자',
  ROLE_BREWERY: '양조장',
  ROLE_SELLER: '판매자',
  ROLE_USER: '일반 사용자',
};

export interface User {
  id: string;
  nickname: string;
  email: string;
  role: UserRole;
}

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');
    return isAuthenticated && !!userData;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
};

// 현재 사용자 정보 가져오기 (수정됨: 백엔드 필드명 + loginInfo 우선 사용)
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // 1. 먼저 loginInfo에서 빠르게 가져오기 (로그인 응답 body)
    const loginInfo = localStorage.getItem('loginInfo');
    const userData = localStorage.getItem('userData');
    
    if (loginInfo) {
      const loginParsed = JSON.parse(loginInfo);
      // loginInfo가 있으면 이걸 우선 사용 (가장 빠름)
      return {
        id: '', // loginInfo에는 id가 없음
        nickname: loginParsed.nickname || '',
        email: '', // loginInfo에는 email이 없음
        role: normalizeRole(loginParsed.role),
      };
    }
    
    // 2. userData에서 상세 정보 가져오기 (백엔드 필드명 맞춤)
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        id: parsed.users_id?.toString() || parsed.userId?.toString() || parsed.id?.toString() || '',
        nickname: parsed.users_nickname || parsed.nickname || '',
        email: parsed.users_email || parsed.email || '',
        role: normalizeRole(parsed.role_name || parsed.role),
      };
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
};

// 빠른 nickname 조회 (신규 추가)
export const getCurrentUserNickname = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    // loginInfo에서 먼저 확인 (가장 빠름)
    const loginInfo = localStorage.getItem('loginInfo');
    if (loginInfo) {
      const parsed = JSON.parse(loginInfo);
      if (parsed.nickname) return parsed.nickname;
    }
    
    // userData에서 확인 (백엔드 필드명)
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.users_nickname || parsed.nickname || '';
    }
    
    return '';
  } catch (error) {
    console.error('nickname 조회 오류:', error);
    return '';
  }
};

// 역할 문자열 정규화
const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'ROLE_USER';
  
  const upperRole = role.toUpperCase();
  
  if (upperRole.includes('ADMIN')) return 'ROLE_ADMIN';
  if (upperRole.includes('BREWERY')) return 'ROLE_BREWERY';
  if (upperRole.includes('SELLER')) return 'ROLE_SELLER';
  return 'ROLE_USER';
};

// 현재 사용자 역할 가져오기
export const getCurrentUserRole = (): UserRole | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // loginInfo에서 먼저 확인 (가장 빠름)
    const loginInfo = localStorage.getItem('loginInfo');
    if (loginInfo) {
      const parsed = JSON.parse(loginInfo);
      if (parsed.role) return normalizeRole(parsed.role);
    }
    
    // userData에서 확인
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return normalizeRole(parsed.role_name || parsed.role);
    }
    
    return null;
  } catch (error) {
    console.error('role 조회 오류:', error);
    return null;
  }
};

// 특정 역할 이상인지 확인
export const hasRole = (requiredRole: UserRole): boolean => {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;
  
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
};

// 특정 역할과 정확히 일치하는지 확인
export const hasExactRole = (role: UserRole): boolean => {
  return getCurrentUserRole() === role;
};

// 관리자 여부
export const isAdmin = (): boolean => hasExactRole('ROLE_ADMIN');

// 양조장 관리자 여부
export const isBrewery = (): boolean => hasExactRole('ROLE_BREWERY');

// 판매자 여부
export const isSeller = (): boolean => hasExactRole('ROLE_SELLER');

// 일반 사용자 여부
export const isUser = (): boolean => hasExactRole('ROLE_USER');

// 역할 한글명 가져오기
export const getRoleLabel = (role?: UserRole): string => {
  if (!role) return '비회원';
  return ROLE_LABELS[role] || '알 수 없음';
};

// 현재 사용자 역할 한글명
export const getCurrentUserRoleLabel = (): string => {
  const role = getCurrentUserRole();
  return getRoleLabel(role || undefined);
};

// 권한 체크 후 액션 실행
export const withPermission = <T>(
  requiredRole: UserRole,
  action: () => T,
  onDenied?: () => void
): T | null => {
  if (hasRole(requiredRole)) {
    return action();
  }
  
  if (onDenied) {
    onDenied();
  } else {
    showPermissionDeniedAlert(requiredRole);
  }
  return null;
};

// 권한 부족 알림
const showPermissionDeniedAlert = (requiredRole: UserRole): void => {
  const roleLabel = ROLE_LABELS[requiredRole];
  alert(`이 기능은 ${roleLabel} 이상만 이용할 수 있습니다.`);
};

// 커스텀 확인 다이얼로그 생성
const showCustomConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const existingModal = document.getElementById('custom-confirm-modal');
    if (existingModal) existingModal.remove();

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
    `;

    const icon = document.createElement('div');
    icon.innerHTML = '🔐';
    icon.style.cssText = `font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));`;

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

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `display: flex; gap: 14px; justify-content: center;`;

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
      min-width: 100px;
    `;

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
      box-shadow: 0 6px 20px rgba(139, 90, 60, 0.3);
      min-width: 120px;
    `;

    const closeModal = (result: boolean) => {
      overlay.style.animation = 'overlayFadeOut 0.3s ease-in';
      modal.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
      setTimeout(() => {
        overlay.remove();
        const styleElement = document.getElementById('custom-modal-styles');
        if (styleElement) styleElement.remove();
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
      if (e.target === overlay) closeModal(false);
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
      @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes overlayFadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes modalSlideIn {
        0% { opacity: 0; transform: scale(0.7) translateY(-50px); }
        50% { opacity: 0.8; transform: scale(1.05) translateY(-10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes modalSlideOut {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to { opacity: 0; transform: scale(0.8) translateY(-30px); }
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

    setTimeout(() => {
      confirmButton.focus();
      confirmButton.style.outline = '2px solid #f59e0b';
      confirmButton.style.outlineOffset = '2px';
    }, 150);
  });
};

// 로그인 페이지로 리다이렉트
export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window === 'undefined') return;
  
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

// 로그인 확인 및 유도 다이얼로그
export const checkAuthAndPrompt = (
  actionName: string = '이 기능',
  onConfirm?: () => void,
  onCancel?: () => void
): boolean => {
  if (isLoggedIn()) return true;
  
  showCustomConfirm(
    `${actionName}을 이용하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
  ).then((confirmed) => {
    if (confirmed) {
      if (onConfirm) onConfirm();
      redirectToLogin();
    } else {
      if (onCancel) onCancel();
    }
  });
  
  return false;
};

// 권한 확인 및 유도 다이얼로그
export const checkRoleAndPrompt = (
  requiredRole: UserRole,
  actionName: string = '이 기능'
): boolean => {
  if (!isLoggedIn()) {
    checkAuthAndPrompt(actionName);
    return false;
  }
  
  if (!hasRole(requiredRole)) {
    const roleLabel = ROLE_LABELS[requiredRole];
    alert(`${actionName}은 ${roleLabel} 이상만 이용할 수 있습니다.`);
    return false;
  }
  
  return true;
};

// Promise 기반 로그인 프롬프트
export const showLoginPrompt = (actionName: string = '이 기능'): Promise<boolean> => {
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