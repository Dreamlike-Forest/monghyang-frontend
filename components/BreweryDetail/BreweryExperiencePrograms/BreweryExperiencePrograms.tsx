'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Brewery } from '../../../types/shop';
import ExperienceReservation from '../../ExperienceReservation/ExperienceReservation';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
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
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

  // [수정] 이미지 URL을 백엔드 API로 연결
  const getImageUrl = useCallback((imageKey: string | undefined): string => {
    if (!imageKey) return '';
    // 이미 전체 URL인 경우 (http로 시작)
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey;
    }
    
    // API 명세서에 따른 이미지 요청 URL 생성
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';
    return `${API_URL}/api/image/${imageKey}`;
  }, []);

  const hasValidImage = useCallback((imageKey: string | undefined): boolean => {
    if (!imageKey || imageKey.trim() === '') return false;
    const invalidPatterns = ['/api/placeholder', 'placeholder', 'undefined', 'null'];
    return !invalidPatterns.some(pattern => imageKey.toLowerCase().includes(pattern.toLowerCase()));
  }, []);

  const getExperienceImage = useCallback((program: any): string | undefined => {
    if (program.joy_image_key) {
      return getImageUrl(program.joy_image_key);
    }
    return undefined;
  }, [getImageUrl]);

  const handleImageLoad = useCallback((programId: number) => {
    setImageLoadStates(prev => ({ ...prev, [programId]: 'loaded' }));
  }, []);

  const handleImageError = useCallback((programId: number) => {
    setImageLoadStates(prev => ({ ...prev, [programId]: 'error' }));
  }, []);

  const handleReservation = (experienceId: number) => {
    const canProceed = checkAuthAndPrompt(
      '체험 예약 기능',
      () => console.log('로그인 페이지로 이동'),
      () => console.log('취소됨')
    );

    if (!canProceed) return;

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

  useEffect(() => {
    if (showReservation) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showReservation]);

  const programs = brewery.joy || [];

  return (
    <>
      <div ref={forwardRef} className="section-container" id="experience">
        <h2 className="section-title">체험 프로그램</h2>
        
        {programs.length > 0 ? (
          <div className="brewery-experience-grid">
            {programs.map((program) => {
              const imageUrl = getExperienceImage(program);
              const imageState = imageLoadStates[program.joy_id] || 'loading';
              
              return (
                <div key={program.joy_id} className="brewery-experience-card">
                  <div className="brewery-experience-image-container">
                    {hasValidImage(program.joy_image_key) ? (
                      <>
                        {imageState === 'loading' && (
                          <div className="brewery-experience-image-placeholder">
                            <div className="experience-placeholder-icon">📷</div>
                            <div className="experience-placeholder-text">이미지 로딩 중...</div>
                          </div>
                        )}
                        <img 
                          src={imageUrl} 
                          alt={`${program.joy_name} 이미지`}
                          className={`brewery-experience-image ${imageState === 'loading' ? 'image-loading' : ''}`}
                          style={{ display: imageState === 'error' ? 'none' : 'block' }}
                          onLoad={() => handleImageLoad(program.joy_id)}
                          onError={() => handleImageError(program.joy_id)}
                          loading="lazy"
                        />
                        {imageState === 'error' && (
                          <div className="brewery-experience-image-placeholder">
                            <div className="experience-placeholder-icon">🎯</div>
                            <div className="experience-placeholder-text">이미지 없음</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="brewery-experience-image-placeholder">
                        <div className="experience-placeholder-icon">🎯</div>
                        <div className="experience-placeholder-text">이미지 준비 중</div>
                      </div>
                    )}
                  </div>

                  <div className="brewery-experience-content">
                    <div className="brewery-experience-header">
                      <h3 className="brewery-experience-title">{program.joy_name}</h3>
                      <span className="brewery-experience-price">
                        {program.joy_final_price.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div className="brewery-experience-place">
                      <span className="brewery-place-icon">📍</span>
                      {program.joy_place}
                    </div>
                    
                    <p className="brewery-experience-description">
                      {program.joy_detail}
                    </p>
                    
                    <button 
                      className="brewery-experience-reserve-btn"
                      onClick={() => handleReservation(program.joy_id)}
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="brewery-empty-state">
            <p>현재 운영 중인 체험 프로그램이 없습니다.</p>
          </div>
        )}
      </div>

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