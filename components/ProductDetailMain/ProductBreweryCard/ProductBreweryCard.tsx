'use client';

import React, { useState } from 'react';
import { Brewery } from '../../../types/mockData';
import './ProductBreweryCard.css';

interface ProductBreweryCardProps {
  brewery?: Brewery;
  forwardRef: React.RefObject<HTMLDivElement>;
  onBreweryClick?: (breweryId: number) => void;
}

const ProductBreweryCard: React.FC<ProductBreweryCardProps> = ({ 
  brewery, 
  forwardRef,
  onBreweryClick
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleBreweryClick = () => {
    if (brewery && onBreweryClick) {
      onBreweryClick(brewery.brewery_id);
    } else if (brewery) {
      // 기본 동작: 양조장 상세페이지로 이동
      console.log('양조장 상세페이지로 이동:', brewery.brewery_name);
      navigateToBreweryDetail(brewery.brewery_id);
    }
  };

  // 양조장 상세페이지로 이동하는 함수
  const navigateToBreweryDetail = (breweryId: number) => {
    const url = new URL(window.location.href);
    
    // 기존 파라미터 정리
    url.searchParams.delete('product');
    url.searchParams.delete('view');
    
    // 양조장 상세페이지 파라미터 설정
    url.searchParams.set('view', 'brewery-detail');
    url.searchParams.set('brewery', breweryId.toString());
    
    // URL 업데이트 및 페이지 이동
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  // 이미지가 유효한지 확인 (placeholder 이미지 제외)
  const hasValidImage = brewery?.image_url && 
    !brewery.image_url.includes('/api/placeholder') && 
    brewery.image_url !== '' &&
    brewery.image_url !== '/images/brewery-placeholder.jpg' &&
    brewery.image_url !== '/images/brewery-default.jpg';

  const PlaceholderImage = () => (
    <div className="productdetail-brewery-card-image-placeholder">
      <div className="productdetail-brewery-card-placeholder-icon">🏭</div>
      <div className="productdetail-brewery-card-placeholder-text">
        {imageStatus === 'loading' ? '이미지 로딩 중...' : '이미지 준비 중'}
      </div>
    </div>
  );

  // 체험 프로그램 정보 계산
  const experienceInfo = brewery?.experience_programs && brewery.experience_programs.length > 0 
    ? {
        count: brewery.experience_programs.length,
        minPrice: Math.min(...brewery.experience_programs.map(p => p.price))
      }
    : null;

  if (!brewery) {
    return (
      <div ref={forwardRef} className="productdetail-product-section-container" id="productdetail-brewery">
        <h2 className="productdetail-product-section-title">양조장</h2>
        <div className="productdetail-brewery-card-empty">
          <div className="productdetail-brewery-empty-icon">🏭</div>
          <p className="productdetail-brewery-empty-text">양조장 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={forwardRef} className="productdetail-product-section-container" id="productdetail-brewery">
      <h2 className="productdetail-product-section-title">양조장</h2>
      <div 
        className="productdetail-product-brewery-card" 
        onClick={handleBreweryClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBreweryClick();
          }
        }}
        aria-label={`${brewery.brewery_name} 양조장 상세 정보 보기`}
      >
        {/* 양조장 이미지 */}
        <div className="productdetail-brewery-card-image-section">
          {hasValidImage ? (
            <>
              {imageStatus === 'loading' && <PlaceholderImage />}
              <img 
                src={brewery.image_url} 
                alt={brewery.brewery_name}
                className={`productdetail-brewery-card-image ${imageStatus === 'loading' ? 'productdetail-brewery-image-loading' : ''}`}
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
            <div className="productdetail-brewery-card-badge-container">
              {brewery.badges.slice(0, 2).map((badge, index) => (
                badge.type === 'image' ? (
                  <img 
                    key={index}
                    src={badge.content}
                    alt={badge.alt || badge.content}
                    className="productdetail-brewery-card-badge-image"
                    title={badge.content}
                  />
                ) : (
                  <div
                    key={index}
                    className="productdetail-brewery-card-badge-text"
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
          <div className="productdetail-brewery-card-overlay">
            <span className="productdetail-brewery-view-detail-text">양조장 상세보기</span>
          </div>
        </div>

        {/* 양조장 정보 */}
        <div className="productdetail-brewery-card-info-section">
          {/* 양조장 이름과 지역 */}
          <div className="productdetail-brewery-card-header">
            <h3 className="productdetail-brewery-card-name">{brewery.brewery_name}</h3>
            <div className="productdetail-brewery-card-location">
              <span className="productdetail-brewery-location-icon">📍</span>
              <span>{brewery.region_name}</span>
            </div>
          </div>

          {/* 양조장 소개 */}
          <p className="productdetail-brewery-card-description">
            {brewery.introduction || `${brewery.brewery_name}에서 전통 방식으로 만드는 ${brewery.alcohol_types.join(', ')} 전문점입니다.`}
          </p>

          {/* 연락처 정보 */}
          <div className="productdetail-brewery-contact-info">
            <div className="productdetail-contact-item">
              <span className="productdetail-contact-label">전화번호</span>
              <span className="productdetail-contact-value">{brewery.business_phone}</span>
            </div>
            {brewery.business_email && (
              <div className="productdetail-contact-item">
                <span className="productdetail-contact-label">이메일</span>
                <span className="productdetail-contact-value">{brewery.business_email}</span>
              </div>
            )}
            <div className="productdetail-contact-item">
              <span className="productdetail-contact-label">주소</span>
              <span className="productdetail-contact-value">{brewery.brewery_address}</span>
            </div>
          </div>

          {/* 주종 태그 */}
          <div className="productdetail-brewery-card-tags">
            {brewery.alcohol_types.slice(0, 3).map((type, index) => (
              <span key={index} className="productdetail-brewery-card-tag">
                {type}
              </span>
            ))}
            {brewery.alcohol_types.length > 3 && (
              <span className="productdetail-brewery-card-tag">
                +{brewery.alcohol_types.length - 3}
              </span>
            )}
          </div>

          {/* 체험 프로그램 및 상세보기 버튼 */}
          <div className="productdetail-brewery-card-footer">
            <div className="productdetail-brewery-experience-info">
              {experienceInfo ? (
                <>
                  <div className="productdetail-brewery-experience-title">
                    체험 프로그램 {experienceInfo.count}개
                  </div>
                  <div className="productdetail-brewery-experience-price">
                    {experienceInfo.minPrice.toLocaleString()}원부터
                  </div>
                </>
              ) : (
                <div className="productdetail-brewery-experience-title">
                  양조장 정보
                </div>
              )}
            </div>
            
            <button className="productdetail-brewery-detail-button">
              양조장 상세보기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBreweryCard;