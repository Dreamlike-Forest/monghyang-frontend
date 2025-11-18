'use client';

import React, { useState, useEffect } from 'react';
import './ReservationCalendar.css';

interface ReservationCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string | null) => void;
  error?: string;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  error
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // 예약 가능한 시간대
  const availableTimes = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 달력 시작 요일 (일요일 기준)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 달력 끝 요일
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: Date[] = [];
    const currentCalendarDate = new Date(startDate);
    
    while (currentCalendarDate <= endDate) {
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate === formatDateString(date);
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    
    const dateString = formatDateString(date);
    onDateSelect(dateString);
    
    // 날짜가 변경되면 시간 선택 초기화
    if (selectedDate !== dateString) {
      onTimeSelect(null);
    }
  };

  const handleTimeClick = (time: string) => {
    if (selectedTime === time) {
      // 이미 선택된 시간을 다시 클릭하면 선택 해제
      onTimeSelect(null);
    } else {
      onTimeSelect(time);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="reservation-calendar">
      <div className="reservation-calendar-header">
        <button 
          className="reservation-calendar-nav-btn prev"
          onClick={goToPreviousMonth}
          type="button"
        >
          ◀
        </button>
        <h3 className="reservation-calendar-title">
          {currentDate.getFullYear()}. {currentDate.getMonth() + 1}.
        </h3>
        <button 
          className="reservation-calendar-nav-btn next"
          onClick={goToNextMonth}
          type="button"
        >
          ▶
        </button>
      </div>

      <div className="reservation-calendar-weekdays">
        {weekdays.map((day) => (
          <div key={day} className="reservation-calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="reservation-calendar-days">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            type="button"
            className={`reservation-calendar-day ${
              !isCurrentMonth(date) ? 'other-month' : ''
            } ${
              isPastDate(date) ? 'past-date' : ''
            } ${
              isToday(date) ? 'today' : ''
            } ${
              isSelected(date) ? 'selected' : ''
            }`}
            onClick={() => handleDateClick(date)}
            disabled={isPastDate(date)}
          >
            {date.getDate()}
          </button>
        ))}
      </div>

      {/* 시간 선택 */}
      {selectedDate && (
        <div className="reservation-time-selection">
          <h4 className="reservation-time-title">예약 시간 선택</h4>
          <div className="reservation-time-buttons">
            {availableTimes.map((time) => (
              <button
                key={time}
                type="button"
                className={`reservation-time-option ${
                  selectedTime === time ? 'selected' : ''
                }`}
                onClick={() => handleTimeClick(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="reservation-calendar-error">{error}</div>}
    </div>
  );
};

export default ReservationCalendar;