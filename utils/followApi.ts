import apiClient from './api';

// 응답 타입 정의
export interface FollowUser {
  userId: number;
  nickname: string;
  email: string;
  followedAt: string;
  isFollowing: boolean;
}

export interface FollowCount {
  userId: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowPageResponse {
  first: boolean;
  last: boolean;
  content: FollowUser[];
  page_number: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  is_first: boolean;
  is_last: boolean;
}

// 현재 로그인한 유저 ID 추출
const getCurrentUserId = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.users_id || parsed.userId || parsed.id || 0;
    }
  } catch (e) {
    console.error('유저 ID 조회 실패:', e);
  }
  return 0;
};

// 팔로우
export const followUser = async (userId: number): Promise<boolean> => {
  const currentUserId = getCurrentUserId();
  try {
    await apiClient.post(`/api/follow/${userId}`, {}, {
      params: { currentUserId }
    });
    return true;
  } catch (error) {
    console.error('팔로우 실패:', error);
    return false;
  }
};

// 언팔로우
export const unfollowUser = async (userId: number): Promise<boolean> => {
  const currentUserId = getCurrentUserId();
  try {
    await apiClient.delete(`/api/follow/${userId}`, {
      params: { currentUserId }
    });
    return true;
  } catch (error) {
    console.error('언팔로우 실패:', error);
    return false;
  }
};

// 팔로우 상태 확인
export const getFollowStatus = async (userId: number): Promise<boolean> => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return false;
  try {
    const response = await apiClient.get(`/api/follow/${userId}/status`, {
      params: { currentUserId }
    });
    return response.data.content ?? false;
  } catch (error) {
    console.error('팔로우 상태 확인 실패:', error);
    return false;
  }
};

// 팔로잉 목록 조회 (전체)
export const getFollowings = async (userId: number): Promise<FollowUser[]> => {
  try {
    const response = await apiClient.get(`/api/follow/${userId}/followings`);
    return response.data.content || [];
  } catch (error) {
    console.error('팔로잉 목록 조회 실패:', error);
    return [];
  }
};

// 팔로잉 목록 페이징 조회
export const getFollowingsWithPage = async (
  userId: number,
  page: number
): Promise<FollowPageResponse> => {
  const emptyResponse: FollowPageResponse = {
    first: true,
    last: true,
    content: [],
    page_number: 0,
    page_size: 10,
    total_elements: 0,
    total_pages: 0,
    is_first: true,
    is_last: true
  };
  try {
    const response = await apiClient.get(`/api/follow/${userId}/followings/page/${page}`);
    return response.data.content || emptyResponse;
  } catch (error) {
    console.error('팔로잉 목록(페이징) 조회 실패:', error);
    return emptyResponse;
  }
};

// 팔로워 목록 조회 (전체)
export const getFollowers = async (userId: number): Promise<FollowUser[]> => {
  const currentUserId = getCurrentUserId();
  try {
    const response = await apiClient.get(`/api/follow/${userId}/followers`, {
      params: { currentUserId }
    });
    return response.data.content || [];
  } catch (error) {
    console.error('팔로워 목록 조회 실패:', error);
    return [];
  }
};

// 팔로워 목록 페이징 조회
export const getFollowersWithPage = async (
  userId: number,
  page: number
): Promise<FollowPageResponse> => {
  const currentUserId = getCurrentUserId();
  const emptyResponse: FollowPageResponse = {
    first: true,
    last: true,
    content: [],
    page_number: 0,
    page_size: 10,
    total_elements: 0,
    total_pages: 0,
    is_first: true,
    is_last: true
  };
  try {
    const response = await apiClient.get(
      `/api/follow/${userId}/followers/page/${page}`,
      { params: { currentUserId } }
    );
    return response.data.content || emptyResponse;
  } catch (error) {
    console.error('팔로워 목록(페이징) 조회 실패:', error);
    return emptyResponse;
  }
};

// 팔로우 카운트 조회 (팔로워 수, 팔로잉 수, 팔로우 여부)
export const getFollowCount = async (userId: number): Promise<FollowCount | null> => {
  const currentUserId = getCurrentUserId();
  try {
    const response = await apiClient.get(`/api/follow/${userId}/count`, {
      params: { currentUserId }
    });
    return response.data.content || null;
  } catch (error) {
    console.error('팔로우 카운트 조회 실패:', error);
    return null;
  }
};

export { getCurrentUserId };