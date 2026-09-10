export const ROMAN_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
]

/**
 * Chuyển đổi số nguyên sang số La Mã tương ứng từ 1 trở đi (I, II, III...)
 */
export function toRoman(n: number): string {
  if (n <= 0) return 'I'
  return ROMAN_NUMERALS[n - 1] || `${n}`
}

/**
 * Dữ liệu rỗng khi tạo bài học mới để người dùng tự nhập toàn bộ từ đầu.
 */
export const getEmptyLessonData = (chapterId: string = '') => ({
  chapterId,
  title: '',
  objectives: '',
  coreKnowledge: '',
  definitions: '',
  keywords: '',
  comparisons: '',
  examHotspots: '',
  commonTraps: '',
  memoryTips: ''
})

/**
 * Giữ lại alias để tương thích nếu cần
 */
export const getDefaultLessonData = (chapterId: string = '', _order = 1) => getEmptyLessonData(chapterId)
