export interface User {
  id: string;
  nickname: string;
  email: string;
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
      const currentHref = window.location.href;
      sessionStorage.setItem('returnUrl', currentHref);
    }
    
    // 로그인 페이지로 이동
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const loginUrl = new URL(baseUrl);
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
  if (isLoggedIn()) {
    return true;
  }
  
  const confirmed = window.confirm(
    `${actionName}은 로그인한 회원만 이용할 수 있습니다.\n로그인하시겠습니까?`
  );
  
  if (confirmed) {
    if (onConfirm) {
      onConfirm();
    }
    redirectToLogin();
    return false;
  } else {
    if (onCancel) {
      onCancel();
    }
    return false;
  }
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
    
    const confirmed = window.confirm(
      `${actionName}은 로그인한 회원만 이용할 수 있습니다.\n로그인하시겠습니까?`
    );
    
    if (confirmed) {
      redirectToLogin();
      resolve(false); // 로그인 페이지로 이동하므로 현재 액션은 중단
    } else {
      resolve(false); // 사용자가 취소
    }
  });
};