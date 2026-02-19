import React from 'react';
import './Follow.css';

export type FollowTab = 'followers' | 'followings';

interface FollowSidebarProps {
  activeTab: FollowTab;
  onTabChange: (tab: FollowTab) => void;
  followerCount: number;
  followingCount: number;
}

const FollowSidebar: React.FC<FollowSidebarProps> = ({
  activeTab,
  onTabChange,
  followerCount,
  followingCount
}) => {
  return (
    <aside className="follow-sidebar">
      <ul className="follow-menu-list">
        <li
          className={`follow-menu-item ${activeTab === 'followers' ? 'follow-menu-item-active' : ''}`}
          onClick={() => onTabChange('followers')}
        >
          팔로워
          <span className="follow-menu-count">{isNaN(followerCount) ? 0 : (followerCount || 0)}</span>
        </li>
        <li
          className={`follow-menu-item ${activeTab === 'followings' ? 'follow-menu-item-active' : ''}`}
          onClick={() => onTabChange('followings')}
        >
          팔로잉
          <span className="follow-menu-count">{isNaN(followingCount) ? 0 : (followingCount || 0)}</span>
        </li>
      </ul>
    </aside>
  );
};

export default FollowSidebar;