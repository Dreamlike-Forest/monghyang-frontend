'use client';

import React, { useState } from 'react';
import './BrewerySignupForm.css';

interface BrewerySignupFormProps {
  onBack: () => void;
}

const BrewerySignupForm: React.FC<BrewerySignupFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    business_email: '',
    password: '',
    passwordConfirm: '',
    brewery_name: '',
    business_phone: '',
    brewery_address: '',
    business_registration_number: '',
    account_number: '',
    depositor: '',
    bank_name: '',
    brewery_website: ''
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
    if (name === 'business_email') {
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
    if (!formData.business_email) {
      setErrors(prev => ({ ...prev, business_email: '이메일을 입력해주세요.' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.business_email)) {
      setErrors(prev => ({ ...prev, business_email: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }

    setIsCheckingEmail(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setEmailChecked(true);
      setIsCheckingEmail(false);
      setErrors(prev => ({ ...prev, business_email: '' }));
    }, 1000);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.business_email) newErrors.business_email = '업무용 이메일을 입력해주세요.';
    if (!emailChecked) newErrors.business_email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.brewery_name) newErrors.brewery_name = '양조장 상호명을 입력해주세요.';
    if (!formData.business_phone) newErrors.business_phone = '업무용 전화번호를 입력해주세요.';
    if (!formData.brewery_address) newErrors.brewery_address = '주소를 입력해주세요.';
    if (!formData.business_registration_number) newErrors.business_registration_number = '사업자 등록번호를 입력해주세요.';
    if (!formData.account_number) newErrors.account_number = '계좌번호를 입력해주세요.';
    if (!formData.depositor) newErrors.depositor = '예금주를 입력해주세요.';
    if (!formData.bank_name) newErrors.bank_name = '은행명을 입력해주세요.';
    
    // 웹사이트 URL 검증 (선택사항이므로 값이 있을 때만)
    if (formData.brewery_website && !isValidUrl(formData.brewery_website)) {
      newErrors.brewery_website = '올바른 URL 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('양조장 관리자 회원가입:', formData);
    // 실제 회원가입 API 호출
  };

  return (
    <div className="brewery-signup-container">
      <div className="brewery-signup-content">
        <button
          type="button"
          onClick={onBack}
          className="brewery-back-button"
          title="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="brewery-signup-title">양조장 관리자 회원가입</h1>
        
        <form className="brewery-signup-form" onSubmit={handleSubmit}>
          {/* 업무용 이메일 */}
          <div className="brewery-form-group">
            <label htmlFor="business_email" className="brewery-form-label">업무용 이메일 (아이디) *</label>
            <div className="brewery-email-input-group">
              <input
                type="email"
                id="business_email"
                name="business_email"
                className={`brewery-form-input ${errors.business_email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="brewery@company.com"
                value={formData.business_email}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={isCheckingEmail || emailChecked}
                className="brewery-email-check-btn"
              >
                {isCheckingEmail ? '확인중...' : emailChecked ? '확인완료' : '중복확인'}
              </button>
            </div>
            {errors.business_email && <span className="brewery-error-message">{errors.business_email}</span>}
            {emailChecked && !errors.business_email && <span className="brewery-success-message">사용 가능한 이메일입니다.</span>}
          </div>

          {/* 비밀번호 */}
          <div className="brewery-form-group">
            <label htmlFor="password" className="brewery-form-label">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`brewery-form-input ${errors.password ? 'error' : ''}`}
              placeholder="8자 이상의 비밀번호"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <span className="brewery-error-message">{errors.password}</span>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="brewery-form-group">
            <label htmlFor="passwordConfirm" className="brewery-form-label">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className={`brewery-form-input ${errors.passwordConfirm ? 'error' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
            />
            {errors.passwordConfirm && <span className="brewery-error-message">{errors.passwordConfirm}</span>}
          </div>

          {/* 양조장 상호명 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_name" className="brewery-form-label">양조장 상호명 *</label>
            <input
              type="text"
              id="brewery_name"
              name="brewery_name"
              className={`brewery-form-input ${errors.brewery_name ? 'error' : ''}`}
              placeholder="양조장 상호명을 입력하세요"
              value={formData.brewery_name}
              onChange={handleInputChange}
            />
            {errors.brewery_name && <span className="brewery-error-message">{errors.brewery_name}</span>}
          </div>

          {/* 업무용 전화번호 */}
          <div className="brewery-form-group">
            <label htmlFor="business_phone" className="brewery-form-label">업무용 전화번호 *</label>
            <input
              type="tel"
              id="business_phone"
              name="business_phone"
              className={`brewery-form-input ${errors.business_phone ? 'error' : ''}`}
              placeholder="02-1234-5678"
              value={formData.business_phone}
              onChange={handleInputChange}
            />
            {errors.business_phone && <span className="brewery-error-message">{errors.business_phone}</span>}
          </div>

          {/* 주소 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_address" className="brewery-form-label">주소 *</label>
            <input
              type="text"
              id="brewery_address"
              name="brewery_address"
              className={`brewery-form-input ${errors.brewery_address ? 'error' : ''}`}
              placeholder="양조장 주소를 입력하세요"
              value={formData.brewery_address}
              onChange={handleInputChange}
            />
            {errors.brewery_address && <span className="brewery-error-message">{errors.brewery_address}</span>}
          </div>

          {/* 사업자 등록번호 */}
          <div className="brewery-form-group">
            <label htmlFor="business_registration_number" className="brewery-form-label">사업자 등록번호 *</label>
            <input
              type="text"
              id="business_registration_number"
              name="business_registration_number"
              className={`brewery-form-input ${errors.business_registration_number ? 'error' : ''}`}
              placeholder="000-00-00000"
              value={formData.business_registration_number}
              onChange={handleInputChange}
            />
            {errors.business_registration_number && <span className="brewery-error-message">{errors.business_registration_number}</span>}
          </div>

          {/* 계좌번호 */}
          <div className="brewery-form-group">
            <label htmlFor="account_number" className="brewery-form-label">계좌번호 *</label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              className={`brewery-form-input ${errors.account_number ? 'error' : ''}`}
              placeholder="계좌번호를 입력하세요"
              value={formData.account_number}
              onChange={handleInputChange}
            />
            {errors.account_number && <span className="brewery-error-message">{errors.account_number}</span>}
          </div>

          {/* 예금주 */}
          <div className="brewery-form-group">
            <label htmlFor="depositor" className="brewery-form-label">예금주 *</label>
            <input
              type="text"
              id="depositor"
              name="depositor"
              className={`brewery-form-input ${errors.depositor ? 'error' : ''}`}
              placeholder="예금주명을 입력하세요"
              value={formData.depositor}
              onChange={handleInputChange}
            />
            {errors.depositor && <span className="brewery-error-message">{errors.depositor}</span>}
          </div>

          {/* 은행명 */}
          <div className="brewery-form-group">
            <label htmlFor="bank_name" className="brewery-form-label">은행명 *</label>
            <select
              id="bank_name"
              name="bank_name"
              className={`brewery-form-input ${errors.bank_name ? 'error' : ''}`}
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
            {errors.bank_name && <span className="brewery-error-message">{errors.bank_name}</span>}
          </div>

          {/* 웹사이트 URL (선택사항) */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_website" className="brewery-form-label">웹사이트 URL</label>
            <input
              type="url"
              id="brewery_website"
              name="brewery_website"
              className={`brewery-form-input ${errors.brewery_website ? 'error' : ''}`}
              placeholder="https://www.example.com"
              value={formData.brewery_website}
              onChange={handleInputChange}
            />
            {errors.brewery_website && <span className="brewery-error-message">{errors.brewery_website}</span>}
          </div>

          <button type="submit" className="brewery-submit-button">
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default BrewerySignupForm;