'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter/ProductFilter';
import ProductList from './ProductList/ProductList';
import ProductDetailMain from '../ProductDetailMain/ProductDetailMain'; 
import { ProductWithDetails, ProductActiveFilters, Brewery } from '../../types/mockData';
import { getProductsWithBrewery, mockFilterOptions, getBreweriesWithExperience } from '../../data/mockData';
import { searchProducts, getLatestProducts, convertToProductWithDetails } from '../../utils/shopApi';
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
    
    if (productId && allProducts.length > 0) {
      const product = allProducts.find(p => p.product_id === parseInt(productId));
      if (product) {
        handleProductClick(product.product_id);
      }
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
  }, [searchParams, allProducts]);

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

  const handleProductClick = (productId: number) => {
    const product = filteredProducts.find(p => p.product_id === productId) || 
                    allProducts.find(p => p.product_id === productId);

    if (!product) return;

    // [수정] Brewery id 필드명 변경 반영 (brewery_id)
    const brewery = allBreweries.find(b => b.brewery_id === product.brewery_id);
    
    setSelectedProduct(product);
    setSelectedProductBrewery(brewery || null);
    setIsProductDetailOpen(true);

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