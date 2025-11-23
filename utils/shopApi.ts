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

// 특정 상품 상세 조회
export const getProductById = async (
  productId: number
): Promise<ProductDetail | null> => {
  try {
    console.log('🔍 상품 상세 조회:', `/api/product/${productId}`);
    const response = await apiClient.get<ApiResponse<ProductDetail>>(
      `/api/product/${productId}`
    );
    console.log('✅ 상품 상세 조회 성공 (Raw):', response.data.content);
    return response.data.content;
  } catch (error: any) {
    console.error('상품 상세 조회 실패:', error);
    return null;
  }
};

// ProductListItem을 ProductWithDetails로 변환
export const convertToProductWithDetails = (item: ProductListItem): any => {
  // [수정] 리스트 아이템에서도 brewery_id를 최대한 찾아봅니다.
  const breweryId = (item as any).owner_id || (item as any).brewery_id || (item as any).breweryId || 0;
  const userId = (item as any).user_id || (item as any).userId || 0;

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

// 상세 API 응답(ProductDetail)을 UI 객체(ProductWithDetails)로 변환
export const convertDetailToProductWithDetails = (detail: ProductDetail): any => {
  
  const processImages = (images: any[]) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map((img: any, index: number) => {
      const rawKey = img.product_image_image_key || img.image_key || img.key;
      const seq = img.product_image_seq || img.image_seq || img.seq || (index + 1);
      return {
        product_image_id: index,
        product_id: detail.product_id,
        key: rawKey,  
        image_key: getImageUrl(rawKey),
        seq: seq
      };
    });
  };

  const rawImages = (detail as any).product_image_image_key || (detail as any).images;
  const processedImages = processImages(rawImages);
  const firstImage = rawImages?.[0];
  const firstImageKey = firstImage 
    ? ((firstImage as any).product_image_image_key || (firstImage as any).image_key || (firstImage as any).key) 
    : null;

  // [핵심 수정] API 응답 이미지(image_2d201c.png)에 따라 owner_id를 brewery_id로 매핑
  // detail.owner.owner_id 필드가 가장 확실한 양조장 ID입니다.
  const breweryId = 
    (detail as any).owner?.owner_id ||  // 가장 우선순위 높음
    detail.owner?.brewery_id || 
    (detail as any).brewery_id || 
    (detail as any).breweryId || 
    0;

  console.log('🔍 [DEBUG] Extracted Brewery ID:', breweryId, 'from detail:', detail);

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
    brewery_id: breweryId, // [수정됨] 추출된 ID 적용
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