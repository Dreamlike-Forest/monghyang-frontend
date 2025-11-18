// types/experienceReservation.ts
export interface ExperienceReservationData {
  selectedDate: string | null;
  selectedExperience: number | null;
  customerInfo: {
    name: string;
    phoneNumber: string;
    headCount: number;
  };
}

export interface ValidationErrors {
  date?: string;
  experience?: string;
  customerInfo?: string;
}

export interface ExperienceReservationProps {
  brewery: any; // Brewery 타입 사용
  experienceId?: number; // 특정 체험이 미리 선택된 경우
  onClose: () => void;
  onReservationComplete?: (reservationData: ExperienceReservationData) => void;
}