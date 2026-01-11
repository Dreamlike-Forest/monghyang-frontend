import React from 'react';
import './Faq.css';

export type FaqCategory = 'all' | 'member' | 'order' | 'delivery' | 'cancel' | 'other';

interface FaqSidebarProps {
  activeCategory: FaqCategory;
  onCategoryChange: (category: FaqCategory) => void;
}

const CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: '전체 보기' },
  { id: 'member', label: '회원/계정' },
  { id: 'order', label: '주문/결제' },
  { id: 'delivery', label: '배송' },
  { id: 'cancel', label: '취소/환불' },
  { id: 'other', label: '기타' },
];

const FaqSidebar: React.FC<FaqSidebarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <aside className="faq-sidebar">
      <ul className="faq-menu-list">
        {CATEGORIES.map((cat) => (
          <li
            key={cat.id}
            className={`faq-menu-item ${activeCategory === cat.id ? 'faq-menu-item-active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default FaqSidebar;