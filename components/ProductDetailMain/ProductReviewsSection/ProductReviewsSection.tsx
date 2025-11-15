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
  const [reviews, setReviews] = useState<Post[]>(propReviews || productReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Post | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  // Props나 커뮤니티 데이터가 변경되면 리뷰 업데이트
  useEffect(() => {
    if (propReviews) {
      setReviews(propReviews);
    } else {
      const updatedReviews = getProductReviews(productName);
      setReviews(updatedReviews);
    }
  }, [productName, propReviews]);

  // 리뷰 통계 계산
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
    : 0;

  // 페이지네이션
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewClick = (review: Post) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const handleWriteReview = () => {
    const canProceed = checkAuthAndPrompt(
      '리뷰 작성',
      () => {
        console.log('로그인 페이지로 이동');
      },
      () => {
        console.log('리뷰 작성 취소됨');
      }
    );

    if (!canProceed) {
      return;
    }

    setIsWriteModalOpen(true);
  };

  const handleCloseWriteModal = () => {
    setIsWriteModalOpen(false);
  };

  const handleReviewSubmit = async (reviewData: WritePostData) => {
    try {
      console.log('상품 리뷰 제출:', reviewData);
      await addCommunityReview(reviewData);

      const updatedReviews = getProductReviews(productName);
      setReviews(updatedReviews);

      alert('리뷰가 성공적으로 작성되었습니다!');
      setIsWriteModalOpen(false);
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      throw error;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`product-rating-star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  // ⭐ 이미지 URL 가져오기 헬퍼 함수 - ERD 구조에 맞게 수정
  const getImageUrl = (image: PostImage): string => {
    // ERD에 따르면 image_key 필드를 사용
    return image.image_key || '';
  };

  return (
    <div className="product-reviews-section">
      {/* 헤더 - hideTitle이 false일 때만 표시 */}
      {!hideTitle && (
        <div className="product-reviews-section-header">
          <h2 className="product-reviews-section-title">
            {productName} 리뷰
          </h2>
        </div>
      )}

      {/* 리뷰 통계 */}
      {totalReviews > 0 && (
        <div className="product-reviews-stats">
          <div className="product-stats-header">
            <h3 className="product-stats-title">리뷰 통계</h3>
            <span className="product-stats-count">총 {totalReviews}개</span>
          </div>
          <div className="product-stats-content">
            <div className="product-stat-item">
              <div className="product-stat-rating">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="product-stat-value">{averageRating.toFixed(1)}</span>
              <span className="product-stat-label">평균 평점</span>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      {currentReviews.length > 0 ? (
        <>
          <div className="product-reviews-list">
            {currentReviews.map((review) => (
              <div key={review.post_id} onClick={() => handleReviewClick(review)}>
                {/* PostCard 컴포넌트 재사용 */}
                <div className="post-card-grid">
                  {/* 썸네일 섹션 */}
                  <div className="post-thumbnail-section">
                    {review.images && review.images.length > 0 ? (
                      <>
                        <img
                          src={getImageUrl(review.images[0])}
                          alt={review.title}
                          className="post-thumbnail-image"
                        />
                        {review.images.length > 1 && (
                          <div className="image-count-overlay">
                            <span className="camera-icon">📷</span>
                            <span>{review.images.length}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="post-thumbnail-placeholder">
                        <div className="thumbnail-icon">🍶</div>
                        <div className="thumbnail-text">이미지 없음</div>
                      </div>
                    )}
                  </div>

                  {/* 컨텐츠 섹션 */}
                  <div className="post-content-section">
                    <div className="post-header">
                      <h3 className="post-title">{review.title}</h3>
                      {review.rating && (
                        <div className="post-rating">
                          {renderStars(review.rating)}
                        </div>
                      )}
                    </div>

                    <p className="post-content-preview">
                      {review.content.length > 100
                        ? `${review.content.substring(0, 100)}...`
                        : review.content}
                    </p>

                    <div className="post-meta">
                      <span className="post-author">{review.author}</span>
                      <span className="post-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <div className="post-stats">
                        <span>👁️ {review.view_count || 0}</span>
                        <span>❤️ {review.like_count || 0}</span>
                        <span>💬 {review.comment_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="product-reviews-pagination">
              <button
                className="product-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              <div className="product-pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`product-pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="product-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="product-reviews-empty">
          <div className="product-empty-icon">🍶</div>
          <h3 className="product-empty-title">아직 리뷰가 없습니다</h3>
          <p className="product-empty-description">
            첫 번째 리뷰를 작성하고 다른 사용자들과 경험을 공유해보세요!
          </p>
          <button
            className="product-write-review-btn"
            onClick={handleWriteReview}
          >
            ✏️ 첫 리뷰 작성하기
          </button>
        </div>
      )}

      {/* 리뷰 작성 버튼 (리뷰가 있을 때) */}
      {currentReviews.length > 0 && (
        <div className="product-reviews-actions">
          <button
            className="product-write-review-bottom-btn"
            onClick={handleWriteReview}
          >
            ✏️ 리뷰 작성하기
          </button>
        </div>
      )}

      {/* 리뷰 상세 모달 */}
      {selectedReview && (
        <PostDetail
          post={selectedReview}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* 리뷰 작성 모달 */}
      <ProductReviewModal
        isOpen={isWriteModalOpen}
        onClose={handleCloseWriteModal}
        productName={productName}
        productId={productId}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default ProductReviewsSection;