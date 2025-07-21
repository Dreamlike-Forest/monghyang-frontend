'use client';

import { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  keyword: string;
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  keyword,
  onSearch,
  placeholder = "상품명, 양조장명 검색"
}) => {
  const [inputValue, setInputValue] = useState(keyword);

  // 부모 컴포넌트에서 keyword가 변경되면 input 값도 동기화
  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 실시간 검색 (디바운싱 없이)
    // 필요하다면 디바운싱 로직 추가 가능
    if (value.trim() === '') {
      onSearch('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSearchClick = () => {
    onSearch(inputValue.trim());
  };

  const handleClearSearch = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        
        {/* 검색어가 있을 때 지우기 버튼 표시 */}
        {inputValue && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClearSearch}
            title="검색어 지우기"
            style={{
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}
        
        <button
          type="button"
          className="search-button"
          onClick={handleSearchClick}
          title="검색"
        >
          <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;