import apiClient from './api';
import { ApiResponse, PageResponse } from '../types/product';
import { 
  BreweryListItem,
  BreweryDetailDto,
  BreweryTagDto,
  TagSearchResult,
  TagCategorySearchResult,
  BrewerySearchParams,
  Brewery,
  REGION_IDS,
  ALCOHOL_TAG_IDS
} from '../types/brewery';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 양조장 검색
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
    console.error('양조장 검색 실패:', error);
    return createEmptyPageResponse<BreweryListItem>();
  }
};

// 최신 양조장 조회
export const getLatestBreweries = async (
  startOffset: number,
  size: number = 6 
): Promise<PageResponse<BreweryListItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<BreweryListItem>>>(
      `/api/brewery/latest/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<BreweryListItem>();
    }

    return normalizePageResponse<BreweryListItem>(response.data.content);
  } catch (error: any) {
    console.error('최신 양조장 조회 실패:', error);
    return createEmptyPageResponse<BreweryListItem>();
  }
};

// 양조장 상세 조회
export const getBreweryById = async (
  breweryId: number
): Promise<BreweryDetailDto | null> => {
  try {
    const response = await apiClient.get<ApiResponse<BreweryDetailDto>>(
      `/api/brewery/${breweryId}`
    );
    return response.data.content;
  } catch (error: any) {
    console.error('양조장 상세 조회 실패:', error);
    return null;
  }
};

// 양조장 태그 리스트 조회
export const getBreweryTags = async (
  breweryId: number
): Promise<BreweryTagDto[]> => {
  try {
    const response = await apiClient.get<ApiResponse<BreweryTagDto[]>>(
      `/api/brewery/tag-list/${breweryId}`
    );
    return response.data.content || [];
  } catch (error: any) {
    console.error('양조장 태그 조회 실패:', error);
    return [];
  }
};

// 키워드로 태그 조회
export const searchTagsByKeyword = async (
  keyword: string,
  startOffset: number = 0
): Promise<PageResponse<TagSearchResult>> => {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    
    const response = await apiClient.get<ApiResponse<PageResponse<TagSearchResult>>>(
      `/api/tag/keyword/${encodedKeyword}/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<TagSearchResult>();
    }

    return normalizePageResponse<TagSearchResult>(response.data.content);
  } catch (error: any) {
    console.error('태그 키워드 검색 실패:', error);
    return createEmptyPageResponse<TagSearchResult>();
  }
};

// 키워드로 태그 카테고리 조회
export const searchTagCategoriesByKeyword = async (
  keyword: string,
  startOffset: number = 0
): Promise<PageResponse<TagCategorySearchResult>> => {
  try {
    const encodedKeyword = encodeURIComponent(keyword);

    const response = await apiClient.get<ApiResponse<PageResponse<TagCategorySearchResult>>>(
      `/api/tag-category/keyword/${encodedKeyword}/${startOffset}`
    );

    if (!response.data || !response.data.content) {
      return createEmptyPageResponse<TagCategorySearchResult>();
    }

    return normalizePageResponse<TagCategorySearchResult>(response.data.content);
  } catch (error: any) {
    console.error('태그 카테고리 키워드 검색 실패:', error);
    return createEmptyPageResponse<TagCategorySearchResult>();
  }
};

// 빈 페이지 응답 생성
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

// 페이지 응답 정규화
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

// 이미지 URL 생성
export const getImageUrl = (imageKey: string | null | undefined): string => {
  if (!imageKey) return '/images/no-image.png';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) return imageKey;
  return `${API_URL}/api/image/${imageKey}`;
};

// BreweryListItem을 Brewery로 변환
export const convertToBreweryType = (item: BreweryListItem): Brewery => {
  return {
    id: item.brewery_id,
    brewery_id: item.brewery_id,
    users_id: 0,
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
    brewery_address: '',
    brewery_address_detail: '',
    brewery_registered_at: new Date().toISOString(),
    joy: [],
  };
};

// BreweryDetailDto를 Brewery로 변환
export const convertBreweryDetailToType = (detail: BreweryDetailDto): Brewery => {
  return {
    id: detail.brewery_id,
    brewery_id: detail.brewery_id,
    users_id: detail.users_id,
    users_email: detail.users_email,
    users_phone: detail.users_phone,
    brewery_name: detail.brewery_name,
    region_type_name: detail.region_type_name,
    brewery_address: detail.brewery_address,
    brewery_address_detail: detail.brewery_address_detail,
    brewery_website: detail.brewery_website,
    brewery_introduction: detail.brewery_introduction,
    brewery_is_regular_visit: detail.brewery_is_regular_visit,
    brewery_is_visiting_brewery: detail.brewery_is_visiting_brewery,
    brewery_joy_min_price: detail.joy?.reduce((min, j) => Math.min(min, j.joy_final_price), Infinity) || 0,
    brewery_joy_count: detail.joy?.length || 0,
    image_key: detail.brewery_image_image_key?.[0]?.brewery_image_image_key 
      ? getImageUrl(detail.brewery_image_image_key[0].brewery_image_image_key)
      : '',
    brewery_image_image_key: detail.brewery_image_image_key,
    tags_name: detail.tags_name,
    tag_name: detail.tags_name,
    alcohol_types: detail.tags_name,
    joy: detail.joy,
    brewery_registered_at: detail.brewery_registered_at,
  };
};

// 상수 export
export { REGION_IDS, ALCOHOL_TAG_IDS };