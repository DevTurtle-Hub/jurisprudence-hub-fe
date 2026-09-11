import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Bookmark,
  Loader2,
  Copy,
  X,
  Check
} from 'lucide-react'
import {
  RealisticQuiz3DIcon,
  RealisticEssay3DIcon,
  RealisticFlashcard3DIcon,
  RealisticLayers3DIcon,
  RealisticScale3DIcon,
  RealisticTypography3DIcon,
  RealisticNotebook3DIcon,
  RealisticRibbon3DIcon,
  RealisticDice3DIcon,
  RealisticVault3DIcon,
  RealisticPdf3DIcon
} from '@/components/common/RealisticExamIcons'
import { cn } from '@/lib/utils'
import { questionBankApi } from '@/services/questionBankApi'
import type { QuestionBankResponse } from '@/types/questionBank'
import { toast } from 'sonner'
import { classifyQuestion } from '@/constants/questionClassification'
import { exportElementToPdf } from '@/lib/pdfExport'

// Các phân loại đề ôn luyện:
// ALL: Tất cả câu hỏi
// MC_CHOICE: Trắc nghiệm A B C D chuẩn
// MC_SCENARIO: Trắc nghiệm tình huống nghiệp vụ
// MC_FILL: Trắc nghiệm điền đáp án
// ESSAY: Tự luận & Án lệ
export type QuizQuestionTypeFilter = 'ALL' | 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY'

// Kiểu dữ liệu câu hỏi ôn luyện đồng nhất
interface QuizQuestionItem {
  id: string | number
  question: string
  title?: string
  category?: string
  questionType: 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY'
  options: string[]
  correctAnswer: number
  textAnswer?: string
  sampleEssay?: string
  explanation?: string
  legalReference?: string
}

// Toàn bộ dữ liệu câu hỏi được lấy trực tiếp 100% từ Ngân hàng câu hỏi trong Cơ sở dữ liệu

// Hàm phân loại câu hỏi từ dữ liệu Ngân hàng CSDL
function detectQuestionType(q: QuestionBankResponse): 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY' {
  return classifyQuestion(q)
}

// Hàm xáo trộn Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Chuẩn hóa và phục hồi toàn diện các lỗi chữ/dấu tiếng Việt (gãy thanh điệu, tách dấu do OCR/font cũ)
export function cleanVietnameseTypography(text: string): string {
  if (!text) return ''
  let s = text.normalize('NFC')

  // 1. Ghép lại các âm tiết bị tách dấu / chèn khoảng trắng trước phụ âm cuối
  s = s.replace(/ki[eê][\u00B4\u02CA\u0301\s]*n\b/gi, 'kiến')
       .replace(/vi[eê][\u00B4\u02CA\u0301\s]*t\b/gi, 'viết')
       .replace(/b[aă][\u0060\u02CB\u0300\s]*ng\b/gi, 'bằng')
       .replace(/r[aă][\u0060\u02CB\u0300\s]*ng\b/gi, 'rằng')
       .replace(/c[oô][\u00B4\u02CA\u0301\s]*ng\b/gi, 'cống')
       .replace(/hi[eê][\u00B4\u02CA\u0301\s]*n\b/gi, 'hiến')
       .replace(/bi[eê][\u00B4\u02CA\u0301\s]*t\b/gi, 'biết')
       .replace(/bi[eê][\u00B4\u02CA\u0301\s]*n\b/gi, 'biến')
       .replace(/ph[aâ][\u0060\u02CB\u0300\s]*n\b/gi, 'phần')
       .replace(/ph[oô][\u0060\u02CB\u0300\s]*n\b/gi, 'phồn')
       .replace(/t[oô][\u00B4\u02CA\u0301\s]*i\b/gi, 'tối')
       .replace(/ti[eê][\u00B4\u02CA\u0301\s]*p\b/gi, 'tiếp')
       .replace(/n[oô][\u00B4\u02CA\u0301\s]*i\b/gi, 'nối')
       .replace(/u[oô][\u00B4\u02CA\u0301\s]*ng\b/g, 'uống')
       .replace(/U[oô][\u00B4\u02CA\u0301\s]*ng\b/g, 'Uống')
       .replace(/uố\s+ng\b/g, 'uống')
       .replace(/Uố\s+ng\b/g, 'Uống')
       .replace(/ngu[oô][\u0060\u02CB\u0300\s]*n\b/gi, 'nguồn')
       .replace(/truy[eê][\u0060\u02CB\u0300\s]*n\b/gi, 'truyền')
       .replace(/th[oô][\u00B4\u02CA\u0301\s]*ng\b/gi, 'thống')
       .replace(/thố\s+ng\b/gi, 'thống')
       .replace(/qu[oô][\u00B4\u02CA\u0301\s]*c\b/g, 'quốc')
       .replace(/Qu[oô][\u00B4\u02CA\u0301\s]*c\b/g, 'Quốc')
       .replace(/quố\s+c\b/g, 'quốc')
       .replace(/Quố\s+c\b/g, 'Quốc')
       .replace(/v[oơ][\u00B4\u02CA\u0301\s]*i\b/gi, 'với')
       .replace(/th[eê][\u00B4\u02CA\u0301]\s+/gi, 'thế ')
       .replace(/v[eê][\u0060\u02CB\u0300]\s+/gi, 'về ')
       .replace(/k[eê][\u00B4\u02CA\u0301]\s+/gi, 'kế ')

  // 2. Chuyển đổi các ký tự dấu rời rạc sang ký tự có dấu chuẩn
  const diacriticMap: Record<string, string> = {
    'ê´': 'ế', 'ê`': 'ề', 'ể': 'ể', 'ê~': 'ễ', 'ệ': 'ệ',
    'ô´': 'ố', 'ô`': 'ồ', 'ổ': 'ổ', 'ô~': 'ỗ', 'ộ': 'ộ',
    'ơ´': 'ớ', 'ơ`': 'ờ', 'ở': 'ở', 'ơ~': 'ỡ', 'ợ': 'ợ',
    'ư´': 'ứ', 'ư`': 'ừ', 'ử': 'ử', 'ư~': 'ữ', 'ự': 'ự',
    'ă´': 'ắ', 'ă`': 'ằ', 'ẳ': 'ẳ', 'ă~': 'ẵ', 'ặ': 'ặ',
    'â´': 'ấ', 'â`': 'ầ', 'ẩ': 'ẩ', 'â~': 'ẫ', 'ậ': 'ậ',
    'a´': 'á', 'a`': 'à', 'ả': 'ả', 'a~': 'ã', 'ạ': 'ạ',
    'e´': 'é', 'e`': 'è', 'ẻ': 'ẻ', 'e~': 'ẽ', 'ẹ': 'ẹ',
    'i´': 'í', 'i`': 'ì', 'ỉ': 'ỉ', 'i~': 'ĩ', 'ị': 'ị',
    'o´': 'ó', 'o`': 'ò', 'ỏ': 'ỏ', 'o~': 'õ', 'ọ': 'ọ',
    'u´': 'ú', 'u`': 'ù', 'ủ': 'ủ', 'u~': 'ũ', 'ụ': 'ụ',
    'y´': 'ý', 'y`': 'ỳ', 'ỷ': 'ỷ', 'y~': 'ỹ', 'ỵ': 'ỵ',
  }

  for (const [k, v] of Object.entries(diacriticMap)) {
    s = s.replaceAll(k, v)
    s = s.replaceAll(k.toUpperCase(), v.toUpperCase())
  }

  // 3. Dọn sạch dấu rác và chuẩn hóa khoảng trắng
  s = s.replace(/[\u00B4\u02CA]/g, '')
  s = s.replace(/`([a-zA-Z])/g, '$1')
  s = s.replace(/[ ]{2,}/g, ' ')

  return s.normalize('NFC')
}

// Thành phần hiển thị đề bài tự luận chuẩn hóa, cân đối và thẩm mỹ
function FormattedExamQuestionPrompt({
  question,
  fontSize
}: {
  question?: string
  fontSize: 'normal' | 'large' | 'xlarge'
}) {
  const cleaned = cleanVietnameseTypography(question || '')
  if (!cleaned) return null

  // 1. Bảo vệ các vị trí ngắt đoạn có chủ đích:
  // - Sau dấu hai chấm (:) kết thúc lời dẫn
  // - Sau dấu ngoặc kép (") hoặc (”) kết thúc trích dẫn
  // - Dấu xuống dòng kép (\n\n)
  let s = cleaned
    .replace(/:\s*\n/g, ':__BREAK__')
    .replace(/\"\s*\n/g, '"__BREAK__')
    .replace(/”\s*\n/g, '”__BREAK__')
    .replace(/\n\s*\n/g, '__BREAK__')

  // 2. Chuyển các dấu xuống dòng đơn lẻ ở giữa câu do gõ hoặc OCR thành khoảng trắng
  s = s.replace(/\s*\n\s*/g, ' ')

  // 3. Tách thành các đoạn văn riêng biệt
  const rawParagraphs = s.split('__BREAK__').map(p => p.trim()).filter(Boolean)

  const textClass = cn(
    "leading-relaxed font-sans",
    fontSize === 'normal'
      ? "text-sm sm:text-base"
      : fontSize === 'large'
      ? "text-base sm:text-lg"
      : "text-lg sm:text-xl"
  )

  return (
    <div className="space-y-3 font-sans">
      {rawParagraphs.map((para, idx) => {
        // A. Dẫn nhập: Có ý kiến cho rằng / Đề bài / Đề thi:
        if (para.endsWith(':')) {
          return (
            <div key={idx} className={cn("font-bold text-slate-900 tracking-tight", textClass)}>
              {para}
            </div>
          )
        }

        // B. Trích đoạn ý kiến / nhận định (nằm trong dấu ngoặc kép)
        const isQuote =
          (para.startsWith('"') && para.endsWith('"')) ||
          (para.startsWith('“') && para.endsWith('”')) ||
          (para.startsWith('"') && para.includes('"')) ||
          (para.startsWith('“') && para.includes('”'))

        if (isQuote) {
          return (
            <blockquote
              key={idx}
              className={cn(
                "relative my-2.5 px-4 sm:px-5 py-3 rounded-xl bg-slate-50/90 border-l-4 border-emerald-600 border-y border-r border-slate-200/80 shadow-2xs text-justify italic font-medium text-slate-900 leading-relaxed",
                textClass
              )}
            >
              <div className="relative z-10">{para}</div>
            </blockquote>
          )
        }

        // C. Đoạn yêu cầu phân tích / nghị luận của đề bài (căn đều 2 bên cân đối tuyệt đối)
        return (
          <p
            key={idx}
            className={cn(
              "indent-8 text-justify font-semibold leading-relaxed text-slate-950",
              textClass
            )}
          >
            {para}
          </p>
        )
      })}
    </div>
  )
}

// Thành phần hiển thị nội dung bài làm A4 với định dạng tự nhiên như 1 tờ giấy học / bài thi thật
function FormattedEssayContent({
  content,
  fontSize
}: {
  content?: string
  fontSize: 'normal' | 'large' | 'xlarge'
}) {
  const cleanedContent = cleanVietnameseTypography(content || '')

  if (!cleanedContent) {
    return (
      <div className="py-8 text-center italic text-slate-500 text-sm font-sans">
        Đang cập nhật hướng dẫn bài làm mẫu chi tiết cho đề thi này.
      </div>
    )
  }

  // Tách nội dung theo dòng
  const lines = cleanedContent.split('\n')
  const elements: {
    type: 'main_header' | 'sub_header' | 'divider' | 'bullet' | 'paragraph'
    text: string
    lead?: string
    rest?: string
  }[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Đường phân cách
    if (/^[=-]{5,}$/.test(line)) {
      elements.push({ type: 'divider', text: '' })
      continue
    }

    // Đề mục lớn: I. MỞ BÀI, II. THÂN BÀI, III. KẾT BÀI, DÀN Ý, PHẦN THAM KHẢO...
    if (
      /^(I|II|III|IV|V)\.\s+/i.test(line) ||
      /^PHẦN\s+[I|V|X\d]+:/i.test(line) ||
      /^DÀN Ý\s+/i.test(line) ||
      /^PHẦN THAM KHẢO\s+/i.test(line)
    ) {
      elements.push({ type: 'main_header', text: line })
      continue
    }

    // Đề mục nhỏ: 1. Giải thích, 2. Phân tích, a. Cơ sở lý luận...
    if (/^([1-9]\.|\b[a-d]\.)\s+/i.test(line)) {
      elements.push({ type: 'sub_header', text: line })
      continue
    }

    // Dòng gạch đầu dòng: - hoặc + hoặc * hoặc •
    if (/^[-+*•]\s+/.test(line)) {
      const cleanLine = line.replace(/^[-+*•]\s+/, '')
      if (cleanLine.includes(':')) {
        const colonIdx = cleanLine.indexOf(':')
        elements.push({
          type: 'bullet',
          text: cleanLine,
          lead: cleanLine.slice(0, colonIdx + 1),
          rest: cleanLine.slice(colonIdx + 1).trim()
        })
      } else {
        elements.push({
          type: 'bullet',
          text: cleanLine
        })
      }
      continue
    }

    // Đoạn văn thông thường
    elements.push({ type: 'paragraph', text: line })
  }

  return (
    <div
      className={cn(
        "font-sans text-slate-900 space-y-3",
        fontSize === 'normal'
          ? "text-sm sm:text-base leading-relaxed"
          : fontSize === 'large'
          ? "text-base sm:text-lg leading-relaxed"
          : "text-lg sm:text-xl leading-loose"
      )}
    >
      {elements.map((el, idx) => {
        if (el.type === 'divider') {
          return (
            <div key={idx} className="my-6 border-t border-dashed border-slate-300 text-center relative select-none">
              <span className="bg-white px-3 text-xs text-slate-400 italic -top-3 relative">
                ❖ ❖ ❖
              </span>
            </div>
          )
        }

        if (el.type === 'main_header') {
          return (
            <div key={idx} className="pt-4 pb-1.5 border-b border-slate-300 first:pt-1">
              <h3 className="font-extrabold uppercase text-slate-950 tracking-wide text-xs sm:text-sm">
                {el.text}
              </h3>
            </div>
          )
        }

        if (el.type === 'sub_header') {
          return (
            <h4 key={idx} className="font-bold text-slate-900 pt-2 text-xs sm:text-sm">
              {el.text}
            </h4>
          )
        }

        if (el.type === 'bullet') {
          return (
            <div key={idx} className="pl-5 relative text-slate-800 text-justify">
              <span className="absolute left-0 text-slate-400 font-bold select-none">—</span>
              {el.lead ? (
                <span>
                  <strong className="font-bold text-slate-950">{el.lead}</strong>{' '}
                  <span>{el.rest}</span>
                </span>
              ) : (
                <span>{el.text}</span>
              )}
            </div>
          )
        }

        return (
          <p key={idx} className="indent-8 text-justify text-slate-800 leading-relaxed">
            {el.text}
          </p>
        )
      })}
    </div>
  )
}

export function QuizPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Chế độ học: 'FLASHCARD' (Flashcard lật thẻ ghi nhớ) | 'QUIZ' (Trắc nghiệm tính điểm) | 'ESSAY_STUDY' (Luyện Tự luận & Án lệ)
  const [learningMode, setLearningMode] = useState<'FLASHCARD' | 'QUIZ' | 'ESSAY_STUDY'>('FLASHCARD')

  // Quản lý xem tài liệu dạng tờ giấy thi A4
  const [selectedA4Essay, setSelectedA4Essay] = useState<QuizQuestionItem | null>(null)
  // Quản lý hiển thị vở nháp bên trong tờ A4
  const [isA4DraftOpen, setIsA4DraftOpen] = useState<boolean>(false)
  // Quản lý trạng thái đã sao chép tài liệu A4
  const [isCopiedA4, setIsCopiedA4] = useState<boolean>(false)
  // Quản lý trạng thái đang xuất file PDF
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false)

  // Phân loại câu hỏi: ALL | MC_CHOICE | MC_SCENARIO | MC_FILL | ESSAY
  const [typeFilter, setTypeFilter] = useState<QuizQuestionTypeFilter>('ALL')

  // Cấu hình lấy câu hỏi: Mặc định lấy ngẫu nhiên 60 câu = 1 bộ đề
  const [questionCount, setQuestionCount] = useState<number>(60)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Danh sách câu hỏi tải từ Ngân hàng
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([])
  const [rawBankQuestions, setRawBankQuestions] = useState<QuestionBankResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFromBank, setIsFromBank] = useState<boolean>(false)

  // Trạng thái phiên học hiện tại
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Trạng thái Flashcard
  const [isFlipped, setIsFlipped] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string | number>>(new Set())

  // Trạng thái nhập liệu cho câu hỏi điền đáp án
  const [fillInputText, setFillInputText] = useState<string>('')

  // Quản lý kích thước font chữ ôn luyện (Mặc định to lên 1 xíu 'large' theo yêu cầu học viên)
  const [quizFontSize, setQuizFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('quiz_font_size') as 'normal' | 'large' | 'xlarge') || 'large'
  })

  const handleFontSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    setQuizFontSize(size)
    localStorage.setItem('quiz_font_size', size)
  }

  // Tự động nhận diện Chế độ học và Phân loại từ URL Parameters khi bấm từ Menu Dropdown Sidebar
  useEffect(() => {
    if (!location.search) return
    const params = new URLSearchParams(location.search)
    const mode = params.get('mode')
    if (mode === 'FLASHCARD' || mode === 'QUIZ' || mode === 'ESSAY_STUDY') {
      setLearningMode(mode)
    }
    const type = params.get('type')
    if (type && ['ALL', 'MC_CHOICE', 'MC_SCENARIO', 'MC_FILL', 'ESSAY'].includes(type)) {
      setTypeFilter(type as QuizQuestionTypeFilter)
    }
  }, [location.search])

  // Quản lý nội dung bản nháp tự luận lưu vào LocalStorage
  const [essayDrafts, setEssayDrafts] = useState<Record<string | number, string>>(() => {
    try {
      const saved = localStorage.getItem('essay_drafts_t05')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const handleDraftChange = (id: string | number, text: string) => {
    setEssayDrafts(prev => {
      const next = { ...prev, [id]: text }
      try {
        localStorage.setItem('essay_drafts_t05', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Hàm đếm số từ thông minh cho bài viết tự luận
  const countWords = (text?: string): number => {
    if (!text) return 0
    const trimmed = text.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }

  // Hàm chuyển đổi raw QuestionBankResponse sang QuizQuestionItem
  const convertToQuizItems = useCallback((rawList: QuestionBankResponse[]): QuizQuestionItem[] => {
    return rawList.map(q => {
      const qType = detectQuestionType(q)
      const opts = q.options || []
      let correctIdx = opts.findIndex(o => o.isCorrect || (o as any).correct)
      if (correctIdx === -1 && q.correctAnswer) {
        correctIdx = opts.findIndex(o => o.label?.toUpperCase() === q.correctAnswer?.toUpperCase())
      }
      if (correctIdx === -1) correctIdx = 0

      // Text đáp án đúng
      let textAns = q.correctAnswer || ''
      if (opts[correctIdx]) {
        textAns = opts[correctIdx].text || (opts[correctIdx] as any).optionText || ''
      }

      return {
        id: q.id,
        category: q.category || 'Pháp luật CAND',
        title: q.title || (qType === 'ESSAY' ? 'Câu hỏi Tự luận & Án lệ' : qType === 'MC_SCENARIO' ? 'Tình huống pháp lý CAND' : qType === 'MC_FILL' ? 'Trắc nghiệm điền đáp án' : 'Trắc nghiệm chọn A B C D'),
        questionType: qType,
        question: q.questionText,
        options: opts.map(o => `${o.label ? o.label + '. ' : ''}${o.text || (o as any).optionText || ''}`),
        correctAnswer: correctIdx,
        textAnswer: textAns,
        sampleEssay: q.sampleEssay || q.explanation,
        explanation: q.explanation,
        legalReference: q.legalReference
      }
    })
  }, [])

  // Sinh danh sách câu hỏi ngẫu nhiên cho phiên học
  const generateSession = (
    pool: QuizQuestionItem[],
    filterCat: string,
    filterType: QuizQuestionTypeFilter,
    limit: number
  ) => {
    let filtered = pool

    // Lọc theo Chuyên đề
    if (filterCat !== 'ALL') {
      filtered = filtered.filter(q => q.category === filterCat)
    }

    // Lọc theo Phân loại dạng bài
    if (filterType !== 'ALL') {
      filtered = filtered.filter(q => q.questionType === filterType)
    }

    // Nếu bộ lọc quá chặt không có câu nào, lấy từ pool lớn
    if (filtered.length === 0) {
      if (filterType !== 'ALL') {
        filtered = pool.filter(q => q.questionType === filterType)
      }
      if (filtered.length === 0) filtered = pool
    }

    // Xáo trộn ngẫu nhiên
    const shuffled = shuffleArray(filtered).slice(0, limit)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setSelectedOption(null)
    setFillInputText('')
    setIsAnswered(false)
    setIsFlipped(false)
    setScore(0)
    setIsFinished(false)
  }

  // Tải dữ liệu thật 100% từ Ngân hàng câu hỏi trong Cơ sở dữ liệu
  const loadQuestionBankData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Lấy toàn bộ câu hỏi (cả câu hỏi đã xuất bản và bản nháp) từ CSDL
      const [pubRes, draftRes] = await Promise.allSettled([
        questionBankApi.getQuestions({
          page: 1,
          limit: 1000,
          isDraft: false,
        }),
        questionBankApi.getQuestions({
          page: 1,
          limit: 1000,
          isDraft: true,
        }),
      ])

      const pubList = pubRes.status === 'fulfilled' ? pubRes.value?.content || [] : []
      const draftList = draftRes.status === 'fulfilled' ? draftRes.value?.content || [] : []

      // Gộp câu hỏi và loại trừ trùng ID (ưu tiên bản ghi đã xuất bản)
      const questionMap = new Map<string, QuestionBankResponse>()
      pubList.forEach(q => { if (q?.id) questionMap.set(q.id, q) })
      draftList.forEach(q => { if (q?.id && !questionMap.has(q.id)) questionMap.set(q.id, q) })

      const allQuestions = Array.from(questionMap.values())
      setRawBankQuestions(allQuestions)

      // Lọc các chuyên đề thật có trong CSDL
      const cats = Array.from(
        new Set(
          allQuestions
            .map(q => q.category?.trim())
            .filter((c): c is string => Boolean(c))
        )
      )
      setAvailableCategories(cats)

      if (allQuestions.length > 0) {
        setIsFromBank(true)
        const converted = convertToQuizItems(allQuestions)
        generateSession(converted, categoryFilter, typeFilter, questionCount)
      } else {
        setIsFromBank(false)
        generateSession([], categoryFilter, typeFilter, questionCount)
      }
    } catch (err) {
      console.error('Lỗi khi tải câu hỏi từ cơ sở dữ liệu:', err)
      setIsFromBank(false)
      setRawBankQuestions([])
      generateSession([], categoryFilter, typeFilter, questionCount)
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, typeFilter, questionCount, convertToQuizItems])

  // Khởi chạy nạp dữ liệu lần đầu
  useEffect(() => {
    loadQuestionBankData()
  }, [])

  // Đổi danh mục lọc, dạng bài hoặc số lượng
  const handleFilterChange = (cat: string, type: QuizQuestionTypeFilter, count: number) => {
    setCategoryFilter(cat)
    setTypeFilter(type)
    setQuestionCount(count)
    if (type === 'ESSAY') {
      setLearningMode('ESSAY_STUDY')
    } else if (learningMode === 'ESSAY_STUDY') {
      setLearningMode('QUIZ')
    }

    const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : []
    generateSession(pool, cat, type, count)
  }

  // Danh sách các bài tự luận & án lệ độc lập từ Ngân hàng câu hỏi thật trong Database (Không dùng data giả)
  const allEssayItems = useMemo(() => {
    // 1. Trích xuất câu hỏi tự luận hợp lệ từ CSDL theo bộ phân loại chuẩn
    const validBankEssays = rawBankQuestions.filter(q => classifyQuestion(q) === 'ESSAY')

    // 2. Chuyển đổi trực tiếp các bài tự luận từ CSDL thành QuizQuestionItem
    const result: QuizQuestionItem[] = validBankEssays.map((q, idx) => ({
      id: q.id,
      category: q.category || 'Pháp luật CAND',
      title: q.title || `BÀI TỰ LUẬN #${String(idx + 1).padStart(2, '0')}`,
      questionType: 'ESSAY',
      question: q.questionText,
      options: [],
      correctAnswer: 0,
      textAnswer: '',
      sampleEssay: q.sampleEssay || q.explanation || '',
      explanation: q.explanation || '',
      legalReference: q.legalReference || ''
    }))

    // 3. Lọc theo chuyên đề nếu đang chọn chuyên đề riêng
    if (categoryFilter !== 'ALL') {
      const filtered = result.filter(e => e.category?.toLowerCase() === categoryFilter.toLowerCase())
      return filtered
    }

    return result
  }, [rawBankQuestions, categoryFilter])

  // Vị trí của bài thi đang xem trong toàn bộ danh sách tự luận
  const currentA4Idx = useMemo(() => {
    if (!selectedA4Essay) return -1
    return allEssayItems.findIndex(e => e.id === selectedA4Essay.id)
  }, [selectedA4Essay, allEssayItems])

  const handleA4Prev = () => {
    if (currentA4Idx > 0) {
      setSelectedA4Essay(allEssayItems[currentA4Idx - 1])
    }
  }

  const handleA4Next = () => {
    if (currentA4Idx < allEssayItems.length - 1) {
      setSelectedA4Essay(allEssayItems[currentA4Idx + 1])
    }
  }

  const handleCopyFullA4Document = (essay: QuizQuestionItem) => {
    const formattedText = `BỘ CÔNG AN - TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM - Độc lập - Tự do - Hạnh phúc
------------------------------------------------------------
TÀI LIỆU ÔN THI TUYỂN SINH VĂN BẰNG 2 CAND: BÀI TỰ LUẬN & ĐÁP ÁN MẪU T05
Chuyên đề: ${essay.category || 'Pháp luật CAND'}
Thang điểm: 30 điểm • Thời gian làm bài: 90 phút

PHẦN I: ĐỀ BÀI VĂN NGHỊ LUẬN (30 ĐIỂM)
${essay.question}

PHẦN II: HƯỚNG DẪN DÀN Ý & BÀI LÀM MẪU CHUẨN ĐIỂM 10
${essay.sampleEssay || essay.explanation || ''}

${essay.legalReference ? `CĂN CỨ PHÁP LÝ & TÀI LIỆU ĐỐI CHIẾU:\n${essay.legalReference}` : ''}
------------------------------------------------------------
Lưu hành nội bộ - Trường Đại học Cảnh sát Nhân dân`

    navigator.clipboard.writeText(formattedText)
    setIsCopiedA4(true)
    toast.success('Đã sao chép toàn bộ tài liệu A4 vào clipboard!')
    setTimeout(() => setIsCopiedA4(false), 2000)
  }

  // Xuất tài liệu tự luận trực tiếp ra file PDF (Tải file về máy, không mở hộp thoại in)
  const handleExportA4ToPdf = async () => {
    if (!selectedA4Essay || isExportingPdf) return
    const element = document.getElementById('a4-print-sheet')
    if (!element) {
      toast.error('Không tìm thấy nội dung tờ giấy thi để xuất file!')
      return
    }

    setIsExportingPdf(true)
    const toastId = toast.loading('Đang xử lý và xuất file PDF...')

    try {
      const cleanTitle = (selectedA4Essay.title || 'Bai_Tu_Luan_T05')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .trim()
      const fileName = `${cleanTitle}_T05.pdf`

      await exportElementToPdf(element, {
        fileName,
        marginMm: 8,
      })

      toast.success(`Đã xuất và tải file PDF "${fileName}" về máy!`, { id: toastId })
    } catch (err: any) {
      console.error('Lỗi khi xuất file PDF:', err)
      toast.error('Không thể xuất file PDF: ' + (err?.message || 'Đã có lỗi xảy ra'), { id: toastId })
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Tái tạo lại danh sách câu hỏi ngẫu nhiên mới
  const handleReshuffle = () => {
    const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : []
    generateSession(pool, categoryFilter, typeFilter, questionCount)
    toast.success('Đã trộn ngẫu nhiên bộ câu hỏi mới từ Ngân Hàng!')
  }

  const currentQ = questions[currentIndex]

  // Chọn đáp án trong Quiz mode
  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQ.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  // Chuyển câu tiếp theo
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setFillInputText('')
      setIsAnswered(false)
      setIsFlipped(false)
    } else {
      setIsFinished(true)
    }
  }

  // Lùi lại câu trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSelectedOption(null)
      setFillInputText('')
      setIsAnswered(false)
      setIsFlipped(false)
    }
  }

  // Đánh dấu bookmark
  const toggleBookmark = (id: string | number) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast.info('Đã bỏ lưu câu hỏi')
      } else {
        next.add(id)
        toast.success('Đã lưu câu hỏi vào danh sách ôn tập')
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6 pb-16 font-sans antialiased text-slate-900 dark:text-white">
      
      {/* Top Hero Banner Hiện Đại */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/40 dark:via-[#111625] dark:to-teal-950/30 shadow-xl shadow-emerald-500/5">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-gradient-to-tl from-cyan-500/20 via-blue-500/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 blur-md group-hover:opacity-75 transition-opacity" />
              <img src="/t05-logo.png" alt="T05 Logo" className="relative h-14 w-14 object-contain rounded-2xl p-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-md" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-red-500/15 to-amber-500/15 text-red-700 dark:text-red-300 border border-red-500/25 dark:border-red-800/40 uppercase tracking-wide">
                  T05 • ĐH Cảnh Sát Nhân Dân
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Luyện Đề Thông Minh & Flashcard 3D
                </span>
                {isFromBank && (
                  <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Ngân Hàng Trực Tuyến
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  Ôn Luyện Kiến Thức Pháp Luật CAND
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Hệ thống câu hỏi ngẫu nhiên chuẩn hóa T05 • Ôn nhanh bằng Thẻ Flashcard 3D hoặc Kiểm tra tính điểm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              onClick={handleReshuffle}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-white/90 dark:bg-slate-900/90 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
              title="Lấy ngẫu nhiên bộ câu hỏi khác"
            >
              <RealisticDice3DIcon size={16} />
              <span>Đổi Bộ Khác</span>
            </button>

            <button
              onClick={() => navigate('/question-bank')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all cursor-pointer"
            >
              <RealisticVault3DIcon size={16} />
              <span>Ngân Hàng Câu Hỏi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Điều Khiển Chế Độ & Bộ Lọc (Text to rõ, dễ đọc & Chỉnh cỡ chữ) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Hàng 1: Toggle Chế Độ Học & Chuyên đề & Quy mô */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          
          {/* Toggle Mode: Flashcard 3D vs Luyện Trắc Nghiệm vs Tự Luận & Án Lệ */}
          <div className="md:col-span-5 flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => {
                setLearningMode('FLASHCARD')
                setIsFlipped(false)
                if (typeFilter === 'ESSAY') {
                  setTypeFilter('ALL')
                  const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : []
                  generateSession(pool, categoryFilter, 'ALL', questionCount)
                }
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'FLASHCARD'
                  ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <RealisticFlashcard3DIcon size={18} />
              <span>Thẻ Flashcard 3D</span>
            </button>

            <button
              onClick={() => {
                setLearningMode('QUIZ')
                setSelectedOption(null)
                setIsAnswered(false)
                if (typeFilter === 'ESSAY') {
                  setTypeFilter('ALL')
                  const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : []
                  generateSession(pool, categoryFilter, 'ALL', questionCount)
                }
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'QUIZ'
                  ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <RealisticQuiz3DIcon size={18} />
              <span>Trắc Nghiệm</span>
            </button>

            <button
              onClick={() => {
                setLearningMode('ESSAY_STUDY')
                setTypeFilter('ESSAY')
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'ESSAY_STUDY'
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <RealisticEssay3DIcon size={18} />
              <span>Tự Luận & Án Lệ</span>
            </button>
          </div>

          {/* Filter Chuyên đề */}
          <div className={cn(learningMode === 'ESSAY_STUDY' ? "md:col-span-7" : "md:col-span-4")}>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(e.target.value, typeFilter, questionCount)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5d5fef]/40"
            >
              <option value="ALL">
                {learningMode === 'ESSAY_STUDY'
                  ? `Tất cả chuyên đề (${allEssayItems.length} bài tự luận)`
                  : `Tất cả chuyên đề (${rawBankQuestions.length} câu)`}
              </option>
              {availableCategories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Số lượng câu hỏi: Chỉ hiển thị khi là Trắc Nghiệm / Flashcard */}
          {learningMode !== 'ESSAY_STUDY' && (
            <div className="md:col-span-3 flex items-center justify-end gap-1.5">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-0.5">
                <RealisticScale3DIcon size={15} />
                <span>Quy mô:</span>
              </div>
              {[
                { label: '60 câu', val: 60 },
                { label: 'Toàn bộ', val: 500 }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => handleFilterChange(categoryFilter, typeFilter, item.val)}
                  className={cn(
                    "px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap",
                    questionCount === item.val
                      ? "bg-[#5d5fef] text-white shadow-xs ring-1 ring-[#5d5fef]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Hàng 2: Tách biệt các phân loại câu hỏi ôn luyện + BỘ CHỈNH CỠ CHỮ THÔNG MINH */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          
          {/* Khi ở chế độ TRẮC NGHIỆM hoặc FLASHCARD: Hiển thị bộ lọc Dạng bài (Tự luận không có dạng bài) */}
          {learningMode !== 'ESSAY_STUDY' ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 mr-1">
                <RealisticLayers3DIcon size={16} />
                <span>Dạng bài:</span>
              </div>

              {[
                { id: 'ALL', label: '1. Tất cả dạng' },
                { id: 'MC_CHOICE', label: '2. Trắc nghiệm A B C D' },
                { id: 'MC_SCENARIO', label: '3. Tình huống nghiệp vụ' },
                { id: 'MC_FILL', label: '4. Điền đáp án' },
              ].map((tab) => {
                const isActive = typeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterChange(categoryFilter, tab.id as QuizQuestionTypeFilter, questionCount)}
                    className={cn(
                      "px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1",
                      isActive
                        ? "bg-[#5d5fef] text-white shadow-xs ring-1 ring-[#5d5fef]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Khi ở chế độ TỰ LUẬN: ĐÃ XÓA DẠNG BÀI THEO YÊU CẦU, hiển thị badge chuyên mục */
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <RealisticEssay3DIcon size={16} />
                <span>Chuyên mục: Tự Luận & Án Lệ T05 (Mỗi khung là 1 bài ôn tập chuyên sâu)</span>
              </span>
            </div>
          )}

          {/* BỘ CHỈNH CỠ CHỮ TIỆN LỢI (A: Chuẩn, A+: To khuyên dùng, A++: Cực to) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-end sm:self-auto shrink-0">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 px-1.5 flex items-center gap-1">
              <RealisticTypography3DIcon size={15} />
              <span>Cỡ chữ:</span>
            </span>
            {[
              { id: 'normal', label: 'A', title: 'Cỡ chữ chuẩn (16px)' },
              { id: 'large', label: 'A+', title: 'Cỡ chữ to rõ ràng - Khuyên dùng (20px)' },
              { id: 'xlarge', label: 'A++', title: 'Cỡ chữ cực to (24px)' }
            ].map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => handleFontSizeChange(sz.id as any)}
                title={sz.title}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                  quizFontSize === sz.id
                    ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs ring-1 ring-slate-300 dark:ring-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {sz.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-[#5d5fef] animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang chọn ngẫu nhiên câu hỏi từ Ngân hàng đề...</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHẦN TỰ LUẬN: MỖI BÀI LÀ MỘT KHUNG CARD NHỎ HIỆN ĐẠI     */}
      {/* NHẤN "XEM TÀI LIỆU" MỞ TỜ GIẤY THI A4 ĐỀ BÀI & BÀI LÀM    */}
      {/* ========================================================= */}
      {!isLoading && learningMode === 'ESSAY_STUDY' && (
        <div className="space-y-6">
          {/* Thanh tiêu đề & tác vụ tổng quan */}
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="relative group shrink-0">
                <img 
                  src="/t05-logo.png" 
                  alt="ĐH Cảnh Sát Nhân Dân" 
                  className="h-10 w-10 object-contain rounded-xl p-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 shadow-sm" 
                />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Danh Sách Bài Nghị Luận & Án Lệ Chuẩn T05</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700">
                    {allEssayItems.length} bài
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Mỗi khung card đại diện cho một bài tự luận độc lập. Nhấn <strong className="text-emerald-600 dark:text-emerald-400 font-bold">"Xem tài liệu"</strong> để hiển thị tờ giấy A4 chuẩn Bộ Công An với đề bài và bài giải mẫu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-xs font-bold text-slate-500">
              <span className="hidden md:inline">Thang điểm:</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-extrabold text-[11px]">
                30 điểm / bài
              </span>
            </div>
          </div>

          {/* Lưới các khung card nhỏ gọn hiện đại (Mỗi bài là 1 khung card) */}
          {allEssayItems.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <RealisticEssay3DIcon size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  Chưa có bài văn nghị luận / tự luận nào trong Ngân hàng câu hỏi
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Hệ thống chỉ hiển thị các đề bài tự luận và bài văn mẫu có thật được lưu trong cơ sở dữ liệu. Vui lòng thêm đề bài trong Ngân hàng câu hỏi hoặc chọn chuyên đề khác.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadQuestionBankData}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Đồng bộ lại dữ liệu</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/question-bank')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RealisticVault3DIcon size={14} />
                  <span>Vào Ngân Hàng Câu Hỏi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              {allEssayItems.map((essay, idx) => {
                const isSaved = bookmarkedIds.has(essay.id)
                const draftText = essayDrafts[essay.id] || ''
                const wordCount = countWords(draftText)

                return (
                  <div
                    key={essay.id}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden"
                  >
                    {/* Vạch màu viền trái tinh tế */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-700" />

                    {/* Khối bên trái: Số thứ tự bài, logo T05 & Thang điểm */}
                    <div className="flex items-center gap-2 shrink-0">
                      <img
                        src="/t05-logo.png"
                        alt="ĐH Cảnh Sát Nhân Dân"
                        className="h-7 w-7 object-contain rounded-md shrink-0 border border-emerald-300/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-0.5 shadow-2xs"
                      />
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 whitespace-nowrap">
                        BÀI #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        30đ
                      </span>
                    </div>

                    {/* Khối giữa: Chuyên đề, Tiêu đề bài & Trích đoạn câu hỏi */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Hàng 1: Chuyên đề + Tiêu đề + Chỉ báo dàn ý */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {essay.category && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                            {essay.category}
                          </span>
                        )}
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {essay.title || `Bài Nghị Luận Tự Luận #${idx + 1}`}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden md:inline-flex items-center gap-1 shrink-0">
                          ✓ Dàn ý T05
                        </span>
                        {wordCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 shrink-0">
                            ✍️ {wordCount} từ
                          </span>
                        )}
                      </div>

                      {/* Hàng 2: Trích đoạn câu hỏi rút gọn 1 dòng */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-normal">
                        {cleanVietnameseTypography(essay.question)}
                      </p>
                    </div>

                    {/* Khối bên phải: Nút Xem Tài Liệu & Nút Hành Động nhỏ gọn */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(essay.id)}
                        className={cn(
                          "p-1.5 rounded-lg border transition-all cursor-pointer",
                          isSaved
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-600"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                        )}
                        title={isSaved ? "Bỏ lưu bài học" : "Lưu vào danh sách ôn tập"}
                      >
                        <RealisticRibbon3DIcon size={14} isSaved={isSaved} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(essay.question)
                          toast.success('Đã sao chép đề bài vào clipboard!')
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                        title="Sao chép đề bài"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedA4Essay(essay)
                          setIsA4DraftOpen(false)
                        }}
                        className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                      >
                        <span>Xem Tài Liệu</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODAL / XEM TÀI LIỆU NHƯ 1 TỜ GIẤY A4 CHUẨN BỘ CÔNG AN      */}
          {/* Ở TRÊN LÀ ĐỀ BÀI - Ở DƯỚI LÀ BÀI LÀM FORMAT RÕ RÀNG DỄ HỌC */}
          {/* ========================================================= */}
          {selectedA4Essay && (
            <div className="fixed inset-0 z-50 bg-white dark:bg-[#0b0f19] overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col items-center animate-in fade-in duration-200 font-sans">
              
              {/* THANH ĐIỀU KHIỂN NỔI (STICKY TOP ACTION BAR) */}
              <div className="w-full max-w-4xl flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-4 sticky top-2 z-20 no-print font-sans">
                {/* Nút quay lại & Điều hướng bài */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedA4Essay(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Quay Lại</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  {/* Chuyển bài trước / sau */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleA4Prev}
                      disabled={currentA4Idx <= 0}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                      title="Bài trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300 hidden sm:inline">
                      Bài {currentA4Idx + 1} / {allEssayItems.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleA4Next}
                      disabled={currentA4Idx >= allEssayItems.length - 1}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                      title="Bài tiếp theo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Các công cụ: Cỡ chữ, In, Copy, Vở nháp, Đóng */}
                <div className="flex items-center gap-2">
                  {/* Chỉnh Cỡ Chữ A | A+ | A++ */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-black">
                    {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleFontSizeChange(sz)}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                          quizFontSize === sz
                            ? "bg-white dark:bg-slate-900 text-emerald-700 shadow-xs border border-slate-200 dark:border-slate-600 font-black"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        {sz === 'normal' ? 'A' : sz === 'large' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>

                  {/* Nút Sao Chép Toàn Bộ Tài Liệu */}
                  <button
                    type="button"
                    onClick={() => handleCopyFullA4Document(selectedA4Essay)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Sao chép toàn bộ đề bài và bài làm"
                  >
                    {isCopiedA4 ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                    <span className="hidden md:inline">{isCopiedA4 ? 'Đã chép' : 'Sao Chép'}</span>
                  </button>

                  {/* Nút Xuất Ra File PDF Trực Tiếp (Tải về máy, không mở hộp thoại in) */}
                  <button
                    type="button"
                    disabled={isExportingPdf}
                    onClick={handleExportA4ToPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-60 transition-all cursor-pointer shadow-2xs"
                    title="Xuất trực tiếp file PDF về máy tính"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <RealisticPdf3DIcon size={18} />
                    )}
                    <span>{isExportingPdf ? 'Đang xuất PDF...' : 'Xuất ra file PDF'}</span>
                  </button>

                  {/* Nút Bật/Tắt Vở Nháp Viết Bài */}
                  <button
                    type="button"
                    onClick={() => setIsA4DraftOpen(!isA4DraftOpen)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border",
                      isA4DraftOpen
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    )}
                    title="Mở vở nháp để tự rèn luyện viết"
                  >
                    <RealisticNotebook3DIcon size={16} />
                    <span className="hidden md:inline">{isA4DraftOpen ? 'Đóng Nháp' : 'Vở Nháp'}</span>
                  </button>

                  {/* Nút đóng */}
                  <button
                    type="button"
                    onClick={() => setSelectedA4Essay(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer border border-transparent hover:border-slate-200"
                    title="Đóng cửa sổ"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* TỜ GIẤY THI A4 CHUẨN BỘ CÔNG AN (ĐỀ BÀI Ở TRÊN, BÀI LÀM Ở DƯỚI) */}
              {/* CHỈ KHUNG BÊN NGOÀI NÀY LÀ KHÔNG BO TRÒN (ROUNDED-NONE) ĐỂ MÔ PHỎNG TỜ GIẤY A4 THẬT */}
              <div
                id="a4-print-sheet"
                className="w-full max-w-4xl bg-white text-slate-900 shadow-xl rounded-none border border-slate-300 p-5 sm:p-8 relative font-sans select-text my-2"
              >
                {/* 1. QUỐC HIỆU & TIÊU NGỮ CHUẨN BỘ CÔNG AN (THIẾT KẾ HIỆN ĐẠI, NHỎ GỌN, TRANG TRỌNG) */}
                <div className="relative pb-2.5 border-b border-slate-200 font-sans">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-center sm:text-left">
                    {/* Cột trái: Cơ quan ban hành */}
                    <div className="space-y-0.5 w-full sm:w-auto text-center sm:text-left">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        BỘ CÔNG AN
                      </div>
                      <div className="text-xs sm:text-sm font-black uppercase text-[#064e3b] tracking-tight">
                        TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                        HỘI ĐỒNG TUYỂN SINH VĂN BẰNG 2 CAND
                      </div>
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Số: 05/TL-T05/2026 • Lưu hành nội bộ
                        </span>
                      </div>
                    </div>

                    {/* Cột phải: Quốc hiệu, Tiêu ngữ */}
                    <div className="space-y-0.5 w-full sm:w-auto text-center sm:text-right">
                      <div className="text-[11px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold text-slate-800 italic flex items-center justify-center sm:justify-end gap-1">
                        <span className="underline decoration-amber-500 decoration-1 underline-offset-2">
                          Độc lập - Tự do - Hạnh phúc
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 italic pt-0.5">
                        TP. Hồ Chí Minh, năm 2026
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KHUNG ĐIỂM SỐ VÀ LỜI PHÊ GIÁM KHẢO (BẢN THẨM ĐỊNH HIỆN ĐẠI, GỌN GÀNG, TINH TẾ) */}
                <div className="my-3 rounded-xl border border-slate-200/90 shadow-2xs bg-gradient-to-br from-slate-50/70 via-white to-emerald-50/25 overflow-hidden font-sans">
                  {/* Dải gradient trang trí phía trên */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700" />

                  <div className="grid grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    {/* Cột trái: Điểm số gọn gàng */}
                    <div className="col-span-12 sm:col-span-4 p-2.5 sm:p-3 flex flex-col items-center justify-center text-center space-y-1 bg-slate-50/40">
                      <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                        <RealisticRibbon3DIcon size={13} isSaved={true} />
                        <span>ĐIỂM SỐ CHÍNH THỨC</span>
                      </div>

                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                          30
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-400">
                          / 30
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100/90 text-emerald-900 border border-emerald-300/70 shadow-2xs">
                          Bằng chữ: Ba mươi điểm
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          Đạt chuẩn điểm tối đa T05
                        </span>
                      </div>
                    </div>

                    {/* Cột phải: Lời phê & Ký duyệt gọn gàng */}
                    <div className="col-span-12 sm:col-span-8 p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wide text-slate-700 flex items-center justify-between">
                          <span>LỜI PHÊ CỦA HỘI ĐỒNG CHẤM THI / GIẢNG VIÊN HƯỚNG DẪN</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                            Đã thẩm định
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs text-[11px] text-slate-700 italic leading-relaxed">
                          • Đạt chuẩn kiến thức lý luận và phương pháp lập luận theo hướng dẫn đáp án chuẩn T05; kết cấu chặt chẽ, luận cứ xác đáng, thể hiện tư duy nghiệp vụ và tư tưởng chính trị vững vàng.
                        </div>
                      </div>

                      {/* Hai ô ký tên CB chấm thi - hàng nhỏ gọn */}
                      <div className="grid grid-cols-2 gap-3 pt-1 text-[10px] text-slate-600 border-t border-slate-100">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 uppercase text-[9px]">CÁN BỘ CHẤM 1:</div>
                          <div className="text-slate-400 italic text-[9px]">(Ký & ghi rõ họ tên)</div>
                          <div className="text-[9px] text-slate-400 border-b border-dashed border-slate-300 pt-0.5">Giảng viên chấm 1: .....................</div>
                        </div>

                        <div className="space-y-0.5 text-right sm:text-left">
                          <div className="font-bold text-slate-800 uppercase text-[9px]">CÁN BỘ CHẤM 2:</div>
                          <div className="text-slate-400 italic text-[9px]">(Ký & ghi rõ họ tên)</div>
                          <div className="text-[9px] text-slate-400 border-b border-dashed border-slate-300 pt-0.5">Giảng viên chấm 2: .....................</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. TIÊU ĐỀ TÀI LIỆU VĂN BẰNG 2 (BANNER GỌN GÀNG, SANG TRỌNG) */}
                <div className="text-center py-2.5 space-y-1.5 border-b border-slate-200 font-sans">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-900">
                      TÀI LIỆU ÔN THI CHÍNH THỨC • TUYỂN SINH VĂN BẰNG 2 CAND
                    </span>
                  </div>

                  <h1 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 font-sans">
                    HƯỚNG DẪN BÀI THI TỰ LUẬN & ĐÁP ÁN MẪU CHUẨN T05
                  </h1>

                  {/* Thanh Badges Thông Tin Đề Thi Gọn Gàng */}
                  <div className="flex items-center justify-center flex-wrap gap-1.5 pt-0.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs flex items-center gap-1">
                      <span className="text-slate-500 font-medium">Chuyên đề:</span>
                      <strong className="text-emerald-900">{selectedA4Essay.category || 'Pháp luật CAND'}</strong>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs flex items-center gap-1">
                      <span className="text-slate-500 font-medium">Thang điểm:</span>
                      <strong className="text-amber-900">30 / 30 điểm</strong>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-2xs flex items-center gap-1">
                      <span className="text-slate-500 font-medium">Thời gian:</span>
                      <strong className="text-blue-900">90 phút</strong>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold border border-purple-200 shadow-2xs hidden sm:flex items-center gap-1">
                      <span className="text-slate-500 font-medium">Quy chuẩn:</span>
                      <strong className="text-purple-900">Đáp án chuẩn T05</strong>
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 4. Ở TRÊN LÀ ĐỀ BÀI (PHẦN I: ĐỀ BÀI VĂN NGHỊ LUẬN)        */}
                {/* IN TRỰC TIẾP NHƯ TRÊN TỜ GIẤY THI, CÂN ĐỐI VÀ TRANG TRỌNG */}
                {/* ========================================================= */}
                <div className="my-5 space-y-3 font-sans">
                  <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between font-sans">
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900 font-sans flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-700" />
                      PHẦN I. ĐỀ BÀI (CÂU HỎI TỰ LUẬN - THANG ĐIỂM 30 ĐIỂM)
                    </h2>
                    <span className="text-xs font-semibold text-slate-600 italic">
                      90 phút
                    </span>
                  </div>

                  <div className="py-1 text-slate-900 font-sans space-y-3">
                    <FormattedExamQuestionPrompt
                      question={selectedA4Essay.question}
                      fontSize={quizFontSize}
                    />

                    <div className="text-xs text-slate-600 italic pt-2.5 border-t border-dashed border-slate-200 flex items-start gap-1.5 font-sans">
                      <span className="font-bold text-slate-800 not-italic shrink-0">* Yêu cầu làm bài:</span>
                      <span className="text-justify leading-relaxed">
                        Thí sinh viết bài văn nghị luận hoàn chỉnh (tối thiểu 500 từ), kết cấu 3 phần Mở bài - Thân bài - Kết bài; lập luận chặt chẽ, lý lẽ sắc bén, dẫn chứng thuyết phục gắn liền với chức năng, nhiệm vụ bảo vệ an ninh trật tự của lực lượng CAND.
                      </span>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 5. Ở DƯỚI LÀ BÀI LÀM (PHẦN II: DÀN Ý & BÀI LÀM MẪU)        */}
                {/* NỘI DUNG CHẢY TỰ NHIÊN NHƯ BÀI VIẾT TRÊN TRANG GIẤY HỌC   */}
                {/* ========================================================= */}
                <div className="my-6 space-y-3 font-sans">
                  <div className="border-b-2 border-slate-900 pb-1 flex items-center justify-between font-sans">
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 font-sans">
                      PHẦN II. BÀI LÀM & ĐÁP ÁN GỢI Ý CHUẨN T05
                    </h2>
                    <span className="text-xs font-bold text-emerald-800 font-sans">
                      Điểm tối đa: 30/30
                    </span>
                  </div>

                  {/* Nội dung bài làm phân cấp tự nhiên như trang giáo trình / bài thi */}
                  <FormattedEssayContent
                    content={selectedA4Essay.sampleEssay || selectedA4Essay.explanation}
                    fontSize={quizFontSize}
                  />

                  {/* Căn cứ pháp lý theo kiểu trích dẫn văn bản học thuật */}
                  {selectedA4Essay.legalReference && (
                    <div className="mt-8 pt-3 border-t border-slate-300 text-xs sm:text-sm font-sans text-slate-700 space-y-1">
                      <div className="font-bold uppercase tracking-wider text-slate-900 text-[11px] sm:text-xs">
                        ❖ CĂN CỨ PHÁP LÝ & TÀI LIỆU ĐỐI CHIẾU:
                      </div>
                      <div className="italic text-slate-800 pl-4">
                        {cleanVietnameseTypography(selectedA4Essay.legalReference)}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. CHÂN TỜ GIẤY THI: KÝ DUYỆT CỦA CÁN BỘ CHẤM THI */}
                <div className="mt-10 pt-5 border-t-2 border-slate-900 flex items-start justify-between text-xs text-slate-700 font-sans">
                  <div className="space-y-1">
                    <div className="font-bold uppercase text-slate-800">CÁN BỘ CHẤM THI 1:</div>
                    <div className="italic text-slate-500 text-[11px]">(Ký và ghi rõ họ tên)</div>
                    <div className="h-12 flex items-end">
                      <span className="text-[11px] text-slate-400">Giảng viên chấm 1: .............................</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      ---------------- HẾT ----------------
                    </div>
                    <div className="italic text-[10px] text-slate-500">
                      (Cán bộ chấm thi không giải thích gì thêm)
                    </div>
                    <div className="text-[10px] text-slate-400 pt-2">
                      Tài liệu lưu hành nội bộ Trường Đại học Cảnh Sát Nhân Dân
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-bold uppercase text-slate-800">CÁN BỘ CHẤM THI 2:</div>
                    <div className="italic text-slate-500 text-[11px]">(Ký và ghi rõ họ tên)</div>
                    <div className="h-12 flex items-end justify-end">
                      <span className="text-[11px] text-slate-400">Giảng viên chấm 2: .............................</span>
                    </div>
                  </div>
                </div>

                {/* 7. DÒNG ĐÁNH SỐ TRANG A4 */}
                <div className="text-center text-[10px] text-slate-400 pt-4 font-sans">
                  Tờ giấy thi A4 số {String(currentA4Idx + 1).padStart(2, '0')} • Trang 1/1 • Trường Đại học Cảnh Sát Nhân Dân T05
                </div>
              </div>

              {/* ========================================================= */}
              {/* KHUNG VỞ NHÁP LUYỆN VIẾT BÊN DƯỚI TỜ GIẤY A4 (NẾU MỞ)       */}
              {/* ========================================================= */}
              {isA4DraftOpen && (
                <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-none p-5 sm:p-7 shadow-md space-y-3.5 my-4 no-print animate-in fade-in duration-200 font-sans">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                    <div className="flex items-center gap-2">
                      <RealisticNotebook3DIcon size={20} />
                      <h3 className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200 uppercase font-sans">
                        Vở Nháp Luyện Viết Dành Cho Học Viên
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className={cn(
                        "px-3 py-1 rounded-none font-black",
                        countWords(essayDrafts[selectedA4Essay.id] || '') >= 500
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200 dark:border-indigo-800"
                      )}>
                        {countWords(essayDrafts[selectedA4Essay.id] || '')} từ {countWords(essayDrafts[selectedA4Essay.id] || '') < 500 ? '(Đề xuất: ≥ 500 từ)' : '✓ Đạt chuẩn dung lượng'}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        ● Tự động lưu
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={essayDrafts[selectedA4Essay.id] || ''}
                    onChange={(e) => handleDraftChange(selectedA4Essay.id, e.target.value)}
                    placeholder="Thực hành lập dàn ý hoặc viết bài văn tự luận của bạn tại đây để đối chiếu với đáp án mẫu T05 ở trên..."
                    className="w-full p-4 sm:p-5 rounded-none bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm sm:text-base leading-relaxed resize-y font-sans"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      Bản nháp được lưu tự động trên trình duyệt của bạn.
                    </span>
                    {(essayDrafts[selectedA4Essay.id] || '').trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa bản nháp của bài tự luận này?')) {
                            handleDraftChange(selectedA4Essay.id, '')
                            toast.info('Đã xóa bản nháp')
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Xóa Bản Nháp
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* PHẦN TRẮC NGHIỆM & FLASHCARD: KHI KHÔNG CÓ CÂU HỎI        */}
      {/* ========================================================= */}
      {!isLoading && learningMode !== 'ESSAY_STUDY' && !isFinished && questions.length === 0 && (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <RealisticVault3DIcon size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
              Chưa có câu hỏi phù hợp trong cơ sở dữ liệu
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Không tìm thấy câu hỏi nào cho bộ lọc hiện tại. Toàn bộ câu hỏi được tải trực tiếp từ cơ sở dữ liệu.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleFilterChange('ALL', 'ALL', questionCount)}
              className="px-4 py-2 rounded-xl bg-[#5d5fef] hover:bg-[#4d4fdf] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xem Tất Cả Câu Hỏi</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHẦN TRẮC NGHIỆM & FLASHCARD: THEO CÂU HỎI STEPPER        */}
      {/* ========================================================= */}
      {!isLoading && learningMode !== 'ESSAY_STUDY' && !isFinished && questions.length > 0 && currentQ && (
        <div className="space-y-6">

          {/* Thanh Tiến Trình Học */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span>Câu {currentIndex + 1} / {questions.length}</span>
                {currentQ.category && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentQ.category}
                  </span>
                )}
              </div>
              <div>
                {learningMode === 'QUIZ' && (
                  <span className="text-emerald-600 font-black">Chính xác: {score} câu</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5d5fef] to-[#ff7a00] rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CHẾ ĐỘ 1: THẺ FLASHCARD 3D THÔNG MINH                      */}
          {/* ========================================================= */}
          {learningMode === 'FLASHCARD' && (
            <div className="space-y-5">
              
              {/* Card lật tương tác 3D */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[340px] w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/30 dark:shadow-none p-6 md:p-8 cursor-pointer select-none transition-all duration-300 hover:border-[#5d5fef]/50 hover:shadow-lg flex flex-col justify-between"
              >
                {/* Góc trên: Badge & Bookmark */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-[#5d5fef]/10 text-[#5d5fef]">
                      {isFlipped ? 'Mặt Sau: Đáp Án Đúng' : 'Mặt Trước: Câu Hỏi'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      (Nhấp vào thẻ để lật)
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(currentQ.id)
                    }}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      bookmarkedIds.has(currentQ.id)
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                    )}
                    title="Lưu câu hỏi ôn tập"
                  >
                    <RealisticRibbon3DIcon size={16} isSaved={bookmarkedIds.has(currentQ.id)} />
                  </button>
                </div>

                {/* Nội dung Mặt Trước / Mặt Sau */}
                <div className="my-6">
                  {!isFlipped ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border",
                          currentQ.questionType === 'ESSAY'
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : currentQ.questionType === 'MC_SCENARIO'
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            : currentQ.questionType === 'MC_FILL'
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        )}>
                          {currentQ.questionType === 'ESSAY'
                            ? '5. Tự luận & Án lệ'
                            : currentQ.questionType === 'MC_SCENARIO'
                            ? '3. Tình huống nghiệp vụ'
                            : currentQ.questionType === 'MC_FILL'
                            ? '4. Trắc nghiệm điền đáp án'
                            : '2. Trắc nghiệm A B C D'}
                        </span>
                        {currentQ.title && (
                          <span className="text-xs font-bold text-slate-500">
                            • {currentQ.title}
                          </span>
                        )}
                      </div>

                      {/* Hiển thị nội dung câu hỏi: nếu là điền đáp án thì thay thế chỗ trống bằng text đã nhập */}
                      {currentQ.questionType === 'MC_FILL' ? (
                        (() => {
                          const blankRegex = /(_+[\s_]*_+|\.{3,})/g
                          const hasBlank = blankRegex.test(currentQ.question)
                          
                          return (
                            <div className="space-y-4">
                              <h2 className={cn(
                                "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                                quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                              )}>
                                {hasBlank ? (
                                  (() => {
                                    const parts = currentQ.question.split(/(_+[\s_]*_+|\.{3,})/)
                                    return parts.map((part, pIdx) => {
                                      if (/^(_+[\s_]*_+|\.{3,})$/.test(part.trim())) {
                                        return (
                                          <span
                                            key={pIdx}
                                            className={cn(
                                              "inline-block mx-1.5 px-3 py-1 rounded-lg border-b-2 font-black transition-all",
                                              fillInputText.trim()
                                                ? "bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-900 dark:text-amber-200"
                                                : "border-slate-400 dark:border-slate-500 text-slate-400 dark:text-slate-500 italic"
                                            )}
                                          >
                                            {fillInputText.trim() || '__________'}
                                          </span>
                                        )
                                      }
                                      return <span key={pIdx}>{part}</span>
                                    })
                                  })()
                                ) : (
                                  <span>
                                    {currentQ.question}{' '}
                                    <span className="inline-block mx-1.5 px-3 py-1 rounded-lg border-b-2 border-amber-500 bg-amber-100 dark:bg-amber-950/70 font-black text-amber-900 dark:text-amber-200">
                                      {fillInputText.trim() || '__________'}
                                    </span>
                                  </span>
                                )}
                              </h2>

                              {/* Ô nhập text trực tiếp cho người học */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-400/40 space-y-2.5"
                              >
                                <label className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                  <span>✍️ Nhập đáp án điền vào chỗ trống:</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={fillInputText}
                                    onChange={(e) => setFillInputText(e.target.value)}
                                    placeholder="Gõ từ hoặc cụm từ cần điền vào đây..."
                                    className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                  />
                                  {fillInputText && (
                                    <button
                                      type="button"
                                      onClick={() => setFillInputText('')}
                                      className="px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                                  Nội dung bạn nhập sẽ lập tức hiển thị tại vị trí gạch ngang ở đề bài.
                                </p>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <h2 className={cn(
                          "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                          quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                        )}>
                          {currentQ.question}
                        </h2>
                      )}

                      {/* Hiển thị các phương án tham khảo cho trắc nghiệm A B C D hoặc tình huống */}
                      {currentQ.questionType !== 'MC_FILL' && currentQ.options && currentQ.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                          {currentQ.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-medium text-slate-800 dark:text-slate-200 leading-relaxed",
                                quizFontSize === 'normal' ? "text-xs sm:text-sm" : quizFontSize === 'large' ? "text-sm sm:text-base" : "text-base sm:text-lg"
                              )}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Thông báo gợi ý cho câu hỏi tự luận */}
                      {currentQ.questionType === 'ESSAY' && (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                          <p className="font-bold flex items-center gap-1.5">
                            <RealisticEssay3DIcon size={16} />
                            Gợi ý làm bài tự luận:
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                            Hãy chuẩn bị ý trả lời hoặc ghi chép luận điểm chính trước khi lật mặt sau để đối chiếu dàn ý và bài viết mẫu chuẩn T05.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200 py-2">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        ✓ {currentQ.questionType === 'ESSAY' ? 'Dàn ý & Bài viết mẫu tham khảo' : 'Đáp án chính xác'}
                      </span>

                      {currentQ.questionType === 'ESSAY' ? (
                        <div className={cn(
                          "p-5 sm:p-7 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/40 text-slate-800 dark:text-slate-100 space-y-3 whitespace-pre-line leading-loose max-h-[460px] overflow-y-auto",
                          quizFontSize === 'normal' ? "text-sm sm:text-base" : quizFontSize === 'large' ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"
                        )}>
                          {currentQ.sampleEssay || currentQ.explanation || 'Đang cập nhật hướng dẫn trả lời chi tiết cho đề tài này.'}
                        </div>
                      ) : (
                        <div className={cn(
                          "p-5 sm:p-7 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/40 font-black text-emerald-900 dark:text-emerald-200 leading-relaxed",
                          quizFontSize === 'normal' ? "text-base sm:text-xl" : quizFontSize === 'large' ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl sm:text-3xl md:text-4xl"
                        )}>
                          {currentQ.options[currentQ.correctAnswer] || currentQ.textAnswer || 'Đáp án đang cập nhật'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chân Thẻ: Nút điều khiển lùi / tiến */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(!isFlipped)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5d5fef] hover:underline cursor-pointer"
                  >
                    {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{isFlipped ? 'Xem lại câu hỏi' : 'Xem đáp án'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrev()
                      }}
                      disabled={currentIndex === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Câu Trước</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNext()
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#5d5fef]/20 transition-all cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CHẾ ĐỘ 2: LUYỆN TRẮC NGHIỆM ĐÁNH GIÁ ĐIỂM                    */}
          {/* ========================================================= */}
          {learningMode === 'QUIZ' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
              
              {/* Nội dung câu hỏi */}
              <div className="p-5 md:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#5d5fef] block">
                    {currentQ.title || 'Câu hỏi lý thuyết trọng tâm'}
                  </span>
                  <h2 className={cn(
                    "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                    quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                  )}>
                    {currentQ.question}
                  </h2>
                </div>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={cn(
                    "p-2.5 rounded-xl border shrink-0 transition-all cursor-pointer",
                    bookmarkedIds.has(currentQ.id)
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "border-slate-200 dark:border-slate-700 text-slate-400"
                  )}
                  title="Lưu câu hỏi"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>

              {/* Các phương án trả lời hoặc ô nhập điền đáp án */}
              {currentQ.questionType === 'MC_FILL' ? (
                <div className="space-y-4 pt-2">
                  <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-400/40 space-y-3.5">
                    <label className={cn(
                      "font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5",
                      quizFontSize === 'normal' ? "text-sm" : quizFontSize === 'large' ? "text-base" : "text-lg"
                    )}>
                      <span>✍️ Nhập đáp án vào chỗ trống:</span>
                    </label>
                    
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={fillInputText}
                        disabled={isAnswered}
                        onChange={(e) => setFillInputText(e.target.value)}
                        placeholder="Gõ đáp án chính xác..."
                        className={cn(
                          "flex-1 px-5 py-3 font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                          quizFontSize === 'normal' ? "text-base" : quizFontSize === 'large' ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                        )}
                      />

                      {!isAnswered ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!fillInputText.trim()) {
                              toast.warning('Vui lòng nhập đáp án trước khi xác nhận!')
                              return
                            }
                            setIsAnswered(true)
                            const userAns = fillInputText.trim().toLowerCase()
                            const expected = (currentQ.textAnswer || currentQ.options[currentQ.correctAnswer] || '').toLowerCase()
                            if (userAns && expected && (expected.includes(userAns) || userAns.includes(expected))) {
                              setScore(prev => prev + 1)
                              toast.success('Chính xác!')
                            } else {
                              toast.error('Chưa chính xác!')
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base font-bold shadow-xs cursor-pointer transition-all"
                        >
                          Kiểm Tra
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAnswered(false)
                            setFillInputText('')
                          }}
                          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Nhập lại
                        </button>
                      )}
                    </div>

                    {isAnswered && (
                      <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-300/60 dark:border-amber-700/60 space-y-1.5 animate-in fade-in duration-200">
                        <span className={cn(
                          "font-black text-emerald-600 dark:text-emerald-400 block",
                          quizFontSize === 'normal' ? "text-sm sm:text-base" : quizFontSize === 'large' ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                        )}>
                          ✓ Đáp án chuẩn: {currentQ.textAnswer || currentQ.options[currentQ.correctAnswer] || 'Đang cập nhật'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === currentQ.correctAnswer

                    let styleClass = "border-slate-200 dark:border-slate-800 hover:border-[#5d5fef]/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"

                    if (isAnswered) {
                      if (isCorrect) {
                        styleClass = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                      } else if (isSelected && !isCorrect) {
                        styleClass = "border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold"
                      } else {
                        styleClass = "border-slate-100 dark:border-slate-800/60 opacity-50"
                      }
                    } else if (isSelected) {
                      styleClass = "border-[#5d5fef] bg-[#5d5fef]/5 text-[#5d5fef]"
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        className={cn(
                          "w-full text-left p-4 sm:p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 cursor-pointer leading-relaxed",
                          quizFontSize === 'normal' ? "text-base font-medium" : quizFontSize === 'large' ? "text-lg md:text-xl font-semibold" : "text-xl md:text-2xl font-semibold",
                          styleClass
                        )}
                      >
                        <span className={cn(
                          "rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black shrink-0 shadow-xs border border-slate-200 dark:border-slate-700",
                          quizFontSize === 'normal' ? "h-7 w-7 text-xs" : quizFontSize === 'large' ? "h-9 w-9 text-base" : "h-11 w-11 text-lg"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-0.5">{opt}</span>

                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Nút tiếp theo */}
              {isAnswered && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-sm sm:text-base font-bold shadow-md shadow-[#5d5fef]/30 transition-all cursor-pointer"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MÀN HÌNH KẾT QUẢ KHI HOÀN THÀNH PHIÊN HỌC                  */}
      {/* ========================================================= */}
      {!isLoading && isFinished && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Hoàn Thành Phiên Ôn Luyện!
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Bạn đã hoàn thành phiên học với {questions.length} câu hỏi trắc nghiệm ngẫu nhiên.
            </p>
          </div>

          {/* Thống kê điểm */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-2xl md:text-3xl font-black text-[#5d5fef]">
                {score} / {questions.length}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                {learningMode === 'QUIZ' ? 'Câu trả lời đúng' : 'Số câu đã xem'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-2xl md:text-3xl font-black text-emerald-600">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                Tỷ lệ chính xác
              </div>
            </div>
          </div>

          {/* Hành động tiếp theo */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReshuffle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đổi Bộ Khác Ôn Tiếp</span>
            </button>

            <button
              onClick={() => navigate('/question-bank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs font-bold shadow-sm shadow-[#5d5fef]/30 transition-all cursor-pointer"
            >
              <span>Vào Ngân Hàng Câu Hỏi</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default QuizPage
