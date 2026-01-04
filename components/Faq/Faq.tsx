'use client';

import React, { useState } from 'react';
import FaqSidebar, { FaqCategory } from './FaqSidebar';
import './Faq.css';

interface FaqItem {
  id: number;
  category: FaqCategory;
  categoryLabel: string; // 화면 표시용
  question: string;
  answer: string;
}

// 자주 묻는 질문 더미 데이터
const MOCK_FAQS: FaqItem[] = [
  {
    id: 1,
    category: 'member',
    categoryLabel: '회원',
    question: '아이디와 비밀번호를 잊어버렸어요.',
    answer: "로그인 화면 하단의 '아이디 찾기' 또는 '비밀번호 찾기'를 이용해 주세요.\n가입하신 이메일 인증을 통해 정보를 찾거나 비밀번호를 재설정하실 수 있습니다."
  },
  {
    id: 2,
    category: 'order',
    categoryLabel: '주문',
    question: '비회원도 구매가 가능한가요?',
    answer: "몽향은 전통주 통신판매 관련 법규 준수 및 성인 인증을 위해 회원가입 후 구매가 가능합니다.\n간편 회원가입을 통해 빠르게 이용해보세요."
  },
  {
    id: 3,
    category: 'delivery',
    categoryLabel: '배송',
    question: '배송비는 얼마인가요?',
    answer: "기본 배송비는 3,000원이며, 50,000원 이상 구매 시 무료 배송 혜택을 드립니다.\n단, 제주 및 도서 산간 지역은 추가 배송비가 발생할 수 있습니다."
  },
  {
    id: 4,
    category: 'delivery',
    categoryLabel: '배송',
    question: '배송은 언제 시작되나요?',
    answer: "평일 오후 2시 이전 결제 완료 건에 한해 당일 발송을 원칙으로 하고 있습니다.\n택배사 사정에 따라 배송 완료까지 1~3일 정도 소요될 수 있습니다."
  },
  {
    id: 5,
    category: 'cancel',
    categoryLabel: '취소/환불',
    question: '주문을 취소하고 싶어요.',
    answer: "주문 상태가 '입금대기' 또는 '결제완료' 단계일 경우 마이페이지 > 주문내역에서 직접 취소가 가능합니다.\n이미 '상품준비중' 또는 '배송중'인 경우에는 취소가 불가능하며 반품 절차를 진행해야 합니다."
  },
  {
    id: 6,
    category: 'other',
    categoryLabel: '기타',
    question: '양조장 체험 예약은 어떻게 하나요?',
    answer: "상단 메뉴의 '양조장' 탭에서 원하는 양조장을 선택하신 후, '체험 예약' 캘린더를 통해 원하시는 날짜와 시간을 선택하여 예약하실 수 있습니다."
  },
  {
    id: 7,
    category: 'member',
    categoryLabel: '회원',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: "마이페이지 > 프로필 관리 > 회원 탈퇴 메뉴에서 진행하실 수 있습니다.\n탈퇴 시 모든 정보가 삭제되며 복구할 수 없으니 신중하게 결정해 주세요."
  }
];

const Faq: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // 카테고리 필터링
  const filteredFaqs = activeCategory === 'all' 
    ? MOCK_FAQS 
    : MOCK_FAQS.filter(item => item.category === activeCategory);

  // 아코디언 토글
  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="faq-container">
      <div className="faq-page-header">
        <h1 className="faq-page-title">자주 묻는 질문</h1>
        <p className="faq-page-subtitle">몽향 서비스 이용 중 궁금한 점을 빠르게 확인해보세요.</p>
      </div>

      <div className="faq-layout-wrapper">
        {/* 사이드바 (카테고리) */}
        <FaqSidebar 
          activeCategory={activeCategory} 
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setOpenFaqId(null); // 카테고리 변경 시 열린 항목 닫기
          }} 
        />
        
        {/* 메인 콘텐츠 (질문 목록) */}
        <main className="faq-main-content">
          <div className="faq-list-container">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                해당 카테고리에 등록된 질문이 없습니다.
              </div>
            ) : (
              filteredFaqs.map((item) => (
                <div 
                  key={item.id} 
                  className={`faq-item ${openFaqId === item.id ? 'open' : ''}`}
                >
                  {/* 질문 헤더 */}
                  <div 
                    className="faq-question-header" 
                    onClick={() => toggleFaq(item.id)}
                  >
                    <span className="faq-q-mark">Q.</span>
                    <span className="faq-category-badge">{item.categoryLabel}</span>
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-toggle-icon">▼</span>
                  </div>

                  {/* 답변 내용 */}
                  {openFaqId === item.id && (
                    <div className="faq-answer-body">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Faq;