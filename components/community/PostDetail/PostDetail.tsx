'use client';

import { useState, useEffect, useRef } from 'react';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import { Post } from '../../../types/community';
import './PostDetail.css';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onLike?: (postId: number) => void;
  onComment?: (postId: number, comment: string) => void;
  isOpen: boolean;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onClose,
  onLike,
  onComment,
  isOpen
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null); // 댓글 입력 필드 ref 추가

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (onLike) {
      onLike(post.post_id);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    
    try {
      if (onComment) {
        await onComment(post.post_id, comment.trim());
      }
      setComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      // 폴백: 클립보드 복사 시도
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (clipboardError) {
        console.error('클립보드 복사 실패:', clipboardError);
        alert('공유 기능을 사용할 수 없습니다.');
      }
    }
  };

  // 댓글 입력 필드로 포커스 이동
  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'brewery_review': return '양조장 후기';
      case 'drink_review': return '상품 후기';
      case 'free': return '자유 게시판';
      case 'notice': return '공지사항';
      default: return category;
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="post-detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="post-detail-container">
        {/* 헤더 */}
        <div className="post-detail-header">
          <div className="post-detail-meta">
            <div className="post-detail-category">
              {getCategoryText(post.category)}
            </div>
            <div className="post-detail-date">
              {formatDate(post.created_at)}
            </div>
          </div>
          <button
            className="post-detail-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 캐러셀 */}
        {post.images && post.images.length > 0 && (
          <div className="post-detail-carousel">
            <ImageCarousel
              images={post.images}
              mode="detail"
              objectFit="contain"
              showCounter={true}
              showIndicators={true}
              showNavigation={true}
            />
          </div>
        )}

        {/* 내용 */}
        <div className="post-detail-content">
          {/* 작성자 정보 */}
          <div className="post-detail-author">
            <div className="author-info">
              <div className="author-name">{post.author}</div>
              <div className="author-meta">
                <span className="view-count">조회 {post.view_count}</span>
              </div>
            </div>
          </div>

          {/* 제목 */}
          <h1 className="post-detail-title">{post.title}</h1>

          {/* 평점 (리뷰 게시글인 경우) */}
          {(post.category === 'brewery_review' || post.category === 'drink_review') && post.rating && (
            <div className="post-detail-rating">
              {renderStarRating(post.rating)}
              <span className="rating-text">({post.rating}/5)</span>
            </div>
          )}

          {/* 관련 업체/상품 정보 */}
          {(post.brewery_name || post.product_name) && (
            <div className="post-detail-info">
              {post.brewery_name && (
                <div className="info-item">
                  <span className="info-icon">🏭</span>
                  <span>{post.brewery_name}</span>
                </div>
              )}
              {post.product_name && (
                <div className="info-item">
                  <span className="info-icon">🍶</span>
                  <span>{post.product_name}</span>
                </div>
              )}
            </div>
          )}

          {/* 게시글 내용 */}
          <div className="post-detail-text">
            {post.content}
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-detail-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="post-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 댓글 섹션 */}
          <div className="post-comments">
            <h3 className="comments-title">댓글 {post.comment_count}개</h3>
            
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <input
                ref={commentInputRef} // ref 추가
                type="text"
                className="comment-input"
                placeholder="댓글을 입력하세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                className="comment-submit"
                disabled={!comment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? '작성 중...' : '게시'}
              </button>
            </form>

            {/* TODO: 댓글 목록 컴포넌트 추가 */}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="post-detail-actions">
          <div className="post-stats">
            <div className="post-stats-left">
              <div className="stat-item">
                <span className="stat-icon">👁</span>
                <span className="stat-number">{post.view_count.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👍</span>
                <span className={`stat-number ${likeCount > 5 ? 'highlight' : ''}`}>
                  {likeCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span className={`stat-number ${post.comment_count > 3 ? 'highlight' : ''}`}>
                  {post.comment_count}
                </span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className={`action-button like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label="좋아요"
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              좋아요
            </button>
            <button 
              className="action-button comment-button"
              onClick={focusCommentInput} // 수정된 부분: ref를 사용한 포커스
              aria-label="댓글 작성"
            >
              <span>💬</span>
              댓글
            </button>
            <button 
              className="action-button share-button"
              onClick={handleShare}
              aria-label="공유"
            >
              <span>📤</span>
              공유
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;