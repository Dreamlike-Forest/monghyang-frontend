'use client';

import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ProductFilterOptions, ProductActiveFilters } from '../../../types/mockData';
import { 
  validatePriceInput, 
  generateFilterTags, 
  toggleCheckbox, 
  toggleSingleCheckbox,
  clearAllFilters as resetAllFilters,
  removeFilter as removeFilterUtil
} from '../../../utils/filterUtils';
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
  // 가격 범위 입력 상태 관리
  const [priceMin, setPriceMin] = useState<number | ''>(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
  const [priceMax, setPriceMax] = useState<number | ''>(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);

  // 외부에서 activeFilters가 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setPriceMin(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
    setPriceMax(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);
  }, [activeFilters.priceMin, activeFilters.priceMax]);

  // 체크박스 필터 변경 핸들러
  const handleCheckboxChange = (category: keyof ProductActiveFilters, value: string) => {
    const currentArray = activeFilters[category] as string[];
    const newArray = toggleCheckbox(currentArray, value);
    onFilterChange({ [category]: newArray });
  };

  // 도수 필터 변경 핸들러 (단일 선택)
  const handleAlcoholCheckboxChange = (value: string) => {
    const newValue = toggleSingleCheckbox(activeFilters.alcoholRange || '', value);
    onFilterChange({ alcoholRange: newValue });
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

  // 가격 입력 핸들러
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const finalValue = validatePriceInput(value, 8);
    
    if (type === 'min') {
      setPriceMin(finalValue);
    } else {
      setPriceMax(finalValue);
    }
  };

  // 가격 필터 적용 핸들러
  const handlePriceApply = () => {
    const finalMin = priceMin === '' ? 0 : priceMin;
    const finalMax = priceMax === '' ? 999999 : priceMax;
    
    onFilterChange({ 
      priceMin: finalMin,
      priceMax: finalMax
    });
  };

  // 개별 필터 제거 핸들러
  const removeFilter = (category: keyof ProductActiveFilters, value: string) => {
    const updatedFilters = removeFilterUtil(activeFilters, category, value);
    
    if (category === 'priceMin' || value === 'price') {
      setPriceMin('');
      setPriceMax('');
    }
    
    Object.entries(updatedFilters).forEach(([key, val]) => {
      if (activeFilters[key as keyof ProductActiveFilters] !== val) {
        onFilterChange({ [key]: val });
      }
    });
  };

  // 전체 필터 초기화 핸들러
  const clearAllFilters = () => {
    const resetFilters = resetAllFilters();
    onFilterChange(resetFilters);
    setPriceMin('');
    setPriceMax('');
  };

  // 활성화된 필터 태그 생성
  const activeFilterTags = generateFilterTags(activeFilters, filterOptions);

  return (
    <div className="product-filter">
      {/* 검색바 */}
      <SearchBar
        keyword={activeFilters.searchKeyword}
        onSearch={handleSearchChange}
        placeholder="상품명, 양조장명 검색"
      />

      {/* 활성화된 필터 표시 */}
      <div className={`active-filters ${activeFilterTags.length === 0 ? 'empty' : ''}`}>
        {activeFilterTags.length > 0 && (
          <>
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
          </>
        )}
      </div>

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

      {/* 도수 필터 */}
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

      {/* 가격 필터 */}
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