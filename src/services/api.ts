import { apiClient } from './apiClient';
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
  TokenResponse,
  ChapterResponse,
  ChapterCreateRequest,
  ChapterUpdateRequest,
  LessonDetailResponse,
  LessonSummaryResponse,
  LessonCreateRequest,
  LessonUpdateRequest,
  AnnotationCreateRequest,
  AnnotationResponse,
  LessonProgressResponse,
} from '../types/api';

// ==========================================
// 1. AUTH API
// ==========================================
export const AuthApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    // Xóa sạch token cũ và header để tránh token lỗi gây 403 từ backend
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete apiClient.defaults.headers.common.Authorization;

    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload);
    const data = res.data.data;
    localStorage.setItem('access_token', data.tokens.accessToken);
    localStorage.setItem('refresh_token', data.tokens.refreshToken);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete apiClient.defaults.headers.common.Authorization;

    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', payload);
    const data = res.data.data;
    localStorage.setItem('access_token', data.tokens.accessToken);
    localStorage.setItem('refresh_token', data.tokens.refreshToken);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  getMe: async (): Promise<UserProfileResponse> => {
    const res = await apiClient.get<ApiResponse<UserProfileResponse>>('/api/v1/auth/me');
    return res.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/api/v1/auth/refresh-token', { refreshToken });
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Lỗi khi gọi API logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('currentUser');
    }
  },
};

// ==========================================
// 2. DOCUMENT API (CHƯƠNG & BÀI HỌC CAND)
// ==========================================
export const DocumentApi = {
  // Lấy toàn bộ cây danh mục chương & bài học
  getChapters: async (includeLessons = true, search?: string): Promise<ChapterResponse[]> => {
    const res = await apiClient.get<ApiResponse<ChapterResponse[]>>('/api/v1/chapters', {
      params: { includeLessons, search: search || undefined },
    });
    return res.data.data;
  },

  // Chi tiết 1 chương
  getChapterById: async (id: string): Promise<ChapterResponse> => {
    const res = await apiClient.get<ApiResponse<ChapterResponse>>(`/api/v1/chapters/${id}`);
    return res.data.data;
  },

  // Lấy chi tiết bài học (gồm 8 khối học thuật CAND + navigation)
  getLessonDetail: async (id: string): Promise<LessonDetailResponse> => {
    const res = await apiClient.get<ApiResponse<LessonDetailResponse>>(`/api/v1/lessons/${id}`);
    return res.data.data;
  },

  // --- DÀNH CHO ADMIN ---
  createChapter: async (payload: ChapterCreateRequest): Promise<ChapterResponse> => {
    const res = await apiClient.post<ApiResponse<ChapterResponse>>('/api/v1/chapters', payload);
    return res.data.data;
  },

  updateChapter: async (id: string, payload: ChapterUpdateRequest): Promise<ChapterResponse> => {
    const res = await apiClient.put<ApiResponse<ChapterResponse>>(`/api/v1/chapters/${id}`, payload);
    return res.data.data;
  },

  deleteChapter: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/chapters/${id}`);
  },

  createLesson: async (payload: LessonCreateRequest): Promise<LessonSummaryResponse> => {
    const res = await apiClient.post<ApiResponse<LessonSummaryResponse>>('/api/v1/lessons', payload);
    return res.data.data;
  },

  updateLesson: async (id: string, payload: LessonUpdateRequest): Promise<LessonSummaryResponse> => {
    const res = await apiClient.put<ApiResponse<LessonSummaryResponse>>(`/api/v1/lessons/${id}`, payload);
    return res.data.data;
  },

  deleteLesson: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/lessons/${id}`);
  },
};

// ==========================================
// 3. INTERACTION API (HIGHLIGHTS & TIẾN ĐỘ)
// ==========================================
export const InteractionApi = {
  // Lấy danh sách highlight của học viên trong bài học
  getAnnotations: async (lessonId: string): Promise<AnnotationResponse[]> => {
    const res = await apiClient.get<ApiResponse<AnnotationResponse[]>>(`/api/v1/lessons/${lessonId}/annotations`);
    return res.data.data;
  },

  // Tạo một highlight mới
  createAnnotation: async (lessonId: string, payload: AnnotationCreateRequest): Promise<AnnotationResponse> => {
    const res = await apiClient.post<ApiResponse<AnnotationResponse>>(
      `/api/v1/lessons/${lessonId}/annotations`,
      payload
    );
    return res.data.data;
  },

  // Xóa highlight
  deleteAnnotation: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/annotations/${id}`);
  },

  // Cập nhật trạng thái hoàn thành bài học
  updateProgress: async (lessonId: string, isCompleted = true): Promise<LessonProgressResponse> => {
    const res = await apiClient.post<ApiResponse<LessonProgressResponse>>(
      `/api/v1/lessons/${lessonId}/progress`,
      { isCompleted }
    );
    return res.data.data;
  },
};

// ==========================================
// 4. EXAM & DRAFT IMPORT APIs
// ==========================================
export * from './examApi';

