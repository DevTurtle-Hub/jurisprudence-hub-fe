// ==========================================
// 1. CHUẨN PHẢN HỒI CHUNG (ENVELOPE)
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
}

// ==========================================
// 2. AUTHENTICATION (REQUEST & RESPONSE)
// ==========================================
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  unit?: string; // Ví dụ: Công an TP. Hà Nội
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  unit?: string;
  avatarUrl?: string;
  loggedAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // 'Bearer'
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokenResponse;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  unit?: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. 8 KHỐI HỌC THUẬT GIÁO TRÌNH CAND
// ==========================================
export interface DefinitionItem {
  term: string;       // Khái niệm (ví dụ: "Nhà nước pháp quyền")
  definition: string; // Định nghĩa chi tiết
}

export interface ComparisonItem {
  criteria: string;   // Tiêu chí so sánh (ví dụ: "Bản chất quyền lực")
  conceptA: string;   // Khái niệm A (ví dụ: "Nhà nước tư sản")
  conceptB: string;   // Khái niệm B (ví dụ: "Nhà nước XHCN")
  [key: string]: string; // Hỗ trợ thêm cột linh hoạt nếu cần
}

export interface LessonContentResponse {
  objectives: string[];       // 1. Mục tiêu bài học
  coreKnowledge: string[];    // 2. Kiến thức cốt lõi
  definitions: DefinitionItem[]; // 3. Khái niệm then chốt
  keywords: string[];         // 4. Từ khóa định danh
  comparisons: ComparisonItem[]; // 5. Bảng so sánh đa chiều
  examHotspots: string[];     // 6. Trọng tâm thi cử CAND
  commonTraps: string[];      // 7. Bẫy lý thuyết dễ nhầm
  memoryTips: string[];       // 8. Mẹo ghi nhớ nhanh
}

export interface LessonContentRequest {
  objectives?: string[];
  coreKnowledge?: string[];
  definitions?: DefinitionItem[];
  keywords?: string[];
  comparisons?: ComparisonItem[];
  examHotspots?: string[];
  commonTraps?: string[];
  memoryTips?: string[];
}

// ==========================================
// 4. CHAPTERS & LESSONS (REQUEST & RESPONSE)
// ==========================================
export interface ChapterCreateRequest {
  title: string;
  order: number;
  description?: string;
}

export interface ChapterUpdateRequest {
  title?: string;
  order?: number;
  description?: string;
}

export interface LessonSummaryResponse {
  id: string;
  chapterId: string;
  title: string;
  order: number;
}

export interface ChapterResponse {
  id: string;
  title: string;
  order: number;
  description?: string;
  lessons: LessonSummaryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonNavigationResponse {
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export interface LessonDetailResponse {
  id: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  order: number;
  content: LessonContentResponse;
  navigation: LessonNavigationResponse;
}

export interface LessonCreateRequest {
  chapterId: string;
  title: string;
  order: number;
  content?: LessonContentRequest;
}

export interface LessonUpdateRequest {
  title?: string;
  order?: number;
  content?: LessonContentRequest;
}

// ==========================================
// 5. TƯƠNG TÁC (ANNOTATIONS & TIẾN ĐỘ)
// ==========================================
export interface AnnotationCreateRequest {
  selectedText: string;
  kind: 'highlight' | 'underline' | 'textColor';
  color: string;
  note?: string;
}

export interface AnnotationResponse {
  id: string;
  lessonId: string;
  selectedText: string;
  kind: string;
  color: string;
  note?: string;
  createdAt: string;
}

export interface LessonProgressRequest {
  isCompleted?: boolean;
}

export interface LessonProgressResponse {
  lessonId: string;
  isCompleted: boolean;
  lastReadAt: string;
}
