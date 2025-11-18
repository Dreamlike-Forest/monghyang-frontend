'use client';

import React from 'react';
import './SignupTypeSelector.css';

interface SignupTypeSelectorProps {
  onSelectType: (type: 'user' | 'seller' | 'brewery') => void;
  onBackToLogin: () => void;
}

const SignupTypeSelector: React.FC<SignupTypeSelectorProps> = ({ 
  onSelectType, 
  onBackToLogin 
}) => {
  const userTypes = [
    {
      type: 'user' as const,
      title: '일반 사용자',
      description: '전통주를 구매하고 양조장 체험을 예약하세요',
      icon: '👤',
      features: ['전통주 구매', '양조장 체험 예약', '커뮤니티 참여']
    },
    {
      type: 'seller' as const,
      title: '주류 판매자',
      description: '전통주를 판매하고 관리하세요',
      icon: '🏪',
      features: ['전통주 판매', '주문 관리', '주류 정보 등록']
    },
    {
      type: 'brewery' as const,
      title: '양조장 관리자',
      description: '양조장을 운영하고 체험 프로그램을 관리하세요',
      icon: '🏭',
      features: ['양조장 관리', '체험 프로그램 운영', '주류 등록']
    }
  ];

  return (
    <div className="signup-type-container">
      <div className="signup-type-content">
        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="signup-type-back-button"
          title="뒤로가기"
        >
          ←
        </button>
        
        <h1 className="signup-type-title">회원가입 유형 선택</h1>
        <p className="signup-type-subtitle">
          어떤 유형의 계정을 만드시겠습니까?
        </p>

        <div className="user-type-cards">
          {userTypes.map((userType) => (
            <div
              key={userType.type}
              className="user-type-card"
              onClick={() => onSelectType(userType.type)}
            >
              <div className="card-icon">{userType.icon}</div>
              <h3 className="card-title">{userType.title}</h3>
              <p className="card-description">{userType.description}</p>
              <ul className="card-features">
                {userType.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className="card-button">
                선택하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignupTypeSelector;