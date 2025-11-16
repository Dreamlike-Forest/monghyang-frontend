// utils/breweryUtils.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getAllBreweries, getBreweryById } from '../data/mockData';

// ==================== 기본 설정 ====================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

// API 활성화 여부 (환경변수로 제어 가능, 기본 true)
const USE_API = process.env.NEXT_PUBLIC_USE_API !== 'false';

// Axios 인스턴스 생성
const breweryApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
breweryApi.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.params,
    );
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  },
);

// ✅ 응답 인터셉터 (태그 없음 404는 경고만)
breweryApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const path = data?.path || error.config?.url || '';

    // 👉 태그가 없는 양조장인 경우 (정상 케이스)
    if (
      status === 404 &&
      typeof data?.message === 'string' &&
      data.message.includes('태그가 존재하지 않습니다')
    ) {
      console.warn(`ℹ️ 태그 없음 404: ${path}`);
      return Promise.reject(error); // getBreweryTags에서 처리
    }

    // 그 외 진짜 에러만 빨간 로그로
    if (error.response) {
      console.error(`❌ API 응답 에러 (${status}):`, data);
    } else if (error.request) {
      console.error('❌ API 응답 없음:', error.request);
    } else {
      console.error('❌ API 요청 설정 에러:', error.message);
    }
    return Promise.reject(error);
  },
);

// ==================== 타입 정의 ====================

interface ApiResponse<T> {
  status: number;
  message: string;
  content: T;
}

// 목록 응답 (latest / search)
interface BreweryListResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  content: BreweryApiData[];
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

// 목록에서 쓰는 양조장 데이터
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

// 상세 보기 데이터 (/api/brewery/{id})
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

// 태그 데이터 (ERD의 tags 테이블 기준)
export interface BreweryTagData {
  tags_id: number;   // tags PK (brewery_tag.tag_id)
  tags_name: string; // 태그 이름
}

// 검색 파라미터
export interface BrewerySearchParams {
  startOffset: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  tag_id_list?: number[];
  region_id_list?: number[];
}

// ==================== 상수 (ERD 기반) ====================

export const REGION_ID_MAP: Record<string, number> = {
  '서울/경기': 1,
  '강원도': 2,
  '충청도': 3,
  '전라도': 4,
  '경상도': 5,
  '제주도': 6,
};

export const REGION_NAME_MAP: Record<number, string> = {
  1: '서울/경기',
  2: '강원도',
  3: '충청도',
  4: '전라도',
  5: '경상도',
  6: '제주도',
};

// 주종 태그 (tags + brewery_tag 기준)
export const ALCOHOL_TYPE_TAG_MAP: Record<string, number> = {
  막걸리: 1,
  청주: 2,
  과실주: 3,
  증류주: 4,
  리큐르: 5,
  기타: 6,
};

export const TAG_NAME_MAP: Record<number, string> = {
  1: '막걸리',
  2: '청주',
  3: '과실주',
  4: '증류주',
  5: '리큐르',
  6: '기타',
};

// ==================== 헬퍼 함수 ====================

const formatTime = (timeObj: { hour: number; minute: number }): string => {
  const hh = String(timeObj.hour).padStart(2, '0');
  const mm = String(timeObj.minute).padStart(2, '0');
  return `${hh}:${mm}`;
};

export const convertRegionNamesToIds = (regionNames: string[]): number[] =>
  regionNames
    .map((name) => REGION_ID_MAP[name])
    .filter((id): id is number => id !== undefined);

export const convertAlcoholTypesToIds = (alcoholTypes: string[]): number[] =>
  alcoholTypes
    .map((type) => ALCOHOL_TYPE_TAG_MAP[type])
    .filter((id): id is number => id !== undefined);

export const convertRegionIdsToNames = (regionIds: number[]): string[] =>
  regionIds
    .map((id) => REGION_NAME_MAP[id])
    .filter((name): name is string => name !== undefined);

export const convertTagIdsToNames = (tagIds: number[]): string[] =>
  tagIds
    .map((id) => TAG_NAME_MAP[id])
    .filter((name): name is string => name !== undefined);

// ==================== 데이터 변환 ====================

const transformBreweryData = (apiData: BreweryApiData): any => {
  return {
    brewery_id: apiData.brewery_id,
    brewery_name: apiData.brewery_brewery_name,
    region_name: apiData.region_type_name,
    introduction: apiData.brewery_introduction,
    image_key: apiData.image_key,
    alcohol_types: apiData.tag_name || [],

    experience_programs: apiData.brewery_joy_min_price
      ? [
          {
            joy_id: 0,
            brewery_id: apiData.brewery_id,
            name: '체험 프로그램',
            place: apiData.brewery_brewery_name,
            detail: '상세 정보는 양조장 페이지를 확인해주세요.',
            price: apiData.brewery_joy_min_price,
            image_key: apiData.image_key,
          },
        ]
      : [],

    badges: [
      ...(apiData.is_visiting_brewery
        ? [{ type: 'text' as const, content: '방문 가능', color: '#10b981' }]
        : []),
      ...(apiData.is_regular_visit
        ? [{ type: 'text' as const, content: '정기 방문', color: '#8b5a3c' }]
        : []),
    ],

    // 상세 API에서 채워질 필드 기본값
    user_id: 0,
    region_id: 0,
    business_phone: '',
    brewery_address: '',
    registered_at: new Date().toISOString(),
    business_registration_number: '',
    depositor: '',
    account_number: '',
    bank_name: '',
    price_range:
      apiData.brewery_joy_min_price > 50000
        ? ('high' as const)
        : apiData.brewery_joy_min_price > 20000
        ? ('medium' as const)
        : ('low' as const),
  };
};

const transformBreweryDetailData = (apiData: BreweryDetailApiData): any => {
  return {
    brewery_id: apiData.brewery_id,
    user_id: apiData.users_id,
    region_id: 0,
    brewery_name: apiData.brewery_name,
    business_phone: apiData.users_phone,
    business_email: apiData.users_email,

    brewery_address: apiData.brewery_address,
    brewery_address_detail: apiData.brewery_address_detail,

    registered_at: apiData.brewery_registered_at,
    business_registration_number: '',
    depositor: '',
    account_number: '',
    bank_name: '',

    introduction: apiData.brewery_introduction,
    brewery_website: apiData.brewery_website,

    start_time: formatTime(apiData.brewery_start_time),
    end_time: formatTime(apiData.brewery_end_time),
    is_visiting_brewery: apiData.brewery_is_visiting_brewery,

    region_name: '',
    alcohol_types: [],
    price_range: 'medium',
    image_key: '',
    brewery_images: [],
    experience_programs: [],
  };
};

// ==================== Mock 필터 ====================

const getMockBreweriesWithFilters = (params: BrewerySearchParams): any[] => {
  let breweries = getAllBreweries();

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    breweries = breweries.filter(
      (b: any) =>
        b.brewery_name.toLowerCase().includes(kw) ||
        b.region_name.toLowerCase().includes(kw) ||
        b.introduction?.toLowerCase().includes(kw) ||
        b.alcohol_types.some((t: string) => t.toLowerCase().includes(kw)),
    );
  }

  if (params.min_price !== undefined || params.max_price !== undefined) {
    breweries = breweries.filter((b: any) => {
      if (!b.experience_programs?.length) return false;
      const minPrice = Math.min(...b.experience_programs.map((p: any) => p.price));
      if (params.min_price !== undefined && minPrice < params.min_price) return false;
      if (params.max_price !== undefined && minPrice > params.max_price) return false;
      return true;
    });
  }

  if (params.region_id_list?.length) {
    const regionNames = convertRegionIdsToNames(params.region_id_list);
    breweries = breweries.filter((b: any) => regionNames.includes(b.region_name));
  }

  if (params.tag_id_list?.length) {
    const alcoholTypes = convertTagIdsToNames(params.tag_id_list);
    breweries = breweries.filter((b: any) =>
      alcoholTypes.some((t) => b.alcohol_types.includes(t)),
    );
  }

  return breweries;
};

// ==================== API 함수 ====================

export const searchBreweries = async (
  params: BrewerySearchParams,
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  if (!USE_API) {
    console.log('🔄 Mock 모드 – searchBreweries');
    const filtered = getMockBreweriesWithFilters(params);
    const pageSize = 10;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = params.startOffset * pageSize;
    const paged = filtered.slice(startIndex, startIndex + pageSize);
    return { breweries: paged, totalCount, totalPages };
  }

  try {
    const queryParams: any = {};
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.min_price !== undefined) queryParams.min_price = params.min_price;
    if (params.max_price !== undefined) queryParams.max_price = params.max_price;
    if (params.tag_id_list?.length) queryParams.tag_id_list = params.tag_id_list;
    if (params.region_id_list?.length) queryParams.region_id_list = params.region_id_list;

    const res = await breweryApi.get<ApiResponse<BreweryListResponse>>(
      `/api/brewery/search/${params.startOffset}`,
      { params: queryParams },
    );

    const data = res.data.content;
    const breweries = data.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.totalElements,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('❌ searchBreweries 실패 – Mock fallback:', error);
    const filtered = getMockBreweriesWithFilters(params);
    const pageSize = 10;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = params.startOffset * pageSize;
    const paged = filtered.slice(startIndex, startIndex + pageSize);
    return { breweries: paged, totalCount, totalPages };
  }
};

export const getLatestBreweries = async (
  startOffset: number = 0,
): Promise<{ breweries: any[]; totalCount: number; totalPages: number }> => {
  if (!USE_API) {
    console.log('🔄 Mock 모드 – getLatestBreweries');
    const all = getAllBreweries();
    const pageSize = 10;
    const totalCount = all.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = startOffset * pageSize;
    const paged = all.slice(startIndex, startIndex + pageSize);
    return { breweries: paged, totalCount, totalPages };
  }

  try {
    const res = await breweryApi.get<ApiResponse<BreweryListResponse>>(
      `/api/brewery/latest/${startOffset}`,
    );
    const data = res.data.content;
    const breweries = data.content.map(transformBreweryData);

    return {
      breweries,
      totalCount: data.totalElements,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('❌ getLatestBreweries 실패 – Mock fallback:', error);
    const all = getAllBreweries();
    const pageSize = 10;
    const totalCount = all.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = startOffset * pageSize;
    const paged = all.slice(startIndex, startIndex + pageSize);
    return { breweries: paged, totalCount, totalPages };
  }
};

export const getBreweryDetail = async (breweryId: number): Promise<any> => {
  if (!USE_API) {
    console.log('🔄 Mock 모드 – getBreweryDetail');
    const mock = getBreweryById(breweryId);
    if (!mock) throw new Error(`양조장을 찾을 수 없습니다 (ID: ${breweryId})`);
    return mock;
  }

  try {
    const res = await breweryApi.get<ApiResponse<BreweryDetailApiData>>(
      `/api/brewery/${breweryId}`,
    );
    return transformBreweryDetailData(res.data.content);
  } catch (error) {
    console.error(`❌ getBreweryDetail 실패 (ID: ${breweryId}) – Mock fallback:`, error);
    const mock = getBreweryById(breweryId);
    if (!mock) throw new Error(`양조장을 찾을 수 없습니다 (ID: ${breweryId})`);
    return mock;
  }
};

// 👉 ERD 상 brewery_tag 는 조인 테이블이고
//    프론트는 /api/brewery/tag-list/{id} 로 이미 join 된 태그 목록만 사용한다.
export const getBreweryTags = async (breweryId: number): Promise<BreweryTagData[]> => {
  if (!USE_API) {
    console.log('🔄 Mock 모드 – getBreweryTags');
    const mock = getBreweryById(breweryId);
    if (!mock?.alcohol_types) return [];
    return mock.alcohol_types.map((type: string, idx: number) => ({
      tags_id: idx + 1,
      tags_name: type,
    }));
  }

  try {
    const res = await breweryApi.get<ApiResponse<BreweryTagData[]>>(
      `/api/brewery/tag-list/${breweryId}`,
    );
    return res.data.content;
  } catch (error) {
    const axiosErr = error as AxiosError<any>;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data as any;

    // ✅ "태그가 존재하지 않습니다" 404 → 태그 없는 양조장 (정상)
    if (
      status === 404 &&
      typeof data?.message === 'string' &&
      data.message.includes('태그가 존재하지 않습니다')
    ) {
      console.warn(`ℹ️ 양조장(ID: ${breweryId}) 태그 없음 (404) – 빈 배열 반환`);
      return [];
    }

    console.error(`❌ getBreweryTags 실패 (ID: ${breweryId}) – Mock fallback:`, error);

    const mock = getBreweryById(breweryId);
    if (!mock?.alcohol_types) return [];
    return mock.alcohol_types.map((type: string, idx: number) => ({
      tags_id: idx + 1,
      tags_name: type,
    }));
  }
};

// ==================== 테스트용 함수 ====================

export const testBreweryApi = async (): Promise<void> => {
  console.log('🧪 양조장 API 테스트 시작...\n');

  try {
    console.log('1️⃣ 최신 양조장 조회');
    const latest = await getLatestBreweries(0);
    console.log(
      `✅ 최신 양조장 ${latest.breweries.length}개 / 총 ${latest.totalCount}개 (${latest.totalPages}페이지)`,
    );

    console.log('\n2️⃣ 검색 테스트');
    const search = await searchBreweries({ startOffset: 0, keyword: '양조장' });
    console.log(`✅ 검색 결과 ${search.breweries.length}개`);

    if (latest.breweries.length > 0) {
      const id = latest.breweries[0].brewery_id;
      console.log('\n3️⃣ 상세 조회 테스트 (ID:', id, ')');
      const detail = await getBreweryDetail(id);
      console.log(`✅ ${detail.brewery_name} 상세 조회 완료`);

      console.log('\n4️⃣ 태그 조회 테스트');
      const tags = await getBreweryTags(id);
      console.log(`✅ 태그 ${tags.length}개:`, tags.map((t) => t.tags_name).join(', '));
    }

    console.log('\n🎉 모든 API 테스트 완료');
  } catch (e) {
    console.error('❌ testBreweryApi 실패:', e);
  }
};

// ==================== default export ====================

export default {
  searchBreweries,
  getLatestBreweries,
  getBreweryDetail,
  getBreweryTags,
  convertRegionNamesToIds,
  convertAlcoholTypesToIds,
  convertRegionIdsToNames,
  convertTagIdsToNames,
  REGION_ID_MAP,
  REGION_NAME_MAP,
  ALCOHOL_TYPE_TAG_MAP,
  TAG_NAME_MAP,
  testBreweryApi,
};
