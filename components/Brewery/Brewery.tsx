'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BreweryFilter from './BreweryFilter/BreweryFilter';
import BreweryCard from './BreweryCard/BreweryCard';
import Pagination from '../shop/Pagination/Pagination';
import { Brewery, BreweryFilterOptions } from '../../types/mockData';
import { 
  searchBreweries, 
  getLatestBreweries, 
  convertToBreweryType,
  BrewerySearchParams 
} from '../../utils/brewery';
import './Brewery.css';

interface BreweryProps {
  onBreweryClick?: (breweryId: number) => void;
  className?: string;
}

// [중요 수정] DB ID 매핑 수정
const REGION_MAP: Record<string, number> = {
  '서울/경기': 2,
  '강원도': 3,
  '충청도': 5,
  '전라도': 4,
  '경상도': 7,   
  '제주도': 6  
};

// 주종 ID 매핑 (만약 주종 필터도 이상하다면 이 숫자들도 DB 확인이 필요합니다)
const TAG_MAP: Record<string, number> = {
  '막걸리': 1,
  '청주': 2,
  '과실주': 3,
  '증류주': 4,
  '리큐르': 5,
  '기타': 6
};

const BreweryComponent: React.FC<BreweryProps> = ({ onBreweryClick, className }) => {
  const searchParams = useSearchParams();
  const [breweryData, setBreweryData] = useState<Brewery[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<BreweryFilterOptions>({
    regions: [],
    priceRange: { min: '', max: '' },
    alcoholTypes: [],
    badges: [],
    searchKeyword: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // 페이지당 아이템 개수 설정
  const itemsPerPage = 6; 

  useEffect(() => {
    const search = searchParams.get('search');
    const searchType = searchParams.get('searchType');
    const view = searchParams.get('view');
    const filterRegion = searchParams.get('filterRegion');
    const filterAlcoholType = searchParams.get('filterAlcoholType');
    
    const newFilters: BreweryFilterOptions = {
      regions: [],
      priceRange: { min: '', max: '' },
      alcoholTypes: [],
      badges: [],
      searchKeyword: ''
    };

    if (search && searchType && view === 'brewery' && searchType === 'brewery') {
      newFilters.searchKeyword = search;
    }
    if (filterRegion) newFilters.regions = [filterRegion];
    if (filterAlcoholType) newFilters.alcoholTypes = [filterAlcoholType];

    setFilters(newFilters);
  }, [searchParams]);

  // API 호출 함수
  const fetchBreweries = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      console.log('🔍 양조장 데이터 로드 시작 - Page:', currentPage);

      const startOffset = currentPage - 1;

      const hasFilters = filters.searchKeyword || 
                        filters.regions.length > 0 || 
                        filters.alcoholTypes.length > 0 ||
                        filters.priceRange.min !== '' ||
                        filters.priceRange.max !== '';

      let response;

      if (hasFilters) {
        // 선택된 필터(문자열)를 ID(숫자) 리스트로 변환
        const regionIds = filters.regions
          .map(region => REGION_MAP[region])
          .filter((id): id is number => id !== undefined);

        const tagIds = filters.alcoholTypes
          .map(type => TAG_MAP[type])
          .filter((id): id is number => id !== undefined);

        // 디버깅용 로그: 실제 전송되는 ID 확인
        console.log('선택된 지역 ID:', regionIds);

        const params: BrewerySearchParams = {
          startOffset,
          size: itemsPerPage,
          keyword: filters.searchKeyword || undefined,
          min_price: filters.priceRange.min !== '' ? Number(filters.priceRange.min) : undefined,
          max_price: filters.priceRange.max !== '' ? Number(filters.priceRange.max) : undefined,
          region_id_list: regionIds.length > 0 ? regionIds : undefined,
          tag_id_list: tagIds.length > 0 ? tagIds : undefined
        };

        response = await searchBreweries(params);
      } else {
        response = await getLatestBreweries(startOffset, itemsPerPage);
      }

      const convertedData = response.content.map(convertToBreweryType);
      
      setBreweryData(convertedData);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
    } catch (error) {
      console.error('❌ 양조장 데이터 로드 실패:', error);
      setApiError('양조장 데이터를 불러오는데 실패했습니다.');
      setBreweryData([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreweries();
  }, [currentPage, filters]);

  // 통계 계산
  const breweryCount = useMemo(() => {
    const byRegion: Record<string, number> = {};
    const byAlcoholType: Record<string, number> = {};
    const byBadge: Record<string, number> = {};
    let priceStats = { min: Number.MAX_SAFE_INTEGER, max: 0, withExperience: 0 };

    breweryData.forEach(brewery => {
      const regionName = brewery.region_type_name || '기타';
      byRegion[regionName] = (byRegion[regionName] || 0) + 1;
      
      (brewery.alcohol_types || brewery.tag_name || []).forEach((type: string) => {
        byAlcoholType[type] = (byAlcoholType[type] || 0) + 1;
      });
      
      if (brewery.badges?.length) {
        brewery.badges.forEach(badge => {
          byBadge[badge.content] = (byBadge[badge.content] || 0) + 1;
        });
      } else {
        byBadge['기본'] = (byBadge['기본'] || 0) + 1;
      }
      
      if (brewery.brewery_joy_count && brewery.brewery_joy_count > 0) {
        priceStats.withExperience += brewery.brewery_joy_count;
        if (brewery.brewery_joy_min_price !== undefined) {
             priceStats.min = Math.min(priceStats.min, brewery.brewery_joy_min_price);
             priceStats.max = Math.max(priceStats.max, brewery.brewery_joy_min_price);
        }
      }
    });
    
    if (priceStats.withExperience === 0) {
      priceStats.min = 0; 
      priceStats.max = 0;
    } else if (priceStats.min === Number.MAX_SAFE_INTEGER) {
        priceStats.min = 0;
    }
    
    return { 
      total: totalElements, 
      byRegion, 
      byAlcoholType, 
      byBadge, 
      priceStats 
    };
  }, [breweryData, totalElements]);

  const pageInfo = {
    currentStart: (currentPage - 1) * itemsPerPage + 1,
    currentEnd: Math.min(currentPage * itemsPerPage, totalElements),
    total: totalElements
  };

  const handleFilterChange = (newFilters: Partial<BreweryFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); 
  };

  const handleBreweryClick = (brewery: Brewery) => {
    if (onBreweryClick) {
      onBreweryClick(brewery.brewery_id);
    } else {
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  const navigateToBreweryDetail = (breweryId: number) => {
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    newUrl.searchParams.set('view', 'brewery-detail');
    newUrl.searchParams.set('brewery', breweryId.toString());
    window.history.pushState({}, '', newUrl.toString());
    window.location.reload();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    if (filters.regions.length > 0) activeFilters.push(`지역: ${filters.regions.join(', ')}`);
    if (filters.alcoholTypes.length > 0) activeFilters.push(`주종: ${filters.alcoholTypes.join(', ')}`);
    if (searchParams.get('filterExperience') === 'true') activeFilters.push('체험 프로그램 포함');
    return activeFilters;
  };

  return (
    <div className={`brewery-container ${className || ''}`}>
      <div className="brewery-content">
        <div className="brewery-filter-section">
          <BreweryFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            breweryCount={breweryCount}
          />
        </div>
        <div className="brewery-main-section">
          <div className="brewery-header">
            <h1>전국 양조장 찾기</h1>
            <p className="brewery-header-subtitle">
              전통주 양조장을 탐방하고 특별한 체험을 즐겨보세요
              {filters.searchKeyword && (
                <span style={{ color: '#8b5a3c', fontWeight: '600' }}>
                  <br />"{filters.searchKeyword}" 검색 결과
                </span>
              )}
              {getActiveFiltersDisplay().length > 0 && (
                <span style={{ color: '#8b5a3c', fontWeight: '600' }}>
                  <br />적용된 필터: {getActiveFiltersDisplay().join(' | ')}
                </span>
              )}
            </p>
            <div className="brewery-stats">
              <div className="brewery-stat"><span className="brewery-stat-icon">🏭</span><span>총 {breweryCount.total}개 양조장</span></div>
              <div className="brewery-stat"><span className="brewery-stat-icon">🎯</span><span>{totalElements}개 검색 결과</span></div>
              <div className="brewery-stat"><span className="brewery-stat-icon">🎪</span><span>{breweryCount.priceStats.withExperience}개 체험 프로그램</span></div>
              {breweryData.length > 0 && (
                <div className="brewery-stat"><span className="brewery-stat-icon">📄</span><span>{pageInfo.currentStart}-{pageInfo.currentEnd} / {pageInfo.total}개 표시</span></div>
              )}
            </div>
          </div>

          {apiError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              color: '#991b1b'
            }}>
              <strong>⚠️ {apiError}</strong>
              <button
                onClick={() => fetchBreweries()}
                style={{
                  marginLeft: '12px',
                  padding: '6px 12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="brewery-loading"><div className="brewery-loading-spinner"></div>양조장을 검색하고 있습니다...</div>
          ) : breweryData.length > 0 ? (
            <>
              <div className="brewery-grid">
                {breweryData.map((brewery) => (
                  <BreweryCard key={brewery.brewery_id} brewery={brewery} onClick={handleBreweryClick} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="brewery-pagination">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          ) : (
            <div className="brewery-empty">
              <div className="brewery-empty-icon">🔍</div>
              <h3 className="brewery-empty-title">{filters.searchKeyword ? `"${filters.searchKeyword}"에 대한 검색 결과가 없습니다` : '검색 결과가 없습니다'}</h3>
              <p className="brewery-empty-description">{filters.searchKeyword ? '다른 검색어를 시도해보시거나 필터 조건을 변경해보세요' : '다른 검색 조건을 시도해보세요'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreweryComponent;