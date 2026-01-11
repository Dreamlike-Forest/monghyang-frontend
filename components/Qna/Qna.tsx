'use client';

import React, { useState } from 'react';
import QnaSidebar from './QnaSidebar';
import { Qna as QnaType, QnaTab } from '../../types/qna';
import './Qna.css';

// 테스트용 더미 데이터
const MOCK_QNA: QnaType[] = [
  {
    id: 1,
    user_id: 101,
    qna_title: '결제 취소는 언제 처리되나요?',
    content: '어제 취소 요청했는데 아직 카드 승인 취소가 안 왔습니다.',
    is_complete: true,
    is_deleted: false,
    created_at: '2024-12-15',
    answer: {
      id: 1,
      qna_id: 1,
      user_id: 999,
      content: '안녕하세요 고객님. 카드사 사정에 따라 영업일 기준 3~5일 소요될 수 있습니다.',
      created_at: '2024-12-16'
    }
  },
  {
    id: 2,
    user_id: 101,
    qna_title: '단체 예약 관련 문의',
    content: '20명 단체 방문 시 할인 혜택이 있나요?',
    is_complete: false, // 답변 대기
    is_deleted: false,
    created_at: '2024-12-20',
  }
];

const Qna: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QnaTab>('list');
  const [selectedQna, setSelectedQna] = useState<number | null>(null);

  // 아코디언 토글
  const toggleQna = (id: number) => {
    if (selectedQna === id) {
      setSelectedQna(null);
    } else {
      setSelectedQna(id);
    }
  };

  // 1. 목록 탭 (List Tab)
  const renderList = () => (
    <div className="qna-list-container">
      {MOCK_QNA.length === 0 ? (
        <div className="qna-empty-state">
          등록된 문의 내역이 없습니다.
        </div>
      ) : (
        MOCK_QNA.map((item) => (
          <div key={item.id} className="qna-list-item">
            {/* 질문 헤더 (클릭 시 토글) */}
            <div 
              className="qna-item-header" 
              onClick={() => toggleQna(item.id)}
            >
              <div className="qna-header-left">
                <span className="qna-item-title">{item.qna_title}</span>
                <span className="qna-item-meta">{item.created_at} 작성</span>
              </div>
              <div className="qna-header-right">
                <span className={`qna-status-badge ${item.is_complete ? 'qna-status-complete' : 'qna-status-pending'}`}>
                  {item.is_complete ? '답변완료' : '답변대기'}
                </span>
              </div>
            </div>

            {/* 상세 내용 (아코디언 바디) */}
            {selectedQna === item.id && (
              <div className="qna-item-body">
                {/* 질문 내용 */}
                <div className="qna-question-section">
                  <span className="qna-section-label">Q. 질문 내용</span>
                  <div className="qna-question-text">{item.content}</div>
                </div>

                {/* 답변 내용 */}
                {item.answer ? (
                  <div className="qna-answer-section">
                    <span className="qna-section-label">A. 몽향의 답변</span>
                    <div className="qna-question-text">{item.answer.content}</div>
                    <div className="qna-answer-meta">
                      {item.answer.created_at} 답변됨
                    </div>
                  </div>
                ) : (
                  <div className="qna-answer-section" style={{ color: '#9ca3af' }}>
                    아직 답변이 등록되지 않았습니다. 조금만 기다려주세요.
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // 2. 작성 탭 (Write Tab)
  const renderWrite = () => (
    <div className="qna-write-container">
      <form className="qna-write-form" onSubmit={(e) => {
        e.preventDefault();
        alert('문의가 등록되었습니다.');
        setActiveTab('list');
      }}>
        <div className="qna-form-group">
          <label className="qna-form-label">문의 제목</label>
          <input 
            type="text" 
            className="qna-form-input" 
            placeholder="제목을 입력해주세요." 
            required 
          />
        </div>

        <div className="qna-form-group">
          <label className="qna-form-label">문의 내용</label>
          <textarea 
            className="qna-form-textarea" 
            placeholder="궁금하신 내용을 상세히 적어주세요." 
            required
          />
        </div>

        <div className="qna-form-group">
          <label className="qna-form-label">이미지 첨부 (선택)</label>
          <input type="file" className="qna-form-input" accept="image/*" multiple />
          <p className="qna-form-helper">
            JPG, PNG 파일만 업로드 가능합니다.
          </p>
        </div>
        
        <div className="qna-submit-wrapper">
          <button type="submit" className="qna-submit-btn">
            문의 등록하기
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="qna-container">
      <div className="qna-page-header">
        <h1 className="qna-page-title">고객센터</h1>
        <p className="qna-page-subtitle">몽향 서비스 이용 중 궁금한 점을 문의해주세요.</p>
      </div>

      <div className="qna-layout-wrapper">
        <QnaSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <main className="qna-main-content">
          {activeTab === 'list' ? renderList() : renderWrite()}
        </main>
      </div>
    </div>
  );
};

export default Qna;