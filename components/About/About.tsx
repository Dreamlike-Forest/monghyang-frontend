'use client';

import React, { useRef, useState, useEffect } from 'react';
import AboutNavigation from './AboutNavigation/AboutNavigation';
import ServiceSummary from './ServiceSummary/ServiceSummary';
import BadgeSection from './BadgeSection/BadgeSection';
import BreweryRole from './BreweryRole/BreweryRole';
import TraditionDefinition from './TraditionDefinition/TraditionDefinition';
import './About.css';

const About: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('summary');
  
  // 각 섹션의 ref
  const summaryRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const breweryRoleRef = useRef<HTMLDivElement>(null);
  const traditionRef = useRef<HTMLDivElement>(null);

  const refs = {
    summaryRef,
    badgeRef,
    breweryRoleRef,
    traditionRef
  };

  // 컴포넌트 마운트 시 스크롤 동작 강제 설정
  useEffect(() => {
    // 즉시 스크롤 이동을 위한 스타일 설정
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    return () => {
      // 컴포넌트 언마운트 시 정리 (필요시)
    };
  }, []);

  // 스크롤 이벤트로 활성 섹션 감지 - 즉시 반응
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'summary', ref: summaryRef },
        { id: 'badge', ref: badgeRef },
        { id: 'brewery-role', ref: breweryRoleRef },
        { id: 'tradition', ref: traditionRef }
      ];

      const scrollPosition = window.scrollY + 200;

      // 역순으로 체크해서 가장 먼저 조건에 맞는 섹션을 찾기
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            if (activeSection !== section.id) {
              setActiveSection(section.id);
            }
            return;
          }
        }
      }
    };

    // 디바운스 없이 즉시 실행
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 로드 시 실행

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // 네비게이션 클릭 핸들러 - 즉시 이동
  const handleSectionClick = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    // 즉시 활성 섹션 업데이트
    setActiveSection(sectionId);
    
    if (ref.current) {
      const offsetTop = ref.current.offsetTop - 120;
      // 즉시 이동 (smooth behavior 제거)
      window.scrollTo(0, offsetTop);
    }
  };

  return (
    <div className="about-container">
      <div className="about-layout">
        {/* 좌측 네비게이션 */}
        <AboutNavigation 
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          refs={refs}
        />

        {/* 메인 콘텐츠 */}
        <div className="about-content">
          <ServiceSummary ref={summaryRef} />
          <BadgeSection ref={badgeRef} />
          <BreweryRole ref={breweryRoleRef} />
          <TraditionDefinition ref={traditionRef} />
        </div>
      </div>
    </div>
  );
};

export default About;