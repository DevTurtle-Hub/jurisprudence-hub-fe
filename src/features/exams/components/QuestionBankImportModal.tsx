import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit3,
  ArrowRight,
  Check,
  Search,
  PenTool
} from 'lucide-react'
import { cn, formatSituationalParagraphs } from '@/lib/utils'
import { questionBankApi } from '@/services/questionBankApi'
import type {
  QuestionBankResponse,
  QuestionBankRequest,
  QuestionBankMcOptionRequest
} from '@/types/questionBank'
import { toast } from 'sonner'

interface QuestionBankImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess?: () => void
  onSwitchToManualEssay?: () => void
}

type FilterType = 'ALL' | 'MC_CHOICE' | 'MC_FILL'

export function QuestionBankImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  onSwitchToManualEssay
}: QuestionBankImportModalProps) {
  // Step 1: Upload & preview (Chuyên Import Trắc nghiệm)
  const [targetType] = useState<'FULL' | 'MC_ONLY' | 'ESSAY_ONLY'>('MC_ONLY')
  const [isParsing, setIsParsing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2: Preview list
  const [previewQuestions, setPreviewQuestions] = useState<QuestionBankResponse[]>([])
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryInput, setCategoryInput] = useState('Pháp luật đại cương CAND')

  // Edit question modal state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editQuestionType, setEditQuestionType] = useState<'MC' | 'ESSAY'>('MC')
  const [editQuestionText, setEditQuestionText] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editExplanation, setEditExplanation] = useState('')
  const [editLegalReference, setEditLegalReference] = useState('')
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('')
  const [editOptions, setEditOptions] = useState<QuestionBankMcOptionRequest[]>([
    { label: 'A', optionText: '', isCorrect: false },
    { label: 'B', optionText: '', isCorrect: false },
    { label: 'C', optionText: '', isCorrect: false },
    { label: 'D', optionText: '', isCorrect: false },
  ])

  // Save Batch state
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  // Reset all modal state
  const handleReset = () => {
    setPreviewQuestions([])
    setUploadError(null)
    setIsParsing(false)
    setIsSaving(false)
    setEditingIndex(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Bóc tách preview qua API
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    await parseFile(file)
  }

  const parseFile = async (file: File) => {
    setIsParsing(true)
    setUploadError(null)
    try {
      const data = await questionBankApi.parsePreview(file, targetType)
      if (!data || data.length === 0) {
        setUploadError('Tệp không chứa câu hỏi hợp lệ hoặc hệ thống không thể bóc tách nội dung.')
      } else {
        setPreviewQuestions(data)
        toast.success(`Bóc tách thành công ${data.length} câu hỏi từ file!`)
      }
    } catch (err: any) {
      console.error('Lỗi khi bóc tách file:', err)
      setUploadError(err?.response?.data?.message || err.message || 'Không thể bóc tách file đề thi.')
    } finally {
      setIsParsing(false)
    }
  }

  // 1-Click gán đáp án đúng cho câu MC trong danh sách preview
  const handleQuickSetCorrect = (qIndex: number, label: string) => {
    setPreviewQuestions(prev => {
      const updated = [...prev]
      const target = { ...updated[qIndex] }
      target.correctAnswer = label
      if (target.options) {
        target.options = target.options.map(opt => ({
          ...opt,
          isCorrect: opt.label === label
        }))
      }
      updated[qIndex] = target
      return updated
    })
  }

  // Xóa câu khỏi preview
  const handleDeleteQuestion = (qIndex: number) => {
    setPreviewQuestions(prev => prev.filter((_, idx) => idx !== qIndex))
  }

  // Mở modal sửa câu
  const handleOpenEdit = (q: QuestionBankResponse, idx: number) => {
    setEditingIndex(idx)
    setEditTitle(q.title || `Câu hỏi #${idx + 1}`)
    setEditQuestionType((q.questionType?.toUpperCase() === 'ESSAY' ? 'ESSAY' : 'MC') as 'MC' | 'ESSAY')
    setEditQuestionText(q.questionText || '')
    setEditCategory(q.category || categoryInput)
    setEditExplanation(q.explanation || '')
    setEditLegalReference(q.legalReference || '')
    setEditCorrectAnswer(q.correctAnswer || '')
    if (q.options && q.options.length > 0) {
      setEditOptions(q.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        optionText: opt.text,
        isCorrect: opt.isCorrect
      })))
    } else {
      setEditOptions([
        { label: 'A', optionText: '', isCorrect: false },
        { label: 'B', optionText: '', isCorrect: false },
        { label: 'C', optionText: '', isCorrect: false },
        { label: 'D', optionText: '', isCorrect: false },
      ])
    }
  }

  // Lưu chỉnh sửa câu trong preview
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingIndex === null) return

    if (!editTitle.trim() || !editQuestionText.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung câu hỏi!')
      return
    }

    if (editQuestionType === 'MC') {
      const hasCorrect = editOptions.some(o => o.isCorrect) || !!editCorrectAnswer
      if (!hasCorrect) {
        alert('Câu hỏi trắc nghiệm phải có ít nhất 1 đáp án đúng!')
        return
      }
    }

    setPreviewQuestions(prev => {
      const updated = [...prev]
      const cur = updated[editingIndex]
      updated[editingIndex] = {
        ...cur,
        title: editTitle.trim(),
        questionType: editQuestionType,
        questionText: editQuestionText.trim(),
        category: editCategory.trim() || categoryInput,
        explanation: editExplanation.trim(),
        legalReference: editLegalReference.trim(),
        correctAnswer: editCorrectAnswer,
        options: editQuestionType === 'MC'
          ? editOptions.map(opt => ({
              id: opt.id || opt.label,
              label: opt.label,
              text: opt.optionText,
              isCorrect: opt.isCorrect || opt.label === editCorrectAnswer
            }))
          : []
      }
      return updated
    })

    setEditingIndex(null)
  }

  // Lưu hàng loạt (Batch Save) vào Database qua POST /api/v1/question-bank/questions/batch
  const handleBatchSave = async () => {
    if (previewQuestions.length === 0) return

    // Kiểm tra câu hỏi trắc nghiệm xem đã có đáp án đúng chưa
    const missingAnsMC = previewQuestions.filter(
      q => q.questionType === 'MC' && (!q.options || !q.options.some(o => o.isCorrect)) && !q.correctAnswer
    )
    if (missingAnsMC.length > 0) {
      const confirmSave = window.confirm(
        `⚠️ Chú ý: Có ${missingAnsMC.length} câu hỏi trắc nghiệm chưa chọn đáp án đúng.\nBạn có chắc chắn muốn lưu dưới dạng Bản nháp (Draft) để bổ sung sau?`
      )
      if (!confirmSave) return
    }

    setIsSaving(true)
    try {
      const payload: QuestionBankRequest[] = previewQuestions.map((q, idx) => {
        const rawOptions = q.options || []
        const validOptions = rawOptions
          .filter(opt => opt && ((opt.text && opt.text.trim()) || ((opt as any).optionText && (opt as any).optionText.trim())))
          .map(opt => {
            const isCorrectVal = Boolean(opt.isCorrect || (opt as any).correct || (q.correctAnswer && q.correctAnswer === opt.label))
            return {
              id: opt.id,
              label: opt.label || 'A',
              optionText: (opt.text || (opt as any).optionText || '').trim(),
              isCorrect: isCorrectVal,
              correct: isCorrectVal
            }
          })

        // Nếu loại câu hỏi là MC nhưng không có options (ví dụ câu điền khuyết / trả lời ngắn 58, 59, 60):
        // chuyển sang ESSAY hoặc tạo options tối thiểu để không bị lỗi backend Validation
        let qType = q.questionType?.toUpperCase() === 'ESSAY' ? 'ESSAY' : 'MC'
        let finalOptions: QuestionBankMcOptionRequest[] | undefined = undefined

        if (qType === 'MC') {
          if (validOptions.length < 2) {
            // Đây là câu trả lời ngắn / điền khuyết (như câu 58, 59, 60 trong đề)
            // Chuyển sang dạng ESSAY (hoặc tự luận ngắn) để backend không đòi options
            qType = 'ESSAY'
          } else {
            finalOptions = validOptions
          }
        }

        const fallbackTitle = q.title && q.title.trim()
          ? q.title.trim()
          : (qType === 'MC' ? `Câu hỏi trắc nghiệm #${idx + 1}` : `Câu hỏi tự luận #${idx + 1}`)

        return {
          title: fallbackTitle,
          description: q.description || undefined,
          category: q.category || categoryInput.trim() || 'Pháp luật đại cương CAND',
          questionType: qType,
          questionText: q.questionText?.trim() || `Nội dung câu hỏi #${idx + 1}`,
          correctAnswer: q.correctAnswer || (finalOptions?.find(o => o.isCorrect || o.correct)?.label) || undefined,
          explanation: q.explanation?.trim() || undefined,
          legalReference: q.legalReference?.trim() || undefined,
          sampleEssay: q.sampleEssay?.trim() || undefined,
          tags: q.tags?.trim() || undefined,
          isDraft: true,
          draft: true,
          options: finalOptions
        }
      })

      await questionBankApi.saveBatch(payload)
      toast.success(`Đã lưu thành công ${payload.length} câu hỏi vào Ngân hàng câu hỏi!`)
      if (onImportSuccess) onImportSuccess()
      handleClose()
    } catch (err: any) {
      console.error('Lỗi khi lưu batch câu hỏi:', err)
      const errorData = err?.response?.data
      const errorMsg = errorData?.details || errorData?.message || errorData?.error || err.message || 'Lỗi khi lưu câu hỏi vào cơ sở dữ liệu'
      alert(`⚠️ Không thể lưu câu hỏi vào cơ sở dữ liệu:\n${errorMsg}\n\n(Mã lỗi HTTP: ${err?.response?.status || 'Unknown'})`)
    } finally {
      setIsSaving(false)
    }
  }

  // Filter preview questions: 1. Tất cả, 2. Trắc nghiệm A B C D, 3. Điền khuyết / Điền đáp án
  const filteredQuestions = previewQuestions.filter(q => {
    const hasOptions = !!(q.options && q.options.length >= 2)
    if (filterType === 'MC_CHOICE' && !hasOptions) return false
    if (filterType === 'MC_FILL' && hasOptions) return false
    if (searchQuery.trim()) {
      const qText = (q.questionText || '').toLowerCase()
      const qTitle = (q.title || '').toLowerCase()
      const search = searchQuery.toLowerCase()
      return qText.includes(search) || qTitle.includes(search)
    }
    return true
  })

  // Đếm số lượng theo 2 loại trắc nghiệm
  const mcChoiceCount = previewQuestions.filter(q => q.options && q.options.length >= 2).length
  const mcFillCount = previewQuestions.filter(q => !q.options || q.options.length < 2).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[94vh] overflow-hidden"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Bóc Tách & Import Ngân Hàng Câu Hỏi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động trích xuất file PDF, DOCX, XLSX vào Ngân hàng câu hỏi CAND
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {previewQuestions.length === 0 ? (
            /* Bước 1: Khu vực lựa chọn & upload */
            <div className="space-y-6 max-w-xl mx-auto py-4">
              {/* Lựa chọn phương thức nhập câu hỏi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phương thức tạo ngân hàng câu hỏi:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="p-3 rounded-2xl border-2 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center gap-2.5 font-bold text-xs shadow-xs text-left cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileUp className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold">Import Trắc Nghiệm</span>
                      <span className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400">Bóc tách file PDF/Word</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleClose()
                      if (onSwitchToManualEssay) onSwitchToManualEssay()
                    }}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 dark:text-slate-300 flex items-center gap-2.5 font-bold text-xs text-left transition-all cursor-pointer group"
                  >
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Nhập Tự Luận</span>
                      <span className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400">Điền biểu mẫu thủ công</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hộp kéo thả file */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                  isParsing
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 cursor-wait"
                    : "border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shadow-xs">
                  {isParsing ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (
                    <FileText className="h-7 w-7" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isParsing
                        ? 'Đang bóc tách dữ liệu câu hỏi từ file...'
                      : 'Nhấp hoặc kéo thả file đề thi vào đây'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ định dạng PDF, DOCX, XLSX (Tối đa 25MB)
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Bước 2: Hiển thị danh sách preview câu hỏi đã bóc tách */
            <div className="space-y-4">
              {/* Thanh thống kê & Bộ lọc 3 tabs & Tìm kiếm */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bộ 3 tab phân loại câu hỏi */}
                  <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setFilterType('ALL')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                        filterType === 'ALL'
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span>Tất cả</span>
                      <span className={cn(
                        "text-[10.5px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                        filterType === 'ALL' ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}>
                        {previewQuestions.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterType('MC_CHOICE')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                        filterType === 'MC_CHOICE'
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span>Trắc nghiệm chọn A B C D</span>
                      <span className={cn(
                        "text-[10.5px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                        filterType === 'MC_CHOICE' ? "bg-white/20 text-white" : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      )}>
                        {mcChoiceCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterType('MC_FILL')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                        filterType === 'MC_FILL'
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span>Trắc nghiệm điền đáp án</span>
                      <span className={cn(
                        "text-[10.5px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                        filterType === 'MC_FILL' ? "bg-white/20 text-white" : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      )}>
                        {mcFillCount}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category gán mặc định */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 shrink-0">Danh mục:</span>
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="Nhập tên chuyên mục..."
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Tìm kiếm */}
                  <div className="relative flex-1 sm:w-44">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm nội dung..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách thẻ câu hỏi - Khung rộng rãi, bo tròn nhẹ nhàng, cuộn mượt mà */}
              <div 
                className="space-y-3 flex-1 overflow-y-auto pr-1.5 scroll-smooth divide-y-0"
                style={{ 
                  maxHeight: 'calc(94vh - 270px)',
                  willChange: 'scroll-position'
                }}
              >
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 italic rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const realIndex = previewQuestions.findIndex(item => item === q)
                    const isMC = q.questionType === 'MC'

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-[border-color] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              Câu {realIndex + 1}
                            </span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                              isMC
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            )}>
                              {isMC ? 'Trắc nghiệm' : 'Tự luận'}
                            </span>
                            {q.title && (
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-xs">
                                {q.title}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(q, realIndex)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(realIndex)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Xóa câu này"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nội dung câu hỏi */}
                        {q.description && (
                          <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800 text-[11.5px] leading-relaxed mb-2 w-full">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1.5">
                              Bối cảnh / Tình huống áp dụng:
                            </span>
                            <div className="space-y-1.5 text-justify sm:text-left leading-relaxed text-slate-900 dark:text-slate-100">
                              {formatSituationalParagraphs(q.description).map((para, pIdx) => (
                                <p key={pIdx} className="w-full leading-relaxed">
                                  {para}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* Nếu là MC có options: Render options */}
                        {isMC && q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map(opt => {
                              const isCorrect = opt.isCorrect || q.correctAnswer === opt.label
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => handleQuickSetCorrect(realIndex, opt.label)}
                                  title={isCorrect ? `[${opt.label}] là đáp án đúng` : `Nhấp để chọn [${opt.label}] làm đáp án đúng`}
                                  className={cn(
                                    "p-2.5 rounded-xl border flex items-start gap-2 text-left text-xs transition-all cursor-pointer group",
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-medium ring-1 ring-emerald-500/20"
                                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/30"
                                  )}
                                >
                                  <span className={cn(
                                    "h-5 w-5 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 font-bold",
                                    isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600"
                                  )}>
                                    {opt.label}
                                  </span>
                                  <span className="flex-1 leading-snug">{opt.text}</span>
                                  {isCorrect && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      ĐÚNG
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* Nếu là câu trả lời ngắn / điền khuyết (không có options A, B, C, D) */}
                        {isMC && (!q.options || q.options.length === 0) && (
                          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-800 dark:text-amber-300">
                                Câu hỏi trả lời ngắn / điền khuyết:
                              </span>
                              <span className="text-[10px] text-slate-500 italic">
                                (Tự động lưu dạng Tự luận ngắn khi import)
                              </span>
                            </div>
                            <input
                              type="text"
                              value={q.correctAnswer || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setPreviewQuestions(prev => {
                                  const next = [...prev]
                                  next[realIndex] = { ...next[realIndex], correctAnswer: val }
                                  return next
                                })
                              }}
                              placeholder="Nhập đáp án chuẩn hoặc gợi ý trả lời..."
                              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                            />
                          </div>
                        )}

                        {/* Nếu là Tự luận */}
                        {!isMC && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Gợi ý / Định hướng tự luận: </span>
                            {q.explanation || q.correctAnswer || 'Chưa có định hướng giải chi tiết.'}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={previewQuestions.length > 0 ? () => setPreviewQuestions([]) : handleClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {previewQuestions.length > 0 ? 'Chọn Tệp Khác' : 'Hủy Bỏ'}
          </button>

          {previewQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleBatchSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang Lưu Vào Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Lưu {previewQuestions.length} Câu Hỏi (Draft)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Modal sửa câu hỏi trong preview */}
      <AnimatePresence>
        {editingIndex !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Chỉnh Sửa Câu #{editingIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tiêu đề:</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Loại câu hỏi:</label>
                    <select
                      value={editQuestionType}
                      onChange={(e) => setEditQuestionType(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="MC">Trắc nghiệm (MC)</option>
                      <option value="ESSAY">Tự luận (ESSAY)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nội dung câu hỏi *:</label>
                  <textarea
                    rows={3}
                    required
                    value={editQuestionText}
                    onChange={(e) => setEditQuestionText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {editQuestionType === 'MC' && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Các phương án & Chọn đáp án đúng:
                    </span>
                    <div className="space-y-2">
                      {editOptions.map((opt, idx) => (
                        <div key={opt.label} className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0 font-mono font-bold">
                            <input
                              type="radio"
                              name="previewCorrectOption"
                              checked={opt.isCorrect || editCorrectAnswer === opt.label}
                              onChange={() => {
                                setEditCorrectAnswer(opt.label)
                                setEditOptions(prev => prev.map(o => ({
                                  ...o,
                                  isCorrect: o.label === opt.label
                                })))
                              }}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800">
                              {opt.label}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => {
                              const text = e.target.value
                              setEditOptions(prev => {
                                const next = [...prev]
                                next[idx].optionText = text
                                return next
                              })
                            }}
                            placeholder={`Nội dung phương án ${opt.label}...`}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    Xác Nhận Lưu Sửa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
