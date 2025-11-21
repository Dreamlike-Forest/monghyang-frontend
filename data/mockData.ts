// [수정] import 목록에 'Joy' 추가
import { Brewery, ProductWithDetails, ProductFilterOptions, Joy } from '../types/mockData';

// =============================================================================
// 1. 필터 옵션 데이터 (Shop 페이지용)
// =============================================================================
export const mockFilterOptions: ProductFilterOptions = {
  types: [
    { id: 'takju', name: '탁주/막걸리', count: 120 },
    { id: 'yakju', name: '약주/청주', count: 45 },
    { id: 'soju', name: '증류주', count: 30 },
    { id: 'fruit', name: '과실주', count: 15 },
    { id: 'liqueur', name: '리큐르', count: 10 }
  ],
  alcoholRanges: [
    { id: 'low', name: '0% ~ 10%', count: 50 },
    { id: 'medium', name: '10% ~ 20%', count: 80 },
    { id: 'high', name: '20% 이상', count: 30 }
  ],
  certifications: [
    { id: 'haccp', name: 'HACCP 인증', count: 60 },
    { id: 'organic', name: '유기농', count: 20 },
    { id: 'traditional', name: '전통식품명인', count: 15 }
  ]
};

// =============================================================================
// 2. 양조장 데이터 (Swagger API & ERD 구조 준수)
// =============================================================================
export const getBreweriesWithExperience = (): Brewery[] => {
  const breweries: Brewery[] = [];

  // ---------------------------------------------------------------------------
  // [1] 담은 양조장 (체험 프로그램 보유)
  // ---------------------------------------------------------------------------
  const brewery1: Brewery = {
    brewery_id: 1,
    id: 1,
    users_id: 101,
    users_email: "contact@damun.com",
    users_phone: "054-123-4567",
    business_registration_number: "123-45-67890",
    region_type_name: "경상도",
    brewery_name: "담은 양조장",
    brewery_address: "경상북도 문경시 동로면",
    brewery_address_detail: "석항리 123-4",
    brewery_introduction: "문경의 맑은 물과 쌀로 빚은 프리미엄 막걸리 양조장입니다. 3대째 이어오는 전통 방식으로 술을 빚고 있습니다.",
    brewery_website: "https://damun.com",
    brewery_registered_at: "2024-01-01",
    brewery_is_regular_visit: true,
    brewery_is_visiting_brewery: true,
    brewery_start_time: "09:00",
    brewery_end_time: "18:00",
    brewery_depositor: "김담은",
    brewery_account_number: "352-1234-5678-90",
    brewery_bank_name: "농협",
    brewery_image_image_key: [
      { brewery_image_image_key: "brewery_damun_1.jpg", brewery_image_seq: 1 },
      { brewery_image_image_key: "brewery_damun_2.jpg", brewery_image_seq: 2 },
      { brewery_image_image_key: "brewery_damun_3.jpg", brewery_image_seq: 3 }
    ],
    image_key: "brewery_damun_1.jpg",
    tags_name: ["막걸리", "탁주", "프리미엄", "체험가능"],
    alcohol_types: ["막걸리", "탁주"],
    joy: [
      {
        joy_id: 1001,
        joy_name: "나만의 막걸리 빚기",
        joy_place: "제 1 체험장",
        joy_detail: "직접 고두밥을 짓고 누룩을 섞어 나만의 막걸리를 빚어보는 체험입니다. 만든 술은 가져가실 수 있습니다.",
        joy_origin_price: 50000,
        joy_discount_rate: 10,
        joy_final_price: 45000,
        joy_sales_volume: 120,
        joy_is_soldout: false,
        joy_time_unit: 120,
        joy_image_key: "joy_damun_1.jpg"
      },
      {
        joy_id: 1002,
        joy_name: "전통주 시음회",
        joy_place: "시음장",
        joy_detail: "담은 양조장의 5가지 프리미엄 전통주를 해설과 함께 시음해보세요.",
        joy_origin_price: 20000,
        joy_discount_rate: 0,
        joy_final_price: 20000,
        joy_sales_volume: 350,
        joy_is_soldout: false,
        joy_time_unit: 60,
        joy_image_key: "joy_damun_2.jpg"
      }
    ],
    brewery_joy_min_price: 20000,
    brewery_joy_count: 2,
    badges: [
      { type: 'text', content: '찾아가는 양조장', color: '#8b5a3c' },
      { type: 'text', content: '인기', color: '#d32f2f' }
    ]
  };

  // ---------------------------------------------------------------------------
  // [2] 복순도가 (체험 없음)
  // ---------------------------------------------------------------------------
  const brewery2: Brewery = {
    brewery_id: 2,
    id: 2,
    users_id: 102,
    users_email: "info@boksoon.com",
    users_phone: "052-234-5678",
    business_registration_number: "987-65-43210",
    region_type_name: "경상도",
    brewery_name: "복순도가",
    brewery_address: "울산광역시 울주군 상북면",
    brewery_address_detail: "향산동길 48",
    brewery_introduction: "손으로 직접 빚은 순수 생막걸리. 천연 탄산이 주는 청량감이 특징인 샴페인 막걸리입니다.",
    brewery_website: "https://boksoon.com",
    brewery_registered_at: "2024-02-15",
    brewery_is_regular_visit: true,
    brewery_is_visiting_brewery: true,
    brewery_start_time: "10:00",
    brewery_end_time: "17:00",
    brewery_depositor: "박복순",
    brewery_account_number: "110-123-456789",
    brewery_bank_name: "신한",
    brewery_image_image_key: [
      { brewery_image_image_key: "brewery_boksoon_1.jpg", brewery_image_seq: 1 },
      { brewery_image_image_key: "brewery_boksoon_2.jpg", brewery_image_seq: 2 }
    ],
    image_key: "brewery_boksoon_1.jpg",
    tags_name: ["막걸리", "스파클링", "청량감"],
    alcohol_types: ["막걸리"],
    joy: [],
    brewery_joy_min_price: 0,
    brewery_joy_count: 0,
    badges: [
      { type: 'text', content: '우수 문화 양조장', color: '#d4a024' }
    ]
  };

  // ---------------------------------------------------------------------------
  // [3] 서울의 밤 (증류주)
  // ---------------------------------------------------------------------------
  const brewery3: Brewery = {
    brewery_id: 3,
    id: 3,
    users_id: 103,
    users_email: "seoul@night.com",
    users_phone: "02-1234-5678",
    business_registration_number: "111-22-33333",
    region_type_name: "서울/경기",
    brewery_name: "더한주류",
    brewery_address: "서울특별시 은평구",
    brewery_address_detail: "증산로 123",
    brewery_introduction: "서울의 밤을 더욱 아름답게 만드는 매실 증류주 전문 양조장입니다.",
    brewery_website: "https://thehan.com",
    brewery_registered_at: "2024-03-10",
    brewery_is_regular_visit: false,
    brewery_is_visiting_brewery: false,
    brewery_start_time: "09:00",
    brewery_end_time: "18:00",
    brewery_depositor: "이서울",
    brewery_account_number: "1002-333-444444",
    brewery_bank_name: "우리",
    brewery_image_image_key: [
      { brewery_image_image_key: "brewery_seoul_1.jpg", brewery_image_seq: 1 }
    ],
    image_key: "brewery_seoul_1.jpg",
    tags_name: ["증류주", "매실주", "칵테일"],
    alcohol_types: ["증류주"],
    joy: [],
    brewery_joy_min_price: 0,
    brewery_joy_count: 0,
    badges: []
  };

  breweries.push(brewery1, brewery2, brewery3);

  // ---------------------------------------------------------------------------
  // [4] 대량 더미 데이터 생성 (ID 4 ~ 20)
  // ---------------------------------------------------------------------------
  const regions = ["서울/경기", "강원도", "충청도", "전라도", "경상도", "제주도"];
  const types = ["막걸리", "청주", "증류주", "과실주", "리큐르"];

  for (let i = 4; i <= 20; i++) {
    const region = regions[i % regions.length];
    const type = types[i % types.length];
    const hasExperience = i % 3 !== 0;

    // [수정] Joy 타입 명시로 에러 해결
    const joyPrograms: Joy[] = hasExperience ? [
      {
        joy_id: i * 100 + 1,
        joy_name: `${type} 만들기 체험`,
        joy_place: "체험장 A",
        joy_detail: "전통 방식으로 술을 빚어보는 체험입니다.",
        joy_origin_price: 30000 + (i * 1000),
        joy_discount_rate: 0,
        joy_final_price: 30000 + (i * 1000),
        joy_sales_volume: i * 10,
        joy_is_soldout: false,
        joy_time_unit: 90,
        joy_image_key: `joy_dummy_${i}.jpg`
      }
    ] : [];

    breweries.push({
      brewery_id: i,
      id: i,
      users_id: 100 + i,
      users_email: `contact@brewery${i}.com`,
      users_phone: `010-1234-${1000 + i}`,
      business_registration_number: `000-00-000${i}`,
      region_type_name: region,
      brewery_name: `전통주 양조장 ${i}`,
      brewery_address: `${region} 어딘가`,
      brewery_address_detail: `${i}번길`,
      brewery_introduction: `${region}의 자연을 담은 ${type} 전문 양조장입니다.`,
      brewery_website: `https://brewery${i}.com`,
      brewery_registered_at: "2024-04-01",
      brewery_is_regular_visit: i % 2 === 0,
      brewery_is_visiting_brewery: i % 2 !== 0,
      brewery_start_time: "10:00",
      brewery_end_time: "17:00",
      brewery_depositor: `대표자${i}`,
      brewery_account_number: "000-0000-0000",
      brewery_bank_name: "은행",
      brewery_image_image_key: [],
      image_key: i % 2 === 0 ? "brewery_default_1.jpg" : "brewery_default_2.jpg",
      tags_name: [type, region, "전통주"],
      alcohol_types: [type],
      joy: joyPrograms,
      brewery_joy_count: joyPrograms.length,
      brewery_joy_min_price: hasExperience ? (30000 + (i * 1000)) : 0,
      badges: i % 5 === 0 ? [{ type: 'text', content: '신규', color: '#4caf50' }] : []
    });
  }

  return breweries;
};

// =============================================================================
// 3. 상품 데이터 (ProductWithDetails)
// =============================================================================
export const getProductsWithBrewery = (): ProductWithDetails[] => {
  return [
    {
      product_id: 1,
      user_id: 101,
      brewery_id: 1,
      brewery: "담은 양조장",
      name: "담은 막걸리 화이트",
      image_key: "product_damun_white.jpg",
      alcohol: 6.5,
      is_sell: true,
      volume: 750,
      registered_at: "2024-01-10",
      is_delete: false,
      options: [
        { product_option_id: 1, product_id: 1, volume: 750, price: 12000 }
      ],
      info: { product_info_id: 1, product_id: 1, description: "구름처럼 부드러운 맛" },
      images: [
        { product_image_id: 1, product_id: 1, key: "product_damun_white.jpg", seq: 1 }
      ],
      reviews: [],
      tags: [
        { product_tag_id: 1, product_tag_type_id: 1, product_id: 1, tagType: { product_tag_type_id: 1, name: "부드러운" } }
      ],
      averageRating: 4.8,
      reviewCount: 120,
      minPrice: 12000,
      maxPrice: 12000,
      originalPrice: 12000,
      discountRate: 0,
      isBest: true,
      isNew: false
    },
    {
      product_id: 2,
      user_id: 101,
      brewery_id: 1,
      brewery: "담은 양조장",
      name: "담은 막걸리 블랙",
      image_key: "product_damun_black.jpg",
      alcohol: 6.5,
      is_sell: true,
      volume: 750,
      registered_at: "2024-01-15",
      is_delete: false,
      options: [],
      info: { product_info_id: 2, product_id: 2, description: "흑미의 고소함" },
      images: [],
      reviews: [],
      tags: [],
      averageRating: 4.9,
      reviewCount: 85,
      minPrice: 15000,
      maxPrice: 15000,
      originalPrice: 15000,
      discountRate: 0,
      isBest: false,
      isNew: true
    },
    {
      product_id: 3,
      user_id: 102,
      brewery_id: 2,
      brewery: "복순도가",
      name: "복순도가 손막걸리",
      image_key: "product_boksoon.jpg",
      alcohol: 6.5,
      is_sell: true,
      volume: 935,
      registered_at: "2024-02-20",
      is_delete: false,
      options: [],
      info: { product_info_id: 3, product_id: 3, description: "천연 탄산의 청량감" },
      images: [],
      reviews: [],
      tags: [],
      averageRating: 4.7,
      reviewCount: 500,
      minPrice: 12000,
      maxPrice: 12000,
      originalPrice: 12000,
      discountRate: 0,
      isBest: true,
      isNew: false
    },
    {
      product_id: 4,
      user_id: 103,
      brewery_id: 3,
      brewery: "더한주류",
      name: "서울의 밤",
      image_key: "product_seoul_night.jpg",
      alcohol: 25,
      is_sell: true,
      volume: 375,
      registered_at: "2024-03-01",
      is_delete: false,
      options: [],
      info: { product_info_id: 4, product_id: 4, description: "황매실 증류주" },
      images: [],
      reviews: [],
      tags: [],
      averageRating: 4.6,
      reviewCount: 320,
      minPrice: 7500,
      maxPrice: 7900,
      originalPrice: 8500,
      discountRate: 10,
      isBest: true,
      isNew: false
    }
  ];
};

// =============================================================================
// [추가] 호환성을 위한 함수 내보내기 (breweryUtils.ts 오류 해결용)
// =============================================================================

export const getAllBreweries = (): Brewery[] => {
  return getBreweriesWithExperience();
};

export const getBreweryById = (id: number): Brewery | undefined => {
  const breweries = getBreweriesWithExperience();
  return breweries.find(b => b.brewery_id === id || b.id === id);
};