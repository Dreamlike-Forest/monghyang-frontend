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

  // 수정된 검색 핸들러 - 실제 필터 값으로 매핑
  const handleBrewerySearch = () => {
    if (typeof window === 'undefined') return;
    
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    newUrl.searchParams.set('view', 'brewery');
    
    // 지역 매핑 - 실제 데이터의 region_name과 매칭
    if (brewerySearch.region) {
      const regionMap: Record<string, string> = {
        'seoul': '서울/경기',
        'gyeonggi': '서울/경기', 
        'gangwon': '강원도',
        'chungcheong': '충청도',
        'jeolla': '전라도',
        'gyeongsang': '경상도',
        'jeju': '제주도'
      };
      const mappedRegion = regionMap[brewerySearch.region] || brewerySearch.region;
      newUrl.searchParams.set('filterRegion', mappedRegion);
    }
    
    // 주종 매핑 - 실제 데이터의 alcohol_types와 매칭
    if (brewerySearch.type) {
      const typeMap: Record<string, string> = {
        'makgeolli': '막걸리',
        'soju': '증류주',
        'yakju': '청주', 
        'cheongju': '청주',
        'wine': '과실주'
      };
      const mappedType = typeMap[brewerySearch.type] || brewerySearch.type;
      newUrl.searchParams.set('filterAlcoholType', mappedType);
    }
    
    // 체험 프로그램 필터
    if (brewerySearch.hasExperience) {
      newUrl.searchParams.set('filterExperience', 'true');
    }
    
    console.log('BreweryFinderSection 검색 파라미터:', {
      region: brewerySearch.region,
      type: brewerySearch.type, 
      hasExperience: brewerySearch.hasExperience
    });
    console.log('BreweryFinderSection 최종 URL:', newUrl.toString());
    
    window.location.href = newUrl.toString();
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
          <div className="brewery-finder-form-grid">
            <div className="brewery-finder-form-group">
              <label className="brewery-finder-form-label">
                지역 선택
              </label>
              <select
                className="brewery-finder-form-select"
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

            <div className="brewery-finder-form-group">
              <label className="brewery-finder-form-label">
                전통주 종류
              </label>
              <select
                className="brewery-finder-form-select"
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

          <div className="brewery-finder-checkbox-group">
            <label className="brewery-finder-checkbox-label">
              <input
                type="checkbox"
                className="brewery-finder-checkbox"
                checked={brewerySearch.hasExperience}
                onChange={(e) => setBrewerySearch(prev => ({ ...prev, hasExperience: e.target.checked }))}
              />
              <Users size={16} className="brewery-finder-checkbox-icon" />
              체험 프로그램 여부
            </label>
          </div>

          <button 
            className="brewery-finder-find-button"
            onClick={handleBrewerySearch}
            type="button"
          >
            <Search size={18} className="brewery-finder-find-button-icon" />
            검색하기
          </button>
        </div>
      </div>
    </section>
  );
};

export default BreweryFinderSection;