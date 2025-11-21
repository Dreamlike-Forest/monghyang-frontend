'use client';

import React, { useState } from 'react';
import BreweryReviewModal from '../BreweryReviewModal/BreweryReviewModal';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
import './BreweryReviewsSection.css';

interface BreweryReviewsSectionProps {
  breweryName: string;
  breweryId: number;
  hideTitle?: boolean;
}

const BreweryReviewsSection: React.FC<BreweryReviewsSectionProps> = ({ 
  breweryName, 
  breweryId,
  hideTitle = false
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  // 임시 리뷰 데이터 (실제로는 API에서 가져올 데이터)
  const mockReviews = [
    // 실제 구현 시 API 호출로 대체
  ];

  const totalReviews = mockReviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  // 리뷰 작성 버튼 핸들러 - 로그인 확인 포함
  const handleWriteReview = () => {
    console.log('리뷰 작성 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '리뷰 작성 기능',
      () => {
        console.log('리뷰 작성 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('리뷰 작성 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('리뷰 작성 모달 열기');
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 스크롤을 리뷰 섹션 상단으로 이동
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 페이지네이션 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="brewery-reviews-section">
      {/* 섹션 헤더 - hideTitle이 false일 때만 표시 */}
      {!hideTitle && (
        <div className="brewery-reviews-section-header">
          <h2 className="brewery-reviews-section-title">체험 리뷰</h2>
          <button 
            className="brewery-write-review-header-btn"
            onClick={handleWriteReview}
          >
            ✍️ 리뷰 작성하기
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {false && (
        <div className="brewery-reviews-loading">
          <div className="brewery-loading-spinner"></div>
          <span className="brewery-loading-text">리뷰를 불러오는 중...</span>
        </div>
      )}

      {/* 리뷰가 없을 때 */}
      {totalReviews === 0 && (
        <div className="brewery-reviews-empty">
          <div className="brewery-empty-icon">📝</div>
          <h3 className="brewery-empty-title">
            아직 작성된 리뷰가 없습니다
          </h3>
          <p className="brewery-empty-description">
            {breweryName}의 첫 번째 리뷰를 작성해보세요!<br />
            여러분의 소중한 경험을 다른 분들과 공유해주세요.
          </p>
          <button 
            className="brewery-write-review-btn"
            onClick={handleWriteReview}
          >
            ✍️ 첫 리뷰 작성하기
          </button>
        </div>
      )}

      {/* 리뷰가 있을 때 */}
      {totalReviews > 0 && (
        <>
          {/* 리뷰 통계 */}
          <div className="brewery-reviews-stats">
            <div className="brewery-stats-header">
              <h3 className="brewery-stats-title">리뷰 통계</h3>
              <span className="brewery-stats-count">총 {totalReviews}개</span>
            </div>
            <div className="brewery-stats-content">
              <div className="brewery-stat-item">
                <div className="brewery-stat-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`brewery-rating-star ${star <= 4 ? 'filled' : 'empty'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="brewery-stat-value">4.5</span>
                <span className="brewery-stat-label">평균 평점</span>
              </div>
              
              <div className="brewery-stat-item">
                <span className="brewery-stat-value">{totalReviews}</span>
                <span className="brewery-stat-label">전체 리뷰</span>
              </div>
              
              <div className="brewery-stat-item">
                <span className="brewery-stat-value">95%</span>
                <span className="brewery-stat-label">추천율</span>
              </div>
            </div>
          </div>

          {/* 리뷰 목록 (PostCard 그리드) */}
          <div className="brewery-reviews-list">
            {/* 실제로는 PostCard 컴포넌트를 사용하여 리뷰 표시 */}
            {/* mockReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage) */}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="brewery-reviews-pagination">
              <button 
                className="brewery-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                ‹
              </button>
              
              <div className="brewery-pagination-numbers">
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    className={`brewery-pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`${page} 페이지로 이동`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="brewery-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >
                ›
              </button>
            </div>
          )}

          {/* 하단 리뷰 작성 버튼 */}
          <div className="brewery-reviews-actions">
            <button 
              className="brewery-write-review-bottom-btn"
              onClick={handleWriteReview}
            >
              ✍️ 리뷰 작성하기
            </button>
          </div>
        </>
      )}

      {/* 리뷰 작성 모달 */}
      <BreweryReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReviewModal}
        breweryName={breweryName}
        breweryId={breweryId}
      />
    </div>
  );
};

export default BreweryReviewsSection;