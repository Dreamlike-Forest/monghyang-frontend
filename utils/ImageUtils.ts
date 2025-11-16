// utils/ImageUtils.ts

/**
 * 이미지 URL 변환 및 처리 유틸리티
 *
 * 이미지 키를 실제 URL로 변환하고 유효성을 검증하는 함수들을 제공합니다.
 */

// 이미지 서버 기본 URL (환경변수로 관리)
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL || 'http://16.184.16.198:61234';

/**
 * 이미지 타입별 경로 매핑
 */
const IMAGE_TYPE_PATHS: Record<string, string> = {
  brewery: '/images/breweries',
  product: '/images/products',
  experience: '/images/experiences',
  review: '/images/reviews',
  user: '/images/users',
};

/**
 * 이미지 키를 실제 URL로 변환
 * @param imageKey - 이미지 키 또는 URL
 * @param type - 이미지 타입 (brewery, product, experience 등)
 * @returns 변환된 이미지 URL
 */
export const getImageUrl = (
  imageKey: string | undefined,
  type: keyof typeof IMAGE_TYPE_PATHS = 'brewery',
): string => {
  if (!imageKey) return '';

  // 이미 전체 URL인 경우 그대로 반환
  if (
    imageKey.startsWith('http://') ||
    imageKey.startsWith('https://') ||
    imageKey.startsWith('/')
  ) {
    return imageKey;
  }

  // 이미지 타입에 따라 경로 생성
  const basePath = IMAGE_TYPE_PATHS[type] || IMAGE_TYPE_PATHS.brewery;

  // 이미지 키를 기반으로 전체 URL 생성
  return `${IMAGE_BASE_URL}${basePath}/${imageKey}`;
};

/**
 * 유효한 이미지 URL인지 확인
 * @param imageUrl - 확인할 이미지 URL
 * @returns 유효 여부
 */
export const isValidImageUrl = (imageUrl: string | undefined): boolean => {
  if (!imageUrl || imageUrl.trim() === '') return false;

  // 플레이스홀더나 기본 이미지 패턴 제외
  const invalidPatterns = [
    '/api/placeholder',
    'placeholder',
    'default',
    '/images/brewery-placeholder.jpg',
    '/images/brewery-default.jpg',
    '/images/product-placeholder.jpg',
    '/images/product-default.jpg',
    'undefined',
    'null',
  ];

  return !invalidPatterns.some(pattern =>
    imageUrl.toLowerCase().includes(pattern.toLowerCase()),
  );
};

/**
 * 양조장 이미지 배열 처리
 * @param brewery - 양조장 데이터
 * @param maxImages - 최대 이미지 개수 (기본값: 5)
 * @returns 처리된 이미지 URL 배열
 */
export const getBreweryImages = (
  brewery: any,
  maxImages: number = 5,
): string[] => {
  const allImages: string[] = [];

  // 1. 메인 이미지 (image_key) 추가
  if (brewery?.image_key) {
    const mainImageUrl = getImageUrl(brewery.image_key, 'brewery');
    if (isValidImageUrl(mainImageUrl)) {
      allImages.push(mainImageUrl);
    }
  }

  // 2. 추가 이미지들 (brewery_images) 추가
  if (brewery?.brewery_images && Array.isArray(brewery.brewery_images)) {
    brewery.brewery_images.forEach((imageKey: string) => {
      const imageUrl = getImageUrl(imageKey, 'brewery');
      if (isValidImageUrl(imageUrl) && !allImages.includes(imageUrl)) {
        allImages.push(imageUrl);
      }
    });
  }

  // 3. 최대 개수만큼만 반환
  return allImages.slice(0, maxImages);
};

/**
 * 상품 이미지 URL 가져오기
 * @param product - 상품 데이터
 * @returns 이미지 URL
 */
export const getProductImageUrl = (product: any): string => {
  if (!product) return '';

  const imageUrl = getImageUrl(product.image_key, 'product');
  return isValidImageUrl(imageUrl) ? imageUrl : '';
};

/**
 * 체험 프로그램 이미지 URL 가져오기
 * @param experience - 체험 프로그램 데이터
 * @returns 이미지 URL
 */
export const getExperienceImageUrl = (experience: any): string => {
  if (!experience) return '';

  const imageUrl = getImageUrl(experience.image_key, 'experience');
  return isValidImageUrl(imageUrl) ? imageUrl : '';
};

/**
 * 리뷰 이미지 URL 가져오기
 * @param imageKey - 리뷰 이미지 키
 * @returns 이미지 URL
 */
export const getReviewImageUrl = (imageKey: string): string => {
  const imageUrl = getImageUrl(imageKey, 'review');
  return isValidImageUrl(imageUrl) ? imageUrl : '';
};

/**
 * 사용자 프로필 이미지 URL 가져오기
 * @param user - 사용자 데이터
 * @returns 이미지 URL
 */
export const getUserProfileImageUrl = (user: any): string => {
  if (!user) return '';

  const imageUrl = getImageUrl(user.profile_image_key, 'user');
  return isValidImageUrl(imageUrl) ? imageUrl : '';
};

/**
 * 이미지 로딩 에러 처리
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
  // 필요하다면 공통 placeholder 로 변경
  event.currentTarget.src = '/placeholder.png';
};

/**
 * 이미지 미리 로딩
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach(url => {
    if (!isValidImageUrl(url)) return;
    const img = new Image();
    img.src = url;
  });
};

// ==================================================================
// --------------------- 추가: OptimizedImage 지원 -------------------
// ==================================================================

/** 이미지 로딩 상태 타입 */
export type ImageLoadingState = 'loading' | 'loaded' | 'error';

/** placeholder에 사용할 아이콘 반환 */
export const getPlaceholderIcon = (
  type:
    | 'product'
    | 'brewery'
    | 'user'
    | 'camera'
    | 'image'
    | 'default' = 'default',
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

// 기본 export 묶음
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
