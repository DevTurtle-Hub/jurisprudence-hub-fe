import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  QuestionBankRequest,
  QuestionBankResponse,
  QuestionBankFilterParams,
  SpringPage
} from '../types/questionBank';

export const questionBankApi = {
  // 1. Import và preview câu hỏi từ file (PDF, DOCX, XLSX)
  parsePreview: async (file: File, targetType: 'FULL' | 'MC_ONLY' | 'ESSAY_ONLY' = 'FULL'): Promise<QuestionBankResponse[]> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', targetType);

    const res = await apiClient.post<ApiResponse<QuestionBankResponse[]>>(
      '/api/v1/question-bank/parse-preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data?.data || [];
  },

  // 2. Lưu 1 câu hỏi (Draft)
  saveQuestion: async (payload: QuestionBankRequest): Promise<QuestionBankResponse> => {
    const res = await apiClient.post<ApiResponse<QuestionBankResponse>>(
      '/api/v1/question-bank/questions',
      payload
    );
    return res.data?.data;
  },

  // 3. Lưu nhiều câu hỏi cùng lúc (Batch)
  saveBatch: async (requests: QuestionBankRequest[]): Promise<QuestionBankResponse[]> => {
    const res = await apiClient.post<ApiResponse<QuestionBankResponse[]>>(
      '/api/v1/question-bank/questions/batch',
      requests
    );
    return res.data?.data || [];
  },

  // 4. Lấy danh sách câu hỏi phân trang & lọc
  getQuestions: async (params?: QuestionBankFilterParams): Promise<SpringPage<QuestionBankResponse>> => {
    const res = await apiClient.get<ApiResponse<SpringPage<QuestionBankResponse>>>(
      '/api/v1/question-bank/questions',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          category: params?.category || undefined,
          questionType: params?.questionType || undefined,
          keyword: params?.keyword || undefined,
          isDraft: params?.isDraft !== undefined ? params.isDraft : true,
        },
      }
    );
    return res.data?.data;
  },

  // 5. Lấy chi tiết câu hỏi theo ID
  getQuestionById: async (id: string): Promise<QuestionBankResponse> => {
    const res = await apiClient.get<ApiResponse<QuestionBankResponse>>(
      `/api/v1/question-bank/questions/${id}`
    );
    return res.data?.data;
  },

  // 6. Cập nhật câu hỏi
  updateQuestion: async (id: string, payload: QuestionBankRequest, editReason?: string): Promise<QuestionBankResponse> => {
    const res = await apiClient.put<ApiResponse<QuestionBankResponse>>(
      `/api/v1/question-bank/questions/${id}`,
      payload,
      {
        params: editReason ? { editReason } : undefined,
      }
    );
    return res.data?.data;
  },

  // 7. Xóa câu hỏi
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(
      `/api/v1/question-bank/questions/${id}`
    );
  },

  // 8. Publish câu hỏi (chuyển draft -> published)
  publishQuestion: async (id: string): Promise<QuestionBankResponse> => {
    const res = await apiClient.patch<ApiResponse<QuestionBankResponse>>(
      `/api/v1/question-bank/questions/${id}/publish`
    );
    return res.data?.data;
  },

  // 9. Tạo câu hỏi thủ công
  createManualQuestion: async (payload: QuestionBankRequest): Promise<QuestionBankResponse> => {
    const res = await apiClient.post<ApiResponse<QuestionBankResponse>>(
      '/api/v1/question-bank/questions/manual',
      payload
    );
    return res.data?.data;
  },
};
