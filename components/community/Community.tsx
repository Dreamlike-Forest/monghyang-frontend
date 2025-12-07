'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // [추가] URL 파라미터 감지용
import CommunityFilter from './CommunityFilter/CommunityFilter';
import CommunityList from './CommunityList/CommunityList';
import WritePost from './WritePost/WritePost';
import communityApi, { Post as ApiPost, PageData, CreateCommunityRequest } from '../../utils/communityApi';
import { PostFilter, PostCategory, CategoryConfig, WritePostData, Post } from '../../types/community';
import './Community.css';

// 로컬 캐시
let cachedReviews: Post[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000;

// API Post -> Legacy Post 변환
const convertApiToLegacyPost = (post: ApiPost): Post => ({
  post_id: post.postId,
  title: post.title,
  content: post.content,
  author: `사용자${post.userId}`,
  author_id: post.userId,
  category: post.category as PostCategory,
  created_at: post.createdAt,
  view_count: post.viewCount,
  like_count: post.likeCount,
  comment_count: post.commentCount,
  rating: post.rating || undefined,
  brewery_name: post.breweryName || undefined,
  product_name: post.productName || undefined,
  tags: post.tags,
  images: post.images.map(img => ({
    image_id: img.imageId,
    image_url: img.imageUrl,
    image_order: img.imageNum
  })),
  is_notice: post.category === 'notice'
});

// WritePostData -> CreateCommunityRequest 변환
const convertWriteDataToRequest = (data: WritePostData): CreateCommunityRequest => {
  return {
    title: data.title,
    category: data.category,
    detail: data.content,
    subCategory: data.subcategory || undefined,
    productName: data.product_name || undefined,
    breweryName: data.brewery_name || undefined,
    star: data.rating || undefined,
    tags: data.tags.length > 0 ? data.tags.join(',') : undefined,
    images: data.images.length > 0 ? data.images : undefined
  };
};

// 특정 상품의 리뷰 가져오기
export const getProductReviews = (productName: string): Post[] => {
  return cachedReviews.filter(
    post => post.category === 'drink_review' && post.product_name === productName
  );
};

// 모든 술 리뷰 가져오기
export const getCommunityReviews = (): Post[] => {
  return cachedReviews.filter(post => post.category === 'drink_review');
};

// 새 리뷰 추가
export const addCommunityReview = async (reviewData: WritePostData): Promise<Post> => {
  const request = convertWriteDataToRequest(reviewData);
  const apiPost = await communityApi.createPost(request);
  const newPost = convertApiToLegacyPost(apiPost);
  cachedReviews.unshift(newPost);
  return newPost;
};

// 리뷰 업데이트
export const updateCommunityReview = (postId: number, updates: Partial<Post>): void => {
  const index = cachedReviews.findIndex(post => post.post_id === postId);
  if (index !== -1) {
    cachedReviews[index] = { ...cachedReviews[index], ...updates };
  }
};

// 캐시 갱신
export const refreshReviewCache = async (): Promise<void> => {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) return;
  
  try {
    const result = await communityApi.getPostsByCategory('drink_review');
    cachedReviews = result.map(convertApiToLegacyPost);
    lastFetchTime = now;
  } catch (error) {
    console.error('리뷰 캐시 갱신 실패:', error);
  }
};

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'notice',
    name: '공지사항',
    subcategories: [
      { id: 'brewery_event', name: '양조장 이벤트', count: 0 },
      { id: 'platform_event', name: '플랫폼 이벤트', count: 0 },
      { id: 'announcement', name: '일반 공지', count: 0 }
    ],
    hasRating: false,
    placeholder: '공지사항 제목을 입력하세요',
    allowImages: true,
    maxImages: 3
  },
  {
    id: 'free',
    name: '자유게시판',
    subcategories: [
      { id: 'general', name: '일반', count: 0 },
      { id: 'question', name: '질문', count: 0 },
      { id: 'info', name: '정보공유', count: 0 }
    ],
    hasRating: false,
    placeholder: '자유롭게 이야기해보세요',
    allowImages: true,
    maxImages: 5
  },
  {
    id: 'drink_review',
    name: '술 리뷰',
    subcategories: [
      { id: 'makgeolli', name: '막걸리', count: 0 },
      { id: 'soju', name: '소주', count: 0 },
      { id: 'yakju', name: '약주', count: 0 },
      { id: 'wine', name: '와인', count: 0 }
    ],
    hasRating: true,
    placeholder: '어떤 술을 리뷰하실건가요?',
    allowImages: true,
    maxImages: 5
  },
  {
    id: 'brewery_review',
    name: '양조장 리뷰',
    subcategories: [
      { id: 'experience', name: '체험프로그램', count: 0 },
      { id: 'visit', name: '방문후기', count: 0 },
      { id: 'tour', name: '투어', count: 0 }
    ],
    hasRating: true,
    placeholder: '양조장 체험은 어떠셨나요?',
    allowImages: true,
    maxImages: 5
  }
];

interface CommunityProps {
  className?: string;
}

const Community: React.FC<CommunityProps> = ({ className }) => {
  const searchParams = useSearchParams(); // [추가] URL 파라미터 훅
  const [currentView, setCurrentView] = useState<'list' | 'write'>('list');
  const [currentCategory, setCurrentCategory] = useState<PostCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState<PageData<ApiPost> | null>(null);
  
  const [filter, setFilter] = useState<PostFilter>({
    category: 'all',
    subcategory: '',
    searchKeyword: '',
    sortBy: 'latest',
    hasImages: false
  });

  // [추가됨] URL 파라미터 감지 및 카테고리 설정
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // 유효한 카테고리인지 확인
      const validCategories = ['notice', 'free', 'drink_review', 'brewery_review'];
      if (validCategories.includes(categoryParam)) {
        const targetCategory = categoryParam as PostCategory;
        setCurrentCategory(targetCategory);
        setFilter(prev => ({ ...prev, category: targetCategory }));
      }
    }
  }, [searchParams]);

  // 게시글 목록 조회
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: PageData<ApiPost>;
      
      if (currentCategory === 'all') {
        result = await communityApi.getAllPostsWithPaging(currentPage);
      } else {
        result = await communityApi.getPostsByCategoryWithPaging(currentCategory, currentPage);
      }
      
      setPageData(result);
      
      // 각 게시글의 이미지 조회 (병렬 처리)
      const postsWithImages = await Promise.all(
        result.content.map(async (post) => {
          try {
            const images = await communityApi.getImages(post.postId);
            return { ...post, images };
          } catch {
            return { ...post, images: [] };
          }
        })
      );
      
      // 캐시 업데이트
      if (currentCategory === 'drink_review' || currentCategory === 'all') {
        const drinkReviews = postsWithImages.filter(p => p.category === 'drink_review');
        drinkReviews.forEach(post => {
          const existing = cachedReviews.findIndex(c => c.post_id === post.postId);
          const converted = convertApiToLegacyPost(post);
          if (existing === -1) {
            cachedReviews.push(converted);
          } else {
            cachedReviews[existing] = converted;
          }
        });
      }
      
      const convertedPosts = postsWithImages.map(convertApiToLegacyPost);
      let filtered = [...convertedPosts];
      
      if (filter.searchKeyword) {
        const keyword = filter.searchKeyword.toLowerCase();
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          post.tags.some((tag: string) => tag.toLowerCase().includes(keyword))
        );
      }
      
      switch (filter.sortBy) {
        case 'latest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'popular':
          filtered.sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count));
          break;
        case 'views':
          filtered.sort((a, b) => b.view_count - a.view_count);
          break;
        case 'likes':
          filtered.sort((a, b) => b.like_count - a.like_count);
          break;
      }
      
      const notices = filtered.filter(post => post.is_notice);
      const normalPosts = filtered.filter(post => !post.is_notice);
      
      setPosts([...notices, ...normalPosts]);
    } catch (err: any) {
      console.error('게시글 조회 실패:', err);
      setError(err?.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentPage, filter.searchKeyword, filter.sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setCurrentPage(0);
  }, [currentCategory]);

  const handleFilterChange = (newFilter: Partial<PostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleCategoryChange = (category: PostCategory | 'all') => {
    setCurrentCategory(category);
    setFilter(prev => ({ ...prev, category, subcategory: '' }));
  };

  // 게시글 상세 조회 핸들러
  const handlePostClick = async (postId: number): Promise<Post | null> => {
    try {
      const apiPost = await communityApi.getPostDetail(postId);
      return convertApiToLegacyPost(apiPost);
    } catch (err) {
      console.error('게시글 상세 조회 실패:', err);
      return null;
    }
  };

  // 좋아요 핸들러
  const handleLike = async (postId: number, isLiked: boolean): Promise<boolean> => {
    try {
      if (isLiked) {
        await communityApi.unlikePost(postId);
      } else {
        await communityApi.likePost(postId);
      }
      
      // 로컬 상태 업데이트
      setPosts(prev => prev.map(post => {
        if (post.post_id === postId) {
          return {
            ...post,
            like_count: isLiked ? post.like_count - 1 : post.like_count + 1
          };
        }
        return post;
      }));
      
      return true;
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      return false;
    }
  };

  // 댓글 작성 핸들러
  const handleComment = async (postId: number, content: string): Promise<boolean> => {
    try {
      await communityApi.createComment({
        communityId: postId,
        content
      });
      
      // 댓글 수 업데이트
      setPosts(prev => prev.map(post => {
        if (post.post_id === postId) {
          return { ...post, comment_count: post.comment_count + 1 };
        }
        return post;
      }));
      
      return true;
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      return false;
    }
  };

  // 댓글 목록 조회 핸들러
  const handleGetComments = async (postId: number) => {
    try {
      return await communityApi.getComments(postId);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
      return [];
    }
  };

  const handleWriteClick = () => {
    setCurrentView('write');
  };

  const handleWriteSubmit = async (data: WritePostData) => {
    try {
      await addCommunityReview(data);
      setCurrentView('list');
      await fetchPosts();
      alert('게시글이 작성되었습니다!');
    } catch (err: any) {
      console.error('게시글 작성 실패:', err);
      const errorMsg = err?.response?.data?.message || '게시글 작성에 실패했습니다.';
      alert(errorMsg);
    }
  };

  const handleWriteCancel = () => {
    setCurrentView('list');
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const getCategoryName = (category: PostCategory | 'all') => {
    if (category === 'all') return '전체 게시판';
    const config = categoryConfigs.find(cat => cat.id === category);
    return config?.name || '게시판';
  };

  if (currentView === 'write') {
    return (
      <div className={`community-container ${className || ''}`}>
        <WritePost
          onSubmit={handleWriteSubmit}
          onCancel={handleWriteCancel}
          initialCategory={currentCategory !== 'all' ? currentCategory : 'free'}
          categories={categoryConfigs}
        />
      </div>
    );
  }

  return (
    <div className={`community-container ${className || ''}`}>
      <div className="community-content">
        <div className="community-sidebar">
          <CommunityFilter
            categories={categoryConfigs}
            currentCategory={currentCategory}
            filter={filter}
            onFilterChange={handleFilterChange}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        
        <div className="community-main">
          <div className="community-header">
            <h1 className="community-title">{getCategoryName(currentCategory)}</h1>
            <p className="community-description">
              전통주 애호가들과 양조장 정보, 리뷰, 경험을 나누는 공간입니다.
            </p>
          </div>

          <button className="write-button" onClick={handleWriteClick}>
            ✏️ 새 게시글 작성
          </button>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchPosts} className="retry-button">다시 시도</button>
            </div>
          )}

          <CommunityList
            posts={posts}
            isLoading={isLoading}
            currentCategory={currentCategory}
            filter={filter}
            onFilterChange={handleFilterChange}
            onPostClick={handlePostClick}
            onWriteClick={handleWriteClick}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onLike={handleLike}
            onComment={handleComment}
            onGetComments={handleGetComments}
          />

          {pageData && pageData.totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={pageData.isFirst}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="pagination-btn"
              >
                이전
              </button>
              <span className="pagination-info">
                {pageData.pageNumber + 1} / {pageData.totalPages}
              </span>
              <button 
                disabled={pageData.isLast}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="pagination-btn"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;