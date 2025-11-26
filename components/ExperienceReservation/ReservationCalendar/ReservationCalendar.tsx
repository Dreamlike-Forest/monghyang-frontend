'use client';

import React, { useState, useEffect } from 'react';
import { getUnavailableDates } from '../../../utils/reservationApi';
import './ReservationCalendar.css';

interface ReservationCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string | null) => void;
  availableTimeSlots?: string[]; 
  timeSlotCounts?: Record<string, number>; 
  error?: string;
  joyId?: number; 
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableTimeSlots = [], 
  timeSlotCounts = {}, 
  error,
  joyId
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!joyId) return;
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dates = await getUnavailableDates(joyId, year, month);
        setUnavailableDates(dates);
      } catch (e) {
        console.error('예약 불가 날짜 로드 실패:', e);
      }
    };
    fetchUnavailableDates();
  }, [currentDate, joyId]);

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

  const isUnavailable = (date: Date): boolean => {
    const dateStr = formatDateString(date);
    return unavailableDates.includes(dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date) || isUnavailable(date)) return;
    onDateSelect(formatDateString(date));
  };

  return (
    <div className="reservation-calendar">
      <div className="reservation-calendar-header">
        <button 
          className="reservation-calendar-nav-btn prev" 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} 
          type="button"
          disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
        >◀</button>
        <h3 className="reservation-calendar-title">{currentDate.getFullYear()}. {currentDate.getMonth() + 1}.</h3>
        <button 
          className="reservation-calendar-nav-btn next" 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} 
          type="button"
        >▶</button>
      </div>

      <div className="reservation-calendar-weekdays">
        {weekdays.map((day) => <div key={day} className="reservation-calendar-weekday">{day}</div>)}
      </div>

      <div className="reservation-calendar-days">
        {calendarDays.map((date, index) => {
          const disabled = isPastDate(date) || isUnavailable(date);
          return (
            <button
              key={index}
              type="button"
              className={`reservation-calendar-day 
                ${!isCurrentMonth(date) ? 'other-month' : ''} 
                ${isPastDate(date) ? 'past-date' : ''} 
                ${isToday(date) ? 'today' : ''} 
                ${isSelected(date) ? 'selected' : ''}
                ${isUnavailable(date) ? 'disabled' : ''}
              `}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="reservation-time-selection">
          <h4 className="reservation-time-title">
            {availableTimeSlots.length > 0 ? '예약 시간 선택' : '예약 가능한 시간이 없습니다'}
          </h4>
          
          {availableTimeSlots.length > 0 ? (
            <div className="reservation-time-buttons">
              {availableTimeSlots.map((time) => {
                const remaining = timeSlotCounts[time];
                // [핵심] 잔여석이 0인 경우에만 마감 처리 (undefined는 정보가 없는 것이므로 예약 가능)
                const isSoldOut = remaining !== undefined && remaining === 0;
                
                return (
                  <button 
                    key={time} 
                    type="button" 
                    className={`reservation-time-option ${selectedTime === time ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`} 
                    onClick={() => !isSoldOut && onTimeSelect(time)}
                    disabled={isSoldOut}
                  >
                    {time}
                    {/* [수정] undefined가 아닐 때만 (잔여 00석) 표시 */}
                    {isSoldOut ? (
                      <span className="slot-count" style={{color: 'red'}}> (마감)</span>
                    ) : (
                      remaining !== undefined && (
                        <span className="slot-count"> ({remaining}석)</span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="no-time-slots">
              해당 날짜에는 예약 가능한 시간대가 없습니다.
            </div>
          )}
        </div>
      )}
      {error && <div className="reservation-calendar-error">{error}</div>}
    </div>
  );
};

export default ReservationCalendar;