'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BreweryFilter from './BreweryFilter/BreweryFilter';
import BreweryCard from './BreweryCard/BreweryCard';
import Pagination from '../shop/Pagination/Pagination';
import { Brewery, BreweryFilterOptions } from '../../types/mockData';
import { getBreweriesWithExperience } from '../../data/mockData';
import './Brewery.css';

interface BreweryProps {
  onBreweryClick?: (breweryId: number) => void;
}

const BreweryComponent: React.FC<BreweryProps> = ({ onBreweryClick }) => {
  const router = useRouter();
  const [breweryData] = useState<Brewery[]>(getBreweriesWithExperience());
  const [filters, setFilters] = useState<BreweryFilterOptions>({
    regions: [],
    priceRange: { min: '', max: '' },
    alcoholTypes: [],
    badges: [],
    searchKeyword: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 12; // 한 페이지당 12개 양조장 표시

  // 검색 함수
  const isMatchingSearch = (brewery: Brewery, keyword: string): boolean => {
    if (!keyword) return true;
    
    const searchTerm = keyword.toLowerCase();
    const searchFields = [
      brewery.brewery_name,
      brewery.brewery_address,
      brewery.region_name,
      brewery.introduction || '',
      brewery.depositor,
      brewery.bank_name,
      brewery.business_email || '',
      ...brewery.alcohol_types,
      ...(brewery.experience_programs?.flatMap(p => [p.name, p.detail, p.place]) || [])
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(searchTerm)
    );
  };

  // 필터링된 데이터
  const filteredBreweries = useMemo(() => {
    return breweryData.filter(brewery => {
      // 검색어 필터
      if (!isMatchingSearch(brewery, filters.searchKeyword)) return false;

      // 지역 필터
      if (filters.regions.length > 0 && !filters.regions.includes(brewery.region_name)) return false;

      // 가격 필터
      if (brewery.experience_programs?.length) {
        const prices = brewery.experience_programs.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (filters.priceRange.min !== '' && maxPrice < Number(filters.priceRange.min)) return false;
        if (filters.priceRange.max !== '' && minPrice > Number(filters.priceRange.max)) return false;
      } else if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
        return false;
      }

      // 주종 필터
      if (filters.alcoholTypes.length > 0) {
        const hasMatchingType = filters.alcoholTypes.some(type => 
          brewery.alcohol_types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      // 배지 필터
      if (filters.badges.length > 0) {
        const hasMatchingBadge = filters.badges.some(badgeFilter => {
          if (!brewery.badges?.length) return badgeFilter === '기본';
          return brewery.badges.some(badge => badge.content === badgeFilter);
        });
        if (!hasMatchingBadge) return false;
      }

      return true;
    });
  }, [breweryData, filters]);

  // 카운트 계산
  const breweryCount = useMemo(() => {
    const byRegion: Record<string, number> = {};
    const byAlcoholType: Record<string, number> = {};
    const byBadge: Record<string, number> = {};
    let priceStats = { min: Number.MAX_SAFE_INTEGER, max: 0, withExperience: 0 };

    breweryData.forEach(brewery => {
      // 지역별 카운트
      byRegion[brewery.region_name] = (byRegion[brewery.region_name] || 0) + 1;
      
      // 주종별 카운트
      brewery.alcohol_types.forEach(type => {
        byAlcoholType[type] = (byAlcoholType[type] || 0) + 1;
      });

      // 배지별 카운트
      if (brewery.badges?.length) {
        brewery.badges.forEach(badge => {
          byBadge[badge.content] = (byBadge[badge.content] || 0) + 1;
        });
      } else {
        byBadge['기본'] = (byBadge['기본'] || 0) + 1;
      }

      // 가격 통계
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
      total: breweryData.length,
      byRegion,
      byAlcoholType,
      byBadge,
      priceStats
    };
  }, [breweryData]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredBreweries.length / itemsPerPage);
  const currentBreweries = filteredBreweries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 페이지 정보 계산
  const pageInfo = {
    currentStart: (currentPage - 1) * itemsPerPage + 1,
    currentEnd: Math.min(currentPage * itemsPerPage, filteredBreweries.length),
    total: filteredBreweries.length
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<BreweryFilterOptions>) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // 양조장 클릭 핸들러 - 상세페이지로 이동
  const handleBreweryClick = (brewery: Brewery) => {
    console.log('양조장 클릭:', brewery.brewery_name);
    
    if (onBreweryClick) {
      onBreweryClick(brewery.brewery_id);
    } else {
      // URL 기반 네비게이션으로 상세페이지 이동
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  // 양조장 상세페이지로 이동하는 함수
  const navigateToBreweryDetail = (breweryId: number) => {
    const url = new URL(window.location.href);
    
    // 기존 파라미터 정리
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    
    // 양조장 상세페이지 파라미터 설정
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    // URL 업데이트 및 페이지 이동
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="brewery-container">
      {/* 사이드바 필터 */}
      <aside className="brewery-sidebar">
        <BreweryFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          breweryCount={breweryCount}
        />
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="brewery-main">
        {/* 헤더 */}
        <div className="brewery-header">
          <h1>전국 양조장 찾기</h1>
          <p className="brewery-header-subtitle">
            전통주 양조장을 탐방하고 특별한 체험을 즐겨보세요
          </p>
          <div className="brewery-stats">
            <div className="brewery-stat">
              <span className="brewery-stat-icon">🏭</span>
              <span>총 {breweryCount.total}개 양조장</span>
            </div>
            <div className="brewery-stat">
              <span className="brewery-stat-icon">🎯</span>
              <span>{filteredBreweries.length}개 검색 결과</span>
            </div>
            <div className="brewery-stat">
              <span className="brewery-stat-icon">🎪</span>
              <span>{breweryCount.priceStats.withExperience}개 체험 프로그램</span>
            </div>
            {filteredBreweries.length > 0 && (
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
        ) : currentBreweries.length > 0 ? (
          <>
            <div className="brewery-grid">
              {currentBreweries.map((brewery) => (
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
            <h3 className="brewery-empty-title">검색 결과가 없습니다</h3>
            <p className="brewery-empty-description">
              다른 검색 조건을 시도해보세요
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BreweryComponent;