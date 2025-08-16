'use client';

import { useState } from 'react';
import PostCard from '../PostCard/PostCard';
import PostDetail from '../PostDetail/PostDetail';
import { Post, PostFilter, PostCategory } from '../../../types/community';
import './CommunityList.css';

interface CommunityListProps {
  posts: Post[];
  isLoading: boolean;
  currentCategory: PostCategory | 'all';
  filter: PostFilter;
  onFilterChange: (filter: Partial<PostFilter>) => void;
  onPostClick: (postId: number) => void;
  onWriteClick: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const CommunityList: React.FC<CommunityListProps> = ({
  posts,
  isLoading,
  currentCategory,
  filter,
  onFilterChange,
  onPostClick,
  onWriteClick,
  viewMode,
  onViewModeChange
}) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showImageOnly, setShowImageOnly] = useState(false);

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'views', label: '조회순' },
    { value: 'likes', label: '좋아요순' }
  ];

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy: sortBy as PostFilter['sortBy'] });
  };

  const handlePostClick = (postId: number) => {
    const post = posts.find(p => p.post_id === postId);
    if (post) {
      setSelectedPost(post);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  const handleLike = (postId: number) => {
    console.log('좋아요:', postId);
    // TODO: API 호출
  };

  const handleComment = (postId: number, comment: string) => {
    console.log('댓글 작성:', postId, comment);
    // TODO: API 호출
  };

  const handleImageOnlyToggle = (checked: boolean) => {
    setShowImageOnly(checked);
    onFilterChange({ hasImages: checked });
  };

  // 공지사항과 일반 게시글 분리
  const noticePosts = posts.filter(post => post.is_notice);
  const regularPosts = posts.filter(post => !post.is_notice);

  if (isLoading) {
    return (
      <div className="community-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          게시글을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="community-list-container">
      {/* 헤더 */}
      <div className="community-list-header">
        <div className="header-left">
          <div className="post-count">
            총 <span className="post-count-number">{posts.length}</span>개의 게시글
          </div>
          
          {/* 뷰 모드 토글 */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="카드 뷰"
            >
              <span>⊞</span>
              카드
            </button>
            <button
              className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="리스트 뷰"
            >
              <span>☰</span>
              리스트
            </button>
          </div>
        </div>
        
        <div className="header-right">
          {/* 필터 토글 */}
          <div className="filter-toggle">
            <button
              className={`filter-option ${!showImageOnly ? 'active' : ''}`}
              onClick={() => handleImageOnlyToggle(false)}
            >
              전체
            </button>
            <button
              className={`filter-option ${showImageOnly ? 'active' : ''}`}
              onClick={() => handleImageOnlyToggle(true)}
            >
              📷 이미지
            </button>
          </div>

          <div className="sort-controls">
            <span className="sort-label">정렬:</span>
            <select
              className="sort-select"
              value={filter.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 공지사항 섹션 */}
      {noticePosts.length > 0 && !showImageOnly && (
        <div className="notice-section">
          <h3 className="notice-title">
            <span className="notice-icon">📢</span>
            공지사항
          </h3>
          <div className="notice-posts">
            {noticePosts.slice(0, 3).map(post => (
              <div 
                key={post.post_id}
                className="notice-post"
                onClick={() => handlePostClick(post.post_id)}
              >
                <span className="notice-badge">공지</span>
                <div className="notice-content">
                  <div className="notice-title-text">{post.title}</div>
                  <div className="notice-meta">
                    {post.author} • {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div className="notice-stats">
                  <span>👁 {post.view_count}</span>
                  <span>👍 {post.like_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      {regularPosts.length === 0 ? (
        <div className="no-posts">
          <div className="no-posts-icon">📝</div>
          <div className="no-posts-title">
            {showImageOnly ? '이미지가 있는 게시글이 없습니다' : '게시글이 없습니다'}
          </div>
          <div className="no-posts-description">
            {showImageOnly 
              ? '이미지 필터를 해제하고 다시 확인해보세요.'
              : '첫 번째 게시글을 작성해보세요!'
            }
          </div>
          {!showImageOnly && (
            <button className="no-posts-action" onClick={onWriteClick}>
              게시글 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'posts-grid' : 'posts-list'}>
          {regularPosts.map(post => (
            <PostCard
              key={post.post_id}
              post={post}
              onPostClick={handlePostClick}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* 게시글 상세 모달 */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={handleCloseDetail}
          onLike={handleLike}
          onComment={handleComment}
          isOpen={!!selectedPost}
        />
      )}
    </div>
  );
};

export default CommunityList;