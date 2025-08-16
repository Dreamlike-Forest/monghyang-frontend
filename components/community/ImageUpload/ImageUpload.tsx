'use client';

import { useState, useRef, useCallback } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  images: File[];
  maxImages: number;
  onImagesChange: (images: File[]) => void;
  onDescriptionsChange: (descriptions: string[]) => void;
  descriptions: string[];
  disabled?: boolean;
  accept?: string;
  maxFileSize?: number; // MB 단위
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  maxImages,
  onImagesChange,
  onDescriptionsChange,
  descriptions,
  disabled = false,
  accept = 'image/*',
  maxFileSize = 10 // 10MB
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
        return;
      }

      // 파일 크기 검증
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: 파일 크기가 ${maxFileSize}MB를 초과합니다.`);
        return;
      }

      // 중복 파일 검증
      if (images.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      )) {
        errors.push(`${file.name}: 이미 업로드된 파일입니다.`);
        return;
      }

      validFiles.push(file);
    });

    return { valid: validFiles, errors };
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      setErrors([`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`]);
      return;
    }

    const { valid: validFiles, errors: validationErrors } = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    if (validFiles.length > 0) {
      setErrors([]);
      simulateUpload(validFiles);
    }
  }, [disabled, maxImages, images, maxFileSize]);

  const simulateUpload = (files: File[]) => {
    const progressItems: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadProgress(progressItems);

    // 업로드 시뮬
    files.forEach((file, index) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const updated = [...prev];
          const item = updated.find(item => item.file === file);
          if (item) {
            item.progress += Math.random() * 30;
            if (item.progress >= 100) {
              item.progress = 100;
              item.status = 'success';
              clearInterval(interval);
              
              // 업로드 완료 후 이미지 목록에 추가
              setTimeout(() => {
                onImagesChange([...images, file]);
                onDescriptionsChange([...descriptions, '']);
                
                // 진행률
                setUploadProgress(prev => prev.filter(item => item.file !== file));
              }, 500);
            }
          }
          return updated;
        });
      }, 200);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = '';
  };

  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newDescriptions = descriptions.filter((_, i) => i !== index);
    onImagesChange(newImages);
    onDescriptionsChange(newDescriptions);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const newDescriptions = [...descriptions];
    
    const [movedImage] = newImages.splice(fromIndex, 1);
    const [movedDescription] = newDescriptions.splice(fromIndex, 1);
    
    newImages.splice(toIndex, 0, movedImage);
    newDescriptions.splice(toIndex, 0, movedDescription);
    
    onImagesChange(newImages);
    onDescriptionsChange(newDescriptions);
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return; // 이미 첫 번째 이미지
    moveImage(index, 0);
  };

  const updateDescription = (index: number, description: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = description;
    onDescriptionsChange(newDescriptions);
  };

  const getImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className="image-upload-container">
      {/* 드래그 앤 드롭 영역 */}
      {!isMaxReached && (
        <div
          className={`image-upload-zone ${dragOver ? 'dragover' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <span className="upload-icon">📷</span>
          <div className="upload-text">
            이미지를 드래그하거나 클릭해서 업로드
          </div>
          <div className="upload-hint">
            최대 {maxImages}개, 파일당 {maxFileSize}MB 이하<br />
            JPG, PNG, GIF, WebP 지원
          </div>
          <button 
            type="button"
            className="upload-button"
            disabled={disabled}
          >
            파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </div>
      )}

      {/* 업로드 진행률 */}
      {uploadProgress.length > 0 && (
        <div className="upload-progress">
          {uploadProgress.map((item, index) => (
            <div key={index} className="upload-progress-item">
              <img
                src={getImagePreviewUrl(item.file)}
                alt="미리보기"
                className="progress-thumbnail"
              />
              <div className="progress-info">
                <div className="progress-filename">{item.file.name}</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className={`progress-status ${item.status}`}>
                  {item.status === 'uploading' && `업로드 중... ${Math.round(item.progress)}%`}
                  {item.status === 'success' && '업로드 완료'}
                  {item.status === 'error' && (item.error || '업로드 실패')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="upload-error">
          <div className="upload-error-title">업로드 오류</div>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
        <div className="uploaded-images">
          {images.map((file, index) => (
            <div 
              key={index}
              className={`uploaded-image-item ${index === 0 ? 'main-image' : ''}`}
            >
              <div className="image-order">{index + 1}</div>
              {index === 0 && (
                <div className="main-image-badge">대표</div>
              )}
              
              <img
                src={getImagePreviewUrl(file)}
                alt={`업로드된 이미지 ${index + 1}`}
                className="uploaded-image"
              />
              
              <div className="image-overlay">
                {index !== 0 && (
                  <button
                    type="button"
                    className="image-action-button edit"
                    onClick={() => setAsMainImage(index)}
                    title="대표 이미지로 설정"
                  >
                    ⭐
                  </button>
                )}
                <button
                  type="button"
                  className="image-action-button delete"
                  onClick={() => removeImage(index)}
                  title="이미지 삭제"
                >
                  🗑
                </button>
              </div>
              
              <div className="image-description">
                <input
                  type="text"
                  className="image-description-input"
                  placeholder="이미지 설명 (선택사항)"
                  value={descriptions[index] || ''}
                  onChange={(e) => updateDescription(index, e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 제한 정보 */}
      <div className="upload-limits">
        <div className="upload-limits-title">업로드 가이드</div>
        <ul className="upload-limits-list">
          <li className="upload-limits-item">
            최대 {maxImages}개 이미지 업로드 가능 ({images.length}/{maxImages})
          </li>
          <li className="upload-limits-item">
            파일 크기: 최대 {maxFileSize}MB
          </li>
          <li className="upload-limits-item">
            지원 형식: JPG, PNG, GIF, WebP
          </li>
          <li className="upload-limits-item">
            첫 번째 이미지가 대표 이미지로 표시됩니다
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;