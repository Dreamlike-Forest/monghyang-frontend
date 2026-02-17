import apiClient from './api';
import {
  ApiResponse,
  PageResponse,
  ProductListItem,
  ProductDetail,
  ProductImageDto,
  ProductSearchParams,
} from '../types/product';
import type { ProductWithDetails } from '../types/shop';
import { ALCOHOL_TAG_IDS } from './brewery';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getImageUrl = (imageKey: string | null | undefined): string => {
  if (!imageKey) return '/images/no-image.png';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) return imageKey;
  return `${API_URL}/api/image/${imageKey}`;
};

const createEmptyPageResponse = <T>(): PageResponse<T> => ({
  content: [],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    sort: { empty: true, sorted: false, unsorted: true },
    offset: 0,
    paged: true,
    unpaged: false,
  },
  totalPages: 0,
  totalElements: 0,
  last: true,
  size: 10,
  number: 0,
  sort: { empty: true, sorted: false, unsorted: true },
  numberOfElements: 0,
  first: true,
  empty: true,
});

const normalizePageResponse = <T>(response: any): PageResponse<T> => {
  return {
    content: response.content || [],
    pageable: response.pageable || {
      pageNumber: response.page_number || response.number || 0,
      pageSize: response.page_size || response.size || 10,
      sort: response.sort || { empty: true, sorted: false, unsorted: true },
      offset: response.offset || 0,
      paged: true,
      unpaged: false,
    },
    totalPages: response.totalPages || response.total_pages || 0,
    totalElements: response.totalElements || response.total_elements || 0,
    last: response.last ?? true,
    size: response.size || 10,
    number: response.number || 0,
    sort: response.sort || { empty: true, sorted: false, unsorted: true },
    numberOfElements: response.numberOfElements || 0,
    first: response.first ?? true,
    empty: response.empty ?? (response.content?.length === 0),
  };
};

export const searchProducts = async (
  params: ProductSearchParams
): Promise<PageResponse<ProductListItem>> => {
  try {
    const { startOffset, ...queryParams } = params;

    const filteredParams = Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/search/${startOffset}`,
      { params: filteredParams }
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    console.error('상품 검색 실패:', error);
    return createEmptyPageResponse<ProductListItem>();
  }
};

export const getLatestProducts = async (
  startOffset: number
): Promise<PageResponse<ProductListItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/latest/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    console.error('최신 상품 조회 실패:', error);
    return createEmptyPageResponse<ProductListItem>();
  }
};

export const getProductsByUserId = async (
  userId: number,
  startOffset: number
): Promise<PageResponse<ProductListItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/by-user/${userId}/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return createEmptyPageResponse<ProductListItem>();
    }
    console.error('사용자별 상품 조회 실패:', error);
    return createEmptyPageResponse<ProductListItem>();
  }
};

export const getProductById = async (
  productId: number
): Promise<ProductDetail | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(
      `/api/product/${productId}`
    );
    return response.data.content;
  } catch (error: any) {
    console.error('상품 상세 조회 실패:', error);
    return null;
  }
};

// ProductListItem을 ProductWithDetails로 변환 (백엔드 API 형식 유지)
export const convertToProductWithDetails = (item: ProductListItem): ProductWithDetails => {
  return {
    product_id: item.product_id,
    product_name: item.product_name,
    product_alcohol: item.product_alcohol,
    product_volume: item.product_volume,
    product_sales_volume: item.product_sales_volume,
    product_registered_at: new Date().toISOString(),
    product_final_price: item.product_final_price,
    product_discount_rate: item.product_discount_rate,
    product_origin_price: item.product_origin_price,
    product_is_online_sell: item.product_is_online_sell,
    product_is_soldout: item.product_is_soldout,
    product_review_star: item.product_review_star,
    product_review_count: item.product_review_count,
    user_nickname: item.users_nickname,
    image_key: getImageUrl(item.image_key),
    tags_name: item.tag_name || [],
  };
};

// ProductDetail을 ProductWithDetails로 변환 (백엔드 API 형식 유지)
export const convertDetailToProductWithDetails = (detail: ProductDetail): ProductWithDetails => {
  const firstImageKey = detail.product_image_image_key?.[0]?.product_image_image_key || null;

  return {
    product_id: detail.product_id,
    product_name: detail.product_name,
    product_alcohol: detail.product_alcohol,
    product_volume: detail.product_volume,
    product_sales_volume: detail.product_sales_volume,
    product_description: detail.product_description,
    product_registered_at: detail.product_registered_at,
    product_final_price: detail.product_final_price,
    product_discount_rate: detail.product_discount_rate,
    product_origin_price: detail.product_origin_price,
    product_is_online_sell: detail.product_is_online_sell,
    product_is_soldout: detail.product_is_soldout,
    user_nickname: detail.user_nickname,
    image_key: getImageUrl(firstImageKey),
    product_image_image_key: detail.product_image_image_key?.map(img => ({
      product_image_image_key: img.product_image_image_key,
      product_image_seq: img.product_image_seq,
    })),
    tags_name: detail.tags_name || [],
    owner: detail.owner,
  };
};