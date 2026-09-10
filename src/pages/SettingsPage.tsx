import { useState, useEffect } from 'react'
import { User, Bell, Save, CreditCard, Phone } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { getSavedCandidateProfile, saveCandidateProfile } from '@/features/exams/components/CandidateVerificationModal'
import { toast } from 'sonner'

export function SettingsPage() {
  const { currentUser, login } = useAuth()
  const savedProfile = getSavedCandidateProfile(currentUser?.email)

  const [name, setName] = useState(currentUser?.name || savedProfile?.fullName || '')
  const [unit, setUnit] = useState(currentUser?.unit || savedProfile?.address || '')
  const [cccd, setCccd] = useState(currentUser?.cccd || savedProfile?.cccd || '')
  const [phone, setPhone] = useState(currentUser?.phone || savedProfile?.phone || '')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const profile = getSavedCandidateProfile(currentUser?.email)
    if (currentUser) {
      setName(currentUser.name || profile?.fullName || '')
      setUnit(currentUser.unit || profile?.address || '')
      setCccd(currentUser.cccd || profile?.cccd || '')
      setPhone(currentUser.phone || profile?.phone || '')
    } else if (profile) {
      if (profile.fullName) setName(profile.fullName)
      if (profile.address) setUnit(profile.address)
      if (profile.cccd) setCccd(profile.cccd)
      if (profile.phone) setPhone(profile.phone)
    }
  }, [currentUser])

  const handleSave = () => {
    const cleanName = name.trim() || currentUser?.name || 'Học viên CAND'
    const cleanUnit = unit.trim() || currentUser?.unit || 'Cục Đào tạo - Bộ Công An'
    const cleanCccd = cccd.trim()
    const cleanPhone = phone.trim()

    if (currentUser) {
      const updated = {
        ...currentUser,
        name: cleanName,
        unit: cleanUnit,
        cccd: cleanCccd,
        phone: cleanPhone
      }
      login(updated)
    }

    saveCandidateProfile({
      fullName: cleanName,
      address: cleanUnit,
      cccd: cleanCccd,
      phone: cleanPhone,
      email: currentUser?.email || 'admin@gmail.com'
    }, currentUser?.email)

    setSaved(true)
    toast.success('Đã lưu thông tin cá nhân và định danh thí sinh thành công!')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 font-sans antialiased text-slate-900 dark:text-white">
      {/* Top Hero Banner Hiện Đại */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-500/10 via-white to-purple-500/10 dark:from-indigo-950/40 dark:via-[#111625] dark:to-purple-950/30 shadow-xl shadow-indigo-500/5">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-gradient-to-tl from-blue-500/20 via-pink-500/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <span>Học Viện CAND • Thiết Lập Tài Khoản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-300 dark:to-blue-400 bg-clip-text text-transparent">
              Cài Đặt Hệ Thống & Tài Khoản
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Quản lý thông tin học viên, đồng bộ hồ sơ dự thi và cấu hình trải nghiệm học tập
          </p>
        </div>
      </div>

      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* Thông tin học viên */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <span>Thông Tin Cá Nhân Học Viên</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên học viên / thí sinh"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#5d5fef]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-[#5d5fef]" />
                <span>Số Căn cước công dân (12 số)</span>
              </label>
              <input
                type="text"
                maxLength={12}
                value={cccd}
                onChange={(e) => setCccd(e.target.value.replace(/\D/g, ''))}
                placeholder="VD: 001099001234"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#5d5fef]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-[#5d5fef]" />
                <span>Số điện thoại di động</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0988123456"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#5d5fef]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Đơn vị / Đơn vị công tác (CAND)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="VD: Cục Đào tạo - Bộ Công An"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#5d5fef]/30"
              />
            </div>
          </div>
        </div>

        {/* Tùy chọn thông báo */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#5d5fef]" />
            <span>Thông Báo & Nhắc Nhở Học Tập</span>
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Nhắc nhở chỉ tiêu ôn đề hàng ngày
              </span>
              <span className="text-[10px] text-slate-400">
                Gửi thông báo khi chưa hoàn thành nhiệm vụ trong ngày
              </span>
            </div>

            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                notificationsEnabled ? 'bg-[#5d5fef]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs font-bold shadow-md shadow-[#5d5fef]/30 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saved ? 'Đã Lưu Thành Công!' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
export default SettingsPage
