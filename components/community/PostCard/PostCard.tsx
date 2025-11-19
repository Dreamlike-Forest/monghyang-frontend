'use client';

import { useState } from 'react';
import { Post } from '../../../types/community';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: number) => void;
  viewMode: 'grid' | 'list';
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostClick,
  viewMode
}) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onPostClick(post.post_id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString: string) => {
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

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'notice':
        return 'category-notice';
      case 'free':
        return 'category-free';
      case 'drink_review':
        return 'category-drink';
      case 'brewery_review':
        return 'category-brewery';
      default:
        return '';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'notice':
        return '공지';
      case 'free':
        return '자유';
      case 'drink_review':
        return '술리뷰';
      case 'brewery_review':
        return '양조장';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notice':
        return '📢';
      case 'free':
        return '💬';
      case 'drink_review':
        return '🍶';
      case 'brewery_review':
        return '🏭';
      default:
        return '📝';
    }
  };

  const isHotPost = () => {
    return post.like_count >= 10 || post.comment_count >= 5;
  };

  const isNewPost = () => {
    const postDate = new Date(post.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className="rating-star"
        >
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  const hasImages = post.images && post.images.length > 0;
  const firstImage = hasImages ? post.images[0] : null;
  const imageCount = post.images?.length || 0;

  // 썸네일 렌더링 함수
  const renderThumbnail = () => {
    if (hasImages && firstImage && !imageError) {
      return (
        <>
          <img
            src={firstImage.image_url}
            alt={firstImage.alt_text || `${post.title} 이미지`}
            className="post-thumbnail-image"
            onError={handleImageError}
            loading="lazy"
          />
          {imageCount > 1 && (
            <div className="image-count-overlay">
              <span className="camera-icon">📷</span>
              <span>{imageCount}</span>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="post-thumbnail-placeholder">
          <div className="thumbnail-icon">
            {getCategoryIcon(post.category)}
          </div>
          <div className="thumbnail-text">
            {getCategoryName(post.category)}
          </div>
        </div>
      );
    }
  };

  // 리스트 뷰 렌더링
  if (viewMode === 'list') {
    return (
      <div 
        className={`post-card-list ${post.is_notice ? 'notice' : ''}`}
        onClick={handleClick}
      >
        {/* 썸네일 */}
        <div className="post-thumbnail-section">
          {renderThumbnail()}
        </div>

        <div className="post-content-section">
          <div className="post-header">
            <span className={`post-category ${getCategoryStyle(post.category)}`}>
              {getCategoryName(post.category)}
            </span>
            
            <h3 className="post-title">{post.title}</h3>
            
            <div className="post-badges">
              {isHotPost() && (
                <span className="post-badge badge-hot">HOT</span>
              )}
              {isNewPost() && (
                <span className="post-badge badge-new">NEW</span>
              )}
            </div>

            {/* 별점 표시 (리뷰 게시글) */}
            {post.rating && (
              <div className="post-rating">
                <div className="rating-stars">
                  {renderRating(post.rating)}
                </div>
                <span className="rating-score">{post.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="post-meta">
            <span className="post-author">{post.author}</span>
            <span className="post-date">{formatDate(post.created_at)}</span>
            {post.brewery_name && (
              <span className="brewery-name">양조장: {post.brewery_name}</span>
            )}
            {post.product_name && (
              <span className="product-name">상품: {post.product_name}</span>
            )}
            {hasImages && (
              <span className="image-indicator">📷 {imageCount}</span>
            )}
          </div>
        </div>
        
        <div className="post-stats">
          <div className="stat-item">
            <span className="stat-icon">👁</span>
            <span className={`stat-number ${post.view_count > 100 ? 'highlight' : ''}`}>
              {post.view_count.toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👍</span>
            <span className={`stat-number ${post.like_count > 5 ? 'highlight' : ''}`}>
              {post.like_count}
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
    );
  }

  // 그리드 뷰 렌더링 (카드 스타일 - 썸네일 형태)
  return (
    <div 
      className={`post-card-grid ${post.is_notice ? 'notice' : ''}`}
      onClick={handleClick}
    >
      {/* 썸네일 섹션 */}
      <div className="post-thumbnail-section">
        {renderThumbnail()}
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="post-content-section">
        <div className="post-header">
          <span className={`post-category ${getCategoryStyle(post.category)}`}>
            {getCategoryName(post.category)}
          </span>
          
          <div className="post-badges">
            {isHotPost() && (
              <span className="post-badge badge-hot">HOT</span>
            )}
            {isNewPost() && (
              <span className="post-badge badge-new">NEW</span>
            )}
          </div>
        </div>

        <h3 className="post-title">{post.title}</h3>

        {/* 별점 표시 (리뷰 게시글) */}
        {post.rating && (
          <div className="post-rating">
            <div className="rating-stars">
              {renderRating(post.rating)}
            </div>
            <span className="rating-score">{post.rating.toFixed(1)}</span>
          </div>
        )}

        {/* 내용 미리보기 */}
        <div className="post-content-preview">
          {truncateContent(post.content, 60)}
        </div>

        {/* 메타 정보 */}
        <div className="post-meta">
          <span className="post-author">{post.author}</span>
          <span className="post-date">{formatDate(post.created_at)}</span>
        </div>

        {/* 추가 정보 */}
        {(post.brewery_name || post.product_name) && (
          <div className="post-extra-info">
            {post.brewery_name && (
              <span>🏭 {post.brewery_name}</span>
            )}
            {post.product_name && (
              <span>🍶 {post.product_name}</span>
            )}
          </div>
        )}

        {/* 통계 */}
        <div className="post-stats">
          <div className="stat-item">
            <span className="stat-icon">👁</span>
            <span className={`stat-number ${post.view_count > 100 ? 'highlight' : ''}`}>
              {post.view_count > 1000 ? `${(post.view_count / 1000).toFixed(1)}k` : post.view_count}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👍</span>
            <span className={`stat-number ${post.like_count > 5 ? 'highlight' : ''}`}>
              {post.like_count}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💬</span>
            <span className={`stat-number ${post.comment_count > 3 ? 'highlight' : ''}`}>
              {post.comment_count}
            </span>
          </div>
        </div>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="post-tag">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="post-tag">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;