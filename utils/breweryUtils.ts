const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// API 공통 응답 타입
interface ApiResponse<T> {
  status: number;
  message: string;
  content: T;
}

// 양조장 목록 응답
interface BreweryListResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  content: BreweryApiData[];
  sort: {
    empty: boolean;
    sorted: boolean;
  };
}

// API 양조장 데이터
interface BreweryApiData {
  brewery_id: number;
  brewery_brewery_name: string;
  region_type_name: string;
  brewery_introduction: string;
  brewery_joy_min_price: number;
  image_key: string;
  is_visiting_brewery: boolean;
  is_regular_visit: boolean;
  tag_name: string[];
}

// 양조장 상세 정보
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
  brewery_registered_at: string;
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

// 양조장 태그
interface BreweryTagData {
  tags_id: number;
  tags_name: string;
}

// 검색 파라미터
interface BrewerySearchParams {
  startOffset: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  region_id_list?: number[];
}

// 지역 ID 매핑
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

// 주종 태그 ID 매핑
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

const formatTime = (timeObj: { hour: number; minute: number }): string => {
  const hour = String(timeObj.hour).padStart(2, '0');
  const minute = String(timeObj.minute).padStart(2, '0');
  return `${hour}:${minute}`;
};

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
    // 기본값
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
 * API 상세 데이터를 프론트엔드 타입으로 변환
 */
const transformBreweryDetailData = (apiData: BreweryDetailApiData): any => {
  return {
    brewery_id: apiData.brewery_id,
    user_id: apiData.users_id,
    region_id: 0,
    brewery_name: apiData.brewery_name,
    business_phone: apiData.users_phone,
    business_email: apiData.users_email,
    brewery_address: apiData.brewery_address,
    registered_at: apiData.brewery_registered_at,
    business_registration_number: '',
    depositor: '',
    account_number: '',
    bank_name: '',
    introduction: apiData.brewery_introduction,
    brewery_website: apiData.brewery_website,
    start_time: formatTime(apiData.brewery_start_time),
    end_time: formatTime(apiData.brewery_end_time),
    region_name: '',
    alcohol_types: [],
    price_range: 'medium' as const,
    experience_programs: []
  };
};

// ==================== API 함수 ====================

/**
 * 양조장 검색
 */
export const searchBreweries = async (
  params: BrewerySearchParams
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startOffset', params.startOffset.toString());
    
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    if (params.min_price !== undefined) {
      queryParams.append('min_price', params.min_price.toString());
    }
    if (params.max_price !== undefined) {
      queryParams.append('max_price', params.max_price.toString());
    }
    if (params.tag_id_list && params.tag_id_list.length > 0) {
      params.tag_id_list.forEach(id => {
        queryParams.append('tag_id_list', id.toString());
      });
    }
    if (params.region_id_list && params.region_id_list.length > 0) {
      params.region_id_list.forEach(id => {
        queryParams.append('region_id_list', id.toString());
      });
    }

    const url = `${API_BASE_URL}/api/brewery/search/${params.startOffset}?${queryParams.toString()}`;
    console.log('🔍 양조장 검색 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: ApiResponse<BreweryListResponse> = await response.json();
    console.log('✅ 양조장 검색 결과:', data);

    const breweries = data.content.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.content.totalElements,
      totalPages: data.content.totalPages
    };
  } catch (error) {
    console.error('❌ 양조장 검색 API 오류:', error);
    throw error;
  }
};

/**
 * 최신 양조장 목록 조회
 */
export const getLatestBreweries = async (
  startOffset: number = 0
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  try {
    const url = `${API_BASE_URL}/api/brewery/latest/${startOffset}`;
    console.log('🆕 최신 양조장 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: ApiResponse<BreweryListResponse> = await response.json();
    console.log('✅ 최신 양조장 결과:', data);

    const breweries = data.content.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.content.totalElements,
      totalPages: data.content.totalPages
    };
  } catch (error) {
    console.error('❌ 최신 양조장 API 오류:', error);
    throw error;
  }
};

/**
 * 양조장 상세 정보 조회
 */
export const getBreweryDetail = async (breweryId: number): Promise<any> => {
  try {
    const url = `${API_BASE_URL}/api/brewery/${breweryId}`;
    console.log('📋 양조장 상세 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: ApiResponse<BreweryDetailApiData> = await response.json();
    console.log('✅ 양조장 상세 결과:', data);

    return transformBreweryDetailData(data.content);
  } catch (error) {
    console.error('❌ 양조장 상세 API 오류:', error);
    throw error;
  }
};

/**
 * 양조장 태그 목록 조회
 */
export const getBreweryTags = async (breweryId: number): Promise<BreweryTagData[]> => {
  try {
    const url = `${API_BASE_URL}/api/brewery/tag-list/${breweryId}`;
    console.log('🏷️ 양조장 태그 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: ApiResponse<BreweryTagData[]> = await response.json();
    console.log('✅ 양조장 태그 결과:', data);

    return data.content;
  } catch (error) {
    console.error('❌ 양조장 태그 API 오류:', error);
    throw error;
  }
};

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