import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  HelpCircle,
  Users,
  ArrowRight,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  Hash,
  Layers,
  Loader2,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  Filter,
  RotateCcw,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, cleanQuestionText } from '@/lib/utils'
import type { ExamRoom, CandidateVerification, MultipleChoiceQuestion } from '@/features/exams/types'
import { CreateRoomModal } from '@/features/exams/components/CreateRoomModal'
import { CandidateVerificationModal, saveCandidateProfile } from '@/features/exams/components/CandidateVerificationModal'
import { ExamImportReviewModal } from '@/features/exams/components/ExamImportReviewModal'
import {
  RealisticClock3DIcon,
  RealisticQuiz3DIcon,
  RealisticEssay3DIcon
} from '@/components/common/RealisticExamIcons'
import { examApi } from '@/services/examApi'
import { toast } from 'sonner'

export function ExamPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Danh sách phòng thi (Dữ liệu thật 100% từ Database qua Spring Boot)
  const [examRooms, setExamRooms] = useState<ExamRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Trạng thái tìm kiếm & lọc
  const [searchQuery, setSearchQuery] = useState('')
  const [quickRoomCode, setQuickRoomCode] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN'>('ALL')
  const [durationFilter, setDurationFilter] = useState<'ALL' | number>('ALL')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedRoomForVerify, setSelectedRoomForVerify] = useState<ExamRoom | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Nhận diện action và filter từ Dropdown Menu Sidebar
  useEffect(() => {
    if (!location.search) return
    const params = new URLSearchParams(location.search)
    const action = params.get('action')
    if (action === 'create') {
      setIsCreateModalOpen(true)
    }
    const filter = params.get('filter')
    if (filter === 'standard') {
      setSearchQuery('Chuẩn đầu ra')
    }
  }, [location.search])

  // State chỉnh sửa phòng thi (Edit Room Modal)
  const [editingRoom, setEditingRoom] = useState<ExamRoom | null>(null)
  const [editRoomTitle, setEditRoomTitle] = useState('')
  const [editRoomCode, setEditRoomCode] = useState('')
  const [editRoomDuration, setEditRoomDuration] = useState(60)
  const [editRoomDescription, setEditRoomDescription] = useState('')
  const [editRoomStatus, setEditRoomStatus] = useState<'OPEN' | 'UPCOMING' | 'CLOSED'>('OPEN')
  const [editRoomMC, setEditRoomMC] = useState<MultipleChoiceQuestion[]>([])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Lấy dữ liệu phòng thi thực tế 100% từ Database Backend Spring Boot
  const fetchExamRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await examApi.getRooms({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      })
      
      let serverItems: ExamRoom[] = []
      if (Array.isArray(data)) {
        serverItems = data
      } else if (data && Array.isArray(data.items)) {
        serverItems = data.items
      } else if (data && Array.isArray(data.content)) {
        serverItems = data.content
      } else if (data && Array.isArray(data.data)) {
        serverItems = data.data
      }

      setExamRooms(serverItems)
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu phòng thi từ backend:', err)
      setExamRooms([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    fetchExamRooms()
  }, [fetchExamRooms])

  // Thêm phòng thi mới sau khi tạo & import PDF
  const handleRoomCreated = (newRoom: ExamRoom) => {
    if (!newRoom) return
    showToast(`Đã lưu phòng thi "${newRoom.title}" (Mã: ${newRoom.code}) vào cơ sở dữ liệu!`)
    setSearchQuery('')
    setStatusFilter('ALL')
    fetchExamRooms()
  }

  // Xử lý sau khi Confirm Import PDF thành công
  const handleImportSuccess = () => {
    fetchExamRooms()
    showToast('Đã nhập đề thi chính thức từ PDF thành công!')
  }

  // Xóa 1 phòng thi khỏi danh sách và đồng bộ Backend
  const handleDeleteRoom = async (room: ExamRoom) => {
    if (window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA PHÒNG THI NÀY KHỎI CƠ SỞ DỮ LIỆU?\n\nTên phòng: ${room.title}\nMã phòng: ${room.code}`)) {
      try {
        await examApi.deleteRoom(room.id)
        showToast(`Đã xóa thành công phòng thi "${room.title}" khỏi cơ sở dữ liệu!`)
        fetchExamRooms()
      } catch (err: any) {
        console.error('Lỗi khi xóa phòng thi trên server:', err)
        alert(`Không thể xóa phòng thi: ${err?.response?.data?.message || err.message || 'Lỗi server'}`)
      }
    }
  }

  // Mở modal chỉnh sửa phòng thi
  const handleOpenEditRoom = (room: ExamRoom) => {
    setEditingRoom(room)
    setEditRoomTitle(room.title)
    setEditRoomCode(room.code)
    setEditRoomDuration(room.durationMinutes || 60)
    setEditRoomDescription(room.description || '')
    setEditRoomStatus(room.status || 'OPEN')
    setEditRoomMC(room.multipleChoiceQuestions || [])
  }

  // Lưu chỉnh sửa phòng thi và đồng bộ Backend
  const handleSaveEditRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return

    if (!editRoomTitle.trim() || !editRoomCode.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mã phòng thi!')
      return
    }

    const payload = {
      code: editRoomCode.trim().toUpperCase(),
      title: editRoomTitle.trim(),
      description: editRoomDescription.trim(),
      durationMinutes: Number(editRoomDuration) || 60,
      status: editRoomStatus,
      multipleChoiceQuestions: editRoomMC.map((mc, idx) => {
        let validOptions = (mc.options || [])
          .filter(o => o && (o.text || o.label))
          .map(o => ({ label: (o.label || '').trim().toUpperCase() || ['A', 'B', 'C', 'D'][idx % 4], text: (o.text || '').trim() }))
        if (validOptions.length === 0) {
          validOptions = [{ label: 'Đáp án', text: (mc.correctAnswer || '').trim() || 'Câu trả lời ngắn' }]
        }
        return {
          order: idx + 1,
          question: mc.question.trim(),
          options: validOptions,
          correctAnswer: (mc.correctAnswer || '').trim(),
          explanation: (mc.explanation || '').trim(),
          legalReference: (mc.legalReference || '').trim()
        }
      }),
      essayQuestions: editingRoom.essayQuestions || []
    }

    try {
      await examApi.updateRoom(editingRoom.id, payload)
      setEditingRoom(null)
      showToast(`Đã cập nhật phòng thi "${editRoomTitle}" vào database!`)
      fetchExamRooms()
    } catch (err: any) {
      console.error('Lỗi khi cập nhật phòng thi trên server:', err)
      alert(`Không thể cập nhật phòng thi: ${err?.response?.data?.message || err.message || 'Lỗi server'}`)
    }
  }

  // Xóa 1 câu hỏi bên trong modal chỉnh sửa phòng thi
  const handleDeleteMCInEditRoom = (questionId: string, orderNumber: number) => {
    if (window.confirm(`Bạn có chắc muốn xóa Câu ${orderNumber}?`)) {
      setEditRoomMC(prev => 
        prev
          .filter(q => q.id !== questionId)
          .map((q, idx) => ({ ...q, order: idx + 1 }))
      )
    }
  }

  // Xử lý vào thi khi xác minh xong
  const handleStartExam = (candidate: CandidateVerification, room: ExamRoom, sessionToken?: string) => {
    // Tăng lượt thi trên UI
    setExamRooms(prev => prev.map(r => r.id === room.id ? { ...r, totalAttempts: r.totalAttempts + 1 } : r))
    setSelectedRoomForVerify(null)
    
    // Chuyển hướng sang trang làm bài thi chuẩn CA4 kèm sessionToken
    navigate(`/exams/${room.id}/take`, {
      state: {
        candidate,
        room,
        sessionToken
      }
    })
  }

  // Trạng thái đang kiểm tra session của 1 phòng thi cụ thể
  const [isCheckingRoomId, setIsCheckingRoomId] = useState<string | null>(null)

  // Xử lý vào phòng thi: Tự động kiểm tra session token trước, nếu hợp lệ vào thẳng đề thi không cần điền lại
  const handleEnterRoom = async (room: ExamRoom) => {
    const existingToken =
      localStorage.getItem(`exam_session_${room.id}`) ||
      sessionStorage.getItem(`exam_session_${room.id}`) ||
      localStorage.getItem(`exam_session_${room.code}`) ||
      sessionStorage.getItem(`exam_session_${room.code}`) ||
      localStorage.getItem('examSessionToken') ||
      localStorage.getItem('exam_session_token') ||
      sessionStorage.getItem('exam_session_token')

    if (existingToken) {
      setIsCheckingRoomId(room.id)
      try {
        const res = await examApi.checkSession(room.id, existingToken)
        const token = res?.sessionToken || res?.data?.sessionToken || existingToken
        const candidateData: CandidateVerification = res?.candidate || res?.data?.candidate

        if (token && candidateData) {
          // Session còn hiệu lực và đúng phòng thi!
          sessionStorage.setItem('exam_session_token', token)
          sessionStorage.setItem(`exam_session_${room.id}`, token)
          localStorage.setItem('exam_session_token', token)
          localStorage.setItem('examSessionToken', token)
          localStorage.setItem(`exam_session_${room.id}`, token)
          localStorage.setItem(`exam_candidate_${room.id}`, JSON.stringify(candidateData))
          localStorage.setItem('examCandidateInfo', JSON.stringify(candidateData))

          saveCandidateProfile({
            cccd: candidateData.cccd,
            fullName: candidateData.fullName,
            phone: candidateData.phone,
            email: candidateData.email,
            address: candidateData.address
          })

          toast.success(`Chào mừng thí sinh ${candidateData.fullName} (SBD: ${candidateData.candidateId})! Đang vào phòng thi...`)
          handleStartExam(candidateData, room, token)
          return
        }
      } catch (err: any) {
        console.warn('Session token cũ không còn hợp lệ hoặc đã hết hạn:', err)
        localStorage.removeItem(`exam_session_${room.id}`)
        sessionStorage.removeItem(`exam_session_${room.id}`)
        localStorage.removeItem(`exam_candidate_${room.id}`)
      } finally {
        setIsCheckingRoomId(null)
      }
    }

    // Nếu chưa có token hoặc token đã hết hạn -> mở modal xác minh danh tính
    setSelectedRoomForVerify(room)
  }

  // Xử lý vào phòng nhanh bằng mã phòng
  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickRoomCode.trim()) return

    const matchedRoom = examRooms.find(
      r => r.code.toLowerCase() === quickRoomCode.trim().toLowerCase()
    )

    if (matchedRoom) {
      setQuickRoomCode('')
      handleEnterRoom(matchedRoom)
    } else {
      alert(`Không tìm thấy phòng thi với mã "${quickRoomCode}". Vui lòng kiểm tra lại!`)
    }
  }

  // Số lượng phòng thi đang mở
  const openRoomsCount = examRooms.filter(r => r.status === 'OPEN').length

  // Lọc danh sách phòng thi an toàn & linh hoạt
  const filteredRooms = examRooms.filter(room => {
    if (!room) return false
    const title = (room.title || '').toLowerCase()
    const code = (room.code || '').toLowerCase()
    const desc = (room.description || '').toLowerCase()
    const q = searchQuery.trim().toLowerCase()

    const matchesSearch = !q || title.includes(q) || code.includes(q) || desc.includes(q)
    const matchesStatus = statusFilter === 'ALL' || room.status === 'OPEN'
    const matchesDuration = durationFilter === 'ALL' || Number(room.durationMinutes) === Number(durationFilter)

    return matchesSearch && matchesStatus && matchesDuration
  })

  // Thống kê nhanh
  const totalRooms = examRooms.length
  const totalCandidates = examRooms.reduce((acc, curr) => acc + curr.totalAttempts, 0)

  return (
    <div className="space-y-7 w-full font-sans antialiased text-slate-900 dark:text-white">
      
      {/* Thông báo Toast nhẹ */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO HEADER: TIÊU ĐỀ + NÚT TẠO PHÒNG THI MỚI (PHA MÀU HIỆN ĐẠI)       */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-500/10 via-white to-blue-500/10 dark:from-purple-950/40 dark:via-[#111625] dark:to-indigo-950/30 shadow-xl shadow-purple-500/5">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-gradient-to-tl from-blue-500/20 via-indigo-500/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full border border-purple-300/80 dark:border-purple-700/80 bg-purple-100/70 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 shadow-2xs">
                CA4 • KHẢO THÍ ĐIỆN TỬ
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Hệ thống phòng thi thử trắc nghiệm & tự luận chuẩn CAND
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
                Phòng Thi Thử Sát Hạch Pháp Luật
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
              Ngân hàng đề thi sát hạch bám sát đề cương nghiệp vụ. Hỗ trợ import trắc nghiệm, cấu hình đề văn nghị luận, kiểm soát/chỉnh sửa câu hỏi và xác thực định danh thí sinh trực tuyến.
            </p>
          </div>

          {/* Nút Tạo phòng thi */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tạo Phòng Thi Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS & QUICK JOIN BAR (COMPACT & SLEEK COLORED BOTTOM BARS)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card Thống kê 1: Tổng phòng thi (Pha màu Indigo & Blue) */}
        <div className="relative overflow-hidden p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-white dark:from-indigo-950/30 dark:via-[#131722] dark:to-blue-950/20 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Phòng thi hiện có</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                {totalRooms}
              </span> phòng thi
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Layers className="h-5 w-5 stroke-[2]" />
          </div>
        </div>

        {/* Card Thống kê 2: Số lượt thí sinh (Pha màu Emerald & Teal) */}
        <div className="relative overflow-hidden p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/30 dark:via-[#131722] dark:to-teal-950/20 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Lượt học viên đã thi</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {totalCandidates.toLocaleString('vi-VN')}
              </span> lượt
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
            <Users className="h-5 w-5 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: Ô vào phòng nhanh bằng Mã Phòng Thi (Pha màu Purple & Rose) */}
        <div className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-white dark:from-purple-950/30 dark:via-[#131722] dark:to-pink-950/20 flex flex-col justify-center shadow-xs">
          <form onSubmit={handleQuickJoin} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Hash className="h-3.5 w-3.5 stroke-[2] absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                placeholder="MÃ PHÒNG (VD: CAND-CA4-01)..."
                value={quickRoomCode}
                onChange={(e) => setQuickRoomCode(e.target.value.toUpperCase())}
                className="w-full pl-8 pr-2.5 py-2 text-xs font-mono font-bold tracking-wider rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-800/70 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase text-slate-900 dark:text-white placeholder:text-[11px] placeholder:font-sans placeholder:normal-case placeholder:font-normal"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all cursor-pointer shrink-0"
            >
              Vào Thi
            </button>
          </form>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BỘ LỌC VÀ TÌM KIẾM PHÒNG THI HIỆN ĐẠI (ĐÃ BỎ "SẮP TỚI", THIẾT KẾ MỚI)   */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Cụm 1: Ô tìm kiếm thông minh */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 stroke-[2.2] absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đề, mã phòng, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-white shadow-2xs placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Cụm 2: Bộ lọc trạng thái & Tùy chọn thời lượng / sắp xếp */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Tabs Trạng thái: Chỉ gồm "Tất cả" & "Đang mở" (Đã xóa "Sắp tới") */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  statusFilter === 'ALL'
                    ? "bg-indigo-600 text-white shadow-sm scale-[1.02]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                <span>Tất cả</span>
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.2 rounded-full",
                  statusFilter === 'ALL'
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                )}>
                  {examRooms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  statusFilter === 'OPEN'
                    ? "bg-emerald-600 text-white shadow-sm scale-[1.02]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Đang mở</span>
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.2 rounded-full",
                  statusFilter === 'OPEN'
                    ? "bg-white/25 text-white"
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                )}>
                  {openRoomsCount}
                </span>
              </button>
            </div>

            {/* Lọc theo thời lượng thi */}
            <div className="relative">
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="pl-3 pr-7 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 shadow-2xs cursor-pointer appearance-none"
              >
                <option value="ALL">⏱ Tất cả thời lượng</option>
                <option value={30}>⏱ 30 phút</option>
                <option value={45}>⏱ 45 phút</option>
                <option value={60}>⏱ 60 phút</option>
                <option value={90}>⏱ 90 phút</option>
                <option value={120}>⏱ 120 phút</option>
                <option value={150}>⏱ 150 phút (Chuẩn CAND)</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Nút đặt lại bộ lọc nếu có lọc đang kích hoạt */}
            {(searchQuery || statusFilter !== 'ALL' || durationFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('ALL')
                  setDurationFilter('ALL')
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

          </div>

        </div>

        {/* Dòng kết quả bộ lọc thông minh nếu đang tìm kiếm hoặc chọn lọc */}
        {(searchQuery || statusFilter !== 'ALL' || durationFilter !== 'ALL') && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Tìm thấy <strong>{filteredRooms.length}</strong> phòng thi phù hợp
                {searchQuery ? ` với từ khóa "${searchQuery}"` : ''}
                {statusFilter === 'OPEN' ? ' (Đang mở)' : ''}
                {durationFilter !== 'ALL' ? ` (${durationFilter} phút)` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setDurationFilter('ALL')
              }}
              className="font-bold underline text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 cursor-pointer text-xs ml-2 shrink-0"
            >
              Hiển thị tất cả
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DANH SÁCH CÁC PHÒNG THI (EXAM ROOM CARDS) CÓ NÚT SỬA & XÓA              */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách phòng thi sát hạch từ hệ thống...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy phòng thi nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Chưa có phòng thi phù hợp với bộ lọc hoặc từ khóa tìm kiếm. Bạn có thể bấm "Tạo Phòng Thi Mới" ở trên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room, idx) => {
            const roomGradientThemes = [
              'from-blue-600 via-indigo-600 to-cyan-500',
              'from-indigo-600 via-purple-600 to-pink-500',
              'from-purple-600 via-fuchsia-600 to-pink-500',
              'from-emerald-600 via-teal-600 to-cyan-500',
              'from-amber-500 via-orange-500 to-red-500',
            ]
            const gradientTheme = roomGradientThemes[idx % roomGradientThemes.length]

            return (
              <div
                key={room.id}
                className="group rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-[#111622] border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/80"
              >
                {/* Dải màu sắc pha vào nhau mỏng thôi (h-1) đồng bộ giống khung bài học thư viện tài liệu */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300 opacity-70 group-hover:opacity-100",
                  gradientTheme
                )} />

                <div className="space-y-3.5">
                  
                  {/* Header card: Mã phòng thi, Trạng thái & Action Buttons SỬA / XÓA */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80">
                      Mã: {room.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1",
                        room.status === 'OPEN'
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80"
                      )}>
                        {room.status === 'OPEN' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        {room.status === 'OPEN' ? 'Mở' : 'Sắp tới'}
                      </span>

                      {/* Nút Sửa Phòng Thi */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditRoom(room)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                        title="Sửa thông tin phòng thi"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Nút Xóa Phòng Thi */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Xóa phòng thi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tên phòng thi + Logo Trường Đại học Cảnh sát Nhân dân (T05) */}
                  <div className="flex items-start gap-3">
                    <img
                      src="/t05-logo.png"
                      alt="Trường Đại học Cảnh sát Nhân dân"
                      className="h-8 w-8 object-contain shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug transition-colors line-clamp-2">
                        {room.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {room.description || 'Đề thi sát hạch lý thuyết trắc nghiệm và bài văn nghị luận tư tưởng nghiệp vụ CAND.'}
                      </p>
                    </div>
                  </div>

                  {/* THÔNG SỐ ĐỀ THI: THỜI GIAN • TRẮC NGHIỆM • TỰ LUẬN (NHỎ GỌN, XÓA BỎ KHUNG BAO BỌC) */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    
                    {/* Khung Thời gian */}
                    <div className="py-1.5 px-1 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 shadow-2xs flex flex-col items-center justify-center text-center hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Thời gian
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5 font-mono">
                        <RealisticClock3DIcon size={13.5} />
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {room.durationMinutes}p
                        </span>
                      </div>
                    </div>

                    {/* Khung Trắc nghiệm */}
                    <div className="py-1.5 px-1 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 shadow-2xs flex flex-col items-center justify-center text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                        Trắc nghiệm
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5 font-mono">
                        <RealisticQuiz3DIcon size={13.5} />
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {room.partsSummary?.mcCount ?? (room.multipleChoiceQuestions?.length || 0)} câu
                        </span>
                      </div>
                    </div>

                    {/* Khung Tự luận */}
                    <div className="py-1.5 px-1 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 shadow-2xs flex flex-col items-center justify-center text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                        Tự luận
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5 font-mono">
                        <RealisticEssay3DIcon size={13.5} />
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {room.partsSummary?.essayCount ?? (room.essayQuestions?.length || 0)} câu
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer card: Thông tin chuẩn Bộ Công An & Nút Vào Phòng Thi */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 stroke-[2.2] shrink-0" />
                    <span>Bộ Công An</span>
                  </div>

                  <button
                    onClick={() => handleEnterRoom(room)}
                    disabled={isCheckingRoomId === room.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isCheckingRoomId === room.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <span>Vào Thi</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GHI CHÚ QUY CHẾ SÁT HẠCH CAND ĐƠN SẮC TRANG TRỌNG                      */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="h-5 w-5 stroke-[2] shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <span className="font-bold text-blue-900 dark:text-blue-100">Quy chế phòng thi chuẩn CA4:</span>
          <p className="leading-relaxed text-blue-800/90 dark:text-blue-300">
            Mỗi thí sinh khi vào phòng thi bắt buộc phải xác minh CCCD, Họ tên, Số điện thoại và Email. Đề thi gồm 2 phần độc lập: Phần I Trắc nghiệm khách quan (tự động chấm điểm) và Phần II Tự luận xử lý tình huống thực tế. Sau khi nộp bài thành công, hệ thống xuất Biên bản xác nhận nộp bài kèm mã băm SHA-256 bảo đảm tính toàn vẹn.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODALS: TẠO PHÒNG, XÁC MINH THÍ SINH & IMPORT DRAFT REVIEW              */}
      {/* ========================================================================= */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRoomCreated}
      />

      <CandidateVerificationModal
        isOpen={Boolean(selectedRoomForVerify)}
        room={selectedRoomForVerify}
        onClose={() => setSelectedRoomForVerify(null)}
        onStartExam={handleStartExam}
      />

      <ExamImportReviewModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* ========================================================================= */}
      {/* 7. MODAL CHỈNH SỬA PHÒNG THI (EDIT ROOM MODAL)                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-5xl 2xl:max-w-6xl rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-800 dark:text-slate-100 font-sans"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#151b2a]/70">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Chỉnh Sửa Phòng Thi & Quản Lý Câu Hỏi
                    </h3>
                    <p className="text-xs text-slate-500">Mã: {editingRoom.code}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditRoom} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Tên phòng thi *</label>
                    <input
                      type="text"
                      required
                      value={editRoomTitle}
                      onChange={(e) => setEditRoomTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Mã phòng thi *</label>
                    <input
                      type="text"
                      required
                      value={editRoomCode}
                      onChange={(e) => setEditRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Thời gian (phút)</label>
                    <select
                      value={editRoomDuration}
                      onChange={(e) => setEditRoomDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    >
                      <option value={30}>30 phút</option>
                      <option value={45}>45 phút</option>
                      <option value={60}>60 phút</option>
                      <option value={90}>90 phút</option>
                      <option value={120}>120 phút</option>
                      <option value={150}>150 phút</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Trạng thái phòng</label>
                    <select
                      value={editRoomStatus}
                      onChange={(e) => setEditRoomStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                    >
                      <option value="OPEN">Đang mở (OPEN)</option>
                      <option value="UPCOMING">Sắp diễn ra (UPCOMING)</option>
                      <option value="CLOSED">Đã đóng (CLOSED)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Mô tả ngắn</label>
                    <input
                      type="text"
                      value={editRoomDescription}
                      onChange={(e) => setEditRoomDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                {/* Quản lý danh sách câu hỏi trắc nghiệm của phòng */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Danh sách câu hỏi trắc nghiệm ({editRoomMC.length} câu)
                    </span>
                    <span className="text-[11px] text-slate-400">Có thể xóa câu hỏi không phù hợp</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editRoomMC.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-4">Phòng thi chưa có câu hỏi trắc nghiệm.</p>
                    ) : (
                      editRoomMC.map((mc, idx) => (
                        <div
                          key={mc.id || idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                Câu {mc.order || idx + 1}:
                              </span>
                              {mc.correctAnswer && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]">
                                  ĐA: {mc.correctAnswer}
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white line-clamp-2">
                              {cleanQuestionText(mc.question)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMCInEditRoom(mc.id, mc.order || idx + 1)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Lưu Thay Đổi
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
