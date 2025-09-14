'use client';

import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import './BreweryFinderSection.css';

interface BrewerySearchParams {
  region: string;
  type: string;
  hasExperience: boolean;
}

interface BreweryFinderSectionProps {
  windowWidth: number;
}

const BreweryFinderSection: React.FC<BreweryFinderSectionProps> = ({ windowWidth }) => {
  const [brewerySearch, setBrewerySearch] = useState<BrewerySearchParams>({
    region: '',
    type: '',
    hasExperience: false
  });

  const regions = [
    { value: '', label: '전체' },
    { value: 'seoul', label: '서울' },
    { value: 'gyeonggi', label: '경기도' },
    { value: 'gangwon', label: '강원도' },
    { value: 'chungcheong', label: '충청도' },
    { value: 'jeolla', label: '전라도' },
    { value: 'gyeongsang', label: '경상도' },
    { value: 'jeju', label: '제주도' }
  ];

  const types = [
    { value: '', label: '전체' },
    { value: 'makgeolli', label: '막걸리' },
    { value: 'soju', label: '소주' },
    { value: 'yakju', label: '약주' },
    { value: 'cheongju', label: '청주' },
    { value: 'wine', label: '과실주' }
  ];

  const handleBrewerySearch = () => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('search');
    url.searchParams.delete('searchType');
    
    url.searchParams.set('view', 'brewery');
    
    window.location.href = url.toString();
  };

  return (
    <section className="brewery-finder-section">
      <div className="brewery-finder-container">
        <div className="brewery-finder-header">
          <h2 className="brewery-finder-title">
            원하는 양조장 찾기
          </h2>
          <p className="brewery-finder-subtitle">
            지역과 전통주 종류를 선택해서 나에게 맞는 양조장을 찾아보세요
          </p>
        </div>

        <div className="brewery-finder-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                지역 선택
              </label>
              <select
                className="form-select"
                value={brewerySearch.region}
                onChange={(e) => setBrewerySearch(prev => ({ ...prev, region: e.target.value }))}
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                전통주 종류
              </label>
              <select
                className="form-select"
                value={brewerySearch.type}
                onChange={(e) => setBrewerySearch(prev => ({ ...prev, type: e.target.value }))}
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox"
                checked={brewerySearch.hasExperience}
                onChange={(e) => setBrewerySearch(prev => ({ ...prev, hasExperience: e.target.checked }))}
              />
              <Users size={16} className="checkbox-icon" />
              체험 프로그램 여부
            </label>
          </div>

          <button 
            className="find-button"
            onClick={handleBrewerySearch}
            type="button"
          >
            <Search size={18} className="find-button-icon" />
            검색하기
          </button>
        </div>
      </div>
    </section>
  );
};

export default BreweryFinderSection;