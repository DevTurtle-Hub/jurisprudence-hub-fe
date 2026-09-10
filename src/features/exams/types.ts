// ==========================================
// ĐỊNH NGHĨA DỮ LIỆU HỆ THỐNG PHÒNG THI THỬ & SÁT HẠCH CAND
// ==========================================

export interface MultipleChoiceOption {
  id: string
  label: string // 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface MultipleChoiceQuestion {
  id: string
  order: number
  question: string
  context?: string
  options?: MultipleChoiceOption[] // Rỗng [] hoặc không có phương án: Câu hỏi trả lời ngắn / điền khuyết (Câu 55-60)
  correctAnswer?: string // 'A' | 'B' | 'C' | 'D' hoặc chuỗi text đáp án trả lời ngắn
  explanation?: string
  legalReference?: string
}

export interface EssayQuestion {
  id: string
  order: number
  title: string
  prompt: string
  context?: string
  maxScore: number
  rubric?: string[]
}

export interface ExamRoomPartsSummary {
  mcCount: number      // Số câu trắc nghiệm & trả lời ngắn
  essayCount: number   // Số câu tự luận
}

export type ExamRoomStatus = 'OPEN' | 'UPCOMING' | 'CLOSED'

export interface ExamRoom {
  id: string
  code: string                 // Mã phòng thi, ví dụ: 'CAND-CA4-01'
  title: string                // Tên phòng thi
  description: string          // Mô tả / Quy chế phòng thi
  durationMinutes: number      // Thời lượng thi (phút)
  totalAttempts: number        // Số thí sinh đã tham gia thi
  status: ExamRoomStatus       // Trạng thái phòng thi
  startDate?: string           // Thời gian mở
  endDate?: string             // Thời gian đóng
  partsSummary: ExamRoomPartsSummary
  multipleChoiceQuestions?: MultipleChoiceQuestion[]
  essayQuestions?: EssayQuestion[]
  createdAt: string
  createdBy?: string
}

export interface CandidateVerification {
  cccd: string                 // Số CCCD (12 chữ số)
  fullName: string             // Họ và tên thí sinh
  phone: string                // Số điện thoại
  email: string                // Email
  address: string              // Địa chỉ cư trú / Đơn vị công tác
  candidateId: string          // SBD được cấp (ví dụ: SBD-CA4-8921)
  verifiedAt: string           // Thời gian xác minh
  isVerified: boolean          // Trạng thái đã xác minh
}

export interface ExamAnswersState {
  multipleChoice: Record<string, string> // questionId -> 'A' | 'B' | 'C' | 'D' HOẶC chuỗi text câu trả lời ngắn
  essay: Record<string, string>          // questionId -> essay content
  flaggedQuestions: Record<string, boolean> // questionId -> isFlagged
}

export interface ExamSubmissionReceipt {
  receiptId: string            // Mã biên bản điện tử, ví dụ: 'REC-2026-9A8B7C'
  roomId: string
  roomCode: string
  roomTitle: string
  candidate: CandidateVerification
  submittedAt: string
  timeSpentSeconds: number
  mcAnsweredCount: number
  mcTotalCount: number
  mcCorrectCount: number       // Số câu trắc nghiệm trả lời đúng
  mcScore: number              // Điểm trắc nghiệm (thang 70 điểm)
  essayAnsweredCount: number
  essayTotalCount: number
  sha256Digest: string
}

export interface SubmissionAnswerDetail {
  id: string
  questionType: 'MC' | 'ESSAY'
  questionId: string
  chosenOption?: string | null  // 'A' | 'B' | 'C' | 'D' HOẶC chuỗi text câu trả lời ngắn
  isCorrect?: boolean | null
  essayContent?: string | null
  essayScore?: number | null
}

export interface SubmissionDetailResponse {
  id: string
  receiptId: string
  roomId: string
  roomCode: string
  roomTitle: string
  candidate: CandidateVerification
  submittedAt: string
  timeSpentSeconds: number
  mcAnsweredCount: number
  mcTotalCount: number
  mcCorrectCount: number
  mcScore: number
  essayAnsweredCount: number
  essayTotalCount: number
  essayScore?: number | null
  totalScore?: number | null
  essayFeedback?: string | null
  status: string
  sha256Digest: string
  answers: SubmissionAnswerDetail[]
}

// ==========================================
// DỮ LIỆU LÀM BÀI THI AN TOÀN (GET /rooms/:id/take)
// ==========================================
export interface ExamTakingData {
  id: string
  code: string
  title: string
  description: string
  durationMinutes: number
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  essayQuestions: EssayQuestion[]
}

// ==========================================
// MODULE 2: DRAFT WORKFLOW IMPORT ĐỀ THI TỪ PDF (SPRING BOOT DRAFT WORKFLOW)
// ==========================================
export type ImportMode = 'FULL' | 'MCQ_ONLY' | 'ESSAY_ONLY'

export interface DraftOptionDto {
  key: string
  content: string
  isCorrect?: boolean
  correct?: boolean
}

export interface ParsedDocumentResponse {
  extractedTitle: string
  suggestedDurationMinutes: number
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  essayQuestions: EssayQuestion[]
}

export interface DraftQuestion {
  temporaryId: string
  questionNumber: number
  type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'
  section: string
  context?: string
  content: string
  options: DraftOptionDto[]
  answer?: string | null
  correctOptionKey?: string
  hasAnswer: boolean
  maxScore?: number
  rubrics?: string[]
  rubric?: string[]
  parsingStatus: 'SUCCESS' | 'WARNING' | 'ERROR'
  warnings: string[]
  errors: string[]
}

export interface ExamImportDraft {
  draftId: string
  fileName: string
  title: string
  totalQuestions: number
  essayCount: number
  mcCount: number
  shortAnswerCount: number
  completedQuestions: number
  incompleteQuestions: number
  successCount: number
  warningCount: number
  errorCount: number
  questions: DraftQuestion[]
  warnings?: string[]
  errors?: string[]
}

export interface DraftValidationDetail {
  temporaryId: string
  questionNumber: number
  errors: string[]
  warnings: string[]
}

export interface DraftValidationResult {
  draftId: string
  valid: boolean
  totalQuestions?: number
  completedQuestions?: number
  incompleteQuestions?: number
  errors: string[]
  warnings: string[]
  questionDetails?: DraftValidationDetail[]
}

export interface ConfirmImportResult {
  examId: number | string
  examCode: string
  title: string
  totalQuestionsImported: number
  essayCount: number
  mcCount: number
  shortAnswerCount: number
  status: string
  confirmedAt: string
}

