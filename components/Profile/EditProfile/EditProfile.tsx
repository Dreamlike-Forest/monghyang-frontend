'use client';

import React, { useState, useEffect } from 'react';
import AddressSearch from '../../Login/AddressSearch/AddressSearch';
import { updateUserProfile, checkNicknameAvailability, getUserInfo } from '../../../utils/userApi';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  // 현재 폼 데이터
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    name: '',
    phone: '',
    birth: '',
    gender: '',
    address: '',
    address_detail: '',
  });

  // 변경 여부를 비교하기 위한 원본 데이터 저장소
  const [initialData, setInitialData] = useState<any>({});

  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initProfileData = async () => {
      setIsLoading(true);
      try {
        let data = await getUserInfo();
        
        // API 실패 시 로컬 스토리지 데이터 사용 (Fallback)
        if (!data && typeof window !== 'undefined') {
          const storedData = localStorage.getItem('userData');
          if (storedData) {
            try {
              data = JSON.parse(storedData);
            } catch (e) {
              console.error('로컬 데이터 파싱 실패', e);
            }
          }
        }

        if (data) {
          // API 응답 필드명 매핑
          const mappedData = {
            email: data.users_email || data.email || '',
            nickname: data.users_nickname || data.nickname || '',
            name: data.users_name || data.name || '',
            phone: data.users_phone || data.phone || '',
            birth: data.users_birth || data.birth || '',
            gender: data.users_gender || data.gender || '', 
            address: data.users_address || data.address || '',
            address_detail: data.users_address_detail || data.address_detail || ''
          };
          
          setFormData(mappedData);
          setInitialData(mappedData);
        }
      } catch (error) {
        console.error('프로필 초기화 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'nickname') {
      // 원본 닉네임과 같으면 중복확인 불필요
      setIsNicknameChecked(value === initialData.nickname);
    }
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname) return;
    if (formData.nickname === initialData.nickname) {
      alert('현재 사용 중인 닉네임입니다.');
      setIsNicknameChecked(true);
      return;
    }

    const available = await checkNicknameAvailability(formData.nickname);
    if (available) {
      alert('사용 가능한 닉네임입니다.');
      setIsNicknameChecked(true);
    } else {
      alert('이미 사용 중인 닉네임입니다.');
      setIsNicknameChecked(false);
    }
  };

  const handleAddressSelect = (address: string, zonecode: string) => {
    setFormData(prev => ({
      ...prev,
      address: address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    // 변경된 데이터만 추출
    const changedData: any = {};
    let hasChanges = false;

    Object.keys(formData).forEach(key => {
      const k = key as keyof typeof formData;
      if (formData[k] !== initialData[k]) {
        changedData[k] = formData[k];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      alert('변경할 내용이 없습니다.');
      return;
    }

    const result = await updateUserProfile(changedData);

    if (result.success) {
      alert('회원 정보가 수정되었습니다. 정보 갱신을 위해 다시 로그인해주세요.');
      
      // [수정됨] 로그아웃 처리 및 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('refreshToken');
        
        window.location.href = '/?view=login';
      }
    } else {
      alert(`수정 실패: ${result.message}`);
    }
  };

  if (isLoading) return <div className="profile-loading">정보를 불러오는 중...</div>;

  return (
    <div className="edit-profile-container">
      <h2 className="profile-heading">프로필 수정</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        
        <div className="form-section">
          <h3 className="form-section-title">기본 정보 (수정 불가)</h3>
          
          <div className="form-group">
            <label>이메일</label>
            <input type="text" value={formData.email} readOnly className="input-readonly" />
          </div>

          <div className="form-group">
            <label>생년월일</label>
            <input type="text" value={formData.birth} readOnly className="input-readonly" placeholder="등록된 정보 없음" />
          </div>

          <div className="form-group">
            <label>성별</label>
            <input 
              type="text" 
              value={
                formData.gender === 'man' || formData.gender === 'male' ? '남성' : 
                formData.gender === 'woman' || formData.gender === 'female' ? '여성' : 
                formData.gender
              } 
              readOnly 
              className="input-readonly" 
              placeholder="등록된 정보 없음"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">수정 가능 정보</h3>

          <div className="form-group">
            <label>닉네임</label>
            <div className="input-with-btn">
              <input 
                type="text" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleInputChange} 
              />
              <button type="button" onClick={handleCheckNickname} className="check-btn">중복확인</button>
            </div>
          </div>

          <div className="form-group">
            <label>이름</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="010-0000-0000"
            />
          </div>

          <div className="form-group">
            <label>주소</label>
            <div className="input-with-btn">
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                readOnly
                placeholder="주소 검색을 이용해주세요"
              />
              <AddressSearch onAddressSelect={handleAddressSelect} className="check-btn"/>
            </div>
          </div>

          <div className="form-group">
            <label>상세주소</label>
            <input 
              type="text" 
              name="address_detail" 
              value={formData.address_detail} 
              onChange={handleInputChange} 
              placeholder="상세주소를 입력하세요"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">변경 완료</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;