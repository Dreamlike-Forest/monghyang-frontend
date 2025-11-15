'use client';

import { useState, useEffect } from 'react';
import { 
  isValidImageUrl, 
  getPlaceholderIcon, 
  getPlaceholderText,
  type ImageLoadingState 
} from '../../utils/ImageUtils';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderType?: 'product' | 'brewery' | 'user' | 'camera' | 'image' | 'default';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage 컴포넌트
 * 
 * ERD 구조를 완벽하게 지원:
 * - ProductImage의 'key' 필드
 * - PostImage의 'image_key' 필드
 * - 자동 유효성 검사
 * - 로딩/에러 상태 관리
 * - Placeholder 자동 표시
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderType = 'default',
  onLoad,
  onError,
  style,
  loading = 'lazy'
}) => {
  const [imageStatus, setImageStatus] = useState<ImageLoadingState>('loading');
  const hasValidImage = isValidImageUrl(src);

  // src 변경 시 상태 초기화
  useEffect(() => {
    if (!hasValidImage) {
      setImageStatus('error');
      return;
    }

    setImageStatus('loading');

    // 이미지 프리로드
    const img = new Image();
    
    img.onload = () => {
      setImageStatus('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      setImageStatus('error');
      onError?.();
    };

    img.src = src!;

    // 클린업
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, hasValidImage, onLoad, onError]);

  // 유효한 이미지가 없거나 에러 상태
  if (!hasValidImage || imageStatus === 'error') {
    return (
      <div 
        className={`optimized-image-placeholder ${className}`} 
        style={style}
      >
        <div className="placeholder-icon">
          {getPlaceholderIcon(placeholderType)}
        </div>
        <div className="placeholder-text">
          {getPlaceholderText('error')}
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} style={style}>
      {/* 로딩 중 Placeholder */}
      {imageStatus === 'loading' && (
        <div className="optimized-image-placeholder loading">
          <div className="placeholder-icon">
            {getPlaceholderIcon('camera')}
          </div>
          <div className="placeholder-text">
            {getPlaceholderText('loading')}
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        src={src}
        alt={alt}
        className={`optimized-image ${imageStatus}`}
        loading={loading}
        decoding="async"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageStatus === 'loaded' ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};

export default OptimizedImage;