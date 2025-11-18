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

// Community.tsx의 globalMockPosts에 직접 접근하는 방식으로 변경
const getBreweryReviews = (breweryName: string): Post[] => {
  try {
    // Community.tsx의 mock 데이터를 직접 참조
    // 실제 구현에서는 API를 통해 데이터를 가져옵니다
    const mockPosts: Post[] = [
      {
        post_id: 1,
        title: '전주 양조장 투어 추천',
        content: '전주에서 전통주 양조장 투어를 다녀왔는데 정말 좋았어요. 전통 누룩 만들기 체험도 할 수 있었습니다. 특히 전주의 깨끗한 물로 만든 술의 맛이 일품이었어요!',
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
            image_id: 1,
            image_url: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop',
            image_order: 1,
            alt_text: '전주 양조장 외부 전경'
          },
          {
            image_id: 2,
            image_url: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=400&h=300&fit=crop',
            image_order: 2,
            alt_text: '전통주 시음 모습'
          },
          {
            image_id: 3,
            image_url: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=400&h=300&fit=crop',
            image_order: 3,
            alt_text: '누룩 만들기 체험'
          }
        ]
      },
      {
        post_id: 5,
        title: '안성 양조장 체험 프로그램 후기',
        content: '지난 주말에 안성 양조장 체험 프로그램에 참여했는데 정말 유익한 시간이었어요. 전통 누룩 만들기부터 시작해서 발효 과정까지 직접 체험해볼 수 있었습니다. 직원분들도 친절하고 전문적이었어요. 아이들도 흥미롭게 참여할 수 있어서 가족 나들이로 추천합니다.',
        author: '체험러',
        author_id: 4,
        category: 'brewery_review',
        created_at: '2025-01-11T14:15:00Z',
        view_count: 145,
        like_count: 7,
        comment_count: 4,
        rating: 4,
        brewery_name: '안성 양조장',
        tags: ['안성', '체험프로그램', '양조장', '가족여행'],
        images: [
          {
            image_id: 6,
            image_url: 'https://images.unsplash.com/photo-1544024994-f6e9e3f1b536?w=400&h=300&fit=crop',
            image_order: 1,
            alt_text: '안성 양조장 체험 프로그램'
          }
        ]
      }
    ];

    console.log('양조장 리뷰 필터링:', breweryName);
    console.log('전체 mock 데이터:', mockPosts);

    const filteredReviews = mockPosts.filter((review) => {
      const isBreweryReview = review.category === 'brewery_review';
      const nameMatches = review.brewery_name === breweryName;
      
      console.log(`리뷰 "${review.title}": category=${review.category}, brewery_name="${review.brewery_name}", 매칭=${isBreweryReview && nameMatches}`);
      
      return isBreweryReview && nameMatches;
    });
    
    console.log('필터링된 양조장 리뷰 개수:', filteredReviews.length);
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
    console.log('BreweryReviewsSection 마운트됨:', breweryName);
    const loadReviews = () => {
      if (propReviews) {
        console.log('Props로 받은 리뷰 사용:', propReviews.length);
        setLocalReviews(propReviews);
      } else {
        console.log('커뮤니티에서 리뷰 로드 시작');
        const breweryReviews = getBreweryReviews(breweryName);
        console.log('로드된 리뷰 개수:', breweryReviews.length);
        setLocalReviews(breweryReviews);
      }
    };

    loadReviews();
    
    // 주기적 업데이트 (개발 중에만 사용)
    const interval = setInterval(loadReviews, 10000); // 10초로 늘림
    return () => clearInterval(interval);
  }, [breweryName, propReviews]);

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
    console.log('양조장 리뷰 읽기 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '리뷰 읽기 기능',
      () => {
        console.log('리뷰 읽기 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('양조장 리뷰 읽기 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('양조장 리뷰 읽기 진행:', review.title);
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
  };

  // 리뷰 작성 핸들러 - 로그인 확인 추가
  const handleWriteReview = () => {
    console.log('양조장 리뷰 작성 버튼 클릭 - 로그인 상태 확인');
    
    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '리뷰 작성 기능',
      () => {
        console.log('리뷰 작성 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('양조장 리뷰 작성 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('양조장 리뷰 작성 진행:', { breweryName, breweryId });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: WritePostData) => {
    try {
      console.log('양조장 리뷰 제출:', reviewData);
      
      // 새 리뷰 생성 (실제로는 API 호출)
      const newReview: Post = {
        post_id: Date.now(),
        title: reviewData.title,
        content: reviewData.content,
        author: '현재사용자',
        author_id: 999,
        category: reviewData.category,
        created_at: new Date().toISOString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        rating: reviewData.rating,
        brewery_name: reviewData.brewery_name,
        tags: reviewData.tags,
        images: reviewData.images.map((file, index) => ({
          image_id: Date.now() + index,
          image_url: URL.createObjectURL(file),
          image_order: index + 1,
          alt_text: reviewData.imageDescriptions[index] || `${reviewData.title} 이미지 ${index + 1}`
        }))
      };
      
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
      <div className="brewery-reviews-loading">
        <div className="brewery-loading-spinner"></div>
        <span className="brewery-loading-text">리뷰를 불러오는 중...</span>
      </div>
    );
  }

  if (localReviews.length === 0) {
    return (
      <div className="brewery-reviews-section">
        {/* 섹션 헤더 - hideTitle이 false일 때만 제목 표시 (버튼 없음) */}
        {!hideTitle && (
          <div className="brewery-reviews-section-header">
            <h2 className="brewery-reviews-section-title">체험 리뷰</h2>
          </div>
        )}

        {/* 빈 상태 */}
        <div className="brewery-reviews-empty">
          <div className="brewery-empty-icon">🏭</div>
          <h3 className="brewery-empty-title">체험 리뷰가 존재하지 않습니다</h3>
          <p className="brewery-empty-description">
            아직 이 양조장에 대한 체험 리뷰가 없습니다.<br />
            첫 번째 리뷰를 작성해보세요!
          </p>
          {/* 리뷰 작성 버튼 - 로그인 확인 포함 */}
          <button 
            className="brewery-write-review-btn" 
            onClick={handleWriteReview}
            type="button"
          >
            📝 리뷰 작성하기
          </button>
        </div>

        {/* 리뷰 작성 모달 */}
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
    const reviewSection = document.querySelector('.brewery-reviews-list');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="brewery-reviews-section">
      {/* 섹션 헤더 - hideTitle이 false일 때만 제목 표시 (버튼 제거) */}
      {!hideTitle && (
        <div className="brewery-reviews-section-header">
          <h2 className="brewery-reviews-section-title">체험 리뷰</h2>
        </div>
      )}

      {/* 리뷰 통계 */}
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

      {/* 리뷰 목록 - PostCard 클래스명을 정확히 사용 */}
      <div className="brewery-reviews-list">
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
                  <div className="thumbnail-icon">🏭</div>
                  <div className="thumbnail-text">리뷰</div>
                </div>
              )}
            </div>

            {/* 리뷰 내용 - PostCard와 동일한 구조 */}
            <div className="post-content-section">
              <div className="post-header">
                <span className="post-category category-brewery">
                  양조장
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
              {review.brewery_name && (
                <div className="post-extra-info">
                  <span>🏭 {review.brewery_name}</span>
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
        <div className="brewery-reviews-pagination">
          <button
            className="brewery-pagination-btn brewery-pagination-prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            type="button"
            aria-label="이전 페이지"
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
                aria-label={`${page}페이지로 이동`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="brewery-pagination-btn brewery-pagination-next"
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
      <div className="brewery-reviews-actions">
        {/* 리뷰 작성 버튼 - 로그인 확인 포함 */}
        <button 
          className="brewery-write-review-bottom-btn" 
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