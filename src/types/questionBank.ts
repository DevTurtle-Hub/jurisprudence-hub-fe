// =========================================================================
// QUESTION BANK TYPES (NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM & TỰ LUẬN CAND)
// =========================================================================

export interface QuestionBankMcOptionRequest {
  id?: string;
  label: string;      // "A" | "B" | "C" | "D" ...
  optionText: string;
  isCorrect?: boolean;
  correct?: boolean;
}

export interface QuestionBankMcOptionResponse {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  correct?: boolean;
}

export type QuestionBankType = 'MC' | 'ESSAY';

export interface QuestionBankRequest {
  title: string;
  description?: string;
  category?: string;
  questionType: QuestionBankType | string;
  questionText: string;
  correctAnswer?: string;
  explanation?: string;
  legalReference?: string;
  sampleEssay?: string;        // Bài viết mẫu cho câu hỏi tự luận
  tags?: string;
  isDraft?: boolean;
  draft?: boolean;
  options?: QuestionBankMcOptionRequest[];
}

export interface QuestionBankResponse {
  id: string;
  title: string;
  description?: string;
  category?: string;
  questionType: QuestionBankType | string;
  questionText: string;
  correctAnswer?: string;
  explanation?: string;
  legalReference?: string;
  sampleEssay?: string;        // Bài viết mẫu cho câu hỏi tự luận
  tags?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  options?: QuestionBankMcOptionResponse[];
}

export interface QuestionBankFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  questionType?: string;
  keyword?: string;
  isDraft?: boolean;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 0-indexed in Spring Data
  first: boolean;
  last: boolean;
  empty: boolean;
}
