'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FollowSidebar, { FollowTab } from './FollowSidebar';
import {
  getFollowersWithPage,
  getFollowingsWithPage,
  followUser,
  unfollowUser,
  getCurrentUserId,
  FollowUser,
  FollowPageResponse
} from '../../utils/followApi';
import './Follow.css';

const Follow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FollowTab>('followers');
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<Omit<FollowPageResponse, 'content'> | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const myUserId = getCurrentUserId();

  // 초기 로드 시 두 탭 카운트 모두 가져오기
  useEffect(() => {
    const loadAllCounts = async () => {
      if (!myUserId) return;
      try {
        const [followerResult, followingResult] = await Promise.all([
          getFollowersWithPage(myUserId, 0),
          getFollowingsWithPage(myUserId, 0),
        ]);
        setFollowerCount(followerResult.total_elements ?? followerResult.content?.length ?? 0);
        setFollowingCount(followingResult.total_elements ?? followingResult.content?.length ?? 0);
      } catch {
        // 실패 시 0 유지
      }
    };
    loadAllCounts();
  }, [myUserId]);

  // 유저 목록 조회
  const loadUsers = useCallback(async (tab: FollowTab, page: number) => {
    if (!myUserId) return;
    setIsLoading(true);
    try {
      let result: FollowPageResponse;
      if (tab === 'followers') {
        result = await getFollowersWithPage(myUserId, page);
        if (page === 0) {
          setFollowerCount(result.total_elements ?? result.content?.length ?? 0);
        }
      } else {
        result = await getFollowingsWithPage(myUserId, page);
        if (page === 0) {
          setFollowingCount(result.total_elements ?? result.content?.length ?? 0);
        }
      }
      setUsers(result.content || []);
      const { content, ...rest } = result;
      setPageInfo(rest);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [myUserId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  useEffect(() => {
    loadUsers(activeTab, currentPage);
  }, [activeTab, currentPage, loadUsers]);

  // ─── 팔로잉 탭: 언팔로우 ─────────────────────────────────────────────────
  const handleUnfollow = async (user: FollowUser) => {
    if (processingIds.has(user.userId)) return;

    setProcessingIds(prev => new Set(prev).add(user.userId));
    try {
      const ok = await unfollowUser(user.userId);
      if (ok) {
        setUsers(prev => prev.filter(u => u.userId !== user.userId));
        setFollowingCount(prev => Math.max(0, prev - 1));
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(user.userId);
        return next;
      });
    }
  };

  // ─── 팔로워 탭: 팔로우 / 언팔로우 토글 ──────────────────────────────────
  const handleFollowerToggle = async (user: FollowUser) => {
    if (processingIds.has(user.userId)) return;

    setProcessingIds(prev => new Set(prev).add(user.userId));
    try {
      if (user.isFollowing) {
        const ok = await unfollowUser(user.userId);
        if (ok) {
          setUsers(prev =>
            prev.map(u => u.userId === user.userId ? { ...u, isFollowing: false } : u)
          );
          setFollowingCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const ok = await followUser(user.userId);
        if (ok) {
          setUsers(prev =>
            prev.map(u => u.userId === user.userId ? { ...u, isFollowing: true } : u)
          );
          setFollowingCount(prev => prev + 1);
        }
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(user.userId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getAvatarChar = (nickname: string) =>
    nickname?.charAt(0)?.toUpperCase() || '?';

  // ─── 팔로잉 탭 버튼 ──────────────────────────────────────────────────────
  const renderFollowingButton = (user: FollowUser) => {
    if (user.userId === myUserId) return null;
    const isProcessing = processingIds.has(user.userId);
    return (
      <button
        className="follow-action-btn unfollow"
        onClick={() => handleUnfollow(user)}
        disabled={isProcessing}
      >
        {isProcessing ? '처리 중...' : '언팔로우'}
      </button>
    );
  };

  // ─── 팔로워 탭 버튼 ──────────────────────────────────────────────────────
  const renderFollowerButton = (user: FollowUser) => {
    if (user.userId === myUserId) return null;
    const isProcessing = processingIds.has(user.userId);
    return (
      <button
        className={`follow-action-btn ${user.isFollowing ? 'is-following' : 'not-following'}`}
        onClick={() => handleFollowerToggle(user)}
        disabled={isProcessing}
      >
        {isProcessing
          ? '처리 중...'
          : user.isFollowing
          ? '언팔로우'
          : '팔로우'}
      </button>
    );
  };

  const renderUserList = () => {
    if (isLoading) {
      return (
        <div className="follow-loading">
          <div className="follow-loading-spinner" />
          불러오는 중...
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="follow-empty-state">
          <span className="follow-empty-icon">
            {activeTab === 'followers' ? '👥' : '🔍'}
          </span>
          <span className="follow-empty-text">
            {activeTab === 'followers'
              ? '아직 팔로워가 없습니다.'
              : '팔로잉한 사용자가 없습니다.'}
          </span>
        </div>
      );
    }

    return (
      <>
        <div className="follow-list-container">
          {users.map((user, index) => (
            <div key={`${user.userId}-${index}`} className="follow-user-item">
              <div className="follow-user-avatar">
                {getAvatarChar(user.nickname)}
              </div>
              <div className="follow-user-info">
                <div className="follow-user-nickname">{user.nickname}</div>
                <div className="follow-user-email">{user.email}</div>
                <div className="follow-user-date">
                  {activeTab === 'followers' ? '팔로우한 날짜' : '팔로잉한 날짜'}: {formatDate(user.followedAt)}
                </div>
              </div>
              {activeTab === 'followings'
                ? renderFollowingButton(user)
                : renderFollowerButton(user)
              }
            </div>
          ))}
        </div>

        {pageInfo && pageInfo.total_pages > 1 && (
          <div className="follow-pagination">
            <button
              className="follow-pagination-btn"
              disabled={pageInfo.is_first}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              이전
            </button>
            <span className="follow-pagination-info">
              {currentPage + 1} / {pageInfo.total_pages}
            </span>
            <button
              className="follow-pagination-btn"
              disabled={pageInfo.is_last}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              다음
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="follow-container">
      <div className="follow-page-header">
        <h1 className="follow-page-title">팔로우 관리</h1>
        <p className="follow-page-subtitle">나를 팔로우하는 사람과 내가 팔로우하는 사람을 확인하세요.</p>
      </div>

      <div className="follow-layout-wrapper">
        <FollowSidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          followerCount={followerCount}
          followingCount={followingCount}
        />
        <main className="follow-main-content">
          {renderUserList()}
        </main>
      </div>
    </div>
  );
};

export default Follow;