'use client';

import { useState } from 'react';
import type { Brewery } from '../../../types/mockData';
import './BreweryCard.css';

interface BreweryCardProps {
  brewery: Brewery;
  onClick?: (brewery: Brewery) => void;
}

const BreweryCard: React.FC<BreweryCardProps> = ({ brewery, onClick }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleClick = (e: React.MouseEvent) => {
    // 링크 클릭 등의 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(brewery);
    } else {
      // URL 기반 네비게이션으로 상세페이지 이동
      console.log(`${brewery.brewery_name} 상세 페이지로 이동`);
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  // 양조장 상세페이지로 이동하는 함수
  const navigateToBreweryDetail = (breweryId: number) => {
    const url = new URL(window.location.href);
    
    // 기존 파라미터 정리
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    
    // 양조장 상세페이지 파라미터 설정
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    // URL 업데이트 및 페이지 이동
    window.location.href = url.toString();
  };

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  // image_key를 실제 이미지 URL로 변환하는 함수
  const getImageUrl = (imageKey: string | undefined): string => {
    if (!imageKey) return '';
    
    // 이미지 키가 이미 전체 URL인 경우
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://') || imageKey.startsWith('/')) {
      return imageKey;
    }
    
    // 이미지 키를 기반으로 실제 URL 생성 (실제 구현 시 서버 설정에 따라 수정)
    return `/images/breweries/${imageKey}`;
  };

  // 이미지가 유효한지 확인 (placeholder 이미지 제외)
  const imageUrl = getImageUrl(brewery.image_key);
  const hasValidImage = imageUrl && 
    !imageUrl.includes('/api/placeholder') && 
    imageUrl !== '' &&
    imageUrl !== '/images/brewery-placeholder.jpg' &&
    imageUrl !== '/images/brewery-default.jpg';

  const PlaceholderImage = () => (
    <div className="brewery-image-placeholder">
      <div className="brewery-placeholder-icon">🏭</div>
      <div className="brewery-placeholder-text">
        {imageStatus === 'loading' ? '이미지 로딩 중...' : '이미지 준비 중'}
      </div>
    </div>
  );

  // 체험 프로그램 정보 계산
  const experienceInfo = brewery.experience_programs && brewery.experience_programs.length > 0 
    ? {
        count: brewery.experience_programs.length,
        minPrice: Math.min(...brewery.experience_programs.map(p => p.price))
      }
    : null;

  return (
    <div 
      className="brewery-card" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-label={`${brewery.brewery_name} 상세 정보 보기`}
    >
      {/* 상단 이미지 영역 */}
      <div className="brewery-card-image">
        {hasValidImage ? (
          <>
            {imageStatus === 'loading' && <PlaceholderImage />}
            <img 
              src={imageUrl} 
              alt={brewery.brewery_name}
              className={`brewery-image ${imageStatus === 'loading' ? 'brewery-image-loading' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageStatus === 'error' ? 'none' : 'block' }}
            />
            {imageStatus === 'error' && <PlaceholderImage />}
          </>
        ) : (
          <PlaceholderImage />
        )}

        {/* 배지 표시 */}
        {brewery.badges && brewery.badges.length > 0 && (
          <div className="brewery-image-badge-container">
            {brewery.badges.slice(0, 2).map((badge, index) => (
              badge.type === 'image' ? (
                <img 
                  key={index}
                  src={badge.content}
                  alt={badge.alt || badge.content}
                  className="brewery-image-badge"
                  title={badge.content}
                />
              ) : (
                <div
                  key={index}
                  className="brewery-text-badge"
                  style={{ 
                    backgroundColor: badge.color || '#8b5a3c'
                  }}
                  title={badge.content}
                >
                  {badge.content}
                </div>
              )
            ))}
          </div>
        )}

        {/* 호버 시 상세보기 텍스트 */}
        <div className="brewery-card-overlay">
          <span className="brewery-view-detail-text">상세보기</span>
        </div>
      </div>

      {/* 하단 콘텐츠 영역 */}
      <div className="brewery-card-content">
        {/* 양조장 이름 */}
        <h3 className="brewery-card-title">{brewery.brewery_name}</h3>
        
        {/* 지역 정보 */}
        <div className="brewery-card-location">
          <span className="brewery-location-icon">📍</span>
          <span>{brewery.region_name}</span>
        </div>

        {/* 설명 */}
        <p className="brewery-card-description">
          {brewery.introduction || `${brewery.brewery_name}에서 전통 방식으로 만드는 ${brewery.alcohol_types.join(', ')} 전문점입니다.`}
        </p>

        {/* 주종 태그 */}
        <div className="brewery-card-tags">
          {brewery.alcohol_types.slice(0, 3).map((type, index) => (
            <span key={index} className="brewery-card-tag">
              {type}
            </span>
          ))}
          {brewery.alcohol_types.length > 3 && (
            <span className="brewery-card-tag">
              +{brewery.alcohol_types.length - 3}
            </span>
          )}
        </div>

        {/* 체험 프로그램 정보 및 상세보기 버튼 */}
        <div className="brewery-experience-section">
          <div className="brewery-experience-info">
            {experienceInfo ? (
              <>
                <div className="brewery-experience-title">
                  체험 프로그램 {experienceInfo.count}개
                </div>
                <div className="brewery-experience-price">
                  {experienceInfo.minPrice.toLocaleString()}원부터
                </div>
              </>
            ) : (
              <div className="brewery-experience-title">
                양조장 정보
              </div>
            )}
          </div>
          
          <button className="brewery-view-button">
            자세히 보기 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreweryCard;