import { ProductWithDetails } from '../../types/mockData';

// 장바구니 아이템 인터페이스
export interface CartItem {
  product: ProductWithDetails;
  selectedOptionId: number;
  quantity: number;
  maxQuantity: number;
  addedAt: string;
}

// localStorage 키
const CART_STORAGE_KEY = 'monghyang_cart_items';

// 전역 장바구니 상태 (메모리 기반 + localStorage 동기화)
let globalCartItems: CartItem[] = [];
let cartListeners: (() => void)[] = [];
let isInitialized = false;

// localStorage에서 장바구니 데이터 로드
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('localStorage에서 장바구니 로드:', parsed.length, '개 상품');
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('장바구니 localStorage 로드 오류:', error);
    // 오류 발생 시 localStorage 정리
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (cleanupError) {
      console.error('localStorage 정리 실패:', cleanupError);
    }
  }
  
  return [];
};

// localStorage에 장바구니 데이터 저장
const saveCartToStorage = (items: CartItem[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    console.log('localStorage에 장바구니 저장:', items.length, '개 상품');
  } catch (error) {
    console.error('장바구니 localStorage 저장 오류:', error);
    // 용량 초과 등의 문제가 발생한 경우 기존 데이터 정리
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      console.log('localStorage 용량 문제로 장바구니 데이터 초기화');
    } catch (cleanupError) {
      console.error('localStorage 정리 실패:', cleanupError);
    }
  }
};

// 초기화 함수
const initializeCart = (): void => {
  if (isInitialized) {
    return;
  }
  
  globalCartItems = loadCartFromStorage();
  isInitialized = true;
  console.log('장바구니 초기화 완료:', globalCartItems.length, '개 상품');
};

// 장바구니 변경 알림
const notifyCartChange = (): void => {
  // localStorage에 저장
  saveCartToStorage(globalCartItems);
  
  console.log('장바구니 상태 변경:', globalCartItems.length, '개 상품');
  cartListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('장바구니 리스너 오류:', error);
    }
  });
};

// 장바구니에 상품 추가
export const addToCart = (
  product: ProductWithDetails, 
  selectedOptionId?: number, 
  quantity: number = 1
): boolean => {
  try {
    // 초기화 확인
    initializeCart();
    
    console.log('장바구니에 추가:', product.name);
    
    const optionId = selectedOptionId || product.options[0]?.product_option_id || 1;
    
    // 기존 상품이 있는지 확인
    const existingItemIndex = globalCartItems.findIndex(
      item => item.product.product_id === product.product_id && 
               item.selectedOptionId === optionId
    );

    if (existingItemIndex >= 0) {
      // 기존 상품이 있으면 수량 증가
      const existingItem = globalCartItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      const maxQuantity = existingItem.maxQuantity;
      
      if (newQuantity <= maxQuantity) {
        globalCartItems[existingItemIndex].quantity = newQuantity;
        console.log('수량 증가:', product.name, '→', newQuantity);
        notifyCartChange();
        return true;
      } else {
        console.log('최대 수량 초과:', product.name);
        return false;
      }
    } else {
      // 새로운 상품 추가
      const newItem: CartItem = {
        product,
        selectedOptionId: optionId,
        quantity,
        maxQuantity: 99,
        addedAt: new Date().toISOString()
      };
      
      globalCartItems.push(newItem);
      console.log('새 상품 추가 완료:', product.name, '(총', globalCartItems.length, '개)');
      notifyCartChange();
      return true;
    }
  } catch (error) {
    console.error('장바구니 추가 중 오류:', error);
    return false;
  }
};

// 장바구니 아이템 가져오기
export const getCartItems = (): CartItem[] => {
  initializeCart();
  return [...globalCartItems];
};

// 장바구니 아이템 수량 업데이트
export const updateCartItemQuantity = (
  productId: number, 
  optionId: number, 
  newQuantity: number
): boolean => {
  try {
    initializeCart();
    
    const itemIndex = globalCartItems.findIndex(
      item => item.product.product_id === productId && 
               item.selectedOptionId === optionId
    );

    if (itemIndex >= 0) {
      if (newQuantity <= 0) {
        globalCartItems.splice(itemIndex, 1);
        console.log('상품 제거 (수량 0):', productId);
      } else {
        const maxQuantity = globalCartItems[itemIndex].maxQuantity;
        globalCartItems[itemIndex].quantity = Math.min(newQuantity, maxQuantity);
        console.log('수량 업데이트:', productId, '→', globalCartItems[itemIndex].quantity);
      }
      notifyCartChange();
      return true;
    }
    return false;
  } catch (error) {
    console.error('장바구니 수량 업데이트 중 오류:', error);
    return false;
  }
};

// 장바구니에서 아이템 제거
export const removeFromCart = (productId: number, optionId: number): boolean => {
  try {
    initializeCart();
    
    const itemIndex = globalCartItems.findIndex(
      item => item.product.product_id === productId && 
               item.selectedOptionId === optionId
    );

    if (itemIndex >= 0) {
      const removedItem = globalCartItems.splice(itemIndex, 1)[0];
      console.log('상품 제거:', removedItem.product.name);
      notifyCartChange();
      return true;
    }
    return false;
  } catch (error) {
    console.error('장바구니에서 제거 중 오류:', error);
    return false;
  }
};

// 장바구니 전체 비우기
export const clearCart = (): void => {
  try {
    globalCartItems.length = 0;
    console.log('장바구니 전체 비우기');
    notifyCartChange();
  } catch (error) {
    console.error('장바구니 비우기 중 오류:', error);
  }
};

// 장바구니 총 아이템 수 가져오기
export const getCartItemCount = (): number => {
  initializeCart();
  return globalCartItems.reduce((total, item) => total + item.quantity, 0);
};

// 장바구니 변경 리스너 등록
export const subscribeToCart = (listener: () => void): (() => void) => {
  cartListeners.push(listener);
  console.log('장바구니 리스너 등록, 총 리스너 수:', cartListeners.length);
  
  return () => {
    const index = cartListeners.indexOf(listener);
    if (index > -1) {
      cartListeners.splice(index, 1);
      console.log('장바구니 리스너 제거, 남은 리스너 수:', cartListeners.length);
    }
  };
};

// 개발/디버깅용 함수들
export const debugCartState = (): void => {
  initializeCart();
  console.log('=== 장바구니 상태 디버그 ===');
  console.log('총 상품 수:', globalCartItems.length);
  console.log('총 아이템 수:', getCartItemCount());
  console.log('리스너 수:', cartListeners.length);
  console.log('상품 목록:', globalCartItems.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    optionId: item.selectedOptionId
  })));
  console.log('localStorage 키:', CART_STORAGE_KEY);
  
  // localStorage 상태도 확인
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      console.log('localStorage 원본 데이터:', stored);
    } catch (error) {
      console.log('localStorage 접근 불가:', error);
    }
  }
  console.log('========================');
};

// localStorage 정리 함수 (필요시 사용)
export const clearCartStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      globalCartItems.length = 0;
      isInitialized = false;
      console.log('장바구니 localStorage 정리 완료');
      notifyCartChange();
    } catch (error) {
      console.error('장바구니 localStorage 정리 실패:', error);
    }
  }
};