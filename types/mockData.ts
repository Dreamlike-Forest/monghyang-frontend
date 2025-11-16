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

// ==================== 양조장 필터 옵션 ====================
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

export type {
  Product,
  ProductOption,
  ProductInfo,
  ProductImage,
  ProductInfoImage,
  ProductReview,
  ProductTag,
  ProductTagType,
  ProductWithDetails,
  FilterOption,
  FilterOptions,
  ActiveFilters
} from './shop';