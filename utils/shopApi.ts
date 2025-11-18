import apiClient from './api';
import {
  ApiResponse,
  PageResponse,
  ProductListItem,
  ProductDetail,
  ProductSearchParams,
} from '../types/product';

// 이미지 키를 전체 URL로 변환
const getImageUrl = (imageKey: string | null | undefined): string => {
  if (!imageKey) return '/images/no-image.png';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) return imageKey;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${API_URL}/api/image/${imageKey}`;
};

// 빈 페이지 응답 생성 헬퍼 함수
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
  console.log('🔧 normalizePageResponse 시작:', {
    keys: Object.keys(response),
    total_pages: response.total_pages,
    totalPages: response.totalPages
  });

  const normalized = {
    content: response.content || [],
    pageable: response.pageable || {
      pageNumber: response.page_number || response.number || 0,
      pageSize: response.page_size || response.size || 10,
      sort: response.sort || { empty: true, sorted: false, unsorted: true },
      offset: response.offset || 0,
      paged: true,
      unpaged: false,
    },
    totalPages: response.totalPages || response.total_pages || response.total_page || 0,
    totalElements: response.totalElements || response.total_elements || response.total || 0,
    last: response.last ?? true,
    size: response.size || response.page_size || 10,
    number: response.number || response.page_number || 0,
    sort: response.sort || { empty: true, sorted: false, unsorted: true },
    numberOfElements: response.numberOfElements || response.number_of_elements || response.content?.length || 0,
    first: response.first ?? true,
    empty: response.empty ?? (response.content?.length === 0),
  };

  console.log('✅ normalizePageResponse 완료:', {
    totalPages: normalized.totalPages,
    totalElements: normalized.totalElements,
    contentLength: normalized.content.length
  });

  return normalized;
};


// 상품 필터링 검색: GET /api/product/search/{startOffset}
export const searchProducts = async (
  params: ProductSearchParams
): Promise<PageResponse<ProductListItem>> => {
  try {
    const { startOffset, ...queryParams } = params;
    
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

    console.log('상품 검색 API 요청:', {
      url: `/api/product/search/${startOffset}`,
      params: filteredParams
    });

    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/search/${startOffset}`,
      { params: filteredParams }
    );

    console.log('상품 검색 성공:', response.data);

    if (!response.data || !response.data.content) {
      console.warn('응답 데이터가 없습니다.');
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    console.error('상품 검색 실패:', error);
    handleApiError(error, '상품 검색');
    return createEmptyPageResponse<ProductListItem>();
  }
};

// 상품 최신순 조회: GET /api/product/latest/{startOffset}
export const getLatestProducts = async (
  startOffset: number
): Promise<PageResponse<ProductListItem>> => {
  try {
    console.log('최신 상품 조회:', `/api/product/latest/${startOffset}`);

    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/latest/${startOffset}`
    );

    console.log('최신 상품 조회 성공:', response.data);

    if (!response.data || !response.data.content) {
      console.warn('응답 데이터가 없습니다.');
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    console.error('최신 상품 조회 실패:', error);
    handleApiError(error, '최신 상품 조회');
    return createEmptyPageResponse<ProductListItem>();
  }
};

// 특정 판매자의 모든 상품 조회: GET /api/product/by-user/{userId}/{startOffset}
export const getProductsByUserId = async (
  userId: number,
  startOffset: number
): Promise<PageResponse<ProductListItem>> => {
  try {
    console.log('사용자별 상품 조회:', `/api/product/by-user/${userId}/${startOffset}`);

    const response = await apiClient.get<ApiResponse<PageResponse<ProductListItem>>>(
      `/api/product/by-user/${userId}/${startOffset}`
    );

    console.log('사용자별 상품 조회 성공');

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<ProductListItem>();
    }

    return normalizePageResponse<ProductListItem>(response.data.content);
  } catch (error: any) {
    console.error('사용자별 상품 조회 실패:', error);
    handleApiError(error, '사용자별 상품 조회');
    return createEmptyPageResponse<ProductListItem>();
  }
};

// 특정 상품 상세 조회: GET /api/product/{productId}
export const getProductById = async (
  productId: number
): Promise<ProductDetail | null> => {
  try {
    console.log('🔍 상품 상세 조회:', `/api/product/${productId}`);

    const response = await apiClient.get<ApiResponse<ProductDetail>>(
      `/api/product/${productId}`
    );

    console.log('✅ 상품 상세 조회 성공');
    return response.data.content;
  } catch (error: any) {
    console.error('상품 상세 조회 실패:', error);
    handleApiError(error, '상품 상세 조회');
    return null;
  }
};

// API 에러 처리 헬퍼 함수
const handleApiError = (error: any, context: string) => {
  if (error.response) {
    const status = error.response.status;
    const requestUrl = error.config?.url || 'unknown';
    
    console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`${context} 에러 (${status})`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`요청 URL: ${requestUrl}`);
    
    switch (status) {
      case 404:
        console.error(`\n 404 Not Found - API 엔드포인트를 찾을 수 없습니다!`);
        break;
        
      case 401:
        console.error(`\n 401 Unauthorized - 인증이 필요합니다`);
        console.error(`로그인 후 다시 시도하세요.`);
        break;
        
      case 500:
        console.error(`\n 500 Internal Server Error - 서버 내부 오류`);
        console.error(`백엔드 콘솔 로그를 확인하세요.`);
        break;
        
      default:
        console.error(`\n 서버 응답 에러`);
        console.error(`응답 데이터:`, error.response.data);
    }
    
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
  } else if (error.request) {
    console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(` ${context} - 네트워크 에러`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`\n 백엔드 서버에 연결할 수 없습니다!`);
    console.error(`\n확인 사항:`);
    console.error(` 백엔드 서버가 실행 중인지 확인`);
    console.error(` 서버 주소 확인: ${process.env.NEXT_PUBLIC_API_URL}`);
    console.error(` 방화벽이나 네트워크 설정 확인`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
  } else {
    console.error(`\n ${context} - 요청 설정 에러:`, error.message);
  }
};

// 상품 목록 정렬
export const sortProducts = (
  products: ProductListItem[],
  sortBy: string
): ProductListItem[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'latest':
      break;
    case 'popular':
      sorted.sort((a, b) => b.product_sales_volume - a.product_sales_volume);
      break;
    case 'price_low':
      sorted.sort((a, b) => Number(a.product_final_price) - Number(b.product_final_price));
      break;
    case 'price_high':
      sorted.sort((a, b) => Number(b.product_final_price) - Number(a.product_final_price));
      break;
    case 'rating':
      sorted.sort((a, b) => b.product_review_star - a.product_review_star);
      break;
    case 'review':
      sorted.sort((a, b) => b.product_review_count - a.product_review_count);
      break;
    default:
      sorted.sort((a, b) => b.product_review_star - a.product_review_star);
  }

  return sorted;
};

// ProductListItem을 ProductWithDetails로 변환
export const convertToProductWithDetails = (item: ProductListItem): any => {
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
    user_id: 0,
    brewery_id: 0,
    options: [],
    images: [],
    reviews: [],
    isBest: item.product_sales_volume > 100,
    isNew: false,
    info: {
      product_info_id: 0,
      product_id: item.product_id,
      description: null
    }
  };
};