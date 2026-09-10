import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Loại bỏ tiền tố "Câu 1:", "Câu 1.", "1.", "Câu hỏi 1:"... để tránh trùng lặp khi hiển thị câu hỏi
 */
export function cleanQuestionText(text?: string): string {
  if (!text) return ''
  let cleaned = text.trim()
  
  // Xóa tiền tố "Câu hỏi 1:", "Câu 1.", "Câu 1:", "Câu 1 -", "Câu 01:", "Bài 1:"...
  cleaned = cleaned.replace(/^(câu\s*hỏi\s*\d+|câu\s*\d+|bài\s*\d+|question\s*\d+)[\s.:–\/-]*\s*/i, '')
  
  // Xóa tiền tố số thứ tự "1.", "1:", "1 -", "1/" ở đầu câu nếu có
  cleaned = cleaned.replace(/^\d+[\s.:–\/-]+\s*/, '')
  
  return cleaned.trim() || text.trim()
}

/**
 * Loại bỏ tiền tố đáp án "A.", "A:", "(A)", "[A]"... để tránh hiển thị trùng nhãn phương án
 */
export function cleanOptionText(text?: string, label?: string): string {
  if (!text) return ''
  let cleaned = text.trim()

  if (label) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regexSpecific = new RegExp(`^(\\(${escapedLabel}\\)|\\[${escapedLabel}\\]|${escapedLabel})[\\s.:–\\)/-]*\\s*`, 'i')
    cleaned = cleaned.replace(regexSpecific, '')
  }

  // Xóa tiền tố chung dạng A., B., C., D. hoặc (A), (B)...
  cleaned = cleaned.replace(/^(\([A-Za-z0-9]+\)|\[[A-Za-z0-9]+\]|[A-Za-z0-9]+)[\s.:–\\)/-]+\s*/, '')

  return cleaned.trim() || text.trim()
}

/**
 * Chuẩn hóa đoạn trích tình huống / ngữ liệu:
 * Nối các dòng ngắt cưỡng bức do lề trang PDF thành các đoạn văn hoàn chỉnh trải dài toàn bộ khung chiều ngang (full width),
 * chỉ xuống dòng khi văn bản tràn viền (nếu dư mới xuống hàng) hoặc khi kết thúc một đoạn văn.
 */
export function formatSituationalParagraphs(text?: string): string[] {
  if (!text) return []
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Nối các dòng bẻ ngắt giữa chừng do lề trang PDF thành một dòng liền mạch
    .replace(/([^\n.?!:;])\n(?!\n|[•\-\*]|\d+\.)/g, '$1 ')
    // Chuẩn hóa khoảng trắng dư thừa
    .replace(/[ \t]+/g, ' ')

  return normalized
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
}

export function formatSituationalText(text?: string): string {
  return formatSituationalParagraphs(text).join('\n\n')
}
