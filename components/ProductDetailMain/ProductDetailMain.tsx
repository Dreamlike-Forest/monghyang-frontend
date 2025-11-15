'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProductWithDetails, Brewery } from '../../types/mockData';
import ProductOverviewSection from './ProductOverviewSection/ProductOverviewSection';
import ProductBreweryCard from './ProductBreweryCard/ProductBreweryCard';
import ProductReviewsSection from './ProductReviewsSection/ProductReviewsSection';
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
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    window.location.href = url.toString();
  };

  if (!isOpen) {
    return null;
  }

  if (!isPageMode) {
    return null;
  }

  // ProductReviewsSection props를 명시적으로 정의
  const reviewsSectionProps = {
    productName: product.name,
    productId: product.product_id,
    hideTitle: true
  };

  return (
    <div className="productdetail-product-detail-container-full">
      <div className="productdetail-product-main-content">
        <ProductOverviewSection 
          product={product} 
          forwardRef={overviewRef} 
        />

        <ProductBreweryCard 
          brewery={brewery || undefined}
          forwardRef={breweryRef}
          onBreweryClick={handleBreweryClick}
        />

        <div 
          ref={reviewsRef} 
          className="productdetail-product-section-container" 
          id="productdetail-reviews"
        >
          <h2 className="productdetail-product-section-title">술 리뷰</h2>
          <ProductReviewsSection {...reviewsSectionProps} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailMain;