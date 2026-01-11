import { ProductWithDetails } from '../../types/shop';
import { getProductById, convertDetailToProductWithDetails } from '../../utils/shopApi';
import { 
  getMyCart, 
  addToCartApi, 
  updateCartQuantityApi, 
  removeCartItemApi,
  increaseCartQuantity,
  decreaseCartQuantity
} from '../../utils/cartApi';
import { isLoggedIn } from '../../utils/authUtils';

export interface CartItem {
  cart_id: number;
  product: ProductWithDetails;
  selectedOptionId: number;
  quantity: number;
  maxQuantity: number;
}

let globalCartItems: CartItem[] = [];
let cartListeners: (() => void)[] = [];
let isFetching = false;

const notifyCartChange = () => {
  cartListeners.forEach(listener => listener());
};

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
          return null;
        }
      })
    );
    globalCartItems = itemsWithDetails.filter((item): item is CartItem => item !== null);
    notifyCartChange();
  } catch (error) {
    console.error(error);
  } finally {
    isFetching = false;
  }
};

export const addToCart = async (product: ProductWithDetails, selectedOptionId?: number, quantity: number = 1) => {
  if (!isLoggedIn()) return false;
  try {
    await addToCartApi(product.product_id, quantity);
    await fetchCartItems();
    return true;
  } catch (error: any) {
    if (error.response?.status === 400) {
      try {
        const currentCartList = await getMyCart();
        const targetItem = currentCartList.find(
          item => String(item.product_id) === String(product.product_id)
        );
        if (targetItem) {
          const newQuantity = targetItem.cart_quantity + quantity;
          await updateCartQuantityApi(targetItem.cart_id, newQuantity);
          await fetchCartItems();
          return true;
        }
      } catch (retryError) { return false; }
    } 
    return false;
  }
};

export const updateCartItemQuantity = async (cartId: number, currentQuantity: number, newQuantity: number) => {
  try {
    await updateCartQuantityApi(cartId, newQuantity);
    await fetchCartItems();
    return true;
  } catch (e) { return false; }
};

export const removeFromCart = async (cartId: number) => {
  try {
    await removeCartItemApi(cartId);
    await fetchCartItems();
    return true;
  } catch (e) { return false; }
};

// [수정됨] 장바구니 비우기
export const clearCart = async (): Promise<void> => {
  try {
    const serverCart = await getMyCart();
    if (serverCart && serverCart.length > 0) {
      const ids = serverCart.map(item => item.cart_id);
      await Promise.allSettled(ids.map(id => removeCartItemApi(id)));
    }
  } catch (error) {
    console.error('장바구니 비우기 API 실패:', error);
  } finally {
    globalCartItems = [];
    notifyCartChange();
  }
};

export const getCartItems = () => [...globalCartItems];
export const getCartItemCount = () => globalCartItems.reduce((t, i) => t + i.quantity, 0);
export const subscribeToCart = (l: () => void) => {
  cartListeners.push(l);
  return () => { const i = cartListeners.indexOf(l); if(i>-1) cartListeners.splice(i, 1); };
};
export const initCart = () => { if(globalCartItems.length === 0) fetchCartItems(); };