import React from 'react';
import './GuideSidebar.css';

export type GuideTab = 'member' | 'reservation' | 'shopping' | 'community';

interface GuideSidebarProps {
  activeTab: GuideTab;
  onTabChange: (tab: GuideTab) => void;
}

const GuideSidebar: React.FC<GuideSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="guide-sidebar-nav">
      <ul className="guide-nav-list">
        <li 
          className={`guide-nav-item ${activeTab === 'member' ? 'guide-nav-item-active' : ''}`}
          onClick={() => onTabChange('member')}
        >
          회원 및 계정
        </li>
        <li 
          className={`guide-nav-item ${activeTab === 'reservation' ? 'guide-nav-item-active' : ''}`}
          onClick={() => onTabChange('reservation')}
        >
          양조장 예약
        </li>
        <li 
          className={`guide-nav-item ${activeTab === 'shopping' ? 'guide-nav-item-active' : ''}`}
          onClick={() => onTabChange('shopping')}
        >
          전통주 쇼핑
        </li>
        <li 
          className={`guide-nav-item ${activeTab === 'community' ? 'guide-nav-item-active' : ''}`}
          onClick={() => onTabChange('community')}
        >
          커뮤니티 이용
        </li>
      </ul>
    </aside>
  );
};

export default GuideSidebar;