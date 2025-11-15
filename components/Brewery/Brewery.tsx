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
  convertRegionNamesToIds,
  convertAlcoholTypesToIds
} from '../../utils/breweryUtils';
import './Brewery.css';

interface BreweryProps {
  onBreweryClick?: (breweryId: number) => void;
  className?: string;
}

const BreweryComponent: React.FC<BreweryProps> = ({ onBreweryClick, className }) => {
  const searchParams = useSearchParams();
  const [breweryData, setBreweryData] = useState<Brewery[]>([]);
  const [filters, setFilters] = useState<BreweryFilterOptions>({
    regions: [],
    priceRange: { min: '', max: '' },
    alcoholTypes: [],
    badges: [],
    searchKeyword: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // 초기 데이터 로드
  useEffect(() => {
    loadBreweries();
  }, []);

  // URL 파라미터 처리
  useEffect(() => {
    const search = searchParams.get('search');
    const searchType = searchParams.get('searchType');
    const view = searchParams.get('view');
    
    const filterRegion = searchParams.get('filterRegion');
    const filterAlcoholType = searchParams.get('filterAlcoholType');
    
    console.log('Brewery URL 파라미터:', { 
      search, searchType, view, 
      filterRegion, filterAlcoholType
    });
    
    const newFilters: BreweryFilterOptions = {
      regions: [],
      priceRange: { min: '', max: '' },
      alcoholTypes: [],
      badges: [],
      searchKeyword: ''
    };

    // 검색어 처리
    if (search && searchType && view === 'brewery' && searchType === 'brewery') {
      newFilters.searchKeyword = search;
    }

    // 지역 필터
    if (filterRegion) {
      newFilters.regions = [filterRegion];
    }

    // 주종 필터
    if (filterAlcoholType) {
      newFilters.alcoholTypes = [filterAlcoholType];
    }

    setFilters(newFilters);
  }, [searchParams]);

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    if (breweryData.length > 0 || isLoading) {
      loadBreweries();
    }
  }, [filters, currentPage]);

  // 양조장 데이터 로드 함수
  const loadBreweries = async () => {
    setIsLoading(true);
    
    try {
      const startOffset = (currentPage - 1) * itemsPerPage;
      
      // 필터가 있으면 검색 API, 없으면 최신 목록 API
      const hasFilters = filters.searchKeyword || 
                        filters.regions.length > 0 || 
                        filters.alcoholTypes.length > 0 ||
                        filters.priceRange.min !== '' ||
                        filters.priceRange.max !== '';

      let result;
      
      if (hasFilters) {
        // 검색 API 호출
        const searchApiParams: any = {
          startOffset,
        };

        // 검색어
        if (filters.searchKeyword) {
          searchApiParams.keyword = filters.searchKeyword;
        }

        // 가격 범위
        if (filters.priceRange.min !== '') {
          searchApiParams.min_price = Number(filters.priceRange.min);
        }
        if (filters.priceRange.max !== '') {
          searchApiParams.max_price = Number(filters.priceRange.max);
        }

        // 지역 ID 변환
        if (filters.regions.length > 0) {
          searchApiParams.region_id_list = convertRegionNamesToIds(filters.regions);
        }

        // 주종 태그 ID 변환
        if (filters.alcoholTypes.length > 0) {
          searchApiParams.tag_id_list = convertAlcoholTypesToIds(filters.alcoholTypes);
        }

        console.log('🔍 검색 파라미터:', searchApiParams);
        result = await searchBreweries(searchApiParams);
      } else {
        // 최신 목록 API 호출
        console.log('🆕 최신 양조장 목록 조회');
        result = await getLatestBreweries(startOffset);
      }

      console.log('✅ API 응답:', result);
      
      setBreweryData(result.breweries);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / itemsPerPage));
      
    } catch (error) {
      console.error('❌ 양조장 데이터 로드 실패:', error);
      alert('양조장 정보를 불러오는데 실패했습니다.');
      setBreweryData([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 카운트 계산 (프론트엔드 필터링용)
  const breweryCount = useMemo(() => {
    const byRegion: Record<string, number> = {};
    const byAlcoholType: Record<string, number> = {};
    const byBadge: Record<string, number> = {};
    let priceStats = { min: Number.MAX_SAFE_INTEGER, max: 0, withExperience: 0 };

    breweryData.forEach(brewery => {
      byRegion[brewery.region_name] = (byRegion[brewery.region_name] || 0) + 1;
      
      brewery.alcohol_types.forEach(type => {
        byAlcoholType[type] = (byAlcoholType[type] || 0) + 1;
      });

      if (brewery.badges?.length) {
        brewery.badges.forEach(badge => {
          byBadge[badge.content] = (byBadge[badge.content] || 0) + 1;
        });
      } else {
        byBadge['기본'] = (byBadge['기본'] || 0) + 1;
      }

      if (brewery.experience_programs?.length) {
        priceStats.withExperience++;
        brewery.experience_programs.forEach(program => {
          priceStats.min = Math.min(priceStats.min, program.price);
          priceStats.max = Math.max(priceStats.max, program.price);
        });
      }
    });

    if (priceStats.withExperience === 0) {
      priceStats.min = 0;
      priceStats.max = 0;
    }

    return {
      total: totalCount,
      byRegion,
      byAlcoholType,
      byBadge,
      priceStats
    };
  }, [breweryData, totalCount]);

  // 페이지 정보 계산
  const pageInfo = {
    currentStart: (currentPage - 1) * itemsPerPage + 1,
    currentEnd: Math.min(currentPage * itemsPerPage, totalCount),
    total: totalCount
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<BreweryFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // 양조장 클릭 핸들러
  const handleBreweryClick = (brewery: Brewery) => {
    console.log('양조장 클릭:', brewery.brewery_name);
    
    if (onBreweryClick) {
      onBreweryClick(brewery.brewery_id);
    } else {
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  // 양조장 상세페이지로 이동
  const navigateToBreweryDetail = (breweryId: number) => {
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    newUrl.searchParams.set('view', 'brewery-detail');
    newUrl.searchParams.set('brewery', breweryId.toString());
    
    window.history.pushState({}, '', newUrl.toString());
    window.location.reload();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 활성 필터 표시
  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    
    if (filters.regions.length > 0) {
      activeFilters.push(`지역: ${filters.regions.join(', ')}`);
    }
    
    if (filters.alcoholTypes.length > 0) {
      activeFilters.push(`주종: ${filters.alcoholTypes.join(', ')}`);
    }
    
    if (searchParams.get('filterExperience') === 'true') {
      activeFilters.push('체험 프로그램 포함');
    }
    
    return activeFilters;
  };

  return (
    <div className={`brewery-container ${className || ''}`}>
      <div className="brewery-content">
        {/* 사이드바 필터 */}
        <div className="brewery-filter-section">
          <BreweryFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            breweryCount={breweryCount}
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="brewery-main-section">
          {/* 헤더 */}
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
              <div className="brewery-stat">
                <span className="brewery-stat-icon">🏭</span>
                <span>총 {breweryCount.total}개 양조장</span>
              </div>
              <div className="brewery-stat">
                <span className="brewery-stat-icon">🎯</span>
                <span>{totalCount}개 검색 결과</span>
              </div>
              <div className="brewery-stat">
                <span className="brewery-stat-icon">🎪</span>
                <span>{breweryCount.priceStats.withExperience}개 체험 프로그램</span>
              </div>
              {totalCount > 0 && (
                <div className="brewery-stat">
                  <span className="brewery-stat-icon">📄</span>
                  <span>{pageInfo.currentStart}-{pageInfo.currentEnd} / {pageInfo.total}개 표시</span>
                </div>
              )}
            </div>
          </div>

          {/* 양조장 그리드 */}
          {isLoading ? (
            <div className="brewery-loading">
              <div className="brewery-loading-spinner"></div>
              양조장을 검색하고 있습니다...
            </div>
          ) : breweryData.length > 0 ? (
            <>
              <div className="brewery-grid">
                {breweryData.map((brewery) => (
                  <BreweryCard
                    key={brewery.brewery_id}
                    brewery={brewery}
                    onClick={handleBreweryClick}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="brewery-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="brewery-empty">
              <div className="brewery-empty-icon">🔍</div>
              <h3 className="brewery-empty-title">
                {filters.searchKeyword 
                  ? `"${filters.searchKeyword}"에 대한 검색 결과가 없습니다`
                  : '검색 결과가 없습니다'
                }
              </h3>
              <p className="brewery-empty-description">
                {filters.searchKeyword 
                  ? '다른 검색어를 시도해보시거나 필터 조건을 변경해보세요'
                  : '다른 검색 조건을 시도해보세요'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreweryComponent;
