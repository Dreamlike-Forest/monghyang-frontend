'use client';

import React, { useState } from 'react';
import TermsAgreement from '../TermsAgreement/TermsAgreement';
import AddressSearch from '../AddressSearch/AddressSearch';
import { signup, checkEmailAvailability } from '../../../utils/authUtils'; 
import './UserSignupForm.css';

interface UserSignupFormProps {
  onBack: () => void;
  onBackToLogin: () => void; 
}

const UserSignupForm: React.FC<UserSignupFormProps> = ({ onBack, onBackToLogin }) => { 
  const [formData, setFormData] = useState({
    // 회원 테이블 필드
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    name: '',
    phone: '',
    birth: '',
    gender: '',
    address: '',
    address_detail: '',
    zonecode: '',
  });

  const [emailChecked, setEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [is_agreed, setIsAgreed] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 추가

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 이메일이 변경되면 중복확인을 다시 해야 함
    if (name === 'email') {
      setEmailChecked(false);
      if (errors.email) {
         setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 주소 검색 결과 처리
  const handleAddressSelect = (address: string, zonecode: string) => {
    setFormData(prev => ({
      ...prev,
      address: address,
      zonecode: zonecode
    }));

    // 주소 관련 에러 초기화
    if (errors.address) {
      setErrors(prev => ({
        ...prev,
        address: ''
      }));
    }
  };

  // 이메일 중복확인 (API 연동)
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
    setErrors(prev => ({ ...prev, email: '' }));
    
    try {
      const result = await checkEmailAvailability(formData.email);
      if (result.available) {
        setEmailChecked(true);
        alert(result.message || '사용 가능한 이메일입니다.');
      } else {
        setEmailChecked(false);
        setErrors(prev => ({ ...prev, email: result.message || '이미 사용 중인 이메일입니다.' }));
      }
    } catch (error: any) {
      setEmailChecked(false);
      setErrors(prev => ({ ...prev, email: error.message || '이메일 확인 중 오류 발생' }));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 약관 동의 핸들러 
  const handleAgreementChange = (agreed: boolean) => {
    setIsAgreed(agreed);
    if (agreed && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 회원 필드 검증
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.';
    if (!emailChecked) newErrors.email = '이메일 중복확인을 해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!formData.nickname) newErrors.nickname = '닉네임을 입력해주세요.';
    if (!formData.name) newErrors.name = '실명을 입력해주세요.';
    if (!formData.phone) newErrors.phone = '전화번호를 입력해주세요.';
    if (!formData.birth) newErrors.birth = '생년월일을 입력해주세요.';
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요.';
    if (!formData.address) newErrors.address = '주소를 입력해주세요.';
    if (!formData.address_detail) newErrors.address_detail = '상세 주소를 입력해주세요.';
    
    // 약관 동의 검증
    if (!is_agreed) newErrors.terms = '약관에 동의해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러 (API 연동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      name: formData.name,
      phone: formData.phone,
      birth: formData.birth,
      gender: formData.gender,
      address: formData.address,
      address_detail: formData.address_detail,
      is_agreed: is_agreed
    };
    
    try {
      const result = await signup(submitData, 'user');
      if (result.success) {
        // 회원가입 성공 시 로그인 화면으로
        onBackToLogin(); 
      } else {
        // API 서버에서 받은 에러 메시지 표시
        setErrors(prev => ({ ...prev, submit: result.message }));
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, submit: error.message || '알 수 없는 오류가 발생했습니다.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    onBack(); // SignupContainer로 돌아가기
  };

  return (
    <div className="user-signup-container">
      <div className="user-signup-content">
        <button
          type="button"
          onClick={handleBack} 
          className="user-back-button"
          title="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="user-signup-title">일반 사용자 회원가입</h1>
        
        <form className="user-signup-form" onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="user-form-group">
            <label htmlFor="email" className="user-form-label">이메일 (아이디) *</label>
            <div className="user-email-input-group">
              <input
                type="email"
                id="email"
                name="email"
                className={`user-form-input ${errors.email ? 'error' : ''} ${emailChecked ? 'success' : ''}`}
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isCheckingEmail}
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={isCheckingEmail || emailChecked}
                className="user-email-check-btn"
              >
                {isCheckingEmail ? '확인중...' : emailChecked ? '확인완료' : '중복확인'}
              </button>
            </div>
            {errors.email && <span className="user-error-message">{errors.email}</span>}
            {emailChecked && !errors.email && <span className="user-success-message">사용 가능한 이메일입니다.</span>}
          </div>

          {/* 비밀번호 */}
          <div className="user-form-group">
            <label htmlFor="password" className="user-form-label">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`user-form-input ${errors.password ? 'error' : ''}`}
              placeholder="8자 이상의 비밀번호"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <span className="user-error-message">{errors.password}</span>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="user-form-group">
            <label htmlFor="passwordConfirm" className="user-form-label">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className={`user-form-input ${errors.passwordConfirm ? 'error' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
            />
            {errors.passwordConfirm && <span className="user-error-message">{errors.passwordConfirm}</span>}
          </div>

          {/* 닉네임 */}
          <div className="user-form-group">
            <label htmlFor="nickname" className="user-form-label">닉네임 *</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className={`user-form-input ${errors.nickname ? 'error' : ''}`}
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={handleInputChange}
            />
            {errors.nickname && <span className="user-error-message">{errors.nickname}</span>}
          </div>

          {/* 실명 */}
          <div className="user-form-group">
            <label htmlFor="name" className="user-form-label">실명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`user-form-input ${errors.name ? 'error' : ''}`}
              placeholder="실명을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="user-error-message">{errors.name}</span>}
          </div>

          {/* 전화번호 */}
          <div className="user-form-group">
            <label htmlFor="phone" className="user-form-label">전화번호 *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`user-form-input ${errors.phone ? 'error' : ''}`}
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <span className="user-error-message">{errors.phone}</span>}
          </div>

          {/* 생년월일 */}
          <div className="user-form-group">
            <label htmlFor="birth" className="user-form-label">생년월일 *</label>
            <input
              type="date"
              id="birth"
              name="birth"
              className={`user-form-input ${errors.birth ? 'error' : ''}`}
              value={formData.birth}
              onChange={handleInputChange}
            />
            {errors.birth && <span className="user-error-message">{errors.birth}</span>}
          </div>

          {/* 성별 */}
          <div className="user-form-group">
            <label htmlFor="gender" className="user-form-label">성별 *</label>
            <select
              id="gender"
              name="gender"
              className={`user-form-input ${errors.gender ? 'error' : ''}`}
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">성별을 선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors.gender && <span className="user-error-message">{errors.gender}</span>}
          </div>

          {/* 주소 - 주소 검색 기능 추가 */}
          <div className="user-form-group">
            <label htmlFor="address" className="user-form-label">주소 *</label>
            <div className="user-address-input-group">
              <input
                type="text"
                id="address"
                name="address"
                className={`user-form-input ${errors.address ? 'error' : ''}`}
                placeholder="주소검색 버튼을 클릭하세요"
                value={formData.address}
                readOnly
              />
              <AddressSearch
                onAddressSelect={handleAddressSelect}
                className="user-address-search"
              />
            </div>
            {errors.address && <span className="user-error-message">{errors.address}</span>}
          </div>

          {/* 상세 주소 */}
          <div className="user-form-group">
            <label htmlFor="address_detail" className="user-form-label">상세 주소 *</label>
            <input
              type="text"
              id="address_detail"
              name="address_detail"
              className={`user-form-input ${errors.address_detail ? 'error' : ''}`}
              placeholder="상세 주소를 입력하세요 (예: 101동 201호)"
              value={formData.address_detail}
              onChange={handleInputChange}
            />
            {errors.address_detail && <span className="user-error-message">{errors.address_detail}</span>}
          </div>

          {/* 약관 동의 컴포넌트 추가 */}
          <TermsAgreement
            isAgreed={is_agreed}
            onAgreementChange={handleAgreementChange}
            userType="user"
            error={errors.terms}
          />

          {/* 제출 에러 메시지 */}
          {errors.submit && (
            <div className="user-error-message" style={{ marginBottom: '16px', textAlign: 'center' }}>
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className="user-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '회원가입 중...' : '회원가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSignupForm;