'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import WritePost from '../../community/WritePost/WritePost';
import { WritePostData, CategoryConfig } from '../../../types/community';
import './ProductReviewModal.css';

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: number;
  onSubmit?: (reviewData: WritePostData) => void;
}

// 상품 리뷰 전용 카테고리 설정
const productReviewCategories: CategoryConfig[] = [
  {
    id: 'drink_review',
    name: '술 리뷰',
    subcategories: [
      { id: 'taste', name: '맛 후기', count: 0 },
      { id: 'pairing', name: '페어링', count: 0 },
      { id: 'experience', name: '음용 경험', count: 0 },
      { id: 'comparison', name: '제품 비교', count: 0 }
    ],
    hasRating: true,
    placeholder: '이 술에 대한 리뷰를 작성해주세요',
    allowImages: true,
    maxImages: 5
  }
];

const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  onSubmit
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 렌더링되도록 보장
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // 스크롤바 공간 보정
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleReviewSubmit = async (data: WritePostData) => {
    try {
      // 상품 정보를 자동으로 설정하고 커뮤니티 형식에 맞게 변환
      const reviewData: WritePostData = {
        ...data,
        category: 'drink_review',
        product_name: productName,
        // 제목에 상품명이 없으면 자동 추가
        title: data.title.includes(productName) 
          ? data.title 
          : `${productName} - ${data.title}`,
        // 태그에 상품명 자동 추가 (없는 경우)
        tags: data.tags.includes(productName) 
          ? data.tags 
          : [...data.tags, productName]
      };

      console.log('상품 리뷰 데이터 (커뮤니티 형식):', reviewData);
      
      // 부모 컴포넌트의 submit 핸들러 호출 (있는 경우)
      if (onSubmit) {
        await onSubmit(reviewData);
      } else {
        // 기본 처리: 실제로는 API 호출
        alert('리뷰가 작성되었습니다!');
      }
      
      handleClose();
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  // 서버 사이드 렌더링에서는 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // Portal을 사용하여 body에 직접 렌더링
  return createPortal(
    <div 
      className={`product-review-modal-overlay ${isAnimating ? 'open' : ''}`}
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }} // 높은 z-index 보장
    >
      <div className={`product-review-modal-container ${isAnimating ? 'open' : ''}`}>
        {/* WritePost 컴포넌트 임베드 */}
        <div className="product-review-modal-content">
          <WritePost
            onSubmit={handleReviewSubmit}
            onCancel={handleCancel}
            initialCategory="drink_review"
            categories={productReviewCategories}
            initialData={{
              product_name: productName,
              title: '',
              content: '',
              category: 'drink_review',
              subcategory: '',
              rating: 0,
              brewery_name: '',
              tags: [],
              images: [],
              imageDescriptions: []
            }}
          />
        </div>
        
        {/* 우상단 닫기 버튼 - 맨 마지막에 렌더링 */}
        <button 
          type="button"
          className="product-modal-close-btn"
          onClick={handleCloseClick}
          aria-label="리뷰 작성 취소"
          title="닫기"
        >
          <span className="product-close-icon">×</span>
          <span className="product-close-text">닫기</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ProductReviewModal;