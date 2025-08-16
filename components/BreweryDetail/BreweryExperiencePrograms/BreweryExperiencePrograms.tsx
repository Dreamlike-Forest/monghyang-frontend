'use client';

import React, { useState } from 'react';
import { Brewery } from '../../../types/mockData';
import ExperienceReservation from '../../ExperienceReservation/ExperienceReservation';
import './BreweryExperiencePrograms.css';

interface BreweryExperienceProgramsProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
  onExperienceReservation?: (experienceId: number) => void;
}

const BreweryExperiencePrograms: React.FC<BreweryExperienceProgramsProps> = ({ 
  brewery, 
  forwardRef,
  onExperienceReservation
}) => {
  const [showReservation, setShowReservation] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);

  const handleReservation = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
    setShowReservation(true);
    
    if (onExperienceReservation) {
      onExperienceReservation(experienceId);
    }
  };

  const handleCloseReservation = () => {
    setShowReservation(false);
    setSelectedExperienceId(null);
  };

  // 예약 모달이 열려있을 때 배경 스크롤 방지
  React.useEffect(() => {
    if (showReservation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReservation]);

  return (
    <>
      <div ref={forwardRef} className="section-container" id="experience">
        <h2 className="section-title">체험 프로그램</h2>
        
        {brewery.experience_programs && brewery.experience_programs.length > 0 ? (
          <div className="brewery-experience-grid">
            {brewery.experience_programs.map((program) => (
              <div key={program.joy_id} className="brewery-experience-card">
                <div className="brewery-experience-header">
                  <h3 className="brewery-experience-title">{program.name}</h3>
                  <span className="brewery-experience-price">
                    {program.price.toLocaleString()}원
                  </span>
                </div>
                
                <div className="brewery-experience-content">
                  <div className="brewery-experience-place">
                    <span className="brewery-place-icon">📍</span>
                    {program.place}
                  </div>
                  
                  <p className="brewery-experience-description">
                    {program.detail}
                  </p>
                </div>
                
                <button 
                  className="brewery-experience-reserve-btn"
                  onClick={() => handleReservation(program.joy_id)}
                >
                  예약하기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="brewery-empty-state">
            <p>현재 운영 중인 체험 프로그램이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 체험 예약 모달 */}
      {showReservation && (
        <div className="reservation-modal-wrapper">
          <ExperienceReservation
            brewery={brewery}
            experienceId={selectedExperienceId || undefined}
            onClose={handleCloseReservation}
          />
        </div>
      )}
    </>
  );
};

export default BreweryExperiencePrograms;