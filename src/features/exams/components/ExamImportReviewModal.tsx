import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit3,
  Plus,
  ArrowRight,
  Check,
  Search,
  BookOpen,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminExamImportApi } from '@/services/examApi'
import type {
  ExamImportDraft,
  DraftQuestion,
  ConfirmImportResult,
  ImportMode,
  DraftValidationResult
} from '../types'

interface ExamImportReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess?: (result: ConfirmImportResult) => void
}

type FilterStatus = 'ALL' | 'NEED_ANSWER' | 'HAS_ANSWER' | 'ERROR' | 'WARNING'
type FilterType = 'ALL' | 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'

const DRAFT_CACHE_KEY = 'cand_exam_import_draft_id'

export function ExamImportReviewModal({
  isOpen,
  onClose,
  onImportSuccess
}: ExamImportReviewModalProps) {
  // Step 1: Upload state & Mode
  const [importMode, setImportMode] = useState<ImportMode>('FULL')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cachedDraftId, setCachedDraftId] = useState<string | null>(null)
  const [isLoadingCachedDraft, setIsLoadingCachedDraft] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual Draft creation modal state
  const [showManualDraftModal, setShowManualDraftModal] = useState(false)
  const [manualDraftTitle, setManualDraftTitle] = useState('')
  const [isCreatingManualDraft, setIsCreatingManualDraft] = useState(false)

  // Step 2: Draft Data state
  const [draft, setDraft] = useState<ExamImportDraft | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [searchQuestion, setSearchQuestion] = useState('')
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null)

  // Editing Question state (Modal)
  const [editingQuestion, setEditingQuestion] = useState<DraftQuestion | null>(null)
  const [editType, setEditType] = useState<'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE')
  const [editQuestionNumber, setEditQuestionNumber] = useState<number>(1)
  const [editSection, setEditSection] = useState('')
  const [editContext, setEditContext] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editOptions, setEditOptions] = useState<Array<{ key: string; content: string; isCorrect: boolean }>>([
    { key: 'A', content: '', isCorrect: false },
    { key: 'B', content: '', isCorrect: false },
    { key: 'C', content: '', isCorrect: false },
    { key: 'D', content: '', isCorrect: false }
  ])
  const [editCorrectKey, setEditCorrectKey] = useState<string>('')
  const [editAnswer, setEditAnswer] = useState('')
  const [isSavingQuestion, setIsSavingQuestion] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)

  // Adding Question state (Modal)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newType, setNewType] = useState<'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE')
  const [newQuestionNumber, setNewQuestionNumber] = useState<number>(1)
  const [newSection, setNewSection] = useState('')
  const [newContext, setNewContext] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newOptions, setNewOptions] = useState<Array<{ key: string; content: string; isCorrect: boolean }>>([
    { key: 'A', content: '', isCorrect: false },
    { key: 'B', content: '', isCorrect: false },
    { key: 'C', content: '', isCorrect: false },
    { key: 'D', content: '', isCorrect: false }
  ])
  const [newCorrectKey, setNewCorrectKey] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [addFormError, setAddFormError] = useState<string | null>(null)

  // Validation & Confirmation states
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<DraftValidationResult | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [importSuccessData, setImportSuccessData] = useState<ConfirmImportResult | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Scroll Container Ref
  const questionListRef = useRef<HTMLDivElement>(null)

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg)
    setTimeout(() => setFeedbackMessage(null), 4000)
  }

  // Load cached draftId from localStorage if available
  useEffect(() => {
    if (isOpen) {
      try {
        const savedId = localStorage.getItem(DRAFT_CACHE_KEY)
        if (savedId) {
          setCachedDraftId(savedId)
        }
      } catch (err) {
        console.warn('Lỗi đọc draft cache:', err)
      }
    }
  }, [isOpen])

  // Normalization logic: Calculate accurate statistics and hasAnswer flags
  const normalizeDraft = (data: any): ExamImportDraft => {
    if (!data) return data
    const rawQuestions: any[] = data.questions || []
    
    const questions: DraftQuestion[] = rawQuestions.map((q: any, idx: number) => {
      const rawOptions = Array.isArray(q.options) ? q.options : []
      
      let qType: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER' =
        q.type === 'ESSAY' ? 'ESSAY' : q.type === 'SHORT_ANSWER' ? 'SHORT_ANSWER' : (rawOptions.length === 0 ? 'SHORT_ANSWER' : 'MULTIPLE_CHOICE')
      
      // Chỉ giữ đáp án nếu người dùng đã click chọn trước đó (có cờ hasAnswer === true)
      const isUserChosen = Boolean(q.hasAnswer && (q.correctOptionKey || q.answer || (rawOptions.some((o: any) => o.isCorrect || o.correct))))
      const explicitCorrectKey = isUserChosen ? (q.correctOptionKey || (qType === 'MULTIPLE_CHOICE' ? q.answer : '') || '').toUpperCase() : ''
      
      const options = rawOptions.map((opt: any) => {
        const isCorrect = isUserChosen ? Boolean(opt.isCorrect || opt.correct || (explicitCorrectKey && String(opt.key || '').toUpperCase() === explicitCorrectKey)) : false
        const key = String(opt.key || '').toUpperCase()
        return {
          key,
          content: String(opt.content || ''),
          isCorrect,
          correct: isCorrect
        }
      })

      // Determine if question has answer
      let hasAnswer = false
      if (qType === 'MULTIPLE_CHOICE') {
        hasAnswer = isUserChosen && (options.some((o: any) => Boolean(o.isCorrect)) || Boolean(explicitCorrectKey))
      } else if (qType === 'SHORT_ANSWER') {
        hasAnswer = Boolean((q.answer && String(q.answer).trim().length > 0) || (explicitCorrectKey && explicitCorrectKey.trim().length > 0))
      } else {
        hasAnswer = Boolean(q.answer && String(q.answer).trim().length > 0)
      }

      const warnings: string[] = Array.isArray(q.warnings) ? [...q.warnings] : []
      const errors: string[] = Array.isArray(q.errors) ? [...q.errors] : []

      // If missing answer, add warning if not already present
      if (!hasAnswer && !errors.some(e => e.toLowerCase().includes('đáp án'))) {
        if (!warnings.some(w => w.toLowerCase().includes('đáp án'))) {
          warnings.push(qType === 'MULTIPLE_CHOICE' ? 'Chưa chọn đáp án đúng cho câu hỏi' : 'Chưa có đáp án mẫu chuẩn')
        }
      }

      let parsingStatus: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS'
      if (errors.length > 0) {
        parsingStatus = 'ERROR'
      } else if (!hasAnswer || warnings.length > 0) {
        parsingStatus = 'WARNING'
      }

      let section = q.section || ''
      if (!section) {
        if (qType === 'ESSAY') section = 'PHẦN I: TỰ LUẬN'
        else if (qType === 'MULTIPLE_CHOICE') section = 'PHẦN II: TRẮC NGHIỆM'
        else section = 'PHẦN III: TRẢ LỜI NGẮN'
      }

      return {
        temporaryId: String(q.temporaryId || `q_${q.questionNumber || idx + 1}`),
        questionNumber: Number(q.questionNumber) || idx + 1,
        type: qType,
        section,
        context: q.context || undefined,
        content: String(q.content || ''),
        options,
        answer: q.answer || (qType === 'MULTIPLE_CHOICE' ? explicitCorrectKey : (q.correctAnswer || null)),
        correctOptionKey: explicitCorrectKey || undefined,
        maxScore: q.maxScore || (qType === 'ESSAY' ? 30 : undefined),
        rubrics: q.rubrics || q.rubric || undefined,
        rubric: q.rubrics || q.rubric || undefined,
        hasAnswer,
        parsingStatus,
        warnings,
        errors
      }
    })

    const totalQuestions = questions.length
    const completedQuestions = questions.filter(q => q.hasAnswer).length
    const incompleteQuestions = totalQuestions - completedQuestions
    const essayCount = questions.filter(q => q.type === 'ESSAY').length
    const mcCount = questions.filter(q => q.type === 'MULTIPLE_CHOICE').length
    const shortAnswerCount = questions.filter(q => q.type === 'SHORT_ANSWER').length
    const successCount = questions.filter(q => q.parsingStatus === 'SUCCESS').length
    const warningCount = questions.filter(q => q.parsingStatus === 'WARNING').length
    const errorCount = questions.filter(q => q.parsingStatus === 'ERROR').length

    return {
      draftId: data.draftId || '',
      fileName: data.fileName || 'Exam.pdf',
      title: data.title || (data.fileName ? `ĐỀ THI TỪ FILE ${data.fileName.toUpperCase()}` : 'ĐỀ THI SÁT HẠCH CAND'),
      totalQuestions,
      essayCount,
      mcCount,
      shortAnswerCount,
      completedQuestions,
      incompleteQuestions,
      successCount,
      warningCount,
      errorCount,
      questions,
      warnings: data.warnings || [],
      errors: data.errors || []
    }
  }

  // 1. Tải lên tệp PDF để bóc tách & tạo DRAFT preview
  const handleFileUpload = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedFile
    if (!file) {
      setUploadError('Vui lòng chọn tệp PDF đề thi!')
      return
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Hệ thống chỉ hỗ trợ tệp định dạng .pdf (tối đa 20MB)!')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const rawData = await adminExamImportApi.previewImport(file, importMode)
      const normalized = normalizeDraft(rawData)
      setDraft(normalized)
      setValidationResult(null)
      
      // Cache draft ID in localStorage
      if (normalized.draftId) {
        localStorage.setItem(DRAFT_CACHE_KEY, normalized.draftId)
        setCachedDraftId(normalized.draftId)
      }

      showFeedback(`Bóc tách thành công ${normalized.totalQuestions} câu hỏi từ tệp "${normalized.fileName}"!`)
    } catch (err: any) {
      console.error('Lỗi khi tải file PDF:', err)
      const errMsg = err.response?.data?.message || err.message || 'Không thể bóc tách tệp PDF. Vui lòng kiểm tra lại cấu trúc file!'
      setUploadError(errMsg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Khôi phục bản nháp từ cache (GET /api/admin/exams/import/drafts/{draftId})
  const handleResumeCachedDraft = async () => {
    if (!cachedDraftId) return
    setIsLoadingCachedDraft(true)
    setUploadError(null)

    try {
      const rawData = await adminExamImportApi.getDraft(cachedDraftId)
      const normalized = normalizeDraft(rawData)
      setDraft(normalized)
      setValidationResult(null)
      showFeedback(`Đã khôi phục bản nháp "${normalized.title}"!`)
    } catch (err: any) {
      console.warn('Không thể tải lại bản nháp đã lưu:', err)
      localStorage.removeItem(DRAFT_CACHE_KEY)
      setCachedDraftId(null)
      setUploadError('Bản nháp đã hết hạn hoặc không tồn tại trên máy chủ.')
    } finally {
      setIsLoadingCachedDraft(false)
    }
  }

  // Tạo Draft Nhập Thủ Công (POST /api/admin/exams/import/manual)
  const handleCreateManualDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualDraftTitle.trim()) {
      alert('Vui lòng nhập tên đề thi bản nháp!')
      return
    }

    setIsCreatingManualDraft(true)
    try {
      const rawData = await adminExamImportApi.createManualDraft(manualDraftTitle.trim())
      const normalized = normalizeDraft(rawData)
      setDraft(normalized)
      setShowManualDraftModal(false)
      setManualDraftTitle('')
      
      if (normalized.draftId) {
        localStorage.setItem(DRAFT_CACHE_KEY, normalized.draftId)
        setCachedDraftId(normalized.draftId)
      }
      showFeedback('Đã khởi tạo bản nháp thủ công thành công! Bạn có thể thêm câu hỏi ngay.')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi tạo bản nháp thủ công!')
    } finally {
      setIsCreatingManualDraft(false)
    }
  }

  // 1-Click chọn nhanh đáp án đúng cho câu trắc nghiệm
  const handleQuickSetCorrect = async (question: DraftQuestion, optKey: string) => {
    if (!draft) return
    const key = optKey.toUpperCase()

    // Optimistic Update
    const updatedQuestions = draft.questions.map(q => {
      if (q.temporaryId !== question.temporaryId) return q

      const updatedOptions = (q.options || []).map(opt => {
        const isSelected = opt.key.toUpperCase() === key
        return {
          ...opt,
          isCorrect: isSelected,
          correct: isSelected
        }
      })

      const remainingWarnings = (q.warnings || []).filter(
        w => !w.toLowerCase().includes('đáp án') && !w.toLowerCase().includes('chưa chọn')
      )
      const remainingErrors = (q.errors || []).filter(
        e => !e.toLowerCase().includes('đáp án') && !e.toLowerCase().includes('chưa chọn')
      )
      const newStatus: 'SUCCESS' | 'WARNING' | 'ERROR' = remainingErrors.length > 0
        ? 'ERROR'
        : remainingWarnings.length > 0
          ? 'WARNING'
          : 'SUCCESS'

      return {
        ...q,
        options: updatedOptions,
        answer: key,
        correctOptionKey: key,
        hasAnswer: true,
        warnings: remainingWarnings,
        errors: remainingErrors,
        parsingStatus: newStatus
      }
    })

    const newDraft = normalizeDraft({ ...draft, questions: updatedQuestions })
    setDraft(newDraft)
    showFeedback(`Đã gán đáp án [${key}] cho Câu ${question.questionNumber}!`)

    // Gửi cập nhật lên máy chủ
    try {
      await adminExamImportApi.updateQuestion(draft.draftId, question.temporaryId, {
        questionNumber: question.questionNumber,
        type: question.type,
        content: question.content,
        context: question.context,
        correctOptionKey: key,
        answer: key,
        options: (question.options || []).map(opt => ({
          key: opt.key,
          content: opt.content,
          isCorrect: opt.key === key,
          correct: opt.key === key
        }))
      })
    } catch (err: any) {
      console.warn('Lỗi khi gửi cập nhật đáp án đúng lên máy chủ:', err)
    }
  }

  // 1-Click / Inline nhập nhanh đáp án cho câu trả lời ngắn
  const handleQuickSetShortAnswer = async (question: DraftQuestion, val: string) => {
    if (!draft) return
    const text = val.trim()
    const hasAns = text.length > 0

    const updatedQuestions = draft.questions.map(q => {
      if (q.temporaryId !== question.temporaryId) return q

      const remainingWarnings = (q.warnings || []).filter(
        w => !w.toLowerCase().includes('đáp án') && !w.toLowerCase().includes('chưa có')
      )
      const remainingErrors = (q.errors || []).filter(
        e => !e.toLowerCase().includes('đáp án') && !e.toLowerCase().includes('chưa có')
      )

      if (!hasAns) {
        remainingWarnings.push('Chưa có đáp án mẫu chuẩn')
      }

      const newStatus: 'SUCCESS' | 'WARNING' | 'ERROR' = remainingErrors.length > 0
        ? 'ERROR'
        : (!hasAns || remainingWarnings.length > 0)
          ? 'WARNING'
          : 'SUCCESS'

      return {
        ...q,
        answer: val,
        correctOptionKey: val,
        hasAnswer: hasAns,
        warnings: remainingWarnings,
        errors: remainingErrors,
        parsingStatus: newStatus
      }
    })

    const newDraft = normalizeDraft({ ...draft, questions: updatedQuestions })
    setDraft(newDraft)

    // Gửi cập nhật lên máy chủ
    try {
      await adminExamImportApi.updateQuestion(draft.draftId, question.temporaryId, {
        questionNumber: question.questionNumber,
        type: question.type,
        content: question.content,
        context: question.context,
        answer: val,
        options: []
      })
    } catch (err: any) {
      console.warn('Lỗi khi gửi cập nhật đáp án trả lời ngắn lên máy chủ:', err)
    }
  }

  // Mở Modal Chỉnh Sửa Câu Hỏi
  const handleOpenEditModal = (q: DraftQuestion) => {
    setEditingQuestion(q)
    setEditType(q.type)
    setEditQuestionNumber(q.questionNumber)
    setEditSection(q.section || '')
    setEditContext(q.context || '')
    setEditContent(q.content || '')
    
    // Chuẩn bị options cho trắc nghiệm (đảm bảo luôn có 4 phương án A, B, C, D)
    const existingOpts = q.options || []
    const defaultKeys = ['A', 'B', 'C', 'D']
    const preparedOpts = defaultKeys.map(k => {
      const found = existingOpts.find(o => o.key.toUpperCase() === k)
      return {
        key: k,
        content: found?.content || '',
        isCorrect: Boolean(found?.isCorrect || found?.correct || q.correctOptionKey === k || q.answer === k)
      }
    })
    setEditOptions(preparedOpts)

    const initialCorrectKey = q.correctOptionKey ||
      preparedOpts.find(o => o.isCorrect)?.key ||
      (q.type === 'MULTIPLE_CHOICE' && q.answer ? q.answer : '')
    setEditCorrectKey(initialCorrectKey || '')
    setEditAnswer(q.answer || '')
    setEditFormError(null)
  }

  // Lưu Chỉnh Sửa Câu Hỏi (PUT /api/admin/exams/import/drafts/{draftId}/questions/{questionId})
  const handleSaveEditedQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft || !editingQuestion) return

    if (!editContent.trim()) {
      setEditFormError('Nội dung câu hỏi không được để trống!')
      return
    }

    if (editType === 'MULTIPLE_CHOICE') {
      const validOptions = editOptions.filter(o => o.content.trim().length > 0)
      if (validOptions.length < 2) {
        setEditFormError('Câu trắc nghiệm phải có ít nhất 2 phương án!')
        return
      }
      if (!editCorrectKey) {
        setEditFormError('Vui lòng chọn 1 phương án làm đáp án đúng!')
        return
      }
    } else {
      if (!editAnswer.trim()) {
        setEditFormError('Câu tự luận / trả lời ngắn BẮT BUỘC phải có đáp án mẫu chuẩn!')
        return
      }
    }

    setIsSavingQuestion(true)
    setEditFormError(null)

    try {
      const payload: any = {
        questionNumber: editQuestionNumber,
        type: editType,
        section: editSection.trim() || undefined,
        context: editContext.trim() || undefined,
        content: editContent.trim()
      }

      if (editType === 'MULTIPLE_CHOICE') {
        payload.options = editOptions.map(opt => ({
          key: opt.key,
          content: opt.content.trim(),
          isCorrect: opt.key === editCorrectKey,
          correct: opt.key === editCorrectKey
        }))
        payload.correctOptionKey = editCorrectKey
        payload.answer = editCorrectKey
      } else {
        payload.answer = editAnswer.trim()
        payload.options = []
      }

      const updated = await adminExamImportApi.updateQuestion(
        draft.draftId,
        editingQuestion.temporaryId,
        payload
      )

      const updatedQuestions = draft.questions.map(q =>
        q.temporaryId === editingQuestion.temporaryId ? updated : q
      )

      setDraft(normalizeDraft({ ...draft, questions: updatedQuestions }))
      setEditingQuestion(null)
      showFeedback(`Đã cập nhật thành công Câu ${editQuestionNumber}!`)
    } catch (err: any) {
      setEditFormError(err.response?.data?.message || 'Lỗi khi cập nhật câu hỏi!')
    } finally {
      setIsSavingQuestion(false)
    }
  }

  // Mở Modal Thêm Câu Hỏi Mới
  const handleOpenAddModal = () => {
    const nextNumber = draft ? draft.questions.length + 1 : 1
    setNewQuestionNumber(nextNumber)
    setNewType('MULTIPLE_CHOICE')
    setNewSection(draft && draft.questions.length > 0 ? draft.questions[draft.questions.length - 1].section : 'PHẦN II: TRẮC NGHIỆM')
    setNewContext('')
    setNewContent('')
    setNewOptions([
      { key: 'A', content: '', isCorrect: false },
      { key: 'B', content: '', isCorrect: false },
      { key: 'C', content: '', isCorrect: false },
      { key: 'D', content: '', isCorrect: false }
    ])
    setNewCorrectKey('')
    setNewAnswer('')
    setAddFormError(null)
    setShowAddModal(true)
  }

  // Thêm Câu Hỏi Mới (POST /api/admin/exams/import/drafts/{draftId}/questions)
  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return

    if (!newContent.trim()) {
      setAddFormError('Nội dung câu hỏi không được để trống!')
      return
    }

    if (newType === 'MULTIPLE_CHOICE') {
      const validOptions = newOptions.filter(o => o.content.trim().length > 0)
      if (validOptions.length < 2) {
        setAddFormError('Câu trắc nghiệm phải có ít nhất 2 phương án!')
        return
      }
      if (!newCorrectKey) {
        setAddFormError('Vui lòng chọn 1 phương án làm đáp án đúng!')
        return
      }
    } else {
      if (!newAnswer.trim()) {
        setAddFormError('Câu tự luận / trả lời ngắn BẮT BUỘC phải có đáp án mẫu chuẩn!')
        return
      }
    }

    setIsAddingQuestion(true)
    setAddFormError(null)

    try {
      const payload: any = {
        questionNumber: newQuestionNumber,
        type: newType,
        section: newSection.trim() || undefined,
        context: newContext.trim() || undefined,
        content: newContent.trim()
      }

      if (newType === 'MULTIPLE_CHOICE') {
        payload.options = newOptions.map(opt => ({
          key: opt.key,
          content: opt.content.trim(),
          isCorrect: opt.key === newCorrectKey,
          correct: opt.key === newCorrectKey
        }))
        payload.correctOptionKey = newCorrectKey
        payload.answer = newCorrectKey
      } else {
        payload.answer = newAnswer.trim()
        payload.options = []
      }

      const added = await adminExamImportApi.addQuestion(draft.draftId, payload)
      
      const newQuestions = [...draft.questions, added]
      setDraft(normalizeDraft({ ...draft, questions: newQuestions }))
      setShowAddModal(false)
      showFeedback(`Đã thêm thành công Câu ${newQuestionNumber} vào bản nháp!`)
    } catch (err: any) {
      setAddFormError(err.response?.data?.message || 'Lỗi khi thêm câu hỏi mới!')
    } finally {
      setIsAddingQuestion(false)
    }
  }

  // Xóa Câu Hỏi (DELETE /api/admin/exams/import/drafts/{draftId}/questions/{questionId})
  const handleDeleteQuestion = async (temporaryId: string, qNumber: number) => {
    if (!draft) return
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Câu ${qNumber} khỏi bản nháp?`)) return

    try {
      const resDraft = await adminExamImportApi.deleteQuestion(draft.draftId, temporaryId)
      setDraft(normalizeDraft(resDraft))
      showFeedback(`Đã xóa Câu ${qNumber} khỏi bản nháp!`)
    } catch (err: any) {
      console.warn('Lỗi khi xóa câu hỏi trên máy chủ:', err)
      // Fallback xóa cục bộ
      const remaining = draft.questions.filter(q => q.temporaryId !== temporaryId)
      setDraft(normalizeDraft({ ...draft, questions: remaining }))
      showFeedback(`Đã xóa Câu ${qNumber} khỏi bản nháp!`)
    }
  }

  // Kiểm tra Hợp Lệ Toàn Diện (POST /api/admin/exams/import/drafts/{draftId}/validate)
  const handleValidate = async () => {
    if (!draft) return
    setIsValidating(true)

    try {
      const res = await adminExamImportApi.validateDraft(draft.draftId)
      setValidationResult(res)

      // Cập nhật thông tin chi tiết lỗi vào từng câu hỏi
      if (res.questionDetails && res.questionDetails.length > 0) {
        const detailMap = new Map<string, any>(res.questionDetails.map((d: any) => [d.temporaryId, d]))
        const updatedQuestions = draft.questions.map(q => {
          const detail: any = detailMap.get(q.temporaryId)
          if (!detail) return q
          const qErrors = detail.errors && detail.errors.length > 0 ? detail.errors : []
          const qWarnings = detail.warnings && detail.warnings.length > 0 ? detail.warnings : []
          const newStatus: 'SUCCESS' | 'WARNING' | 'ERROR' = qErrors.length > 0 ? 'ERROR' : qWarnings.length > 0 ? 'WARNING' : 'SUCCESS'
          return {
            ...q,
            errors: qErrors,
            warnings: qWarnings,
            parsingStatus: newStatus
          }
        })
        setDraft(normalizeDraft({ ...draft, questions: updatedQuestions }))
      }

      if (res.valid && (!res.errors || res.errors.length === 0)) {
        showFeedback('Đề thi hợp lệ 100%! Đủ điều kiện để xác nhận nhập đề chính thức.')
      } else {
        showFeedback(`Phát hiện ${res.errors?.length || 0} lỗi cần xử lý trước khi lưu!`)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi kiểm tra tính hợp lệ của đề thi!')
    } finally {
      setIsValidating(false)
    }
  }

  // Interactive Scroll to Question from Validation List
  const handleScrollToQuestion = (temporaryId: string) => {
    const el = document.getElementById(`question-card-${temporaryId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedQuestionId(temporaryId)
      setTimeout(() => setHighlightedQuestionId(null), 3000)
    }
  }

  // Xác Nhận Nhập Đề Chính Thức (POST /api/admin/exams/import/drafts/{draftId}/confirm)
  const handleConfirmImport = async () => {
    if (!draft) return

    // 1. Kiểm tra số câu thiếu đáp án (BẮT BUỘC ĐẦY ĐỦ 100%)
    if (draft.incompleteQuestions > 0) {
      const missingQuestions = draft.questions.filter(q => !q.hasAnswer)
      const missingLabels = missingQuestions.map(q => `Câu ${q.questionNumber}`).join(', ')
      alert(`⚠️ CHƯA THỂ IMPORT VÀO DATABASE!\n\nCòn ${draft.incompleteQuestions}/${draft.totalQuestions} câu hỏi chưa có đáp án đúng:\n- ${missingLabels}\n\nQuy chế bắt buộc: Bạn phải chọn/nhập đầy đủ đáp án đúng cho từng câu trước khi xác nhận lưu vào Database!`)
      return
    }

    // 2. Kiểm tra cờ lỗi
    if (draft.errorCount > 0) {
      alert(`Đề thi còn ${draft.errorCount} lỗi nghiêm trọng. Vui lòng kiểm tra và sửa các câu hỏi lỗi!`)
      return
    }

    setIsConfirming(true)
    try {
      // Gọi validate trước để đảm bảo
      const valRes = await adminExamImportApi.validateDraft(draft.draftId)
      setValidationResult(valRes)
      
      if (!valRes.valid) {
        alert(`Bản nháp chưa vượt qua kiểm tra hợp lệ:\n- ${(valRes.errors || []).join('\n- ')}`)
        setIsConfirming(false)
        return
      }

      // Xác nhận import chính thức
      const result = await adminExamImportApi.confirmImport(draft.draftId)
      setImportSuccessData(result)
      localStorage.removeItem(DRAFT_CACHE_KEY)
      setCachedDraftId(null)
      showFeedback('Nhập đề thi chính thức vào hệ thống thành công!')

      if (onImportSuccess) {
        onImportSuccess(result)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xác nhận nhập đề! Vui lòng kiểm tra lại.')
    } finally {
      setIsConfirming(false)
    }
  }

  // Hủy Bản Nháp (DELETE /api/admin/exams/import/drafts/{draftId})
  const handleCancelDraft = async () => {
    if (!draft) {
      onClose()
      return
    }

    if (window.confirm('Bạn có chắc chắn muốn hủy bản nháp này? Dữ liệu đang chỉnh sửa sẽ bị xóa khỏi bộ nhớ tạm.')) {
      try {
        await adminExamImportApi.cancelDraft(draft.draftId)
      } catch (err) {
        console.warn('Lỗi hủy draft trên server:', err)
      }
      localStorage.removeItem(DRAFT_CACHE_KEY)
      setCachedDraftId(null)
      setDraft(null)
      setValidationResult(null)
      onClose()
    }
  }

  // Lọc và Tìm Kiếm Câu Hỏi
  const filteredQuestions = useMemo(() => {
    if (!draft) return []
    return draft.questions.filter(q => {
      // Filter status
      let matchesStatus = true
      if (filterStatus === 'NEED_ANSWER') matchesStatus = !q.hasAnswer
      else if (filterStatus === 'HAS_ANSWER') matchesStatus = q.hasAnswer
      else if (filterStatus === 'ERROR') matchesStatus = q.parsingStatus === 'ERROR'
      else if (filterStatus === 'WARNING') matchesStatus = q.parsingStatus === 'WARNING'

      // Filter type
      let matchesType = true
      if (filterType !== 'ALL') matchesType = q.type === filterType

      // Search query
      let matchesSearch = true
      if (searchQuestion.trim()) {
        const query = searchQuestion.toLowerCase()
        matchesSearch = Boolean(
          q.content.toLowerCase().includes(query) ||
          `câu ${q.questionNumber}`.toLowerCase().includes(query) ||
          (q.context && q.context.toLowerCase().includes(query)) ||
          (q.section && q.section.toLowerCase().includes(query))
        )
      }

      return matchesStatus && matchesType && matchesSearch
    })
  }, [draft, filterStatus, filterType, searchQuestion])

  // Nhóm các câu hỏi theo Section
  const groupedQuestions = useMemo(() => {
    const groups: { [key: string]: DraftQuestion[] } = {}
    filteredQuestions.forEach(q => {
      const section = q.section || 'PHẦN CHUNG'
      if (!groups[section]) groups[section] = []
      groups[section].push(q)
    })
    return groups
  }, [filteredQuestions])

  // Completion percentage
  const completionPercent = draft && draft.totalQuestions > 0
    ? Math.round((draft.completedQuestions / draft.totalQuestions) * 100)
    : 0

  // Disable confirm condition
  const isConfirmDisabled =
    !draft ||
    draft.totalQuestions === 0 ||
    draft.incompleteQuestions > 0 ||
    draft.errorCount > 0 ||
    (validationResult !== null && !validationResult.valid)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-[#101520] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col text-slate-800 dark:text-slate-100"
        >
          {/* Toast Notification */}
          {feedbackMessage && (
            <div className="absolute top-4 right-14 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-slate-700 dark:border-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. MODAL HEADER                                                           */}
          {/* ========================================================================= */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-[#141a29] shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <FileUp className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Import Đề Thi Sát Hạch PDF
                  </h2>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    DRAFT WORKFLOW 2-STEP
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Quy trình chuẩn hóa 2 bước: Bóc tách tạo bản nháp xem trước (Draft Preview) & Rà soát đáp án trước khi lưu chính thức
                </p>
              </div>
            </div>

            <button
              onClick={handleCancelDraft}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="h-5 w-5 stroke-[2]" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. BODY CONTENT                                                           */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" ref={questionListRef}>

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 1: CHƯA CÓ BẢN NHÁP (UPLOAD PDF HOẶC TẠO MANUAL DRAFT)          */}
            {/* --------------------------------------------------------------------- */}
            {!draft && !importSuccessData && (
              <div className="max-w-3xl mx-auto py-6 space-y-6 animate-in fade-in">
                
                {/* Banner khôi phục bản nháp nếu có trong cache */}
                {cachedDraftId && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                          Phát hiện bản nháp đề thi đang làm dở!
                        </span>
                        <span className="text-indigo-700 dark:text-indigo-300 text-[11px]">
                          Mã bản nháp: <span className="font-mono font-bold">{cachedDraftId}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleResumeCachedDraft}
                        disabled={isLoadingCachedDraft}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isLoadingCachedDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                        <span>Tiếp Tục Bản Nháp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem(DRAFT_CACHE_KEY)
                          setCachedDraftId(null)
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title="Bỏ qua bản nháp này"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tiêu đề & Chọn Mode Import */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Chọn Chế Độ & Tải Lên Tệp Đề Thi PDF
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Hệ thống trích xuất nội dung thông minh bằng PDFBox 3.x, tự động phân nhóm phần Tự luận & Trắc nghiệm, chuẩn hóa Unicode và phân tách tình huống nghiệp vụ.
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 stroke-[2.2] shrink-0 text-rose-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* 3 Thẻ Chọn Chế Độ Import (ImportMode) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    1. Chọn chế độ bóc tách đề thi (Import Mode):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Mode FULL */}
                    <button
                      type="button"
                      onClick={() => setImportMode('FULL')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                        importMode === 'FULL'
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <Layers className="h-4 w-4" />
                          <span>FULL (Mặc định)</span>
                        </span>
                        {importMode === 'FULL' && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        Bóc tách cả Tự luận (Phần I) và Trắc nghiệm (Phần II). Đề xuất cho đề thi sát hạch toàn diện.
                      </p>
                    </button>

                    {/* Mode MCQ_ONLY */}
                    <button
                      type="button"
                      onClick={() => setImportMode('MCQ_ONLY')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                        importMode === 'MCQ_ONLY'
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4" />
                          <span>MCQ_ONLY</span>
                        </span>
                        {importMode === 'MCQ_ONLY' && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        Chỉ import các câu hỏi trắc nghiệm khách quan (4 phương án A, B, C, D).
                      </p>
                    </button>

                    {/* Mode ESSAY_ONLY */}
                    <button
                      type="button"
                      onClick={() => setImportMode('ESSAY_ONLY')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                        importMode === 'ESSAY_ONLY'
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          <span>ESSAY_ONLY</span>
                        </span>
                        {importMode === 'ESSAY_ONLY' && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        Chỉ import các câu hỏi tự luận xử lý tình huống thực tế và đọc hiểu văn bản.
                      </p>
                    </button>

                  </div>
                </div>

                {/* Vùng Dropzone Tải file PDF */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    2. Chọn tệp PDF đề thi từ máy tính:
                  </span>
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        handleFileUpload(file)
                      }
                    }}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3.5 transition-all cursor-pointer",
                      isUploading
                        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 cursor-wait"
                        : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                          handleFileUpload(file)
                        }
                      }}
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="space-y-3 flex flex-col items-center text-center">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-bounce">
                          <Loader2 className="h-7 w-7 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 block">
                            Đang tải lên & phân tích đề thi PDF...
                          </span>
                          <span className="text-xs text-slate-400">
                            Chế độ: <strong>{importMode}</strong> • Đang chuẩn hóa Unicode và phân tách câu hỏi...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm">
                          <FileText className="h-7 w-7 stroke-[1.8]" />
                        </div>
                        <div className="space-y-1 text-center">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                            Nhấp để chọn tệp PDF hoặc kéo thả tệp vào đây
                          </span>
                          <span className="text-xs text-slate-400">
                            Hỗ trợ tệp định dạng .pdf chuẩn Bộ Công An (Dung lượng tối đa 20MB)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tùy chọn Tạo Draft Nhập Thủ Công (Manual) */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Edit3 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Hoặc khởi tạo đề thi nhập tay (không cần PDF)
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Tạo một bản nháp trống và tự thêm các câu hỏi trắc nghiệm/tự luận trực tiếp
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowManualDraftModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tạo Draft Nhập Thủ Công</span>
                  </button>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 2: ĐÃ CÓ DRAFT PREVIEW (REVIEW, EDIT, VALIDATE & STATS)         */}
            {/* --------------------------------------------------------------------- */}
            {draft && !importSuccessData && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* 1. THANH TIÊU ĐỀ & ACTIONS NHANH CỦA BẢN NHÁP */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141a29] space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-800/80 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                          {draft.title || draft.fileName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          BẢN NHÁP (DRAFT)
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                        Tệp gốc: <strong>{draft.fileName}</strong> • Draft ID: <span className="font-mono text-[11px] font-semibold">{draft.draftId}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Thêm Câu Hỏi</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleValidate}
                        disabled={isValidating}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                        <span>Kiểm Tra Hợp Lệ</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. THANH TIẾN ĐỘ HOÀN THÀNH ĐÁP ÁN (ANSWER COMPLETION TRACKING) */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Tiến Độ Hoàn Thành Đáp Án:
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-mono font-bold text-[11px]",
                          draft.incompleteQuestions === 0
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                        )}>
                          {draft.completedQuestions}/{draft.totalQuestions} câu ({completionPercent}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                          Đã có đáp án: <strong>{draft.completedQuestions}</strong>
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                          Còn thiếu: <strong>{draft.incompleteQuestions}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          draft.incompleteQuestions === 0
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "bg-gradient-to-r from-amber-500 to-emerald-500"
                        )}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. 6 CARD THỐNG KÊ CHI TIẾT */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số câu</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {draft.totalQuestions}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Trắc nghiệm</span>
                      <span className="text-lg font-black text-indigo-700 dark:text-indigo-300 font-mono">
                        {draft.mcCount} câu
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Tự luận</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                        {draft.essayCount} câu
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/50">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">Đã có đáp án</span>
                      <span className="text-lg font-black text-teal-700 dark:text-teal-300 font-mono">
                        {draft.completedQuestions} câu
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Thiếu đáp án</span>
                      <span className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">
                        {draft.incompleteQuestions} câu
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Lỗi phân tích</span>
                      <span className="text-lg font-black text-rose-700 dark:text-rose-300 font-mono">
                        {draft.errorCount} câu
                      </span>
                    </div>

                  </div>

                  {/* 4. KẾT QUẢ VALIDATION & INTERACTIVE JUMP */}
                  {validationResult && (
                    <div className={cn(
                      "p-3.5 rounded-xl text-xs space-y-2 border animate-in fade-in",
                      validationResult.valid
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                    )}>
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-2">
                          {validationResult.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                          <span>
                            {validationResult.valid
                              ? "Bản nháp hợp lệ 100%! Đạt tiêu chuẩn để lưu chính thức vào cơ sở dữ liệu."
                              : `Phát hiện ${validationResult.errors?.length || 0} lỗi nghiêm trọng và ${validationResult.warnings?.length || 0} cảnh báo:`}
                          </span>
                        </div>
                      </div>

                      {/* Danh sách lỗi với liên kết cuộn tới câu hỏi */}
                      {validationResult.errors && validationResult.errors.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-rose-200 dark:border-rose-800">
                          <span className="font-bold text-rose-800 dark:text-rose-300 block">Lỗi nghiêm trọng:</span>
                          <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                            {validationResult.errors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Danh sách lỗi theo từng câu chi tiết để nhấp vào cuộn */}
                      {validationResult.questionDetails && validationResult.questionDetails.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          <span className="font-bold text-[11px] self-center mr-1">Nhấp để sửa nhanh:</span>
                          {validationResult.questionDetails.map((qd) => (
                            <button
                              key={qd.temporaryId}
                              type="button"
                              onClick={() => handleScrollToQuestion(qd.temporaryId)}
                              className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 hover:bg-rose-300 text-[10px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>Câu {qd.questionNumber}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 5. BỘ LỌC ĐA CHIỀU & Ô TÌM KIẾM */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  
                  {/* Filter Tabs Trạng thái */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('ALL')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap",
                        filterStatus === 'ALL'
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      Tất cả ({draft.questions.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterStatus('NEED_ANSWER')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
                        filterStatus === 'NEED_ANSWER'
                          ? "bg-rose-600 text-white shadow-2xs"
                          : "text-rose-700 dark:text-rose-400 hover:text-rose-800"
                      )}
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Thiếu đáp án ({draft.incompleteQuestions})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterStatus('HAS_ANSWER')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
                        filterStatus === 'HAS_ANSWER'
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Đã có đáp án ({draft.completedQuestions})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterStatus('ERROR')}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap",
                        filterStatus === 'ERROR'
                          ? "bg-rose-600 text-white shadow-2xs"
                          : "text-rose-700 dark:text-rose-400 hover:text-rose-800"
                      )}
                    >
                      <span>Lỗi ({draft.errorCount})</span>
                    </button>
                  </div>

                  {/* Filter Loại câu hỏi & Ô Search */}
                  <div className="flex items-center gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="ALL">Tất cả loại</option>
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                      <option value="ESSAY">Tự luận</option>
                      <option value="SHORT_ANSWER">Trả lời ngắn</option>
                    </select>

                    <div className="relative flex-1 sm:w-60">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm câu hỏi..."
                        value={searchQuestion}
                        onChange={(e) => setSearchQuestion(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                </div>

                {/* 6. DANH SÁCH CÂU HỎI THEO SECTION */}
                <div className="space-y-6 max-h-[52vh] overflow-y-auto pr-1">
                  {Object.keys(groupedQuestions).length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 italic rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    Object.entries(groupedQuestions).map(([sectionName, sectionQuestions]) => (
                      <div key={sectionName} className="space-y-3">
                        
                        {/* Section Header */}
                        <div className="sticky top-0 z-10 px-4 py-2 rounded-xl bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
                          <span className="font-bold text-xs text-slate-900 dark:text-white tracking-wide uppercase">
                            {sectionName}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {sectionQuestions.length} câu
                          </span>
                        </div>

                        {/* Danh sách câu trong Section */}
                        <div className="space-y-3 pl-1 sm:pl-2">
                          {sectionQuestions.map((q) => {
                            const isHighlighted = highlightedQuestionId === q.temporaryId

                            return (
                              <div
                                key={q.temporaryId}
                                id={`question-card-${q.temporaryId}`}
                                className={cn(
                                  "p-4 rounded-2xl border transition-all text-xs space-y-3 relative group",
                                  isHighlighted
                                    ? "ring-4 ring-rose-500 border-rose-500 bg-rose-50/30 dark:bg-rose-950/20"
                                    : !q.hasAnswer
                                      ? "border-rose-200 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10"
                                      : q.parsingStatus === 'WARNING'
                                        ? "border-amber-200 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                                )}
                              >
                                {/* Header của thẻ câu hỏi */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      Câu {q.questionNumber}
                                    </span>
                                    
                                    <span className={cn(
                                      "font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                      q.type === 'MULTIPLE_CHOICE'
                                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                        : q.type === 'ESSAY'
                                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                    )}>
                                      {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : q.type === 'ESSAY' ? 'Tự luận' : 'Trả lời ngắn'}
                                    </span>

                                    {/* ⭐ STATUS INDICATOR */}
                                    {q.hasAnswer ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                                        <span>Đã có đáp án</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse">
                                        <AlertCircle className="h-3 w-3 stroke-[2.5]" />
                                        <span>Chưa có đáp án</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Nút Sửa & Xóa */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(q)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 font-bold transition-colors cursor-pointer"
                                      title="Chỉnh sửa chi tiết câu hỏi này"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                      <span>Sửa</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(q.temporaryId, q.questionNumber)}
                                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                      title="Xóa câu hỏi khỏi bản nháp"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Khung Tình Huống / Context nếu có */}
                                {q.context && (
                                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs space-y-1">
                                    <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
                                      <BookOpen className="h-3.5 w-3.5" />
                                      Tình huống / Bối cảnh:
                                    </span>
                                    <p className="leading-relaxed italic">
                                      {q.context}
                                    </p>
                                  </div>
                                )}

                                {/* Nội dung câu hỏi */}
                                <p className="font-semibold text-slate-900 dark:text-white leading-relaxed text-sm">
                                  {q.content}
                                </p>

                                {/* PHƯƠNG ÁN TRẮC NGHIỆM VỚI TÍNH NĂNG 1-CLICK GÁN ĐÁP ÁN ĐÚNG */}
                                {q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {q.options.map((opt) => {
                                        const isCorrect = Boolean(opt.isCorrect || (opt as any).correct)
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleQuickSetCorrect(q, opt.key)}
                                            title={isCorrect ? `[${opt.key}] đang là đáp án đúng` : `Nhấp để chọn [${opt.key}] làm đáp án đúng`}
                                            className={cn(
                                              "p-2.5 rounded-xl border flex items-start gap-2.5 text-left transition-all cursor-pointer group w-full",
                                              isCorrect
                                                ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 font-medium ring-1 ring-emerald-500/30 shadow-2xs"
                                                : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30"
                                            )}
                                          >
                                            <span className={cn(
                                              "h-5 w-5 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 mt-0.5 font-bold transition-colors",
                                              isCorrect
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600"
                                            )}>
                                              {opt.key}
                                            </span>
                                            <span className="flex-1 text-xs leading-snug">{opt.content}</span>
                                            {isCorrect ? (
                                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                                ĐÚNG
                                              </span>
                                            ) : (
                                              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0 transition-opacity">
                                                Chọn đúng
                                              </span>
                                            )}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* DẠNG 1: ĐÁP ÁN TRẢ LỜI NGẮN (CÂU 55-60) */}
                                {q.type === 'SHORT_ANSWER' && (
                                  <div className={cn(
                                    "p-3 rounded-xl border text-xs space-y-2",
                                    q.answer || q.correctOptionKey
                                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80"
                                      : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80"
                                  )}>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-700 dark:text-slate-300">
                                        Đáp án đúng (Câu trả lời ngắn / điền khuyết):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(q)}
                                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        <span>Chi tiết</span>
                                      </button>
                                    </div>

                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={q.answer || q.correctOptionKey || ''}
                                        onChange={(e) => handleQuickSetShortAnswer(q, e.target.value)}
                                        placeholder="Nhập đáp án chuẩn cho câu trả lời ngắn này..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                      {!(q.answer || q.correctOptionKey) && (
                                        <span className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400 italic block">
                                          * Bắt buộc: Hãy nhập đáp án đúng để hệ thống chấm điểm tự động.
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* DẠNG 2: ĐÁP ÁN MẪU TỰ LUẬN & RUBRICS TIÊU CHÍ CHẤM */}
                                {q.type === 'ESSAY' && (
                                  <div className="space-y-2">
                                    <div className={cn(
                                      "p-3 rounded-xl border text-xs space-y-1",
                                      q.answer
                                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80"
                                        : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80"
                                    )}>
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                          Đáp án mẫu / Hướng dẫn giải tự luận ({q.maxScore || 30} điểm):
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditModal(q)}
                                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                          <span>Chỉnh sửa</span>
                                        </button>
                                      </div>
                                      {q.answer ? (
                                        <p className="font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-line">
                                          {q.answer}
                                        </p>
                                      ) : (
                                        <span className="font-medium text-amber-700 dark:text-amber-400 italic block">
                                          (Chờ cán bộ khảo thí chấm tự luận theo thang điểm)
                                        </span>
                                      )}
                                    </div>

                                    {/* Tiêu chí chấm điểm (Rubrics) nếu có */}
                                    {(q.rubrics || q.rubric) && Array.isArray(q.rubrics || q.rubric) && (q.rubrics || q.rubric)!.length > 0 && (
                                      <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-1.5">
                                        <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide text-[10.5px] block">
                                          Tiêu chí chấm điểm (Rubrics):
                                        </span>
                                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                                          {(q.rubrics || q.rubric)!.map((r, rIdx) => (
                                            <li key={rIdx} className="leading-relaxed">
                                              {r}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Danh sách lỗi / cảnh báo riêng của câu hỏi */}
                                {(q.errors.length > 0 || q.warnings.length > 0) && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {q.errors.map((err, eIdx) => (
                                      <span key={eIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>{err}</span>
                                      </span>
                                    ))}
                                    {q.warnings.map((warn, wIdx) => (
                                      <span key={wIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>{warn}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                              </div>
                            )
                          })}
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* SCREEN 3: CONFIRM IMPORT THÀNH CÔNG VÀO DATABASE POSTGRESQL            */}
            {/* --------------------------------------------------------------------- */}
            {importSuccessData && (
              <div className="p-8 text-center space-y-5 max-w-lg mx-auto animate-in zoom-in-95">
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Nhập Đề Thi Chính Thức Thành Công!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Toàn bộ câu hỏi đã được lưu an toàn vào cơ sở dữ liệu và sẵn sàng mở phòng thi khảo thí.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs space-y-2.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã đề thi:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {importSuccessData.examCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tên đề thi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {importSuccessData.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tổng số câu đã nhập:</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {importSuccessData.totalQuestionsImported} câu ({importSuccessData.mcCount} TN, {importSuccessData.essayCount || 0} TL)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-bold text-emerald-600">ĐANG MỞ ({importSuccessData.status})</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImportSuccessData(null)
                    setDraft(null)
                    onClose()
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Quay Về Danh Sách Phòng Thi
                </button>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 3. FOOTER ACTION BAR                                                      */}
          {/* ========================================================================= */}
          {draft && !importSuccessData && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#141a29] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              
              <button
                type="button"
                onClick={handleCancelDraft}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
              >
                Hủy Bản Nháp
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {isValidating ? 'Đang kiểm tra...' : 'Kiểm Tra Lại'}
                </button>

                {/* ⭐ NÚT CONFIRM IMPORT CHÍNH THỨC */}
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isConfirming || isConfirmDisabled}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer",
                    isConfirmDisabled
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20"
                  )}
                  title={
                    draft.incompleteQuestions > 0
                      ? `Còn ${draft.incompleteQuestions} câu hỏi chưa có đáp án đầy đủ`
                      : (validationResult !== null && !validationResult.valid)
                        ? "Bản nháp chưa đạt điều kiện kiểm tra hợp lệ"
                        : "Xác nhận nhập đề chính thức vào cơ sở dữ liệu"
                  }
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang Lưu Vào Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      <span>Xác Nhận Import ({draft.completedQuestions}/{draft.totalQuestions} Câu)</span>
                      <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MODAL: CHỈNH SỬA CÂU HỎI (EDIT QUESTION MODAL)                          */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {editingQuestion && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Chỉnh sửa Câu {editQuestionNumber}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {editType}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Cập nhật nội dung, loại câu hỏi, context và đáp án chuẩn
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {editFormError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{editFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveEditedQuestion} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Số thứ tự câu:
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={editQuestionNumber}
                          onChange={(e) => setEditQuestionNumber(Number(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Loại câu hỏi:
                        </label>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                          <option value="ESSAY">Tự luận</option>
                          <option value="SHORT_ANSWER">Trả lời ngắn</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tên phần (Section):
                        </label>
                        <input
                          type="text"
                          value={editSection}
                          onChange={(e) => setEditSection(e.target.value)}
                          placeholder="Ví dụ: PHẦN II: TRẮC NGHIỆM"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tình huống / Bối cảnh chung (Context - tùy chọn):
                      </label>
                      <textarea
                        rows={2}
                        value={editContext}
                        onChange={(e) => setEditContext(e.target.value)}
                        placeholder="Nhập tình huống hoặc đoạn trích nghiệp vụ nếu câu hỏi thuộc nhóm đọc hiểu..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nội dung câu hỏi <span className="text-rose-500">*</span>:
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    {/* Form cho Trắc nghiệm */}
                    {editType === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          4 Phương án & Chọn đáp án đúng (Radio):
                        </span>

                        <div className="space-y-2">
                          {editOptions.map((opt, idx) => (
                            <div key={opt.key} className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer shrink-0 font-mono font-bold">
                                <input
                                  type="radio"
                                  name="editCorrectOption"
                                  checked={editCorrectKey === opt.key}
                                  onChange={() => setEditCorrectKey(opt.key)}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-xs",
                                  editCorrectKey === opt.key ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700"
                                )}>
                                  {opt.key}
                                </span>
                              </label>

                              <input
                                type="text"
                                value={opt.content}
                                onChange={(e) => {
                                  const updated = [...editOptions]
                                  updated[idx].content = e.target.value
                                  setEditOptions(updated)
                                }}
                                placeholder={`Nội dung phương án ${opt.key}...`}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form cho Tự luận / Trả lời ngắn */}
                    {(editType === 'ESSAY' || editType === 'SHORT_ANSWER') && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="font-bold text-slate-800 dark:text-slate-200 block">
                          Đáp án mẫu chuẩn <span className="text-rose-500">* (Bắt buộc)</span>:
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          placeholder="Nhập nội dung đáp án chuẩn làm căn cứ chấm thi..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingQuestion}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50 shadow-md"
                      >
                        {isSavingQuestion && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Lưu Cập Nhật</span>
                      </button>
                    </div>

                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* 5. MODAL: THÊM CÂU HỎI MỚI (ADD QUESTION MODAL)                            */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {showAddModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Thêm Câu Hỏi Mới Vào Bản Nháp
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {addFormError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{addFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddQuestionSubmit} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Số thứ tự câu:</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={newQuestionNumber}
                          onChange={(e) => setNewQuestionNumber(Number(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1">Loại câu hỏi:</label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                          <option value="ESSAY">Tự luận</option>
                          <option value="SHORT_ANSWER">Trả lời ngắn</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold block mb-1">Tên phần (Section):</label>
                        <input
                          type="text"
                          value={newSection}
                          onChange={(e) => setNewSection(e.target.value)}
                          placeholder="Ví dụ: PHẦN II: TRẮC NGHIỆM"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Tình huống / Bối cảnh chung (tùy chọn):</label>
                      <textarea
                        rows={2}
                        value={newContext}
                        onChange={(e) => setNewContext(e.target.value)}
                        placeholder="Nhập tình huống hoặc bối cảnh nếu có..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Nội dung câu hỏi *:</label>
                      <textarea
                        rows={3}
                        required
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    {newType === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-bold block">4 Phương án & Chọn đáp án đúng:</span>
                        <div className="space-y-2">
                          {newOptions.map((opt, idx) => (
                            <div key={opt.key} className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer shrink-0 font-mono font-bold">
                                <input
                                  type="radio"
                                  name="newCorrectOption"
                                  checked={newCorrectKey === opt.key}
                                  onChange={() => setNewCorrectKey(opt.key)}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-xs",
                                  newCorrectKey === opt.key ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700"
                                )}>
                                  {opt.key}
                                </span>
                              </label>

                              <input
                                type="text"
                                value={opt.content}
                                onChange={(e) => {
                                  const updated = [...newOptions]
                                  updated[idx].content = e.target.value
                                  setNewOptions(updated)
                                }}
                                placeholder={`Nội dung phương án ${opt.key}...`}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(newType === 'ESSAY' || newType === 'SHORT_ANSWER') && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="font-bold block">Đáp án mẫu chuẩn * (Bắt buộc):</label>
                        <textarea
                          rows={3}
                          required
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          placeholder="Nhập nội dung đáp án chuẩn..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingQuestion}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isAddingQuestion && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Thêm Câu Hỏi</span>
                      </button>
                    </div>

                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* 6. MODAL: TẠO DRAFT NHẬP THỦ CÔNG (CREATE MANUAL DRAFT)                    */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {showManualDraftModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Tạo Bản Nháp Đề Thi Mới
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowManualDraftModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateManualDraft} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                        Tên đề thi sát hạch:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: ĐỀ THI SÁT HẠCH NGHIỆP VỤ CA4 - ĐỢT 1/2026..."
                        value={manualDraftTitle}
                        onChange={(e) => setManualDraftTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowManualDraftModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingManualDraft}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingManualDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Khởi Tạo Bản Nháp</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default ExamImportReviewModal
