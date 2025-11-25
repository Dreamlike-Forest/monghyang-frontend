import apiClient from './api';
import { ApiResponse, PageResponse } from '../types/product';

// ==================== 상수 정의 (API 문서 기준) ====================

// 지역 ID 매핑
export const REGION_IDS = {
  UNKNOWN: 1,      // 미정
  SEOUL: 2,        // 서울
  GYEONGGI: 3,     // 경기도
  GANGWON: 4,      // 강원도
  CHUNGCHEONG: 5,  // 충청도
  JEONLA: 6,       // 전라도
  GYEONGSANG: 7,   // 경상도
  JEJU: 8          // 제주도
};

// 주종 태그 ID 매핑
export const ALCOHOL_TAG_IDS = {
  MAKGEOLLI: 1, // 막걸리
  CHEONGJU: 2,  // 청주 (약주 포함)
  SOJU: 3,      // 소주
  FRUIT: 5,     // 과실주
  SPIRITS: 6,   // 증류주
  LIQUEUR: 7,   // 리큐르
  OTHER: 8      // 기타
};

// ==================== 타입 정의 ====================

export interface BreweryListItem {
  brewery_id: number;
  
  // 서버에서 내려오는 다양한 이름 키값들 모두 정의
  brewery_brewery_name?: string; 
  brewery_name?: string; 
  breweryName?: string;  
  name?: string;         
  users_nickname?: string;
  
  region_type_name: string;
  brewery_introduction: string;
  
  brewery_joy_min_price?: number;
  min_joy_price?: number;
  
  brewery_joy_count?: number;
  joy_count?: number;
  
  image_key: string;
  is_visiting_brewery: boolean;
  is_regular_visit: boolean;
  tag_name: string[];
}

export interface BreweryDetail {
  brewery_id: number;
  users_id: number;
  users_email: string;
  users_phone: string;
  region_type_name: string;
  brewery_name: string;
  brewery_address: string;
  brewery_address_detail: string;
  brewery_introduction: string;
  brewery_website?: string;
  brewery_registered_at: string;
  brewery_is_regular_visit: boolean;
  brewery_is_visiting_brewery: boolean;
  brewery_start_time?: any;
  brewery_end_time?: any;
  brewery_image_image_key: {
    brewery_image_image_key: string;
    brewery_image_seq: number;
  }[];
  tags_name: string[];
  joy: {
    joy_id: number;
    joy_name: string;
    joy_place: string;
    joy_detail: string;
    joy_origin_price: number;
    joy_discount_rate: number;
    joy_final_price: number;
    joy_sales_volume: number;
    joy_time_unit?: number;
    joy_is_soldout: boolean;
    joy_image_key?: string;
  }[];
}

export interface BreweryTag {
  tags_id: number;
  tags_name: string;
}

// 태그 검색 결과 타입 (API 문서 반영)
export interface TagSearchResult {
  tags_id: number;
  tag_category_name: string;
  tags_name: string;
}

// 태그 카테고리 검색 결과 타입 (API 문서 반영)
export interface TagCategorySearchResult {
  id: number;
  name: string;
}

export interface BrewerySearchParams {
  startOffset: number; 
  size?: number;       
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  region_id_list?: number[];
}

// ==================== API 함수들 ====================

// 1. 양조장 검색
export const searchBreweries = async (
  params: BrewerySearchParams
): Promise<PageResponse<BreweryListItem>> => {
  try {
    const { startOffset, size = 6, ...queryParams } = params;
    
    const requestParams = {
      size,
      ...queryParams
    };

    const response = await apiClient.get<ApiResponse<PageResponse<BreweryListItem>>>(
      `/api/brewery/search/${startOffset}`,
      { params: requestParams }
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<BreweryListItem>();
    }

    return normalizePageResponse<BreweryListItem>(response.data.content);
  } catch (error: any) {
    console.error('❌ 양조장 검색 실패:', error);
    return createEmptyPageResponse<BreweryListItem>();
  }
};

// 2. 최신 양조장 조회
export const getLatestBreweries = async (
  startOffset: number,
  size: number = 6 
): Promise<PageResponse<BreweryListItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<BreweryListItem>>>(
      `/api/brewery/latest/${startOffset}`,
      { 
        params: { size } 
      }
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<BreweryListItem>();
    }

    return normalizePageResponse<BreweryListItem>(response.data.content);
  } catch (error: any) {
    console.error('❌ 최신 양조장 조회 실패:', error);
    return createEmptyPageResponse<BreweryListItem>();
  }
};

// 3. 양조장 상세 조회
export const getBreweryById = async (
  breweryId: number
): Promise<BreweryDetail | null> => {
  try {
    const response = await apiClient.get<ApiResponse<BreweryDetail>>(
      `/api/brewery/${breweryId}`
    );
    return response.data.content;
  } catch (error: any) {
    console.error('❌ 양조장 상세 조회 실패:', error);
    return null;
  }
};

// 4. 양조장 태그 리스트 조회 (문서: /api/brewery/tag-list/{breweryId})
export const getBreweryTags = async (
  breweryId: number
): Promise<BreweryTag[]> => {
  try {
    const response = await apiClient.get<ApiResponse<BreweryTag[]>>(
      `/api/brewery/tag-list/${breweryId}`
    );
    // 문서를 보면 content 자체가 배열임
    return response.data.content || [];
  } catch (error: any) {
    console.error('❌ 양조장 태그 조회 실패:', error);
    return [];
  }
};

// 5. 키워드로 태그 조회 (문서: /api/tag/keyword/{keyword}/{startOffset})
export const searchTagsByKeyword = async (
  keyword: string,
  startOffset: number = 0
): Promise<PageResponse<TagSearchResult>> => {
  try {
    // 문서 요청사항: 한글 문자열 UTF-8 변환
    const encodedKeyword = encodeURIComponent(keyword);
    
    const response = await apiClient.get<ApiResponse<PageResponse<TagSearchResult>>>(
      `/api/tag/keyword/${encodedKeyword}/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<TagSearchResult>();
    }

    return normalizePageResponse<TagSearchResult>(response.data.content);
  } catch (error: any) {
    console.error('❌ 태그 키워드 검색 실패:', error);
    return createEmptyPageResponse<TagSearchResult>();
  }
};

// 6. 키워드로 태그 카테고리 조회 (문서: /api/tag-category/keyword/{keyword}/{startOffset})
export const searchTagCategoriesByKeyword = async (
  keyword: string,
  startOffset: number = 0
): Promise<PageResponse<TagCategorySearchResult>> => {
  try {
    // 한글 문자열 UTF-8 변환
    const encodedKeyword = encodeURIComponent(keyword);

    const response = await apiClient.get<ApiResponse<PageResponse<TagCategorySearchResult>>>(
      `/api/tag-category/keyword/${encodedKeyword}/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<TagCategorySearchResult>();
    }

    return normalizePageResponse<TagCategorySearchResult>(response.data.content);
  } catch (error: any) {
    console.error('❌ 태그 카테고리 키워드 검색 실패:', error);
    return createEmptyPageResponse<TagCategorySearchResult>();
  }
};

// ==================== 헬퍼 함수들 ====================

const createEmptyPageResponse = <T>(): PageResponse<T> => ({
  content: [],
  pageable: {
    pageNumber: 0,
    pageSize: 6,
    sort: { empty: true, sorted: false, unsorted: true },
    offset: 0,
    paged: true,
    unpaged: false,
  },
  totalPages: 0,
  totalElements: 0,
  last: true,
  size: 6,
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
      pageSize: response.page_size || response.size || 6,
      sort: response.sort || { empty: true, sorted: false, unsorted: true },
      offset: response.offset || 0,
      paged: true,
      unpaged: false,
    },
    totalPages: response.totalPages || response.total_pages || response.total_page || 0,
    totalElements: response.totalElements || response.total_elements || response.total || 0,
    last: response.last ?? true,
    size: response.size || response.page_size || 6,
    number: response.number || response.page_number || 0,
    sort: response.sort || { empty: true, sorted: false, unsorted: true },
    numberOfElements: response.numberOfElements || response.number_of_elements || response.content?.length || 0,
    first: response.first ?? true,
    empty: response.empty ?? (response.content?.length === 0),
  };
};

export const getImageUrl = (imageKey: string | null | undefined): string => {
  if (!imageKey) return '/images/no-image.png';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) return imageKey;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';
  return `${API_URL}/api/image/${imageKey}`;
};

export const convertToBreweryType = (item: BreweryListItem): any => {
  return {
    id: item.brewery_id,
    brewery_id: item.brewery_id,
    
    // 이름 필드 우선순위 적용
    brewery_name: item.brewery_brewery_name || item.brewery_name || item.users_nickname || item.breweryName || item.name || '이름 없음',
    
    region_type_name: item.region_type_name,
    brewery_introduction: item.brewery_introduction,
    
    brewery_joy_min_price: item.brewery_joy_min_price ?? item.min_joy_price ?? 0,
    brewery_joy_count: item.brewery_joy_count ?? item.joy_count ?? 0,
    
    image_key: getImageUrl(item.image_key),
    brewery_is_visiting_brewery: item.is_visiting_brewery,
    brewery_is_regular_visit: item.is_regular_visit,
    
    tag_name: item.tag_name || [],
    tags_name: item.tag_name || [],
    alcohol_types: item.tag_name || [],
    
    users_id: 0,
    brewery_address: '',
    brewery_address_detail: '',
    brewery_registered_at: new Date().toISOString(),
    joy: [],
  };
};

export const convertBreweryDetailToType = (detail: BreweryDetail): any => {
  return {
    id: detail.brewery_id,
    brewery_id: detail.brewery_id,
    users_id: detail.users_id,
    users_email: detail.users_email,
    users_phone: detail.users_phone,
    region_type_name: detail.region_type_name,
    brewery_name: detail.brewery_name,
    brewery_address: detail.brewery_address,
    brewery_address_detail: detail.brewery_address_detail,
    brewery_introduction: detail.brewery_introduction,
    brewery_website: detail.brewery_website,
    brewery_registered_at: detail.brewery_registered_at,
    brewery_is_regular_visit: detail.brewery_is_regular_visit,
    brewery_is_visiting_brewery: detail.brewery_is_visiting_brewery,
    brewery_start_time: detail.brewery_start_time,
    brewery_end_time: detail.brewery_end_time,
    brewery_image_image_key: detail.brewery_image_image_key,
    tags_name: detail.tags_name,
    tag_name: detail.tags_name,
    alcohol_types: detail.tags_name,
    joy: detail.joy,
    image_key: detail.brewery_image_image_key?.[0]?.brewery_image_image_key 
      ? getImageUrl(detail.brewery_image_image_key[0].brewery_image_image_key)
      : '',
  };
};