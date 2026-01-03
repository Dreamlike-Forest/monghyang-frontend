// types/qna.ts

export interface Qna {
  id: number;           // bigint
  user_id: number;      // bigint
  qna_title: string;    // varchar(255)
  content: string;      // varchar(255)
  is_complete: boolean; // tinyint(1) - 0: 답변대기, 1: 답변완료
  is_deleted: boolean;  // tinyint(1)
  created_at: string;   // 작성일 (리스트 정렬용)
  
  // 조인된 데이터 (ERD 관계 반영)
  answer?: QnaAnswer | null; 
  images?: QnaImage[];
}

export interface QnaImage {
  id: number;
  qna_id: number;
  image_key: string;    // 이미지 경로/키
  volume: number;       // 파일 크기
}

export interface QnaAnswer {
  id: number;
  qna_id: number;
  user_id: number;      // 관리자 ID
  content: string;      // 답변 내용
  created_at: string;   // 답변 작성 시각
}

export type QnaTab = 'list' | 'write';