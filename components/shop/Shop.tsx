'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import ProductDetail from './ProductDetail/ProductDetail';
import ProductDetailMain from '../ProductDetailMain/ProductDetailMain'; 
import { ProductWithDetails, ProductActiveFilters, Brewery } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions, getBreweriesWithExperience } from '../../data/mockData';
import { searchProducts, getLatestProducts, convertToProductWithDetails } from '../../utils/shopApi';
import { ProductSearchParams } from '../../types/product';
import { 
  hasActiveFilters as checkActiveFilters,
  buildSearchParams,
  getInitialFilters,
  updateFilters as mergeFilters
} from '../../utils/filterUtils';
import './Shop.css';

interface ShopProps {
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ className }) => {
  const searchParams = useSearchParams();
  
  // 중앙화된 mock 데이터 사용
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [allBreweries] = useState<Brewery[]>(getBreweriesWithExperience());
  
  // API에서 가져온 상품 목록
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([]);
  
  // 필터 상태
  const [activeFilters, setActiveFilters] = useState<ProductActiveFilters>(getInitialFilters());
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 상품 상세페이지 상태
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [selectedProductBrewery, setSelectedProductBrewery] = useState<Brewery | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  // URL 파라미터 처리
  useEffect(() => {
    const search = searchParams.get('search');
    const searchType = searchParams.get('searchType');
    const view = searchParams.get('view');
    const productId = searchParams.get('product');
    
    if (productId && allProducts.length > 0) {
      const product = allProducts.find(p => p.product_id === parseInt(productId));
      if (product) {
        handleProductClick(product.product_id);
        return;
      }
    }
    
    if (!search || !searchType) {
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: ''
      }));
      return;
    }
    
    if (view === 'shop' && searchType === 'product') {
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: search
      }));
      setCurrentPage(1);
    } else {
      setActiveFilters(prev => ({
        ...prev,
        searchKeyword: ''
      }));
      setCurrentPage(1);
    }
  }, [searchParams, allProducts]);

  // 필터 활성화 여부
  const hasActiveFilters = checkActiveFilters(activeFilters);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let response;
      
      if (hasActiveFilters) {
        const params = buildSearchParams(activeFilters, currentPage);
        console.log('필터 검색 API:', params);
        response = await searchProducts(params);
      } else {
        console.log('최신순 조회 API, 페이지:', currentPage, '(startOffset:', currentPage - 1, ')');
        response = await getLatestProducts(currentPage - 1);
      }
      
      console.log('API 응답:', {
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        currentPageSize: response.content.length,
        currentPage: currentPage
      });

      const convertedProducts = response.content.map(convertToProductWithDetails);
      
      setFilteredProducts(convertedProducts);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);

      console.log('상태 업데이트 완료:', {
        productsCount: convertedProducts.length,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
      
    } catch (error) {
      console.error('상품 조회 실패:', error);
      setFilteredProducts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, currentPage, hasActiveFilters]);

  useEffect(() => {
    console.log('fetchProducts 호출 - currentPage:', currentPage, 'hasActiveFilters:', hasActiveFilters);
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: Partial<ProductActiveFilters>) => {
    console.log('필터 변경:', newFilters);
    setActiveFilters(prev => mergeFilters(prev, newFilters));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    console.log('정렬 변경:', sortBy);
    setActiveFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log('페이지 변경:', currentPage, '→', page);
    setCurrentPage(page);
    
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // 상품 클릭 핸들러
  const handleProductClick = (productId: number) => {
    console.log('상품 클릭:', productId);
    
    const product = filteredProducts.find(p => p.product_id === productId);
    if (!product) {
      console.error('상품을 찾을 수 없습니다:', productId);
      return;
    }

    const brewery = allBreweries.find(b => b.brewery_id === product.brewery_id);
    
    setSelectedProduct(product);
    setSelectedProductBrewery(brewery || null);
    setIsProductDetailOpen(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    const url = new URL(window.location.href);
    url.searchParams.set('product', productId.toString());
    window.history.pushState({ productDetail: true }, '', url.toString());
  };

  // 상품 상세페이지 닫기
  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
    setSelectedProductBrewery(null);

    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = new URL(baseUrl);
    newUrl.searchParams.set('view', 'shop');
    
    window.history.replaceState({}, '', newUrl.toString());

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
        setIsProductDetailOpen(false);
        setSelectedProduct(null);
        setSelectedProductBrewery(null);
        
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

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 추가:', productId);
  };

  const handleToggleWishlist = (productId: number) => {
    console.log('위시리스트 토글:', productId);
  };

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
            products={filteredProducts}
            isLoading={isLoading}
            sortBy={activeFilters.sortBy}
            onSortChange={handleSortChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={totalElements}
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