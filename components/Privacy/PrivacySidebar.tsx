import React from 'react';
import './Privacy.css';

export type PrivacySection = 
  | 'general' 
  | 'collection' 
  | 'purpose' 
  | 'retention' 
  | 'destruction' 
  | 'rights' 
  | 'safety' 
  | 'contact';

interface PrivacySidebarProps {
  activeSection: PrivacySection;
  onSectionChange: (section: PrivacySection) => void;
}

const SECTIONS: { id: PrivacySection; label: string }[] = [
  { id: 'general', label: '1. 총칙' },
  { id: 'collection', label: '2. 개인정보 수집 항목' },
  { id: 'purpose', label: '3. 처리 목적' },
  { id: 'retention', label: '4. 보유 및 이용기간' },
  { id: 'destruction', label: '5. 파기절차 및 방법' },
  { id: 'rights', label: '6. 이용자의 권리' },
  { id: 'safety', label: '7. 안전성 확보조치' },
  { id: 'contact', label: '8. 개인정보 보호책임자' },
];

const PrivacySidebar: React.FC<PrivacySidebarProps> = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="privacy-sidebar">
      <ul className="privacy-menu-list">
        {SECTIONS.map((item) => (
          <li
            key={item.id}
            className={`privacy-menu-item ${activeSection === item.id ? 'privacy-menu-item-active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default PrivacySidebar;