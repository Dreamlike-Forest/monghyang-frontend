import apiClient from './api';
import { ApiResponse, PageResponse } from '../types/product';

// ==================== 양조장 관련 타입 정의 ====================

// 양조장 목록 아이템 (리스트 API 응답)
export interface BreweryListItem {
  brewery_id: number;
  
  // 이름 관련 키값 후보들
  brewery_brewery_name?: string; 
  brewery_name?: string; 
  breweryName?: string;  
  name?: string;         
  users_nickname?: string;
  
  region_type_name: string;
  brewery_introduction: string;
  
  // 체험 프로그램 관련 키값 후보들
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

export const searchBreweries = async (
  params: BrewerySearchParams
): Promise<PageResponse<BreweryListItem>> => {
  try {
    const { startOffset, size = 6, ...queryParams } = params;
    
    const filteredParams: Record<string, any> = {
      size: size,
      ...Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as Record<string, any>)
    };

    const response = await apiClient.get<ApiResponse<PageResponse<BreweryListItem>>>(
      `/api/brewery/search/${startOffset}`,
      { params: filteredParams }
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

export const getBreweryTags = async (
  breweryId: number
): Promise<BreweryTag[]> => {
  try {
    const response = await apiClient.get<ApiResponse<BreweryTag[]>>(
      `/api/brewery/tag-list/${breweryId}`
    );
    return response.data.content || [];
  } catch (error: any) {
    console.error('❌ 양조장 태그 조회 실패:', error);
    return [];
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

/**
 * [수정] 로그 제거 완료
 */
export const convertToBreweryType = (item: BreweryListItem): any => {
  // console.log('🔍 Server Item:', item); // <-- 이 줄을 삭제했습니다.

  return {
    id: item.brewery_id,
    brewery_id: item.brewery_id,
    
    // 확인된 키값(brewery_brewery_name)을 최우선으로 사용
    brewery_name: item.brewery_brewery_name || item.brewery_name || item.breweryName || item.name || '이름 없음',
    
    region_type_name: item.region_type_name,
    brewery_introduction: item.brewery_introduction,
    
    brewery_joy_min_price: item.brewery_joy_min_price ?? item.min_joy_price ?? 0,
    brewery_joy_count: item.brewery_joy_count ?? item.joy_count ?? 0,
    
    image_key: getImageUrl(item.image_key),
    brewery_is_visiting_brewery: item.is_visiting_brewery,
    brewery_is_regular_visit: item.is_regular_visit,
    
    tag_name: item.tag_name,
    tags_name: item.tag_name,
    alcohol_types: item.tag_name,
    
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