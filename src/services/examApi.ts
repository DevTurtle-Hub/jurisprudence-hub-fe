import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  DraftQuestion,
  ExamImportDraft,
  DraftValidationResult,
  ConfirmImportResult,
  ImportMode
} from '../features/exams/types';

// ==========================================
// 1. MODULE THI SÁT HẠCH CAND (/api/v1/exams)
// ==========================================
export const examApi = {
  // 1. Lấy danh sách phòng thi
  getRooms: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const res = await apiClient.get<any>('/api/v1/exams/rooms', { params });
    const payload = res.data?.data !== undefined ? res.data.data : res.data;
    return payload;
  },

  // 2. Chi tiết 1 phòng thi
  getRoomDetail: async (roomId: string) => {
    const res = await apiClient.get<any>(`/api/v1/exams/rooms/${roomId}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 3. Thí sinh xác minh CCCD để nhận SBD và sessionToken
  verifyCandidate: async (roomId: string, data: {
    cccd: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
  }) => {
    const res = await apiClient.post<any>(`/api/v1/exams/rooms/${roomId}/verify-candidate`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 3.1. Kiểm tra session token của thí sinh có còn hợp lệ đối với phòng thi hay không (GET /api/v1/exams/rooms/{roomId}/check-session)
  checkSession: async (roomId: string, sessionToken: string) => {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await apiClient.get<any>(`/api/v1/exams/rooms/${roomId}/check-session`, {
      headers,
      params: sessionToken ? { sessionToken } : undefined
    });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 4. Tải đề thi làm bài (BẢO MẬT TUYỆT ĐỐI - Đã lọc sạch đáp án & giải thích)
  getExamForTaking: async (roomId: string, sessionToken?: string) => {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await apiClient.get<any>(`/api/v1/exams/rooms/${roomId}/take`, {
      headers,
      params: sessionToken ? { sessionToken } : undefined
    });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 5. Nộp bài thi & Hệ thống tự chấm Trắc nghiệm, ký số HMAC-SHA256
  submitExam: async (roomId: string, data: {
    timeSpentSeconds: number;
    answers: {
      multipleChoice: Record<string, string>;
      essay: Record<string, string>;
    };
  }, sessionToken?: string) => {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await apiClient.post<any>(`/api/v1/exams/rooms/${roomId}/submit`, data, {
      headers,
      params: sessionToken ? { sessionToken } : undefined
    });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 6. Tra cứu biên bản nộp bài
  getReceipt: async (receiptId: string) => {
    const res = await apiClient.get<any>(`/api/v1/exams/submissions/${receiptId}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 7. Tạo phòng thi thủ công
  createRoom: async (data: any) => {
    const res = await apiClient.post<any>('/api/v1/exams/rooms', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 8. Cập nhật / Chỉnh sửa phòng thi
  updateRoom: async (roomId: string, data: any) => {
    const res = await apiClient.put<any>(`/api/v1/exams/rooms/${roomId}`, data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 9. Xóa phòng thi
  deleteRoom: async (roomId: string) => {
    const res = await apiClient.delete<any>(`/api/v1/exams/rooms/${roomId}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // 10. Giám khảo chấm tự luận
  gradeEssay: async (submissionId: string, data: {
    essayScores: Array<{ questionId: string; score: number; comment?: string }>;
  }) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/api/v1/exams/submissions/${submissionId}/grade-essay`, data);
    return res.data.data;
  },

  // 11. Bóc tách tệp đề thi (PDF, DOCX, XLSX, TXT)
  parseDocument: async (file: File, targetType: 'FULL' | 'MC_ONLY' | 'ESSAY_ONLY' = 'FULL') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', targetType);
    const res = await apiClient.post<any>('/api/v1/exams/parse-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data !== undefined ? res.data.data : res.data;
  }
};

// ==========================================
// 2. MODULE IMPORT ĐỀ THI TỪ PDF (DRAFT WORKFLOW) (/api/admin/exams/import)
// ==========================================
export interface UpdateDraftQuestionPayload {
  questionNumber?: number;
  type?: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  section?: string;
  content?: string;
  context?: string;
  options?: Array<{ key: string; content: string; isCorrect?: boolean; correct?: boolean }>;
  correctOptionKey?: string;
  answer?: string;
}

export interface AddDraftQuestionPayload {
  questionNumber?: number;
  type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
  section?: string;
  content: string;
  context?: string;
  options?: Array<{ key: string; content: string; isCorrect?: boolean; correct?: boolean }>;
  correctOptionKey?: string;
  answer?: string;
}

export const adminExamImportApi = {
  // 1. Upload PDF để parse & tạo DRAFT preview với ImportMode (FULL | MCQ_ONLY | ESSAY_ONLY)
  previewImport: async (file: File, mode: ImportMode = 'FULL') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    const res = await apiClient.post<ApiResponse<ExamImportDraft>>('/api/admin/exams/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  // 2. Tạo Draft Nhập Thủ Công (không cần file PDF)
  createManualDraft: async (title?: string) => {
    const res = await apiClient.post<ApiResponse<ExamImportDraft>>('/api/admin/exams/import/manual', {
      title: title || 'Đề thi nhập thủ công'
    }, {
      params: title ? { title } : undefined
    });
    return res.data.data;
  },

  // 3. Lấy dữ liệu bản nháp
  getDraft: async (draftId: string) => {
    const res = await apiClient.get<ApiResponse<ExamImportDraft>>(`/api/admin/exams/import/drafts/${draftId}`);
    return res.data.data;
  },

  // 4. Sửa câu hỏi inline/modal (nội dung, chọn đáp án đúng, context, section)
  updateQuestion: async (draftId: string, questionId: string, payload: UpdateDraftQuestionPayload) => {
    const res = await apiClient.put<ApiResponse<DraftQuestion>>(
      `/api/admin/exams/import/drafts/${draftId}/questions/${questionId}`,
      payload
    );
    return res.data.data;
  },

  // 5. Thêm câu hỏi thủ công vào bản nháp
  addQuestion: async (draftId: string, payload: AddDraftQuestionPayload) => {
    const res = await apiClient.post<ApiResponse<DraftQuestion>>(
      `/api/admin/exams/import/drafts/${draftId}/questions`,
      payload
    );
    return res.data.data;
  },

  // 6. Xóa câu hỏi khỏi bản nháp (trả về DraftExamDto sau khi xóa)
  deleteQuestion: async (draftId: string, questionId: string) => {
    const res = await apiClient.delete<ApiResponse<ExamImportDraft>>(
      `/api/admin/exams/import/drafts/${draftId}/questions/${questionId}`
    );
    return res.data.data;
  },

  // 7. Kiểm tra hợp lệ (Validate)
  validateDraft: async (draftId: string) => {
    const res = await apiClient.post<ApiResponse<DraftValidationResult>>(`/api/admin/exams/import/drafts/${draftId}/validate`);
    return res.data.data;
  },

  // 8. Xác nhận import chính thức vào cơ sở dữ liệu
  confirmImport: async (draftId: string) => {
    const res = await apiClient.post<ApiResponse<ConfirmImportResult>>(`/api/admin/exams/import/drafts/${draftId}/confirm`);
    return res.data.data;
  },

  // 9. Hủy bản nháp
  cancelDraft: async (draftId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/api/admin/exams/import/drafts/${draftId}`);
    return res.data.data;
  }
};

