'use client';

import React, { useState } from 'react';
import TermsAgreement from '../TermsAgreement/TermsAgreement';
import AddressSearch from '../AddressSearch/AddressSearch';
import { checkEmailAvailability, signupSeller } from '../../../utils/authApi';
import './SellerSignupForm.css';

interface SellerSignupFormProps {
  onBack: () => void;
}

const SellerSignupForm: React.FC<SellerSignupFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    nickname: '',
    gender: '',
    birth: '',
    name: '',
    seller_address: '',
    seller_address_detail: '',
    seller_zonecode: '',
    business_registration_number: '',
    seller_account_number: '',
    seller_depositor: '',
    seller_bank_name: '',
    introduction: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [emailChecked, setEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [is_agreed, setIsAgreed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setEmailChecked(false);
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddressSelect = (address: string, zonecode: string) => {
    setFormData(prev => ({
      ...prev,
      seller_address: address,
      seller_zonecode: zonecode
    }));

    if (errors.seller_address) {
      setErrors(prev => ({
        ...prev,
        seller_address: ''
      }));
    }
  };

  const handleEmailCheck = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: '업무용 이메일을 입력해주세요.' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }

    setIsCheckingEmail(true);
    
    try {
      const isAvailable = await checkEmailAvailability(formData.email);
      
      if (isAvailable) {
        setEmailChecked(true);
        setErrors(prev => ({ ...prev, email: '' }));
      } else {
        setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
        setEmailChecked(false);
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      setErrors(prev => ({ ...prev, email: '이메일 확인 중 오류가 발생했습니다.' }));
      setEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleAgreementChange = (agreed: boolean) => {
    setIsAgreed(agreed);
    if (agreed && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length > 5) {
      alert('이미지는 최대 5개까지 업로드 가능합니다.');
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 10 * 1024 * 1024;
    
    if (totalSize > maxSize) {
      alert('총 파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) newErrors.email = '업무용 이메일을 입력해주세요.';
    if (!emailChecked) newErrors.email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.phone) newErrors.phone = '업무용 전화번호를 입력해주세요.';
    if (!formData.nickname) newErrors.nickname = '상호명을 입력해주세요.';
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요.';
    if (!formData.birth) newErrors.birth = '생년월일을 입력해주세요.';
    if (!formData.name) newErrors.name = '대표자 명을 입력해주세요.';
    if (!formData.seller_address) newErrors.seller_address = '사업장 위치를 입력해주세요.';
    if (!formData.seller_address_detail) newErrors.seller_address_detail = '사업장 상세 주소를 입력해주세요.';
    if (!formData.business_registration_number) newErrors.business_registration_number = '사업자 등록번호를 입력해주세요.';
    if (!formData.seller_account_number) newErrors.seller_account_number = '계좌번호를 입력해주세요.';
    if (!formData.seller_depositor) newErrors.seller_depositor = '예금주를 입력해주세요.';
    if (!formData.seller_bank_name) newErrors.seller_bank_name = '은행명을 입력해주세요.';
    if (!is_agreed) newErrors.terms = '약관에 동의해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const genderValue = formData.gender === 'male' ? 'man' : 'woman';

    const submitData = {
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      name: formData.name,
      phone: formData.phone,
      birth: formData.birth,
      gender: genderValue,
      address: formData.seller_address,
      address_detail: formData.seller_address_detail,
      business_registration_number: formData.business_registration_number,
      seller_account_number: formData.seller_account_number,
      seller_depositor: formData.seller_depositor,
      seller_bank_name: formData.seller_bank_name,
      introduction: formData.introduction,
      is_agreed: is_agreed,
      is_agreed_seller: is_agreed,
      images: images
    };
    
    console.log('판매자 회원가입 요청:', submitData);
    
    try {
      const response = await signupSeller(submitData);
      
      if (response.success) {
        alert(response.message || '판매자 회원가입이 완료되었습니다!');
        onBack();
      } else {
        alert(response.message || '판매자 회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('판매자 회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="seller-signup-container">
      <div className="seller-signup-content">
        <button
          type="button"
          onClick={onBack}
          className="seller-back-button"
          title="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="seller-signup-title">판매자 회원가입</h1>
        
        <form className="seller-signup-form" onSubmit={handleSubmit}>
          <div className="seller-form-group">
            <label htmlFor="email" className="seller-form-label">업무용 이메일 (아이디) *</label>
            <div className="seller-email-input-group">
              <input
                type="email"
                id="email"
                name="email"
                className={`seller-form-input ${errors.email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="example@company.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={isCheckingEmail || emailChecked}
                className="seller-email-check-btn"
              >
                {isCheckingEmail ? '확인중...' : emailChecked ? '확인완료' : '중복확인'}
              </button>
            </div>
            {errors.email && <span className="seller-error-message">{errors.email}</span>}
            {emailChecked && !errors.email && <span className="seller-success-message">사용 가능한 이메일입니다.</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="password" className="seller-form-label">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`seller-form-input ${errors.password ? 'error' : ''}`}
              placeholder="8자 이상의 비밀번호"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <span className="seller-error-message">{errors.password}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="passwordConfirm" className="seller-form-label">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className={`seller-form-input ${errors.passwordConfirm ? 'error' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
            />
            {errors.passwordConfirm && <span className="seller-error-message">{errors.passwordConfirm}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="nickname" className="seller-form-label">상호명 *</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className={`seller-form-input ${errors.nickname ? 'error' : ''}`}
              placeholder="상호명을 입력하세요"
              value={formData.nickname}
              onChange={handleInputChange}
            />
            {errors.nickname && <span className="seller-error-message">{errors.nickname}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="name" className="seller-form-label">대표자 명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`seller-form-input ${errors.name ? 'error' : ''}`}
              placeholder="대표자 이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="seller-error-message">{errors.name}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="phone" className="seller-form-label">업무용 전화번호 *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`seller-form-input ${errors.phone ? 'error' : ''}`}
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <span className="seller-error-message">{errors.phone}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="birth" className="seller-form-label">생년월일 *</label>
            <input
              type="date"
              id="birth"
              name="birth"
              className={`seller-form-input ${errors.birth ? 'error' : ''}`}
              value={formData.birth}
              onChange={handleInputChange}
            />
            {errors.birth && <span className="seller-error-message">{errors.birth}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="gender" className="seller-form-label">성별 *</label>
            <select
              id="gender"
              name="gender"
              className={`seller-form-input ${errors.gender ? 'error' : ''}`}
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors.gender && <span className="seller-error-message">{errors.gender}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="seller_address" className="seller-form-label">사업장 위치 *</label>
            <div className="seller-address-input-group">
              <input
                type="text"
                id="seller_address"
                name="seller_address"
                className={`seller-form-input ${errors.seller_address ? 'error' : ''}`}
                placeholder="주소검색 버튼을 클릭하세요"
                value={formData.seller_address}
                readOnly
              />
              <AddressSearch
                onAddressSelect={handleAddressSelect}
                className="seller-address-search"
              />
            </div>
            {errors.seller_address && <span className="seller-error-message">{errors.seller_address}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="seller_address_detail" className="seller-form-label">상세 주소 *</label>
            <input
              type="text"
              id="seller_address_detail"
              name="seller_address_detail"
              className={`seller-form-input ${errors.seller_address_detail ? 'error' : ''}`}
              placeholder="상세 주소를 입력하세요"
              value={formData.seller_address_detail}
              onChange={handleInputChange}
            />
            {errors.seller_address_detail && <span className="seller-error-message">{errors.seller_address_detail}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="business_registration_number" className="seller-form-label">사업자 등록번호 *</label>
            <input
              type="text"
              id="business_registration_number"
              name="business_registration_number"
              className={`seller-form-input ${errors.business_registration_number ? 'error' : ''}`}
              placeholder="123-45-67890"
              value={formData.business_registration_number}
              onChange={handleInputChange}
            />
            {errors.business_registration_number && <span className="seller-error-message">{errors.business_registration_number}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="seller_bank_name" className="seller-form-label">은행명 *</label>
            <input
              type="text"
              id="seller_bank_name"
              name="seller_bank_name"
              className={`seller-form-input ${errors.seller_bank_name ? 'error' : ''}`}
              placeholder="예: 국민은행"
              value={formData.seller_bank_name}
              onChange={handleInputChange}
            />
            {errors.seller_bank_name && <span className="seller-error-message">{errors.seller_bank_name}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="seller_account_number" className="seller-form-label">계좌번호 *</label>
            <input
              type="text"
              id="seller_account_number"
              name="seller_account_number"
              className={`seller-form-input ${errors.seller_account_number ? 'error' : ''}`}
              placeholder="숫자만 입력"
              value={formData.seller_account_number}
              onChange={handleInputChange}
            />
            {errors.seller_account_number && <span className="seller-error-message">{errors.seller_account_number}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="seller_depositor" className="seller-form-label">예금주 *</label>
            <input
              type="text"
              id="seller_depositor"
              name="seller_depositor"
              className={`seller-form-input ${errors.seller_depositor ? 'error' : ''}`}
              placeholder="예금주 이름"
              value={formData.seller_depositor}
              onChange={handleInputChange}
            />
            {errors.seller_depositor && <span className="seller-error-message">{errors.seller_depositor}</span>}
          </div>

          <div className="seller-form-group">
            <label htmlFor="introduction" className="seller-form-label">소개글</label>
            <textarea
              id="introduction"
              name="introduction"
              className="seller-form-textarea"
              placeholder="사업장 소개를 입력하세요"
              value={formData.introduction}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">상품 이미지 (최대 5개)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="seller-image-input"
            />
            
            {imagePreviews.length > 0 && (
              <div className="seller-image-preview-container">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="seller-image-preview">
                    <img src={preview} alt={`미리보기 ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="seller-image-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <TermsAgreement
            isAgreed={is_agreed}
            onAgreementChange={handleAgreementChange}
            userType="seller"
            error={errors.terms}
          />

          <button type="submit" className="seller-submit-button">
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerSignupForm;
