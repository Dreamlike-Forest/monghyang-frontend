'use client';

import { useState, useRef, useEffect } from 'react';
import ProductOverviewSection from './ProductOverviewSection/ProductOverviewSection';
import ProductBreweryCard from './ProductBreweryCard/ProductBreweryCard';
import ProductReviewsSection from './ProductReviewsSection/ProductReviewsSection';
import { ProductWithDetails, Brewery } from '../../types/shop';
import './ProductDetailMain.css';

interface ProductDetailMainProps {
  product: ProductWithDetails;
  brewery?: Brewery | null;
  onClose: () => void;
  isOpen: boolean;
  isPageMode?: boolean;
}

const ProductDetailMain: React.FC<ProductDetailMainProps> = ({
  product,
  brewery,
  onClose,
  isOpen,
  isPageMode = false
}) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  const overviewRef = useRef<HTMLDivElement>(null);
  const breweryRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPageMode && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const currentProductId = url.searchParams.get('product');
      
      if (currentProductId !== product.product_id.toString()) {
        url.searchParams.set('product', product.product_id.toString());
        url.searchParams.set('view', 'shop');
        window.history.replaceState({}, '', url.toString());
        window.dispatchEvent(new Event('locationchange'));
      }
    }
  }, [isPageMode, product.product_id]);

  const handleBreweryClick = (breweryId: number) => {
    console.log('양조장 클릭:', breweryId, '- 양조장 상세페이지로 이동');
    
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    window.location.href = url.toString();
  };

  if (!isOpen) {
    console.log(' ProductDetailMain이 열리지 않음 (isOpen: false)');
    return null;
  }

  console.log(' ProductDetailMain 렌더링 중:', product.name, 'pageMode:', isPageMode);

  if (isPageMode) {
    return (
      <div className="productdetail-product-detail-container-full">
        <div className="productdetail-product-main-content">
          {/* 상품 개요 */}
          <ProductOverviewSection 
            product={product} 
            forwardRef={overviewRef} 
          />

          {/* 양조장 정보 */}
          <ProductBreweryCard 
            brewery={brewery || undefined}
            forwardRef={breweryRef}
            onBreweryClick={handleBreweryClick}
          />

          {/* 상품 리뷰 섹션 */}
          <div ref={reviewsRef} className="productdetail-product-section-container" id="productdetail-reviews">
            <ProductReviewsSection 
              productName={product.name}
              productId={product.product_id}
              hideTitle={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProductDetailMain;