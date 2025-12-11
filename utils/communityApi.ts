import axios from 'axios';
import { Post, PostImage } from '../types/community';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

const getSessionId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sessionId');
  }
  return null;
};

// 백엔드 응답 타입
export interface CommunityResponse {
  community_id: number;
  user_id: number;
  title: string;
  category: string;
  sub_category: string | null;
  product_name: string | null;
  brewery_name: string | null;
  star: number | null;
  detail: string;
  tags: string | null;
  created_at: string;
  view_count: number;
  likes: number;
  comments: number;
  is_liked: boolean;
}

export interface CommunityListResponse {
  community_id: number;
  user_id: number;
  title: string;
  category: string;
  sub_category: string | null;
  created_at: string;
  view_count: number;
  likes: number;
  comments: number;
  is_liked?: boolean;
}

export interface CommunityImageResponse {
  image_community_id: number;
  community_id: number;
  image_num: number;
  image_url: string;
}

export interface CommentResponse {
  comment_id: number;
  community_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PageResponse<T> {
  content: T[];
  page_number: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  is_first: boolean;
  is_last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  content: T;
}

// 요청 타입
export interface CreateCommunityRequest {
  title: string;
  category: string;
  detail: string;
  subCategory?: string;
  productName?: string;
  breweryName?: string;
  star?: number;
  tags?: string;
  images?: File[];
}

export interface CreateCommentRequest {
  communityId: number;
  parentCommentId?: number;
  content: string;
}


export interface Comment {
  commentId: number;
  communityId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  replies?: Comment[];
}

export interface PageData<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

// 기본 설정
const defaultSubCategories: Record<string, string> = {
  notice: 'announcement',
  free: 'general',
  drink_review: 'makgeolli',
  brewery_review: 'visit'
};

const getFormDataHeaders = () => {
  const headers: Record<string, string> = {};
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  return headers;
};

const getJsonHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  return headers;
};

// 이미지 URL 변환 함수
const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // 이미 전체 URL인 경우 그대로 반환
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 파일명만 있는 경우 API 이미지 엔드포인트 URL로 변환
  return `${API_BASE_URL}/api/image/${imageUrl}`;
};

// 변환 함수
const transformCommunityToPost = (data: CommunityResponse): Post => ({
  post_id: data.community_id,
  title: data.title,
  content: data.detail,
  author: `사용자${data.user_id}`,
  author_id: data.user_id,
  category: data.category as any,
  created_at: data.created_at,
  view_count: data.view_count,
  like_count: data.likes,
  comment_count: data.comments,
  rating: data.star,
  brewery_name: data.brewery_name,
  product_name: data.product_name,
  tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
  images: [],
  is_liked: data.is_liked
});

const transformListToPost = (data: CommunityListResponse): Post => ({
  post_id: data.community_id,
  title: data.title,
  content: '',
  author: `사용자${data.user_id}`,
  author_id: data.user_id,
  category: data.category as any,
  created_at: data.created_at,
  view_count: data.view_count,
  like_count: data.likes,
  comment_count: data.comments,
  tags: [],
  images: [],
  is_liked: data.is_liked || false
});

const transformImageResponse = (data: CommunityImageResponse): PostImage => ({
  image_id: data.image_community_id,
  image_url: getFullImageUrl(data.image_url),
  image_order: data.image_num,
  alt_text: `이미지 ${data.image_num}`
});

const transformCommentResponse = (data: CommentResponse): Comment => ({
  commentId: data.comment_id,
  communityId: data.community_id,
  userId: data.user_id,
  parentCommentId: data.parent_comment_id,
  content: data.content,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  author: `사용자${data.user_id}`,
  replies: []
});

const transformPageResponse = <T, R>(
  data: PageResponse<T>,
  transformer: (item: T) => R
): PageData<R> => ({
  content: data.content.map(transformer),
  pageNumber: data.page_number,
  pageSize: data.page_size,
  totalElements: data.total_elements,
  totalPages: data.total_pages,
  isFirst: data.is_first,
  isLast: data.is_last
});

// API 함수
export const communityApi = {
  // 게시글 작성
  async createPost(data: CreateCommunityRequest): Promise<Post> {
    const formData = new FormData();
    
    formData.append('title', data.title.trim());
    formData.append('category', data.category.trim());
    formData.append('detail', data.detail.trim());
    
    const subCategory = (data.subCategory && data.subCategory.trim()) 
      ? data.subCategory.trim()
      : defaultSubCategories[data.category] || 'general';
    formData.append('subCategory', subCategory);
    
    if (data.productName && data.productName.trim()) {
      formData.append('productName', data.productName.trim());
    }
    if (data.breweryName && data.breweryName.trim()) {
      formData.append('breweryName', data.breweryName.trim());
    }
    if (data.star && data.star > 0) {
      formData.append('star', data.star.toString());
    }
    if (data.tags && data.tags.trim()) {
      formData.append('tags', data.tags.trim());
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image && image.size > 0) {
          formData.append('images', image);
        }
      });
    }

    const response = await axios.post<ApiResponse<CommunityResponse>>(
      `${API_BASE_URL}/api/community`,
      formData,
      { headers: getFormDataHeaders(), withCredentials: true }
    );
    
    return transformCommunityToPost(response.data.content);
  },

  // 전체 게시글 조회
  async getAllPosts(): Promise<Post[]> {
    const response = await axios.get<ApiResponse<CommunityListResponse[]>>(
      `${API_BASE_URL}/api/community`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformListToPost);
  },

  // 전체 게시글 조회 (페이징)
  async getAllPostsWithPaging(page: number = 0): Promise<PageData<Post>> {
    const response = await axios.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `${API_BASE_URL}/api/community/page?page=${page}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  // 카테고리별 게시글 조회
  async getPostsByCategory(category: string): Promise<Post[]> {
    const response = await axios.get<ApiResponse<CommunityListResponse[]>>(
      `${API_BASE_URL}/api/community/category/${category}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformListToPost);
  },

  // 카테고리별 게시글 조회 (페이징)
  async getPostsByCategoryWithPaging(category: string, page: number = 0): Promise<PageData<Post>> {
    const response = await axios.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `${API_BASE_URL}/api/community/category/${category}/page?page=${page}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  // 사용자별 게시글 조회
  async getPostsByUser(userId: number): Promise<Post[]> {
    const response = await axios.get<ApiResponse<CommunityListResponse[]>>(
      `${API_BASE_URL}/api/community/user/${userId}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformListToPost);
  },

  // 사용자별 게시글 조회 (페이징)
  async getPostsByUserWithPaging(userId: number, page: number = 0): Promise<PageData<Post>> {
    const response = await axios.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `${API_BASE_URL}/api/community/user/${userId}/page?page=${page}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  // 게시글 상세 조회
  async getPostDetail(communityId: number): Promise<Post> {
    const [postResponse, imagesResponse] = await Promise.all([
      axios.get<ApiResponse<CommunityResponse>>(
        `${API_BASE_URL}/api/community/${communityId}`,
        { headers: getJsonHeaders(), withCredentials: true }
      ),
      axios.get<ApiResponse<CommunityImageResponse[]>>(
        `${API_BASE_URL}/api/community/image/${communityId}`,
        { headers: getJsonHeaders(), withCredentials: true }
      ).catch(() => ({ data: { content: [] } }))
    ]);
    
    const post = transformCommunityToPost(postResponse.data.content);
    post.images = imagesResponse.data.content.map(transformImageResponse);
    
    return post;
  },

  // 게시글 수정
  async updatePost(communityId: number, data: CreateCommunityRequest): Promise<Post> {
    const formData = new FormData();
    
    formData.append('title', data.title.trim());
    formData.append('category', data.category.trim());
    formData.append('detail', data.detail.trim());
    
    const subCategory = (data.subCategory && data.subCategory.trim()) 
      ? data.subCategory.trim()
      : defaultSubCategories[data.category] || 'general';
    formData.append('subCategory', subCategory);
    
    if (data.productName) formData.append('productName', data.productName.trim());
    if (data.breweryName) formData.append('breweryName', data.breweryName.trim());
    if (data.star && data.star > 0) formData.append('star', data.star.toString());
    if (data.tags) formData.append('tags', data.tags.trim());
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image && image.size > 0) formData.append('images', image);
      });
    }

    const response = await axios.post<ApiResponse<CommunityResponse>>(
      `${API_BASE_URL}/api/community/${communityId}`,
      formData,
      { headers: getFormDataHeaders(), withCredentials: true }
    );
    
    return transformCommunityToPost(response.data.content);
  },

  // 게시글 삭제
  async deletePost(communityId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/community/${communityId}`, {
      headers: getJsonHeaders(),
      withCredentials: true
    });
  },

  // 좋아요
  async likePost(communityId: number): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/api/community/${communityId}/like`,
      {},
      { headers: getJsonHeaders(), withCredentials: true }
    );
  },

  // 좋아요 취소
  async unlikePost(communityId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/community/${communityId}/like`, {
      headers: getJsonHeaders(),
      withCredentials: true
    });
  },

  // 이미지 업로드
  async uploadImage(communityId: number, imageNum: number, file: File): Promise<PostImage> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<ApiResponse<CommunityImageResponse>>(
      `${API_BASE_URL}/api/community/image/${communityId}?imageNum=${imageNum}`,
      formData,
      { headers: getFormDataHeaders(), withCredentials: true }
    );
    
    return transformImageResponse(response.data.content);
  },

  // 이미지 조회
  async getImages(communityId: number): Promise<PostImage[]> {
    const response = await axios.get<ApiResponse<CommunityImageResponse[]>>(
      `${API_BASE_URL}/api/community/image/${communityId}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformImageResponse);
  },

  // 이미지 삭제
  async deleteImage(imageId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/community/image/${imageId}`, {
      headers: getJsonHeaders(),
      withCredentials: true
    });
  },

  // 댓글 작성
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const formData = new FormData();
    formData.append('communityId', data.communityId.toString());
    formData.append('content', data.content);
    if (data.parentCommentId) {
      formData.append('parentCommentId', data.parentCommentId.toString());
    }

    const response = await axios.post<ApiResponse<CommentResponse>>(
      `${API_BASE_URL}/api/comment`,
      formData,
      { headers: getFormDataHeaders(), withCredentials: true }
    );
    
    return transformCommentResponse(response.data.content);
  },

  // 댓글 조회
  async getComments(communityId: number): Promise<Comment[]> {
    const response = await axios.get<ApiResponse<CommentResponse[]>>(
      `${API_BASE_URL}/api/comment/community/${communityId}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformCommentResponse);
  },

  // 대댓글 조회
  async getReplies(parentCommentId: number): Promise<Comment[]> {
    const response = await axios.get<ApiResponse<CommentResponse[]>>(
      `${API_BASE_URL}/api/comment/replies/${parentCommentId}`,
      { headers: getJsonHeaders(), withCredentials: true }
    );
    return response.data.content.map(transformCommentResponse);
  },

  // 댓글 수정
  async updateComment(commentId: number, content: string): Promise<Comment> {
    const response = await axios.post<ApiResponse<CommentResponse>>(
      `${API_BASE_URL}/api/comment/${commentId}?content=${encodeURIComponent(content)}`,
      {},
      { headers: getJsonHeaders(), withCredentials: true }
    );
    
    return transformCommentResponse(response.data.content);
  },

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/comment/${commentId}`, {
      headers: getJsonHeaders(),
      withCredentials: true
    });
  }
};

export default communityApi;