'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import ProductDetailMain from '../ProductDetailMain/ProductDetailMain'; 
import { ProductWithDetails, ProductActiveFilters, Brewery } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions, getBreweriesWithExperience } from '../../data/mockData';
import { 
  searchProducts, 
  getLatestProducts, 
  getProductById, // 추가됨
  convertToProductWithDetails,
  convertDetailToProductWithDetails // 추가됨
} from '../../utils/shopApi';
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
  
  const [allProducts] = useState<ProductWithDetails[]>(getProductsWithBrewery());
  const [allBreweries] = useState<Brewery[]>(getBreweriesWithExperience());
  
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([]);
  const [activeFilters, setActiveFilters] = useState<ProductActiveFilters>(getInitialFilters());
  
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
    
    // URL에 productId가 있으면 상세 페이지 열기
    if (productId) {
      handleProductClick(parseInt(productId));
    }
    
    if (!search || !searchType) {
      setActiveFilters(prev => ({ ...prev, searchKeyword: '' }));
      return;
    }
    
    if (view === 'shop' && searchType === 'product') {
      setActiveFilters(prev => ({ ...prev, searchKeyword: search }));
      setCurrentPage(1);
    } else {
      setActiveFilters(prev => ({ ...prev, searchKeyword: '' }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  const hasActiveFilters = checkActiveFilters(activeFilters);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (hasActiveFilters) {
        const params = buildSearchParams(activeFilters, currentPage);
        response = await searchProducts(params);
      } else {
        response = await getLatestProducts(currentPage - 1);
      }
      
      const convertedProducts = response.content.map(convertToProductWithDetails);
      setFilteredProducts(convertedProducts);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
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
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: Partial<ProductActiveFilters>) => {
    setActiveFilters(prev => mergeFilters(prev, newFilters));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setActiveFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // [수정] 상품 클릭 핸들러: 상세 API 호출 추가
  const handleProductClick = async (productId: number) => {
    // 1. 리스트에 있는 기본 정보로 먼저 상세창 띄우기 (빠른 반응성)
    const basicProduct = filteredProducts.find(p => p.product_id === productId) || 
                         allProducts.find(p => p.product_id === productId);

    // 리스트에도 정보가 없으면 API 호출 전까지는 null (이 경우 로딩 처리가 필요할 수 있음)
    if (basicProduct) {
      setSelectedProduct(basicProduct);
      // 양조장 정보 찾기 (임시 Mock 매칭)
      const brewery = allBreweries.find(b => b.brewery_id === basicProduct.brewery_id);
      setSelectedProductBrewery(brewery || null);
      setIsProductDetailOpen(true);
    }

    // 2. [핵심] 상세 API를 호출하여 이미지 등 추가 정보 가져오기
    try {
      const detailData = await getProductById(productId);
      
      if (detailData) {
        // API 데이터를 UI 포맷으로 변환 (이미지 배열 포함)
        const fullProduct = convertDetailToProductWithDetails(detailData);
        
        // 기존 정보와 상세 정보를 병합
        const mergedProduct = {
          ...basicProduct, // 기존 리스트 정보
          ...fullProduct,  // 상세 정보 (images, description 등) 덮어쓰기
          // 평점, 리뷰 수 등은 리스트 정보가 더 정확할 수 있으므로 리스트 정보 우선 (없으면 상세 정보 사용)
          averageRating: basicProduct?.averageRating || fullProduct.averageRating,
          reviewCount: basicProduct?.reviewCount || fullProduct.reviewCount,
        };

        console.log('상세 데이터 로드 완료:', mergedProduct);
        setSelectedProduct(mergedProduct);
        
        // 만약 리스트에 없던 상품이었다면 여기서 상세창을 열어줌
        if (!basicProduct) {
           // 양조장 정보는 여기서 추가로 fetch하거나 basicProduct 로직 사용
           setIsProductDetailOpen(true);
        }
      }
    } catch (error) {
      console.error('상세 정보 로드 실패:', error);
      // 실패해도 기본 정보(basicProduct)는 보여짐
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

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
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const productId = url.searchParams.get('product');
      if (!productId && isProductDetailOpen) {
        setIsProductDetailOpen(false);
        setSelectedProduct(null);
        setSelectedProductBrewery(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isProductDetailOpen]);

  const handleAddToCart = (productId: number) => { console.log('장바구니:', productId); };
  const handleToggleWishlist = (productId: number) => { console.log('위시리스트:', productId); };

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
            onProductClick={handleProductClick} // 수정된 핸들러 전달
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;