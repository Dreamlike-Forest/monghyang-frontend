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
  const [priceMin, setPriceMin] = useState(activeFilters.priceMin);
  const [priceMax, setPriceMax] = useState(activeFilters.priceMax);
  const [selectedQuickPrice, setSelectedQuickPrice] = useState('all');

  const quickPriceRanges = [
    { id: 'all', label: '전체', min: 0, max: 999999 },
    { id: 'under15', label: '1.5만원 이하', min: 0, max: 15000 },
    { id: '15to30', label: '1.5~3만원', min: 15000, max: 30000 },
    { id: '30to50', label: '3~5만원', min: 30000, max: 50000 },
    { id: 'over50', label: '5만원 이상', min: 50000, max: 999999 }
  ];

  useEffect(() => {
    setPriceMin(activeFilters.priceMin);
    setPriceMax(activeFilters.priceMax);
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

  const handleRadioChange = (category: keyof ProductActiveFilters, value: string) => {
    // 이미 선택된 값이면 해제, 아니면 선택
    const currentValue = activeFilters[category] as string;
    const newValue = currentValue === value ? '' : value;
    onFilterChange({ [category]: newValue });
  };

  const handleSearchChange = (keyword: string) => {
    onFilterChange({ searchKeyword: keyword });
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    // 숫자만 허용
    const numericValue = value.replace(/[^\d]/g, '');
    
    // 최대 8자리까지만 허용 (99,999,999원)
    if (numericValue.length > 8) return;
    
    if (type === 'min') {
      setPriceMin(numericValue === '' ? 0 : parseInt(numericValue));
    } else {
      setPriceMax(numericValue === '' ? 999999 : parseInt(numericValue));
    }
  };

  const handlePriceApply = () => {
    // 최소값이 최대값보다 큰 경우 자동으로 교정
    const finalMin = Math.min(priceMin, priceMax === 999999 ? priceMin : priceMax);
    const finalMax = Math.max(priceMin, priceMax === 999999 ? 999999 : priceMax);
    
    onFilterChange({ 
      priceMin: finalMin,
      priceMax: finalMax
    });
  };

  const handleQuickPriceSelect = (rangeId: string) => {
    const range = quickPriceRanges.find(r => r.id === rangeId);
    if (range) {
      setPriceMin(range.min);
      setPriceMax(range.max);
      setSelectedQuickPrice(rangeId);
      onFilterChange({ 
        priceMin: range.min,
        priceMax: range.max
      });
    }
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
    setPriceMin(0);
    setPriceMax(999999);
    setSelectedQuickPrice('all');
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
                  onClick={() => removeFilter(tag.category, tag.value)}
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
                type="radio"
                name="alcoholRange"
                className="filter-checkbox"
                checked={activeFilters.alcoholRange === option.id}
                onChange={() => handleRadioChange('alcoholRange', option.id)}
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

      {/* 가격 범위 */}
      <div className="filter-section">
        <div className="filter-title">
          가격
          <button 
            className="filter-reset"
            onClick={() => {
              setPriceMin(0);
              setPriceMax(999999);
              setSelectedQuickPrice('all');
              onFilterChange({ priceMin: 0, priceMax: 999999 });
            }}
          >
            초기화
          </button>
        </div>
        
        <div className="price-range-inputs">
          <input
            type="number"
            className="price-input"
            placeholder="최소"
            value={priceMin === 0 ? '' : priceMin}
            onChange={(e) => handlePriceInputChange('min', e.target.value)}
          />
          <span className="price-separator">~</span>
          <input
            type="number"
            className="price-input"
            placeholder="최대"
            value={priceMax === 999999 ? '' : priceMax}
            onChange={(e) => handlePriceInputChange('max', e.target.value)}
          />
        </div>
        
        <div className="price-quick-buttons">
          {quickPriceRanges.map(range => (
            <button
              key={range.id}
              className={`price-quick-button ${selectedQuickPrice === range.id ? 'active' : ''}`}
              onClick={() => handleQuickPriceSelect(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button className="apply-button" onClick={handlePriceApply}>
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