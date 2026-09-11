import { useState, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileUp,
  FileText,
  Clock,
  Check,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Hash,
  RefreshCw,
  AlertCircle,
  Trash2,
  BookOpen,
  Quote,
  PenTool,
  Edit3,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn, cleanQuestionText, cleanOptionText, formatSituationalParagraphs } from '@/lib/utils'
import type { ExamRoom, MultipleChoiceQuestion, EssayQuestion } from '../types'
import { examApi } from '@/services/examApi'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newRoom: ExamRoom) => void
}

type ParseStatus = 'IDLE' | 'UPLOADING' | 'PARSING' | 'COMPLETED' | 'ERROR'

// ==========================================
// TỐI ƯU HIỆU NĂNG: COMPONENT RENDER TỪNG CÂU HỎI TRẮC NGHIỆM ĐƯỢC MEMO HÓA
// Giúp render mượt mà 60 câu hỏi mà không giật lag khi nhập form
// ==========================================
interface MCQuestionItemProps {
  mc: MultipleChoiceQuestion
  index: number
  isHighlighted?: boolean
  onUpdateAnswer: (id: string, val: string) => void
  onEdit: (mc: MultipleChoiceQuestion) => void
  onDelete: (id: string, orderNumber: number) => void
}

const MCQuestionItem = memo(function MCQuestionItem({
  mc,
  index,
  isHighlighted,
  onUpdateAnswer,
  onEdit,
  onDelete
}: MCQuestionItemProps) {
  const hasOptions = Array.isArray(mc.options) && mc.options.length > 0
  const hasAnswer = Boolean(mc.correctAnswer && mc.correctAnswer.trim().length > 0)

  return (
    <div
      id={`mc-card-${mc.id || index + 1}`}
      className={cn(
        "p-3.5 rounded-xl border text-xs space-y-2.5 transition-all duration-200",
        isHighlighted
          ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/70 shadow-md scale-[1.005]"
          : !hasAnswer
            ? "border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20"
            : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
      )}
    >
      {/* Header của thẻ câu hỏi kèm nút Sửa & Xóa */}
      <div className="flex items-center justify-between text-[11px] font-bold flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
            Câu {mc.order || index + 1}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {hasOptions ? 'Trắc nghiệm 4 lựa chọn' : 'Trả lời ngắn / Điền khuyết'}
          </span>

          {hasAnswer ? (
            <span className="font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Check className="h-3 w-3 stroke-[3]" />
              <span>Đáp án: <strong>{mc.correctAnswer}</strong></span>
            </span>
          ) : (
            <span className="font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 font-bold">
              <AlertCircle className="h-3 w-3 stroke-[2.5]" />
              <span>CHƯA CHỌN ĐÁP ÁN</span>
            </span>
          )}
        </div>

        {/* Action buttons: SỬA & XÓA */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onEdit(mc)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition-colors cursor-pointer"
            title="Chỉnh sửa nội dung, phương án và đáp án câu này"
          >
            <Edit3 className="h-3 w-3" />
            <span>Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(mc.id, mc.order || index + 1)}
            className="inline-flex items-center gap-1 p-1 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
            title="Xóa câu hỏi này khỏi đề thi"
          >
            <Trash2 className="h-3 w-3" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {mc.context && (
        <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800 text-[11.5px] leading-relaxed w-full">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Tình huống áp dụng:</span>
          </div>
          <div className="space-y-1.5 text-justify sm:text-left leading-relaxed text-slate-900 dark:text-slate-100">
            {formatSituationalParagraphs(mc.context).map((para, pIdx) => (
              <p key={pIdx} className="w-full leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="font-semibold text-slate-900 dark:text-white leading-relaxed text-xs sm:text-sm">
        {cleanQuestionText(mc.question)}
      </p>
      
      {hasOptions ? (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block">
            Chọn phương án đúng cho câu này:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {mc.options!.map((opt) => {
              const isSelected = Boolean(mc.correctAnswer && mc.correctAnswer.trim().length > 0 && opt.label.trim().toUpperCase() === mc.correctAnswer.trim().toUpperCase())
              return (
                <button
                  key={opt.id || opt.label}
                  type="button"
                  onClick={() => onUpdateAnswer(mc.id, opt.label)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-2.5 group w-full",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-medium ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20"
                  )}
                >
                  <span className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5",
                    isSelected
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600"
                  )}>
                    {opt.label}
                  </span>
                  <span className="flex-1 text-xs leading-snug">{cleanOptionText(opt.text, opt.label)}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded shrink-0">
                      ĐÚNG
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className={cn(
          "p-3 rounded-xl border text-xs space-y-2",
          hasAnswer
            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
            : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
        )}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Đáp án đúng (Câu trả lời ngắn):
            </span>
            {!hasAnswer && (
              <span className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                * Bắt buộc nhập đáp án
              </span>
            )}
          </div>
          <input
            type="text"
            value={mc.correctAnswer || ''}
            onChange={(e) => onUpdateAnswer(mc.id, e.target.value)}
            placeholder="Nhập đáp án chuẩn cho câu trả lời ngắn này..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {mc.explanation && (
        <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
          <strong>Giải thích:</strong> {mc.explanation}
        </div>
      )}
    </div>
  )
})

export function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
  // Form fields cơ bản
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(() => `CAND-${Math.floor(1000 + Math.random() * 9000)}`)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [description, setDescription] = useState('Đề thi sát hạch lý thuyết trắc nghiệm và bài văn nghị luận tư tưởng nghiệp vụ CAND.')

  // Trạng thái tệp từ PC cho Import Trắc Nghiệm
  const [uploadedMCFileName, setUploadedMCFileName] = useState<string>('')
  const [mcParseStatus, setMcParseStatus] = useState<ParseStatus>('IDLE')
  const [mcParseMessage, setMcParseMessage] = useState('')

  // Input ref duyệt tệp trắc nghiệm từ PC
  const mcFileInputRef = useRef<HTMLInputElement>(null)

  // Dữ liệu câu hỏi trắc nghiệm đã nạp
  const [extractedMC, setExtractedMC] = useState<MultipleChoiceQuestion[]>([])
  const [activeTab, setActiveTab] = useState<'MC' | 'ESSAY'>('MC')

  // Bộ lọc & tìm kiếm câu hỏi trắc nghiệm
  const [mcFilter, setMcFilter] = useState<'ALL' | 'UNANSWERED' | 'ANSWERED'>('ALL')
  const [mcSearch, setMcSearch] = useState('')

  // Phân trang & Ma trận chuyển nhanh câu hỏi (Mặc định hiển thị toàn bộ 1 trang liên tục, có thể chọn phân trang nếu muốn)
  const [mcPage, setMcPage] = useState(1)
  const [mcPageSize, setMcPageSize] = useState<number>(9999)
  const [highlightedMcId, setHighlightedMcId] = useState<string | null>(null)
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(true)

  // Thang điểm phần trắc nghiệm (Chuẩn CAND 70 điểm)
  const [mcMaxScore, setMcMaxScore] = useState(70)

  // Đề bài duy nhất cho phần Văn Nghị Luận Tự Luận (30 điểm)
  const [essayTitle, setEssayTitle] = useState('')
  const [essayContext, setEssayContext] = useState('')
  const [essayPrompt, setEssayPrompt] = useState('')
  const [essayMaxScore, setEssayMaxScore] = useState(30)

  // State chỉnh sửa câu hỏi trắc nghiệm (Modal Sửa)
  const [editingMCQuestion, setEditingMCQuestion] = useState<MultipleChoiceQuestion | null>(null)
  const [editMCQuestionText, setEditMCQuestionText] = useState('')
  const [editMCOptA, setEditMCOptA] = useState('')
  const [editMCOptB, setEditMCOptB] = useState('')
  const [editMCOptC, setEditMCOptC] = useState('')
  const [editMCOptD, setEditMCOptD] = useState('')
  const [editMCCorrectAnswer, setEditMCCorrectAnswer] = useState('')
  const [editMCExplanation, setEditMCExplanation] = useState('')
  const [editMCLegalReference, setEditMCLegalReference] = useState('')
  const [editMCIsShortAnswer, setEditMCIsShortAnswer] = useState(false)

  // Trạng thái đang gửi API lên máy chủ Spring Boot
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format kích thước tệp
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Sinh mã phòng thi ngẫu nhiên
  const handleRegenerateCode = () => {
    setCode(`CA4-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  // Đặt lại toàn bộ dữ liệu đề thi
  const handleResetAll = useCallback(() => {
    setExtractedMC([])
    setUploadedMCFileName('')
    setMcParseStatus('IDLE')
    setMcParseMessage('')
    setMcMaxScore(70)
    setEssayTitle('')
    setEssayContext('')
    setEssayPrompt('')
    setEssayMaxScore(30)
  }, [])

  // 1. IMPORT TRẮC NGHIỆM TỪ TỆP CHỌN TRÊN PC
  const handleMCFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedMCFileName(file.name)
    setMcParseStatus('UPLOADING')
    setMcParseMessage(`Đang tải tệp "${file.name}" (${formatFileSize(file.size)})...`)

    try {
      setMcParseStatus('PARSING')
      setMcParseMessage('Hệ thống đang phân tích và bóc tách cấu trúc đề thi...')
      const result = await examApi.parseDocument(file, 'MC_ONLY')

      setMcParseStatus('COMPLETED')
      setMcParseMessage(`Đã bóc tách thành công từ tệp "${file.name}"!`)

      const mcList = (result.multipleChoiceQuestions || []).map((mc: any, idx: number) => ({
        id: mc.id || `mc-${idx + 1}`,
        order: mc.order || idx + 1,
        question: mc.question,
        context: mc.context || '',
        options: mc.options || [],
        correctAnswer: '', // Không mặc định, để user tự chọn đáp án đúng
        explanation: mc.explanation || '',
        legalReference: mc.legalReference || ''
      }))

      if (mcList.length === 0) {
        setMcParseStatus('ERROR')
        setMcParseMessage('Không tìm thấy câu hỏi trắc nghiệm nào trong tệp!')
        alert('Không tìm thấy câu hỏi trắc nghiệm nào trong tệp. Vui lòng kiểm tra lại định dạng tệp!')
        return
      }

      setExtractedMC(mcList)
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setTitle(result.extractedTitle || `Đề Sát Hạch: ${cleanName}`)
      }
      if (result.suggestedDurationMinutes && result.suggestedDurationMinutes > 0) {
        setDurationMinutes(result.suggestedDurationMinutes)
      }
    } catch (err: any) {
      console.warn('Lỗi khi bóc tách tệp trắc nghiệm:', err)
      setMcParseStatus('ERROR')
      setMcParseMessage(err.response?.data?.message || 'Không thể bóc tách tệp trắc nghiệm!')
      alert(err.response?.data?.message || 'Không thể bóc tách tệp trắc nghiệm!')
    } finally {
      e.target.value = ''
    }
  }


  // Nạp lại mẫu đề bài văn nghị luận chuẩn Hồ Chí Minh về thanh niên
  const handleQuickFillEssay = useCallback(() => {
    setEssayTitle('PHẦN I: TỰ LUẬN (30 điểm)')
    setEssayContext('Chủ tịch Hồ Chí Minh khẳng định: “Tương lai thuộc về thanh niên. Tương lai là cách mạng luôn tiến lên. Là chủ của tương lai, thanh niên không thể không có lý tưởng cao cả. Vì vậy thanh niên phải có cuộc sống chính trị tích cực và cách mạng.”. \n(Hồ Chí Minh toàn tập, Tập 12. NXB Chính trị quốc gia - Sự thật, 2011, trang 519)')
    setEssayPrompt('Anh/chị hãy viết một bài nghị luận (tối thiểu 500 chữ) trình bày cách hiểu của mình về nội dung đoạn trích trên và liên hệ với vai trò của thanh niên trong giai đoạn hiện nay.')
    setEssayMaxScore(30)
  }, [])

  // Cập nhật đáp án đúng cho từng câu trắc nghiệm / điền khuyết
  const handleUpdateMCCorrectAnswer = useCallback((id: string, val: string) => {
    setExtractedMC(prev => prev.map(q => q.id === id ? { ...q, correctAnswer: val } : q))
  }, [])

  // Mở modal sửa câu hỏi trắc nghiệm
  const handleOpenEditMC = useCallback((mc: MultipleChoiceQuestion) => {
    setEditingMCQuestion(mc)
    setEditMCQuestionText(mc.question)
    const hasOpts = Array.isArray(mc.options) && mc.options.length > 0
    setEditMCIsShortAnswer(!hasOpts)
    
    const optA = mc.options?.find(o => o.label.toUpperCase() === 'A')?.text || ''
    const optB = mc.options?.find(o => o.label.toUpperCase() === 'B')?.text || ''
    const optC = mc.options?.find(o => o.label.toUpperCase() === 'C')?.text || ''
    const optD = mc.options?.find(o => o.label.toUpperCase() === 'D')?.text || ''
    
    setEditMCOptA(optA)
    setEditMCOptB(optB)
    setEditMCOptC(optC)
    setEditMCOptD(optD)
    setEditMCCorrectAnswer(mc.correctAnswer || '')
    setEditMCExplanation(mc.explanation || '')
    setEditMCLegalReference(mc.legalReference || '')
  }, [])

  // Lưu chỉnh sửa câu hỏi trắc nghiệm
  const handleSaveEditMC = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMCQuestion) return

    if (!editMCQuestionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!')
      return
    }

    let updatedOptions = editingMCQuestion.options || []
    if (!editMCIsShortAnswer) {
      if (!editMCOptA.trim() || !editMCOptB.trim()) {
        alert('Câu trắc nghiệm 4 lựa chọn cần ít nhất phương án A và B!')
        return
      }
      updatedOptions = [
        { id: 'opt-a', label: 'A', text: editMCOptA.trim() },
        { id: 'opt-b', label: 'B', text: editMCOptB.trim() },
        { id: 'opt-c', label: 'C', text: editMCOptC.trim() || 'Không có phương án bổ sung.' },
        { id: 'opt-d', label: 'D', text: editMCOptD.trim() || 'Không có phương án bổ sung.' }
      ]
    } else {
      updatedOptions = []
    }

    setExtractedMC(prev => prev.map(q => {
      if (q.id === editingMCQuestion.id) {
        return {
          ...q,
          question: editMCQuestionText.trim(),
          options: updatedOptions,
          correctAnswer: editMCCorrectAnswer.trim(),
          explanation: editMCExplanation.trim(),
          legalReference: editMCLegalReference.trim()
        }
      }
      return q
    }))

    setEditingMCQuestion(null)
  }

  // Xóa 1 câu hỏi trắc nghiệm
  const handleDeleteMC = useCallback((id: string, orderNumber: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Câu ${orderNumber} khỏi danh sách đề thi?`)) return
    setExtractedMC(prev => 
      prev
        .filter(q => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 }))
    )
  }, [])

  // Thống kê số câu trắc nghiệm chưa chọn đáp án (Memoized)
  const mcMissingCount = useMemo(() => {
    return extractedMC.filter(q => !q.correctAnswer || !q.correctAnswer.trim()).length
  }, [extractedMC])

  // Lọc danh sách câu hỏi trắc nghiệm theo trạng thái và tìm kiếm
  const filteredMC = useMemo(() => {
    return extractedMC.filter((mc, idx) => {
      const hasAnswer = Boolean(mc.correctAnswer && mc.correctAnswer.trim().length > 0)
      if (mcFilter === 'UNANSWERED' && hasAnswer) return false
      if (mcFilter === 'ANSWERED' && !hasAnswer) return false

      if (mcSearch.trim()) {
        const query = mcSearch.trim().toLowerCase()
        const orderStr = String(mc.order || idx + 1)
        const textMatch = mc.question.toLowerCase().includes(query)
        const orderMatch = orderStr === query || `câu ${orderStr}`.includes(query)
        const ansMatch = (mc.correctAnswer || '').toLowerCase().includes(query)
        return textMatch || orderMatch || ansMatch
      }
      return true
    })
  }, [extractedMC, mcFilter, mcSearch])

  // Tổng số trang cho câu hỏi trắc nghiệm
  const totalPages = Math.max(1, Math.ceil(filteredMC.length / (mcPageSize >= 999 ? filteredMC.length || 1 : mcPageSize)))

  // Danh sách câu hỏi được cắt theo trang hiện tại
  const paginatedMC = useMemo(() => {
    if (mcPageSize >= 999) return filteredMC
    const safePage = Math.min(mcPage, totalPages)
    const activePage = safePage > 0 ? safePage : 1
    const start = (activePage - 1) * mcPageSize
    return filteredMC.slice(start, start + mcPageSize)
  }, [filteredMC, mcPage, totalPages, mcPageSize])

  // Chuyển nhanh tới 1 câu hỏi cụ thể từ ma trận số câu
  const handleJumpToQuestion = useCallback((mc: MultipleChoiceQuestion, idx: number) => {
    // Nếu câu đang bị ẩn bởi bộ lọc tìm kiếm, reset lại để câu hiển thị
    if (mcFilter !== 'ALL' || mcSearch.trim()) {
      setMcFilter('ALL')
      setMcSearch('')
    }

    if (mcPageSize < 999) {
      const rawIdx = extractedMC.findIndex(q => q.id === mc.id)
      const targetIndex = rawIdx !== -1 ? rawIdx : idx
      const targetPage = Math.floor(targetIndex / mcPageSize) + 1
      setMcPage(targetPage)
    }

    setHighlightedMcId(mc.id)
    setTimeout(() => {
      const el = document.getElementById(`mc-card-${mc.id || idx + 1}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 80)

    setTimeout(() => {
      setHighlightedMcId(null)
    }, 2200)
  }, [extractedMC, mcFilter, mcSearch, mcPageSize])

  // Xây dựng 1 câu hỏi tự luận duy nhất nếu có nội dung (Memoized)
  const singleEssayQuestion: EssayQuestion | null = useMemo(() => {
    return essayPrompt.trim() ? {
      id: 'essay-main-01',
      order: 1,
      title: essayTitle.trim() || 'PHẦN I: TỰ LUẬN (30 điểm)',
      context: essayContext.trim() || undefined,
      prompt: essayPrompt.trim(),
      maxScore: Number(essayMaxScore) || 30,
      rubric: [
        'Hiểu đúng và phân tích sâu sắc nội dung tư tưởng, quan điểm trong đoạn trích (10.0 điểm)',
        'Liên hệ thực tiễn sinh động, lập luận chặt chẽ về vai trò, trách nhiệm trong giai đoạn hiện nay (14.0 điểm)',
        'Kỹ năng hành văn, bố cục bài văn nghị luận chuẩn mực, dung lượng tối thiểu 500 chữ (6.0 điểm)'
      ]
    } : null
  }, [essayContext, essayMaxScore, essayPrompt, essayTitle])

  // Gửi biểu mẫu tạo phòng thi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !code.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mã phòng thi!')
      return
    }

    const cleanCode = code.trim().toUpperCase()
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(cleanCode)) {
      alert('Mã phòng thi không hợp lệ! Mã phải từ 3 đến 32 ký tự, chỉ gồm chữ cái, số và dấu gạch nối (Ví dụ: CAND-CA4-01).')
      return
    }

    if (extractedMC.length === 0 && !essayPrompt.trim()) {
      alert('Vui lòng import câu hỏi trắc nghiệm hoặc nhập nội dung đề bài tự luận trước khi tạo phòng thi!')
      return
    }

    // ⭐ BẮT BUỘC CHỌN ĐÁP ÁN ĐÚNG ĐẦY ĐỦ CHO TỪNG CÂU TRẮC NGHIỆM
    const uncompletedMC = extractedMC.filter(q => !q.correctAnswer || !q.correctAnswer.trim())
    if (uncompletedMC.length > 0) {
      const missingLabels = uncompletedMC.slice(0, 8).map((q, idx) => `Câu ${q.order || idx + 1}`).join(', ')
      const moreText = uncompletedMC.length > 8 ? ` và ${uncompletedMC.length - 8} câu khác...` : ''
      alert(`⚠️ CHƯA THỂ LƯU VÀO DATABASE!\n\nĐề thi còn ${uncompletedMC.length} câu trắc nghiệm chưa có đáp án đúng:\n${missingLabels}${moreText}\n\nQuy chế bắt buộc: Người tạo đề phải chọn/nhập đầy đủ đáp án đúng cho từng câu trước khi gửi lên máy chủ!`)
      setActiveTab('MC')
      return
    }

    const essayQuestionsPayload = singleEssayQuestion ? [{
      order: 1,
      title: singleEssayQuestion.title.trim(),
      context: singleEssayQuestion.context?.trim() || undefined,
      prompt: singleEssayQuestion.prompt.trim(),
      maxScore: Number(singleEssayQuestion.maxScore) || 30,
      rubric: singleEssayQuestion.rubric || []
    }] : []

    const roomPayload = {
      code: cleanCode,
      title: title.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      status: 'OPEN',
      multipleChoiceQuestions: extractedMC.map((mc, idx) => {
        let validOptions = (mc.options || [])
          .filter(o => o && (o.text || o.label))
          .map(o => ({
            label: (o.label || '').trim().toUpperCase() || ['A', 'B', 'C', 'D'][idx % 4],
            text: (o.text || '').trim()
          }))

        // Backend Spring Boot database requires at least 1 option item for MCQ records
        if (validOptions.length === 0) {
          validOptions = [
            { label: 'Đáp án', text: (mc.correctAnswer || '').trim() || 'Câu trả lời ngắn' }
          ]
        }

        return {
          order: idx + 1,
          question: mc.question.trim(),
          context: (mc.context || '').trim() || undefined,
          options: validOptions,
          correctAnswer: (mc.correctAnswer || '').trim(),
          explanation: (mc.explanation || '').trim(),
          legalReference: (mc.legalReference || '').trim()
        }
      }),
      essayQuestions: essayQuestionsPayload
    }

    setIsSubmitting(true)

    try {
      // Gọi API thật tới Backend Spring Boot để lưu vào Database
      const resData = await examApi.createRoom(roomPayload)
      handleResetAll()
      setTitle('')
      setCode(`CAND-${Math.floor(1000 + Math.random() * 9000)}`)
      onSuccess(resData)
      onClose()
    } catch (err: any) {
      console.error('Lỗi khi tạo phòng thi vào Database:', err)
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : null) ||
        err.message ||
        'Không thể kết nối đến máy chủ Spring Boot để lưu phòng thi!'
      alert(`❌ LỖI LƯU VÀO CƠ SỞ DỮ LIỆU:\n\n${errorMsg}\n\nVui lòng kiểm tra lại thông tin và thử lại!`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl 2xl:max-w-7xl rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-800 dark:text-slate-100 font-sans"
        >
          {/* Header Modal */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#151b2a]/70">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Tạo Phòng Thi Mới & Cấu Hình Đề Thi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Import câu hỏi trắc nghiệm, chỉnh sửa/xóa câu hỏi & cấu hình bài văn nghị luận tự luận
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 stroke-[2]" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. THÔNG TIN CƠ BẢN CỦA PHÒNG THI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Cấu Hình Cơ Bản Phòng Thi
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Tên phòng thi */}
                <div className="lg:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tên phòng thi / Đề thi sát hạch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đề Sát Hạch Chuẩn CA4 - Lý Luận Nhà Nước & Pháp Luật"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                {/* Mã phòng thi */}
                <div className="lg:col-span-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mã phòng thi <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                      title="Sinh mã ngẫu nhiên"
                    >
                      <RefreshCw className="h-3 w-3 stroke-[2]" />
                      <span>Đổi mã</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="CAND-CA4-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-wider rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-colors text-slate-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Thời gian làm bài */}
                <div className="lg:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Thời gian thi (phút)</span>
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-colors text-slate-900 dark:text-white"
                  >
                    <option value={30}>30 phút (Kiểm tra nhanh)</option>
                    <option value={45}>45 phút (Tiêu chuẩn)</option>
                    <option value={60}>60 phút (Chính thức CA4)</option>
                    <option value={90}>90 phút (Tổng hợp chuyên sâu)</option>
                    <option value={120}>120 phút (Sát hạch toàn diện)</option>
                    <option value={150}>150 phút (Chuẩn tuyển sinh Bộ Công An)</option>
                  </select>
                </div>

                {/* Mô tả / Quy chế ngắn */}
                <div className="lg:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mô tả / Lưu ý quy chế phòng thi
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Quy định làm bài, thang điểm đạt..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-colors text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. CẤU HÌNH & NẠP ĐỀ THI (IMPORT TRẮC NGHIỆM & NHẬP ĐỀ VĂN NGHỊ LUẬN DUY NHẤT) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    2. Phương Thức Nạp Đề Thi
                  </span>
                </div>

                {(extractedMC.length > 0 || essayPrompt.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 stroke-[2]" />
                    <span>Đặt lại dữ liệu đề</span>
                  </button>
                )}
              </div>

              {/* GRID 2 PHẦN: IMPORT TRẮC NGHIỆM & NHẬP ĐỀ VĂN NGHỊ LUẬN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* 2A. CỘT I: IMPORT TRẮC NGHIỆM */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2a] space-y-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                          I. Phần Trắc Nghiệm (70đ)
                        </span>
                      </div>
                      <span className={cn(
                        "font-mono text-xs font-bold px-2 py-0.5 rounded-md border",
                        extractedMC.length > 0
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      )}>
                        {extractedMC.length} câu đã nạp
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Tải lên tệp đề thi (PDF, Word, Excel, TXT) từ máy tính. Hệ thống Backend AI tự động bóc tách danh sách câu hỏi trắc nghiệm (Thang điểm chuẩn 70đ):
                    </p>

                    {/* Hộp cấu hình nạp đề & thang điểm */}
                    <div className="space-y-2.5 text-xs bg-slate-50/80 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tệp đề thi trắc nghiệm (PDF, Word, Excel, TXT)
                        </label>
                        {/* Nút bấm tải tệp từ PC */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => mcFileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
                            title="Chọn tệp đề thi trắc nghiệm từ máy tính (PDF, Word, Excel, TXT)"
                          >
                            <FileUp className="h-4 w-4 stroke-[2]" />
                            <span>Import Từ File (PDF / Word)</span>
                          </button>

                          <input
                            ref={mcFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            onChange={handleMCFileUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Trạng thái quét & bóc tách tệp từ PC */}
                      {(mcParseStatus === 'UPLOADING' || mcParseStatus === 'PARSING') && (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 text-xs animate-pulse border border-indigo-200 dark:border-indigo-800">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-medium">{mcParseMessage}</span>
                        </div>
                      )}

                      {/* Báo cáo đã nạp thành công */}
                      {extractedMC.length > 0 && uploadedMCFileName && mcParseStatus === 'COMPLETED' && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs">
                          <div className="flex items-center gap-2 truncate mr-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate font-medium">Tệp PC: <strong>{uploadedMCFileName}</strong></span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                            {extractedMC.length} câu
                          </span>
                        </div>
                      )}

                      {/* Thang điểm trắc nghiệm */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Thang điểm trắc nghiệm:</span>
                          <input
                            type="number"
                            min={10}
                            max={100}
                            value={mcMaxScore}
                            onChange={(e) => setMcMaxScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-center text-indigo-600 dark:text-indigo-400"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">điểm</span>
                        </div>

                        {extractedMC.length > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Đã sẵn sàng</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {extractedMC.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 italic">
                        * Có thể Sửa / Xóa từng câu ở bảng Xem Trước bên dưới
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExtractedMC([])
                          setUploadedMCFileName('')
                          setMcParseStatus('IDLE')
                        }}
                        className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Xóa trắc nghiệm</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2B. CỘT II: CẤU HÌNH ĐỀ BÀI VĂN NGHỊ LUẬN DUY NHẤT (30 ĐIỂM) */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2a] space-y-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                          II. Phần Tự Luận (Văn Nghị Luận - 30đ)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickFillEssay}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800"
                        title="Nạp đề bài nghị luận chuẩn về tư tưởng Hồ Chí Minh & thanh niên"
                      >
                        <Quote className="h-3 w-3" />
                        <span>Điền mẫu văn nghị luận</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Cấu hình trực tiếp đề bài văn nghị luận xã hội / tư tưởng chính trị - nghiệp vụ CAND (Thang điểm chuẩn 30đ):
                    </p>

                    {/* Form cấu hình đề bài duy nhất */}
                    <div className="space-y-2.5 text-xs bg-slate-50/80 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      
                      {/* Tiêu đề đề bài */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tiêu đề phần thi / Chủ đề bài luận
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: PHẦN I: TỰ LUẬN (30 điểm)"
                          value={essayTitle}
                          onChange={(e) => setEssayTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      {/* Đoạn trích dẫn / Ngữ liệu dẫn đề */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Quote className="h-3 w-3 text-amber-500" />
                            <span>Đoạn trích dẫn / Ngữ liệu đề bài (Căn cứ nghị luận)</span>
                          </label>
                          <span className="text-[10px] text-slate-400">Trích dẫn Hồ Chí Minh / Văn kiện</span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Nhập đoạn văn trích dẫn, lời dạy của Bác Hồ hoặc ngữ liệu làm căn cứ nghị luận... (Ví dụ: Chủ tịch Hồ Chí Minh khẳng định: “Tương lai thuộc về thanh niên...”)"
                          value={essayContext}
                          onChange={(e) => setEssayContext(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 italic leading-relaxed"
                        />
                      </div>

                      {/* Nội dung câu hỏi / Yêu cầu viết bài nghị luận */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <PenTool className="h-3 w-3 text-indigo-500" />
                            <span>Yêu cầu đề bài / Nhiệm vụ bài viết nghị luận (tối thiểu 500 chữ) <span className="text-red-500">*</span></span>
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Nhập yêu cầu viết bài nghị luận (Ví dụ: Anh/chị hãy viết một bài nghị luận tối thiểu 500 chữ trình bày cách hiểu của mình về nội dung đoạn trích trên và liên hệ với vai trò của thanh niên...)"
                          value={essayPrompt}
                          onChange={(e) => setEssayPrompt(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border-l-4 border-l-indigo-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-normal"
                        />
                      </div>

                      {/* Thang điểm */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Thang điểm tự luận:</span>
                          <input
                            type="number"
                            min={5}
                            max={50}
                            value={essayMaxScore}
                            onChange={(e) => setEssayMaxScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-center text-indigo-600 dark:text-indigo-400"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">điểm</span>
                        </div>

                        {essayPrompt.trim() && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Đã sẵn sàng</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 italic">
                      * Thí sinh sẽ viết bài nghị luận trực tiếp trong phòng thi
                    </span>
                    {(essayTitle.trim() || essayContext.trim() || essayPrompt.trim()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setEssayTitle('')
                          setEssayContext('')
                          setEssayPrompt('')
                        }}
                        className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Xóa nội dung</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 3. KẾT QUẢ ĐÃ NẠP & XEM TRƯỚC DANH SÁCH CÂU HỎI (CÓ NÚT SỬA & XÓA) */}
            {(extractedMC.length > 0 || essayPrompt.trim().length > 0) && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      3. Xem Trước & Tinh Chỉnh Đề Thi ({extractedMC.length} câu trắc nghiệm • {essayPrompt.trim() ? '1 đề bài tự luận' : '0 đề bài tự luận'})
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Bạn có thể chọn đáp án đúng, hoặc bấm nút <strong>Sửa</strong> / <strong>Xóa</strong> trên từng câu hỏi
                    </span>
                  </div>

                  {/* Tabs chuyển đổi xem Trắc nghiệm / Tự luận */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('MC')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5",
                        activeTab === 'MC'
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      <HelpCircle className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Trắc nghiệm ({extractedMC.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('ESSAY')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5",
                        activeTab === 'ESSAY'
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Tự luận ({essayPrompt.trim() ? '1' : '0'})</span>
                    </button>
                  </div>
                </div>

                {/* Danh sách câu hỏi Trắc nghiệm */}
                {activeTab === 'MC' && (
                  <div className="space-y-3.5">
                    {/* Thanh tìm kiếm & Lọc câu hỏi nhanh */}
                    {extractedMC.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm theo số câu (vd: 5, Câu 12) hoặc từ khóa câu hỏi..."
                            value={mcSearch}
                            onChange={(e) => {
                              setMcSearch(e.target.value)
                              setMcPage(1)
                            }}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                          />
                          {mcSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setMcSearch('')
                                setMcPage(1)
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Filter Status Pills */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMcFilter('ALL')
                              setMcPage(1)
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer",
                              mcFilter === 'ALL'
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                            Tất cả ({extractedMC.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMcFilter('UNANSWERED')
                              setMcPage(1)
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1",
                              mcFilter === 'UNANSWERED'
                                ? "bg-rose-600 text-white shadow-2xs"
                                : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            )}
                          >
                            <span>Chưa chọn</span>
                            {mcMissingCount > 0 && (
                              <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                                {mcMissingCount}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMcFilter('ANSWERED')
                              setMcPage(1)
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer",
                              mcFilter === 'ANSWERED'
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            )}
                          >
                            Đã xong ({extractedMC.length - mcMissingCount})
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Banner cảnh báo tình trạng đáp án */}
                    {extractedMC.length > 0 && (
                      <div className={cn(
                        "p-3 rounded-xl border text-xs flex items-center justify-between gap-3",
                        mcMissingCount > 0
                          ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                          : "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                      )}>
                        <div className="flex items-center gap-2">
                          {mcMissingCount > 0 ? (
                            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold block">
                              {mcMissingCount > 0
                                ? `Còn ${mcMissingCount}/${extractedMC.length} câu chưa có đáp án đúng!`
                                : `Đã thiết lập đầy đủ đáp án đúng cho ${extractedMC.length}/${extractedMC.length} câu hỏi.`}
                            </span>
                            <span className="text-[11px] opacity-85">
                              {mcMissingCount > 0
                                ? "Quy định: Hãy nhấp vào phương án A/B/C/D trên thẻ câu hỏi hoặc bấm số câu trên ma trận bên dưới để điền đáp án."
                                : "Đề thi đã sẵn sàng lưu vào cơ sở dữ liệu."}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] shrink-0 border",
                          mcMissingCount > 0
                            ? "bg-rose-100 dark:bg-rose-900/60 border-rose-300 text-rose-900 dark:text-rose-100"
                            : "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 text-emerald-900 dark:text-emerald-100"
                        )}>
                          {extractedMC.length - mcMissingCount}/{extractedMC.length} ĐÃ XONG
                        </span>
                      </div>
                    )}

                    {/* BẢNG MA TRẬN CHUYỂN NHANH CÂU HỎI (1 - N) */}
                    {extractedMC.length > 0 && (
                      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Ma Trận Chuyển Nhanh Câu Hỏi ({extractedMC.length} câu)</span>
                            </span>
                            <div className="flex items-center gap-2.5 text-[10.5px]">
                              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                                Đã chọn ({extractedMC.length - mcMissingCount})
                              </span>
                              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                                Chưa chọn ({mcMissingCount})
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer shrink-0"
                          >
                            {isMatrixExpanded ? 'Thu gọn ▲' : 'Mở rộng ma trận ▼'}
                          </button>
                        </div>

                        {isMatrixExpanded && (
                          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                            {extractedMC.map((mc, idx) => {
                              const hasAnswer = Boolean(mc.correctAnswer && mc.correctAnswer.trim().length > 0)
                              const isHighlighted = highlightedMcId === mc.id

                              return (
                                <button
                                  key={mc.id || idx}
                                  type="button"
                                  onClick={() => handleJumpToQuestion(mc, idx)}
                                  className={cn(
                                    "h-8 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center relative",
                                    isHighlighted
                                      ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 scale-105 z-10 shadow-sm"
                                      : hasAnswer
                                        ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                        : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/30"
                                  )}
                                  title={hasAnswer ? `Câu ${mc.order || idx + 1}: Đáp án [${mc.correctAnswer}]` : `Câu ${mc.order || idx + 1}: CHƯA CHỌN ĐÁP ÁN (Bấm để nhảy tới câu này)`}
                                >
                                  <span>{mc.order || idx + 1}</span>
                                  {hasAnswer && (
                                    <span className="text-[8.5px] -mt-1 font-extrabold opacity-90 text-emerald-800 dark:text-emerald-200">
                                      {mc.correctAnswer}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (TOP PAGINATION CONTROLS) */}
                    {filteredMC.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs">
                        {/* Thông tin số câu */}
                        <div className="text-slate-600 dark:text-slate-300 font-medium">
                          {mcPageSize >= 999 ? (
                            <span>Đang hiển thị <strong>toàn bộ {filteredMC.length}</strong> câu hỏi</span>
                          ) : (
                            <span>
                              Trang <strong>{mcPage}</strong> / <strong>{totalPages}</strong> (Hiển thị câu <strong>{(mcPage - 1) * mcPageSize + 1}</strong> - <strong>{Math.min(mcPage * mcPageSize, filteredMC.length)}</strong> trong tổng <strong>{filteredMC.length}</strong> câu)
                            </span>
                          )}
                        </div>

                        {/* Các nút bấm phân trang */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mcPageSize < 999 && totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={mcPage <= 1}
                                onClick={() => setMcPage(prev => Math.max(1, prev - 1))}
                                className="p-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span>Trước</span>
                              </button>

                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                if (
                                  totalPages > 7 &&
                                  pageNum !== 1 &&
                                  pageNum !== totalPages &&
                                  Math.abs(pageNum - mcPage) > 1
                                ) {
                                  if (pageNum === 2 || pageNum === totalPages - 1) {
                                    return <span key={pageNum} className="px-1 text-slate-400">...</span>
                                  }
                                  return null
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setMcPage(pageNum)}
                                    className={cn(
                                      "h-7 w-7 rounded-lg font-bold font-mono text-xs transition-colors cursor-pointer flex items-center justify-center",
                                      mcPage === pageNum
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                                    )}
                                  >
                                    {pageNum}
                                  </button>
                                )
                              })}

                              <button
                                type="button"
                                disabled={mcPage >= totalPages}
                                onClick={() => setMcPage(prev => Math.min(totalPages, prev + 1))}
                                className="p-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Sau</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Chọn số câu / trang */}
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-[11px] text-slate-500 font-medium">Xem:</span>
                            <select
                              value={mcPageSize}
                              onChange={(e) => {
                                setMcPageSize(Number(e.target.value))
                                setMcPage(1)
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
                            >
                              <option value={9999}>Toàn bộ ({filteredMC.length} câu liên tục)</option>
                              <option value={15}>15 câu/trang</option>
                              <option value={30}>30 câu/trang</option>
                              <option value={10}>10 câu/trang</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Danh sách các thẻ câu hỏi (Paginated) */}
                    <div className="space-y-3">
                      {extractedMC.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                          Chưa có câu hỏi trắc nghiệm nào. Hãy nhấn "Import Trắc Nghiệm Từ File" ở trên.
                        </div>
                      ) : filteredMC.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 italic rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                          Không tìm thấy câu hỏi phù hợp với bộ lọc / từ khóa tìm kiếm.
                        </div>
                      ) : (
                        paginatedMC.map((mc, idx) => (
                          <MCQuestionItem
                            key={mc.id || idx}
                            mc={mc}
                            index={(mcPage - 1) * (mcPageSize >= 999 ? 0 : mcPageSize) + idx}
                            isHighlighted={highlightedMcId === mc.id}
                            onUpdateAnswer={handleUpdateMCCorrectAnswer}
                            onEdit={handleOpenEditMC}
                            onDelete={handleDeleteMC}
                          />
                        ))
                      )}
                    </div>

                    {/* THANH ĐIỀU HƯỚNG PHÂN TRANG DƯỚI ĐÁY (BOTTOM PAGINATION) */}
                    {filteredMC.length > 0 && mcPageSize < 999 && totalPages > 1 && (
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-slate-500">
                          Trang {mcPage} / {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={mcPage <= 1}
                            onClick={() => {
                              setMcPage(prev => Math.max(1, prev - 1))
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1"
                          >
                            <ChevronLeft className="h-3 w-3" />
                            <span>Trang Trước</span>
                          </button>
                          <button
                            type="button"
                            disabled={mcPage >= totalPages}
                            onClick={() => {
                              setMcPage(prev => Math.min(totalPages, prev + 1))
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1"
                          >
                            <span>Trang Sau</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Danh sách câu hỏi Tự luận (Chỉ có 1 đề bài duy nhất) */}
                {activeTab === 'ESSAY' && (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {!essayPrompt.trim() ? (
                      <div className="p-4 text-center text-xs text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        Chưa có nội dung đề bài tự luận. Hãy nhập ở phần "II. Phần Tự Luận (Văn Nghị Luận)" ở trên.
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                            Đề Bài Tự Luận
                          </span>
                          <span className="font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Thang điểm: {essayMaxScore} điểm
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {essayTitle || 'PHẦN I: TỰ LUẬN (30 điểm)'}
                        </h4>

                        {essayContext.trim() && (
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 text-[11.5px] text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                            {essayContext}
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed whitespace-pre-line font-medium">
                          {essayPrompt}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <div className="flex items-center gap-3">
                {mcMissingCount > 0 && extractedMC.length > 0 && (
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Còn {mcMissingCount} câu chưa chọn đáp án</span>
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer",
                    isSubmitting
                      ? "bg-slate-500 text-white cursor-not-allowed opacity-80"
                      : mcMissingCount > 0 && extractedMC.length > 0
                        ? "bg-slate-700 hover:bg-slate-800 text-white"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-600/20 hover:shadow-lg"
                  )}
                  title={mcMissingCount > 0 ? `Đề thi còn ${mcMissingCount} câu chưa chọn đáp án đúng` : 'Lưu và mở phòng thi chính thức vào cơ sở dữ liệu'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang Lưu Vào Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>Khởi Tạo & Lưu Vào Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL CHỈNH SỬA CHI TIẾT CÂU HỎI TRẮC NGHIỆM                          */}
      {/* ========================================================================= */}
      {editingMCQuestion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-[#151b2a] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                  {editingMCQuestion.order}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Chỉnh Sửa Câu Hỏi Số {editingMCQuestion.order}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMCQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEditMC} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Chọn loại câu hỏi */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">Định dạng câu hỏi:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMCIsShortAnswer(false)}
                    className={cn(
                      "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer",
                      !editMCIsShortAnswer
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    4 Lựa Chọn (A, B, C, D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMCIsShortAnswer(true)}
                    className={cn(
                      "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer",
                      editMCIsShortAnswer
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Trả Lời Ngắn
                  </button>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editMCQuestionText}
                  onChange={(e) => setEditMCQuestionText(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
                />
              </div>

              {/* Phương án 4 lựa chọn */}
              {!editMCIsShortAnswer ? (
                <div className="space-y-2 pt-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Nội dung 4 phương án & chọn đáp án đúng:
                  </label>
                  
                  {/* Option A */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMCCorrectAnswer('A')}
                      className={cn(
                        "h-7 w-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        editMCCorrectAnswer.toUpperCase() === 'A'
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100"
                      )}
                      title="Chọn A làm đáp án đúng"
                    >
                      A
                    </button>
                    <input
                      type="text"
                      placeholder="Nội dung phương án A..."
                      value={editMCOptA}
                      onChange={(e) => setEditMCOptA(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Option B */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMCCorrectAnswer('B')}
                      className={cn(
                        "h-7 w-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        editMCCorrectAnswer.toUpperCase() === 'B'
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100"
                      )}
                      title="Chọn B làm đáp án đúng"
                    >
                      B
                    </button>
                    <input
                      type="text"
                      placeholder="Nội dung phương án B..."
                      value={editMCOptB}
                      onChange={(e) => setEditMCOptB(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Option C */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMCCorrectAnswer('C')}
                      className={cn(
                        "h-7 w-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        editMCCorrectAnswer.toUpperCase() === 'C'
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100"
                      )}
                      title="Chọn C làm đáp án đúng"
                    >
                      C
                    </button>
                    <input
                      type="text"
                      placeholder="Nội dung phương án C (tùy chọn)..."
                      value={editMCOptC}
                      onChange={(e) => setEditMCOptC(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Option D */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMCCorrectAnswer('D')}
                      className={cn(
                        "h-7 w-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        editMCCorrectAnswer.toUpperCase() === 'D'
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100"
                      )}
                      title="Chọn D làm đáp án đúng"
                    >
                      D
                    </button>
                    <input
                      type="text"
                      placeholder="Nội dung phương án D (tùy chọn)..."
                      value={editMCOptD}
                      onChange={(e) => setEditMCOptD(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Đáp án đúng (Trả lời ngắn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập đáp án chuẩn..."
                    value={editMCCorrectAnswer}
                    onChange={(e) => setEditMCCorrectAnswer(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Giải thích & Pháp lý */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                    Giải thích đáp án (tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="Lý do phương án trên đúng..."
                    value={editMCExplanation}
                    onChange={(e) => setEditMCExplanation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                    Căn cứ pháp lý (tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Điều 118 Bộ luật TTHS..."
                    value={editMCLegalReference}
                    onChange={(e) => setEditMCLegalReference(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMCQuestion(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
