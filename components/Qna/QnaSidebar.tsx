import React from 'react';
import { QnaTab } from '../../types/qna';
import './Qna.css';

interface QnaSidebarProps {
  activeTab: QnaTab;
  onTabChange: (tab: QnaTab) => void;
}

const QnaSidebar: React.FC<QnaSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="qna-sidebar">
      <ul className="qna-menu-list">
        <li 
          className={`qna-menu-item ${activeTab === 'list' ? 'qna-menu-item-active' : ''}`}
          onClick={() => onTabChange('list')}
        >
          나의 문의 내역
        </li>
        <li 
          className={`qna-menu-item ${activeTab === 'write' ? 'qna-menu-item-active' : ''}`}
          onClick={() => onTabChange('write')}
        >
          1:1 문의하기
        </li>
      </ul>
    </aside>
  );
};

export default QnaSidebar;