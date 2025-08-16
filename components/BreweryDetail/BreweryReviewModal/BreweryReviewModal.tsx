'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import WritePost from '../../community/WritePost/WritePost';
import { WritePostData, CategoryConfig } from '../../../types/community';
import './BreweryReviewModal.css';

interface BreweryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  breweryName: string;
  breweryId: number;
  onSubmit?: (reviewData: WritePostData) => void;
}

// 양조장 리뷰 전용 카테고리 설정
const breweryReviewCategories: CategoryConfig[] = [
  {
    id: 'brewery_review',
    name: '양조장 리뷰',
    subcategories: [
      { id: 'experience', name: '체험프로그램', count: 0 },
      { id: 'visit', name: '방문후기', count: 0 },
      { id: 'tour', name: '투어', count: 0 },
      { id: 'taste', name: '시음', count: 0 }
    ],
    hasRating: true,
    placeholder: '이 양조장에 대한 리뷰를 작성해주세요',
    allowImages: true,
    maxImages: 5
  }
];

const BreweryReviewModal: React.FC<BreweryReviewModalProps> = ({
  isOpen,
  onClose,
  breweryName,
  breweryId,
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
      // 양조장 정보를 자동으로 설정
      const reviewData: WritePostData = {
        ...data,
        category: 'brewery_review',
        brewery_name: breweryName,
        // 제목에 양조장명이 없으면 자동 추가
        title: data.title.includes(breweryName) 
          ? data.title 
          : `${breweryName} - ${data.title}`
      };

      console.log('양조장 리뷰 데이터:', reviewData);
      
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
      className={`brewery-review-modal-overlay ${isAnimating ? 'open' : ''}`}
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }} // 높은 z-index 보장
    >
      <div className={`brewery-review-modal-container ${isAnimating ? 'open' : ''}`}>
        {/* WritePost 컴포넌트 임베드 */}
        <div className="brewery-review-modal-content">
          <WritePost
            onSubmit={handleReviewSubmit}
            onCancel={handleCancel}
            initialCategory="brewery_review"
            categories={breweryReviewCategories}
          />
        </div>
        
        {/* 우상단 닫기 버튼 - 맨 마지막에 렌더링 */}
        <button 
          type="button"
          className="brewery-modal-close-btn"
          onClick={handleCloseClick}
          aria-label="리뷰 작성 취소"
          title="닫기"
        >
          <span className="brewery-close-icon">×</span>
          <span className="brewery-close-text">닫기</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default BreweryReviewModal;