'use client';

import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ProductFilterOptions, ProductActiveFilters } from '../../../types/shop';
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
  const [priceMin, setPriceMin] = useState<number | ''>(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
  const [priceMax, setPriceMax] = useState<number | ''>(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);

  useEffect(() => {
    setPriceMin(activeFilters.priceMin === 0 ? '' : activeFilters.priceMin);
    setPriceMax(activeFilters.priceMax === 999999 ? '' : activeFilters.priceMax);
  }, [activeFilters.priceMin, activeFilters.priceMax]);

  const handleCheckboxChange = (category: keyof ProductActiveFilters, value: string) => {
    const currentArray = activeFilters[category] as string[];
    const newArray = toggleCheckbox(currentArray, value);
    onFilterChange({ [category]: newArray });
  };

  const handleAlcoholCheckboxChange = (value: string) => {
    const newValue = toggleSingleCheckbox(activeFilters.alcoholRange || '', value);
    onFilterChange({ alcoholRange: newValue });
  };

  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const finalValue = validatePriceInput(value, 8);
    if (type === 'min') setPriceMin(finalValue);
    else setPriceMax(finalValue);
  };

  const handlePriceApply = () => {
    onFilterChange({ 
      priceMin: priceMin === '' ? 0 : priceMin,
      priceMax: priceMax === '' ? 999999 : priceMax
    });
  };

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

  const clearAllFilters = () => {
    const resetFilters = resetAllFilters();
    onFilterChange(resetFilters);
    setPriceMin('');
    setPriceMax('');
  };

  const activeFilterTags = generateFilterTags(activeFilters, filterOptions);

  return (
    <div className="product-filter">
      <SearchBar
        keyword={activeFilters.searchKeyword}
        onSearch={handleSearchChange}
        placeholder="상품명, 양조장명 검색"
      />
      
      {/* 선택된 필터 표시 */}
      <div className={`active-filters ${activeFilterTags.length === 0 ? 'empty' : ''}`}>
        {activeFilterTags.length > 0 && (
          <>
            <div className="active-filters-title">선택된 필터</div>
            <div className="active-filter-tags">
              {activeFilterTags.map((tag, index) => (
                <span key={index} className="active-filter-tag">
                  {tag.label}
                  <button className="remove-filter" onClick={() => {
                    if (tag.value === 'price') {
                      setPriceMin(''); 
                      setPriceMax('');
                      onFilterChange({ priceMin: 0, priceMax: 999999 });
                    } else {
                      removeFilter(tag.category, tag.value);
                    }
                  }}>×</button>
                </span>
              ))}
            </div>
            <button className="clear-all-filters" onClick={clearAllFilters}>전체 해제</button>
          </>
        )}
      </div>

      {/* 주종 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          주종 
          <button className="filter-reset" onClick={() => onFilterChange({ types: [] })}>
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
              {option.count > 0 && <span className="filter-option-count">({option.count})</span>}
            </label>
          ))}
        </div>
      </div>

      {/* 도수 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          도수
          <button className="filter-reset" onClick={() => onFilterChange({ alcoholRange: '' })}>
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
              {option.count > 0 && <span className="filter-option-count">({option.count})</span>}
            </label>
          ))}
        </div>
      </div>

      {/* 가격 필터 */}
      <div className="filter-section">
        <div className="filter-title">가격</div>
        <div className="price-input-container">
          <input
            type="text"
            className="price-input"
            placeholder="최소"
            value={priceMin}
            onChange={(e) => handlePriceInputChange('min', e.target.value)}
          />
          <span className="price-separator">~</span>
          <input
            type="text"
            className="price-input"
            placeholder="최대"
            value={priceMax}
            onChange={(e) => handlePriceInputChange('max', e.target.value)}
          />
          <button className="price-apply-btn" onClick={handlePriceApply}>
            적용
          </button>
        </div>
      </div>

      {/* 인증 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          인증
          <button className="filter-reset" onClick={() => onFilterChange({ certifications: [] })}>
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
              {option.count > 0 && <span className="filter-option-count">({option.count})</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;