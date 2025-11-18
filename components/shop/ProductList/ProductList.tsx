'use client';

import ProductCard from '../ProductCard/ProductCard';
import Pagination from '../Pagination/Pagination';
import { ProductWithDetails } from '../../../types/mockData';
import './ProductList.css';

interface ProductListProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  sortBy,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  onProductClick,
  onAddToCart,
  onToggleWishlist
}) => {
  const sortOptions = [
    { value: 'latest', label: '추천순' },
    { value: 'new', label: '신상품' },
    { value: 'popular', label: '인기순' },
    { value: 'price_low', label: '가격낮은순' },
    { value: 'price_high', label: '가격높은순' },
    { value: 'rating', label: '평점높은순' },
    { value: 'review', label: '리뷰많은순' }
  ];

  if (isLoading) {
    return (
      <div className="product-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          상품을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* 정렬 컨트롤 */}
      <div className="product-list-header">
        <div className="sort-controls">
          <span className="sort-label">정렬:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상품 수 표시 */}
      <div className="product-count">
        총 <span className="product-count-number">{totalCount}</span>개의 상품
      </div>

      {/* 상품 그리드 또는 빈 상태 */}
      {products.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🍶</div>
          <div className="no-products-title">검색 결과가 없습니다</div>
          <div className="no-products-description">
            다른 검색어나 필터 조건으로<br />
            다시 시도해보세요.
          </div>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map(product => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onProductClick={onProductClick}
              />
            ))}
          </div>

          {/* 페이지네이션 - totalPages가 1보다 크면 표시 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;