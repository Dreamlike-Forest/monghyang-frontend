'use client';

import React, { useState } from 'react';
import EditProfile from './EditProfile/EditProfile';
import DeleteAccount from './DeleteAccount/DeleteAccount';
import PasswordVerification from './PasswordVerification/PasswordVerification';
import ChangePassword from './ChangePassword/ChangePassword';
import './ProfileLayout.css';

const ProfileLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'password' | 'delete'>('edit');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  const handleTabChange = (tab: 'edit' | 'password' | 'delete') => {
    setActiveTab(tab);
  };

  // 인증 전에는 비밀번호 확인 컴포넌트 표시
  if (!isVerified) {
    return (
      <div className="profile-auth-wrapper">
        <PasswordVerification onSuccess={handleVerificationSuccess} />
      </div>
    );
  }

  return (
    <div className="profile-layout-container">
      <aside className="profile-sidebar">
        <h3 className="sidebar-title">내 정보</h3>
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => handleTabChange('edit')}
          >
            프로필 수정
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => handleTabChange('password')}
          >
            비밀번호 변경
          </li>
          <li 
            className={`sidebar-item delete-menu ${activeTab === 'delete' ? 'active' : ''}`}
            onClick={() => handleTabChange('delete')}
          >
            회원 탈퇴
          </li>
        </ul>
      </aside>

      <main className="profile-content">
        {activeTab === 'edit' && <EditProfile />}
        {activeTab === 'password' && <ChangePassword />}
        {activeTab === 'delete' && <DeleteAccount />}
      </main>
    </div>
  );
};

export default ProfileLayout;