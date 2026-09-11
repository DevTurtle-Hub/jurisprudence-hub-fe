import type { QuestionBankResponse } from '@/types/questionBank'

// Các phân loại câu hỏi chuẩn trong hệ thống
export type QuestionTypeKey = 'ALL' | 'MC_ALL' | 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY'
export type MainGroupKey = 'ALL' | 'MC' | 'ESSAY'

export interface QuestionClassificationOption {
  key: QuestionTypeKey
  label: string
  shortLabel: string
  group: 'MC' | 'ESSAY' | 'ALL'
  badgeLabel: string
  badgeClass: string
  description: string
  order: number
}

// 1. Danh sách cấu trúc phân loại dạng câu hỏi cho FE sử dụng và hiển thị
export const QUESTION_CLASSIFICATION_LIST: QuestionClassificationOption[] = [
  {
    key: 'MC_SCENARIO',
    label: 'Trắc nghiệm tình huống',
    shortLabel: 'Tình huống nghiệp vụ',
    group: 'MC',
    badgeLabel: 'Trắc nghiệm tình huống',
    badgeClass: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    description: 'Câu hỏi tình huống nghiệp vụ CAND, vụ án, tuần tra, xử lý đối tượng',
    order: 1,
  },
  {
    key: 'MC_CHOICE',
    label: 'Trắc nghiệm chọn A B C D',
    shortLabel: 'Chọn A B C D',
    group: 'MC',
    badgeLabel: 'Trắc nghiệm chọn A B C D',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Câu hỏi trắc nghiệm 4 phương án tiêu chuẩn A, B, C, D',
    order: 2,
  },
  {
    key: 'MC_FILL',
    label: 'Trắc nghiệm điền từ',
    shortLabel: 'Điền từ / Khuyết',
    group: 'MC',
    badgeLabel: 'Trắc nghiệm điền từ',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Câu hỏi khuyết từ, điền từ còn thiếu vào vị trí gạch dưới (_____)',
    order: 3,
  },
  {
    key: 'ESSAY',
    label: 'Tự luận & Án lệ',
    shortLabel: 'Tự luận (Có bài mẫu)',
    group: 'ESSAY',
    badgeLabel: 'Tự luận (Có bài mẫu)',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Bài văn nghị luận, hướng dẫn giải án lệ, dàn ý và bài viết mẫu hoàn chỉnh',
    order: 4,
  },
]

// 2. Hai Option / Nhóm chính: Trắc nghiệm và Tự luận (kèm Tất cả)
export interface MainGroupOption {
  key: MainGroupKey
  label: string
  shortLabel: string
  description: string
}

export const MAIN_GROUP_OPTIONS: MainGroupOption[] = [
  { key: 'ALL', label: '1. Tất cả', shortLabel: 'Tất cả', description: 'Tất cả câu hỏi trắc nghiệm và tự luận' },
  { key: 'MC', label: '2. Trắc nghiệm', shortLabel: 'Trắc nghiệm', description: 'Gồm trắc nghiệm tình huống, chọn A B C D, điền từ' },
  { key: 'ESSAY', label: '3. Tự luận', shortLabel: 'Tự luận', description: 'Các bài văn nghị luận & án lệ có bài mẫu' },
]

// 3. Phân nhóm con của Trắc nghiệm: Tình huống, Chọn A B C D, Điền từ
export const MC_SUB_OPTIONS = QUESTION_CLASSIFICATION_LIST.filter(item => item.group === 'MC')

// 4. Hàm phân loại dữ liệu từ câu hỏi thô trong database
export function classifyQuestion(q: QuestionBankResponse): 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY' {
  const text = ((q.questionText || '') + ' ' + (q.title || '')).toLowerCase()
  const hasOptions = Boolean(q.options && q.options.length >= 2)

  // 1. Tự luận:
  const isEssayExplicit = q.questionType?.toUpperCase() === 'ESSAY'
  const hasSampleEssay = Boolean(q.sampleEssay && q.sampleEssay.trim().length > 30)
  const isMCLabel = (q.title || '').toLowerCase().includes('trắc nghiệm')

  if ((isEssayExplicit || hasSampleEssay) && !isMCLabel && (q.questionText || '').length > 30 && !hasOptions) {
    const isFillBlank = text.includes('_____') || text.includes('____') || text.includes('...') || text.includes('điền')
    if (!isFillBlank) {
      return 'ESSAY'
    }
  }

  // 2. Trắc nghiệm điền từ:
  if (
    !hasOptions ||
    text.includes('_____') ||
    text.includes('____') ||
    text.includes('___') ||
    text.includes('_ _ _') ||
    text.includes('.....') ||
    text.includes('....') ||
    text.includes('điền vào chỗ trống') ||
    text.includes('chọn từ thích hợp') ||
    text.includes('điền từ') ||
    text.includes('điền đáp án')
  ) {
    return 'MC_FILL'
  }

  // 3. Trắc nghiệm tình huống:
  if (
    text.includes('tình huống') ||
    text.includes('giả sử') ||
    text.includes('tổ công tác') ||
    text.includes('vụ án') ||
    text.includes('trường hợp sau đây') ||
    text.includes('hành vi nào sau đây cấu thành') ||
    text.includes('công an') ||
    text.includes('cảnh sát') ||
    text.includes('quá trình tuần tra') ||
    text.includes('khi thi hành công vụ') ||
    text.includes('đối tượng')
  ) {
    return 'MC_SCENARIO'
  }

  // 4. Mặc định: Trắc nghiệm chọn A B C D
  return 'MC_CHOICE'
}
