'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Factory, Wine, ChevronDown } from 'lucide-react';
import './HeroSection.css';

type SearchType = 'brewery' | 'product';

interface SearchTypeOption {
  value: SearchType;
  label: string;
  icon: typeof Factory | typeof Wine;
}

interface HeroSectionProps {
  windowWidth: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ windowWidth }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('brewery');
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchTypes: SearchTypeOption[] = [
    { value: 'brewery', label: '양조장', icon: Factory },
    { value: 'product', label: '상품', icon: Wine }
  ];

  const navigateToPage = (page: string, params?: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('search');
    url.searchParams.delete('searchType');
    
    if (page !== 'home') {
      url.searchParams.set('view', page);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    window.location.href = url.toString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchKeyword.trim()) {
      if (searchType === 'brewery') {
        navigateToPage('brewery');
      } else {
        navigateToPage('shop');
      }
      return;
    }

    const params = {
      search: searchKeyword,
      searchType: searchType
    };
    
    if (searchType === 'brewery') {
      navigateToPage('brewery', params);
    } else {
      navigateToPage('shop', params);
    }
  };

  const getCurrentSearchType = (): SearchTypeOption => {
    return searchTypes.find(type => type.value === searchType) || searchTypes[0];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchTypeOpen(false);
      }
    };

    if (isSearchTypeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchTypeOpen]);

  const currentSearchType = getCurrentSearchType();
  const CurrentIcon = currentSearchType.icon;

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          전통주와 함께하는<br />특별한 여행
        </h1>
        <p className="hero-subtitle">
          전국의 양조장을 둘러보고, 다양한 전통주를 맛보며,<br />
          새로운 문화 체험을 즐겨보세요.
        </p>

        <div className="hero-search">
          <form onSubmit={handleSearch} className="search-container">
            <div className="search-type-selector" ref={dropdownRef}>
              <button
                type="button"
                className="search-type-button"
                onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
              >
                <CurrentIcon className="search-type-icon" />
                {currentSearchType.label}
                <ChevronDown 
                  className={`search-type-chevron ${isSearchTypeOpen ? 'open' : ''}`} 
                />
              </button>
              
              {isSearchTypeOpen && (
                <div className="search-type-dropdown">
                  {searchTypes.map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        className={`search-type-option ${searchType === type.value ? 'active' : ''}`}
                        onClick={() => {
                          setSearchType(type.value);
                          setIsSearchTypeOpen(false);
                        }}
                      >
                        <TypeIcon className="search-type-option-icon" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <input
              type="text"
              className="search-input"
              placeholder={searchType === 'brewery' 
                ? "양조장명, 지역명을 검색해보세요" 
                : "상품명, 양조장명을 검색해보세요"
              }
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="search-button">
              <Search className="search-icon" />
              검색
            </button>
          </form>

          <p className="search-guide">
            {searchType === 'brewery' 
              ? '전국 양조장을 찾아 특별한 체험을 즐겨보세요' 
              : '다양한 전통주를 둘러보고 맛있는 술을 발견하세요'
            }
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;