'use client';

import React, { useState } from 'react';
import TermsAgreement from '../TermsAgreement/TermsAgreement'; 
import './SellerSignupForm.css';

interface SellerSignupFormProps {
  onBack: () => void;
}

const SellerSignupForm: React.FC<SellerSignupFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    // 판매자 정보만 (ERD seller 테이블 기준)
    seller_email: '',
    password: '',
    passwordConfirm: '',
    seller_name: '',
    seller_phone: '',
    seller_address: '',
    seller_address_detail: '',
    business_registration_number: '',
    seller_account_number: '',
    seller_depositor: '',
    seller_bank_name: '',
    introduction: ''
  });

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

    // 이메일이 변경되면 중복확인을 다시 해야 함
    if (name === 'seller_email') {
      setEmailChecked(false);
    }

    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEmailCheck = async () => {
    if (!formData.seller_email) {
      setErrors(prev => ({ ...prev, seller_email: '업무용 이메일을 입력해주세요.' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.seller_email)) {
      setErrors(prev => ({ ...prev, seller_email: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }

    setIsCheckingEmail(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setEmailChecked(true);
      setIsCheckingEmail(false);
      setErrors(prev => ({ ...prev, seller_email: '' }));
    }, 1000);
  };

  const handleAgreementChange = (agreed: boolean) => {
    setIsAgreed(agreed);
    if (agreed && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 판매자 정보 검증
    if (!formData.seller_email) newErrors.seller_email = '업무용 이메일을 입력해주세요.';
    if (!emailChecked) newErrors.seller_email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.seller_name) newErrors.seller_name = '판매자 이름을 입력해주세요.';
    if (!formData.seller_phone) newErrors.seller_phone = '업무용 전화번호를 입력해주세요.';
    if (!formData.seller_address) newErrors.seller_address = '사업장 위치를 입력해주세요.';
    if (!formData.seller_address_detail) newErrors.seller_address_detail = '사업장 상세 주소를 입력해주세요.';
    if (!formData.business_registration_number) newErrors.business_registration_number = '사업자 등록번호를 입력해주세요.';
    if (!formData.seller_account_number) newErrors.seller_account_number = '계좌번호를 입력해주세요.';
    if (!formData.seller_depositor) newErrors.seller_depositor = '예금주를 입력해주세요.';
    if (!formData.seller_bank_name) newErrors.seller_bank_name = '은행명을 입력해주세요.';

    // 약관 동의 검증
    if (!is_agreed) newErrors.terms = '약관에 동의해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('판매자 회원가입:', { ...formData, is_agreed });
    // 실제 회원가입 API 호출
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
        
        <h1 className="seller-signup-title">술 판매자 회원가입</h1>
        
        <form className="seller-signup-form" onSubmit={handleSubmit}>
          {/* 업무용 이메일 */}
          <div className="seller-form-group">
            <label htmlFor="seller_email" className="seller-form-label">업무용 이메일 (아이디) *</label>
            <div className="seller-email-input-group">
              <input
                type="email"
                id="seller_email"
                name="seller_email"
                className={`seller-form-input ${errors.seller_email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="business@company.com"
                value={formData.seller_email}
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
            {errors.seller_email && <span className="seller-error-message">{errors.seller_email}</span>}
            {emailChecked && !errors.seller_email && <span className="seller-success-message">사용 가능한 이메일입니다.</span>}
          </div>

          {/* 비밀번호 */}
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

          {/* 비밀번호 확인 */}
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

          {/* 판매자 이름 */}
          <div className="seller-form-group">
            <label htmlFor="seller_name" className="seller-form-label">판매자 이름 *</label>
            <input
              type="text"
              id="seller_name"
              name="seller_name"
              className={`seller-form-input ${errors.seller_name ? 'error' : ''}`}
              placeholder="판매자 이름을 입력하세요"
              value={formData.seller_name}
              onChange={handleInputChange}
            />
            {errors.seller_name && <span className="seller-error-message">{errors.seller_name}</span>}
          </div>

          {/* 업무용 전화번호 */}
          <div className="seller-form-group">
            <label htmlFor="seller_phone" className="seller-form-label">업무용 전화번호 *</label>
            <input
              type="tel"
              id="seller_phone"
              name="seller_phone"
              className={`seller-form-input ${errors.seller_phone ? 'error' : ''}`}
              placeholder="02-1234-5678"
              value={formData.seller_phone}
              onChange={handleInputChange}
            />
            {errors.seller_phone && <span className="seller-error-message">{errors.seller_phone}</span>}
          </div>

          {/* 사업장 위치 주소 */}
          <div className="seller-form-group">
            <label htmlFor="seller_address" className="seller-form-label">사업장 위치 주소 *</label>
            <input
              type="text"
              id="seller_address"
              name="seller_address"
              className={`seller-form-input ${errors.seller_address ? 'error' : ''}`}
              placeholder="사업장 주소를 입력하세요"
              value={formData.seller_address}
              onChange={handleInputChange}
            />
            {errors.seller_address && <span className="seller-error-message">{errors.seller_address}</span>}
          </div>

          {/* 사업장 상세 주소 */}
          <div className="seller-form-group">
            <label htmlFor="seller_address_detail" className="seller-form-label">사업장 상세 주소 *</label>
            <input
              type="text"
              id="seller_address_detail"
              name="seller_address_detail"
              className={`seller-form-input ${errors.seller_address_detail ? 'error' : ''}`}
              placeholder="사업장 상세 주소를 입력하세요"
              value={formData.seller_address_detail}
              onChange={handleInputChange}
            />
            {errors.seller_address_detail && <span className="seller-error-message">{errors.seller_address_detail}</span>}
          </div>

          {/* 사업자 등록번호 */}
          <div className="seller-form-group">
            <label htmlFor="business_registration_number" className="seller-form-label">사업자 등록번호 *</label>
            <input
              type="text"
              id="business_registration_number"
              name="business_registration_number"
              className={`seller-form-input ${errors.business_registration_number ? 'error' : ''}`}
              placeholder="000-00-00000"
              value={formData.business_registration_number}
              onChange={handleInputChange}
            />
            {errors.business_registration_number && <span className="seller-error-message">{errors.business_registration_number}</span>}
          </div>

          {/* 계좌번호 */}
          <div className="seller-form-group">
            <label htmlFor="seller_account_number" className="seller-form-label">계좌번호 *</label>
            <input
              type="text"
              id="seller_account_number"
              name="seller_account_number"
              className={`seller-form-input ${errors.seller_account_number ? 'error' : ''}`}
              placeholder="계좌번호를 입력하세요"
              value={formData.seller_account_number}
              onChange={handleInputChange}
            />
            {errors.seller_account_number && <span className="seller-error-message">{errors.seller_account_number}</span>}
          </div>

          {/* 예금주 */}
          <div className="seller-form-group">
            <label htmlFor="seller_depositor" className="seller-form-label">예금주 *</label>
            <input
              type="text"
              id="seller_depositor"
              name="seller_depositor"
              className={`seller-form-input ${errors.seller_depositor ? 'error' : ''}`}
              placeholder="예금주명을 입력하세요"
              value={formData.seller_depositor}
              onChange={handleInputChange}
            />
            {errors.seller_depositor && <span className="seller-error-message">{errors.seller_depositor}</span>}
          </div>

          {/* 은행명 */}
          <div className="seller-form-group">
            <label htmlFor="seller_bank_name" className="seller-form-label">은행명 *</label>
            <select
              id="seller_bank_name"
              name="seller_bank_name"
              className={`seller-form-input ${errors.seller_bank_name ? 'error' : ''}`}
              value={formData.seller_bank_name}
              onChange={handleInputChange}
            >
              <option value="">은행을 선택하세요</option>
              <option value="국민은행">국민은행</option>
              <option value="신한은행">신한은행</option>
              <option value="우리은행">우리은행</option>
              <option value="하나은행">하나은행</option>
              <option value="농협은행">농협은행</option>
              <option value="기업은행">기업은행</option>
              <option value="카카오뱅크">카카오뱅크</option>
              <option value="토스뱅크">토스뱅크</option>
              <option value="기타">기타</option>
            </select>
            {errors.seller_bank_name && <span className="seller-error-message">{errors.seller_bank_name}</span>}
          </div>

          {/* 소개 (선택사항) */}
          <div className="seller-form-group">
            <label htmlFor="introduction" className="seller-form-label">판매자 소개</label>
            <textarea
              id="introduction"
              name="introduction"
              className={`seller-form-input ${errors.introduction ? 'error' : ''}`}
              placeholder="판매자에 대한 소개를 입력하세요"
              value={formData.introduction}
              onChange={handleInputChange}
              rows={4}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            {errors.introduction && <span className="seller-error-message">{errors.introduction}</span>}
          </div>

          {/* 약관 동의 컴포넌트 */}
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