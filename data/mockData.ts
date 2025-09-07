import { Brewery, Product, Joy, ProductWithDetails, ProductFilterOptions } from '../types/mockData';

export const mockBreweries: Brewery[] = [
  {
    brewery_id: 1,
    user_id: 1,
    region_id: 1,
    brewery_name: "안성 양조장",
    business_phone: "031-678-9012",
    business_email: "anseong@brewery.kr",
    brewery_address: "경기도 안성시 양조로 123",
    registered_at: "2020-01-15",
    business_registration_number: "123-45-67890",
    depositor: "김안성",
    account_number: "123456789012",
    bank_name: "농협은행",
    introduction: "전통 방식으로 빚은 프리미엄 증류주 전문 양조장입니다.",
    brewery_website: "http://anseong-brewery.co.kr",
    region_name: "서울/경기",
    alcohol_types: ["증류주", "전통주"],
    price_range: "high",
    image_key: "brewery_anseong_main_20240115.jpg", // 카드용 메인 이미지 키
    brewery_images: [ // 갤러리용 이미지 키 배열 (4장)
      "brewery_anseong_main_20240115.jpg",
      "brewery_anseong_interior_20240115.jpg", 
      "brewery_anseong_distillery_20240115.jpg",
      "brewery_anseong_storage_20240115.jpg"
    ],
    badges: [
      { type: 'text', content: '프리미엄', color: '#8b5a3c' },
      { type: 'text', content: '베스트', color: '#dc2626' }
    ]
  },
  {
    brewery_id: 2,
    user_id: 2,
    region_id: 2,
    brewery_name: "전주 양조장",
    business_phone: "063-234-5678",
    business_email: "jeonju@brewery.kr",
    brewery_address: "전라북도 전주시 한옥마을길 456",
    registered_at: "2021-06-10",
    business_registration_number: "234-56-78901",
    depositor: "이전주",
    account_number: "234567890123",
    bank_name: "전북은행",
    introduction: "전주 한옥마을에서 전통 방식으로 만드는 복분자 막걸리 전문점입니다.",
    brewery_website: "http://jeonju-makgeolli.kr",
    region_name: "전라도",
    alcohol_types: ["막걸리", "과실주"],
    price_range: "low",
    image_key: "brewery_jeonju_main_20210610.jpg",
    brewery_images: [ // 갤러리용 이미지 키 배열 (3장)
      "brewery_jeonju_main_20210610.jpg",
      "brewery_jeonju_hanok_20210610.jpg",
      "brewery_jeonju_making_20210610.jpg"
    ],
    badges: [
      { type: 'text', content: '신상품', color: '#059669' },
      { type: 'text', content: '전통', color: '#0369a1' }
    ]
  },
  {
    brewery_id: 3,
    user_id: 3,
    region_id: 3,
    brewery_name: "청주 양조장",
    business_phone: "043-345-6789",
    business_email: "cheongju@brewery.kr",
    brewery_address: "충청북도 청주시 청원구 양조길 789",
    registered_at: "2019-03-08",
    business_registration_number: "345-67-89012",
    depositor: "박청주",
    account_number: "345678901234",
    bank_name: "충북은행",
    introduction: "깔끔하고 부드러운 맛의 프리미엄 청주를 생산하는 양조장입니다.",
    brewery_website: "http://cheongju-brewery.com",
    region_name: "충청도",
    alcohol_types: ["청주", "약주"],
    price_range: "medium",
    image_key: "brewery_cheongju_main_20190308.jpg",
    brewery_images: [ // 갤러리용 이미지 키 배열 (5장 - 최대)
      "brewery_cheongju_main_20190308.jpg",
      "brewery_cheongju_tank_20190308.jpg",
      "brewery_cheongju_bottle_20190308.jpg",
      "brewery_cheongju_traditional_20190308.jpg",
      "brewery_cheongju_aging_20190308.jpg"
    ],
    badges: [
      { type: 'text', content: '할인', color: '#ef4444' }
    ]
  },
  {
    brewery_id: 4,
    user_id: 4,
    region_id: 4,
    brewery_name: "진주 양조장",
    business_phone: "055-456-7890",
    business_email: "jinju@brewery.kr",
    brewery_address: "경상남도 진주시 진양호로 321",
    registered_at: "2022-01-05",
    business_registration_number: "456-78-90123",
    depositor: "최진주",
    account_number: "456789012345",
    bank_name: "경남은행",
    introduction: "전통 증류 방식으로 만든 프리미엄 소주 전문 양조장입니다.",
    brewery_website: "http://jinju-soju.kr",
    region_name: "경상도",
    alcohol_types: ["소주", "증류주"],
    price_range: "high",
    image_key: "brewery_jinju_main_20220105.jpg",
    brewery_images: [ // 갤러리용 이미지 키 배열 (2장)
      "brewery_jinju_main_20220105.jpg",
      "brewery_jinju_distillery_20220105.jpg"
    ],
    badges: [
      { type: 'text', content: '장인', color: '#8b5a3c' }
    ]
  },
  {
    brewery_id: 5,
    user_id: 5,
    region_id: 5,
    brewery_name: "영동 양조장",
    business_phone: "043-740-5678",
    business_email: "yeongdong@brewery.kr",
    brewery_address: "충청북도 영동군 포도향로 654",
    registered_at: "2021-01-03",
    business_registration_number: "567-89-01234",
    depositor: "김영동",
    account_number: "567890123456",
    bank_name: "농협은행",
    introduction: "국산 포도로 만든 프리미엄 와인 전문 양조장입니다.",
    brewery_website: "http://yeongdong-wine.com",
    region_name: "충청도",
    alcohol_types: ["와인", "과실주"],
    price_range: "medium",
    image_key: "brewery_yeongdong_main_20210103.jpg",
    brewery_images: [ // 갤러리용 이미지 키 배열 (4장)
      "brewery_yeongdong_main_20210103.jpg",
      "brewery_yeongdong_vineyard_20210103.jpg",
      "brewery_yeongdong_cellar_20210103.jpg",
      "brewery_yeongdong_barrel_20210103.jpg"
    ],
    badges: [
      { type: 'text', content: '과실주', color: '#16a34a' }
    ]
  },
  {
    brewery_id: 6,
    user_id: 6,
    region_id: 6,
    brewery_name: "충주 양조장",
    business_phone: "043-856-9012",
    business_email: "chungju@brewery.kr",
    brewery_address: "충청북도 충주시 생막걸리로 987",
    registered_at: "2020-01-01",
    business_registration_number: "678-90-12345",
    depositor: "정충주",
    account_number: "678901234567",
    bank_name: "충북은행",
    introduction: "전통 방식으로 빚은 생막걸리 전문 양조장입니다.",
    brewery_website: "http://chungju-makgeolli.kr",
    region_name: "충청도",
    alcohol_types: ["막걸리", "생막걸리"],
    price_range: "low",
    image_key: "brewery_chungju_main_20200101.jpg",
    brewery_images: [ // 갤러리용 이미지 키 배열 (1장만)
      "brewery_chungju_main_20200101.jpg"
    ],
    badges: [
      { type: 'text', content: '친환경', color: '#059669' }
    ]
  }
];

// 체험 프로그램 데이터 (image_key만 사용)
export const mockJoyPrograms: Joy[] = [
  {
    joy_id: 1,
    brewery_id: 1,
    name: "프리미엄 증류주 체험",
    place: "안성 양조장 체험관",
    detail: "전통 증류 방식을 직접 체험하고 시음할 수 있는 프로그램입니다.",
    price: 45000,
    image_key: "experience_anseong_distilling_20240115.jpg"
  },
  {
    joy_id: 2,
    brewery_id: 2,
    name: "복분자 막걸리 만들기",
    place: "전주 한옥마을 체험관",
    detail: "복분자와 전통 누룩을 이용해 직접 막걸리를 만들어보는 체험입니다.",
    price: 12000,
    image_key: "experience_jeonju_makgeolli_20210610.jpg"
  },
  {
    joy_id: 3,
    brewery_id: 3,
    name: "청주 빚기 체험",
    place: "청주 양조장 본관",
    detail: "전통 청주 제조법을 배우고 직접 빚어보는 체험 프로그램입니다.",
    price: 29750,
    image_key: "experience_cheongju_brewing_20190308.jpg"
  },
  {
    joy_id: 4,
    brewery_id: 4,
    name: "전통 소주 증류 체험",
    place: "진주 양조장 증류실",
    detail: "전통 증류기를 이용한 소주 제조 과정을 직접 체험해보세요.",
    price: 48000,
    image_key: "experience_jinju_distilling_20220105.jpg"
  },
  {
    joy_id: 5,
    brewery_id: 5,
    name: "포도 와인 만들기",
    place: "영동 포도밭 체험관",
    detail: "영동의 신선한 포도를 직접 따서 와인을 만들어보는 체험입니다.",
    price: 32000,
    image_key: "experience_yeongdong_winemaking_20210103.jpg"
  },
  {
    joy_id: 6,
    brewery_id: 6,
    name: "생막걸리 빚기 체험",
    place: "충주 양조장 발효실",
    detail: "전통 누룩과 우리 쌀로 생막걸리를 직접 빚어보는 체험입니다.",
    price: 8000,
    image_key: "experience_chungju_makgeolli_20200101.jpg"
  }
];

// 9개 상품 데이터 - image_key로 변수명 통일
export const mockProducts: Product[] = [
  {
    product_id: 1,
    user_id: 1,
    brewery_id: 1,
    image_key: 'product_anseong_premium_20240115.jpg',
    name: '토박이 안성',
    alcohol: 40,
    is_sell: true,
    volume: 375,
    registered_at: '2024-01-15',
    is_delete: false,
    options: [
      { product_option_id: 1, product_id: 1, volume: 375, price: 45000 },
      { product_option_id: 2, product_id: 1, volume: 750, price: 85000 }
    ],
    info: { product_info_id: 1, product_id: 1, description: '전통 방식으로 빚은 프리미엄 증류주' },
    images: [],
    reviews: [],
    tags: [
      { product_tag_id: 1, product_tag_type_id: 1, product_id: 1, tagType: { product_tag_type_id: 1, name: '베스트' } }
    ],
    averageRating: 4.9,
    reviewCount: 24,
    minPrice: 45000,
    maxPrice: 85000,
    isBest: true
  },
  {
    product_id: 2,
    user_id: 2,
    brewery_id: 2,
    image_key: 'product_jeonju_bokbunja_20240110.jpg',
    name: '복분자 막걸리',
    alcohol: 7,
    is_sell: true,
    volume: 750,
    registered_at: '2024-01-10',
    is_delete: false,
    options: [
      { product_option_id: 3, product_id: 2, volume: 750, price: 12000 }
    ],
    info: { product_info_id: 2, product_id: 2, description: '달콤한 복분자가 들어간 프리미엄 막걸리' },
    images: [],
    reviews: [],
    tags: [
      { product_tag_id: 2, product_tag_type_id: 2, product_id: 2, tagType: { product_tag_type_id: 2, name: '신상품' } }
    ],
    averageRating: 4.4,
    reviewCount: 15,
    minPrice: 12000,
    maxPrice: 12000,
    isNew: true
  },
  {
    product_id: 3,
    user_id: 3,
    brewery_id: 3,
    image_key: 'product_cheongju_premium_20240108.jpg',
    name: '극찬 청명',
    alcohol: 13,
    is_sell: true,
    volume: 500,
    registered_at: '2024-01-08',
    is_delete: false,
    options: [
      { product_option_id: 4, product_id: 3, volume: 500, price: 29750 }
    ],
    info: { product_info_id: 3, product_id: 3, description: '깔끔하고 부드러운 맛의 프리미엄 청주' },
    images: [],
    reviews: [],
    tags: [
      { product_tag_id: 3, product_tag_type_id: 3, product_id: 3, tagType: { product_tag_type_id: 3, name: '할인' } }
    ],
    averageRating: 4.7,
    reviewCount: 31,
    minPrice: 29750,
    maxPrice: 29750,
    originalPrice: 35000,
    discountRate: 15
  },
  {
    product_id: 4,
    user_id: 4,
    brewery_id: 4,
    image_key: 'product_jinju_soju_20240105.jpg',
    name: '깨나 소주',
    alcohol: 25,
    is_sell: true,
    volume: 375,
    registered_at: '2024-01-05',
    is_delete: false,
    options: [
      { product_option_id: 5, product_id: 4, volume: 375, price: 48000 }
    ],
    info: { product_info_id: 4, product_id: 4, description: '전통 증류 방식으로 만든 프리미엄 소주' },
    images: [],
    reviews: [],
    tags: [],
    averageRating: 4.8,
    reviewCount: 18,
    minPrice: 48000,
    maxPrice: 48000
  },
  {
    product_id: 5,
    user_id: 5,
    brewery_id: 5,
    image_key: 'product_yeongdong_wine_20240103.jpg',
    name: '화이트 미스커 와인',
    alcohol: 12,
    is_sell: true,
    volume: 750,
    registered_at: '2024-01-03',
    is_delete: false,
    options: [
      { product_option_id: 6, product_id: 5, volume: 750, price: 32000 }
    ],
    info: { product_info_id: 5, product_id: 5, description: '국산 포도로 만든 프리미엄 와인' },
    images: [],
    reviews: [],
    tags: [],
    averageRating: 4.3,
    reviewCount: 22,
    minPrice: 32000,
    maxPrice: 32000
  },
  {
    product_id: 6,
    user_id: 6,
    brewery_id: 6,
    image_key: 'product_chungju_makgeolli_20240101.jpg',
    name: '전통 생 막걸리',
    alcohol: 6,
    is_sell: true,
    volume: 950,
    registered_at: '2024-01-01',
    is_delete: false,
    options: [
      { product_option_id: 7, product_id: 6, volume: 950, price: 8000 }
    ],
    info: { product_info_id: 6, product_id: 6, description: '전통 방식으로 빚은 생막걸리' },
    images: [],
    reviews: [],
    tags: [],
    averageRating: 4.5,
    reviewCount: 45,
    minPrice: 8000,
    maxPrice: 8000
  },
  {
    product_id: 7,
    user_id: 1,
    brewery_id: 1,
    image_key: 'product_anseong_premium_aged_20231220.jpg',
    name: '토박이 안성 프리미엄',
    alcohol: 42,
    is_sell: true,
    volume: 500,
    registered_at: '2023-12-20',
    is_delete: false,
    options: [
      { product_option_id: 8, product_id: 7, volume: 500, price: 65000 }
    ],
    info: { product_info_id: 7, product_id: 7, description: '5년 숙성된 최고급 증류주' },
    images: [],
    reviews: [],
    tags: [
      { product_tag_id: 4, product_tag_type_id: 4, product_id: 7, tagType: { product_tag_type_id: 4, name: '프리미엄' } }
    ],
    averageRating: 4.9,
    reviewCount: 8,
    minPrice: 65000,
    maxPrice: 65000
  },
  {
    product_id: 8,
    user_id: 2,
    brewery_id: 2,
    image_key: 'product_jeonju_traditional_20231215.jpg',
    name: '전주 전통 막걸리',
    alcohol: 6,
    is_sell: true,
    volume: 750,
    registered_at: '2023-12-15',
    is_delete: false,
    options: [
      { product_option_id: 9, product_id: 8, volume: 750, price: 9500 }
    ],
    info: { product_info_id: 8, product_id: 8, description: '전주 전통 제조법으로 만든 클래식 막걸리' },
    images: [],
    reviews: [],
    tags: [
      { product_tag_id: 5, product_tag_type_id: 5, product_id: 8, tagType: { product_tag_type_id: 5, name: '전통' } }
    ],
    averageRating: 4.2,
    reviewCount: 33,
    minPrice: 9500,
    maxPrice: 9500
  },
  {
    product_id: 9,
    user_id: 3,
    brewery_id: 3,
    image_key: 'product_cheongju_dry_20231210.jpg',
    name: '청명 드라이',
    alcohol: 15,
    is_sell: true,
    volume: 720,
    registered_at: '2023-12-10',
    is_delete: false,
    options: [
      { product_option_id: 10, product_id: 9, volume: 720, price: 42000 }
    ],
    info: { product_info_id: 9, product_id: 9, description: '드라이한 맛이 특징인 고급 청주' },
    images: [],
    reviews: [],
    tags: [],
    averageRating: 4.6,
    reviewCount: 19,
    minPrice: 42000,
    maxPrice: 42000
  }
];

// 데이터 조합 헬퍼 함수들 (기존과 동일)
export const getBreweriesWithExperience = (): Brewery[] => {
  return mockBreweries.map(brewery => ({
    ...brewery,
    experience_programs: mockJoyPrograms.filter(joy => joy.brewery_id === brewery.brewery_id)
  }));
};

export const getProductsWithBrewery = (): ProductWithDetails[] => {
  return mockProducts.map(product => {
    const brewery = mockBreweries.find(b => b.brewery_id === product.brewery_id);
    return {
      ...product,
      brewery: brewery?.brewery_name || '알 수 없는 양조장'
    };
  });
};

// Shop 필터 옵션 데이터 (기존과 동일)
export const mockFilterOptions: ProductFilterOptions = {
  types: [
    { id: 'takju', name: '탁주/막걸리', count: 3 },
    { id: 'cheongju', name: '청주', count: 2 },
    { id: 'yakju', name: '약주', count: 1 },
    { id: 'soju', name: '소주/증류주', count: 2 },
    { id: 'fruit', name: '과실주/와인', count: 1 }
  ],
  alcoholRanges: [
    { id: 'low', name: '6% 이하', count: 2 },
    { id: 'medium', name: '7-15%', count: 4 },
    { id: 'high1', name: '16-25%', count: 1 },
    { id: 'high2', name: '25% 이상', count: 2 }
  ],
  regions: [
    { id: 'seoul', name: '서울/경기', count: 2 },
    { id: 'gangwon', name: '강원도', count: 0 },
    { id: 'chungcheong', name: '충청도', count: 3 },
    { id: 'jeolla', name: '전라도', count: 2 },
    { id: 'gyeongsang', name: '경상도', count: 1 },
    { id: 'jeju', name: '제주도', count: 0 }
  ],
  certifications: [
    { id: 'master', name: '식품명인', count: 2 },
    { id: 'traditional', name: '전통식품기법', count: 4 },
    { id: 'organic', name: '유기농인증', count: 1 }
  ]
};