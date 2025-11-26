'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PostDetail from '../../community/PostDetail/PostDetail';
import ProductReviewModal from '../ProductReviewModal/ProductReviewModal';
import { WritePostData, Post, PostImage } from '../../../types/community'; 
import { checkAuthAndPrompt } from '../../../utils/authUtils'; 
import '../../community/PostCard/PostCard.css';
import './ProductReviewsSection.css';

interface ProductReviewsSectionProps {
  productName: string;
  productId: number;
  reviews?: Post[]; 
  hideTitle?: boolean; 
}

// Community.tsx에서 전역 함수들 import
import { getProductReviews, addCommunityReview, updateCommunityReview } from '../../community/Community';

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ 
  productName, 
  productId, 
  reviews: propReviews,
  hideTitle = false
}) => {
  // useMemo를 사용하여 배열 참조값을 고정 (무한 루프 방지)
  const productReviews = useMemo(() => {
    return getProductReviews(productName);
  }, [productName]);
  
  // Props로 받은 리뷰가 있으면 사용, 없으면 커뮤니티에서 가져온 리뷰 사용
  const reviews = useMemo(() => {
    return propReviews || productReviews;
  }, [propReviews, productReviews]);
  
  const [selectedReview, setSelectedReview] = useState<Post | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localReviews, setLocalReviews] = useState<Post[]>(reviews);
  const reviewsPerPage = 3;

  // reviews가 변경되면 localReviews 업데이트
  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  // 주기적으로 커뮤니티에서 최신 리뷰 가져오기
  useEffect(() => {
    const updateReviews = () => {
      const latestReviews = getProductReviews(productName);
      setLocalReviews(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(latestReviews)) {
          return latestReviews;
        }
        return prev;
      });
    };

    updateReviews();
    const interval = setInterval(updateReviews, 5000);
    
    return () => clearInterval(interval);
  }, [productName]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 별점 렌더링
  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`rating-star ${i < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ));
  };

  const truncateContent = (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  // 리뷰 클릭 핸들러
  const handleReviewClick = (review: Post) => {
    const canProceed = checkAuthAndPrompt(
      '리뷰 읽기 기능',
      () => console.log('리뷰 읽기 기능 - 로그인 페이지로 이동'),
      () => console.log('상품 리뷰 읽기 취소됨')
    );

    if (!canProceed) return;

    setSelectedReview(review);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  // PostDetail 컴포넌트 타입에 맞게 수정
  const handleLike = async (postId: number, isLiked: boolean): Promise<boolean> => {
    try {
      const targetReview = localReviews.find(r => r.post_id === postId);
      if (!targetReview) return false;

      const newLikeCount = isLiked 
        ? targetReview.like_count - 1 
        : targetReview.like_count + 1;

      // 로컬 상태 업데이트
      setLocalReviews(prev => 
        prev.map(review => 
          review.post_id === postId 
            ? { ...review, like_count: newLikeCount }
            : review
        )
      );
      
      // 커뮤니티 전역 상태 업데이트
      updateCommunityReview(postId, { like_count: newLikeCount });

      return true;
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      return false;
    }
  };

  // PostDetail 컴포넌트 타입에 맞게 수정
  const handleComment = async (postId: number, content: string): Promise<boolean> => {
    try {
      const targetReview = localReviews.find(r => r.post_id === postId);
      if (!targetReview) return false;

      // 로컬 상태 업데이트
      setLocalReviews(prev => 
        prev.map(review => 
          review.post_id === postId 
            ? { ...review, comment_count: review.comment_count + 1 }
            : review
        )
      );
      
      // 커뮤니티 전역 상태 업데이트
      updateCommunityReview(postId, { 
        comment_count: targetReview.comment_count + 1 
      });

      return true;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      return false;
    }
  };

  // 리뷰 작성 핸들러
  const handleWriteReview = () => {
    const canProceed = checkAuthAndPrompt(
      '리뷰 작성 기능',
      () => console.log('리뷰 작성 기능 - 로그인 페이지로 이동'),
      () => console.log('상품 리뷰 작성 취소됨')
    );

    if (!canProceed) return;

    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: WritePostData) => {
    try {
      const result = addCommunityReview(reviewData);
      const newReview = result instanceof Promise ? await result : result;
      
      setLocalReviews(prev => [newReview, ...prev]);
      
      alert('리뷰가 성공적으로 작성되었습니다!');
      setIsReviewModalOpen(false);
      
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(localReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = localReviews.slice(startIndex, startIndex + reviewsPerPage);

  // 통계 계산
  const averageRating = localReviews.length > 0
    ? localReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / localReviews.length
    : 0;
  const totalLikes = localReviews.reduce((sum, r) => sum + r.like_count, 0);
  const totalViews = localReviews.reduce((sum, r) => sum + r.view_count, 0);

  if (isLoading) {
    return (
      <div className="product-reviews-loading">
        <div className="product-loading-spinner"></div>
        <span className="product-loading-text">리뷰를 불러오는 중...</span>
      </div>
    );
  }

  if (localReviews.length === 0) {
    return (
      <div className="product-reviews-section">
        {!hideTitle && (
          <div className="product-reviews-section-header">
            <h2 className="product-reviews-section-title">술 리뷰</h2>
          </div>
        )}

        <div className="product-reviews-empty">
          <div className="product-empty-icon">🍶</div>
          <h3 className="product-empty-title">술 리뷰가 존재하지 않습니다</h3>
          <p className="product-empty-description">
            아직 이 상품에 대한 리뷰가 없습니다.<br />
            첫 번째 리뷰를 작성해보세요!
          </p>
          <button 
            className="product-write-review-btn" 
            onClick={handleWriteReview}
            type="button"
          >
            ✏️ 첫 리뷰 작성하기
          </button>
        </div>

        {isReviewModalOpen && (
          <ProductReviewModal
            isOpen={isReviewModalOpen}
            onClose={handleCloseReviewModal}
            productName={productName}
            productId={productId}
            onSubmit={handleReviewSubmit}
          />
        )}
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const reviewSection = document.querySelector('.product-reviews-list');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="product-reviews-section">
      {!hideTitle && (
        <div className="product-reviews-section-header">
          <h2 className="product-reviews-section-title">술 리뷰</h2>
        </div>
      )}

      {/* 리뷰 통계 */}
      <div className="product-reviews-stats">
        <div className="product-stats-header">
          <h3 className="product-stats-title">리뷰 요약</h3>
          <span className="product-stats-count">총 {localReviews.length}개의 리뷰</span>
        </div>
        
        <div className="product-stats-content">
          <div className="product-stat-item">
            <div className="product-stat-value">{averageRating.toFixed(1)}</div>
            <div className="product-stat-rating">
              {renderRating(Math.round(averageRating))}
            </div>
            <div className="product-stat-label">평균 평점</div>
          </div>
          
          <div className="product-stat-item">
            <div className="product-stat-value">{totalLikes}</div>
            <div className="product-stat-label">총 좋아요</div>
          </div>
          
          <div className="product-stat-item">
            <div className="product-stat-value">{totalViews}</div>
            <div className="product-stat-label">총 조회수</div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="product-reviews-list">
        {currentReviews.map((review) => (
          <div 
            key={review.post_id}
            className="post-card-grid"
            onClick={() => handleReviewClick(review)}
            tabIndex={0}
            role="button"
            aria-label={`${review.title} 리뷰 상세보기`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleReviewClick(review);
              }
            }}
          >
            {/* 썸네일 이미지 */}
            <div className="post-thumbnail-section">
              {review.images && review.images.length > 0 ? (
                <div className="thumbnail-wrapper">
                  <img 
                    src={review.images[0].image_url}
                    alt={review.images[0].alt_text}
                    className="post-thumbnail-image"
                    loading="lazy"
                  />
                  {review.images.length > 1 && (
                    <div className="image-count-overlay">
                      <span className="camera-icon">📷</span>
                      <span>{review.images.length}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="post-thumbnail-placeholder">
                  <div className="thumbnail-icon">🍶</div>
                  <div className="thumbnail-text">리뷰</div>
                </div>
              )}
            </div>

            {/* 리뷰 내용 */}
            <div className="post-content-section">
              <div className="post-header">
                <span className="post-category category-drink">
                  술 리뷰
                </span>
              </div>

              <h3 className="post-title">{review.title}</h3>

              {review.rating && (
                <div className="post-rating">
                  <div className="rating-stars">
                    {renderRating(review.rating)}
                  </div>
                  <span className="rating-score">{review.rating.toFixed(1)}</span>
                </div>
              )}

              <div className="post-content-preview">
                {truncateContent(review.content, 80)}
              </div>

              <div className="post-meta">
                <span className="post-author">{review.author}</span>
                <span className="post-date">{formatDate(review.created_at)}</span>
              </div>

              {review.product_name && (
                <div className="post-extra-info">
                  <span>🍶 {review.product_name}</span>
                </div>
              )}

              <div className="post-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁</span>
                  <span className={`stat-number ${review.view_count > 100 ? 'highlight' : ''}`}>
                    {review.view_count > 1000 ? `${(review.view_count / 1000).toFixed(1)}k` : review.view_count}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👍</span>
                  <span className={`stat-number ${review.like_count > 5 ? 'highlight' : ''}`}>
                    {review.like_count}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span className={`stat-number ${review.comment_count > 3 ? 'highlight' : ''}`}>
                    {review.comment_count}
                  </span>
                </div>
              </div>

              {review.tags && review.tags.length > 0 && (
                <div className="post-tags">
                  {review.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="post-tag">
                      #{tag}
                    </span>
                  ))}
                  {review.tags.length > 3 && (
                    <span className="post-tag">+{review.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="product-reviews-pagination">
          <button
            className="product-pagination-btn product-pagination-prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            type="button"
            aria-label="이전 페이지"
          >
            ◀
          </button>
          
          <div className="product-pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`product-pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                type="button"
                aria-label={`${page}페이지로 이동`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="product-pagination-btn product-pagination-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            type="button"
            aria-label="다음 페이지"
          >
            ▶
          </button>
        </div>
      )}

      {/* 하단 리뷰 작성 버튼 */}
      <div className="product-reviews-actions">
        <button 
          className="product-write-review-bottom-btn" 
          onClick={handleWriteReview}
          type="button"
        >
          ✏️ 리뷰 작성하기
        </button>
      </div>

      {/* PostDetail 모달 */}
      {selectedReview && (
        <PostDetail
          post={selectedReview}
          onClose={handleCloseModal}
          onLike={handleLike}
          onComment={handleComment}
          isOpen={!!selectedReview}
          comments={[]}
        />
      )}

      {/* 리뷰 작성 모달 */}
      {isReviewModalOpen && (
        <ProductReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          productName={productName}
          productId={productId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default ProductReviewsSection;