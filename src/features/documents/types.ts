import type {
  ChapterResponse,
  LessonSummaryResponse,
  LessonDetailResponse,
  LessonContentResponse,
  ChapterCreateRequest,
  ChapterUpdateRequest,
  LessonCreateRequest,
  LessonUpdateRequest,
  AnnotationCreateRequest,
  AnnotationResponse,
  LessonProgressRequest,
  LessonProgressResponse,
} from '@/types/api';

export type {
  ChapterResponse,
  LessonSummaryResponse,
  LessonDetailResponse,
  LessonContentResponse,
  ChapterCreateRequest,
  ChapterUpdateRequest,
  LessonCreateRequest,
  LessonUpdateRequest,
  AnnotationCreateRequest,
  AnnotationResponse,
  LessonProgressRequest,
  LessonProgressResponse,
};

// Kiểu dữ liệu linh hoạt cho Khái niệm (hỗ trợ cả definition của backend và meaning)
export interface DefinitionItem {
  term: string;
  definition: string;
  meaning?: string;
}

// Kiểu dữ liệu linh hoạt cho Bảng so sánh (hỗ trợ cả conceptA/B và itemA/B)
export interface ComparisonItem {
  criteria: string;
  conceptA: string;
  conceptB: string;
  itemA?: string;
  itemB?: string;
  [key: string]: string | undefined;
}

export interface LessonContent {
  objectives: string[];
  coreKnowledge: string[];
  definitions: DefinitionItem[];
  keywords: string[];
  comparisons: ComparisonItem[];
  examHotspots: string[];
  commonTraps: string[];
  memoryTips: string[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  content?: LessonContent;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  description?: string;
  lessons: LessonSummaryResponse[] | Lesson[];
  createdAt?: string;
  updatedAt?: string;
}
