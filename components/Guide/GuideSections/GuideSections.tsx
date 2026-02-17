import React from 'react';
import './GuideSections.css';

// 1. 회원 및 계정 가이드
export const MemberSection: React.FC = () => (
  <div className="guide-section-container">
    <h2 className="guide-section-heading">회원 가입 및 계정 관리</h2>
    
    <div className="guide-info-card">
      <h3 className="guide-card-title">회원 가입 유형</h3>
      <p className="guide-card-text">몽향은 세 가지 유형의 회원 가입을 지원합니다.</p>
      <ul className="guide-bullet-list">
        <li><strong>일반 회원:</strong> 전통주 쇼핑, 예약, 커뮤니티 활동을 할 수 있습니다.</li>
        <li><strong>판매자:</strong> 전통주 상품을 등록하고 판매할 수 있습니다. (사업자 등록 필요)</li>
        <li><strong>양조장:</strong> 양조장을 등록하고 체험 프로그램을 운영할 수 있습니다. (사업자 등록 필요)</li>
      </ul>
    </div>

    <div className="guide-info-card">
      <h3 className="guide-card-title">비밀번호 찾기</h3>
      <p className="guide-card-text">
        로그인 화면의 '비밀번호 찾기' 링크를 통해 이메일 인증 후 비밀번호를 재설정할 수 있습니다.<br/>
        가입 시 등록한 이메일 주소를 정확히 입력해주세요.
      </p>
    </div>

    <div className="guide-info-card">
      <h3 className="guide-card-title">이용약관 및 정책</h3>
      <p className="guide-card-text">
        몽향 서비스 이용약관 및 개인정보처리방침은 회원가입 시 동의하신 내용을 따릅니다.<br/>
        자세한 내용은 페이지 하단의 링크를 통해 확인하실 수 있습니다.
      </p>
    </div>
  </div>
);

// 2. 예약 가이드
export const ReservationSection: React.FC = () => (
  <div className="guide-section-container">
    <h2 className="guide-section-heading">양조장 체험 예약</h2>
    
    <div className="guide-info-card">
      <h3 className="guide-card-title">예약 방법</h3>
      <ul className="guide-bullet-list">
        <li>양조장 목록에서 원하는 양조장을 선택합니다.</li>
        <li>'체험 예약' 탭에서 날짜와 시간을 선택합니다.</li>
        <li>인원 및 예약자 정보를 입력하고 결제하면 예약이 확정됩니다.</li>
      </ul>
    </div>

    <div className="guide-info-card guide-info-card-warning">
      <h3 className="guide-card-title">취소 및 환불 정책</h3>
      <p className="guide-card-text">
        체험일 기준 3일 전까지는 100% 환불이 가능합니다.<br/>
        그 이후에는 취소 수수료가 발생할 수 있으니 유의해주세요.
      </p>
    </div>
  </div>
);

// 3. 쇼핑 가이드
export const ShoppingSection: React.FC = () => (
  <div className="guide-section-container">
    <h2 className="guide-section-heading">전통주 쇼핑 안내</h2>
    
    <div className="guide-info-card">
      <h3 className="guide-card-title">상품 주문 방법</h3>
      <ul className="guide-bullet-list">
        <li>원하는 전통주를 장바구니에 담거나 '바로구매'를 선택합니다.</li>
        <li>배송지 정보를 입력하고 결제를 진행합니다.</li>
        <li>성인 인증이 완료된 계정만 주류 구매가 가능합니다.</li>
      </ul>
    </div>

    <div className="guide-info-card">
      <h3 className="guide-card-title">배송 안내</h3>
      <p className="guide-card-text">
        모든 상품은 안전하게 포장되어 배송됩니다.<br/>
        기본적으로 50,000원 이상 무료 배송을 원칙으로 하고 있습니다.
      </p>
    </div>
  </div>
);

// 4. 커뮤니티 가이드
export const CommunitySection: React.FC = () => (
  <div className="guide-section-container">
    <h2 className="guide-section-heading">커뮤니티 이용 안내</h2>
    
    <div className="guide-info-card">
      <h3 className="guide-card-title">게시판 종류</h3>
      <ul className="guide-bullet-list">
        <li><strong>자유게시판:</strong> 전통주와 관련된 자유로운 이야기를 나눕니다.</li>
        <li><strong>술 리뷰:</strong> 마셔본 전통주에 대한 솔직한 후기를 남깁니다.</li>
        <li><strong>양조장 방문기:</strong> 양조장 체험 및 방문 경험을 공유합니다.</li>
      </ul>
    </div>

    <div className="guide-info-card guide-info-card-warning">
      <h3 className="guide-card-title">주의사항</h3>
      <p className="guide-card-text">
        건전한 커뮤니티 문화를 위해 비방, 욕설, 광고성 게시글은 예고 없이 삭제될 수 있습니다.<br/>
        타인의 권리를 침해하지 않도록 주의해 주세요.
      </p>
    </div>
  </div>
);