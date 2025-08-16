'use client';

import { useState, useMemo } from 'react';
import SearchBar from '../../shop/SearchBar/SearchBar';
import { BreweryFilterOptions } from '../../../types/mockData';
import './BreweryFilter.css';

interface BreweryFilterProps {
  filters: BreweryFilterOptions;
  onFilterChange: (filters: Partial<BreweryFilterOptions>) => void;
  breweryCount: {
    total: number;
    byRegion: Record<string, number>;
    byAlcoholType: Record<string, number>;
    byBadge: Record<string, number>;
    priceStats: {
      min: number;
      max: number;
      withExperience: number;
    };
  };
}

interface FilterOption {
  value: string;
  count: number;
}

interface FilterSectionProps {
  title: string;
  category: keyof Pick<BreweryFilterOptions, 'regions' | 'alcoholTypes' | 'badges'>;
  options: FilterOption[];
  resetAction: () => void;
  filters: BreweryFilterOptions;
  onFilterChange: (filters: Partial<BreweryFilterOptions>) => void;
}

// FilterSection 컴포넌트 정의
const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  category, 
  options, 
  resetAction, 
  filters, 
  onFilterChange 
}) => {
  const handleCheckboxChange = (value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({ [category]: newValues });
  };

  return (
    <div className="brewery-filter-section">
      <div className="brewery-filter-title">
        {title}
        <button className="brewery-filter-reset" onClick={resetAction}>
          초기화
        </button>
      </div>
      <div className="brewery-filter-options">
        {options.map(option => (
          <label key={option.value} className="brewery-filter-option">
            <input
              type="checkbox"
              className="brewery-filter-checkbox"
              checked={(filters[category] as string[]).includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
            />
            <span className="brewery-filter-option-label">{option.value}</span>
            <span className="brewery-filter-option-count">({option.count})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const BreweryFilter: React.FC<BreweryFilterProps> = ({ filters, onFilterChange, breweryCount }) => {
  const [priceMin, setPriceMin] = useState<number | ''>(filters.priceRange.min);
  const [priceMax, setPriceMax] = useState<number | ''>(filters.priceRange.max);

  // 필터 데이터 상수
  const filterData = {
    regions: ['서울/경기', '강원도', '충청도', '전라도', '경상도', '제주도'],
    alcoholTypes: ['막걸리', '청주', '과실주', '증류주', '리큐르', '기타']
  } as const;

  // 가격 입력 처리
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (numericValue.length > 8) return; 
    
    const finalValue: number | '' = numericValue === '' ? '' : parseInt(numericValue, 10);
    
    if (type === 'min') {
      setPriceMin(finalValue);
    } else {
      setPriceMax(finalValue);
    }
  };

  // 가격 필터 적용
  const handlePriceApply = () => {
    onFilterChange({ 
      priceRange: {
        min: priceMin,
        max: priceMax
      }
    });
  };

  // 검색어 변경 처리
  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

  // 특정 카테고리 필터 초기화
  const clearCategory = (category: keyof BreweryFilterOptions) => {
    if (category === 'priceRange') {
      setPriceMin('');
      setPriceMax('');
      onFilterChange({ priceRange: { min: '', max: '' } });
    } else if (category === 'searchKeyword') {
      onFilterChange({ searchKeyword: '' });
    } else {
      onFilterChange({ [category]: [] });
    }
  };

  // 모든 필터 초기화 (타입 오류 수정)
  const clearAllFilters = () => {
    const emptyFilters: BreweryFilterOptions = { 
      regions: [], 
      priceRange: { min: '', max: '' }, 
      alcoholTypes: [],
      badges: [],
      searchKeyword: ''
    };
    setPriceMin('');
    setPriceMax('');
    onFilterChange(emptyFilters);
  };

  // 활성화된 필터 태그들 생성 (메모이제이션으로 성능 최적화)
  const activeFilterTags = useMemo(() => {
    const tags: { category: keyof BreweryFilterOptions; label: string }[] = [];
    
    // 지역 필터 태그
    filters.regions.forEach(region => {
      tags.push({ category: 'regions', label: region });
    });
    
    // 주종 필터 태그
    filters.alcoholTypes.forEach(type => {
      tags.push({ category: 'alcoholTypes', label: type });
    });

    // 배지 필터 태그
    filters.badges.forEach(badge => {
      tags.push({ category: 'badges', label: badge });
    });

    // 검색어 태그
    if (filters.searchKeyword) {
      tags.push({ category: 'searchKeyword', label: `"${filters.searchKeyword}"` });
    }

    // 가격 범위 태그
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      const minText = filters.priceRange.min !== '' ? filters.priceRange.min.toLocaleString() : '0';
      const maxText = filters.priceRange.max !== '' ? filters.priceRange.max.toLocaleString() : '∞';
      tags.push({ category: 'priceRange', label: `${minText}원 ~ ${maxText}원` });
    }

    return tags;
  }, [filters]);

  // 배지 옵션 생성 (정렬 적용)
  const badgeOptions = useMemo(() => {
    return Object.entries(breweryCount.byBadge)
      .sort(([a], [b]) => {
        if (a === '기본') return 1;
        if (b === '기본') return -1;
        return a.localeCompare(b);
      })
      .map(([badge, count]) => ({ value: badge, count }));
  }, [breweryCount.byBadge]);

  return (
    <div className="brewery-filter">
      {/* 검색 바 */}
      <div className="brewery-filter-section">
        <SearchBar
          placeholder="양조장 이름, 지역, 주종으로 검색"
          keyword={filters.searchKeyword}
          onSearch={handleSearchChange}
        />
      </div>

      {/* 활성화된 필터 표시 */}
      {activeFilterTags.length > 0 && (
        <div className="brewery-active-filters">
          <div className="brewery-active-filters-title">선택된 필터</div>
          <div className="brewery-active-filter-tags">
            {activeFilterTags.map((tag, index) => (
              <span key={index} className="brewery-active-filter-tag">
                {tag.label}
                <button
                  className="brewery-remove-filter"
                  onClick={() => clearCategory(tag.category)}
                  title="필터 제거"
                  aria-label={`${tag.label} 필터 제거`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button 
            className="brewery-clear-all-filters" 
            onClick={clearAllFilters}
            aria-label="모든 필터 해제"
          >
            전체 해제
          </button>
        </div>
      )}

      {/* 지역 필터 */}
      <FilterSection
        title="지역"
        category="regions"
        options={filterData.regions.map(region => ({
          value: region,
          count: breweryCount.byRegion[region] || 0
        }))}
        resetAction={() => clearCategory('regions')}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* 가격 필터 */}
      <div className="brewery-filter-section">
        <div className="brewery-filter-title">
          가격
          <button 
            className="brewery-filter-reset" 
            onClick={() => clearCategory('priceRange')}
          >
            초기화
          </button>
        </div>
        
        <div className="brewery-price-range-inputs">
          <div className="brewery-price-input-wrapper">
            <input
              type="number"
              placeholder="최소 가격"
              value={priceMin || ''}
              onChange={(e) => handlePriceInputChange('min', e.target.value)}
              className="brewery-price-input"
              min="0"
              max="99999999"
            />
          </div>
          
          <span className="brewery-price-separator">~</span>
          
          <div className="brewery-price-input-wrapper">
            <input
              type="number"
              placeholder="최대 가격"
              value={priceMax || ''}
              onChange={(e) => handlePriceInputChange('max', e.target.value)}
              className="brewery-price-input"
              min="0"
              max="99999999"
            />
          </div>
        </div>
        
        <div className="brewery-price-apply-container">
          <button 
            className="brewery-apply-button" 
            onClick={handlePriceApply}
            disabled={priceMin === '' && priceMax === ''}
          >
            적용
          </button>
        </div>
      </div>

      {/* 주종 필터 */}
      <FilterSection
        title="주종"
        category="alcoholTypes"
        options={filterData.alcoholTypes.map(type => ({
          value: type,
          count: breweryCount.byAlcoholType[type] || 0
        }))}
        resetAction={() => clearCategory('alcoholTypes')}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* 배지 필터 */}
      <FilterSection
        title="배지"
        category="badges"
        options={badgeOptions}
        resetAction={() => clearCategory('badges')}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default BreweryFilter;