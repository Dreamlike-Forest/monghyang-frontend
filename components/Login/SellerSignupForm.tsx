'use client';

import React, { useState } from 'react';
import './SellerSignupForm.css';

interface SellerSignupFormProps {
  onBack: () => void;
}

const SellerSignupForm: React.FC<SellerSignupFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    office_address: '',
    business_registration_number: '',
    account_number: '',
    depositor: '',
    bank_name: ''
  });

  const [emailChecked, setEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 이메일이 변경되면 중복확인을 다시 해야 함
    if (name === 'email') {
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
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }

    setIsCheckingEmail(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setEmailChecked(true);
      setIsCheckingEmail(false);
      setErrors(prev => ({ ...prev, email: '' }));
    }, 1000);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) newErrors.email = '업무용 이메일을 입력해주세요.';
    if (!emailChecked) newErrors.email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.name) newErrors.name = '실명을 입력해주세요.';
    if (!formData.phone) newErrors.phone = '업무용 전화번호를 입력해주세요.';
    if (!formData.office_address) newErrors.office_address = '사업장 위치를 입력해주세요.';
    if (!formData.business_registration_number) newErrors.business_registration_number = '사업자 등록번호를 입력해주세요.';
    if (!formData.account_number) newErrors.account_number = '계좌번호를 입력해주세요.';
    if (!formData.depositor) newErrors.depositor = '예금주를 입력해주세요.';
    if (!formData.bank_name) newErrors.bank_name = '은행명을 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('판매자 회원가입:', formData);
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
            <label htmlFor="email" className="seller-form-label">업무용 이메일 (아이디) *</label>
            <div className="seller-email-input-group">
              <input
                type="email"
                id="email"
                name="email"
                className={`seller-form-input ${errors.email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="business@company.com"
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

          {/* 실명 */}
          <div className="seller-form-group">
            <label htmlFor="name" className="seller-form-label">실명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`seller-form-input ${errors.name ? 'error' : ''}`}
              placeholder="실명을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="seller-error-message">{errors.name}</span>}
          </div>

          {/* 업무용 전화번호 */}
          <div className="seller-form-group">
            <label htmlFor="phone" className="seller-form-label">업무용 전화번호 *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`seller-form-input ${errors.phone ? 'error' : ''}`}
              placeholder="02-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <span className="seller-error-message">{errors.phone}</span>}
          </div>

          {/* 사업장 위치 */}
          <div className="seller-form-group">
            <label htmlFor="office_address" className="seller-form-label">사업장 위치 *</label>
            <input
              type="text"
              id="office_address"
              name="office_address"
              className={`seller-form-input ${errors.office_address ? 'error' : ''}`}
              placeholder="사업장 주소를 입력하세요"
              value={formData.office_address}
              onChange={handleInputChange}
            />
            {errors.office_address && <span className="seller-error-message">{errors.office_address}</span>}
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
            <label htmlFor="account_number" className="seller-form-label">계좌번호 *</label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              className={`seller-form-input ${errors.account_number ? 'error' : ''}`}
              placeholder="계좌번호를 입력하세요"
              value={formData.account_number}
              onChange={handleInputChange}
            />
            {errors.account_number && <span className="seller-error-message">{errors.account_number}</span>}
          </div>

          {/* 예금주 */}
          <div className="seller-form-group">
            <label htmlFor="depositor" className="seller-form-label">예금주 *</label>
            <input
              type="text"
              id="depositor"
              name="depositor"
              className={`seller-form-input ${errors.depositor ? 'error' : ''}`}
              placeholder="예금주명을 입력하세요"
              value={formData.depositor}
              onChange={handleInputChange}
            />
            {errors.depositor && <span className="seller-error-message">{errors.depositor}</span>}
          </div>

          {/* 은행명 */}
          <div className="seller-form-group">
            <label htmlFor="bank_name" className="seller-form-label">은행명 *</label>
            <select
              id="bank_name"
              name="bank_name"
              className={`seller-form-input ${errors.bank_name ? 'error' : ''}`}
              value={formData.bank_name}
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
            {errors.bank_name && <span className="seller-error-message">{errors.bank_name}</span>}
          </div>

          <button type="submit" className="seller-submit-button">
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerSignupForm;