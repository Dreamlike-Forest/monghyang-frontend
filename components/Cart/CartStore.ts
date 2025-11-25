import { ProductWithDetails } from '../../types/mockData';
import { getProductById, convertDetailToProductWithDetails } from '../../utils/shopApi';
import { 
  getMyCart, 
  addToCartApi, 
  increaseCartQuantity, 
  decreaseCartQuantity, 
  updateCartQuantityApi, 
  removeCartItemApi 
} from '../../utils/cartApi';
import { isLoggedIn } from '../../utils/authUtils';

// UI에서 사용할 장바구니 아이템 인터페이스
export interface CartItem {
  cart_id: number;
  product: ProductWithDetails;
  selectedOptionId: number;
  quantity: number;
  maxQuantity: number;
}

// 전역 상태
let globalCartItems: CartItem[] = [];
let cartListeners: (() => void)[] = [];
let isFetching = false;

// 상태 변경 알림
const notifyCartChange = () => {
  cartListeners.forEach(listener => listener());
};

/**
 * 서버 장바구니 데이터와 상품 상세 정보를 동기화하는 함수
 */
export const fetchCartItems = async (): Promise<void> => {
  if (!isLoggedIn()) {
    globalCartItems = [];
    notifyCartChange();
    return;
  }

  if (isFetching) return;
  isFetching = true;

  try {
    const cartList = await getMyCart();
    
    if (!cartList || cartList.length === 0) {
      globalCartItems = [];
      notifyCartChange();
      return;
    }

    const itemsWithDetails = await Promise.all(
      cartList.map(async (item) => {
        try {
          const productDetail = await getProductById(item.product_id);
          if (!productDetail) return null;

          const product = convertDetailToProductWithDetails(productDetail);

          return {
            cart_id: item.cart_id,
            product: product,
            selectedOptionId: 1,
            quantity: item.cart_quantity,
            maxQuantity: 99
          } as CartItem;
        } catch (error) {
          console.error(`상품(ID:${item.product_id}) 정보 로드 실패`, error);
          return null;
        }
      })
    );

    globalCartItems = itemsWithDetails.filter((item): item is CartItem => item !== null);
    notifyCartChange();

  } catch (error) {
    console.error('장바구니 동기화 실패:', error);
  } finally {
    isFetching = false;
  }
};

// =================================================================
// [수정됨] 에러 메시지를 명확하게 처리하는 장바구니 추가 로직
// =================================================================
export const addToCart = async (
  product: ProductWithDetails, 
  selectedOptionId?: number, 
  quantity: number = 1
): Promise<boolean> => {
  if (!isLoggedIn()) {
    alert('로그인이 필요한 서비스입니다.');
    return false;
  }

  try {
    // 1. 일단 추가 시도 (POST /api/cart)
    console.log(`[CartStore] 장바구니 추가 시도: ID=${product.product_id}, 수량=${quantity}`);
    await addToCartApi(product.product_id, quantity);
    
    // 성공 시 목록 갱신
    await fetchCartItems();
    return true;

  } catch (error: any) {
    // 2. 400 에러 발생 시
    if (error.response?.status === 400) {
      console.warn('[CartStore] 400 에러 발생. 중복 여부 및 사유 확인 중...');

      try {
        // A. 최신 장바구니 데이터 직접 조회
        const currentCartList = await getMyCart();
        
        // B. 해당 상품 찾기 (타입 안전성을 위해 String 변환 비교)
        const targetItem = currentCartList.find(
          item => String(item.product_id) === String(product.product_id)
        );

        // [CASE 1] 이미 존재하는 상품 -> 수량 합치기 로직 실행
        if (targetItem) {
          const newQuantity = targetItem.cart_quantity + quantity;
          
          if (newQuantity > 99) {
            alert(`장바구니 최대 수량(99개)을 초과합니다.\n현재 수량: ${targetItem.cart_quantity}개`);
            return false;
          }

          console.log(`[CartStore] 중복 상품 발견 (CartID: ${targetItem.cart_id}). 수량 업데이트: ${targetItem.cart_quantity} -> ${newQuantity}`);
          
          // 수량 업데이트 API 호출
          await updateCartQuantityApi(targetItem.cart_id, newQuantity);
          await fetchCartItems();
          return true;

        } else {
          // [CASE 2] 장바구니에 없는데 400 에러 -> 서버에서 보낸 사유 출력
          const serverMessage = error.response?.data?.message || '';
          
          console.error('[CartStore] 장바구니 추가 불가 사유:', serverMessage);

          if (serverMessage.includes('주문할 수 없는')) {
             alert(`상품을 담을 수 없습니다.\n(원인: 판매자 본인 상품이거나 품절된 상품입니다)`);
          } else if (serverMessage) {
             alert(`상품을 담을 수 없습니다.\n사유: ${serverMessage}`);
          } else {
             alert('상품을 담는 중 오류가 발생했습니다.\n(판매자 계정으로는 본인 상품을 구매할 수 없습니다.)');
          }
          return false;
        }
      } catch (retryError) {
        console.error('수량 업데이트 재시도 중 오류:', retryError);
        alert('장바구니 업데이트에 실패했습니다.');
        return false;
      }
    } 
    
    // 3. 그 외 에러 (500 등)
    console.error('장바구니 추가 실패 (기타 오류):', error);
    alert('서버 오류로 장바구니에 담지 못했습니다.');
    return false;
  }
};

// 수량 변경 (기존 유지)
export const updateCartItemQuantity = async (
  cartId: number, 
  currentQuantity: number,
  newQuantity: number
): Promise<boolean> => {
  try {
    if (newQuantity === currentQuantity + 1) {
      await increaseCartQuantity(cartId);
    } else if (newQuantity === currentQuantity - 1) {
      await decreaseCartQuantity(cartId);
    } else {
      await updateCartQuantityApi(cartId, newQuantity);
    }
    await fetchCartItems();
    return true;
  } catch (error) {
    console.error('수량 변경 실패:', error);
    return false;
  }
};

// 삭제 (기존 유지)
export const removeFromCart = async (cartId: number): Promise<boolean> => {
  try {
    await removeCartItemApi(cartId);
    await fetchCartItems();
    return true;
  } catch (error) {
    console.error('삭제 실패:', error);
    return false;
  }
};

// 비우기 (기존 유지)
export const clearCart = async (): Promise<void> => {
  try {
    const ids = globalCartItems.map(item => item.cart_id);
    await Promise.all(ids.map(id => removeCartItemApi(id)));
    await fetchCartItems();
  } catch (error) {
    console.error('비우기 실패:', error);
  }
};

// Getters & Subscribers
export const getCartItems = (): CartItem[] => [...globalCartItems];
export const getCartItemCount = (): number => globalCartItems.reduce((total, item) => total + item.quantity, 0);
export const subscribeToCart = (listener: () => void): (() => void) => {
  cartListeners.push(listener);
  return () => {
    const index = cartListeners.indexOf(listener);
    if (index > -1) cartListeners.splice(index, 1);
  };
};
export const initCart = () => {
  if (globalCartItems.length === 0) fetchCartItems();
};