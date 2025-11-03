export interface ProductOption {
  product_option_id: number;
  product_id: number;
  volume: number;
  price: number;
}

export interface ProductInfo {
  product_info_id: number;
  product_id: number;
  description: string;
}

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

// *** 수정: 상품 이미지 인터페이스 (ERD 반영) ***
export interface ProductImage {
  product_image_id: number; 
  product_id: number;
  key: string; 
  seq: number; 
}

export interface ProductReview {
  product_review_id: number;
  product_id: number;
  user_id: number;
  rating: number;
  content: string;
  created_at: string;
}

// *** 수정: Product 인터페이스 - 이미지 배열 명확화 ***
export interface Product {
  product_id: number;
  user_id: number;
  brewery_id: number; 
  image_key: string;  
  name: string;
  alcohol: number;
  is_sell: boolean;
  volume: number;
  registered_at: string;
  is_delete: boolean;
  options: ProductOption[];
  info: ProductInfo;
  images: ProductImage[];  
  reviews: ProductReview[];
  tags: ProductTag[];
  averageRating: number;
  reviewCount: number;
  minPrice: number;
  maxPrice: number;
  originalPrice?: number;
  discountRate?: number;
  isBest?: boolean;
  isNew?: boolean;
}

export interface Joy {
  joy_id: number;
  brewery_id: number;
  name: string;
  place: string;
  detail: string;
  price: number;
  image_key?: string;
}

export interface Brewery {
  brewery_id: number;
  user_id: number;
  region_id: number;
  brewery_name: string;
  business_phone: string;
  business_email?: string;
  brewery_address: string;
  registered_at: string;
  business_registration_number: string;
  depositor: string;
  account_number: string;
  bank_name: string;
  introduction?: string;
  brewery_website?: string;
  start_time?: string; 
  end_time?: string;   
  region_name: string;
  alcohol_types: string[];
  price_range: 'low' | 'medium' | 'high';
  image_key?: string;
  brewery_images?: string[];
  experience_programs?: Joy[];
  badges?: {
    type: 'text' | 'image';
    content: string;
    alt?: string;
    color?: string;
  }[];
}

export interface ProductWithDetails extends Product {
  brewery: string; 
}

export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface ProductFilterOptions {
  types: FilterOption[];
  alcoholRanges: FilterOption[];
  regions: FilterOption[];
  certifications: FilterOption[];
}

export interface ProductActiveFilters {
  types: string[];
  alcoholRange: string;
  regions: string[];
  priceMin: number;
  priceMax: number;
  certifications: string[];
  searchKeyword: string;
  sortBy: string;
}

export interface BreweryFilterOptions {
  regions: string[];
  priceRange: {
    min: number | '';
    max: number | '';
  };
  alcoholTypes: string[];
  badges: string[];
  searchKeyword: string;
}