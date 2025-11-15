'use client';

import { useState, useEffect, useCallback } from 'react';
import CommunityFilter from './CommunityFilter/CommunityFilter';
import CommunityList from './CommunityList/CommunityList';
import WritePost from './WritePost/WritePost';
import { 
  Post, 
  PostFilter, 
  PostCategory, 
  CategoryConfig, 
  WritePostData,
  CommunityStats 
} from '../../types/community';
import './Community.css';

// Mock 데이터 (이미지 포함) - 전역 상태로 관리
let globalMockPosts: Post[] = [
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
        post_image_id: 1,
        post_id: 1,
        image_key: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop',
        seq: 1,
      },
      {
        post_image_id: 2,
        post_id: 1,
        image_key: 'https://images.unsplash.com/photo-1582106245687-a2a4c81d5a65?w=400&h=300&fit=crop',
        seq: 2,
      },
      {
        post_image_id: 3,
        post_id: 1,
        image_key: 'https://images.unsplash.com/photo-1534354871393-df4a6e8a2ec3?w=400&h=300&fit=crop',
        seq: 3,
      }
    ]
  },
  {
    post_id: 2,
    title: '극찬 청명 드디어 마셔봤습니다!',
    content: '오랫동안 찜해뒀던 극찬 청명을 드디어 주문해서 마셔봤어요. 정말 깔끔하고 부드러운 맛이 일품이네요. 특히 목 넘김이 정말 좋고, 뒷맛이 깔끔해서 술 초보자도 부담 없이 마실 수 있을 것 같아요.',
    author: '술러버',
    author_id: 2,
    category: 'drink_review',
    created_at: '2025-01-14T15:20:00Z',
    view_count: 189,
    like_count: 12,
    comment_count: 6,
    rating: 4,
    product_name: '극찬 청명',
    tags: ['청주', '극찬', '리뷰'],
    images: [
      {
        post_image_id: 4,
        post_id: 2,
        image_key: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop',
        seq: 1,
      },
      {
        post_image_id: 5,
        post_id: 2,
        image_key: 'https://images.unsplash.com/photo-1596556345922-67b7c4b6d5ce?w=400&h=300&fit=crop',
        seq: 2,
      }
    ]
  },
  {
    post_id: 3,
    title: '[공지] 전통주 쇼핑몰 3월 리뉴얼 안내',
    content: '안녕하세요. 몽향 운영진입니다. 더 나은 서비스 제공을 위해 3월 중순에 쇼핑몰 리뉴얼 작업을 진행할 예정입니다. 리뉴얼 기간 중에는 일시적으로 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
    author: '운영자',
    author_id: 999,
    category: 'notice',
    created_at: '2025-01-13T09:00:00Z',
    view_count: 456,
    like_count: 23,
    comment_count: 12,
    is_notice: true,
    tags: ['공지사항', '리뉴얼'],
    images: []
  },
  {
    post_id: 4,
    title: '막걸리 처음 마시는 사람에게 추천할만한 제품?',
    content: '친구가 막걸리에 관심을 가지기 시작했는데 어떤 걸 추천해야 할지 고민이에요. 너무 진하지 않고 달콤한 맛이 나는 초보자용 막걸리가 있을까요? 여러분의 추천 부탁드려요!',
    author: '초보안내자',
    author_id: 3,
    category: 'free',
    created_at: '2025-01-12T18:45:00Z',
    view_count: 167,
    like_count: 8,
    comment_count: 15,
    tags: ['막걸리', '초보', '추천'],
    images: []
  },
  {
    post_id: 5,
    title: '안성 양조장 체험 프로그램 후기',
    content: '지난 주말에 안성 양조장 체험 프로그램에 참여했는데 정말 유익한 시간이었어요. 전통 누룩 만들기부터 시작해서 발효 과정까지 직접 체험해볼 수 있었습니다.',
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
        seq: 1,
      }
    ]
  },
  {
    post_id: 6,
    title: '복분자 막걸리 홈메이드 도전기',
    content: '집에서 복분자 막걸리를 만들어봤어요. 생각보다 어렵지 않았지만 발효 시간 조절이 관건이더라고요. 며칠 더 숙성시키면 더 맛있어질 것 같아요.',
    author: '홈브루어',
    author_id: 5,
    category: 'free',
    created_at: '2025-01-10T20:30:00Z',
    view_count: 203,
    like_count: 18,
    comment_count: 9,
    tags: ['복분자', '막걸리', '홈메이드', 'DIY'],
    images: [
      {
        post_image_id: 7,
        post_id: 6,
        image_key: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=300&fit=crop',
        seq: 1,
      },
      {
        post_image_id: 8,
        post_id: 6,
        image_key: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        seq: 2,
      }
    ]
  },
  // 추가 상품 리뷰들
  {
    post_id: 8,
    title: '복분자 막걸리와 안주 페어링 후기',
    content: '복분자 막걸리 다양한 안주와 함께 마셔봤습니다. 특히 생선회와 정말 잘 어울리더라고요. 청주 특유의 깔끔함이 회의 비린내를 말끔히 잡아주고, 단맛이 회의 감칠맛을 더욱 살려줍니다. 치즈와도 의외로 잘 맞아서 놀랐어요.',
    author: '페어링마스터',
    author_id: 7,
    category: 'drink_review',
    created_at: '2025-01-09T19:30:00Z',
    view_count: 156,
    like_count: 9,
    comment_count: 4,
    rating: 5,
    product_name: '복분자 막걸리',
    tags: ['복분자', '페어링', '안주', '생선회'],
    images: [
      {
        post_image_id: 9,
        post_id: 8,
        image_key: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        seq: 1,
      }
    ]
  },
  {
    post_id: 10,
    title: '청주 초보자에게 추천하는 극찬 청명',
    content: '청주를 처음 마시는 친구들에게 극찬 청명을 권해봤는데 반응이 정말 좋았어요. 알코올 도수가 적당하고 단맛이 있어서 거부감 없이 마실 수 있다고 하더라고요. 가격도 부담스럽지 않아서 청주 입문용으로 딱입니다.',
    author: '청주전도사',
    author_id: 8,
    category: 'drink_review',
    created_at: '2025-01-07T16:45:00Z',
    view_count: 203,
    like_count: 15,
    comment_count: 8,
    rating: 4,
    product_name: '극찬 청명',
    tags: ['극찬', '초보자', '추천', '입문용'],
    images: []
  }
];

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'notice',
    name: '공지사항',
    subcategories: [
      { id: 'brewery_event', name: '양조장 이벤트', count: 12 },
      { id: 'platform_event', name: '플랫폼 이벤트', count: 8 },
      { id: 'announcement', name: '일반 공지', count: 15 }
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
      { id: 'general', name: '일반', count: 67 },
      { id: 'question', name: '질문', count: 23 },
      { id: 'info', name: '정보공유', count: 18 }
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
      { id: 'makgeolli', name: '막걸리', count: 89 },
      { id: 'soju', name: '소주', count: 45 },
      { id: 'yakju', name: '약주', count: 34 },
      { id: 'wine', name: '와인', count: 22 }
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
      { id: 'experience', name: '체험프로그램', count: 67 },
      { id: 'visit', name: '방문후기', count: 45 },
      { id: 'tour', name: '투어', count: 23 }
    ],
    hasRating: true,
    placeholder: '양조장 체험은 어떠셨나요?',
    allowImages: true,
    maxImages: 5
  }
];

const mockStats: CommunityStats = {
  totalPosts: 1247,
  todayPosts: 23,
  totalMembers: 3456,
  onlineMembers: 127,
  postsWithImages: 234
};

// 전역 함수: 상품 리뷰 가져오기
export const getCommunityReviews = (): Post[] => {
  return globalMockPosts.filter(post => post.category === 'drink_review');
};

// 전역 함수: 특정 상품의 리뷰 가져오기
export const getProductReviews = (productName: string): Post[] => {
  return globalMockPosts.filter(
    post => post.category === 'drink_review' && post.product_name === productName
  );
};

// 전역 함수: 새 리뷰 추가
export const addCommunityReview = (reviewData: WritePostData): Post => {
  const newPostId = Date.now();
  const newPost: Post = {
    post_id: newPostId,
    title: reviewData.title,
    content: reviewData.content,
    author: '현재사용자', // 실제로는 로그인한 사용자 정보
    author_id: 999,
    category: reviewData.category,
    created_at: new Date().toISOString(),
    view_count: 0,
    like_count: 0,
    comment_count: 0,
    rating: reviewData.rating,
    brewery_name: reviewData.brewery_name,
    product_name: reviewData.product_name,
    tags: reviewData.tags,
    images: reviewData.images.map((file, index) => ({
      post_image_id: Date.now() + index,
      post_id: newPostId,
      image_key: URL.createObjectURL(file), // 실제로는 서버 업로드 후 URL
      seq: index + 1,
    }))
  };

  // 전역 배열에 추가
  globalMockPosts.unshift(newPost);
  return newPost;
};

// 전역 함수: 리뷰 업데이트
export const updateCommunityReview = (postId: number, updates: Partial<Post>): void => {
  const index = globalMockPosts.findIndex(post => post.post_id === postId);
  if (index !== -1) {
    globalMockPosts[index] = { ...globalMockPosts[index], ...updates };
  }
};

interface CommunityProps {
  className?: string;
}

const Community: React.FC<CommunityProps> = ({ className }) => {
  const [currentView, setCurrentView] = useState<'list' | 'write'>('list');
  const [currentCategory, setCurrentCategory] = useState<PostCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPosts, setAllPosts] = useState<Post[]>(globalMockPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(globalMockPosts);
  const [filter, setFilter] = useState<PostFilter>({
    category: 'all',
    subcategory: '',
    searchKeyword: '',
    sortBy: 'latest',
    hasImages: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats] = useState<CommunityStats>(mockStats);

  // 전역 상태 변경 감지
  useEffect(() => {
    setAllPosts([...globalMockPosts]);
  }, []);

  // 필터 적용 함수
  const applyFilters = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...allPosts];

      // 카테고리 필터
      if (currentCategory !== 'all') {
        filtered = filtered.filter(post => post.category === currentCategory);
      }

      // 이미지 필터
      if (filter.hasImages) {
        filtered = filtered.filter(post => post.images && post.images.length > 0);
      }

      // 서브카테고리 필터
      if (filter.subcategory) {
        // 실제 구현에서는 post에 subcategory 필드가 있어야 함
        // 여기서는 mock 데이터이므로 태그로 대체
        filtered = filtered.filter(post => 
          post.tags.some(tag => tag.includes(filter.subcategory))
        );
      }

      // 검색 키워드 필터
      if (filter.searchKeyword) {
        const keyword = filter.searchKeyword.toLowerCase();
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          post.author.toLowerCase().includes(keyword) ||
          post.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }

      // 정렬
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

      // 공지사항을 맨 위로
      const notices = filtered.filter(post => post.is_notice);
      const normalPosts = filtered.filter(post => !post.is_notice);
      
      setFilteredPosts([...notices, ...normalPosts]);
      setIsLoading(false);
    }, 300);
  }, [allPosts, currentCategory, filter]);

  // 필터 변경 시 적용
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (newFilter: Partial<PostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleCategoryChange = (category: PostCategory | 'all') => {
    setCurrentCategory(category);
    setFilter(prev => ({ 
      ...prev, 
      category,
      subcategory: '' // 카테고리 변경 시 서브카테고리 초기화
    }));
  };

  const handlePostClick = (postId: number) => {
    console.log('게시글 상세 페이지로 이동:', postId);
    // TODO: 게시글 상세 페이지 라우팅
  };

  const handleWriteClick = () => {
    setCurrentView('write');
  };

  const handleWriteSubmit = async (data: WritePostData) => {
    console.log('새 게시글 작성:', data);
    
    try {
      // 전역 상태에 새 게시글 추가
      const newPost = addCommunityReview(data);
      
      // 로컬 상태 업데이트
      setAllPosts(prev => [newPost, ...prev]);
      
      setCurrentView('list');
      alert('게시글이 작성되었습니다!');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
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
          {/* 커뮤니티 헤더 */}
          <div className="community-header">
            <h1 className="community-title">{getCategoryName(currentCategory)}</h1>
            <p className="community-description">
              전통주 애호가들과 양조장 정보, 리뷰, 경험을 나누는 공간입니다.
            </p>
          </div>

          {/* 카테고리 탭 */}
          <div className="category-tabs">
            <button
              className={`category-tab ${currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              전체
            </button>
            {categoryConfigs.map(category => (
              <button
                key={category.id}
                className={`category-tab ${currentCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 글쓰기 버튼 */}
          <button className="write-button" onClick={handleWriteClick}>
            ✏️ 새 게시글 작성
          </button>

          {/* 게시글 목록 */}
          <CommunityList
            posts={filteredPosts}
            isLoading={isLoading}
            currentCategory={currentCategory}
            filter={filter}
            onFilterChange={handleFilterChange}
            onPostClick={handlePostClick}
            onWriteClick={handleWriteClick}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Community;