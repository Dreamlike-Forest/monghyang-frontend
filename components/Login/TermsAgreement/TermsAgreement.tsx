'use client';

import React, { useState } from 'react';
import './TermsAgreement.css';

interface TermsAgreementProps {
  isAgreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
  userType: 'brewery' | 'seller' | 'user'; 
  error?: string;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({
  isAgreed,
  onAgreementChange,
  userType,
  error
}) => {
  const [showModal, setShowModal] = useState(false);

  const getTermsContent = () => {
    if (userType === 'brewery') {
      return {
        title: '양조장 회원 약관',
        content: `
제 1조 (목적)
이 약관은 양조장 회원이 본 플랫폼을 이용함에 있어 필요한 사항을 규정함을 목적으로 합니다.

제 2조 (정의)
1. "플랫폼"이라 함은 회사가 운영하는 전통주 유통 플랫폼을 의미합니다.
2. "양조장"이라 함은 본 약관에 동의하고 회원가입을 완료한 전통주 제조업체를 의미합니다.
3. "서비스"라 함은 플랫폼을 통해 제공되는 모든 서비스를 의미합니다.

제 3조 (회원가입)
1. 양조장은 본 약관에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입하여 가입을 신청합니다.
2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 아니할 수 있습니다.
   - 실명이 아니거나 타인의 명의를 이용한 경우
   - 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
   - 기타 회원으로 등록하는 것이 플랫폼의 기술상 현저히 지장이 있다고 판단되는 경우

제 4조 (서비스 이용)
1. 양조장은 본 플랫폼을 통해 다음의 서비스를 이용할 수 있습니다.
   - 전통주 상품 등록 및 판매
   - 양조장 정보 게시
   - 체험 프로그램 운영
   - 고객과의 소통 및 마케팅

제 5조 (상품 등록 및 관리)
1. 양조장은 판매하고자 하는 전통주에 대한 정확한 정보를 제공해야 합니다.
2. 상품 정보에는 다음이 포함되어야 합니다.
   - 상품명, 용량, 알코올 도수
   - 원료 및 제조 방법
   - 가격 정보
   - 상품 이미지

제 6조 (수수료 및 정산)
1. 회사는 플랫폼을 통한 판매에 대해 일정 비율의 수수료를 징수할 수 있습니다.
2. 정산은 매월 말일 기준으로 익월 15일에 진행됩니다.

제 7조 (개인정보 보호)
1. 회사는 관련 법령에 따라 양조장의 개인정보를 보호합니다.
2. 개인정보의 수집, 이용, 제공에 관한 사항은 별도의 개인정보처리방침에 따릅니다.

제 8조 (금지행위)
양조장은 다음 행위를 하여서는 안 됩니다.
1. 허위 정보 제공
2. 타인의 권리 침해
3. 불법적인 상품 판매
4. 플랫폼의 운영을 방해하는 행위

제 9조 (서비스 중단)
1. 회사는 다음의 경우 서비스 제공을 중단할 수 있습니다.
   - 양조장이 본 약관을 위반한 경우
   - 기술적 문제가 발생한 경우
   - 기타 서비스 제공이 어려운 경우

제 10조 (약관의 변경)
1. 회사는 필요에 따라 본 약관을 변경할 수 있습니다.
2. 변경된 약관은 플랫폼에 공지함으로써 효력이 발생합니다.

제 11조 (기타)
본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
        `
      };
    } else if (userType === 'seller') {
      return {
        title: '판매자 회원 약관',
        content: `
제 1조 (목적)
이 약관은 판매자 회원이 본 플랫폼을 이용함에 있어 필요한 사항을 규정함을 목적으로 합니다.

제 2조 (정의)
1. "플랫폼"이라 함은 회사가 운영하는 전통주 유통 플랫폼을 의미합니다.
2. "판매자"라 함은 본 약관에 동의하고 회원가입을 완료한 전통주 유통업체를 의미합니다.
3. "서비스"라 함은 플랫폼을 통해 제공되는 모든 서비스를 의미합니다.

제 3조 (회원가입)
1. 판매자는 본 약관에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입하여 가입을 신청합니다.
2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 아니할 수 있습니다.
   - 실명이 아니거나 타인의 명의를 이용한 경우
   - 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
   - 기타 회원으로 등록하는 것이 플랫폼의 기술상 현저히 지장이 있다고 판단되는 경우

제 4조 (서비스 이용)
1. 판매자는 본 플랫폼을 통해 다음의 서비스를 이용할 수 있습니다.
   - 전통주 상품 구매 및 재판매
   - 재고 관리
   - 주문 관리
   - 고객 응대 서비스

제 5조 (상품 주문 및 배송)
1. 판매자는 양조장으로부터 상품을 주문하여 재판매할 수 있습니다.
2. 배송에 관한 책임은 판매자에게 있습니다.
3. 배송 지연이나 상품 파손에 대한 책임은 판매자가 부담합니다.

제 6조 (가격 정책)
1. 판매자는 양조장이 제시한 권장소비자가격을 준수해야 합니다.
2. 무분별한 할인이나 덤핑 판매를 금지합니다.

제 7조 (수수료 및 정산)
1. 회사는 플랫폼을 통한 중개에 대해 일정 비율의 수수료를 징수할 수 있습니다.
2. 정산은 매월 말일 기준으로 익월 15일에 진행됩니다.

제 8조 (개인정보 보호)
1. 회사는 관련 법령에 따라 판매자의 개인정보를 보호합니다.
2. 개인정보의 수집, 이용, 제공에 관한 사항은 별도의 개인정보처리방침에 따릅니다.

제 9조 (금지행위)
판매자는 다음 행위를 하여서는 안 됩니다.
1. 허위 정보 제공
2. 무허가 상품 판매
3. 타 플랫폼에서의 동일 상품 저가 판매
4. 플랫폼의 운영을 방해하는 행위

제 10조 (서비스 중단)
1. 회사는 다음의 경우 서비스 제공을 중단할 수 있습니다.
   - 판매자가 본 약관을 위반한 경우
   - 기술적 문제가 발생한 경우
   - 기타 서비스 제공이 어려운 경우

제 11조 (약관의 변경)
1. 회사는 필요에 따라 본 약관을 변경할 수 있습니다.
2. 변경된 약관은 플랫폼에 공지함으로써 효력이 발생합니다.

제 12조 (기타)
본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
        `
      };
    } else { // userType === 'user'
      return {
        title: '일반 사용자 회원 약관',
        content: `
제 1조 (목적)
이 약관은 일반 사용자가 본 플랫폼을 이용함에 있어 필요한 사항을 규정함을 목적으로 합니다.

제 2조 (정의)
1. "플랫폼"이라 함은 회사가 운영하는 전통주 유통 플랫폼을 의미합니다.
2. "사용자"라 함은 본 약관에 동의하고 회원가입을 완료한 개인을 의미합니다.
3. "서비스"라 함은 플랫폼을 통해 제공되는 모든 서비스를 의미합니다.

제 3조 (회원가입)
1. 사용자는 본 약관에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입하여 가입을 신청합니다.
2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 아니할 수 있습니다.
   - 실명이 아니거나 타인의 명의를 이용한 경우
   - 만 19세 미만인 경우
   - 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
   - 기타 회원으로 등록하는 것이 플랫폼의 기술상 현저히 지장이 있다고 판단되는 경우

제 4조 (서비스 이용)
1. 사용자는 본 플랫폼을 통해 다음의 서비스를 이용할 수 있습니다.
   - 전통주 상품 구매
   - 양조장 체험 프로그램 예약
   - 커뮤니티 참여
   - 상품 리뷰 및 평점 작성
   - 양조장 정보 조회

제 5조 (상품 구매 및 결제)
1. 사용자는 플랫폼에서 판매되는 전통주를 구매할 수 있습니다.
2. 결제는 회사가 제공하는 결제 수단을 통해서만 가능합니다.
3. 미성년자의 주류 구매는 법적으로 금지되어 있습니다.

제 6조 (배송 및 반품)
1. 상품의 배송은 판매자 또는 양조장이 담당합니다.
2. 상품에 하자가 있는 경우 교환 및 환불이 가능합니다.
3. 단순 변심에 의한 반품의 경우 배송비는 사용자가 부담합니다.

제 7조 (개인정보 보호)
1. 회사는 관련 법령에 따라 사용자의 개인정보를 보호합니다.
2. 개인정보의 수집, 이용, 제공에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
3. 사용자는 언제든지 개인정보 처리 중단을 요구할 수 있습니다.

제 8조 (금지행위)
사용자는 다음 행위를 하여서는 안 됩니다.
1. 허위 정보 제공
2. 타인의 권리 침해
3. 부정한 방법으로의 서비스 이용
4. 플랫폼의 운영을 방해하는 행위
5. 미성년자에게 주류 판매 또는 양도

제 9조 (리뷰 및 커뮤니티 이용)
1. 사용자는 구매한 상품에 대해 정직한 리뷰를 작성할 수 있습니다.
2. 허위 리뷰나 악의적인 평점 조작은 금지됩니다.
3. 커뮤니티 이용 시 다른 사용자를 존중해야 합니다.

제 10조 (서비스 중단)
1. 회사는 다음의 경우 서비스 제공을 중단할 수 있습니다.
   - 사용자가 본 약관을 위반한 경우
   - 기술적 문제가 발생한 경우
   - 기타 서비스 제공이 어려운 경우

제 11조 (약관의 변경)
1. 회사는 필요에 따라 본 약관을 변경할 수 있습니다.
2. 변경된 약관은 플랫폼에 공지함으로써 효력이 발생합니다.

제 12조 (기타)
본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
        `
      };
    }
  };

  const handleAgreeClick = () => {
    setShowModal(false);
    onAgreementChange(true);
  };

  const handleDisagreeClick = () => {
    setShowModal(false);
    onAgreementChange(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAgreementChange(e.target.checked);
  };

  const terms = getTermsContent();

  return (
    <div className="terms-agreement">
      <div className="terms-agreement-content">
        <button
          type="button"
          className="terms-view-btn"
          onClick={() => setShowModal(true)}
        >
          내용확인
        </button>
        
        <div className="terms-checkbox-container">
          <label className="terms-checkbox-label">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={handleCheckboxChange}
              className="terms-checkbox"
            />
            <span className="terms-checkbox-text">
              약관 동의 하시겠습니까?
            </span>
          </label>
        </div>
      </div>

      {error && <div className="terms-error-message">{error}</div>}

      {/* 약관 모달 */}
      {showModal && (
        <div className="terms-modal-overlay" onClick={handleModalClose}>
          <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2 className="terms-modal-title">{terms.title}</h2>
              <button
                className="terms-modal-close-btn"
                onClick={handleModalClose}
                type="button"
              >
                ✕
              </button>
            </div>
            
            <div className="terms-modal-body">
              <div className="terms-content">
                {terms.content.split('\n').map((line, index) => (
                  <p key={index} className="terms-content-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="terms-modal-actions">
              <button
                className="terms-disagree-btn"
                onClick={handleDisagreeClick}
                type="button"
              >
                동의하지 않겠습니다
              </button>
              <button
                className="terms-agree-btn"
                onClick={handleAgreeClick}
                type="button"
              >
                동의하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsAgreement;