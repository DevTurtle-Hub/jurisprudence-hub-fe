import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '../authUtils'
import { useAuth } from '../AuthContext'
import { AuthApi } from '@/services/api'
import { toast } from 'sonner'


interface AuthCardFormProps {
  initialMode?: 'login' | 'register'
  onSuccess?: (user: UserProfile) => void
  onClose?: () => void
  showCloseButton?: boolean
  className?: string
}

export function AuthCardForm({
  initialMode = 'login',
  onSuccess,
  onClose,
  showCloseButton = false,
  className
}: AuthCardFormProps) {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Xử lý Submit Form với API thật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password.trim()

    if (mode === 'register' && !fullName.trim()) {
      setError('Vui lòng nhập họ và tên thí sinh / chiến sĩ.')
      return
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }

    if (cleanPass.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    setLoading(true)

    try {
      const authData = mode === 'login'
        ? await AuthApi.login({ email: cleanEmail, password: cleanPass })
        : await AuthApi.register({
            name: fullName.trim(),
            email: cleanEmail,
            password: cleanPass,
            unit: 'Học viên CAND'
          })

      const userProfile: UserProfile = {
        id: authData.user.id,
        name: authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        unit: authData.user.unit,
        avatarUrl: authData.user.avatarUrl,
        loggedAt: authData.user.loggedAt || (authData.user as any).loggedInAt || new Date().toISOString(),
        loggedInAt: (authData.user as any).loggedInAt || new Date().toISOString()
      }

      login(userProfile)
      toast.success(mode === 'login' ? `Xin chào ${userProfile.name}!` : 'Đăng ký tài khoản thành công!')
      if (onSuccess) onSuccess(userProfile)
      if (onClose) onClose()
    } catch (err: unknown) {
      console.error('Lỗi xác thực:', err)
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; code?: string } }; message?: string }
      const status = axiosErr.response?.status
      const serverMessage = axiosErr.response?.data?.message

      // Xóa sạch token cũ đề phòng phiên hết hạn
      if (status === 403 || status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setError(serverMessage || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin.')
      } else {
        setError(serverMessage || axiosErr.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "w-full max-w-[390px] mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-5 sm:p-6 text-slate-800 relative select-none",
      className
    )}>
      
      {/* Nút đóng nếu hiển thị trong modal */}
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* HEADER: GỌN GÀNG, ĐƠN GIẢN */}
      <div className="flex items-center gap-3 pr-8 pb-3 border-b border-slate-100">
        <img 
          src="/t05-logo.png" 
          alt="Logo T05" 
          className="h-9 w-9 rounded-full object-contain shrink-0 border border-slate-200 shadow-xs"
        />

        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-slate-900 leading-tight">
            {mode === 'login' ? 'Đăng nhập học viên' : 'Đăng ký tài khoản'}
          </h1>
          <p className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
            Trường ĐH Cảnh sát nhân dân • T05
          </p>
        </div>
      </div>

      {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
      {error && (
        <div className="mt-3.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <span className="shrink-0 text-red-500 font-bold">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* FORM CHÍNH */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        
        {/* TRƯỜNG HỌ VÀ TÊN (KHI ĐĂNG KÝ) */}
        <AnimatePresence>
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              <label className="text-xs font-semibold text-slate-700">
                Họ và Tên Thí Sinh / Chiến Sĩ:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  required={mode === 'register'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRƯỜNG EMAIL */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Email / Tài khoản:
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email học viên hoặc cán bộ..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              required
            />
          </div>
        </div>

        {/* TRƯỜNG MẬT KHẨU */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Mật Khẩu:
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* TÙY CHỌN GHI NHỚ */}
        {mode === 'login' && (
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span className="text-xs">Ghi nhớ tài khoản</span>
            </label>
          </div>
        )}

        {/* NÚT SUBMIT GỌN GÀNG, KHÔNG ICON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm transition-colors cursor-pointer mt-2 disabled:opacity-60 shadow-xs"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle" />
          ) : (
            mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
          )}
        </button>

      </form>

      {/* CHUYỂN ĐỔI ĐĂNG NHẬP / ĐĂNG KÝ */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 text-center text-xs text-slate-500 select-none">
        {mode === 'login' ? (
          <p>
            Chưa có tài khoản thí sinh?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className="font-semibold text-red-600 hover:text-red-700 hover:underline underline-offset-2 transition-colors cursor-pointer ml-1"
            >
              Đăng ký ngay
            </button>
          </p>
        ) : (
          <p>
            Đã có tài khoản hệ thống?{' '}
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="font-semibold text-red-600 hover:text-red-700 hover:underline underline-offset-2 transition-colors cursor-pointer ml-1"
            >
              Đăng nhập ngay
            </button>
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center mt-3 text-[10.5px] text-slate-400">
        <span>Bản quyền © 2026 Trường Đại Học Cảnh Sát Nhân Dân</span>
      </div>

    </div>
  )
}
