// 양조장 이미지
export interface BreweryImageDto {
  brewery_image_image_key: string;
  brewery_image_seq: number;
}

// 체험 프로그램 (Joy)
export interface JoyDto {
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
}

// 양조장 목록 아이템 (GET /api/brewery/search, /api/brewery/latest 응답)
export interface BreweryListItem {
  brewery_id: number;
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

// 양조장 상세 (GET /api/brewery/{breweryId} 응답)
export interface BreweryDetailDto {
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
  brewery_start_time?: string;
  brewery_end_time?: string;
  brewery_image_image_key: BreweryImageDto[];
  tags_name: string[];
  joy: JoyDto[];
}

// 양조장 태그
export interface BreweryTagDto {
  tags_id: number;
  tags_name: string;
}

// 태그 검색 결과
export interface TagSearchResult {
  tags_id: number;
  tag_category_name: string;
  tags_name: string;
}

// 태그 카테고리 검색 결과
export interface TagCategorySearchResult {
  id: number;
  name: string;
}

// 양조장 검색 파라미터
export interface BrewerySearchParams {
  startOffset: number;
  size?: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  region_id_list?: number[];
}

// 지역 ID 매핑
export const REGION_IDS = {
  UNKNOWN: 1,
  SEOUL: 2,
  GYEONGGI: 3,
  GANGWON: 4,
  CHUNGCHEONG: 5,
  JEONLA: 6,
  GYEONGSANG: 7,
  JEJU: 8
} as const;

// 주종 태그 ID 매핑
export const ALCOHOL_TAG_IDS = {
  MAKGEOLLI: 1,
  CHEONGJU: 2,
  SOJU: 3,
  FRUIT: 5,
  SPIRITS: 6,
  LIQUEUR: 7,
  OTHER: 8
} as const;

// 프론트엔드 확장 타입 (UI용)
export interface BreweryBadge {
  type: 'text' | 'image';
  content: string;
  alt?: string;
  color?: string;
}

// 프론트엔드용 양조장 타입 (변환 후 사용)
export interface Brewery {
  id: number;
  brewery_id: number;
  brewery_name: string;
  region_type_name: string;
  brewery_introduction: string;
  brewery_address: string;
  brewery_address_detail: string;
  brewery_is_visiting_brewery: boolean;
  brewery_is_regular_visit: boolean;
  brewery_joy_min_price: number;
  brewery_joy_count: number;
  image_key: string;
  tags_name: string[];
  alcohol_types: string[];
  joy: JoyDto[];
  badges?: BreweryBadge[];
}