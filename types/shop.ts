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

// ProductFilter 컴포넌트용 타입 별칭
export type ProductFilterOptions = FilterOptions;
export type ProductActiveFilters = ActiveFilters;

// 필터 옵션 기본값
export const FILTER_OPTIONS: FilterOptions = {
  types: [
    { id: '1', name: '막걸리', count: 0 },
    { id: '2', name: '청주/약주', count: 0 },
    { id: '3', name: '소주', count: 0 },
    { id: '5', name: '과실주', count: 0 },
    { id: '6', name: '증류주', count: 0 },
    { id: '7', name: '리큐르', count: 0 },
    { id: '8', name: '기타', count: 0 },
  ],
  alcoholRanges: [
    { id: 'low', name: '저도수 (10% 미만)', count: 0 },
    { id: 'medium', name: '중도수 (10~20%)', count: 0 },
    { id: 'high', name: '고도수 (20% 이상)', count: 0 },
  ],
  regions: [
    { id: '2', name: '서울', count: 0 },
    { id: '3', name: '경기도', count: 0 },
    { id: '4', name: '강원도', count: 0 },
    { id: '5', name: '충청도', count: 0 },
    { id: '6', name: '전라도', count: 0 },
    { id: '7', name: '경상도', count: 0 },
    { id: '8', name: '제주도', count: 0 },
  ],
  certifications: [
    { id: 'organic', name: '유기농 인증', count: 0 },
    { id: 'traditional', name: '전통식품 인증', count: 0 },
    { id: 'haccp', name: 'HACCP 인증', count: 0 },
  ],
};

// 기본 필터 상태
export const DEFAULT_FILTERS: ActiveFilters = {
  types: [],
  alcoholRange: '',
  regions: [],
  priceMin: 0,
  priceMax: 999999,
  certifications: [],
  searchKeyword: '',
  sortBy: 'latest',
};

// 프론트엔드용 상품 확장 타입 (변환 후 사용)
export interface ProductWithDetails {
  product_id: number;
  name: string;
  brewery: string;
  alcohol: number;
  volume: number;
  minPrice: number;
  maxPrice: number;
  originalPrice: number;
  discountRate: number;
  averageRating: number;
  reviewCount: number;
  image_key: string;
  images: ProductImage[];
  tags: ProductTagWithType[];
  registered_at: string;
  is_sell: boolean;
  is_delete: boolean;
  user_id: number;
  brewery_id: number;
  options: ProductOptionItem[];
  reviews: any[];
  isBest: boolean;
  isNew: boolean;
  info: ProductInfoItem;
}

export interface ProductImage {
  product_image_id: number;
  product_id: number;
  key: string;
  image_key: string;
  seq: number;
}

export interface ProductTagWithType {
  product_tag_id: number;
  product_tag_type_id: number;
  product_id: number;
  tagType: {
    product_tag_type_id: number;
    name: string;
  };
}

export interface ProductOptionItem {
  product_option_id: number;
  product_id: number;
  volume: number;
  price: number;
}

export interface ProductInfoItem {
  product_info_id: number;
  product_id: number;
  description: string | null;
}

// 컴포넌트 Props 타입
export interface ShopProps {
  className?: string;
}

export interface ProductFilterProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
}

export interface ProductListProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
}

export interface SearchBarProps {
  keyword: string;
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}