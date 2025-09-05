'use client';

import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ProductFilterOptions, ProductActiveFilters } from '../../../types/mockData';
import './ProductFilter.css';

interface ProductFilterProps {
  filterOptions: ProductFilterOptions;
  activeFilters: ProductActiveFilters;
  onFilterChange: (filters: Partial<ProductActiveFilters>) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  filterOptions,
  activeFilters,
  onFilterChange
}) => {
  const [priceMin, setPriceMin] = useState<number | ''>(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
  const [priceMax, setPriceMax] = useState<number | ''>(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);

  useEffect(() => {
    setPriceMin(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
    setPriceMax(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);
  }, [activeFilters.priceMin, activeFilters.priceMax]);

  const handleCheckboxChange = (category: keyof ProductActiveFilters, value: string) => {
    const currentArray = activeFilters[category] as string[];
    let newArray: string[];
    
    if (currentArray.includes(value)) {
      newArray = currentArray.filter(item => item !== value);
    } else {
      newArray = [...currentArray, value];
    }
    
    onFilterChange({ [category]: newArray });
  };

  // 도수 필터를 체크박스로 변경 (라디오 버튼 제거)
  const handleAlcoholCheckboxChange = (value: string) => {
    // alcoholRange를 배열로 처리하도록 변경
    const currentArray = (activeFilters.alcoholRange ? [activeFilters.alcoholRange] : []) as string[];
    let newArray: string[];
    
    if (currentArray.includes(value)) {
      newArray = [];
    } else {
      newArray = [value];
    }
    
    onFilterChange({ alcoholRange: newArray.length > 0 ? newArray[0] : '' });
  };

  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    // 숫자만 허용
    const numericValue = value.replace(/[^\d]/g, '');
    
    // 최대 8자리까지만 허용 (99,999,999원)
    if (numericValue.length > 8) return;
    
    const finalValue: number | '' = numericValue === '' ? '' : parseInt(numericValue, 10);
    
    if (type === 'min') {
      setPriceMin(finalValue);
    } else {
      setPriceMax(finalValue);
    }
  };

  const handlePriceApply = () => {
    const finalMin = priceMin === '' ? 0 : priceMin;
    const finalMax = priceMax === '' ? 999999 : priceMax;
    
    onFilterChange({ 
      priceMin: finalMin,
      priceMax: finalMax
    });
  };

  const removeFilter = (category: keyof ProductActiveFilters, value: string) => {
    if (Array.isArray(activeFilters[category])) {
      const currentArray = activeFilters[category] as string[];
      const newArray = currentArray.filter(item => item !== value);
      onFilterChange({ [category]: newArray });
    } else {
      onFilterChange({ [category]: '' as any });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      types: [],
      regions: [],
      certifications: [],
      alcoholRange: '',
      searchKeyword: '',
      priceMin: 0,
      priceMax: 999999
    });
    setPriceMin('');
    setPriceMax('');
  };

  // 활성화된 필터 태그들 생성
  const getActiveFilterTags = () => {
    const tags: { category: keyof ProductActiveFilters; label: string; value: string }[] = [];
    
    activeFilters.types.forEach(type => {
      const option = filterOptions.types.find(opt => opt.id === type);
      if (option) tags.push({ category: 'types', label: option.name, value: type });
    });
    
    if (activeFilters.alcoholRange) {
      const option = filterOptions.alcoholRanges.find(opt => opt.id === activeFilters.alcoholRange);
      if (option) tags.push({ category: 'alcoholRange', label: option.name, value: activeFilters.alcoholRange });
    }
    
    activeFilters.regions.forEach(region => {
      const option = filterOptions.regions.find(opt => opt.id === region);
      if (option) tags.push({ category: 'regions', label: option.name, value: region });
    });
    
    activeFilters.certifications.forEach(cert => {
      const option = filterOptions.certifications.find(opt => opt.id === cert);
      if (option) tags.push({ category: 'certifications', label: option.name, value: cert });
    });

    if (activeFilters.searchKeyword) {
      tags.push({ category: 'searchKeyword', label: `"${activeFilters.searchKeyword}"`, value: activeFilters.searchKeyword });
    }

    // 가격 범위 태그 추가
    const finalMin = priceMin === '' ? 0 : priceMin;
    const finalMax = priceMax === '' ? 999999 : priceMax;
    
    if (finalMin !== 0 || finalMax !== 999999) {
      const minText = finalMin !== 0 ? finalMin.toLocaleString() : '0';
      const maxText = finalMax !== 999999 ? finalMax.toLocaleString() : '∞';
      tags.push({ category: 'priceMin', label: `${minText}원 ~ ${maxText}원`, value: 'price' });
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  return (
    <div className="product-filter">
      {/* 검색바 */}
      <SearchBar
        keyword={activeFilters.searchKeyword}
        onSearch={handleSearchChange}
        placeholder="상품명, 양조장명 검색"
      />

      {/* 활성화된 필터 표시 */}
      {activeFilterTags.length > 0 && (
        <div className="active-filters">
          <div className="active-filters-title">선택된 필터</div>
          <div className="active-filter-tags">
            {activeFilterTags.map((tag, index) => (
              <span key={index} className="active-filter-tag">
                {tag.label}
                <button
                  className="remove-filter"
                  onClick={() => {
                    if (tag.value === 'price') {
                      setPriceMin('');
                      setPriceMax('');
                      onFilterChange({ priceMin: 0, priceMax: 999999 });
                    } else {
                      removeFilter(tag.category, tag.value);
                    }
                  }}
                  title="필터 제거"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button className="clear-all-filters" onClick={clearAllFilters}>
            전체 해제
          </button>
        </div>
      )}

      {/* 주종 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          주종
          <button 
            className="filter-reset"
            onClick={() => onFilterChange({ types: [] })}
          >
            초기화
          </button>
        </div>
        <div className="filter-options">
          {filterOptions.types.map(option => (
            <label key={option.id} className="filter-option">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.types.includes(option.id)}
                onChange={() => handleCheckboxChange('types', option.id)}
              />
              <span className="filter-option-label">{option.name}</span>
              <span className="filter-option-count">({option.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* 도수 필터 - 체크박스로 변경 */}
      <div className="filter-section">
        <div className="filter-title">
          도수
          <button 
            className="filter-reset"
            onClick={() => onFilterChange({ alcoholRange: '' })}
          >
            초기화
          </button>
        </div>
        <div className="filter-options">
          {filterOptions.alcoholRanges.map(option => (
            <label key={option.id} className="filter-option">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.alcoholRange === option.id}
                onChange={() => handleAlcoholCheckboxChange(option.id)}
              />
              <span className="filter-option-label">{option.name}</span>
              <span className="filter-option-count">({option.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* 지역 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          지역
          <button 
            className="filter-reset"
            onClick={() => onFilterChange({ regions: [] })}
          >
            초기화
          </button>
        </div>
        <div className="filter-options">
          {filterOptions.regions.map(option => (
            <label key={option.id} className="filter-option">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.regions.includes(option.id)}
                onChange={() => handleCheckboxChange('regions', option.id)}
              />
              <span className="filter-option-label">{option.name}</span>
              <span className="filter-option-count">({option.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* 가격 범위 - BreweryFilter 스타일에 맞춤 */}
      <div className="filter-section">
        <div className="filter-title">
          가격
          <button 
            className="filter-reset"
            onClick={() => {
              setPriceMin('');
              setPriceMax('');
              onFilterChange({ priceMin: 0, priceMax: 999999 });
            }}
          >
            초기화
          </button>
        </div>
        
        <div className="price-range-inputs">
          <div className="price-input-wrapper">
            <input
              type="number"
              placeholder="최소 가격"
              value={priceMin || ''}
              onChange={(e) => handlePriceInputChange('min', e.target.value)}
              className="price-input"
              min="0"
              max="99999999"
            />
          </div>
          
          <span className="price-separator">~</span>
          
          <div className="price-input-wrapper">
            <input
              type="number"
              placeholder="최대 가격"
              value={priceMax || ''}
              onChange={(e) => handlePriceInputChange('max', e.target.value)}
              className="price-input"
              min="0"
              max="99999999"
            />
          </div>
        </div>
        
        <div className="price-apply-container">
          <button 
            className="apply-button" 
            onClick={handlePriceApply}
            disabled={priceMin === '' && priceMax === ''}
          >
            적용
          </button>
        </div>
      </div>

      {/* 인증 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          인증
          <button 
            className="filter-reset"
            onClick={() => onFilterChange({ certifications: [] })}
          >
            초기화
          </button>
        </div>
        <div className="filter-options">
          {filterOptions.certifications.map(option => (
            <label key={option.id} className="filter-option">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.certifications.includes(option.id)}
                onChange={() => handleCheckboxChange('certifications', option.id)}
              />
              <span className="filter-option-label">{option.name}</span>
              <span className="filter-option-count">({option.count})</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;