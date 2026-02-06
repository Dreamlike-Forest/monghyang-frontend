import apiClient from './api';
import { Post, PostImage } from '../types/community';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

const defaultSubCategories: Record<string, string> = {
  notice: 'announcement',
  free: 'general',
  drink_review: 'makgeolli',
  brewery_review: 'visit'
};

const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API_BASE_URL}/api/image/${imageUrl}`;
};

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

// FormData 전송 시 Content-Type을 비워야 브라우저가 boundary를 자동 설정함
const formDataConfig = {
  headers: { 'Content-Type': undefined as unknown as string }
};

const buildFormData = (data: CreateCommunityRequest): FormData => {
  const formData = new FormData();

  formData.append('title', data.title.trim());
  formData.append('category', data.category.trim());
  formData.append('detail', data.detail.trim());

  const subCategory = data.subCategory?.trim() || defaultSubCategories[data.category] || 'general';
  formData.append('subCategory', subCategory);

  if (data.productName?.trim()) formData.append('productName', data.productName.trim());
  if (data.breweryName?.trim()) formData.append('breweryName', data.breweryName.trim());
  if (data.star && data.star > 0) formData.append('star', data.star.toString());
  if (data.tags?.trim()) formData.append('tags', data.tags.trim());

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      if (image && image.size > 0) {
        formData.append('images', image);
      }
    });
  }

  return formData;
};

export const communityApi = {

  async createPost(data: CreateCommunityRequest): Promise<Post> {
    const formData = buildFormData(data);
    const response = await apiClient.post<ApiResponse<CommunityResponse>>(
      '/api/community',
      formData,
      formDataConfig
    );
    return transformCommunityToPost(response.data.content);
  },

  async getAllPosts(): Promise<Post[]> {
    const response = await apiClient.get<ApiResponse<CommunityListResponse[]>>(
      '/api/community'
    );
    return response.data.content.map(transformListToPost);
  },

  async getAllPostsWithPaging(page: number = 0): Promise<PageData<Post>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `/api/community/page/${page}`
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  async getPostsByCategory(category: string): Promise<Post[]> {
    const response = await apiClient.get<ApiResponse<CommunityListResponse[]>>(
      `/api/community/category/${encodeURIComponent(category)}`
    );
    return response.data.content.map(transformListToPost);
  },

  async getPostsByCategoryWithPaging(category: string, page: number = 0): Promise<PageData<Post>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `/api/community/category/${encodeURIComponent(category)}/page/${page}`
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  async getPostsByUser(userId: number): Promise<Post[]> {
    const response = await apiClient.get<ApiResponse<CommunityListResponse[]>>(
      `/api/community/user/${userId}`
    );
    return response.data.content.map(transformListToPost);
  },

  async getPostsByUserWithPaging(userId: number, page: number = 0): Promise<PageData<Post>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CommunityListResponse>>>(
      `/api/community/user/${userId}/page/${page}`
    );
    return transformPageResponse(response.data.content, transformListToPost);
  },

  async getPostDetail(communityId: number): Promise<Post> {
    const [postResponse, imagesResponse] = await Promise.all([
      apiClient.get<ApiResponse<CommunityResponse>>(
        `/api/community/${communityId}`
      ),
      apiClient.get<ApiResponse<CommunityImageResponse[]>>(
        `/api/community/image/${communityId}`
      ).catch(() => ({ data: { content: [] } }))
    ]);

    const post = transformCommunityToPost(postResponse.data.content);
    post.images = imagesResponse.data.content.map(transformImageResponse);
    return post;
  },

  async updatePost(communityId: number, data: CreateCommunityRequest): Promise<Post> {
    const formData = buildFormData(data);
    const response = await apiClient.post<ApiResponse<CommunityResponse>>(
      `/api/community/${communityId}`,
      formData,
      formDataConfig
    );
    return transformCommunityToPost(response.data.content);
  },

  async deletePost(communityId: number): Promise<void> {
    await apiClient.delete(`/api/community/${communityId}`);
  },

  async likePost(communityId: number): Promise<void> {
    await apiClient.post(`/api/community/${communityId}/like`, {});
  },

  async unlikePost(communityId: number): Promise<void> {
    await apiClient.delete(`/api/community/${communityId}/like`);
  },

  async uploadImage(communityId: number, imageNum: number, file: File): Promise<PostImage> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<CommunityImageResponse>>(
      `/api/community/image/${communityId}?imageNum=${imageNum}`,
      formData,
      formDataConfig
    );
    return transformImageResponse(response.data.content);
  },

  async getImages(communityId: number): Promise<PostImage[]> {
    const response = await apiClient.get<ApiResponse<CommunityImageResponse[]>>(
      `/api/community/image/${communityId}`
    );
    return response.data.content.map(transformImageResponse);
  },

  async deleteImage(imageId: number): Promise<void> {
    await apiClient.delete(`/api/community/image/${imageId}`);
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const formData = new FormData();
    formData.append('communityId', data.communityId.toString());
    formData.append('content', data.content);
    if (data.parentCommentId) {
      formData.append('parentCommentId', data.parentCommentId.toString());
    }

    const response = await apiClient.post<ApiResponse<CommentResponse>>(
      '/api/comment',
      formData,
      formDataConfig
    );
    return transformCommentResponse(response.data.content);
  },

  async getComments(communityId: number): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<CommentResponse[]>>(
      `/api/comment/community/${communityId}`
    );
    return response.data.content.map(transformCommentResponse);
  },

  async getReplies(parentCommentId: number): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<CommentResponse[]>>(
      `/api/comment/replies/${parentCommentId}`
    );
    return response.data.content.map(transformCommentResponse);
  },

  async updateComment(commentId: number, content: string): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<CommentResponse>>(
      `/api/comment/${commentId}?content=${encodeURIComponent(content)}`,
      {}
    );
    return transformCommentResponse(response.data.content);
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/api/comment/${commentId}`);
  }
};

export default communityApi;