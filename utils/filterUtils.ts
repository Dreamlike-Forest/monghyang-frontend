import { ProductActiveFilters } from '../types/shop';
import { ProductSearchParams } from '../types/product';

// 주종 문자열 ID를 태그 ID로 매핑
const TYPE_TO_TAG_ID_MAP: Record<string, number> = {
  'takju': 1,
  'cheongju': 2,
  'yakju': 3,
  'soju': 4,
  'fruit': 5, 
};

// 도수 범위 매핑
const ALCOHOL_RANGE_MAP: Record<string, { min: number; max: number }> = {
  'low': { min: 0, max: 6 },
  'medium': { min: 7, max: 15 },
  'high1': { min: 16, max: 25 },
  'high2': { min: 25, max: 100 },
};

// 기본 가격 범위
const DEFAULT_PRICE = {
  MIN: 0,
  MAX: 999999,
} as const;

// 필터가 활성화되었는지 확인
export const hasActiveFilters = (filters: ProductActiveFilters): boolean => {
  return !!(
    filters.searchKeyword ||
    filters.types.length > 0 ||
    filters.alcoholRange ||
    filters.priceMin > DEFAULT_PRICE.MIN ||
    filters.priceMax < DEFAULT_PRICE.MAX ||
    filters.certifications.length > 0
  );
};

// 활성 필터를 API 파라미터로 변환
export const buildSearchParams = (
  filters: ProductActiveFilters,
  currentPage: number
): ProductSearchParams => {
  const params: ProductSearchParams = {
    startOffset: currentPage - 1,
  };

  if (filters.searchKeyword) {
    params.keyword = filters.searchKeyword.trim();
  }

  if (filters.priceMin > DEFAULT_PRICE.MIN) {
    params.min_price = filters.priceMin;
  }

  if (filters.priceMax < DEFAULT_PRICE.MAX) {
    params.max_price = filters.priceMax;
  }

  if (filters.alcoholRange && ALCOHOL_RANGE_MAP[filters.alcoholRange]) {
    const range = ALCOHOL_RANGE_MAP[filters.alcoholRange];
    params.min_alcohol = range.min;
    params.max_alcohol = range.max;
  }

  // 주종 필터를 태그 ID 리스트로 변환
  if (filters.types.length > 0) {
    params.tag_id_list = filters.types
      .map(type => TYPE_TO_TAG_ID_MAP[type])
      .filter(id => id !== undefined);
  }

  return params;
};

// 필터 초기화 상태
export const getInitialFilters = (): ProductActiveFilters => ({
  types: [],
  alcoholRange: '',
  regions: [],
  priceMin: DEFAULT_PRICE.MIN,
  priceMax: DEFAULT_PRICE.MAX,
  certifications: [],
  searchKeyword: '',
  sortBy: 'latest',
});

// 필터 업데이트 헬퍼
export const updateFilters = (
  currentFilters: ProductActiveFilters,
  newFilters: Partial<ProductActiveFilters>
): ProductActiveFilters => {
  return { ...currentFilters, ...newFilters };
};

// 특정 필터 제거
export const removeFilter = (
  currentFilters: ProductActiveFilters,
  category: keyof ProductActiveFilters,
  value?: string
): ProductActiveFilters => {
  const updated = { ...currentFilters };

  if (Array.isArray(updated[category]) && value) {
    const array = updated[category] as string[];
    (updated[category] as string[]) = array.filter(item => item !== value);
  } else if (category === 'alcoholRange' || category === 'searchKeyword' || category === 'sortBy') {
    updated[category] = category === 'sortBy' ? 'latest' : '';
  } else if (category === 'priceMin') {
    updated.priceMin = DEFAULT_PRICE.MIN;
  } else if (category === 'priceMax') {
    updated.priceMax = DEFAULT_PRICE.MAX;
  }

  return updated;
};

// 모든 필터 초기화
export const clearAllFilters = (): ProductActiveFilters => ({
  ...getInitialFilters(),
  sortBy: 'latest',
});

// 가격 입력 검증
export const validatePriceInput = (value: string, maxLength: number = 8): number | '' => {
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (numericValue.length > maxLength) {
    return '';
  }
  
  return numericValue === '' ? '' : parseInt(numericValue, 10);
};

// 필터 태그 생성
export interface FilterTag {
  category: keyof ProductActiveFilters;
  label: string;
  value: string;
}

export const generateFilterTags = (
  filters: ProductActiveFilters,
  filterOptions: any
): FilterTag[] => {
  const tags: FilterTag[] = [];

  filters.types.forEach(type => {
    const option = filterOptions.types?.find((opt: any) => opt.id === type);
    if (option) tags.push({ category: 'types', label: option.name, value: type });
  });

  if (filters.alcoholRange) {
    const option = filterOptions.alcoholRanges?.find((opt: any) => opt.id === filters.alcoholRange);
    if (option) tags.push({ category: 'alcoholRange', label: option.name, value: filters.alcoholRange });
  }

  filters.certifications.forEach(cert => {
    const option = filterOptions.certifications?.find((opt: any) => opt.id === cert);
    if (option) tags.push({ category: 'certifications', label: option.name, value: cert });
  });

  if (filters.searchKeyword) {
    tags.push({ 
      category: 'searchKeyword', 
      label: `"${filters.searchKeyword}"`, 
      value: filters.searchKeyword 
    });
  }

  if (filters.priceMin !== DEFAULT_PRICE.MIN || filters.priceMax !== DEFAULT_PRICE.MAX) {
    const minText = filters.priceMin !== DEFAULT_PRICE.MIN 
      ? filters.priceMin.toLocaleString() 
      : '0';
    const maxText = filters.priceMax !== DEFAULT_PRICE.MAX 
      ? filters.priceMax.toLocaleString() 
      : '∞';
    tags.push({ 
      category: 'priceMin', 
      label: `${minText}원 ~ ${maxText}원`, 
      value: 'price' 
    });
  }

  return tags;
};

// 체크박스 토글
export const toggleCheckbox = (
  currentArray: string[],
  value: string
): string[] => {
  if (currentArray.includes(value)) {
    return currentArray.filter(item => item !== value);
  }
  return [...currentArray, value];
};

// 단일 선택 체크박스 토글
export const toggleSingleCheckbox = (
  currentValue: string,
  value: string
): string => {
  return currentValue === value ? '' : value;
};