// 커뮤니티 관련 타입 정의

// ⭐ 이 부분만 ERD에 맞게 수정 (상품 리뷰 이미지)
export interface PostImage {
  post_image_id: number;
  post_id: number;
  image_key: string;  // ERD 필드: image_key
  seq: number;        // ERD 필드: seq (이미지 순서)
}

// 아래는 원본 그대로 유지
export interface Post {
  post_id: number;
  title: string;
  content: string;
  author: string;
  author_id: number;
  category: PostCategory;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_notice?: boolean;
  rating?: number; // 리뷰 게시글일 때만 사용
  brewery_name?: string; // 양조장 리뷰일 때만 사용
  product_name?: string; // 술 리뷰일 때만 사용
  tags: string[];
  images: PostImage[]; // 게시글 이미지들 (최대 5개)
  thumbnail_url?: string; // 썸네일 이미지 (첫번째 이미지 또는 대표 이미지)
}

export type PostCategory = 'notice' | 'free' | 'drink_review' | 'brewery_review';

export interface PostFilter {
  category: PostCategory | 'all';
  subcategory: string;
  searchKeyword: string;
  sortBy: 'latest' | 'popular' | 'views' | 'likes';
  hasImages?: boolean; // 이미지가 있는 게시글만 필터링
}

export interface WritePostData {
  title: string;
  content: string;
  category: PostCategory;
  subcategory: string;
  rating?: number;
  brewery_name?: string;
  product_name?: string;
  tags: string[];
  images: File[]; // 업로드할 이미지 파일들
  imageDescriptions: string[]; // 각 이미지의 설명
}

export interface CategoryConfig {
  id: PostCategory;
  name: string;
  subcategories: { id: string; name: string; count: number }[];
  hasRating: boolean;
  placeholder: string;
  allowImages: boolean; // 이미지 업로드 허용 여부
  maxImages: number; // 최대 이미지 개수
}

export interface CommunityStats {
  totalPosts: number;
  todayPosts: number;
  totalMembers: number;
  onlineMembers: number;
  postsWithImages: number; // 이미지가 있는 게시글 수
}

// 컴포넌트 Props 타입들
export interface CommunityProps {
  className?: string;
}

export interface CommunityListProps {
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

export interface PostCardProps {
  post: Post;
  onPostClick: (postId: number) => void;
  viewMode: 'grid' | 'list';
}

export interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}

export interface WritePostProps {
  onSubmit: (data: WritePostData) => void;
  onCancel: () => void;
  initialCategory?: PostCategory;
  categories: CategoryConfig[];
}

export interface CommunityFilterProps {
  categories: CategoryConfig[];
  currentCategory: PostCategory | 'all';
  filter: PostFilter;
  onFilterChange: (filter: Partial<PostFilter>) => void;
  onCategoryChange: (category: PostCategory | 'all') => void;
}

export interface ImageCarouselProps {
  images: PostImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showIndicators?: boolean;
  showNavigation?: boolean;
  autoPlay?: boolean;
}

export interface ImageUploadProps {
  images: File[];
  maxImages: number;
  onImagesChange: (images: File[]) => void;
  onDescriptionsChange: (descriptions: string[]) => void;
  descriptions: string[];
}