import apiClient from './api';
import {
  ApiResponse,
  PageResponse,
  ProductListItem,
  ProductDetail as ProductDetailType,
  ProductSearchParams,
} from '../types/product';
import { ALCOHOL_TAG_IDS } from './brewery'; // 양조장에서 정의한 ID 상수 재사용

export const getImageUrl = (imageKey: string | null | undefined): string => {
  if (!imageKey) return '/images/no-image.png';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) return imageKey;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';
  return `${API_URL}/api/image/${imageKey}`;
};

// 빈 페이지 응답 생성 헬퍼 함수
const createEmptyPageResponse = <T>(): PageResponse<T> => ({
  content: [],
  pageable: {
    pageNumber: 0, pageSize: 10, sort: { empty: true, sorted: false, unsorted: true },
    offset: 0, paged: true, unpaged: false,
  },
  totalPages: 0, totalElements: 0, last: true, size: 10, number: 0,
  sort: { empty: true, sorted: false, unsorted: true },
  numberOfElements: 0, first: true, empty: true,
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

export interface ProductImageDto {
  product_image_image_key: string;
  product_image_seq: number;
}

export interface ProductOwnerDto {
  owner_id: number;
  owner_role: 'ROLE_BREWERY' | 'ROLE_SELLER';
  owner_region?: string;
  image_key?: string;
  tags_name?: string[];
}

export interface ProductDetailDto {
  product_id: number;
  product_name: string;
  product_alcohol: number;
  product_sales_volume: number;
  product_volume: number;
  product_description: string;
  product_registered_at: string;
  product_final_price: number;
  product_discount_rate: number;
  product_origin_price: number;
  product_is_online_sell: boolean;
  product_is_soldout: boolean;
  user_nickname: string;
  product_image_image_key: ProductImageDto[];
  tags_name: string[];
  owner: ProductOwnerDto;
}

export const searchProducts = async (
  params: ProductSearchParams
): Promise<PageResponse<ProductListItem>> => {
  try {
    const { startOffset, ...queryParams } = params;
    
    // 필터 파라미터가 undefined나 null이 아닌 경우에만 포함
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
    console.error('사용자별 상품 조회 실패:', error);
    return createEmptyPageResponse<ProductListItem>();
  }
};

export const getProductById = async (
  productId: number
): Promise<ProductDetailDto | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(
      `/api/product/${productId}`
    );
    return response.data.content;
  } catch (error: any) {
    console.error('상품 상세 조회 실패:', error);
    return null;
  }
};

export const convertToProductWithDetails = (item: ProductListItem): any => {
  const breweryId = (item as any).owner_id || (item as any).brewery_id || 0;
  const userId = (item as any).user_id || 0;

  return {
    product_id: item.product_id,
    name: item.product_name,
    brewery: item.users_nickname,
    alcohol: item.product_alcohol,
    volume: item.product_volume,
    minPrice: Number(item.product_final_price),
    maxPrice: Number(item.product_final_price),
    originalPrice: Number(item.product_origin_price),
    discountRate: Number(item.product_discount_rate),
    averageRating: item.product_review_star || 0,
    reviewCount: item.product_review_count || 0,
    image_key: getImageUrl(item.image_key),
    tags: (item.tag_name || []).map((tag, index) => ({
      product_tag_id: index,
      product_tag_type_id: index,
      product_id: item.product_id,
      tagType: { product_tag_type_id: index, name: tag }
    })),
    registered_at: new Date().toISOString(),
    is_sell: true,
    is_delete: false,
    user_id: userId,
    brewery_id: breweryId, 
    options: [{
        product_option_id: 1, 
        product_id: item.product_id, 
        volume: item.product_volume,
        price: Number(item.product_final_price) 
    }],
    images: [],
    reviews: [],
    isBest: item.product_sales_volume > 100,
    isNew: false,
    info: { product_info_id: 0, product_id: item.product_id, description: null }
  };
};

export const convertDetailToProductWithDetails = (detail: ProductDetailDto): any => {
  const processImages = (images: ProductImageDto[]) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map((img, index) => ({
      product_image_id: index,
      product_id: detail.product_id,
      key: img.product_image_image_key,
      image_key: getImageUrl(img.product_image_image_key),
      seq: img.product_image_seq
    }));
  };

  const processedImages = processImages(detail.product_image_image_key);
  const firstImageKey = detail.product_image_image_key?.[0]?.product_image_image_key || null;

  let breweryId = 0;
  let breweryName = detail.user_nickname;

  if (detail.owner) {
    if (detail.owner.owner_role === 'ROLE_BREWERY') {
      breweryId = detail.owner.owner_id;
    } else if (detail.owner.owner_role === 'ROLE_SELLER') {
      breweryId = 0; 
    }
  }

  return {
    product_id: detail.product_id,
    name: detail.product_name,
    brewery: breweryName, 
    alcohol: detail.product_alcohol,
    volume: detail.product_volume,
    minPrice: Number(detail.product_final_price),
    maxPrice: Number(detail.product_final_price),
    originalPrice: Number(detail.product_origin_price),
    discountRate: Number(detail.product_discount_rate),
    averageRating: 0, 
    reviewCount: 0,   
    image_key: getImageUrl(firstImageKey),
    images: processedImages,
    tags: (detail.tags_name || []).map((tag, index) => ({
      product_tag_id: index,
      product_tag_type_id: index,
      product_id: detail.product_id,
      tagType: { product_tag_type_id: index, name: tag }
    })),
    registered_at: detail.product_registered_at,
    is_sell: !detail.product_is_soldout && detail.product_is_online_sell,
    is_delete: false,
    user_id: detail.owner?.owner_id || 0,
    brewery_id: breweryId,
    options: [
      {
        product_option_id: 1,
        product_id: detail.product_id,
        volume: detail.product_volume,
        price: Number(detail.product_final_price)
      }
    ],
    reviews: [],
    isBest: false,
    isNew: false,
    info: {
      product_info_id: 0,
      product_id: detail.product_id,
      description: detail.product_description 
    }
  };
};