'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import ProductDetail from './ProductDetail/ProductDetail';
import ProductDetailMain from '../ProductDetailMain/ProductDetailMain'; 
import { ProductWithDetails, ActiveFilters } from '../../types/shop';
import { Brewery } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions, getBreweriesWithExperience } from '../../data/mockData';
import './Shop.css';

interface ShopProps {
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ className }) => {
  const searchParams = useSearchParams();
  
  // 중앙화된 mock 데이터 사용
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [allBreweries] = useState<Brewery[]>(getBreweriesWithExperience());
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
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

  // URL 파라미터 처리 - 완전 수정된 부분
  useEffect(() => {
    const search = searchParams.get('search');
    const searchType = searchParams.get('searchType');
    const view = searchParams.get('view');
    const productId = searchParams.get('product');
    
    console.log('Shop URL 파라미터:', { search, searchType, view, productId });
    
    // 상품 상세페이지 처리 (최우선)
    if (productId && allProducts.length > 0) {
      const product = allProducts.find(p => p.product_id === parseInt(productId));
      if (product) {
        handleProductClick(product.product_id);
        return; // 상품 상세페이지 처리 시 다른 로직 실행하지 않음
      }
    }
    
    // URL에 search 파라미터가 없으면 무조건 검색어 초기화
    if (!search || !searchType) {
      console.log('검색 파라미터 없음 - Shop 필터 초기화');
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: ''
      }));
      return;
    }
    
    // shop 페이지이면서 홈에서 product 검색으로 온 경우에만 검색어 설정
    if (view === 'shop' && searchType === 'product') {
      console.log('홈에서 상품 검색으로 이동:', search);
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: search
      }));
    } else {
      // 잘못된 조합이면 검색어 초기화
      console.log('잘못된 검색 타입 또는 페이지 - Shop 필터 초기화');
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: ''
      }));
    }
  }, [searchParams, allProducts]);

  // 필터 적용 함수
  const applyFilters = useCallback(() => {
    setIsLoading(true);
    
    // 실제 구현에서는 여기서 API 호출
    setTimeout(() => {
      let filtered = [...allProducts];

      // 검색어 필터
      if (activeFilters.searchKeyword) {
        const keyword = activeFilters.searchKeyword.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(keyword) ||
          product.brewery.toLowerCase().includes(keyword) ||
          product.info?.description?.toLowerCase().includes(keyword) ||
          product.tags.some(tag => tag.tagType.name.toLowerCase().includes(keyword))
        );
      }

      // 주종 필터
      if (activeFilters.types.length > 0) {
        filtered = filtered.filter(product => {
          const productName = product.name.toLowerCase();
          return activeFilters.types.some(type => {
            switch (type) {
              case 'takju':
                return productName.includes('막걸리') || productName.includes('탁주');
              case 'cheongju':
                return productName.includes('청주') || productName.includes('청명');
              case 'yakju':
                return productName.includes('약주');
              case 'soju':
                return productName.includes('소주') || productName.includes('증류') || 
                       product.alcohol >= 20;
              case 'fruit':
                return productName.includes('와인') || productName.includes('과실') ||
                       productName.includes('복분자');
              default:
                return false;
            }
          });
        });
      }

      // 도수 필터
      if (activeFilters.alcoholRange) {
        filtered = filtered.filter(product => {
          switch (activeFilters.alcoholRange) {
            case 'low': return product.alcohol >= 0 && product.alcohol <= 6;
            case 'medium': return product.alcohol >= 7 && product.alcohol <= 15;
            case 'high1': return product.alcohol >= 16 && product.alcohol <= 25;
            case 'high2': return product.alcohol >= 25 && product.alcohol <= 100;
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

  const handleFilterChange = (newFilters: Partial<ActiveFilters>) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (sortBy: string) => {
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 상품 클릭 핸들러 - 상품 상세페이지 열기 + 스크롤 맨 위로 이동
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

    // **중요: 스크롤을 맨 위로 이동**
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

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

  // 상품 상세페이지 닫기 - URL 정리 개선 + 스크롤 복원
  const handleCloseProductDetail = () => {
    console.log('상품 상세페이지 닫기');
    
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
    setSelectedProductBrewery(null);

    // URL 완전 초기화 - 기존 파라미터 완전 제거
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    
    // shop view만 다시 설정
    newUrl.searchParams.set('view', 'shop');
    
    // replaceState로 히스토리 문제 방지
    window.history.replaceState({}, '', newUrl.toString());

    // **상품 목록으로 돌아갈 때도 스크롤 맨 위로 이동**
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
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
        
        // 뒤로가기 시에도 스크롤 맨 위로 이동
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
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