'use client';

import React, { useState } from 'react';
import TermsAgreement from '../TermsAgreement/TermsAgreement'; 
import './BrewerySignupForm.css';

interface BrewerySignupFormProps {
  onBack: () => void;
}

const BrewerySignupForm: React.FC<BrewerySignupFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    // 양조장 정보들
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    nickname: '',
    gender: '',
    birth: '',
    brewery_name: '',
    brewery_address: '',
    brewery_address_detail: '',
    business_registration_number: '',
    brewery_depositor: '',
    brewery_account_number: '',
    brewery_bank_name: '',
    brewery_website: '',
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
      setErrors(prev => ({ ...prev, email: '업무용 이메일을 입력해주세요.' }));
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

  const handleAgreementChange = (agreed: boolean) => {
    setIsAgreed(agreed);
    if (agreed && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

   // 양조장 정보 검증
    if (!formData.email) newErrors.email = '업무용 이메일을 입력해주세요.';
    if (!emailChecked) newErrors.email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.phone) newErrors.phone = '업무용 전화번호를 입력해주세요.';
    if (!formData.nickname) newErrors.nickname = '닉네임을 입력해주세요.';
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요.';
    if (!formData.birth) newErrors.birth = '생년월일을 입력해주세요.';
    if (!formData.brewery_name) newErrors.brewery_name = '양조장 상호명을 입력해주세요.';
    if (!formData.brewery_address) newErrors.brewery_address = '양조장 주소를 입력해주세요.';
    if (!formData.brewery_address_detail) newErrors.brewery_address_detail = '양조장 상세 주소를 입력해주세요.';
    if (!formData.business_registration_number) newErrors.business_registration_number = '사업자 등록번호를 입력해주세요.';
    if (!formData.brewery_account_number) newErrors.brewery_account_number = '계좌번호를 입력해주세요.';
    if (!formData.brewery_depositor) newErrors.brewery_depositor = '예금주를 입력해주세요.';
    if (!formData.brewery_bank_name) newErrors.brewery_bank_name = '은행명을 입력해주세요.';
    
    // 웹사이트 URL 검증 (선택사항이므로 값이 있을 때만)
    if (formData.brewery_website && !isValidUrl(formData.brewery_website)) {
      newErrors.brewery_website = '올바른 URL 형식을 입력해주세요.';
    }
    
    // 약관 동의 검증
    if (!is_agreed) newErrors.terms = '약관에 동의해주세요.';
    
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

    console.log('양조장 관리자 회원가입:', { ...formData, is_agreed });
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
            <label htmlFor="email" className="brewery-form-label">업무용 이메일 (아이디) *</label>
            <div className="brewery-email-input-group">
              <input
                type="email"
                id="email"
                name="email"
                className={`brewery-form-input ${errors.email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="brewery@company.com"
                value={formData.email}
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
            {errors.email && <span className="brewery-error-message">{errors.email}</span>}
            {emailChecked && !errors.email && <span className="brewery-success-message">사용 가능한 이메일입니다.</span>}
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

          {/* 업무용 전화번호 */}
          <div className="brewery-form-group">
            <label htmlFor="phone" className="brewery-form-label">업무용 전화번호 *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`brewery-form-input ${errors.phone ? 'error' : ''}`}
              placeholder="02-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <span className="brewery-error-message">{errors.phone}</span>}
          </div>

          {/* 닉네임 */}
          <div className="brewery-form-group">
            <label htmlFor="nickname" className="brewery-form-label">닉네임 *</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className={`brewery-form-input ${errors.nickname ? 'error' : ''}`}
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={handleInputChange}
            />
            {errors.nickname && <span className="brewery-error-message">{errors.nickname}</span>}
          </div>

          {/* 성별 */}
          <div className="brewery-form-group">
            <label htmlFor="gender" className="brewery-form-label">성별 *</label>
            <select
              id="gender"
              name="gender"
              className={`brewery-form-input ${errors.gender ? 'error' : ''}`}
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors.gender && <span className="brewery-error-message">{errors.gender}</span>}
          </div>

          {/* 생년월일 */}
          <div className="brewery-form-group">
            <label htmlFor="birth" className="brewery-form-label">생년월일 *</label>
            <input
              type="date"
              id="birth"
              name="birth"
              className={`brewery-form-input ${errors.birth ? 'error' : ''}`}
              value={formData.birth}
              onChange={handleInputChange}
            />
            {errors.birth && <span className="brewery-error-message">{errors.birth}</span>}
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

          {/* 양조장 주소 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_address" className="brewery-form-label">양조장 주소 *</label>
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

          {/* 양조장 상세 주소 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_address_detail" className="brewery-form-label">양조장 상세 주소 *</label>
            <input
              type="text"
              id="brewery_address_detail"
              name="brewery_address_detail"
              className={`brewery-form-input ${errors.brewery_address_detail ? 'error' : ''}`}
              placeholder="양조장 상세 주소를 입력하세요"
              value={formData.brewery_address_detail}
              onChange={handleInputChange}
            />
            {errors.brewery_address_detail && <span className="brewery-error-message">{errors.brewery_address_detail}</span>}
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
            <label htmlFor="brewery_account_number" className="brewery-form-label">계좌번호 *</label>
            <input
              type="text"
              id="brewery_account_number"
              name="brewery_account_number"
              className={`brewery-form-input ${errors.brewery_account_number ? 'error' : ''}`}
              placeholder="계좌번호를 입력하세요"
              value={formData.brewery_account_number}
              onChange={handleInputChange}
            />
            {errors.brewery_account_number && <span className="brewery-error-message">{errors.brewery_account_number}</span>}
          </div>

          {/* 예금주 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_depositor" className="brewery-form-label">예금주 *</label>
            <input
              type="text"
              id="brewery_depositor"
              name="brewery_depositor"
              className={`brewery-form-input ${errors.brewery_depositor ? 'error' : ''}`}
              placeholder="예금주명을 입력하세요"
              value={formData.brewery_depositor}
              onChange={handleInputChange}
            />
            {errors.brewery_depositor && <span className="brewery-error-message">{errors.brewery_depositor}</span>}
          </div>

          {/* 은행명 */}
          <div className="brewery-form-group">
            <label htmlFor="brewery_bank_name" className="brewery-form-label">은행명 *</label>
            <select
              id="brewery_bank_name"
              name="brewery_bank_name"
              className={`brewery-form-input ${errors.brewery_bank_name ? 'error' : ''}`}
              value={formData.brewery_bank_name}
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
            {errors.brewery_bank_name && <span className="brewery-error-message">{errors.brewery_bank_name}</span>}
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

          {/* 소개 (선택사항) */}
          <div className="brewery-form-group">
            <label htmlFor="introduction" className="brewery-form-label">양조장 소개</label>
            <textarea
              id="introduction"
              name="introduction"
              className={`brewery-form-input ${errors.introduction ? 'error' : ''}`}
              placeholder="양조장에 대한 소개를 입력하세요"
              value={formData.introduction}
              onChange={handleInputChange}
              rows={4}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            {errors.introduction && <span className="brewery-error-message">{errors.introduction}</span>}
          </div>

          {/* 약관 동의 컴포넌트 */}
          <TermsAgreement
            isAgreed={is_agreed}
            onAgreementChange={handleAgreementChange}
            userType="brewery"
            error={errors.terms}
          />

          <button type="submit" className="brewery-submit-button">
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default BrewerySignupForm;