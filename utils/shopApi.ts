import apiClient from './api';
import {
  ApiResponse,
  PageResponse,
  ProductListItem,
  ProductDetail as ProductDetailType, // 이름 충돌 방지
  ProductSearchParams,
} from '../types/product';

// 이미지 키를 전체 URL로 변환
const getImageUrl = (imageKey: string | null | undefined): string => {
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

// =================================================================
// [수정됨] API 응답 타입 정의 (스크린샷 기반)
// =================================================================
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

// 상세 조회 응답 DTO
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

// =================================================================
// API 호출 함수들
// =================================================================

// 상품 필터링 검색
export const searchProducts = async (
  params: ProductSearchParams
): Promise<PageResponse<ProductListItem>> => {
  try {
    const { startOffset, ...queryParams } = params;
    // 파라미터 전처리
    const filteredParams = Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          acc[key] = value.join(',');
        } else {
          acc[key] = value;
        }
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

// 상품 최신순 조회
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

// 특정 판매자의 모든 상품 조회
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

// [수정됨] 특정 상품 상세 조회
export const getProductById = async (
  productId: number
): Promise<ProductDetailDto | null> => {
  try {
    console.log('🔍 상품 상세 조회 요청:', `/api/product/${productId}`);
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(
      `/api/product/${productId}`
    );
    
    // API 응답 로그 확인
    // console.log('✅ 상품 상세 조회 성공 (Raw):', response.data.content);
    
    return response.data.content;
  } catch (error: any) {
    console.error('상품 상세 조회 실패:', error);
    return null;
  }
};

// =================================================================
// 변환 함수들 (Converter)
// =================================================================

// 리스트 아이템 변환
export const convertToProductWithDetails = (item: ProductListItem): any => {
  // 리스트에서는 owner_id 정보가 불확실할 수 있으므로 기본 처리
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

// [핵심 수정] 상세 정보 변환 (스크린샷 명세 반영)
export const convertDetailToProductWithDetails = (detail: ProductDetailDto): any => {
  
  // 1. 이미지 배열 처리
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
  
  // 첫 번째 이미지를 대표 이미지로 사용
  const firstImageKey = detail.product_image_image_key?.[0]?.product_image_image_key || null;

  // 2. Owner 정보 처리 (Role 구분)
  let breweryId = 0;
  let breweryName = detail.user_nickname; // 기본값: 판매자 닉네임

  if (detail.owner) {
    // 양조장(ROLE_BREWERY)인 경우에만 brewery_id 설정
    if (detail.owner.owner_role === 'ROLE_BREWERY') {
      breweryId = detail.owner.owner_id;
      // 양조장 이름이 별도로 있다면 좋겠지만, 현재는 user_nickname 사용
    } else if (detail.owner.owner_role === 'ROLE_SELLER') {
      // 판매자인 경우 brewery_id는 0으로 둠 (양조장 상세페이지 연결 방지)
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
    
    // 리뷰 정보는 상세 API에 없으므로 0으로 초기화 (별도 조회 필요 시 추가 구현)
    averageRating: 0, 
    reviewCount: 0,   
    
    image_key: getImageUrl(firstImageKey), // 대표 이미지 URL
    images: processedImages, // 전체 이미지 배열
    
    tags: (detail.tags_name || []).map((tag, index) => ({
      product_tag_id: index,
      product_tag_type_id: index,
      product_id: detail.product_id,
      tagType: { product_tag_type_id: index, name: tag }
    })),
    
    registered_at: detail.product_registered_at,
    is_sell: !detail.product_is_soldout && detail.product_is_online_sell,
    is_delete: false,
    user_id: detail.owner?.owner_id || 0, // 판매자/양조장 ID
    brewery_id: breweryId, // ROLE_BREWERY일 때만 유효한 ID
    
    options: [
      {
        product_option_id: 1, // 단일 옵션 가정
        product_id: detail.product_id,
        volume: detail.product_volume,
        price: Number(detail.product_final_price)
      }
    ],
    reviews: [],
    isBest: false, // 별도 필드 없으므로 기본값
    isNew: false,
    info: {
      product_info_id: 0,
      product_id: detail.product_id,
      description: detail.product_description 
    }
  };
};