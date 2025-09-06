'use client';

import { useState, useRef, useEffect } from 'react';
import ProductOverviewSection from './ProductOverviewSection/ProductOverviewSection';
import ProductBreweryCard from './ProductBreweryCard/ProductBreweryCard';
import ProductReviewsSection from './ProductReviewsSection/ProductReviewsSection';
import { ProductWithDetails, Brewery } from '../../types/mockData';
import { WritePostData } from '../../types/community';
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
  
  // 스크롤 참조
  const overviewRef = useRef<HTMLDivElement>(null);
  const breweryRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // 페이지 모드일 때 Header가 제대로 작동하도록 URL 설정 확인
  useEffect(() => {
    if (isPageMode && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const currentProductId = url.searchParams.get('product');
      
      // URL에 product 파라미터가 없거나 다르면 설정
      if (currentProductId !== product.product_id.toString()) {
        url.searchParams.set('product', product.product_id.toString());
        url.searchParams.set('view', 'shop');
        
        // URL 업데이트 (새로고침 없이)
        window.history.replaceState({}, '', url.toString());
        
        // Header가 URL 변경을 감지할 수 있도록 커스텀 이벤트 발생
        window.dispatchEvent(new Event('locationchange'));
      }
    }
  }, [isPageMode, product.product_id]);

  // 양조장 카드 클릭 시 양조장 상세페이지로 이동
  const handleBreweryClick = (breweryId: number) => {
    console.log('양조장 클릭:', breweryId, '- 양조장 상세페이지로 이동');
    
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    window.location.href = url.toString();
  };

  // 상품 리뷰 작성 핸들러
  const handleProductReviewSubmit = async (reviewData: WritePostData) => {
    try {
      console.log('상품 리뷰 제출:', reviewData);
      // TODO: 실제 API 호출
      alert('상품 리뷰가 성공적으로 작성되었습니다!');
      // TODO: 리뷰 목록 새로고침
    } catch (error) {
      console.error('상품 리뷰 작성 실패:', error);
      throw error;
    }
  };

  // 페이지 모드에서 닫기 핸들러 (브라우저 뒤로가기 처리)
  const handlePageModeClose = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      
      // view 파라미터가 없으면 shop으로 설정
      if (!url.searchParams.has('view')) {
        url.searchParams.set('view', 'shop');
      }
      
      window.location.href = url.toString();
    }
  };

  if (!isOpen) {
    console.log('❌ ProductDetailMain이 열리지 않음 (isOpen: false)');
    return null;
  }

  console.log('✅ ProductDetailMain 렌더링 중:', product.name, 'pageMode:', isPageMode);

  // 페이지 모드일 때는 오버레이 없이 렌더링
  if (isPageMode) {
    return (
      <div className="productdetail-product-detail-container-full">
        {/* 메인 콘텐츠 */}
        <div className="productdetail-product-main-content">
          {/* 상품 개요 (이미지 + 기본 정보 + 상세 정보 통합) */}
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
            <h2 className="productdetail-product-section-title">술 리뷰</h2>
            <ProductReviewsSection 
              productName={product.name}
              productId={product.product_id}
              hideTitle={true}  // 제목 숨김으로 중복 방지
            />
          </div>
        </div>
      </div>
    );
  }

  // 모달 모드는 Shop 컴포넌트의 기존 ProductDetail 사용
  return null;
};

export default ProductDetailMain;