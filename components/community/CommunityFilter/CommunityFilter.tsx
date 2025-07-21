'use client';

import { useState } from 'react';
import { CategoryConfig, PostFilter, PostCategory } from '../../../types/community';
import './CommunityFilter.css';

interface CommunityFilterProps {
  categories: CategoryConfig[];
  currentCategory: PostCategory | 'all';
  filter: PostFilter;
  onFilterChange: (filter: Partial<PostFilter>) => void;
  onCategoryChange: (category: PostCategory | 'all') => void;
}

const CommunityFilter: React.FC<CommunityFilterProps> = ({
  categories,
  currentCategory,
  filter,
  onFilterChange,
  onCategoryChange
}) => {
  const [searchKeyword, setSearchKeyword] = useState(filter.searchKeyword);

  const popularTags = [
    '막걸리', '소주', '와인', '맥주', '전통주',
    '양조장체험', '신상품', '추천', '맛집', '이벤트'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchKeyword: searchKeyword.trim() });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    const currentSubcategory = filter.subcategory;
    let newSubcategory = '';
    
    if (checked) {
      newSubcategory = subcategoryId;
    }
    
    onFilterChange({ subcategory: newSubcategory });
  };

  const handleTagClick = (tag: string) => {
    setSearchKeyword(tag);
    onFilterChange({ searchKeyword: tag });
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    onFilterChange({
      searchKeyword: '',
      subcategory: '',
      sortBy: 'latest'
    });
    onCategoryChange('all');
  };

  const getCurrentCategoryConfig = () => {
    return categories.find(cat => cat.id === currentCategory);
  };

  const currentCategoryConfig = getCurrentCategoryConfig();

  // 활성화된 필터 태그들 생성
  const getActiveFilterTags = () => {
    const tags: { label: string; value: string; type: string }[] = [];
    
    if (filter.searchKeyword) {
      tags.push({ 
        label: `"${filter.searchKeyword}"`, 
        value: filter.searchKeyword, 
        type: 'search' 
      });
    }
    
    if (filter.subcategory && currentCategoryConfig) {
      const subcategory = currentCategoryConfig.subcategories.find(
        sub => sub.id === filter.subcategory
      );
      if (subcategory) {
        tags.push({ 
          label: subcategory.name, 
          value: filter.subcategory, 
          type: 'subcategory' 
        });
      }
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  const removeFilter = (type: string, value: string) => {
    if (type === 'search') {
      setSearchKeyword('');
      onFilterChange({ searchKeyword: '' });
    } else if (type === 'subcategory') {
      onFilterChange({ subcategory: '' });
    }
  };

  return (
    <div className="community-filter">
      {/* 검색바 */}
      <div className="filter-search">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="게시글 제목, 내용, 작성자 검색"
            value={searchKeyword}
            onChange={handleSearchChange}
          />
        </form>
      </div>

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
                  onClick={() => removeFilter(tag.type, tag.value)}
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

      {/* 카테고리 필터 */}
      <div className="filter-section">
        <div className="filter-title">
          게시판
          <button 
            className="filter-reset"
            onClick={() => onCategoryChange('all')}
          >
            전체
          </button>
        </div>
        <div className="category-filter">
          <div 
            className={`category-option ${currentCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            <span className="category-name">전체</span>
            <span className="category-count">
              {categories.reduce((sum, cat) => sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.count, 0), 0)}
            </span>
          </div>
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-option ${currentCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="category-name">{category.name}</span>
              <span className="category-count">
                {category.subcategories.reduce((sum, sub) => sum + sub.count, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 서브카테고리 필터 */}
      {currentCategoryConfig && currentCategoryConfig.subcategories.length > 0 && (
        <div className="filter-section">
          <div className="filter-title">
            세부 분류
            <button 
              className="filter-reset"
              onClick={() => onFilterChange({ subcategory: '' })}
            >
              초기화
            </button>
          </div>
          <div className="subcategory-filter">
            <div className="subcategory-options">
              {currentCategoryConfig.subcategories.map(subcategory => (
                <label key={subcategory.id} className="subcategory-option">
                  <input
                    type="radio"
                    name="subcategory"
                    className="subcategory-checkbox"
                    checked={filter.subcategory === subcategory.id}
                    onChange={(e) => handleSubcategoryChange(subcategory.id, e.target.checked)}
                  />
                  <span className="subcategory-label">{subcategory.name}</span>
                  <span className="subcategory-count">({subcategory.count})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 게시판 안내 */}
      <div className="board-guide">
        <div className="guide-title">게시판 이용 안내</div>
        <ul className="guide-list">
          <li className="guide-item">건전하고 상호 존중하는 소통을 지향합니다</li>
          <li className="guide-item">광고성 글이나 유해한 글은 삭제됩니다</li>
          <li className="guide-item">개인정보 노출에 주의해 주세요</li>
          <li className="guide-item">부적절한 내용은 신고해 주세요</li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityFilter;