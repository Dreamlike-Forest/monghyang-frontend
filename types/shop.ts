export interface Product {
  product_id: number;
  user_id: number;
  image_key: string;
  name: string;
  alcohol: number;
  is_sell: boolean;
  volume: number;
  registered_at: string;
  is_delete: boolean;
}

export interface ProductOption {
  product_option_id: number;
  product_id: number;
  volume: number;
  price: number;
}

export interface ProductInfo {
  product_info_id: number;
  product_id: number;
  description: string | null;
}

export interface ProductInfoImage {
  product_info_image_id: number;
  product_info_id: number;
  image_key: string;
  image_seq: number;
}

export interface ProductReview {
  product_review_id: number;
  product_id: number;
  content: string;
  rating: number;
  created_at: string;
  is_delete: boolean;
}

export interface ProductTag {
  product_tag_id: number;
  product_tag_type_id: number;
  product_id: number;
}

export interface ProductTagType {
  product_tag_type_id: number;
  name: string;
}

// 프론트엔드에서 사용할 통합 상품 타입
export interface ProductWithDetails extends Product {
  options: ProductOption[];
  info?: ProductInfo;
  images: ProductInfoImage[];
  reviews: ProductReview[];
  tags: (ProductTag & { tagType: ProductTagType })[];
  averageRating: number;
  reviewCount: number;
  minPrice: number;
  maxPrice: number;
  originalPrice?: number;
  discountRate?: number;
  isNew?: boolean;
  isBest?: boolean;
  brewery: string;
}

// 필터 옵션 타입
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

// API 응답 타입
export interface ProductListResponse {
  products: ProductWithDetails[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 컴포넌트 Props 타입들
export interface ShopProps {
  className?: string;
}

export interface ProductFilterProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onPriceRangeChange: (min: number, max: number) => void;
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