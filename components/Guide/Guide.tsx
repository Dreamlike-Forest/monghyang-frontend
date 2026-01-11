'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import GuideSidebar, { GuideTab } from './GuideSidebar/GuideSidebar';
import { 
  MemberSection, 
  ReservationSection, 
  ShoppingSection, 
  CommunitySection 
} from './GuideSections/GuideSections';
import './Guide.css';

const Guide: React.FC = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<GuideTab>('member');

  // URL 파라미터로 탭 전환 지원 (Footer 등 외부 링크 연동)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['member', 'reservation', 'shopping', 'community'].includes(tab)) {
      setActiveTab(tab as GuideTab);
    }
  }, [searchParams]);

  // 탭에 따른 콘텐츠 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case 'member':
        return <MemberSection />;
      case 'reservation':
        return <ReservationSection />;
      case 'shopping':
        return <ShoppingSection />;
      case 'community':
        return <CommunitySection />;
      default:
        return <MemberSection />;
    }
  };

  return (
    <div className="guide-page-container">
      <div className="guide-page-header">
        <h1 className="guide-page-title">이용 안내</h1>
        <p className="guide-page-subtitle">몽향 서비스를 이용하는 방법을 안내해 드립니다.</p>
      </div>

      <div className="guide-layout-wrapper">
        <GuideSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <main className="guide-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Guide;