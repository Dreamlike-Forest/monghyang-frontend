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
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(brewery);
    } else {
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  const navigateToBreweryDetail = (breweryId: number) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleImageLoad = () => setImageStatus('loaded');
  const handleImageError = () => setImageStatus('error');

  const getImageUrl = (imageKey: string | undefined): string => {
    if (!imageKey) return '';
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://') || imageKey.startsWith('/')) {
      return imageKey;
    }
    return `/images/breweries/${imageKey}`;
  };

  const imageUrl = getImageUrl(brewery.image_key);
  const hasValidImage = imageUrl && !imageUrl.includes('/api/placeholder') && imageUrl !== '';

  const PlaceholderImage = () => (
    <div className="brewery-image-placeholder">
      <div className="brewery-placeholder-icon">🏭</div>
      <div className="brewery-placeholder-text">{imageStatus === 'loading' ? '이미지 로딩 중...' : '이미지 준비 중'}</div>
    </div>
  );

  // 체험 프로그램 정보 추출 (안전한 접근)
  // brewery_joy_count가 undefined일 수 있으므로 0보다 큰지 확인
  const joyCount = brewery.brewery_joy_count || 0;
  const minPrice = brewery.brewery_joy_min_price || 0;
  const hasPrograms = joyCount > 0;

  const tags = brewery.tag_name || brewery.tags_name || brewery.alcohol_types || [];

  return (
    <div 
      className="brewery-card" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as any); } }}
    >
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
        ) : <PlaceholderImage />}
        
        {brewery.badges && brewery.badges.length > 0 && (
          <div className="brewery-image-badge-container">
            {brewery.badges.slice(0, 2).map((badge, index) => (
              badge.type === 'image' ? (
                <img key={index} src={badge.content} alt={badge.alt} className="brewery-image-badge" />
              ) : (
                <div key={index} className="brewery-text-badge" style={{ backgroundColor: badge.color }}>{badge.content}</div>
              )
            ))}
          </div>
        )}
        <div className="brewery-card-overlay"><span className="brewery-view-detail-text">상세보기</span></div>
      </div>
      
      <div className="brewery-card-content">
        <h3 className="brewery-card-title">{brewery.brewery_name || '이름 없음'}</h3>
        
        <div className="brewery-card-location">
          <span className="brewery-location-icon">📍</span>
          <span>{brewery.region_type_name || '지역 정보 없음'}</span>
        </div>
        
        <p className="brewery-card-description">
          {brewery.brewery_introduction || `${brewery.brewery_name}입니다.`}
        </p>

        {tags.length > 0 && (
          <div className="brewery-card-tags">
            {tags.slice(0, 3).map((type, index) => <span key={index} className="brewery-card-tag">{type}</span>)}
            {tags.length > 3 && <span className="brewery-card-tag">+{tags.length - 3}</span>}
          </div>
        )}

        <div className="brewery-experience-section">
          <div className="brewery-experience-info">
            {hasPrograms ? (
              <>
                <div className="brewery-experience-title">체험 프로그램 {joyCount}개</div>
                <div className="brewery-experience-price">{minPrice.toLocaleString()}원부터</div>
              </>
            ) : (
              // 체험 프로그램이 없을 때
              <div className="brewery-experience-title" style={{ color: '#888' }}>
                체험 프로그램 준비 중
              </div>
            )}
          </div>
          <button className="brewery-view-button">자세히 보기 →</button>
        </div>
      </div>
    </div>
  );
};

export default BreweryCard;