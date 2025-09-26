'use client';

import React, { useEffect } from 'react';
import './AddressSearch.css';

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressSearchProps {
  onAddressSelect: (address: string, zonecode: string) => void;
  className?: string;
  disabled?: boolean;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ 
  onAddressSelect, 
  className = '',
  disabled = false 
}) => {
  useEffect(() => {
    // Daum 우편번호 서비스 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector('script[src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleAddressSearch = () => {
    if (disabled) return;
    
    if (!window.daum) {
      alert('주소 검색 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 선택된 주소 정보를 부모 컴포넌트로 전달
        let fullAddress = '';
        let extraAddress = '';

        if (data.userSelectedType === 'R') {
          // 도로명 주소를 선택한 경우
          fullAddress = data.roadAddress;
        } else {
          // 지번 주소를 선택한 경우
          fullAddress = data.jibunAddress;
        }

        // 참고항목 추가 (동/로/가 정보)
        if (data.userSelectedType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
        }

        // 부모 컴포넌트에 주소와 우편번호 전달
        onAddressSelect(fullAddress, data.zonecode);
      },
      onresize: function(size: any) {
        // 우편번호 검색 창의 크기가 조정될 때
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  return (
    <button
      type="button"
      onClick={handleAddressSearch}
      disabled={disabled}
      className={`address-search-btn ${className} ${disabled ? 'disabled' : ''}`}
      title="주소 검색"
    >
      📍 주소검색
    </button>
  );
};

export default AddressSearch;