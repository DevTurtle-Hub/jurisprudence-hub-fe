import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  ClipboardList,
  Layers,
  Settings,
  LogOut,
  LogIn,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthCardForm } from '@/features/auth/components/AuthCardForm'

// Component hiển thị Logo Trường Đại học Cảnh sát nhân dân (T05)
export const PoliceLogo = ({ className }: { className?: string }) => (
  <img 
    src="/t05-logo.png" 
    alt="Trường Đại học Cảnh sát nhân dân - T05" 
    className={cn("h-10 w-10 shrink-0 select-none object-contain drop-shadow-[0_2px_8px_rgba(220,38,38,0.25)]", className)} 
  />
)

export interface NavItem {
  id: string
  name: string
  path: string
  icon: any
  badgeType?: 'ai' | 'hot'
  adminOnly?: boolean
  theme: {
    activeBg: string
    activeBorder: string
    activeText: string
    iconGradient: string
    indicatorGradient: string
    hoverText: string
    hoverIconBg: string
  }
}

// Component Badge / Nút bấm mini pha màu đa sắc cho AI và HOT
const RenderNavBadge = ({ badgeType }: { badgeType?: 'ai' | 'hot' }) => {
  if (!badgeType) return null

  if (badgeType === 'ai') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 shadow-[0_2px_10px_rgba(168,85,247,0.4)] border border-white/30 shrink-0 group-hover:scale-105 group-hover:shadow-[0_2px_14px_rgba(168,85,247,0.6)] transition-all duration-200 select-none cursor-pointer"
        title="Luyện Đề Thông Minh Tích Hợp AI"
      >
        <Sparkles className="h-3 w-3 text-amber-200 fill-amber-200/50 animate-pulse" />
        <span className="leading-none">AI</span>
      </span>
    )
  }

  if (badgeType === 'hot') {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-black tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_2px_10px_rgba(239,68,68,0.4)] border border-white/30 shrink-0 group-hover:scale-105 group-hover:shadow-[0_2px_14px_rgba(239,68,68,0.6)] transition-all duration-200 select-none cursor-pointer"
        title="Thư Viện Tài Liệu Nổi Bật HOT"
      >
        <Flame className="h-3 w-3 text-amber-200 fill-amber-200 animate-pulse" />
        <span className="leading-none">HOT</span>
      </span>
    )
  }

  return null
}

export function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isLoggedIn, isAuthModalOpen, openAuthModal, closeAuthModal, logout } = useAuth()
  
  // Theo chuẩn API: xem tài liệu giáo trình (/documents, /lessons) là Public cho phép khách xem.
  // Chỉ các tính năng cá nhân (/settings) hoặc đường dẫn /login, /register mới bắt buộc đăng nhập.
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isProtectedRoute = location.pathname.startsWith('/settings')

  // Hiển thị modal đăng nhập khi truy cập auth route hoặc khi được mở chủ động
  const shouldShowAuthModal = (!isLoggedIn && (isProtectedRoute || isAuthRoute)) || isAuthModalOpen
  const modalInitialMode = location.pathname === '/register' ? 'register' : 'login'

  // Quản lý trạng thái thu gọn Sidebar
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  })

  // Quản lý mở đóng Mobile Drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  // Quản lý Dark Mode (Mặc định Light Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return false
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar_collapsed', String(next))
      return next
    })
  }

  const toggleTheme = () => {
    setIsDark(prev => !prev)
  }

  // Kiểm tra quyền Admin
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'admin@gmail.com'

  // Cấu hình menu điều hướng thanh lịch (Giao diện phẳng UI Cũ, Màu sắc đa sắc độc bản cho từng trang)
  const navItems: NavItem[] = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Tổng quan',
      path: '/',
      icon: LayoutDashboard,
      theme: {
        activeBg: 'bg-gradient-to-r from-blue-600/18 via-indigo-600/12 to-cyan-500/15 dark:from-blue-500/25 dark:via-indigo-500/18 dark:to-cyan-500/15',
        activeBorder: 'border-blue-500/40 dark:border-blue-400/40',
        activeText: 'text-blue-700 dark:text-blue-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/25',
        indicatorGradient: 'bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
        hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        hoverIconBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600'
      }
    },
    {
      id: 'documents',
      name: 'Thư viện Tài liệu',
      path: '/documents',
      icon: FileText,
      badgeType: 'hot',
      theme: {
        activeBg: 'bg-gradient-to-r from-emerald-600/18 via-teal-600/12 to-green-500/15 dark:from-emerald-500/25 dark:via-teal-500/18 dark:to-green-500/15',
        activeBorder: 'border-emerald-500/40 dark:border-emerald-400/40',
        activeText: 'text-emerald-700 dark:text-emerald-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md shadow-emerald-500/25',
        indicatorGradient: 'bg-gradient-to-b from-emerald-500 via-teal-500 to-green-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
        hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        hoverIconBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600'
      }
    },
    {
      id: 'quiz',
      name: 'Luyện Đề Thông Minh',
      path: '/quiz',
      icon: ClipboardList,
      badgeType: 'ai',
      theme: {
        activeBg: 'bg-gradient-to-r from-amber-500/20 via-orange-500/14 to-rose-500/15 dark:from-amber-500/30 dark:via-orange-500/20 dark:to-rose-500/15',
        activeBorder: 'border-amber-500/45 dark:border-amber-400/45',
        activeText: 'text-amber-800 dark:text-amber-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/25',
        indicatorGradient: 'bg-gradient-to-b from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
        hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
        hoverIconBg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600'
      }
    },
    {
      id: 'exams',
      name: 'Phòng Thi Thử',
      path: '/exams',
      icon: GraduationCap,
      theme: {
        activeBg: 'bg-gradient-to-r from-red-600/18 via-rose-600/12 to-red-800/15 dark:from-red-500/25 dark:via-rose-500/18 dark:to-red-800/15',
        activeBorder: 'border-red-500/40 dark:border-red-400/40',
        activeText: 'text-red-700 dark:text-red-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white shadow-md shadow-red-500/25',
        indicatorGradient: 'bg-gradient-to-b from-red-500 via-rose-600 to-purple-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]',
        hoverText: 'group-hover:text-red-600 dark:group-hover:text-red-400',
        hoverIconBg: 'group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-600'
      }
    },
    {
      id: 'question-bank',
      name: 'Ngân Hàng Câu Hỏi',
      path: '/question-bank',
      icon: Layers,
      adminOnly: true,
      theme: {
        activeBg: 'bg-gradient-to-r from-purple-600/18 via-fuchsia-600/12 to-indigo-600/15 dark:from-purple-500/25 dark:via-fuchsia-500/18 dark:to-indigo-600/15',
        activeBorder: 'border-purple-500/40 dark:border-purple-400/40',
        activeText: 'text-purple-700 dark:text-purple-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-700 text-white shadow-md shadow-purple-500/25',
        indicatorGradient: 'bg-gradient-to-b from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]',
        hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
        hoverIconBg: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 group-hover:text-purple-600'
      }
    },
    {
      id: 'settings',
      name: 'Cài Đặt Hệ Thống',
      path: '/settings',
      icon: Settings,
      theme: {
        activeBg: 'bg-gradient-to-r from-slate-600/18 via-cyan-600/14 to-slate-700/15 dark:from-slate-500/25 dark:via-cyan-500/18 dark:to-slate-700/15',
        activeBorder: 'border-cyan-600/40 dark:border-cyan-400/40',
        activeText: 'text-slate-800 dark:text-cyan-300 font-bold',
        iconGradient: 'bg-gradient-to-br from-slate-600 via-cyan-700 to-slate-800 text-white shadow-md shadow-cyan-600/25',
        indicatorGradient: 'bg-gradient-to-b from-slate-400 via-cyan-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]',
        hoverText: 'group-hover:text-slate-700 dark:group-hover:text-cyan-400',
        hoverIconBg: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60 group-hover:text-slate-700'
      }
    }
  ], [])

  // Lọc quyền Admin
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => !item.adminOnly || isAdmin)
  }, [navItems, isAdmin])

  // Tự động ẩn Sidebar và mở rộng màn hình khi vào nội dung chi tiết bài học, khi làm bài thi, hoặc khi luyện đề thông minh
  const isStudyMode = location.pathname.startsWith('/documents/') && location.pathname !== '/documents'
  const isExamTakingMode = 
    location.pathname.includes('/take') || 
    (location.pathname.startsWith('/exams/') && location.pathname !== '/exams') ||
    location.pathname.startsWith('/exam/') ||
    location.pathname.startsWith('/exam-room/')
  const isQuizMode = location.pathname.startsWith('/quiz')

  return (
    <div className={cn(
      "flex min-h-screen w-full font-sans transition-colors duration-300 antialiased",
      isExamTakingMode ? "bg-white dark:bg-black text-black dark:text-white" : "bg-[#f4f6fb] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100"
    )}>
      
      {/* ========================================================================= */}
      {/* 1. SIDEBAR CHO DESKTOP PHÂN TẦNG HIỆN ĐẠI (ĐA SẮC THEO TỪNG TRANG)       */}
      {/* ========================================================================= */}
      {!isStudyMode && !isExamTakingMode && !isQuizMode && (
        <aside 
          className={cn(
            "hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ease-in-out bg-white/95 dark:bg-[#0f1420]/95 backdrop-blur-md border-r border-slate-200/90 dark:border-slate-800/90 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
            isCollapsed ? "w-20" : "w-72"
          )}
        >
        {/* TẦNG 0: HEADER THƯƠNG HIỆU & NÚT TOGGLE */}
        <div className={cn(
          "border-b border-slate-100 dark:border-slate-800/80 transition-all duration-300 bg-gradient-to-b from-slate-50/70 to-transparent dark:from-slate-900/50",
          isCollapsed 
            ? "py-4 px-2 flex flex-col items-center justify-center gap-2.5" 
            : "p-4 flex items-center justify-between gap-3"
        )}>
          {/* Logo và Thông tin hệ thống */}
          <div 
            onClick={() => navigate('/')} 
            className={cn(
              "flex items-center cursor-pointer select-none group min-w-0",
              isCollapsed ? "justify-center" : "gap-3 flex-1"
            )}
            title="Jurisprudence Hub - T05"
          >
            <div className="relative shrink-0">
              <div className="p-1 rounded-xl bg-gradient-to-br from-emerald-500/15 via-amber-500/10 to-red-500/15 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                <PoliceLogo className="h-8 w-8 shrink-0 object-contain drop-shadow-xs" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111622] animate-pulse" />
            </div>

            {/* Chỉ hiển thị text khi mở rộng */}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[14px] tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                    JURISPRUDENCE
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shadow-2xs">
                    HUB
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-red-600 dark:text-red-400 tracking-wider uppercase whitespace-nowrap mt-0.5">
                  T05 • ĐH CẢNH SÁT NHÂN DÂN
                </span>
              </div>
            )}
          </div>

          {/* Nút Toggle: Nút thu gọn / mở rộng hiện đại */}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
            className={cn(
              "rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs active:scale-95",
              isCollapsed ? "h-7 w-7" : "h-8 w-8"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            ) : (
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* DANH SÁCH MENU ĐIỀU HƯỚNG CHÍNH (UI CŨ: PHẲNG, GỌN GÀNG, MÀU SẮC ĐA SẮC ĐỘC BẢN) */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)
            const theme = item.theme

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center rounded-xl text-sm transition-all duration-200 group relative cursor-pointer select-none",
                  isCollapsed 
                    ? "justify-center h-11 w-11 mx-auto p-0" 
                    : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? cn(theme.activeBg, theme.activeBorder, theme.activeText, "border font-bold shadow-2xs")
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium hover:translate-x-0.5"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Khối Icon với dải màu pha trộn đa sắc độc bản cho từng trang */}
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-200 shrink-0",
                  isActive 
                    ? theme.iconGradient 
                    : cn("text-slate-400 dark:text-slate-500", theme.hoverIconBg)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      "truncate flex-1 font-semibold text-[13.5px] transition-colors",
                      !isActive && theme.hoverText
                    )}>
                      {item.name}
                    </span>

                    <RenderNavBadge badgeType={item.badgeType} />
                  </>
                )}

                {/* Hiệu ứng thanh active phát sáng màu pha trộn độc quyền bên mép trái */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className={cn(
                      "absolute left-0 top-2 bottom-2 w-1 rounded-r-full",
                      theme.indicatorGradient
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
            )
          })}
        </nav>

        {/* TẦNG CUỐI: ĐĂNG NHẬP HOẶC THẺ SĨ QUAN / HỌC VIÊN CAO CẤP */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0c1019]/60">
          {!isLoggedIn ? (
            <button
              onClick={() => openAuthModal()}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]",
                isCollapsed ? "px-1.5" : ""
              )}
              title="Đăng nhập để vào tài liệu học thi"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>ĐĂNG NHẬP HỆ THỐNG</span>}
            </button>
          ) : (
            <div className={cn(
              "flex items-center rounded-xl p-2 transition-all",
              isCollapsed ? "justify-center" : "justify-between bg-white dark:bg-[#141a27] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500/40"
            )}>
              <div 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                title="Cài đặt tài khoản"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-9 w-9 border border-emerald-500/40 ring-2 ring-emerald-500/15 shadow-xs">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-700 to-teal-600 text-white font-black text-xs">
                      {(() => {
                        const parts = (currentUser?.name || '').trim().split(' ')
                        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : 'CS'
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {currentUser?.name || 'Học viên CAND'}
                      </span>
                      {currentUser?.role === 'ADMIN' || currentUser?.email === 'admin@gmail.com' ? (
                        <span className="px-1.5 py-0.2 rounded-md bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[8.5px] font-black uppercase tracking-wider shrink-0">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[8.5px] font-black uppercase tracking-wider shrink-0">
                          Học viên
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@canbo.t05'}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0 ml-1"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. KHU VỰC NỘI DUNG CHÍNH & TOP HEADER                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* TOP HEADER THANH ĐIỀU HƯỚNG (Ẩn khi đang làm bài thi) */}
        {!isExamTakingMode && (
          <header className={cn(
            "sticky top-0 z-20 w-full bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 py-3 flex items-center justify-between gap-4 transition-colors",
            isStudyMode || isQuizMode ? "px-4 md:px-10 lg:px-12" : "px-4 md:px-8"
          )}>
          
          {/* Trái: Menu button (Mobile hoặc khi ẩn sidebar) & Lời chào học viên / Chế độ học */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Nút Hamburger mở Sidebar trên Mobile hoặc khi Sidebar ẩn (như Luyện đề) */}
            <div className={cn(isQuizMode ? "flex" : "md:hidden")}>
              <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 bg-white dark:bg-[#0f1420] border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between">
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Mobile Drawer */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/40">
                      <div className="p-1 rounded-xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-red-500/10 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                        <PoliceLogo className="h-8 w-8 object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-black text-sm text-slate-900 dark:text-white">JURISPRUDENCE</h2>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80">
                            HUB
                          </span>
                        </div>
                        <p className="text-[9.5px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">T05 • ĐH CẢNH SÁT NHÂN DÂN</p>
                      </div>
                    </div>

                    {/* Danh sách Menu Mobile Flat (Màu sắc đa sắc từng trang theo UI Cũ) */}
                    <nav className="p-3 space-y-1.5">
                      {filteredNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.path === '/' 
                          ? location.pathname === '/' 
                          : location.pathname.startsWith(item.path)
                        const theme = item.theme

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              navigate(item.path)
                              setIsMobileDrawerOpen(false)
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer select-none",
                              isActive
                                ? cn(theme.activeBg, theme.activeBorder, theme.activeText, "border font-bold shadow-2xs")
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-xl shrink-0 transition-all",
                              isActive ? theme.iconGradient : cn("text-slate-400 dark:text-slate-500", theme.hoverIconBg)
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="flex-1 font-semibold text-[13.5px]">{item.name}</span>
                            <RenderNavBadge badgeType={item.badgeType} />
                          </div>
                        )
                      })}
                    </nav>
                  </div>

                  {/* Footer Mobile Drawer */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                    {!isLoggedIn ? (
                      <button
                        onClick={() => openAuthModal()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>ĐĂNG NHẬP HỆ THỐNG</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-700 text-white font-bold text-xs">
                              CS
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Học viên'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            logout()
                            navigate('/')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Đăng xuất"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Khi đang ở chế độ Luyện đề thông minh (sidebar ẩn): Hiển thị nút Về trang chủ & Trạng thái */}
            {isQuizMode ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs cursor-pointer"
                  title="Về Trang chủ"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Trang chủ</span>
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Chế độ Luyện Đề Thông Minh
                  </span>
                </div>
              </div>
            ) : (
              !isStudyMode && (
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                  <img src="/t05-logo.png" alt="T05" className="h-5 w-5 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black tracking-wide text-slate-800 dark:text-slate-100 uppercase leading-none">
                      Trường Đại Học Cảnh Sát Nhân Dân
                    </span>
                    <span className="text-[9.5px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-none mt-0.5">
                      Mã trường: T05 • People's Police University
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Phải: Search bar nhanh, Theme Switch, Thông báo, Nút CTA "+ Luyện Đề Mới" */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            
            {/* Công tắc Theme Switcher (Mặt trời / Mặt trăng theo ảnh) */}
            <div 
              onClick={toggleTheme}
              className="relative flex items-center w-14 h-7 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer select-none transition-colors shadow-inner"
              title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 shadow-sm",
                  isDark ? "translate-x-7 bg-[#5d5fef] text-white" : "translate-x-0 bg-white text-amber-500"
                )}
              >
                {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </div>
            </div>


            {/* NÚT CTA CHÍNH: "+ Luyện Đề Mới" */}
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  openAuthModal('/quiz')
                } else {
                  navigate('/quiz')
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5d5fef] to-[#4b4dc9] hover:from-[#4d4fd9] hover:to-[#3e40b3] text-white text-xs md:text-sm font-bold shadow-md shadow-[#5d5fef]/25 hover:shadow-lg hover:shadow-[#5d5fef]/35 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Luyện Đề Mới</span>
              <span className="sm:hidden">Ôn Thi</span>
            </button>

          </div>
        </header>
        )}

        {/* PHẦN VIEWPORT CHÍNH CHỨA OUTLET NỘI DUNG (LÀM MỜ NHẸ KHI BẮT BUỘC ĐĂNG NHẬP) */}
        <main className={cn(
          "flex-1 w-full mx-auto transition-colors duration-200",
          isExamTakingMode 
            ? "p-0 max-w-full"
            : isStudyMode 
              ? "p-3 sm:p-5 md:p-8 max-w-[1700px]" 
              : isQuizMode
                ? "p-4 md:p-8 lg:p-10 max-w-[1700px]"
                : "p-4 md:p-6 lg:p-7 w-full max-w-full",
          shouldShowAuthModal && "filter blur-[4px] pointer-events-none select-none opacity-70"
        )}>
          <Outlet />
        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL ĐĂNG NHẬP CHÍNH GIỮA MÀN HÌNH VỚI NỀN MỜ NHẸ PHÍA SAU              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {shouldShowAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[3px] overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="my-auto w-full flex justify-center"
            >
              <AuthCardForm
                initialMode={modalInitialMode}
                showCloseButton={true}
                onClose={() => {
                  closeAuthModal()
                  if (isProtectedRoute || isAuthRoute) {
                    navigate('/')
                  }
                }}
                onSuccess={() => {
                  closeAuthModal()
                  if (isAuthRoute) {
                    navigate('/documents')
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
export default RootLayout
