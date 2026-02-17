'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FollowSidebar, { FollowTab } from './FollowSidebar';
import {
  getFollowCount,
  getFollowersWithPage,
  getFollowingsWithPage,
  followUser,
  unfollowUser,
  getCurrentUserId,
  FollowUser,
  FollowCount,
  FollowPageResponse
} from '../../utils/followApi';
import './Follow.css';

const Follow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FollowTab>('followers');
  const [followCount, setFollowCount] = useState<FollowCount>({
    userId: 0,
    followerCount: 0,
    followingCount: 0,
    isFollowing: false
  });
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<Omit<FollowPageResponse, 'content'> | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const myUserId = getCurrentUserId();

  // 팔로우 카운트 조회
  const loadFollowCount = useCallback(async () => {
    if (!myUserId) return;
    const count = await getFollowCount(myUserId);
    if (count) setFollowCount(count);
  }, [myUserId]);

  // 유저 목록 조회
  const loadUsers = useCallback(async (tab: FollowTab, page: number) => {
    if (!myUserId) return;
    setIsLoading(true);
    try {
      let result: FollowPageResponse;
      if (tab === 'followers') {
        result = await getFollowersWithPage(myUserId, page);
      } else {
        result = await getFollowingsWithPage(myUserId, page);
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
    loadFollowCount();
  }, [loadFollowCount]);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  useEffect(() => {
    loadUsers(activeTab, currentPage);
  }, [activeTab, currentPage, loadUsers]);

  // 팔로우/언팔로우 토글
  const handleFollowToggle = async (user: FollowUser) => {
    if (processingIds.has(user.userId)) return;

    setProcessingIds(prev => new Set(prev).add(user.userId));
    try {
      if (user.isFollowing) {
        const ok = await unfollowUser(user.userId);
        if (ok) {
          setUsers(prev =>
            prev.map(u => u.userId === user.userId ? { ...u, isFollowing: false } : u)
          );
          setFollowCount(prev => ({
            ...prev,
            followingCount: Math.max(0, prev.followingCount - 1)
          }));
        }
      } else {
        const ok = await followUser(user.userId);
        if (ok) {
          setUsers(prev =>
            prev.map(u => u.userId === user.userId ? { ...u, isFollowing: true } : u)
          );
          setFollowCount(prev => ({
            ...prev,
            followingCount: prev.followingCount + 1
          }));
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
              {/* 아바타 */}
              <div className="follow-user-avatar">
                {getAvatarChar(user.nickname)}
              </div>

              {/* 유저 정보 */}
              <div className="follow-user-info">
                <div className="follow-user-nickname">{user.nickname}</div>
                <div className="follow-user-email">{user.email}</div>
                <div className="follow-user-date">
                  {activeTab === 'followers' ? '팔로우한 날짜' : '팔로잉한 날짜'}: {formatDate(user.followedAt)}
                </div>
              </div>

              {/* 팔로우/언팔로우 버튼 (본인 제외) */}
              {user.userId !== myUserId && (
                <button
                  className={`follow-action-btn ${user.isFollowing ? 'is-following' : 'not-following'}`}
                  onClick={() => handleFollowToggle(user)}
                  disabled={processingIds.has(user.userId)}
                >
                  {processingIds.has(user.userId)
                    ? '처리 중...'
                    : user.isFollowing
                    ? '팔로잉'
                    : '팔로우'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
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
        {/* 사이드바 */}
        <FollowSidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          followerCount={followCount.followerCount}
          followingCount={followCount.followingCount}
        />

        {/* 메인 콘텐츠 */}
        <main className="follow-main-content">
          {renderUserList()}
        </main>
      </div>
    </div>
  );
};

export default Follow;