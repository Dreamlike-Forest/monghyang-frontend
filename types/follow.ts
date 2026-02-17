export interface FollowUser {
  user_id: number;
  nickname: string;
  profile_image?: string;
  is_following: boolean; // 현재 내가 팔로우 중인지 여부
}

// 팔로우 목록 응답용 (페이지네이션 고려)
export interface FollowListResponse {
  content: FollowUser[];
  totalPages: number;
  totalElements: number;
}