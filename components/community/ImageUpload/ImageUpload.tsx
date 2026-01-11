'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  validateImageFiles, 
  createPreviewUrl, 
  revokePreviewUrl,
  formatFileSize,
  type UploadOptions 
} from '../../../utils/imageUpload';
import './ImageUpload.css';

interface ImageUploadProps {
  images: File[];
  maxImages: number;
  onImagesChange: (images: File[]) => void;
  onDescriptionsChange: (descriptions: string[]) => void;
  descriptions: string[];
  disabled?: boolean;
  accept?: string;
  maxFileSize?: number;
}

interface PreviewUrl {
  file: File;
  url: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  maxImages,
  onImagesChange,
  onDescriptionsChange,
  descriptions,
  disabled = false,
  accept = 'image/*',
  maxFileSize = 10
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<PreviewUrl[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 관리 (메모리 누수 방지)
  useEffect(() => {
    const newPreviews = images.map(file => {
      const existing = previewUrls.find(p => p.file === file);
      return existing || { file, url: createPreviewUrl(file) };
    });

    // 제거된 이미지의 URL 해제
    previewUrls.forEach(preview => {
      if (!images.includes(preview.file)) {
        revokePreviewUrl(preview.url);
      }
    });

    setPreviewUrls(newPreviews);

    return () => {
      newPreviews.forEach(p => revokePreviewUrl(p.url));
    };
  }, [images]);

  const getPreviewUrl = (file: File): string => {
    return previewUrls.find(p => p.file === file)?.url || createPreviewUrl(file);
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const options: UploadOptions = { maxFileSize, maxImages };
    
    const { valid, errors: validationErrors } = validateImageFiles(
      fileArray, 
      images, 
      options
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    if (valid.length > 0) {
      setErrors([]);
      onImagesChange([...images, ...valid]);
      onDescriptionsChange([...descriptions, ...valid.map(() => '')]);
    }
  }, [disabled, maxFileSize, maxImages, images, descriptions, onImagesChange, onDescriptionsChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    
    const input = fileInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    onDescriptionsChange(descriptions.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...images];
    const newDescriptions = [...descriptions];
    
    const [movedImage] = newImages.splice(index, 1);
    const [movedDesc] = newDescriptions.splice(index, 1);
    
    newImages.unshift(movedImage);
    newDescriptions.unshift(movedDesc);
    
    onImagesChange(newImages);
    onDescriptionsChange(newDescriptions);
  };

  const updateDescription = (index: number, description: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = description;
    onDescriptionsChange(newDescriptions);
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className="image-upload-container">
      {!isMaxReached && (
        <div
          className={`image-upload-zone ${dragOver ? 'dragover' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <span className="upload-icon">📷</span>
          <div className="upload-text">이미지를 드래그하거나 클릭해서 업로드</div>
          <div className="upload-hint">
            최대 {maxImages}개, 파일당 {maxFileSize}MB 이하
          </div>
          <button type="button" className="upload-button" disabled={disabled}>
            파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxImages > 1}
            onChange={handleFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {errors.length > 0 && (
        <div className="upload-error">
          <div className="upload-error-title">업로드 오류</div>
          {errors.map((error, i) => <div key={i}>{error}</div>)}
        </div>
      )}

      {images.length > 0 && (
        <div className="uploaded-images">
          {images.map((file, index) => (
            <div key={`img-${index}`} className={`uploaded-image-item ${index === 0 ? 'main-image' : ''}`}>
              <div className="image-order">{index + 1}</div>
              {index === 0 && <div className="main-image-badge">대표</div>}
              
              <img src={getPreviewUrl(file)} alt={`이미지 ${index + 1}`} className="uploaded-image" />
              
              <div className="image-overlay">
                {index !== 0 && (
                  <button type="button" className="image-action-button edit" onClick={() => setAsMainImage(index)}>⭐</button>
                )}
                <button type="button" className="image-action-button delete" onClick={() => removeImage(index)}>🗑</button>
              </div>
              
              <div className="image-info">
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              
              <div className="image-description">
                <input
                  type="text"
                  className="image-description-input"
                  placeholder="이미지 설명 (선택)"
                  value={descriptions[index] || ''}
                  onChange={(e) => updateDescription(index, e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="upload-limits">
        <span>{images.length}/{maxImages}개 업로드됨</span>
      </div>
    </div>
  );
};

export default ImageUpload;