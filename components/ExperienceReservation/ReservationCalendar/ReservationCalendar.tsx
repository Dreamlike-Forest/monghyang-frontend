'use client';

import React, { useState, useEffect } from 'react';
import './ReservationCalendar.css';

interface ReservationCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string | null) => void;
  // [필수 추가] 부모 컴포넌트에서 전달하는 예약 가능 시간대 목록
  availableTimeSlots?: string[]; 
  error?: string;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableTimeSlots = [], // 기본값 설정
  error
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const isCurrentMonthView = (): boolean => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    onDateSelect(formatDateString(date));
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect(selectedTime === time ? null : time);
  };

  return (
    <div className="reservation-calendar">
      <div className="reservation-calendar-header">
        <button className="reservation-calendar-nav-btn prev" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} type="button" disabled={isCurrentMonthView()}>◀</button>
        <h3 className="reservation-calendar-title">{currentDate.getFullYear()}. {currentDate.getMonth() + 1}.</h3>
        <button className="reservation-calendar-nav-btn next" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} type="button">▶</button>
      </div>

      <div className="reservation-calendar-weekdays">
        {weekdays.map((day) => <div key={day} className="reservation-calendar-weekday">{day}</div>)}
      </div>

      <div className="reservation-calendar-days">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            type="button"
            className={`reservation-calendar-day ${!isCurrentMonth(date) ? 'other-month' : ''} ${isPastDate(date) ? 'past-date' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
            onClick={() => handleDateClick(date)}
            disabled={isPastDate(date)}
          >
            {date.getDate()}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="reservation-time-selection">
          <h4 className="reservation-time-title">
            {availableTimeSlots.length > 0 ? '예약 시간 선택' : '예약 가능한 시간이 없습니다'}
          </h4>
          {availableTimeSlots.length > 0 ? (
            <div className="reservation-time-buttons">
              {availableTimeSlots.map((time) => (
                <button key={time} type="button" className={`reservation-time-option ${selectedTime === time ? 'selected' : ''}`} onClick={() => handleTimeClick(time)}>{time}</button>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '20px', color: '#888', fontSize: '14px'}}>해당 날짜에는 예약 가능한 시간대가 없습니다.</div>
          )}
        </div>
      )}
      {error && <div className="reservation-calendar-error">{error}</div>}
    </div>
  );
};

export default ReservationCalendar;