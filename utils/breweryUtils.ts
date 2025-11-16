import axios, { AxiosInstance, AxiosError } from 'axios';
import { getAllBreweries, getBreweryById } from '../data/mockData';

// ==================== 기본 설정 ====================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// API 활성화 여부 (환경변수로 제어 가능)
const USE_API = process.env.NEXT_PUBLIC_USE_API !== 'false'; // 기본값: true

// Axios 인스턴스 생성
const breweryApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (로깅용)
breweryApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
breweryApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 서버가 응답을 반환했지만 상태 코드가 2xx가 아닌 경우
      console.error(`❌ API 응답 에러 (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      // 요청은 전송되었지만 응답을 받지 못한 경우
      console.error('❌ API 응답 없음:', error.request);
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('❌ API 요청 설정 에러:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== 타입 정의 ====================

// API 공통 응답 타입
interface ApiResponse<T> {
  status: number;
  message: string;
  content: T;
}

// 양조장 목록 응답 (Swagger 명세 기준)
interface BreweryListResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 현재 페이지 번호
  content: BreweryApiData[];
  sort: {
    empty: boolean;
    sorted: boolean;
  };
}

// API 양조장 데이터 (Swagger /api/brewery/latest 응답 기준)
interface BreweryApiData {
  brewery_id: number;
  brewery_brewery_name: string;
  region_type_name: string;
  brewery_introduction: string;
  brewery_joy_min_price: number;
  image_key: string;
  is_visiting_brewery: boolean;
  is_regular_visit: boolean;
  tag_name: string[]; // 주종 태그 배열
}

// 양조장 상세 정보 (Swagger /api/brewery/{breweryId} 응답 기준)
interface BreweryDetailApiData {
  brewery_id: number;
  users_id: number;
  users_email: string;
  users_phone: string;
  brewery_name: string;
  brewery_address: string;
  brewery_address_detail: string;
  brewery_introduction: string;
  brewery_website: string;
  brewery_registered_at: string; // "2025-11-14"
  brewery_is_visiting_brewery: boolean;
  brewery_start_time: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  brewery_end_time: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
}

// 양조장 태그 (Swagger /api/brewery/tag-list 응답 기준)
interface BreweryTagData {
  tags_id: number;
  tags_name: string;
}

// 검색 파라미터 (Swagger /api/brewery/search 요청 기준)
interface BrewerySearchParams {
  startOffset: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[]; // 주종 태그 ID 배열
  region_id_list?: number[]; // 지역 ID 배열
}

// ==================== 상수 정의 ====================

// 지역 ID 매핑 (ERD 기준)
export const REGION_ID_MAP: Record<string, number> = {
  '서울/경기': 1,
  '강원도': 2,
  '충청도': 3,
  '전라도': 4,
  '경상도': 5,
  '제주도': 6
};

// 지역 ID -> 이름 역매핑
export const REGION_NAME_MAP: Record<number, string> = {
  1: '서울/경기',
  2: '강원도',
  3: '충청도',
  4: '전라도',
  5: '경상도',
  6: '제주도'
};

// 주종 태그 ID 매핑 (ERD 양조장_태그 테이블 기준)
export const ALCOHOL_TYPE_TAG_MAP: Record<string, number> = {
  '막걸리': 1,
  '청주': 2,
  '과실주': 3,
  '증류주': 4,
  '리큐르': 5,
  '기타': 6
};

// 태그 ID -> 주종명 역매핑
export const TAG_NAME_MAP: Record<number, string> = {
  1: '막걸리',
  2: '청주',
  3: '과실주',
  4: '증류주',
  5: '리큐르',
  6: '기타'
};

// ==================== 헬퍼 함수 ====================

/**
 * 시간 객체를 "HH:mm" 형식 문자열로 변환
 */
const formatTime = (timeObj: { hour: number; minute: number }): string => {
  const hour = String(timeObj.hour).padStart(2, '0');
  const minute = String(timeObj.minute).padStart(2, '0');
  return `${hour}:${minute}`;
};

/**
 * 지역명을 region_id로 변환
 */
export const convertRegionNamesToIds = (regionNames: string[]): number[] => {
  return regionNames
    .map(name => REGION_ID_MAP[name])
    .filter(id => id !== undefined);
};

/**
 * 주종명을 tag_id로 변환
 */
export const convertAlcoholTypesToIds = (alcoholTypes: string[]): number[] => {
  return alcoholTypes
    .map(type => ALCOHOL_TYPE_TAG_MAP[type])
    .filter(id => id !== undefined);
};

/**
 * region_id를 지역명으로 변환
 */
export const convertRegionIdsToNames = (regionIds: number[]): string[] => {
  return regionIds
    .map(id => REGION_NAME_MAP[id])
    .filter(name => name !== undefined);
};

/**
 * tag_id를 주종명으로 변환
 */
export const convertTagIdsToNames = (tagIds: number[]): string[] => {
  return tagIds
    .map(id => TAG_NAME_MAP[id])
    .filter(name => name !== undefined);
};

// ==================== 데이터 변환 함수 ====================

/**
 * API 양조장 데이터를 프론트엔드 타입으로 변환
 */
const transformBreweryData = (apiData: BreweryApiData): any => {
  return {
    brewery_id: apiData.brewery_id,
    brewery_name: apiData.brewery_brewery_name,
    region_name: apiData.region_type_name,
    introduction: apiData.brewery_introduction,
    image_key: apiData.image_key,
    alcohol_types: apiData.tag_name || [],
    
    // 체험 프로그램 정보 (최소 가격만 제공되므로 가상 프로그램 생성)
    experience_programs: apiData.brewery_joy_min_price ? [
      {
        joy_id: 0,
        brewery_id: apiData.brewery_id,
        name: '체험 프로그램',
        place: apiData.brewery_brewery_name,
        detail: '상세 정보는 양조장 페이지를 확인해주세요',
        price: apiData.brewery_joy_min_price,
        image_key: apiData.image_key
      }
    ] : [],
    
    // 배지 정보
    badges: [
      ...(apiData.is_visiting_brewery ? [{
        type: 'text' as const,
        content: '방문 가능',
        color: '#10b981'
      }] : []),
      ...(apiData.is_regular_visit ? [{
        type: 'text' as const,
        content: '정기 방문',
        color: '#8b5a3c'
      }] : [])
    ],
    
    // 기본값 (상세 정보에서 제공)
    user_id: 0,
    region_id: 0,
    business_phone: '',
    brewery_address: '',
    registered_at: new Date().toISOString(),
    business_registration_number: '',
    depositor: '',
    account_number: '',
    bank_name: '',
    price_range: apiData.brewery_joy_min_price > 50000 ? 'high' as const :
                 apiData.brewery_joy_min_price > 20000 ? 'medium' as const : 'low' as const
  };
};

/**
 * API 상세 데이터를 프론트엔드 타입으로 변환 (Swagger 기준)
 */
const transformBreweryDetailData = (apiData: BreweryDetailApiData): any => {
  return {
    brewery_id: apiData.brewery_id,
    user_id: apiData.users_id,
    region_id: 0, // API에서 제공되지 않으면 0
    brewery_name: apiData.brewery_name,
    business_phone: apiData.users_phone,
    business_email: apiData.users_email,
    brewery_address: apiData.brewery_address,
    brewery_address_detail: apiData.brewery_address_detail,
    registered_at: apiData.brewery_registered_at,
    business_registration_number: '', // API에서 제공되지 않음
    depositor: '', // API에서 제공되지 않음
    account_number: '', // API에서 제공되지 않음
    bank_name: '', // API에서 제공되지 않음
    introduction: apiData.brewery_introduction,
    brewery_website: apiData.brewery_website,
    start_time: formatTime(apiData.brewery_start_time),
    end_time: formatTime(apiData.brewery_end_time),
    is_visiting_brewery: apiData.brewery_is_visiting_brewery,
    region_name: '', // getBreweryTags()로 별도 조회 필요
    alcohol_types: [], // getBreweryTags()로 별도 조회 필요
    price_range: 'medium' as const, // 기본값
    image_key: '', // 별도 이미지 조회 필요
    brewery_images: [], // 별도 이미지 조회 필요
    experience_programs: [] // 별도 체험 프로그램 조회 필요
  };
};

// ==================== Mock 데이터 처리 ====================

/**
 * Mock 데이터에서 필터링된 양조장 반환
 */
const getMockBreweriesWithFilters = (params: BrewerySearchParams): any[] => {
  let breweries = getAllBreweries();

  // 키워드 필터링
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    breweries = breweries.filter(b => 
      b.brewery_name.toLowerCase().includes(keyword) ||
      b.region_name.toLowerCase().includes(keyword) ||
      b.introduction?.toLowerCase().includes(keyword) ||
      b.alcohol_types.some(type => type.toLowerCase().includes(keyword))
    );
  }

  // 가격 범위 필터링
  if (params.min_price !== undefined || params.max_price !== undefined) {
    breweries = breweries.filter(b => {
      if (!b.experience_programs || b.experience_programs.length === 0) return false;
      
      const minPrice = Math.min(...b.experience_programs.map(p => p.price));
      
      if (params.min_price !== undefined && minPrice < params.min_price) return false;
      if (params.max_price !== undefined && minPrice > params.max_price) return false;
      
      return true;
    });
  }

  // 지역 필터링
  if (params.region_id_list && params.region_id_list.length > 0) {
    const regionNames = convertRegionIdsToNames(params.region_id_list);
    breweries = breweries.filter(b => regionNames.includes(b.region_name));
  }

  // 주종 필터링
  if (params.tag_id_list && params.tag_id_list.length > 0) {
    const alcoholTypes = convertTagIdsToNames(params.tag_id_list);
    breweries = breweries.filter(b => 
      alcoholTypes.some(type => b.alcohol_types.includes(type))
    );
  }

  return breweries;
};

// ==================== API 함수 ====================

/**
 * 양조장 검색 (Swagger: GET /api/brewery/search/{startOffset})
 * @param params - 검색 파라미터
 * @returns 검색된 양조장 목록과 페이지 정보
 */
export const searchBreweries = async (
  params: BrewerySearchParams
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  // API 사용이 비활성화된 경우 바로 Mock 데이터 반환
  if (!USE_API) {
    console.log('🔄 Mock 데이터 모드 - API 호출 건너뛰기');
    const filteredBreweries = getMockBreweriesWithFilters(params);
    const pageSize = 10;
    const totalCount = filteredBreweries.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = params.startOffset * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedBreweries = filteredBreweries.slice(startIndex, endIndex);

    return {
      breweries: pagedBreweries,
      totalCount,
      totalPages
    };
  }

  try {
    // Query Parameters 구성
    const queryParams: any = {};
    
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.min_price !== undefined) queryParams.min_price = params.min_price;
    if (params.max_price !== undefined) queryParams.max_price = params.max_price;
    if (params.tag_id_list && params.tag_id_list.length > 0) {
      queryParams.tag_id_list = params.tag_id_list;
    }
    if (params.region_id_list && params.region_id_list.length > 0) {
      queryParams.region_id_list = params.region_id_list;
    }

    console.log('🔍 양조장 검색 API 호출:', {
      startOffset: params.startOffset,
      params: queryParams
    });

    // Axios GET 요청
    const response = await breweryApi.get<ApiResponse<BreweryListResponse>>(
      `/api/brewery/search/${params.startOffset}`,
      { params: queryParams }
    );

    const data = response.data;
    console.log('✅ 양조장 검색 API 성공:', data);

    // 데이터 변환
    const breweries = data.content.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.content.totalElements,
      totalPages: data.content.totalPages
    };
  } catch (error) {
    console.error('❌ 양조장 검색 API 실패 - Mock 데이터로 전환:', error);
    
    // Mock 데이터로 Fallback
    const filteredBreweries = getMockBreweriesWithFilters(params);
    const pageSize = 10;
    const totalCount = filteredBreweries.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = params.startOffset * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedBreweries = filteredBreweries.slice(startIndex, endIndex);

    console.log(`📦 Mock 데이터 반환: ${pagedBreweries.length}개 양조장 (총 ${totalCount}개)`);

    return {
      breweries: pagedBreweries,
      totalCount,
      totalPages
    };
  }
};

/**
 * 최신 양조장 목록 조회 (Swagger: GET /api/brewery/latest/{startOffset})
 * @param startOffset - 페이지 오프셋 (0부터 시작)
 * @returns 최신 양조장 목록과 페이지 정보
 */
export const getLatestBreweries = async (
  startOffset: number = 0
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  // API 사용이 비활성화된 경우 바로 Mock 데이터 반환
  if (!USE_API) {
    console.log('🔄 Mock 데이터 모드 - API 호출 건너뛰기');
    const mockBreweries = getAllBreweries();
    const pageSize = 10;
    const totalCount = mockBreweries.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = startOffset * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedBreweries = mockBreweries.slice(startIndex, endIndex);

    return {
      breweries: pagedBreweries,
      totalCount,
      totalPages
    };
  }

  try {
    console.log('🆕 최신 양조장 API 호출:', { startOffset });

    // Axios GET 요청
    const response = await breweryApi.get<ApiResponse<BreweryListResponse>>(
      `/api/brewery/latest/${startOffset}`
    );

    const data = response.data;
    console.log('✅ 최신 양조장 API 성공:', data);

    // 데이터 변환
    const breweries = data.content.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.content.totalElements,
      totalPages: data.content.totalPages
    };
  } catch (error) {
    console.error('❌ 최신 양조장 API 실패 - Mock 데이터로 전환:', error);
    
    // Mock 데이터로 Fallback
    const mockBreweries = getAllBreweries();
    const pageSize = 10;
    const totalCount = mockBreweries.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = startOffset * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedBreweries = mockBreweries.slice(startIndex, endIndex);

    console.log(`📦 Mock 데이터 반환: ${pagedBreweries.length}개 양조장 (총 ${totalCount}개)`);

    return {
      breweries: pagedBreweries,
      totalCount,
      totalPages
    };
  }
};

/**
 * 양조장 상세 정보 조회 (Swagger: GET /api/brewery/{breweryId})
 * @param breweryId - 양조장 ID
 * @returns 양조장 상세 정보
 */
export const getBreweryDetail = async (breweryId: number): Promise<any> => {
  // API 사용이 비활성화된 경우 바로 Mock 데이터 반환
  if (!USE_API) {
    console.log('🔄 Mock 데이터 모드 - API 호출 건너뛰기');
    const mockBrewery = getBreweryById(breweryId);
    if (!mockBrewery) {
      throw new Error(`양조장을 찾을 수 없습니다 (ID: ${breweryId})`);
    }
    return mockBrewery;
  }

  try {
    console.log('📋 양조장 상세 API 호출:', { breweryId });

    // Axios GET 요청
    const response = await breweryApi.get<ApiResponse<BreweryDetailApiData>>(
      `/api/brewery/${breweryId}`
    );

    const data = response.data;
    console.log('✅ 양조장 상세 API 성공:', data);

    // 데이터 변환
    return transformBreweryDetailData(data.content);
  } catch (error) {
    console.error(`❌ 양조장 상세 API 실패 (ID: ${breweryId}) - Mock 데이터로 전환:`, error);
    
    // Mock 데이터로 Fallback
    const mockBrewery = getBreweryById(breweryId);
    
    if (!mockBrewery) {
      console.error(`❌ Mock 데이터에서도 양조장을 찾을 수 없음 (ID: ${breweryId})`);
      throw new Error(`양조장을 찾을 수 없습니다 (ID: ${breweryId})`);
    }

    console.log(`📦 Mock 데이터 반환: ${mockBrewery.brewery_name}`);
    return mockBrewery;
  }
};

/**
 * 양조장 태그 목록 조회 (Swagger: GET /api/brewery/tag-list/{breweryId})
 * @param breweryId - 양조장 ID
 * @returns 양조장 태그 목록
 */
export const getBreweryTags = async (breweryId: number): Promise<BreweryTagData[]> => {
  // API 사용이 비활성화된 경우 Mock 데이터에서 태그 추출
  if (!USE_API) {
    console.log('🔄 Mock 데이터 모드 - API 호출 건너뛰기');
    const mockBrewery = getBreweryById(breweryId);
    if (!mockBrewery || !mockBrewery.alcohol_types) {
      return [];
    }
    
    // alcohol_types를 BreweryTagData 형식으로 변환
    return mockBrewery.alcohol_types.map((type: string, index: number) => ({
      tags_id: index + 1,
      tags_name: type
    }));
  }

  try {
    console.log('🏷️ 양조장 태그 API 호출:', { breweryId });

    // Axios GET 요청
    const response = await breweryApi.get<ApiResponse<BreweryTagData[]>>(
      `/api/brewery/tag-list/${breweryId}`
    );

    const data = response.data;
    console.log('✅ 양조장 태그 API 성공:', data);

    return data.content;
  } catch (error) {
    console.error(`❌ 양조장 태그 API 실패 (ID: ${breweryId}) - Mock 데이터로 전환:`, error);
    
    // Mock 데이터로 Fallback
    const mockBrewery = getBreweryById(breweryId);
    if (!mockBrewery || !mockBrewery.alcohol_types) {
      console.log('📦 Mock 태그 데이터 없음 - 빈 배열 반환');
      return [];
    }
    
    // alcohol_types를 BreweryTagData 형식으로 변환
    const tags = mockBrewery.alcohol_types.map((type: string, index: number) => ({
      tags_id: index + 1,
      tags_name: type
    }));

    console.log(`📦 Mock 태그 데이터 반환: ${tags.map(t => t.tags_name).join(', ')}`);
    return tags;
  }
};

// ==================== 테스트 함수 ====================

/**
 * API 연결 테스트
 */
export const testBreweryApi = async (): Promise<void> => {
  console.log('🧪 양조장 API 테스트 시작...\n');
  
  try {
    // 1. 최신 양조장 조회
    console.log('1️⃣ 최신 양조장 조회 테스트');
    const latestResult = await getLatestBreweries(0);
    console.log(`✅ 최신 양조장 ${latestResult.breweries.length}개 조회 완료`);
    console.log(`   총 ${latestResult.totalCount}개 양조장 (${latestResult.totalPages}페이지)\n`);
    
    // 2. 검색 테스트
    console.log('2️⃣ 양조장 검색 테스트');
    const searchResult = await searchBreweries({
      startOffset: 0,
      keyword: '양조장'
    });
    console.log(`✅ 검색 결과 ${searchResult.breweries.length}개 조회 완료\n`);
    
    // 3. 상세 정보 조회
    if (latestResult.breweries.length > 0) {
      console.log('3️⃣ 양조장 상세 정보 조회 테스트');
      const breweryId = latestResult.breweries[0].brewery_id;
      const detail = await getBreweryDetail(breweryId);
      console.log(`✅ ${detail.brewery_name} 상세 정보 조회 완료\n`);
      
      // 4. 태그 목록 조회
      console.log('4️⃣ 양조장 태그 목록 조회 테스트');
      const tags = await getBreweryTags(breweryId);
      console.log(`✅ 태그 ${tags.length}개 조회 완료:`, tags.map(t => t.tags_name).join(', '));
    }
    
    console.log('\n✅ 모든 API 테스트 완료!');
  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error);
  }
};

// ==================== Export ====================

export default {
  searchBreweries,
  getLatestBreweries,
  getBreweryDetail,
  getBreweryTags,
  convertRegionNamesToIds,
  convertAlcoholTypesToIds,
  convertRegionIdsToNames,
  convertTagIdsToNames,
  testBreweryApi,
  REGION_ID_MAP,
  REGION_NAME_MAP,
  ALCOHOL_TYPE_TAG_MAP,
  TAG_NAME_MAP
};