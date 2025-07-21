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
  activeCategory = 'all',
  onCategoryChange
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

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'takju', name: '탁주/막걸리' },
    { id: 'cheongju', name: '청주' },
    { id: 'yakju', name: '약주' },
    { id: 'soju', name: '소주/증류주' },
    { id: 'fruit', name: '과실주/와인' }
  ];

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 추가:', productId);
    // TODO: 장바구니 API 호출
  };

  const handleToggleWishlist = (productId: number) => {
    console.log('위시리스트 토글:', productId);
    // TODO: 위시리스트 API 호출
  };

  const handleProductClick = (productId: number) => {
    console.log('상품 상세 페이지로 이동:', productId);
    // TODO: 상품 상세 페이지 라우팅
  };

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
      {/* 상단 카테고리 탭과 정렬 */}
      <div className="product-list-header">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange?.(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
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
      {!isLoading && (
        <div className="product-count">
          총 <span className="product-count-number">{totalCount}</span>개의 상품
        </div>
      )}

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
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onProductClick={handleProductClick}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
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