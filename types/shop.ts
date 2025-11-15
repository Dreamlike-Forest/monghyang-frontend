export interface Product {
  product_id: number;
  user_id: number;
  brewery_id: number;
  image_key: string;  // ERD의 메인 이미지
  name: string;
  alcohol: number;
  is_sell: boolean;
  volume: number;
  registered_at: string;
  is_delete: boolean;
}

// ==================== 상품 옵션 ====================
export interface ProductOption {
  product_option_id: number;
  product_id: number;
  volume: number;
  price: number;
}

// ==================== 상품 상세 정보 ====================
export interface ProductInfo {
  product_info_id: number;
  product_id: number;
  description: string | null;
}

// ==================== 상품 이미지 (ERD 기반) ====================
export interface ProductImage {
  product_image_id: number;
  product_id: number;
  key: string;        // ERD의 key 필드 (이미지 키)
  seq: number;        // ERD의 seq 필드 (이미지 순서)
  // 하위 호환성을 위한 옵션 필드
  image_key?: string; // key의 별칭
  url?: string;       // 프론트엔드에서 사용할 수 있는 URL (선택적)
}

// 상품 정보 이미지 (별도 관리)
export interface ProductInfoImage {
  product_info_image_id: number;
  product_info_id: number;
  image_key: string;
  image_seq: number;
}

// ==================== 상품 리뷰 ====================
export interface ProductReview {
  product_review_id: number;
  product_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: string;
  is_delete: boolean;
}

// ==================== 상품 태그 ====================
export interface ProductTagType {
  product_tag_type_id: number;
  name: string;
}

export interface ProductTag {
  product_tag_id: number;
  product_tag_type_id: number;
  product_id: number;
  tagType: ProductTagType;
}

// ==================== 통합 상품 타입 (프론트엔드용) ====================
export interface ProductWithDetails extends Product {
  options: ProductOption[];
  info?: ProductInfo;
  images: ProductImage[];
  reviews: ProductReview[];
  tags: ProductTag[];
  averageRating: number;
  reviewCount: number;
  minPrice: number;
  maxPrice: number;
  originalPrice?: number;
  discountRate?: number;
  isNew?: boolean;
  isBest?: boolean;
  brewery: string; // 양조장 이름
}

// ==================== 필터 옵션 ====================
export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface FilterOptions {
  types: FilterOption[];
  alcoholRanges: FilterOption[];
  regions: FilterOption[];
  certifications: FilterOption[];
}

// ==================== 활성 필터 ====================
export interface ActiveFilters {
  types: string[];
  alcoholRange: string;
  regions: string[];
  priceMin: number;
  priceMax: number;
  certifications: string[];
  searchKeyword: string;
  sortBy: string;
}

// ==================== API 응답 타입 ====================
export interface ProductListResponse {
  products: ProductWithDetails[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// ==================== 컴포넌트 Props 타입들 ====================
export interface ShopProps {
  className?: string;
}

export interface ProductFilterProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
}

export interface ProductListProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
}

export interface SearchBarProps {
  keyword: string;
  onSearch: (keyword: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}