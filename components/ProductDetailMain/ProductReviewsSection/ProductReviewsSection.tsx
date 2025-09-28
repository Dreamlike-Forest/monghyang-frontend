'use client';

import React, { useState, useEffect } from 'react';
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
  // 커뮤니티에서 해당 상품에 대한 리뷰만 가져오기
  const productReviews = getProductReviews(productName);
  
  // Props로 받은 리뷰가 있으면 사용, 없으면 커뮤니티에서 가져온 리뷰 사용
  const reviews = propReviews || productReviews;
  
  const [selectedReview, setSelectedReview] = useState<Post | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localReviews, setLocalReviews] = useState<Post[]>(reviews); // 로컬 상태로 리뷰 관리
  const reviewsPerPage = 3; // 페이지당 리뷰 개수

  // reviews가 변경되면 localReviews 업데이트
  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  // 주기적으로 커뮤니티에서 최신 리뷰 가져오기
  useEffect(() => {
    const updateReviews = () => {
      const latestReviews = getProductReviews(productName);
      setLocalReviews(latestReviews);
    };

    // 컴포넌트 마운트 시 한 번 실행
    updateReviews();
    
    // 5초마다 업데이트 (실제로는 이벤트 기반으로 처리하는 것이 좋음)
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

  // PostCard.css의 rating-star 클래스 사용
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

  // 리뷰 클릭 핸들러 - 로그인 확인 추가
  const handleReviewClick = (review: Post) => {
    console.log('상품 리뷰 읽기 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '리뷰 읽기 기능',
      () => {
        console.log('리뷰 읽기 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('상품 리뷰 읽기 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('상품 리뷰 읽기 진행:', review.title);
    setSelectedReview(review);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  const handleLike = (postId: number) => {
    console.log('좋아요:', postId);
    
    // 로컬 상태 업데이트
    setLocalReviews(prev => 
      prev.map(review => 
        review.post_id === postId 
          ? { ...review, like_count: review.like_count + 1 }
          : review
      )
    );
    
    // 커뮤니티 전역 상태 업데이트
    updateCommunityReview(postId, { like_count: localReviews.find(r => r.post_id === postId)!.like_count + 1 });
  };

  const handleComment = (postId: number, comment: string) => {
    console.log('댓글 작성:', postId, comment);
    
    // 로컬 상태 업데이트
    setLocalReviews(prev => 
      prev.map(review => 
        review.post_id === postId 
          ? { ...review, comment_count: review.comment_count + 1 }
          : review
      )
    );
    
    // 커뮤니티 전역 상태 업데이트
    updateCommunityReview(postId, { comment_count: localReviews.find(r => r.post_id === postId)!.comment_count + 1 });
  };

  // 리뷰 작성 핸들러 - 로그인 확인 추가
  const handleWriteReview = () => {
    console.log('상품 리뷰 작성 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '리뷰 작성 기능',
      () => {
        console.log('리뷰 작성 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('상품 리뷰 작성 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('상품 리뷰 작성 진행:', { productName, productId });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: WritePostData) => {
    try {
      console.log('상품 리뷰 제출:', reviewData);
      
      // 커뮤니티 전역 상태에 새 리뷰 추가
      const newReview = addCommunityReview(reviewData);
      
      // 로컬 상태에 새 리뷰 추가
      setLocalReviews(prev => [newReview, ...prev]);
      
      alert('리뷰가 성공적으로 작성되었습니다!');
      setIsReviewModalOpen(false);
      
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseReviewModal = () => {
    console.log('모달 닫기');
    setIsReviewModalOpen(false);
  };

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
        {/* 섹션 헤더 - hideTitle이 false일 때만 제목 표시 (버튼 없음) */}
        {!hideTitle && (
          <div className="product-reviews-section-header">
            <h2 className="product-reviews-section-title">술 리뷰</h2>
          </div>
        )}

        {/* 빈 상태 */}
        <div className="product-reviews-empty">
          <div className="product-empty-icon">🍶</div>
          <h3 className="product-empty-title">술 리뷰가 존재하지 않습니다</h3>
          <p className="product-empty-description">
            아직 이 상품에 대한 리뷰가 없습니다.<br />
            첫 번째 리뷰를 작성해보세요!
          </p>
          {/* 리뷰 작성 버튼 - 로그인 확인 포함 */}
          <button 
            className="product-write-review-btn" 
            onClick={handleWriteReview}
            type="button"
          >
            📝 리뷰 작성하기
          </button>
        </div>

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
  }

  const averageRating = localReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / localReviews.length;
  const totalLikes = localReviews.reduce((sum, review) => sum + review.like_count, 0);
  const totalViews = localReviews.reduce((sum, review) => sum + review.view_count, 0);

  // 페이지네이션 계산
  const totalPages = Math.ceil(localReviews.length / reviewsPerPage);
  const currentReviews = localReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 리뷰 섹션 상단으로 부드럽게 스크롤
    const reviewSection = document.querySelector('.product-reviews-list');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="product-reviews-section">
      {/* 섹션 헤더 - hideTitle이 false일 때만 제목 표시 (버튼 제거) */}
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

      {/* 리뷰 목록 - PostCard 클래스명을 정확히 사용 */}
      <div className="product-reviews-list">
        {currentReviews.map((review) => (
          <div 
            key={review.post_id}
            className="post-card-grid"  // PostCard CSS 클래스 사용
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
            {/* 썸네일 이미지 - PostCard와 동일한 구조 */}
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

            {/* 리뷰 내용 - PostCard와 동일한 구조 */}
            <div className="post-content-section">
              <div className="post-header">
                <span className="post-category category-drink">
                  술 리뷰
                </span>
              </div>

              <h3 className="post-title">{review.title}</h3>

              {/* 별점 표시 - PostCard의 rating-star 클래스 사용 */}
              {review.rating && (
                <div className="post-rating">
                  <div className="rating-stars">
                    {renderRating(review.rating)}
                  </div>
                  <span className="rating-score">{review.rating.toFixed(1)}</span>
                </div>
              )}

              {/* 내용 미리보기 */}
              <div className="post-content-preview">
                {truncateContent(review.content, 80)}
              </div>

              {/* 메타 정보 */}
              <div className="post-meta">
                <span className="post-author">{review.author}</span>
                <span className="post-date">{formatDate(review.created_at)}</span>
              </div>

              {/* 추가 정보 */}
              {review.product_name && (
                <div className="post-extra-info">
                  <span>🍶 {review.product_name}</span>
                </div>
              )}

              {/* 통계 */}
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

              {/* 태그 */}
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

      {/* 페이지네이션 - 리뷰가 3개 이상일 때만 표시 */}
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

      {/* 하단 리뷰 작성 버튼 - "더 많은 리뷰 보기" 버튼 제거됨 */}
      <div className="product-reviews-actions">
        {/* 리뷰 작성 버튼 - 로그인 확인 포함 */}
        <button 
          className="product-write-review-bottom-btn" 
          onClick={handleWriteReview}
          type="button"
        >
          ✏️ 리뷰 작성하기
        </button>
      </div>

      {/* PostDetail 모달 - 커뮤니티와 동일한 컴포넌트 사용 */}
      {selectedReview && (
        <PostDetail
          post={selectedReview}
          onClose={handleCloseModal}
          onLike={handleLike}
          onComment={handleComment}
          isOpen={!!selectedReview}
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