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
    
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    if (page !== 'home') {
      newUrl.searchParams.set('view', page);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        newUrl.searchParams.set(key, value);
      });
    }
    
    window.location.href = newUrl.toString();
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
          <form onSubmit={handleSearch} className="hero-search-container">
            <div className="hero-search-type-selector" ref={dropdownRef}>
              <button
                type="button"
                className="hero-search-type-button"
                onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
              >
                <CurrentIcon className="hero-search-type-icon" />
                {currentSearchType.label}
                <ChevronDown 
                  className={`hero-search-type-chevron ${isSearchTypeOpen ? 'open' : ''}`} 
                />
              </button>
              
              {isSearchTypeOpen && (
                <div className="hero-search-type-dropdown">
                  {searchTypes.map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        className={`hero-search-type-option ${searchType === type.value ? 'active' : ''}`}
                        onClick={() => {
                          setSearchType(type.value);
                          setIsSearchTypeOpen(false);
                        }}
                      >
                        <TypeIcon className="hero-search-type-option-icon" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <input
              type="text"
              className="hero-search-input"
              placeholder={searchType === 'brewery' 
                ? "양조장명, 지역명을 검색해보세요" 
                : "상품명, 양조장명을 검색해보세요"
              }
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="hero-search-button">
              <Search className="hero-search-icon" />
              검색
            </button>
          </form>

          <p className="hero-search-guide">
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