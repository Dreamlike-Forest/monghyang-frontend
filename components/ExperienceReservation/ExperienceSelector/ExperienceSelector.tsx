'use client';

import React from 'react';
import type { JoyDto as Joy } from '../../../types/brewery';
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
    if (selectedExperience === experienceId) {
      onExperienceSelect(null);
    } else {
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
                <h4 className="reservation-experience-option-name">{experience.joy_name}</h4>
                <span className="reservation-experience-option-price">
                  {experience.joy_final_price.toLocaleString()}원
                </span>
              </div>
              <div className="reservation-experience-option-place">
                <span className="reservation-experience-place-icon">📍</span>
                {experience.joy_place}
              </div>
              <p className="reservation-experience-option-detail">
                {experience.joy_detail}
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