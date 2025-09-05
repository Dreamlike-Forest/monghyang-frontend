'use client';

import { useState, useRef, useEffect } from 'react';
import ImageUpload from '../ImageUpload/ImageUpload';
import { WritePostData, PostCategory, CategoryConfig } from '../../../types/community';
import './WritePost.css';

interface WritePostProps {
  onSubmit: (data: WritePostData) => void;
  onCancel: () => void;
  initialCategory?: PostCategory;
  categories: CategoryConfig[];
  initialData?: Partial<WritePostData>; // 초기 데이터 추가
}

const WritePost: React.FC<WritePostProps> = ({
  onSubmit,
  onCancel,
  initialCategory,
  categories,
  initialData
}) => {
  const [formData, setFormData] = useState<WritePostData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || initialCategory || 'free',
    subcategory: initialData?.subcategory || '',
    rating: initialData?.rating || 0,
    brewery_name: initialData?.brewery_name || '',
    product_name: initialData?.product_name || '',
    tags: initialData?.tags || [],
    images: initialData?.images || [],
    imageDescriptions: initialData?.imageDescriptions || []
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        category: initialData.category || initialCategory || prev.category
      }));
    }
  }, [initialData, initialCategory]);

  const getCurrentCategoryConfig = () => {
    return categories.find(cat => cat.id === formData.category);
  };

  const handleInputChange = (field: keyof WritePostData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImagesChange = (images: File[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleImageDescriptionsChange = (descriptions: string[]) => {
    setFormData(prev => ({
      ...prev,
      imageDescriptions: descriptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (getCurrentCategoryConfig()?.hasRating && !formData.rating) {
      alert('별점을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryConfig = getCurrentCategoryConfig();
  const isReviewCategory = currentCategoryConfig?.hasRating;
  const allowImages = currentCategoryConfig?.allowImages || false;
  const maxImages = currentCategoryConfig?.maxImages || 5;

  const getRatingText = (rating: number) => {
    const texts = ['선택안함', '별로예요', '그저그래요', '괜찮아요', '좋아요', '최고예요'];
    return texts[rating] || '';
  };

  return (
    <div className="write-post-container">
      <div className="write-post-header">
        <h1 className="write-post-title">
          {initialData?.product_name ? `${initialData.product_name} 리뷰 작성` : '새 게시글 작성'}
        </h1>
        <p className="write-post-description">
          커뮤니티 규칙을 준수하여 유익하고 건전한 게시글을 작성해주세요.
        </p>
      </div>

      <form className="write-form" onSubmit={handleSubmit}>
        {/* 제목 */}
        <div className="form-group">
          <label className="form-label required">제목</label>
          <input
            type="text"
            className="form-input"
            placeholder={currentCategoryConfig?.placeholder || "제목을 입력하세요"}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 카테고리 및 세부분류 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">카테고리</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => {
                handleInputChange('category', e.target.value as PostCategory);
                handleInputChange('subcategory', ''); // 카테고리 변경 시 서브카테고리 초기화
              }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {currentCategoryConfig && currentCategoryConfig.subcategories.length > 0 && (
            <div className="form-group">
              <label className="form-label">세부 분류</label>
              <select
                className="form-select"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
              >
                <option value="">선택안함</option>
                {currentCategoryConfig.subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 양조장/상품명 (리뷰 카테고리일 때) */}
        {isReviewCategory && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {formData.category === 'brewery_review' ? '양조장명' : '상품명'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={
                  formData.category === 'brewery_review' 
                    ? "양조장명을 입력하세요" 
                    : "상품명을 입력하세요"
                }
                value={
                  formData.category === 'brewery_review' 
                    ? formData.brewery_name 
                    : formData.product_name
                }
                onChange={(e) => 
                  handleInputChange(
                    formData.category === 'brewery_review' ? 'brewery_name' : 'product_name',
                    e.target.value
                  )
                }
                // 상품 리뷰인 경우 읽기 전용으로 설정 (이미 선택된 상품)
                readOnly={formData.category === 'drink_review' && !!initialData?.product_name}
              />
            </div>

            {/* 별점 */}
            <div className="form-group">
              <label className="form-label required">별점</label>
              <div className="rating-input">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star ${star <= formData.rating ? 'active' : ''}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-text">{getRatingText(formData.rating)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 내용 */}
        <div className="form-group">
          <label className="form-label required">내용</label>
          <textarea
            className="form-textarea content"
            placeholder="게시글 내용을 입력하세요..."
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
          />
        </div>

        {/* 이미지 업로드 */}
        {allowImages && (
          <div className="form-group">
            <label className="form-label">
              이미지 업로드 
              <span className="form-label-hint">(최대 {maxImages}개)</span>
            </label>
            <ImageUpload
              images={formData.images}
              maxImages={maxImages}
              onImagesChange={handleImagesChange}
              onDescriptionsChange={handleImageDescriptionsChange}
              descriptions={formData.imageDescriptions}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* 태그 */}
        <div className="form-group">
          <label className="form-label">태그</label>
          <div className="tags-input-container">
            <div className="tags-display">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-item">
                  #{tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="tag-input"
                placeholder="태그를 입력하고 Enter를 누르세요"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                onBlur={addTag}
              />
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="form-actions">
          <button
            type="button"
            className="form-button cancel-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="form-button submit-button"
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
          >
            {isSubmitting ? '작성 중...' : '게시글 작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePost;