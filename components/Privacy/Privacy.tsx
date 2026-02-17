'use client';

import React, { useState } from 'react';
import PrivacySidebar, { PrivacySection } from './PrivacySidebar';
import './Privacy.css';

const Privacy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PrivacySection>('general');

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <>
            <h2 className="privacy-section-title">1. 총칙</h2>
            <div className="privacy-text-block">
              <p>
                주식회사 몽향(이하 '회사')은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
              </p>
              <br />
              <p>
                회사는 개인정보처리방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다.
              </p>
            </div>
          </>
        );
      case 'collection':
        return (
          <>
            <h2 className="privacy-section-title">2. 개인정보 수집 항목 및 방법</h2>
            <div className="privacy-text-block">
              <strong className="privacy-sub-title">가. 수집하는 개인정보 항목</strong>
              <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
              <ul className="privacy-list">
                <li>필수항목: 이메일, 비밀번호, 이름, 휴대전화번호</li>
                <li>선택항목: 생년월일, 성별, 주소</li>
                <li>서비스 이용 과정에서 수집: 접속 IP 정보, 쿠키, 서비스 이용 기록, 기기정보</li>
              </ul>

              <strong className="privacy-sub-title">나. 개인정보 수집 방법</strong>
              <p>
                - 홈페이지(회원가입, 게시판, 예약 등)<br/>
                - 생성정보 수집 툴을 통한 수집
              </p>
            </div>
          </>
        );
      case 'purpose':
        return (
          <>
            <h2 className="privacy-section-title">3. 개인정보의 처리 목적</h2>
            <div className="privacy-text-block">
              <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <ul className="privacy-list">
                <li><strong>서비스 제공에 관한 계약 이행 및 요금정산:</strong> 콘텐츠 제공, 구매 및 요금 결제, 물품배송 또는 청구지 등 발송</li>
                <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 연령확인</li>
                <li><strong>마케팅 및 광고에 활용:</strong> 신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달 (동의 시)</li>
              </ul>
            </div>
          </>
        );
      case 'retention':
        return (
          <>
            <h2 className="privacy-section-title">4. 개인정보의 보유 및 이용기간</h2>
            <div className="privacy-text-block">
              <p>
                원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
              </p>
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>보존 근거</th>
                    <th>보존 기록</th>
                    <th>보존 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                    <td>계약 또는 청약철회 등에 관한 기록</td>
                    <td>5년</td>
                  </tr>
                  <tr>
                    <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                    <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                    <td>5년</td>
                  </tr>
                  <tr>
                    <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                    <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                    <td>3년</td>
                  </tr>
                  <tr>
                    <td>통신비밀보호법</td>
                    <td>로그인 기록</td>
                    <td>3개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );
      case 'destruction':
        return (
          <>
            <h2 className="privacy-section-title">5. 개인정보의 파기절차 및 방법</h2>
            <div className="privacy-text-block">
              <strong className="privacy-sub-title">가. 파기절차</strong>
              <p>
                이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.
              </p>

              <strong className="privacy-sub-title">나. 파기방법</strong>
              <ul className="privacy-list">
                <li>전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
                <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
              </ul>
            </div>
          </>
        );
      case 'rights':
        return (
          <>
            <h2 className="privacy-section-title">6. 이용자 및 법정대리인의 권리와 행사방법</h2>
            <div className="privacy-text-block">
              <p>
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수 있습니다.<br/>
                이용자의 개인정보 조회/수정을 위해서는 '개인정보변경'(또는 '회원정보수정')을, 가입해지(동의철회)를 위해서는 '회원탈퇴'를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.
              </p>
            </div>
          </>
        );
      case 'safety':
        return (
          <>
            <h2 className="privacy-section-title">7. 개인정보의 안전성 확보조치</h2>
            <div className="privacy-text-block">
              <p>회사는 이용자의 개인정보를 취급함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적/관리적 대책을 강구하고 있습니다.</p>
              <ul className="privacy-list">
                <li><strong>비밀번호 암호화:</strong> 회원 아이디(ID)의 비밀번호는 암호화되어 저장 및 관리되고 있어 본인만이 알고 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다.</li>
                <li><strong>해킹 등에 대비한 대책:</strong> 회사는 해킹이나 컴퓨터 바이러스 등에 의해 회원의 개인정보가 유출되거나 훼손되는 것을 막기 위해 최선을 다하고 있습니다.</li>
              </ul>
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <h2 className="privacy-section-title">8. 개인정보 보호책임자 및 담당부서</h2>
            <div className="privacy-text-block">
              <p>회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginTop: '16px' }}>
                <p><strong>[개인정보 보호책임자]</strong></p>
                <p>성명: 홍길동</p>
                <p>소속: 정보보호팀</p>
                <p>전화번호: 02-1234-5678</p>
                <p>이메일: privacy@monghyang.com</p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="privacy-container">
      <div className="privacy-page-header">
        <h1 className="privacy-page-title">개인정보처리방침</h1>
        <p className="privacy-page-subtitle">
          몽향은 회원의 개인정보를 소중히 다루며, 안전하게 보호하고 있습니다.
        </p>
      </div>

      <div className="privacy-layout-wrapper">
        <PrivacySidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="privacy-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Privacy;