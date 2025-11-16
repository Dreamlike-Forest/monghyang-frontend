// utils/ImageUtils.ts

/**
 * 이미지 URL 변환 및 처리 유틸리티
 *
 * 백엔드 Swagger:
 *   GET /api/image/{imageFullName}
 * imageFullName 에 확장자를 포함한 전체 파일 이름(예: 79b7f851-....png)이 들어온다고 가정.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * /api/image/{imageFullName} 형식으로 URL을 만들어준다.
 * - imageKey 가 이미 전체 URL이면 그대로 사용
 * - imageKey 가 '/api/image/...' 로 시작하면 앞에 API_BASE_URL만 붙여준다.
 * - 그 외에는 '/api/image/{imageKey}' 로 만든다.
 */
export const getImageUrl = (imageKey?: string): string => {
  if (!imageKey) return '';

  // 이미 절대 URL이면 그대로 사용
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  // 이미 /api/image 로 시작하는 상대 경로인 경우
  if (imageKey.startsWith('/api/image')) {
    return API_BASE_URL ? `${API_BASE_URL}${imageKey}` : imageKey;
  }

  // 그 외에는 스웨거에 맞게 /api/image/{imageFullName} 으로 만들기
  const path = `/api/image/${imageKey}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

/**
 * 유효한 이미지 URL인지 확인
 */
export const isValidImageUrl = (imageUrl: string | undefined): boolean => {
  if (!imageUrl || imageUrl.trim() === '') return false;

  const invalidPatterns = [
    '/api/placeholder',
    'placeholder',
    'default',
    'undefined',
    'null',
  ];

  return !invalidPatterns.some((pattern) =>
    imageUrl.toLowerCase().includes(pattern.toLowerCase()),
  );
};

// --------------------- 양조장 / 상품 / 체험별 헬퍼 ---------------------

/**
 * 양조장 이미지 배열 처리
 * @param brewery - 양조장 데이터 (image_key, brewery_images 등을 가진다고 가정)
 * @param maxImages - 최대 이미지 개수
 */
export const getBreweryImages = (brewery: any, maxImages: number = 5): string[] => {
  const allImages: string[] = [];

  // 1. 메인 이미지 (image_key)
  if (brewery?.image_key) {
    const mainUrl = getImageUrl(brewery.image_key);
    if (isValidImageUrl(mainUrl)) {
      allImages.push(mainUrl);
    }
  }

  // 2. 추가 이미지들 (brewery_images)
  if (brewery?.brewery_images && Array.isArray(brewery.brewery_images)) {
    brewery.brewery_images.forEach((imgKey: string) => {
      const url = getImageUrl(imgKey);
      if (isValidImageUrl(url) && !allImages.includes(url)) {
        allImages.push(url);
      }
    });
  }

  return allImages.slice(0, maxImages);
};

/**
 * 상품 이미지 URL
 */
export const getProductImageUrl = (product: any): string => {
  if (!product) return '';
  const url = getImageUrl(product.image_key);
  return isValidImageUrl(url) ? url : '';
};

/**
 * 체험 프로그램 이미지 URL
 */
export const getExperienceImageUrl = (experience: any): string => {
  if (!experience) return '';
  const url = getImageUrl(experience.image_key);
  return isValidImageUrl(url) ? url : '';
};

/**
 * 리뷰 이미지 URL
 */
export const getReviewImageUrl = (imageKey: string): string => {
  const url = getImageUrl(imageKey);
  return isValidImageUrl(url) ? url : '';
};

/**
 * 사용자 프로필 이미지 URL
 */
export const getUserProfileImageUrl = (user: any): string => {
  if (!user) return '';
  const url = getImageUrl(user.profile_image_key);
  return isValidImageUrl(url) ? url : '';
};

/**
 * 이미지 로딩 에러 처리 (공통)
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
  // 필요하면 공통 placeholder 로 변경
  event.currentTarget.src = '/placeholder.png';
};

/**
 * 이미지 미리 로딩
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    if (!isValidImageUrl(url)) return;
    const img = new Image();
    img.src = url;
  });
};

// ==================================================================
// --------------------- OptimizedImage 관련 -------------------------
// ==================================================================

export type ImageLoadingState = 'loading' | 'loaded' | 'error';

/** placeholder에 사용할 아이콘 반환 */
export const getPlaceholderIcon = (
  type: 'product' | 'brewery' | 'user' | 'camera' | 'image' | 'default' = 'default',
): string => {
  switch (type) {
    case 'product':
      return '🍶';
    case 'brewery':
      return '🏭';
    case 'user':
      return '👤';
    case 'camera':
      return '📷';
    case 'image':
      return '🖼️';
    default:
      return '📦';
  }
};

/** placeholder에 사용할 텍스트 반환 */
export const getPlaceholderText = (
  state: ImageLoadingState = 'loading',
): string => {
  switch (state) {
    case 'loading':
      return '이미지 로딩 중...';
    case 'error':
      return '이미지를 불러올 수 없습니다.';
    case 'loaded':
    default:
      return '';
  }
};

export default {
  getImageUrl,
  isValidImageUrl,
  getBreweryImages,
  getProductImageUrl,
  getExperienceImageUrl,
  getReviewImageUrl,
  getUserProfileImageUrl,
  handleImageError,
  preloadImages,
  getPlaceholderIcon,
  getPlaceholderText,
};
