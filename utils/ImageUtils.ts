// 이미지 로딩 상태 타입
export type ImageLoadingState = 'loading' | 'loaded' | 'error';

// 유효하지 않은 이미지 URL 패턴
const INVALID_IMAGE_PATTERNS = [
  '/api/placeholder',
  'placeholder',
  'default',
  'data:image/svg+xml',
  'blob:',
  'example.com',
  'via.placeholder.com',
  'placehold',
  'dummy',
  'sample'
] as const;

/**
 * 이미지 URL이 유효한지 검사
 */
export const isValidImageUrl = (imageUrl?: string | null): boolean => {
  if (!imageUrl || imageUrl.trim() === '') {
    return false;
  }

  const lowerCaseUrl = imageUrl.toLowerCase();
  return !INVALID_IMAGE_PATTERNS.some(pattern => 
    lowerCaseUrl.includes(pattern)
  );
};

/**
 * 여러 이미지 URL 중 첫 번째 유효한 URL 반환
 */
export const getFirstValidImageUrl = (
  imageUrls: (string | null | undefined)[]
): string | null => {
  for (const url of imageUrls) {
    if (isValidImageUrl(url)) {
      return url!;
    }
  }
  return null;
};

/**
 * 이미지 프리로드 함수
 */
export const preloadImage = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(imageUrl)) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * 이미지 Placeholder 아이콘 반환
 */
export const getPlaceholderIcon = (type: string = 'default'): string => {
  const icons: Record<string, string> = {
    product: '🍶',
    brewery: '🏭',
    user: '👤',
    camera: '📷',
    image: '🖼️',
    default: '🍶'
  };
  return icons[type] || icons.default;
};

/**
 * 이미지 Placeholder 텍스트 반환
 */
export const getPlaceholderText = (status: ImageLoadingState): string => {
  const texts: Record<ImageLoadingState, string> = {
    loading: '이미지 로딩 중...',
    loaded: '',
    error: '이미지를 불러올 수\n없습니다'
  };
  return texts[status];
};

export const getThumbnailUrl = (
  images: Array<{ key?: string; image_key?: string; url?: string }>,
  fallbackUrl?: string
): string | null => {
  if (!images || images.length === 0) {
    return fallbackUrl || null;
  }

  for (const image of images) {
    const url = image.key || image.image_key || image.url;
    if (isValidImageUrl(url)) {
      return url!;
    }
  }

  return fallbackUrl || null;
};

export interface ImageState {
  url: string | null;
  status: ImageLoadingState;
  error: Error | null;
}

export const createInitialImageState = (url?: string): ImageState => ({
  url: isValidImageUrl(url) ? url! : null,
  status: 'loading',
  error: null
});