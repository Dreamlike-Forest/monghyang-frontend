// types/mockData.ts

// ========================================
// 체험프로그램 (Joy) - Swagger API 기준
// ========================================
export interface Joy {
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
export interface BreweryImage {
  brewery_image_image_key: string; 
  brewery_image_seq: number;       
}

export interface BreweryBadge {
  type: 'text' | 'image';
  content: string;
  alt?: string;
  color?: string;
}

export interface Brewery {
  brewery_id: number;                     
  users_id: number;                       
  users_email?: string;                   
  users_phone?: string;                   
  
  region_type_name: string;               
  brewery_name: string;                   
  brewery_address: string;                
  brewery_address_detail: string;         
  
  brewery_introduction?: string;          
  brewery_website?: string;               
  
  brewery_registered_at: string;          
  
  brewery_is_regular_visit: boolean;      
  brewery_is_visiting_brewery: boolean;   
  
  brewery_start_time?: string | any;      
  brewery_end_time?: string | any;        

  // 관계 데이터
  brewery_image_image_key?: BreweryImage[]; 
  tags_name?: string[];                   
  tag_name?: string[];                    
  joy?: Joy[];                           

  // 리스트용 요약 필드
  brewery_joy_min_price?: number;
  brewery_joy_count?: number;
  image_key?: string;                     

  // 프론트엔드 호환성 필드
  id?: number;                          
  alcohol_types?: string[];               
  badges?: BreweryBadge[];                
  
  // UI 호환성 유지 (필요시 제거 가능)
  brewery_depositor?: string;
  brewery_account_number?: string;
  brewery_bank_name?: string;
  business_registration_number?: string;
}

// ========================================
// 상품 (Product) 관련 타입
// ========================================
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

export interface ProductWithDetails extends Product {
  brewery: string;
}

// ========================================
// 필터 및 검색 관련 타입 (Shop, Filter용)
// ========================================
export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface ProductFilterOptions {
  types: FilterOption[];
  alcoholRanges: FilterOption[];
  certifications: FilterOption[];
}

export interface ProductActiveFilters {
  types: string[];
  alcoholRange: string;
  certifications: string[];
  searchKeyword: string;
  priceMin: number;
  priceMax: number;
  sortBy: string;
  regions?: string[];
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

export interface ProductSearchParams {
  startOffset: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  min_alcohol?: number;
  max_alcohol?: number;
}