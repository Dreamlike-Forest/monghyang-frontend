'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import { ProductWithDetails, ProductActiveFilters } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions } from '../../data/mockData';
import './Shop.css';

interface ShopProps {
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ className }) => {
  // 중앙화된 mock 데이터 사용
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [activeFilters, setActiveFilters] = useState<ProductActiveFilters>({
    types: [],
    alcoholRange: '',
    regions: [],
    priceMin: 0,
    priceMax: 999999,
    certifications: [],
    searchKeyword: '',
    sortBy: 'latest'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const itemsPerPage = 9;

  // 필터 적용 함수
  const applyFilters = useCallback(() => {
    setIsLoading(true);
    
    // 실제 구현에서는 여기서 API 호출
    setTimeout(() => {
      let filtered = [...allProducts];

      // 검색 키워드 필터
      if (activeFilters.searchKeyword) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(activeFilters.searchKeyword.toLowerCase()) ||
          product.brewery.toLowerCase().includes(activeFilters.searchKeyword.toLowerCase())
        );
      }

      // 주종 필터
      if (activeFilters.types.length > 0) {
        // 실제로는 product.tags에서 주종 정보를 확인해야 함
        // 여기서는 mock 데이터이므로 간단히 구현
        filtered = filtered.filter(product => {
          if (activeFilters.types.includes('takju') && product.name.includes('막걸리')) return true;
          if (activeFilters.types.includes('cheongju') && product.name.includes('청')) return true;
          if (activeFilters.types.includes('soju') && product.name.includes('소주')) return true;
          if (activeFilters.types.includes('fruit') && product.name.includes('와인')) return true;
          return activeFilters.types.length === 0;
        });
      }

      // 도수 필터
      if (activeFilters.alcoholRange) {
        filtered = filtered.filter(product => {
          switch (activeFilters.alcoholRange) {
            case 'low': return product.alcohol <= 6;
            case 'medium': return product.alcohol >= 7 && product.alcohol <= 15;
            case 'high1': return product.alcohol >= 16 && product.alcohol <= 25;
            case 'high2': return product.alcohol > 25;
            default: return true;
          }
        });
      }

      // 가격 필터
      filtered = filtered.filter(product =>
        product.minPrice >= activeFilters.priceMin &&
        product.minPrice <= activeFilters.priceMax
      );

      // 정렬
      switch (activeFilters.sortBy) {
        case 'new':
          filtered.sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
          break;
        case 'popular':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'price_low':
          filtered.sort((a, b) => a.minPrice - b.minPrice);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.minPrice - a.minPrice);
          break;
        case 'rating':
          filtered.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case 'review':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        default:
          // 추천순 (베스트 -> 신상품 -> 평점순)
          filtered.sort((a, b) => {
            if (a.isBest && !b.isBest) return -1;
            if (!a.isBest && b.isBest) return 1;
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;
            return b.averageRating - a.averageRating;
          });
      }

      setFilteredProducts(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setCurrentPage(1);
      setIsLoading(false);
    }, 500); // API 호출 시뮬레이션
  }, [allProducts, activeFilters, itemsPerPage]);

  // 필터 변경 시 적용
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (newFilters: Partial<ProductActiveFilters>) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (sortBy: string) => {
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 실제 구현에서는 여기서 해당 페이지 데이터를 API로 요청
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // 카테고리 변경 시 해당하는 주종 필터 적용
    if (category === 'all') {
      handleFilterChange({ types: [] });
    } else {
      handleFilterChange({ types: [category] });
    }
  };

  // 현재 페이지에 해당하는 상품들
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={`shop-container ${className || ''}`}>
      <div className="shop-content">
        <div className="shop-filter-section">
          <ProductFilter
            filterOptions={mockFilterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        <div className="shop-main-section">
          <ProductList
            products={currentProducts}
            isLoading={isLoading}
            sortBy={activeFilters.sortBy}
            onSortChange={handleSortChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={filteredProducts.length}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;