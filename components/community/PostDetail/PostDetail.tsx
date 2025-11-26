'use client';

import { useState, useEffect, useRef } from 'react';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import { Post } from '../../../types/community';
import { Comment } from '../../../utils/communityApi';
import './PostDetail.css';

interface PostDetailProps {
  post: Post;
  comments: Comment[];
  onClose: () => void;
  onLike: (postId: number, isLiked: boolean) => Promise<boolean>;
  onComment: (postId: number, content: string) => Promise<boolean>;
  isOpen: boolean;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  comments,
  onClose,
  onLike,
  onComment,
  isOpen
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLikeCount(post.like_count);
  }, [post.like_count]);

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

  const handleLike = async () => {
    if (isLikeProcessing) return;
    
    setIsLikeProcessing(true);
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      const success = await onLike(post.post_id, !newLiked);
      
      if (!success) {
        setIsLiked(!newLiked);
        setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      setIsLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    
    try {
      const success = await onComment(post.post_id, commentText.trim());
      
      if (success) {
        setCommentText('');
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
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
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (clipboardError) {
        alert('공유 기능을 사용할 수 없습니다.');
      }
    }
  };

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const organizeComments = (commentList: Comment[]) => {
    const parentComments = commentList.filter(c => !c.parentCommentId);
    const childComments = commentList.filter(c => c.parentCommentId);
    
    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parentCommentId === parent.commentId)
    }));
  };

  const organizedComments = organizeComments(comments);

  if (!isOpen) return null;

  return (
    <div
      className="post-detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="post-detail-container">
        {/* 닫기 버튼 (고정) */}
        <button
          className="post-detail-close"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        {/* 스크롤 가능한 전체 영역 */}
        <div className="post-detail-scroll">
          {/* 헤더 */}
          <div className="post-detail-header">
            <div className="post-detail-category">
              {getCategoryText(post.category)}
            </div>
            <div className="post-detail-date">
              {formatDate(post.created_at)}
            </div>
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

          {/* 콘텐츠 */}
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

            {/* 평점 */}
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

            {/* 통계 */}
            <div className="post-stats-inline">
              <div className="stat-item">
                <span className="stat-icon">👁</span>
                <span className="stat-number">{post.view_count}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👍</span>
                <span className={`stat-number ${likeCount > 5 ? 'highlight' : ''}`}>
                  {likeCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span className={`stat-number ${comments.length > 3 ? 'highlight' : ''}`}>
                  {comments.length}
                </span>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="action-buttons">
              <button 
                className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={isLikeProcessing}
                aria-label="좋아요"
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                좋아요
              </button>
              <button 
                className="action-button comment-button"
                onClick={focusCommentInput}
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

            {/* 댓글 섹션 */}
            <div className="post-comments">
              <h3 className="comments-title">댓글 {comments.length}개</h3>
              
              {/* 댓글 입력 */}
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <input
                  ref={commentInputRef}
                  type="text"
                  className="comment-input"
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? '작성 중...' : '게시'}
                </button>
              </form>

              {/* 댓글 목록 */}
              <div className="comments-list">
                {organizedComments.length === 0 ? (
                  <div className="no-comments">
                    첫 번째 댓글을 작성해보세요!
                  </div>
                ) : (
                  organizedComments.map(comment => (
                    <div key={comment.commentId} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="comment-replies">
                          {comment.replies.map(reply => (
                            <div key={reply.commentId} className="reply-item">
                              <div className="comment-header">
                                <span className="comment-author">{reply.author}</span>
                                <span className="comment-date">{formatDate(reply.createdAt)}</span>
                              </div>
                              <div className="comment-content">{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
