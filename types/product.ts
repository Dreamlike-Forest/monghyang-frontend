// API 공통 응답 타입
export interface ApiResponse<T> {
  content: T;
  status?: number;
  message?: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// 상품 목록 아이템
export interface ProductListItem {
  product_id: number;
  users_nickname: string;
  product_name: string;
  product_review_star: number | null;
  product_review_count: number;
  product_alcohol: number;
  product_volume: number;
  product_sales_volume: number;
  product_origin_price: number;
  product_discount_rate: number;
  product_final_price: number;
  image_key: string;
  product_is_online_sell: boolean;
  product_is_soldout: boolean;
  tag_name: string[];
}

// 상품 이미지
export interface ProductImageDto {
  product_image_image_key: string;
  product_image_seq: number;
}

// 상품 소유자 정보
export interface ProductOwnerDto {
  owner_id: number;
  owner_role: 'ROLE_BREWERY' | 'ROLE_SELLER';
  owner_region?: string;
  image_key?: string;
  tags_name?: string[];
}

// 상품 상세
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

// alias
export type ProductDetail = ProductDetailDto;

// 검색 파라미터
export interface ProductSearchParams {
  startOffset: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  min_alcohol?: number;
  max_alcohol?: number;
}

// 정렬 옵션
export type SortOption =
  | 'latest'
  | 'popular'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'review';