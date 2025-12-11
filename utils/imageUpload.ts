const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

export interface UploadResult {
  success: boolean;
  imageKey?: string;
  imageUrl?: string;
  error?: string;
}

export interface FileValidationResult {
  valid: File[];
  errors: string[];
}

export interface UploadOptions {
  maxFileSize?: number;  // MB
  allowedTypes?: string[];
  maxImages?: number;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxFileSize: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxImages: 5
};

// 파일 검증
export const validateImageFiles = (
  files: File[],
  existingImages: File[] = [],
  options: UploadOptions = {}
): FileValidationResult => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const validFiles: File[] = [];
  const errors: string[] = [];

  const remainingSlots = config.maxImages - existingImages.length;
  
  if (files.length > remainingSlots) {
    errors.push(`최대 ${config.maxImages}개의 이미지만 업로드할 수 있습니다.`);
    return { valid: [], errors };
  }

  files.forEach(file => {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
      return;
    }

    if (!config.allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: 지원하지 않는 이미지 형식입니다.`);
      return;
    }

    // 파일 크기 검증
    const maxSizeBytes = config.maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`${file.name}: 파일 크기가 ${config.maxFileSize}MB를 초과합니다.`);
      return;
    }

    // 중복 파일 검증
    const isDuplicate = existingImages.some(
      existing => existing.name === file.name && existing.size === file.size
    );
    if (isDuplicate) {
      errors.push(`${file.name}: 이미 업로드된 파일입니다.`);
      return;
    }

    validFiles.push(file);
  });

  return { valid: validFiles, errors };
};

// 단일 이미지 업로드
export const uploadImage = async (
  file: File,
  category: 'brewery' | 'product' | 'review' | 'community' = 'community'
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '이미지 업로드에 실패했습니다.');
    }

    const data = await response.json();
    
    return {
      success: true,
      imageKey: data.image_key || data.imageKey,
      imageUrl: data.image_url || data.imageUrl
    };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.'
    };
  }
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (
  files: File[],
  category: 'brewery' | 'product' | 'review' | 'community' = 'community',
  onProgress?: (index: number, progress: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, 0);
    
    const result = await uploadImage(files[i], category);
    results.push(result);
    
    onProgress?.(i, 100);
  }

  return results;
};

// 이미지 삭제
export const deleteImage = async (imageKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/${imageKey}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return false;
  }
};

// 미리보기 URL 생성
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// 미리보기 URL 해제 (메모리 누수 방지)
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// 파일 크기 포맷
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 이미지 리사이즈 (옵션)
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context 생성 실패'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('이미지 리사이즈 실패'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
};

// Base64 변환 (필요시)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};