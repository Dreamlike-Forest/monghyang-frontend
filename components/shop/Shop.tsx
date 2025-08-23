'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import ProductDetail from './ProductDetail/ProductDetail';
import ProductDetailMain from '../ProductDetailMain/ProductDetailMain'; 
import { ProductWithDetails, ProductActiveFilters, Brewery } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions, getBreweriesWithExperience } from '../../data/mockData';
import './Shop.css';

interface ShopProps {
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ className }) => {
  // 중앙화된 mock 데이터 사용
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [allBreweries] = useState<Brewery[]>(getBreweriesWithExperience());
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
  const itemsPerPage = 9;

  // 상품 상세페이지 상태
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [selectedProductBrewery, setSelectedProductBrewery] = useState<Brewery | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  // URL 파라미터에서 상품 ID 확인 - useEffect 의존성 문제 해결
  useEffect(() => {
    const checkURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');
      
      if (productId && allProducts.length > 0) {
        const product = allProducts.find(p => p.product_id === parseInt(productId));
        if (product) {
          handleProductClick(product.product_id);
        }
      }
    };

    checkURLParams();
  }, [allProducts]); // allProducts가 로드된 후 실행

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
    }, 500);
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
  };

  // 상품 클릭 핸들러 - 상품 상세페이지 열기
  const handleProductClick = (productId: number) => {
    console.log('상품 클릭:', productId);
    
    // 선택된 상품 찾기
    const product = allProducts.find(p => p.product_id === productId);
    if (!product) {
      console.error('상품을 찾을 수 없습니다:', productId);
      return;
    }

    // 해당 상품의 양조장 정보 찾기
    const brewery = allBreweries.find(b => b.brewery_id === product.brewery_id);
    
    console.log('선택된 상품:', product.name);
    console.log('양조장 정보:', brewery?.brewery_name);

    // 상태 설정
    setSelectedProduct(product);
    setSelectedProductBrewery(brewery || null);
    setIsProductDetailOpen(true);

    // URL 업데이트 (브라우저 히스토리에 추가)
    updateURLForProductDetail(productId);
  };

  // URL 업데이트 함수 - 히스토리 문제 방지
  const updateURLForProductDetail = (productId: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', productId.toString());
    
    // pushState 대신 replaceState 사용하여 뒤로가기 문제 방지
    window.history.pushState({ productDetail: true }, '', url.toString());
  };

  // 상품 상세페이지 닫기 - URL 정리 개선
  const handleCloseProductDetail = () => {
    console.log('상품 상세페이지 닫기');
    
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
    setSelectedProductBrewery(null);

    // URL에서 product 파라미터 제거
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    
    // view 파라미터가 없으면 shop으로 설정
    if (!url.searchParams.has('view')) {
      url.searchParams.set('view', 'shop');
    }
    
    // replaceState로 히스토리 문제 방지
    window.history.replaceState({}, '', url.toString());
  };

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const url = new URL(window.location.href);
      const productId = url.searchParams.get('product');
      
      if (!productId && isProductDetailOpen) {
        // 상품 상세페이지가 열려있는데 URL에 product가 없으면 닫기
        setIsProductDetailOpen(false);
        setSelectedProduct(null);
        setSelectedProductBrewery(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isProductDetailOpen]);

  // 장바구니 추가 핸들러
  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 추가:', productId);
    // TODO: 장바구니 API 호출
  };

  // 위시리스트 토글 핸들러
  const handleToggleWishlist = (productId: number) => {
    console.log('위시리스트 토글:', productId);
    // TODO: 위시리스트 API 호출
  };

  // 현재 페이지에 해당하는 상품들
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 상품 상세페이지가 열려있으면 새로운 ProductDetailMain 사용 (페이지 모드)
  if (isProductDetailOpen && selectedProduct) {
    return (
      <ProductDetailMain
        product={selectedProduct}
        brewery={selectedProductBrewery}
        onClose={handleCloseProductDetail}
        isOpen={isProductDetailOpen}
        isPageMode={true}
      />
    );
  }

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
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;