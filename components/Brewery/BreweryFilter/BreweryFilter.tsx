'use client';

import { useState, useMemo } from 'react';
import SearchBar from '../../shop/SearchBar/SearchBar';
import type { BreweryFilterOptions } from '../../../types/brewery';
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

  const filterData = {
    regions: ['서울/경기', '강원도', '충청도', '전라도', '경상도', '제주도'],
    alcoholTypes: ['막걸리', '청주', '과실주', '증류주', '리큐르', '기타']
  } as const;

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

  const handlePriceApply = () => {
    onFilterChange({ 
      priceRange: {
        min: priceMin,
        max: priceMax
      }
    });
  };

  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

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

  const activeFilterTags = useMemo(() => {
    const tags: { category: keyof BreweryFilterOptions; label: string }[] = [];
    filters.regions.forEach(region => {
      tags.push({ category: 'regions', label: region });
    });
    filters.alcoholTypes.forEach(type => {
      tags.push({ category: 'alcoholTypes', label: type });
    });
    filters.badges.forEach(badge => {
      tags.push({ category: 'badges', label: badge });
    });
    if (filters.searchKeyword) {
      tags.push({ category: 'searchKeyword', label: `"${filters.searchKeyword}"` });
    }
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      const minText = filters.priceRange.min !== '' ? filters.priceRange.min.toLocaleString() : '0';
      const maxText = filters.priceRange.max !== '' ? filters.priceRange.max.toLocaleString() : '∞';
      tags.push({ category: 'priceRange', label: `${minText}원 ~ ${maxText}원` });
    }
    return tags;
  }, [filters]);

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
      <div className="brewery-filter-section">
        <SearchBar
          placeholder="양조장 이름, 지역, 주종으로 검색"
          keyword={filters.searchKeyword}
          onSearch={handleSearchChange}
        />
      </div>

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