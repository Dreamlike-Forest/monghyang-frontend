// data/mockData.ts
// ERD에 맞는 완전한 Mock 데이터

import { Brewery, Joy, ProductWithDetails, ProductOption, ProductImage, ProductReview, ProductTag, ProductTagType, FilterOptions } from '../types/mockData';

// ==================== 체험 프로그램 Mock 데이터 ====================
const mockExperiencePrograms: Joy[] = [
  {
    joy_id: 1,
    brewery_id: 1,
    name: '전통 누룩 만들기 체험',
    place: '양조장 체험관 1층',
    detail: '우리 조상들이 사용하던 전통 방식으로 누룩을 직접 만들어보는 체험입니다. 누룩의 역사와 제조 과정을 배우고, 직접 만든 누룩을 가져갈 수 있습니다.',
    price: 30000,
    image_key: 'https://images.unsplash.com/photo-1544024994-f6e9e3f1b536?w=800&h=600&fit=crop'
  },
  {
    joy_id: 2,
    brewery_id: 1,
    name: '막걸리 빚기 체험',
    place: '양조장 체험관 2층',
    detail: '전통 방식으로 막걸리를 직접 빚어보는 체험 프로그램입니다. 발효 과정을 관찰하고, 시음도 가능합니다.',
    price: 35000,
    image_key: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=800&h=600&fit=crop'
  },
  {
    joy_id: 3,
    brewery_id: 2,
    name: '도심 속 양조 체험',
    place: '양조장 체험실',
    detail: '서울 도심에서 즐기는 특별한 양조 체험',
    price: 40000,
    image_key: 'https://images.unsplash.com/photo-1544024994-f6e9e3f1b536?w=800&h=600&fit=crop'
  },
  {
    joy_id: 4,
    brewery_id: 3,
    name: '신라 전통주 만들기',
    place: '역사관',
    detail: '신라 시대의 전통 주조법으로 약주 만들기',
    price: 35000,
    image_key: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=800&h=600&fit=crop'
  }
];

// ==================== 양조장 Mock 데이터 ====================
const mockBreweries: Brewery[] = [
  {
    brewery_id: 1,
    user_id: 1,
    region_id: 1,
    brewery_name: '전주 전통 양조장',
    business_phone: '063-123-4567',
    business_email: 'contact@jeonju-brewery.com',
    brewery_address: '전라북도 전주시 완산구 전주천로 123',
    registered_at: '2024-01-01T00:00:00Z',
    business_registration_number: '123-45-67890',
    depositor: '홍길동',
    account_number: '110-123-456789',
    bank_name: '국민은행',
    introduction: '1950년부터 이어온 전주의 전통 양조장입니다. 전통 누룩을 사용하여 우리 조상들의 방식 그대로 막걸리와 약주를 빚고 있습니다.',
    brewery_website: 'https://jeonju-brewery.com',
    start_time: '09:00',
    end_time: '18:00',
    region_name: '전주',
    alcohol_types: ['막걸리', '약주', '청주'],
    price_range: 'medium',
    image_key: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=1200&h=800&fit=crop',
    brewery_images: [
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=1200&h=800&fit=crop'
    ],
    experience_programs: mockExperiencePrograms.filter(e => e.brewery_id === 1),
    badges: [
      { type: 'text', content: '전통주 명인', color: '#8b5a3c' },
      { type: 'text', content: '체험 프로그램', color: '#059669' }
    ]
  },
  {
    brewery_id: 2,
    user_id: 2,
    region_id: 2,
    brewery_name: '서울 수제 막걸리 양조장',
    business_phone: '02-234-5678',
    business_email: 'info@seoul-makgeolli.com',
    brewery_address: '서울특별시 종로구 인사동길 45',
    registered_at: '2023-06-15T00:00:00Z',
    business_registration_number: '234-56-78901',
    depositor: '김철수',
    account_number: '220-234-567890',
    bank_name: '신한은행',
    introduction: '서울 도심 속에서 전통 방식으로 막걸리를 빚는 양조장입니다.',
    brewery_website: 'https://seoul-makgeolli.com',
    start_time: '10:00',
    end_time: '20:00',
    region_name: '서울',
    alcohol_types: ['막걸리', '과실주'],
    price_range: 'high',
    image_key: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=1200&h=800&fit=crop',
    brewery_images: [
      'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=1200&h=800&fit=crop'
    ],
    experience_programs: mockExperiencePrograms.filter(e => e.brewery_id === 2),
    badges: [
      { type: 'text', content: '프리미엄', color: '#dc2626' }
    ]
  },
  {
    brewery_id: 3,
    user_id: 3,
    region_id: 3,
    brewery_name: '경주 신라 양조장',
    business_phone: '054-345-6789',
    business_email: 'silla@gyeongju-brewery.com',
    brewery_address: '경상북도 경주시 황남동 123-45',
    registered_at: '2022-03-20T00:00:00Z',
    business_registration_number: '345-67-89012',
    depositor: '박영희',
    account_number: '330-345-678901',
    bank_name: '하나은행',
    introduction: '신라 시대부터 전해 내려오는 양조 비법을 재현한 역사 깊은 양조장입니다.',
    brewery_website: 'https://gyeongju-brewery.com',
    start_time: '09:30',
    end_time: '17:30',
    region_name: '경주',
    alcohol_types: ['약주', '청주', '소주'],
    price_range: 'medium',
    image_key: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=1200&h=800&fit=crop',
    brewery_images: [
      'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=1200&h=800&fit=crop'
    ],
    experience_programs: mockExperiencePrograms.filter(e => e.brewery_id === 3),
    badges: [
      { type: 'text', content: '역사 깊은 양조장', color: '#7c3aed' }
    ]
  }
];

// ==================== 상품 Mock 데이터 ====================
const mockProducts: ProductWithDetails[] = [
  {
    // 기본 Product 필드
    product_id: 1,
    user_id: 1,
    brewery_id: 1,
    image_key: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=600&h=600&fit=crop',
    name: '전주 전통 생막걸리',
    alcohol: 6,
    is_sell: true,
    volume: 750,
    registered_at: '2024-01-15T00:00:00Z',
    is_delete: false,
    
    // ProductWithDetails 추가 필드
    options: [
      { product_option_id: 1, product_id: 1, volume: 750, price: 5000 },
      { product_option_id: 2, product_id: 1, volume: 1500, price: 9000 }
    ],
    info: {
      product_info_id: 1,
      product_id: 1,
      description: '전통 누룩으로 빚은 신선한 생막걸리입니다.'
    },
    images: [
      { product_image_id: 1, product_id: 1, key: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=600', seq: 1 }
    ],
    reviews: [],
    tags: [
      { 
        product_tag_id: 1, 
        product_tag_type_id: 1, 
        product_id: 1,
        tagType: { product_tag_type_id: 1, name: '막걸리' }
      }
    ],
    averageRating: 4.5,
    reviewCount: 128,
    minPrice: 5000,
    maxPrice: 9000,
    isNew: true,
    isBest: true,
    brewery: '전주 전통 양조장'
  },
  {
    product_id: 2,
    user_id: 1,
    brewery_id: 1,
    image_key: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=600&h=600&fit=crop',
    name: '프리미엄 약주',
    alcohol: 13,
    is_sell: true,
    volume: 500,
    registered_at: '2024-02-01T00:00:00Z',
    is_delete: false,
    options: [
      { product_option_id: 3, product_id: 2, volume: 500, price: 15000 }
    ],
    info: {
      product_info_id: 2,
      product_id: 2,
      description: '고급 누룩으로 빚은 프리미엄 약주입니다.'
    },
    images: [
      { product_image_id: 2, product_id: 2, key: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=600', seq: 1 }
    ],
    reviews: [],
    tags: [
      { 
        product_tag_id: 2, 
        product_tag_type_id: 2, 
        product_id: 2,
        tagType: { product_tag_type_id: 2, name: '약주' }
      }
    ],
    averageRating: 4.8,
    reviewCount: 95,
    minPrice: 15000,
    maxPrice: 15000,
    originalPrice: 18000,
    discountRate: 17,
    isNew: false,
    isBest: true,
    brewery: '전주 전통 양조장'
  },
  {
    product_id: 3,
    user_id: 2,
    brewery_id: 2,
    image_key: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=600&h=600&fit=crop',
    name: '서울 프리미엄 막걸리',
    alcohol: 8,
    is_sell: true,
    volume: 750,
    registered_at: '2024-01-20T00:00:00Z',
    is_delete: false,
    options: [
      { product_option_id: 4, product_id: 3, volume: 750, price: 12000 }
    ],
    info: {
      product_info_id: 3,
      product_id: 3,
      description: '도심 속에서 만든 프리미엄 막걸리입니다.'
    },
    images: [
      { product_image_id: 3, product_id: 3, key: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=600', seq: 1 }
    ],
    reviews: [],
    tags: [
      { 
        product_tag_id: 3, 
        product_tag_type_id: 1, 
        product_id: 3,
        tagType: { product_tag_type_id: 1, name: '막걸리' }
      }
    ],
    averageRating: 4.6,
    reviewCount: 73,
    minPrice: 12000,
    maxPrice: 12000,
    isNew: true,
    isBest: false,
    brewery: '서울 수제 막걸리 양조장'
  },
  {
    product_id: 4,
    user_id: 3,
    brewery_id: 3,
    image_key: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=600&h=600&fit=crop',
    name: '신라 청주',
    alcohol: 15,
    is_sell: true,
    volume: 500,
    registered_at: '2023-12-01T00:00:00Z',
    is_delete: false,
    options: [
      { product_option_id: 5, product_id: 4, volume: 500, price: 20000 }
    ],
    info: {
      product_info_id: 4,
      product_id: 4,
      description: '신라 시대 전통 제조법으로 만든 청주입니다.'
    },
    images: [
      { product_image_id: 4, product_id: 4, key: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=600', seq: 1 }
    ],
    reviews: [],
    tags: [
      { 
        product_tag_id: 4, 
        product_tag_type_id: 3, 
        product_id: 4,
        tagType: { product_tag_type_id: 3, name: '청주' }
      }
    ],
    averageRating: 4.7,
    reviewCount: 56,
    minPrice: 20000,
    maxPrice: 20000,
    isNew: false,
    isBest: true,
    brewery: '경주 신라 양조장'
  }
];

// ==================== 필터 옵션 Mock 데이터 ====================
export const mockFilterOptions: FilterOptions = {
  types: [
    { id: 'takju', name: '탁주(막걸리)', count: 45 },
    { id: 'cheongju', name: '청주', count: 32 },
    { id: 'yakju', name: '약주', count: 28 },
    { id: 'soju', name: '소주/증류주', count: 18 },
    { id: 'fruit', name: '과실주', count: 15 }
  ],
  alcoholRanges: [
    { id: 'low', name: '0-6%', count: 30 },
    { id: 'medium', name: '7-15%', count: 45 },
    { id: 'high1', name: '16-25%', count: 20 },
    { id: 'high2', name: '25% 이상', count: 8 }
  ],
  regions: [
    { id: 'seoul', name: '서울', count: 25 },
    { id: 'gyeonggi', name: '경기', count: 30 },
    { id: 'jeonbuk', name: '전북', count: 15 },
    { id: 'gyeongbuk', name: '경북', count: 12 },
    { id: 'jeju', name: '제주', count: 8 }
  ],
  certifications: [
    { id: 'organic', name: '유기농', count: 18 },
    { id: 'traditional', name: '전통주', count: 52 },
    { id: 'premium', name: '명인', count: 10 }
  ]
};

// ==================== Export 함수들 ====================

/**
 * 체험 프로그램이 있는 양조장만 반환
 */
export function getBreweriesWithExperience(): Brewery[] {
  return mockBreweries.filter(brewery => 
    brewery.experience_programs && brewery.experience_programs.length > 0
  );
}

/**
 * 모든 양조장 반환
 */
export function getAllBreweries(): Brewery[] {
  return mockBreweries;
}

/**
 * 양조장 이름이 포함된 상품 목록 반환
 */
export function getProductsWithBrewery(): ProductWithDetails[] {
  return mockProducts.map(product => {
    const brewery = mockBreweries.find(b => b.brewery_id === product.brewery_id);
    return {
      ...product,
      brewery: brewery?.brewery_name || '알 수 없음'
    };
  });
}

/**
 * 모든 상품 반환
 */
export function getAllProducts(): ProductWithDetails[] {
  return mockProducts;
}

/**
 * ID로 양조장 찾기
 */
export function getBreweryById(breweryId: number): Brewery | undefined {
  return mockBreweries.find(brewery => brewery.brewery_id === breweryId);
}

/**
 * ID로 상품 찾기
 */
export function getProductById(productId: number): ProductWithDetails | undefined {
  return mockProducts.find(product => product.product_id === productId);
}

/**
 * 양조장별 상품 필터링
 */
export function getProductsByBrewery(breweryId: number): ProductWithDetails[] {
  return mockProducts.filter(product => product.brewery_id === breweryId);
}

/**
 * 지역으로 양조장 필터링
 */
export function getBreweriesByRegion(regionName: string): Brewery[] {
  return mockBreweries.filter(brewery => brewery.region_name === regionName);
}

/**
 * 주종으로 양조장 필터링
 */
export function getBreweriesByAlcoholType(alcoholType: string): Brewery[] {
  return mockBreweries.filter(brewery => 
    brewery.alcohol_types.includes(alcoholType)
  );
}