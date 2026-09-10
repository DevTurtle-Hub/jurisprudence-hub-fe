import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Loader2,
  RefreshCw,
  Layers,
  Send,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShieldAlert,
  Lock,
  LogIn,
  ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { questionBankApi } from '@/services/questionBankApi'
import type {
  QuestionBankResponse,
  QuestionBankRequest,
  QuestionBankMcOptionRequest
} from '@/types/questionBank'
import { QuestionBankImportModal } from '@/features/exams/components/QuestionBankImportModal'
import { toast } from 'sonner'

export function QuestionBankPage() {
  const navigate = useNavigate()
  const { currentUser, isLoggedIn, openAuthModal } = useAuth()

  // Kiểm tra quyền Admin: chỉ Admin mới có quyền xem & thêm sửa xóa ngân hàng câu hỏi
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'admin@gmail.com'

  // Dữ liệu danh sách câu hỏi từ API thật
  const [questions, setQuestions] = useState<QuestionBankResponse[]>([])
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalElements: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bộ lọc: 1. Tất cả, 2. Trắc nghiệm chọn A B C D, 3. Trắc nghiệm điền đáp án
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MC_CHOICE' | 'MC_FILL'>('ALL')
  const [draftFilter, setDraftFilter] = useState<boolean | 'ALL'>('ALL')

  // Modal Import / Parse
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Modal Tạo tay / Chỉnh sửa
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankResponse | null>(null)
  const [isCreateManualOpen, setIsCreateManualOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<'MC' | 'ESSAY'>('MC')
  const [formCategory, setFormCategory] = useState('Pháp luật CAND')
  const [formText, setFormText] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formExplanation, setFormExplanation] = useState('')
  const [formLegalRef, setFormLegalRef] = useState('')
  const [formSampleEssay, setFormSampleEssay] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formEditReason, setFormEditReason] = useState('')
  const [formOptions, setFormOptions] = useState<QuestionBankMcOptionRequest[]>([
    { label: 'A', optionText: '', isCorrect: false },
    { label: 'B', optionText: '', isCorrect: false },
    { label: 'C', optionText: '', isCorrect: false },
    { label: 'D', optionText: '', isCorrect: false },
  ])
  const [formCorrectKey, setFormCorrectKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopiedEssay, setIsCopiedEssay] = useState(false)

  // Chi tiết câu hỏi Modal
  const [viewingQuestion, setViewingQuestion] = useState<QuestionBankResponse | null>(null)

  // Load danh sách câu hỏi (chỉ thực hiện khi có quyền Admin)
  const fetchQuestions = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await questionBankApi.getQuestions({
        page: pageInfo.page,
        limit: pageInfo.limit,
        keyword: keyword.trim() || undefined,
        category: categoryFilter.trim() || undefined,
        // Backend chỉ nhận 'MC' hoặc 'ESSAY', không nhận MC_CHOICE/MC_FILL
        questionType: undefined,
        isDraft: draftFilter === 'ALL' ? undefined : draftFilter,
      })

      if (res) {
        setQuestions(res.content || [])
        setPageInfo(prev => ({
          ...prev,
          totalPages: res.totalPages || 1,
          totalElements: res.totalElements || 0,
        }))
      } else {
        setQuestions([])
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách ngân hàng câu hỏi:', err)
      setError(err?.response?.data?.message || err.message || 'Không thể kết nối máy chủ API')
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, pageInfo.page, pageInfo.limit, keyword, categoryFilter, typeFilter, draftFilter])

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions()
    }
  }, [isAdmin, fetchQuestions])

  // Xóa câu hỏi
  const handleDelete = async (q: QuestionBankResponse) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền xóa câu hỏi!')
      return
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${q.title || q.questionText.slice(0, 60)}..."?`)) {
      return
    }

    try {
      await questionBankApi.deleteQuestion(q.id)
      toast.success('Đã xóa câu hỏi khỏi ngân hàng đề!')
      fetchQuestions()
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi xóa câu hỏi')
    }
  }

  // Publish câu hỏi (chuyển Draft sang Published)
  const handlePublish = async (q: QuestionBankResponse) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền xuất bản câu hỏi!')
      return
    }
    try {
      await questionBankApi.publishQuestion(q.id)
      toast.success(`Đã xuất bản (Publish) câu hỏi: "${q.title}" thành công!`)
      fetchQuestions()
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi publish câu hỏi')
    }
  }

  // Mở modal tạo câu hỏi
  const handleOpenCreateManual = () => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền thêm câu hỏi!')
      return
    }
    setEditingQuestion(null)
    setFormTitle('')
    setFormType('MC')
    setFormCategory('Pháp luật CAND')
    setFormText('')
    setFormDescription('')
    setFormExplanation('')
    setFormLegalRef('')
    setFormSampleEssay('')
    setFormTags('')
    setFormEditReason('')
    setFormOptions([
      { label: 'A', optionText: '', isCorrect: false },
      { label: 'B', optionText: '', isCorrect: false },
      { label: 'C', optionText: '', isCorrect: false },
      { label: 'D', optionText: '', isCorrect: false },
    ])
    setFormCorrectKey('')
    setIsCreateManualOpen(true)
  }

  // Mở modal sửa câu hỏi
  const handleOpenEdit = (q: QuestionBankResponse) => {
    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền chỉnh sửa câu hỏi!')
      return
    }
    setEditingQuestion(q)
    setFormTitle(q.title || '')
    setFormType((q.questionType?.toUpperCase() === 'ESSAY' ? 'ESSAY' : 'MC') as 'MC' | 'ESSAY')
    setFormCategory(q.category || 'Pháp luật CAND')
    setFormText(q.questionText || '')
    setFormDescription(q.description || '')
    setFormExplanation(q.explanation || '')
    setFormLegalRef(q.legalReference || '')
    setFormSampleEssay(q.sampleEssay || '')
    setFormTags(q.tags || '')
    setFormEditReason('')
    
    // Convert old options structure to local form state
    const correct = q.correctAnswer || q.options?.find(o => o.isCorrect)?.label || 'A'
    setFormCorrectKey(correct)

    if (q.options && q.options.length > 0) {
      setFormOptions(q.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        optionText: opt.text,
        isCorrect: opt.label === correct || opt.isCorrect,
      })))
    } else {
      setFormOptions([
        { label: 'A', optionText: '', isCorrect: true },
        { label: 'B', optionText: '', isCorrect: false },
        { label: 'C', optionText: '', isCorrect: false },
        { label: 'D', optionText: '', isCorrect: false },
      ])
    }
    setIsCreateManualOpen(true)
  }

  // Submit form tạo / sửa câu hỏi
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      toast.error('Chỉ Quản Trị Viên (Admin) mới có quyền thao tác ngân hàng câu hỏi!')
      return
    }

    if (!formTitle.trim() || !formText.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung câu hỏi!')
      return
    }

    if (formType === 'MC') {
      const validOpts = formOptions.filter(o => o.optionText.trim())
      if (validOpts.length < 2) {
        alert('Câu hỏi trắc nghiệm phải có ít nhất 2 phương án!')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload: QuestionBankRequest = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory.trim() || undefined,
        questionType: formType,
        questionText: formText.trim(),
        correctAnswer: formType === 'MC' ? formCorrectKey : undefined,
        explanation: formExplanation.trim() || undefined,
        legalReference: formLegalRef.trim() || undefined,
        sampleEssay: formType === 'ESSAY' ? (formSampleEssay.trim() || undefined) : undefined,
        tags: formTags.trim() || undefined,
        isDraft: editingQuestion ? editingQuestion.isDraft : true,
        options: formType === 'MC'
          ? formOptions.map(opt => ({
              id: opt.id,
              label: opt.label,
              optionText: opt.optionText.trim(),
              isCorrect: opt.label === formCorrectKey,
            }))
          : undefined,
      }

      if (editingQuestion) {
        await questionBankApi.updateQuestion(editingQuestion.id, payload, formEditReason.trim() || undefined)
        toast.success('Cập nhật câu hỏi thành công!')
      } else {
        await questionBankApi.createManualQuestion(payload)
        toast.success('Tạo câu hỏi tay thành công (trạng thái Draft)!')
      }

      setIsCreateManualOpen(false)
      fetchQuestions()
    } catch (err: any) {
      console.error('Lỗi khi lưu câu hỏi:', err)
      alert(err?.response?.data?.message || err.message || 'Lỗi khi lưu câu hỏi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // NẾU NGƯỜI DÙNG KHÔNG PHẢI ADMIN: HIỂN THỊ MÀN HÌNH KHÓA QUYỀN TRUY CẬP (ACCESS DENIED)
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-[#151a28] rounded-3xl border border-red-100 dark:border-red-950/60 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo T05 & Icon Khóa */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <img 
              src="/t05-logo.png" 
              alt="T05 ĐH Cảnh Sát Nhân Dân" 
              className="w-16 h-16 object-contain opacity-25 filter grayscale absolute" 
            />
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800/80 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner relative z-10">
              <Lock className="h-7 w-7" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] font-black uppercase tracking-wider mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Khu vực giới hạn nghiệp vụ</span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Quyền Truy Cập Bị Giới Hạn
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Ngân hàng câu hỏi sát hạch chỉ dành riêng cho <span className="font-bold text-red-600 dark:text-red-400">Ban Giảng Viên & Quản Trị Viên T05</span> (Admin) để biên soạn, kiểm duyệt và quản lý đề thi.
          </p>

          <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Tài khoản hiện tại:</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {currentUser ? `${currentUser.name} (${currentUser.email})` : 'Khách chưa đăng nhập'}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>Vai trò hiện tại:</span>
              <span className="font-bold uppercase tracking-wider">{currentUser?.role || 'Chưa xác thực'}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            {!isLoggedIn ? (
              <button
                onClick={() => openAuthModal('/question-bank')}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập Admin</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('/question-bank')}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Đổi tài khoản</span>
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-700/80"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Về Trang chủ</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            Cần quyền biên soạn? Vui lòng liên hệ Phòng Đào tạo T05.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 w-full font-sans antialiased text-slate-900 dark:text-white">
      {/* Top Hero Banner Hiện Đại */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-500/10 via-white to-cyan-500/10 dark:from-indigo-950/40 dark:via-[#111625] dark:to-blue-950/30 shadow-xl shadow-indigo-500/5">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-gradient-to-tl from-cyan-500/20 via-teal-500/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-40 blur-md group-hover:opacity-75 transition-opacity" />
              <img 
                src="/t05-logo.png" 
                alt="T05 ĐH Cảnh Sát Nhân Dân" 
                className="relative h-14 w-14 object-contain rounded-2xl p-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 shadow-md" 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-red-500/15 to-amber-500/15 text-red-700 dark:text-red-300 border border-red-500/25 dark:border-red-800/40 uppercase tracking-wider">
                  T05 • ĐH Cảnh Sát Nhân Dân
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-mono text-xs font-black border border-blue-500/30">
                  {pageInfo.totalElements} câu hỏi
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  Ngân Hàng Câu Hỏi Sát Hạch Pháp Luật
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Kho dữ liệu trắc nghiệm & tự luận chuẩn hóa Trường Đại học Cảnh sát nhân dân (T05)
              </p>
            </div>
          </div>

          {/* Nút hành động chuẩn hóa 2 dạng */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <FileUp className="h-4 w-4" />
              <span>Import Trắc Nghiệm (Từ File)</span>
            </button>

            <button
              onClick={handleOpenCreateManual}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nhập Tay Tự Luận</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Bộ 3 tab phân loại yêu cầu: 1. Tất cả | 2. Trắc nghiệm chọn A B C D | 3. Trắc nghiệm điền đáp án */}
        <div className="inline-flex rounded-xl border border-slate-200/80 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800/60 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setTypeFilter('ALL')
              setPageInfo(p => ({ ...p, page: 1 }))
            }}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              typeFilter === 'ALL'
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>1. Tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter('MC_CHOICE')
              setPageInfo(p => ({ ...p, page: 1 }))
            }}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              typeFilter === 'MC_CHOICE'
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>2. Trắc nghiệm chọn A B C D</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter('MC_FILL')
              setPageInfo(p => ({ ...p, page: 1 }))
            }}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              typeFilter === 'MC_FILL'
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>3. Trắc nghiệm điền đáp án</span>
          </button>
        </div>

        {/* Tìm kiếm & Lọc bổ sung */}
        <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nội dung, tiêu đề..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPageInfo(p => ({ ...p, page: 1 }))
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Lọc chuyên mục */}
          <input
            type="text"
            placeholder="Lọc danh mục..."
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPageInfo(p => ({ ...p, page: 1 }))
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-32"
          />

          {/* Lọc trạng thái Draft / Published */}
          <select
            value={draftFilter === 'ALL' ? 'ALL' : draftFilter ? 'DRAFT' : 'PUBLISHED'}
            onChange={(e) => {
              const val = e.target.value
              setDraftFilter(val === 'ALL' ? 'ALL' : val === 'DRAFT')
              setPageInfo(p => ({ ...p, page: 1 }))
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp (Draft)</option>
            <option value="PUBLISHED">Đã xuất bản (Published)</option>
          </select>

          <button
            onClick={fetchQuestions}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Nội dung danh sách câu hỏi */}
      {isLoading ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Đang tải dữ liệu ngân hàng câu hỏi...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-900/50 space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchQuestions}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Chưa có câu hỏi nào trong ngân hàng
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Hãy bấm vào "Bóc Tách & Import File" để trích xuất đề thi từ file hoặc "Tạo Câu Hỏi Tay" để thêm mới.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Bóc Tách File Ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const displayedQuestions = questions.filter(q => {
              const hasOptions = !!(q.options && q.options.length >= 2)
              if (typeFilter === 'MC_CHOICE') return hasOptions
              if (typeFilter === 'MC_FILL') return !hasOptions
              return true
            })

            if (displayedQuestions.length === 0) {
              return (
                <div className="p-12 text-center text-xs text-slate-400 italic rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                  Không có câu hỏi nào thuộc phân loại đã chọn.
                </div>
              )
            }

            return displayedQuestions.map((q, idx) => {
              const hasOptions = !!(q.options && q.options.length >= 2)
              const isMC = q.questionType === 'MC'
              const itemNumber = (pageInfo.page - 1) * pageInfo.limit + idx + 1

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all space-y-3.5 group"
                >
                  {/* Header card */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                        #{itemNumber}
                      </span>

                      {/* Huy hiệu loại câu hỏi rõ ràng */}
                      {hasOptions ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                          Trắc nghiệm chọn A B C D
                        </span>
                      ) : isMC || q.questionType === 'ESSAY' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          {q.sampleEssay ? 'Tự luận (Có bài mẫu)' : 'Trắc nghiệm điền đáp án'}
                        </span>
                      ) : null}

                    {q.isDraft ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Bản nháp (Draft)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã xuất bản (Published)
                      </span>
                    )}

                    {q.category && (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        • {q.category}
                      </span>
                    )}
                  </div>

                  {/* Nút hành động cho câu hỏi */}
                  <div className="flex items-center gap-1.5">
                    {q.isDraft && (
                      <button
                        type="button"
                        onClick={() => handlePublish(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        title="Duyệt xuất bản câu hỏi"
                      >
                        <Send className="h-3 w-3" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setViewingQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(q)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Tiêu đề câu hỏi */}
                {q.title && (
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {q.title}
                  </h3>
                )}

                {/* Nội dung câu hỏi */}
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.questionText}
                </p>

                {/* Phương án trắc nghiệm */}
                {isMC && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map(opt => {
                      const isCorrect = opt.isCorrect || q.correctAnswer === opt.label
                      return (
                        <div
                          key={opt.id || opt.label}
                          className={cn(
                            "p-2.5 rounded-xl border flex items-start gap-2 text-xs",
                            isCorrect
                              ? "border-emerald-500/80 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-medium"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <span className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 font-bold",
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                          )}>
                            {opt.label}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                              (Đáp án đúng)
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Tự luận */}
                {!isMC && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Gợi ý trả lời / Đáp án mẫu:</span>
                      <p className="whitespace-pre-line leading-relaxed">
                        {q.correctAnswer || q.explanation || 'Chưa có gợi ý chi tiết.'}
                      </p>
                    </div>

                    {q.sampleEssay && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Bài viết mẫu hoàn chỉnh (Sample Essay):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(q.sampleEssay || '')
                              toast.success('Đã sao chép nội dung bài viết mẫu!')
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy bài mẫu</span>
                          </button>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-[11.5px] font-mono bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                          {q.sampleEssay}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata chân trang */}
                <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span>
                    Người tạo: <strong className="text-slate-600 dark:text-slate-300">{q.createdBy || 'Hệ thống'}</strong>
                    {q.createdAt && ` • ${new Date(q.createdAt).toLocaleDateString('vi-VN')}`}
                  </span>
                  {q.legalReference && (
                    <span className="truncate max-w-xs text-slate-500 italic">
                      Căn cứ: {q.legalReference}
                    </span>
                  )}
                </div>
              </div>
            )
            })
          })()}

          {/* Phân trang */}
          {pageInfo.totalPages > 1 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Trang {pageInfo.page} / {pageInfo.totalPages} ({pageInfo.totalElements} câu hỏi)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pageInfo.page <= 1}
                  onClick={() => setPageInfo(p => ({ ...p, page: p.page - 1 }))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={pageInfo.page >= pageInfo.totalPages}
                  onClick={() => setPageInfo(p => ({ ...p, page: p.page + 1 }))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Import / Bóc Tách Đề */}
      <QuestionBankImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchQuestions()
        }}
        onSwitchToManualEssay={handleOpenCreateManual}
      />

      {/* Modal Tạo Tay / Chỉnh Sửa Câu Hỏi Tự Luận */}
      <AnimatePresence>
        {isCreateManualOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Tự luận (ESSAY)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {editingQuestion ? 'Cập Nhật Câu Hỏi Tự Luận' : 'Tạo Mới Câu Hỏi Tự Luận'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nhập nội dung đề bài và bài viết văn mẫu hướng dẫn làm bài tự luận
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateManualOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Nội Dung */}
              <form onSubmit={handleSaveForm} className="space-y-5">
                {/* Tiêu đề & Danh mục */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-sm text-slate-700 dark:text-slate-300 block mb-1.5">
                      Tiêu đề câu hỏi <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phân tích vai trò CAND trong an ninh quốc gia..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-sm text-slate-700 dark:text-slate-300 block mb-1.5">
                      Chuyên mục / Lĩnh vực:
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Pháp luật đại cương CAND, Tố tụng hình sự..."
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                {/* Nội dung đề bài */}
                <div>
                  <label className="font-bold text-sm text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nội dung câu hỏi đề bài <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập đề bài câu hỏi tự luận chi tiết (yêu cầu thí sinh phân tích, trình bày quan điểm, giải quyết tình huống pháp lý)..."
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    className="w-full p-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 transition-all leading-relaxed"
                  />
                </div>

                {/* Bài viết mẫu (Sample Essay) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                      <span>Bài viết mẫu hoàn chỉnh (Sample Essay):</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Tùy chọn
                      </span>
                    </label>
                    <span className="text-xs text-slate-400 italic">
                      Dùng làm đáp án chuẩn & tài liệu tham khảo cho người học
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={formSampleEssay}
                    onChange={(e) => setFormSampleEssay(e.target.value)}
                    placeholder="Nhập toàn bộ bài viết mẫu hoàn chỉnh: mở bài, dàn ý phân tích các luận điểm chính, trích dẫn quy định liên quan và kết luận..."
                    className="w-full p-4 text-sm rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed font-mono"
                  />
                </div>

                {/* Ghi nhận lý do sửa (khi update) */}
                {editingQuestion && (
                  <div>
                    <label className="font-bold text-sm text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lý do chỉnh sửa (Ghi nhận lịch sử audit):
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Cập nhật văn phong bài mẫu, sửa chính tả..."
                      value={formEditReason}
                      onChange={(e) => setFormEditReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateManualOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang Lưu...</span>
                      </>
                    ) : (
                      <span>{editingQuestion ? 'Lưu Thay Đổi' : 'Tạo Câu Hỏi Tự Luận'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Modal Xem Chi Tiết Câu Hỏi */}
      <AnimatePresence>
        {viewingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                    viewingQuestion.questionType === 'MC'
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                      : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  )}>
                    {viewingQuestion.questionType === 'MC' ? 'Trắc nghiệm' : 'Tự luận'}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {viewingQuestion.title || 'Chi Tiết Câu Hỏi'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingQuestion(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block">Nội dung câu hỏi:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed">
                    {viewingQuestion.questionText}
                  </p>
                </div>

                {viewingQuestion.questionType === 'MC' && viewingQuestion.options && (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-bold text-slate-500 block">Các phương án lựa chọn:</span>
                    <div className="space-y-1.5">
                      {viewingQuestion.options.map(opt => {
                        const isCorrect = opt.isCorrect || viewingQuestion.correctAnswer === opt.label
                        return (
                          <div
                            key={opt.id || opt.label}
                            className={cn(
                              "p-2.5 rounded-xl border flex items-start gap-2",
                              isCorrect
                                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <span className="font-mono">{opt.label}.</span>
                            <span>{opt.text}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                (ĐÁP ÁN ĐÚNG)
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {viewingQuestion.questionType === 'ESSAY' && viewingQuestion.sampleEssay && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Bài viết mẫu hoàn chỉnh (Sample Essay):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewingQuestion.sampleEssay || '')
                          setIsCopiedEssay(true)
                          toast.success('Đã sao chép nội dung bài viết mẫu!')
                          setTimeout(() => setIsCopiedEssay(false), 2500)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                      >
                        {isCopiedEssay ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{isCopiedEssay ? 'Đã chép' : 'Sao chép bài mẫu'}</span>
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 font-mono text-xs leading-relaxed whitespace-pre-line">
                      {viewingQuestion.sampleEssay}
                    </div>
                  </div>
                )}

                {viewingQuestion.explanation && (
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
                    <span className="font-bold block">Giải thích đáp án:</span>
                    <p className="mt-1 leading-relaxed">{viewingQuestion.explanation}</p>
                  </div>
                )}

                {viewingQuestion.legalReference && (
                  <div className="text-slate-500 italic">
                    <strong>Căn cứ pháp lý:</strong> {viewingQuestion.legalReference}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
