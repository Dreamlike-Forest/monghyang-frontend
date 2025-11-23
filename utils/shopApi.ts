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
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';
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
};


// 상품 필터링 검색
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
    handleApiError(error, '상품 검색');
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
    handleApiError(error, '최신 상품 조회');
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
    handleApiError(error, '사용자별 상품 조회');
    return createEmptyPageResponse<ProductListItem>();
  }
};

// 특정 상품 상세 조회
export const getProductById = async (
  productId: number
): Promise<ProductDetail | null> => {
  try {
    console.log('🔍 상품 상세 조회:', `/api/product/${productId}`);

    const response = await apiClient.get<ApiResponse<ProductDetail>>(
      `/api/product/${productId}`
    );

    console.log('✅ 상품 상세 조회 성공 (Raw Data):', response.data.content);
    
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
    console.error(`${context} 에러 (${status})`);
  } else {
    console.error(`${context} - 요청 설정 에러:`, error.message);
  }
};

// 상품 목록 정렬
export const sortProducts = (
  products: ProductListItem[],
  sortBy: string
): ProductListItem[] => {
  const sorted = [...products];
  switch (sortBy) {
    case 'popular': sorted.sort((a, b) => b.product_sales_volume - a.product_sales_volume); break;
    case 'price_low': sorted.sort((a, b) => Number(a.product_final_price) - Number(b.product_final_price)); break;
    case 'price_high': sorted.sort((a, b) => Number(b.product_final_price) - Number(a.product_final_price)); break;
    case 'rating': sorted.sort((a, b) => b.product_review_star - a.product_review_star); break;
    case 'review': sorted.sort((a, b) => b.product_review_count - a.product_review_count); break;
    default: break; 
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

// [수정됨] 상세 API 응답(ProductDetail)을 UI 객체(ProductWithDetails)로 변환하는 함수
export const convertDetailToProductWithDetails = (detail: ProductDetail): any => {
  
  // 이미지 배열 처리 (안전장치 추가)
  // images 매개변수의 타입을 any[]로 지정하여 내부에서 유연하게 처리
  const processImages = (images: any[]) => {
    if (!images || !Array.isArray(images)) return [];
    
    return images.map((img: any, index: number) => {
      // 백엔드에서 넘어올 수 있는 모든 가능한 이미지 키 속성명 검사
      const rawKey = img.product_image_image_key || img.image_key || img.key;
      const seq = img.product_image_seq || img.image_seq || img.seq || (index + 1);
      
      return {
        product_image_id: index,
        product_id: detail.product_id,
        key: rawKey,  
        image_key: getImageUrl(rawKey), // URL 변환
        seq: seq
      };
    });
  };

  // any로 캐스팅하여 타입 에러 회피 (API 응답이 타입 정의와 다를 수 있음)
  const rawImages = (detail as any).product_image_image_key || (detail as any).images;
  const processedImages = processImages(rawImages);
  
  // 대표 이미지 (첫 번째 이미지의 키 사용)
  const firstImage = rawImages?.[0];
  
  // [수정] TypeScript 에러 해결: (firstImage as any)를 사용하여 속성 접근 허용
  const firstImageKey = firstImage 
    ? ((firstImage as any).product_image_image_key || (firstImage as any).image_key || (firstImage as any).key) 
    : null;

  return {
    product_id: detail.product_id,
    name: detail.product_name,
    brewery: detail.owner?.brewery_name || detail.user_nickname || detail.owner?.user_nickname || '', 
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
    is_sell: true,
    is_delete: false,
    user_id: detail.owner?.user_id || 0,
    brewery_id: detail.owner?.brewery_id || 0,
    
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