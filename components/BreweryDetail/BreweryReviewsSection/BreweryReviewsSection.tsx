'use client';

import React, { useState, useEffect } from 'react';
import PostDetail from '../../community/PostDetail/PostDetail';
import BreweryReviewModal from '../BreweryReviewModal/BreweryReviewModal';
import { WritePostData, Post, PostImage } from '../../../types/community'; 
import { checkAuthAndPrompt } from '../../../utils/authUtils'; 

// 커뮤니티 CSS 파일들 import
import '../../community/PostCard/PostCard.css';
import './BreweryReviewsSection.css';

interface BreweryReviewsSectionProps {
  breweryName: string;
  breweryId: number;
  reviews?: Post[]; 
  hideTitle?: boolean; 
}

// ⭐ ERD에 맞게 수정된 Mock 데이터
const getBreweryReviews = (breweryName: string): Post[] => {
  try {
    const mockPosts: Post[] = [
      {
        post_id: 1,
        title: '전주 양조장 투어 추천',
        content: '전주에서 전통주 양조장 투어를 다녀왔는데 정말 좋았어요. 전통 누룩 만들기 체험도 할 수 있었습니다.',
        author: '양조장탐험가',
        author_id: 1,
        category: 'brewery_review',
        created_at: '2025-01-15T10:30:00Z',
        view_count: 234,
        like_count: 15,
        comment_count: 8,
        rating: 5,
        brewery_name: '전주 양조장',
        tags: ['전주', '양조장투어', '전통주'],
        images: [
          {
            post_image_id: 1,
            post_id: 1,
            image_key: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop',
            seq: 1
          },
          {
            post_image_id: 2,
            post_id: 1,
            image_key: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=400&h=300&fit=crop',
            seq: 2
          },
          {
            post_image_id: 3,
            post_id: 1,
            image_key: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=400&h=300&fit=crop',
            seq: 3
          }
        ]
      },
      {
        post_id: 5,
        title: '안성 양조장 체험 프로그램 후기',
        content: '지난 주말에 안성 양조장 체험 프로그램에 참여했는데 정말 유익한 시간이었어요.',
        author: '체험러',
        author_id: 4,
        category: 'brewery_review',
        created_at: '2025-01-11T14:15:00Z',
        view_count: 145,
        like_count: 7,
        comment_count: 4,
        rating: 4,
        brewery_name: '안성 양조장',
        tags: ['안성', '체험프로그램', '양조장'],
        images: [
          {
            post_image_id: 6,
            post_id: 5,
            image_key: 'https://images.unsplash.com/photo-1544024994-f6e9e3f1b536?w=400&h=300&fit=crop',
            seq: 1
          }
        ]
      }
    ];

    const filteredReviews = mockPosts.filter((review) => {
      return review.category === 'brewery_review' && review.brewery_name === breweryName;
    });
    
    return filteredReviews;
  } catch (error) {
    console.error('양조장 리뷰 가져오기 실패:', error);
    return [];
  }
};

const BreweryReviewsSection: React.FC<BreweryReviewsSectionProps> = ({ 
  breweryName, 
  breweryId, 
  reviews: propReviews,
  hideTitle = false
}) => {
  const [selectedReview, setSelectedReview] = useState<Post | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localReviews, setLocalReviews] = useState<Post[]>([]); 
  const reviewsPerPage = 3;

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = () => {
      if (propReviews) {
        setLocalReviews(propReviews);
      } else {
        const breweryReviews = getBreweryReviews(breweryName);
        setLocalReviews(breweryReviews);
      }
    };

    loadReviews();
  }, [breweryName, propReviews]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}일 전`;
    }
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

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

  const handleReviewClick = (review: Post) => {
    const canProceed = checkAuthAndPrompt('리뷰 읽기 기능');
    if (!canProceed) return;
    setSelectedReview(review);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  const handleLike = (postId: number) => {
    setLocalReviews(prev => 
      prev.map(review => 
        review.post_id === postId 
          ? { ...review, like_count: review.like_count + 1 }
          : review
      )
    );
  };

  const handleComment = (postId: number, comment: string) => {
    setLocalReviews(prev => 
      prev.map(review => 
        review.post_id === postId 
          ? { ...review, comment_count: review.comment_count + 1 }
          : review
      )
    );
  };

  const handleWriteReview = () => {
    const canProceed = checkAuthAndPrompt('리뷰 작성 기능');
    if (!canProceed) return;
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleReviewSubmit = async (reviewData: WritePostData) => {
    setIsLoading(true);
    try {
      const newReview: Post = {
        post_id: Date.now(),
        title: reviewData.title,
        content: reviewData.content,
        author: '현재 사용자',
        author_id: 1,
        category: 'brewery_review',
        created_at: new Date().toISOString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        rating: reviewData.rating || 0,
        brewery_name: breweryName,
        tags: reviewData.tags,
        images: []
      };
      
      setLocalReviews(prev => [newReview, ...prev]);
      setIsReviewModalOpen(false);
      alert('리뷰가 성공적으로 작성되었습니다!');
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(localReviews.length / reviewsPerPage);
  const currentReviews = localReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // 통계 계산
  const averageRating = localReviews.length > 0
    ? localReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / localReviews.length
    : 0;
  
  const totalLikes = localReviews.reduce((sum, review) => sum + review.like_count, 0);
  const totalViews = localReviews.reduce((sum, review) => sum + review.view_count, 0);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    const reviewSection = document.querySelector('.brewery-reviews-list');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="brewery-reviews-section">
      {!hideTitle && (
        <div className="brewery-reviews-section-header">
          <h2 className="brewery-reviews-section-title">체험 리뷰</h2>
        </div>
      )}

      {localReviews.length === 0 ? (
        <div className="brewery-reviews-empty">
          <div className="brewery-empty-icon">📝</div>
          <h3 className="brewery-empty-title">아직 작성된 리뷰가 없습니다</h3>
          <p className="brewery-empty-description">
            이 양조장의 첫 번째 리뷰를 작성해보세요!
          </p>
          <button 
            className="brewery-write-review-btn" 
            onClick={handleWriteReview}
            type="button"
          >
            ✏️ 첫 리뷰 작성하기
          </button>
        </div>
      ) : (
        <>
          <div className="brewery-reviews-stats">
            <div className="brewery-stats-header">
              <h3 className="brewery-stats-title">체험 리뷰 요약</h3>
              <span className="brewery-stats-count">총 {localReviews.length}개의 리뷰</span>
            </div>
            
            <div className="brewery-stats-content">
              <div className="brewery-stat-item">
                <div className="brewery-stat-value">{averageRating.toFixed(1)}</div>
                <div className="brewery-stat-rating">
                  {renderRating(Math.round(averageRating))}
                </div>
                <div className="brewery-stat-label">평균 평점</div>
              </div>
              
              <div className="brewery-stat-item">
                <div className="brewery-stat-value">{totalLikes}</div>
                <div className="brewery-stat-label">총 좋아요</div>
              </div>
              
              <div className="brewery-stat-item">
                <div className="brewery-stat-value">{totalViews}</div>
                <div className="brewery-stat-label">총 조회수</div>
              </div>
            </div>
          </div>

          <div className="brewery-reviews-list">
            {currentReviews.map((review) => (
              <div 
                key={review.post_id}
                className="post-card-grid"
                onClick={() => handleReviewClick(review)}
                tabIndex={0}
                role="button"
                aria-label={`${review.title} 리뷰 상세보기`}
              >
                <div className="post-thumbnail-section">
                  {review.images && review.images.length > 0 ? (
                    <div className="thumbnail-wrapper">
                      <img 
                        src={review.images[0].image_key}
                        alt={`${review.title} 썸네일 - 이미지 ${review.images[0].seq}`}
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
                      <div className="thumbnail-icon">🏭</div>
                      <div className="thumbnail-text">리뷰</div>
                    </div>
                  )}
                </div>

                <div className="post-content-section">
                  <div className="post-header">
                    <span className="post-category category-brewery">양조장</span>
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

                  {review.brewery_name && (
                    <div className="post-extra-info">
                      <span>🏭 {review.brewery_name}</span>
                    </div>
                  )}

                  <div className="post-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👁</span>
                      <span className="stat-number">{review.view_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">👍</span>
                      <span className="stat-number">{review.like_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">💬</span>
                      <span className="stat-number">{review.comment_count}</span>
                    </div>
                  </div>

                  {review.tags && review.tags.length > 0 && (
                    <div className="post-tags">
                      {review.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="post-tag">#{tag}</span>
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

          {totalPages > 1 && (
            <div className="brewery-reviews-pagination">
              <button
                className="brewery-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                type="button"
              >
                ◀
              </button>
              
              <div className="brewery-pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`brewery-pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                className="brewery-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                type="button"
              >
                ▶
              </button>
            </div>
          )}

          <div className="brewery-reviews-actions">
            <button 
              className="brewery-write-review-bottom-btn" 
              onClick={handleWriteReview}
              type="button"
            >
              ✏️ 리뷰 작성하기
            </button>
          </div>
        </>
      )}

      {selectedReview && (
        <PostDetail
          post={selectedReview}
          onClose={handleCloseModal}
          onLike={handleLike}
          onComment={handleComment}
          isOpen={!!selectedReview}
        />
      )}

      {isReviewModalOpen && (
        <BreweryReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          breweryName={breweryName}
          breweryId={breweryId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default BreweryReviewsSection;