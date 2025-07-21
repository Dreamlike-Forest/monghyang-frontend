'use client';

import React from 'react';
import { Joy } from '../../../types/mockData';
import './ExperienceSelector.css';

interface ExperienceSelectorProps {
  experiences: Joy[];
  selectedExperience: number | null;
  onExperienceSelect: (experienceId: number | null) => void;
  error?: string;
}

const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({
  experiences,
  selectedExperience,
  onExperienceSelect,
  error
}) => {
  const handleExperienceClick = (experienceId: number) => {
    // 이미 선택된 체험을 다시 클릭하면 선택 해제
    if (selectedExperience === experienceId) {
      onExperienceSelect(null);
    } else {
      // 다른 체험 선택 시 기존 선택 해제하고 새로 선택
      onExperienceSelect(experienceId);
    }
  };

  if (!experiences || experiences.length === 0) {
    return (
      <div className="reservation-experience-selector">
        <div className="reservation-experience-empty">
          <p>현재 운영 중인 체험 프로그램이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-experience-selector">
      <div className="reservation-experience-buttons">
        {experiences.map((experience) => (
          <button
            key={experience.joy_id}
            type="button"
            className={`reservation-experience-option ${
              selectedExperience === experience.joy_id ? 'selected' : ''
            }`}
            onClick={() => handleExperienceClick(experience.joy_id)}
          >
            <div className="reservation-experience-option-content">
              <div className="reservation-experience-option-header">
                <h4 className="reservation-experience-option-name">{experience.name}</h4>
                <span className="reservation-experience-option-price">
                  {experience.price.toLocaleString()}원
                </span>
              </div>
              <div className="reservation-experience-option-place">
                <span className="reservation-experience-place-icon">📍</span>
                {experience.place}
              </div>
              <p className="reservation-experience-option-detail">
                {experience.detail}
              </p>
            </div>
          </button>
        ))}
      </div>

      {error && <div className="reservation-experience-error">{error}</div>}
    </div>
  );
};

export default ExperienceSelector;