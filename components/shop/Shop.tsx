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
import './Shop.css';

interface ShopProps {
  className?: string;
}

const Shop: React.FC<ShopProps> = ({ className }) => {
  const searchParams = useSearchParams();
  
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [allBreweries] = useState<Brewery[]>(getBreweriesWithExperience());
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([]);
  
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
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [selectedProductBrewery, setSelectedProductBrewery] = useState<Brewery | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

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

  const hasActiveFilters = activeFilters.searchKeyword || 
                          activeFilters.types.length > 0 || 
                          activeFilters.alcoholRange ||
                          activeFilters.priceMin > 0 ||
                          activeFilters.priceMax < 999999;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let response;
      
      if (hasActiveFilters) {
        const params: ProductSearchParams = {
          startOffset: currentPage - 1,
        };

        if (activeFilters.searchKeyword) {
          params.keyword = activeFilters.searchKeyword;
        }
        if (activeFilters.priceMin > 0) {
          params.min_price = activeFilters.priceMin;
        }
        if (activeFilters.priceMax < 999999) {
          params.max_price = activeFilters.priceMax;
        }
        if (activeFilters.alcoholRange) {
          switch (activeFilters.alcoholRange) {
            case 'low':
              params.min_alcohol = 0;
              params.max_alcohol = 6;
              break;
            case 'medium':
              params.min_alcohol = 7;
              params.max_alcohol = 15;
              break;
            case 'high1':
              params.min_alcohol = 16;
              params.max_alcohol = 25;
              break;
            case 'high2':
              params.min_alcohol = 25;
              params.max_alcohol = 100;
              break;
          }
        }

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
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
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
