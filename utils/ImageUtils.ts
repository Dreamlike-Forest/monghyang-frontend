const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getImageUrl = (imageKey?: string): string => {
  if (!imageKey) return '';

  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  if (imageKey.startsWith('/api/image')) {
    return API_BASE_URL ? `${API_BASE_URL}${imageKey}` : imageKey;
  }

  const path = `/api/image/${imageKey}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

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

export const getBreweryImages = (brewery: any, maxImages: number = 5): string[] => {
  const allImages: string[] = [];

  if (brewery?.image_key) {
    const mainUrl = getImageUrl(brewery.image_key);
    if (isValidImageUrl(mainUrl)) {
      allImages.push(mainUrl);
    }
  }

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

export const getProductImageUrl = (product: any): string => {
  if (!product) return '';
  const url = getImageUrl(product.image_key);
  return isValidImageUrl(url) ? url : '';
};

export const getExperienceImageUrl = (experience: any): string => {
  if (!experience) return '';
  const url = getImageUrl(experience.image_key);
  return isValidImageUrl(url) ? url : '';
};

export const getReviewImageUrl = (imageKey: string): string => {
  const url = getImageUrl(imageKey);
  return isValidImageUrl(url) ? url : '';
};

export const getUserProfileImageUrl = (user: any): string => {
  if (!user) return '';
  const url = getImageUrl(user.profile_image_key);
  return isValidImageUrl(url) ? url : '';
};

export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
  event.currentTarget.src = '/placeholder.png';
};

export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    if (!isValidImageUrl(url)) return;
    const img = new Image();
    img.src = url;
  });
};

export type ImageLoadingState = 'loading' | 'loaded' | 'error';

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