'use client';

import React, { useState } from 'react';
import { deleteUserAccount, verifyPassword } from '../../../utils/userApi';
import './DeleteAccount.css';

const DeleteAccount: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleDelete = async () => {
    if (!isChecked) {
      alert('탈퇴 안내사항을 확인하고 동의해주세요.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const isValid = await verifyPassword(password);
    if (!isValid) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (window.confirm('정말로 탈퇴하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      const success = await deleteUserAccount();
      if (success) {
        alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/';
        }
      } else {
        alert('탈퇴 처리에 실패했습니다.');
      }
    }
  };

  return (
    <div className="delete-account-container">
      <h2 className="profile-heading error-color">회원 탈퇴</h2>
      
      <div className="warning-box">
        <h3>⚠️ 탈퇴 시 유의사항</h3>
        <ul>
          <li>회원 탈퇴 시 회원님의 모든 정보가 즉시 삭제됩니다.</li>
          <li>작성하신 리뷰 및 게시글은 자동으로 삭제되지 않습니다.</li>
          <li>삭제된 데이터는 복구할 수 없습니다.</li>
        </ul>
      </div>

      <div className="confirmation-area">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={(e) => setIsChecked(e.target.checked)} 
          />
          위 내용을 모두 확인하였으며, 이에 동의합니다.
        </label>

        <div className="confirm-password-group">
          <label>비밀번호 확인</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="password-input"
          />
        </div>

        <button onClick={handleDelete} className="delete-btn">
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;