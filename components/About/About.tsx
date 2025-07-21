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

  // 스크롤 이벤트로 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'summary', ref: summaryRef },
        { id: 'badge', ref: badgeRef },
        { id: 'brewery-role', ref: breweryRoleRef },
        { id: 'tradition', ref: traditionRef }
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 네비게이션 클릭 핸들러
  const handleSectionClick = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const offsetTop = ref.current.offsetTop - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setActiveSection(sectionId);
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