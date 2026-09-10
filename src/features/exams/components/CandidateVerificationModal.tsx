import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  HelpCircle,
  FileText,
  Lock,
  RefreshCw
} from 'lucide-react'
import type { ExamRoom, CandidateVerification } from '../types'
import { examApi } from '@/services/examApi'
import { useAuth } from '@/features/auth/AuthContext'
import { toast } from 'sonner'

export interface SavedCandidateProfile {
  cccd?: string
  fullName?: string
  phone?: string
  email?: string
  address?: string
}

// Hàm trích xuất và gom đầy đủ thông tin thí sinh đã lưu từ tất cả các nguồn storage
export function getSavedCandidateProfile(userEmail?: string): SavedCandidateProfile | null {
  const profile: SavedCandidateProfile = {}

  try {
    // 1. Kiểm tra các key lưu trữ profile ưu tiên
    const priorityKeys = [
      userEmail ? `exam_candidate_profile_${userEmail}` : null,
      'exam_saved_candidate_info',
      'cand_candidate_profile',
      'candidate_profile',
      'exam_candidate_profile',
      'examCandidateInfo',
      'candidateInfo',
      'user_candidate_info',
      'last_verified_candidate',
      'candidate_verification'
    ].filter(Boolean) as string[]

    for (const key of priorityKeys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            const data = parsed.candidate || parsed.data?.candidate || parsed
            if (data.cccd && !profile.cccd) profile.cccd = String(data.cccd).trim()
            if (data.phone && !profile.phone) profile.phone = String(data.phone).trim()
            if (data.fullName && !profile.fullName) profile.fullName = String(data.fullName).trim()
            if (data.name && !profile.fullName) profile.fullName = String(data.name).trim()
            if (data.email && !profile.email) profile.email = String(data.email).trim()
            if (data.address && !profile.address) profile.address = String(data.address).trim()
            if (data.unit && !profile.address) profile.address = String(data.unit).trim()
          }
        } catch {}
      }
    }

    // 2. Quét toàn bộ localStorage & sessionStorage để tìm bất kỳ key candidate nào từ các phòng thi trước
    const storages = [localStorage, sessionStorage]
    for (const storage of storages) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (
          key &&
          (key.startsWith('exam_candidate_') ||
            key.startsWith('candidate_') ||
            key.startsWith('exam_session_') ||
            key.includes('candidate') ||
            key.includes('Candidate'))
        ) {
          const raw = storage.getItem(key)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && typeof parsed === 'object') {
                const data = parsed.candidate || parsed.data?.candidate || parsed
                if (data.cccd && !profile.cccd) profile.cccd = String(data.cccd).trim()
                if (data.phone && !profile.phone) profile.phone = String(data.phone).trim()
                if (data.fullName && !profile.fullName) profile.fullName = String(data.fullName).trim()
                if (data.name && !profile.fullName) profile.fullName = String(data.name).trim()
                if (data.email && !profile.email) profile.email = String(data.email).trim()
                if (data.address && !profile.address) profile.address = String(data.address).trim()
                if (data.unit && !profile.address) profile.address = String(data.unit).trim()
              }
            } catch {}
          }
        }
      }
    }

    // 3. Fallback đọc thông tin tài khoản đăng nhập (user_info, currentUser)
    const userRaw = localStorage.getItem('user_info') || localStorage.getItem('currentUser')
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw)
        if (user && typeof user === 'object') {
          if (user.cccd && !profile.cccd) profile.cccd = String(user.cccd).trim()
          if (user.phone && !profile.phone) profile.phone = String(user.phone).trim()
          if (user.name && !profile.fullName) profile.fullName = String(user.name).trim()
          if (user.email && !profile.email) profile.email = String(user.email).trim()
          if (user.unit && !profile.address) profile.address = String(user.unit).trim()
        }
      } catch {}
    }

    // 4. Nếu là tài khoản Admin CAND mặc định nhưng chưa từng nhập CCCD/SĐT, hỗ trợ điền mẫu chuẩn CAND
    if (!profile.cccd && (profile.email === 'admin@gmail.com' || profile.fullName?.includes('CAND') || profile.fullName?.includes('Quản Trị'))) {
      profile.cccd = '001099001234'
      profile.phone = '0988123456'
    }

    if (profile.cccd || profile.fullName || profile.phone || profile.email || profile.address) {
      return profile
    }
  } catch (e) {
    console.error('Lỗi khi đọc profile thí sinh đã lưu:', e)
  }
  return null
}

// Lưu thông tin thí sinh vào tất cả các persistent storage keys
export function saveCandidateProfile(data: SavedCandidateProfile, userEmail?: string) {
  try {
    const cleanData: SavedCandidateProfile = {
      cccd: data.cccd?.trim() || '',
      fullName: data.fullName?.trim() || '',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      address: data.address?.trim() || ''
    }
    const jsonStr = JSON.stringify(cleanData)

    localStorage.setItem('exam_saved_candidate_info', jsonStr)
    localStorage.setItem('cand_candidate_profile', jsonStr)
    localStorage.setItem('candidate_profile', jsonStr)
    localStorage.setItem('exam_candidate_profile', jsonStr)
    localStorage.setItem('examCandidateInfo', jsonStr)
    localStorage.setItem('user_candidate_info', jsonStr)
    sessionStorage.setItem('exam_saved_candidate_info', jsonStr)

    if (userEmail) {
      localStorage.setItem(`exam_candidate_profile_${userEmail}`, jsonStr)
    }

    // Đồng bộ vào tài khoản người dùng đang đăng nhập
    const userRaw = localStorage.getItem('user_info') || localStorage.getItem('currentUser')
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw)
        if (user && typeof user === 'object') {
          if (cleanData.cccd) user.cccd = cleanData.cccd
          if (cleanData.phone) user.phone = cleanData.phone
          if (cleanData.fullName) user.name = cleanData.fullName
          if (cleanData.address) user.unit = cleanData.address
          localStorage.setItem('user_info', JSON.stringify(user))
          localStorage.setItem('currentUser', JSON.stringify(user))
        }
      } catch {}
    }
  } catch (e) {
    console.error('Lỗi khi lưu profile thí sinh:', e)
  }
}

interface CandidateVerificationModalProps {
  isOpen: boolean
  room: ExamRoom | null
  onClose: () => void
  onStartExam: (candidate: CandidateVerification, room: ExamRoom, sessionToken?: string) => void
}

export function CandidateVerificationModal({
  isOpen,
  room,
  onClose,
  onStartExam
}: CandidateVerificationModalProps) {
  const { currentUser } = useAuth()

  // Khởi tạo state ngay từ đầu với dữ liệu đã lưu trong Database / LocalStorage
  const [cccd, setCccd] = useState(() => {
    const saved = getSavedCandidateProfile(currentUser?.email)
    return saved?.cccd || ''
  })
  const [fullName, setFullName] = useState(() => {
    const saved = getSavedCandidateProfile(currentUser?.email)
    return saved?.fullName || currentUser?.name || 'Quản Trị Viên CAND'
  })
  const [phone, setPhone] = useState(() => {
    const saved = getSavedCandidateProfile(currentUser?.email)
    return saved?.phone || ''
  })
  const [email, setEmail] = useState(() => {
    const saved = getSavedCandidateProfile(currentUser?.email)
    return saved?.email || currentUser?.email || 'admin@gmail.com'
  })
  const [address, setAddress] = useState(() => {
    const saved = getSavedCandidateProfile(currentUser?.email)
    return saved?.address || currentUser?.unit || 'Cục Đào tạo - Bộ Công An'
  })
  const [agreeTerms, setAgreeTerms] = useState(true)

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(false)
  const [verifiedCandidate, setVerifiedCandidate] = useState<CandidateVerification | null>(null)
  const [sessionToken, setSessionToken] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')

  // Tự động kiểm tra Session Token & Điền thông tin khi modal mở
  useEffect(() => {
    if (!isOpen || !room) return

    setErrorMessage('')

    // 1. Tự động điền dữ liệu đã xác nhận trước đó (CCCD, SĐT, Họ tên, Email, Đơn vị)
    const saved = getSavedCandidateProfile(currentUser?.email)
    if (saved) {
      if (saved.cccd) setCccd(saved.cccd)
      if (saved.fullName) setFullName(saved.fullName)
      else if (currentUser?.name) setFullName(currentUser.name)
      if (saved.phone) setPhone(saved.phone)
      if (saved.email) setEmail(saved.email)
      else if (currentUser?.email) setEmail(currentUser.email)
      if (saved.address) setAddress(saved.address)
      else if (currentUser?.unit) setAddress(currentUser.unit)
    } else if (currentUser) {
      if (currentUser.name) setFullName(currentUser.name)
      if (currentUser.email) setEmail(currentUser.email)
      if (currentUser.unit) setAddress(currentUser.unit)
      if (currentUser.cccd) setCccd(currentUser.cccd)
      if (currentUser.phone) setPhone(currentUser.phone)
    }

    setAgreeTerms(true)

    // 2. Tìm token đã lưu của phòng thi này để kiểm tra session hợp lệ
    const existingToken =
      localStorage.getItem(`exam_session_${room.id}`) ||
      sessionStorage.getItem(`exam_session_${room.id}`) ||
      localStorage.getItem(`exam_session_${room.code}`) ||
      sessionStorage.getItem(`exam_session_${room.code}`) ||
      localStorage.getItem('examSessionToken') ||
      localStorage.getItem('exam_session_token') ||
      sessionStorage.getItem('exam_session_token')

    if (existingToken) {
      setIsCheckingSession(true)
      examApi.checkSession(room.id, existingToken)
        .then((res) => {
          const token = res?.sessionToken || res?.data?.sessionToken || existingToken
          const candidateData: CandidateVerification = res?.candidate || res?.data?.candidate

          if (token && candidateData) {
            setSessionToken(token)
            setVerifiedCandidate(candidateData)

            // Cập nhật lại form fields với dữ liệu chính xác từ Database
            if (candidateData.cccd) setCccd(candidateData.cccd)
            if (candidateData.fullName) setFullName(candidateData.fullName)
            if (candidateData.phone) setPhone(candidateData.phone)
            if (candidateData.email) setEmail(candidateData.email)
            if (candidateData.address) setAddress(candidateData.address)
            setAgreeTerms(true)

            // Lưu profile thí sinh
            saveCandidateProfile({
              cccd: candidateData.cccd,
              fullName: candidateData.fullName,
              phone: candidateData.phone,
              email: candidateData.email,
              address: candidateData.address
            }, currentUser?.email)

            // Đồng bộ storage theo phòng
            sessionStorage.setItem('exam_session_token', token)
            sessionStorage.setItem(`exam_session_${room.id}`, token)
            localStorage.setItem('exam_session_token', token)
            localStorage.setItem('examSessionToken', token)
            localStorage.setItem(`exam_session_${room.id}`, token)
            localStorage.setItem(`exam_candidate_${room.id}`, JSON.stringify(candidateData))
          } else {
            setVerifiedCandidate(null)
          }
        })
        .catch((err) => {
          console.warn('Session token cũ không còn hợp lệ hoặc đã hết hạn:', err)
          localStorage.removeItem(`exam_session_${room.id}`)
          sessionStorage.removeItem(`exam_session_${room.id}`)
          localStorage.removeItem(`exam_candidate_${room.id}`)
          setVerifiedCandidate(null)
          setSessionToken('')
        })
        .finally(() => {
          setIsCheckingSession(false)
        })
    } else {
      setVerifiedCandidate(null)
      setSessionToken('')
    }
  }, [isOpen, room, currentUser])

  if (!isOpen || !room) return null

  // Xử lý thay đổi trường và tự động lưu tạm thời vào persistent storage
  const handleFieldChange = (field: keyof SavedCandidateProfile, val: string) => {
    let newCccd = cccd
    let newFullName = fullName
    let newPhone = phone
    let newEmail = email
    let newAddress = address

    if (field === 'cccd') {
      newCccd = val.replace(/\D/g, '')
      setCccd(newCccd)
    } else if (field === 'fullName') {
      newFullName = val
      setFullName(val)
    } else if (field === 'phone') {
      newPhone = val
      setPhone(val)
    } else if (field === 'email') {
      newEmail = val
      setEmail(val)
    } else if (field === 'address') {
      newAddress = val
      setAddress(val)
    }

    saveCandidateProfile({
      cccd: newCccd,
      fullName: newFullName,
      phone: newPhone,
      email: newEmail,
      address: newAddress
    }, currentUser?.email)
  }

  // Xử lý xác minh thông tin thí sinh qua API Backend Spring Boot
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    // Kiểm tra tính hợp lệ cơ bản theo Validation Rules của Backend
    const cleanCccd = cccd.trim()
    const cleanName = fullName.trim()
    const cleanPhone = phone.trim()
    const cleanEmail = email.trim()
    const cleanAddress = address.trim()

    if (!cleanCccd) {
      setErrorMessage('Vui lòng nhập số Căn cước công dân (12 số).')
      return
    }

    if (!/^\d{12}$/.test(cleanCccd)) {
      setErrorMessage('Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.')
      return
    }

    if (!cleanName) {
      setErrorMessage('Vui lòng nhập họ và tên thí sinh / chiến sĩ.')
      return
    }

    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại liên hệ.')
      return
    }

    if (!/^\d{10,11}$/.test(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ. Phải bao gồm 10 đến 11 chữ số.')
      return
    }

    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email nhận kết quả thi.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Địa chỉ email không đúng định dạng.')
      return
    }

    if (!cleanAddress) {
      setErrorMessage('Vui lòng nhập địa chỉ cư trú hoặc đơn vị công tác CAND.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Thí sinh bắt buộc phải tích chọn cam kết quy chế thi trước khi tiếp tục.')
      return
    }

    setIsVerifying(true)

    try {
      // 1. Gọi API Backend: POST /api/v1/exams/rooms/{roomId}/verify-candidate
      const res = await examApi.verifyCandidate(room.id, {
        cccd: cleanCccd,
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress
      })

      // 2. Trích xuất sessionToken và thông tin Candidate từ response
      const token = res?.sessionToken || res?.data?.sessionToken
      const candidateData: CandidateVerification = res?.candidate || res?.data?.candidate

      if (!token || !candidateData) {
        throw new Error('Dữ liệu xác minh trả về từ máy chủ không hợp lệ.')
      }

      // 3. Lưu sessionToken vào sessionStorage & localStorage phục vụ các API tiếp theo
      setSessionToken(token)
      sessionStorage.setItem('exam_session_token', token)
      sessionStorage.setItem(`exam_session_${room.id}`, token)
      sessionStorage.setItem(`exam_session_${room.code}`, token)
      localStorage.setItem('exam_session_token', token)
      localStorage.setItem('examSessionToken', token)
      localStorage.setItem(`exam_session_${room.id}`, token)
      localStorage.setItem(`exam_session_${room.code}`, token)
      localStorage.setItem(`exam_candidate_${room.id}`, JSON.stringify(candidateData))
      // Lưu profile thí sinh để luôn tự điền sẵn cho các lần sau
      saveCandidateProfile({
        cccd: cleanCccd,
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress
      }, currentUser?.email)

      setVerifiedCandidate(candidateData)
      toast.success(res?.message || `Xác minh thành công! Số báo danh: ${candidateData.candidateId}`)
    } catch (err: any) {
      console.error('Lỗi khi gọi API verify-candidate:', err)
      const status = err.response?.status
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message

      if (status === 400) {
        setErrorMessage(serverMsg || 'Dữ liệu không hợp lệ hoặc phòng thi hiện không mở tiếp nhận thí sinh.')
      } else if (status === 404) {
        setErrorMessage(serverMsg || 'Không tìm thấy phòng thi trong hệ thống cơ sở dữ liệu.')
      } else if (status === 500) {
        setErrorMessage(serverMsg || 'Lỗi hệ thống máy chủ trong quá trình cấp số báo danh và phiên thi.')
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        // Fallback tạo phiên cục bộ nếu máy chủ backend chưa khởi chạy
        const candidateId = `SBD-${room.code.replace(/[^A-Za-z0-9]/g, '')}-${cleanCccd.slice(-4)}`
        const localToken = 'local_token_' + Math.random().toString(36).substring(2)
        const fallbackCandidate: CandidateVerification = {
          cccd: cleanCccd,
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          address: cleanAddress,
          candidateId,
          verifiedAt: new Date().toISOString(),
          isVerified: true
        }

        saveCandidateProfile({
          cccd: cleanCccd,
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          address: cleanAddress
        }, currentUser?.email)

        setSessionToken(localToken)
        sessionStorage.setItem('exam_session_token', localToken)
        setVerifiedCandidate(fallbackCandidate)
        toast.info('Đang sử dụng phiên thi dự phòng (Offline fallback).')
      } else {
        setErrorMessage(serverMsg || 'Xác minh thí sinh không thành công. Vui lòng kiểm tra lại thông tin!')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleBeginExam = () => {
    if (!verifiedCandidate) return
    onStartExam(verifiedCandidate, room, sessionToken)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto text-slate-800 dark:text-slate-100"
        >
          {/* Header - Phong cách hệ thống Jurisprudence Hub */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#151b2a]/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Cổng Xác Minh Danh Tính Thí Sinh
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Xác thực thông tin định danh điện tử trước khi cấp quyền vào phòng thi
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

          <div className="p-6 space-y-5">
            {/* Tóm tắt thông tin phòng thi */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80">
                  Mã phòng: {room.code}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {room.durationMinutes} phút
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {room.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                  <span>Trắc nghiệm: {room.partsSummary.mcCount} câu</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-emerald-500 stroke-[2]" />
                  <span>Tự luận: {room.partsSummary.essayCount} câu</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-500 stroke-[2]" />
                  <span>{room.durationMinutes} phút làm bài</span>
                </span>
              </div>
            </div>

            {/* Trạng thái đang kiểm tra session token */}
            {isCheckingSession && (
              <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                <span>Đang kiểm tra phiên xác thực trước đó của bạn đối với phòng thi này...</span>
              </div>
            )}

            {/* TH1: CHƯA XÁC MINH - HIỂN THỊ FORM NHẬP 5 TRƯỜNG THÔNG TIN */}
            {!verifiedCandidate ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Thông Tin Định Danh Thí Sinh</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Tự động điền dữ liệu sẵn</span>
                  </span>
                </div>

                {/* Banner tự động điền sẵn thông tin định danh */}
                {cccd && fullName && phone && email && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 stroke-[2.2] shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Hệ thống đã tự động điền sẵn 5 trường định danh từ dữ liệu trước đó của bạn.</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 stroke-[2] shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Số CCCD */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                      <span>Số Căn cước công dân (12 số) <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      placeholder="Nhập 12 số CCCD (VD: 001099001234)"
                      value={cccd}
                      onChange={(e) => handleFieldChange('cccd', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Họ và tên */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                      <span>Họ và tên đầy đủ <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên thí sinh"
                      value={fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                      <span>Số điện thoại di động <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập số điện thoại (VD: 0988123456)"
                      value={phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                      <span>Địa chỉ Email nhận kết quả <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Nhập địa chỉ email nhận kết quả"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Địa chỉ / Đơn vị công tác */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
                    <span>Địa chỉ cư trú / Đơn vị công tác (CAND) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập địa chỉ cư trú hoặc đơn vị công tác (CAND)"
                    value={address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                {/* Cam kết quy chế */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tôi cam kết các thông tin khai báo trên là chính xác, tuân thủ nghiêm túc nội quy sát hạch pháp luật CAND và không thực hiện bất kỳ hành vi gian lận nào trong suốt thời gian làm bài thi.
                  </span>
                </label>

                {/* Nút bấm Xác minh */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin stroke-[2]" />
                        <span>Đang Xác Minh Dữ Liệu...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 stroke-[2]" />
                        <span>Xác Minh Thông Tin Thí Sinh</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TH2: ĐÃ XÁC MINH XONG - XUẤT THẺ THÍ SINH & MỞ KHÓA NÚT "BẮT ĐẦU VÀO PHÒNG THI" */
              <div className="space-y-5 animate-in fade-in">
                <div className="p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-slate-900/80 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        CA4
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                          Thẻ Thí Sinh Dự Thi Sát Hạch
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Xác thực điện tử CAND • Mã hợp lệ
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                      <span>ĐÃ XÁC MINH</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Họ và tên thí sinh:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{verifiedCandidate.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Số Báo Danh (SBD):</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{verifiedCandidate.candidateId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Số Căn cước công dân:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{verifiedCandidate.cccd}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Số điện thoại:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{verifiedCandidate.phone}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Đơn vị công tác / Địa chỉ:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{verifiedCandidate.address}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-indigo-500 stroke-[2] shrink-0" />
                      <span>Phiên thi hợp lệ ({room.durationMinutes + 30} phút) • Khóa chỉnh sửa thông tin</span>
                    </span>
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      {new Date(verifiedCandidate.verifiedAt).toLocaleTimeString('vi-VN')} ({new Date(verifiedCandidate.verifiedAt).toLocaleDateString('vi-VN')})
                    </span>
                  </div>
                </div>

                {/* Nút hành động BẮT ĐẦU VÀO PHÒNG THI */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (room) {
                        localStorage.removeItem(`exam_session_${room.id}`)
                        localStorage.removeItem(`exam_session_${room.code}`)
                        localStorage.removeItem(`exam_candidate_${room.id}`)
                        localStorage.removeItem(`exam_candidate_${room.code}`)
                        sessionStorage.removeItem(`exam_session_${room.id}`)
                        sessionStorage.removeItem(`exam_session_${room.code}`)
                      }
                      setVerifiedCandidate(null)
                      setSessionToken('')
                    }}
                    className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
                  >
                    ← Khai báo lại thông tin
                  </button>

                  <button
                    type="button"
                    onClick={handleBeginExam}
                    className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-black shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Bắt Đầu Vào Phòng Thi</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
