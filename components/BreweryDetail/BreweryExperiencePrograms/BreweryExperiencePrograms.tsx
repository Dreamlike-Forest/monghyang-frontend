'use client';

import React, { useState, useCallback } from 'react';
import { Brewery } from '../../../types/mockData';
import ExperienceReservation from '../../ExperienceReservation/ExperienceReservation';
import { checkAuthAndPrompt } from '../../../utils/authUtils';
import { getExperienceImageUrl, isValidImageUrl } from '../../../utils/ImageUtils';
import './BreweryExperiencePrograms.css';

interface BreweryExperienceProgramsProps {
  brewery: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
  onExperienceReservation?: (experienceId: number) => void;
}

const BreweryExperiencePrograms: React.FC<BreweryExperienceProgramsProps> = ({
  brewery,
  forwardRef,
  onExperienceReservation,
}) => {
  const [showReservation, setShowReservation] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<
    Record<number, 'loading' | 'loaded' | 'error'>
  >({});

  // 이미지 로드 핸들러
  const handleImageLoad = useCallback((programId: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [programId]: 'loaded',
    }));
  }, []);

  const handleImageError = useCallback((programId: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [programId]: 'error',
    }));
  }, []);

  // 체험 예약 핸들러 - 로그인 확인 추가
  const handleReservation = (experienceId: number) => {
    console.log('체험 예약 버튼 클릭 - 로그인 상태 확인');

    // 로그인 확인 및 유도
    const canProceed = checkAuthAndPrompt(
      '체험 예약 기능',
      () => {
        console.log('체험 예약 기능 - 로그인 페이지로 이동');
      },
      () => {
        console.log('체험 예약 취소됨');
      }
    );

    if (!canProceed) {
      return; // 로그인하지 않았거나 사용자가 취소한 경우
    }

    // 로그인된 사용자만 여기에 도달
    console.log('체험 예약 진행:', experienceId);
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

  // 타입 오류 방지를 위해 any 캐스팅한 래퍼 컴포넌트
  const ReservationComponent = ExperienceReservation as React.ComponentType<any>;

  return (
    <>
      <div ref={forwardRef} className="section-container" id="experience">
        <h2 className="section-title">체험 프로그램</h2>

        {brewery.experience_programs && brewery.experience_programs.length > 0 ? (
          <div className="brewery-experience-grid">
            {brewery.experience_programs.map(program => {
              // imageUtils 사용하여 이미지 URL 가져오기
              const imageUrl = getExperienceImageUrl(program);
              const hasImage = isValidImageUrl(imageUrl);
              const imageState = imageLoadStates[program.joy_id] || 'loading';

              return (
                <div key={program.joy_id} className="brewery-experience-card">
                  {/* 체험 프로그램 이미지 섹션 */}
                  <div className="brewery-experience-image-container">
                    {hasImage ? (
                      <>
                        {imageState === 'loading' && (
                          <div className="brewery-experience-image-placeholder">
                            <div className="experience-placeholder-icon">📷</div>
                            <div className="experience-placeholder-text">
                              이미지 로딩 중...
                            </div>
                          </div>
                        )}
                        <img
                          src={imageUrl}
                          alt={`${program.name} 체험 프로그램 이미지`}
                          className={`brewery-experience-image ${
                            imageState === 'loading' ? 'image-loading' : ''
                          }`}
                          style={{
                            display: imageState === 'error' ? 'none' : 'block',
                          }}
                          onLoad={() => handleImageLoad(program.joy_id)}
                          onError={() => handleImageError(program.joy_id)}
                          loading="lazy"
                        />
                        {imageState === 'error' && (
                          <div className="brewery-experience-image-placeholder">
                            <div className="experience-placeholder-icon">🎯</div>
                            <div className="experience-placeholder-text">
                              이미지를 불러올 수
                              <br />
                              없습니다.
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="brewery-experience-image-placeholder">
                        <div className="experience-placeholder-icon">🎯</div>
                        <div className="experience-placeholder-text">
                          체험 프로그램
                          <br />
                          이미지 준비 중
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 체험 프로그램 정보 섹션 */}
                  <div className="brewery-experience-content">
                    <div className="brewery-experience-header">
                      <h3 className="brewery-experience-title">{program.name}</h3>
                      <span className="brewery-experience-price">
                        {program.price.toLocaleString()}원
                      </span>
                    </div>

                    <div className="brewery-experience-place">
                      <span className="brewery-place-icon">📍</span>
                      {program.place}
                    </div>

                    <p className="brewery-experience-description">{program.detail}</p>

                    {/* 예약하기 버튼 - 로그인 확인 포함 */}
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
            <span>새로운 체험이 준비되면 가장 먼저 알려드릴게요.</span>
          </div>
        )}
      </div>

      {/* 체험 예약 모달 */}
      {showReservation && selectedExperienceId !== null && (
        <ReservationComponent
          brewery={brewery}
          experienceId={selectedExperienceId}
          onClose={handleCloseReservation}
          onReservationComplete={data => {
            console.log('예약 완료 데이터:', data);
          }}
        />
      )}
    </>
  );
};

export default BreweryExperiencePrograms;
