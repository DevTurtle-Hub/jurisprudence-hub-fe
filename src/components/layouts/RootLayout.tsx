import { useState, useEffect } from 'react'
import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom'
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
  Bell,
  Plus
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

interface NavItem {
  name: string
  path: string
  icon: any
  badge?: string
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

  // Quản lý Dark Mode (Mặc định Light Mode theo đúng ảnh mẫu)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return false // Mặc định sáng mịn màng theo ảnh mẫu
  })

  // Quản lý dropdown Thông báo
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

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

  // Danh mục menu phù hợp với nền tảng pháp luật & sát hạch CA4
  // Theo yêu cầu: Ngân hàng câu hỏi chỉ có admin mới được phép xem và thêm
  const allMenuItems: (NavItem & { adminOnly?: boolean })[] = [
    { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { name: 'Thư viện Tài liệu', path: '/documents', icon: FileText, badge: 'Mới' },
    { name: 'Phòng Thi Thử', path: '/exams', icon: GraduationCap },
    { name: 'Luyện Đề Thông Minh', path: '/quiz', icon: ClipboardList },
    { name: 'Ngân Hàng Câu Hỏi', path: '/question-bank', icon: Layers, adminOnly: true },
    { name: 'Cài Đặt Hệ Thống', path: '/settings', icon: Settings },
  ]

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin)

  // Danh sách thông báo học tập & thi cử CAND chính thức
  const notifications = [
    {
      id: 1,
      title: 'Phòng thi CAND-9466 đã mở',
      desc: 'Kỳ thi sát hạch CA4 Văn bằng 2 CAND gồm 60 câu trắc nghiệm và 01 bài tự luận chính thức.',
      time: '10 phút trước',
      isNew: true
    },
    {
      id: 2,
      title: 'Giáo trình Lý luận CAND (Chuẩn T05)',
      desc: 'Đã cập nhật toàn diện 28 bài học CAND với 8 khối kiến thức trọng tâm và sơ đồ tư duy.',
      time: '1 giờ trước',
      isNew: true
    },
    {
      id: 3,
      title: 'Nghị quyết số 66-NQ/TW & Hiến pháp 2025',
      desc: 'Cập nhật trọng tâm ôn tập về xây dựng và hoàn thiện Nhà nước pháp quyền XHCN Việt Nam.',
      time: '3 giờ trước',
      isNew: false
    }
  ]

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
      {/* 1. SIDEBAR CHO DESKTOP (Ẩn khi vào chế độ đọc bài học, phòng thi, hoặc luyện đề) */}
      {/* ========================================================================= */}
      {!isStudyMode && !isExamTakingMode && !isQuizMode && (
        <aside 
          className={cn(
            "hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ease-in-out bg-white dark:bg-[#111622] border-r border-slate-200/80 dark:border-slate-800 shadow-[2px_0_12px_rgba(0,0,0,0.02)]",
            isCollapsed ? "w-20" : "w-72"
          )}
        >
        {/* Sidebar Header: Logo + Tên Brand + Nút Toggle Icon Hiện Đại */}
        <div className={cn(
          "border-b border-slate-100 dark:border-slate-800/80 transition-all duration-300",
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
            title="Jurisprudence Hub - CA4"
          >
            <div className="relative shrink-0">
              <PoliceLogo className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111622]" />
            </div>

            {/* Chỉ hiển thị text khi mở rộng, ẩn hoàn toàn khi thu gọn */}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-black text-[15px] tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  Jurisprudence Hub
                </span>
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-wider uppercase whitespace-nowrap mt-0.5">
                  T05 • ĐH CẢNH SÁT NHÂN DÂN
                </span>
              </div>
            )}
          </div>

          {/* Nút Toggle: Chỉ giữ lại ICON, không có chữ Collapse */}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
            className={cn(
              "rounded-xl flex items-center justify-center text-slate-400 hover:text-[#5d5fef] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs",
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

        {/* Danh sách Menu Items */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          <div>
            {!isCollapsed && (
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">
                Menu
              </div>
            )}

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isCollapsed 
                        ? "justify-center h-10 w-10 mx-auto p-0" 
                        : "gap-3 px-3.5 py-2.5",
                      isActive
                        ? "text-[#5d5fef] dark:text-[#8082ff] bg-[#f0effe] dark:bg-[#5d5fef]/15 font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <Icon className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      isActive ? "text-[#5d5fef] dark:text-[#8082ff]" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    )}

                    {/* Hiệu ứng thanh active bên trái */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#5d5fef] rounded-r-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Đăng nhập hoặc Thẻ thông tin Học viên */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e131f]/50">
          {!isLoggedIn ? (
            <button
              onClick={() => openAuthModal()}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-red-600/25 hover:shadow-lg transition-all cursor-pointer",
                isCollapsed ? "px-1.5" : ""
              )}
              title="Đăng nhập để vào tài liệu học thi"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>ĐĂNG NHẬP</span>}
            </button>
          ) : (
            <div className={cn(
              "flex items-center rounded-xl p-2 transition-colors",
              isCollapsed ? "justify-center" : "justify-between bg-white dark:bg-[#151b29] border border-slate-200/70 dark:border-slate-800 shadow-xs"
            )}>
              <div 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                title="Cài đặt tài khoản"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border border-red-500/30 ring-2 ring-red-500/10 shadow-xs">
                    <AvatarFallback className="bg-gradient-to-br from-red-600 to-amber-600 text-white font-bold text-xs">
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
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#5d5fef] transition-colors">
                        {currentUser?.name || 'Học viên CAND'}
                      </span>
                      {currentUser?.role === 'ADMIN' || currentUser?.email === 'admin@gmail.com' ? (
                        <span className="px-1.5 py-0.2 rounded-md bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[9px] font-black uppercase tracking-wider shrink-0">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-black uppercase tracking-wider shrink-0">
                          Học viên
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@chien_si.cand'}
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
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
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-[#111622] border-r border-slate-200 dark:border-slate-800">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <PoliceLogo className="h-9 w-9" />
                    <div>
                      <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Jurisprudence Hub</h2>
                      <p className="text-[10px] font-black text-red-600 dark:text-red-400">T05 • ĐH Cảnh Sát Nhân Dân</p>
                    </div>
                  </div>
                  <div className="p-3 space-y-1 overflow-y-auto">
                    {menuItems.map(item => (
                      <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={(e) => {
                        const isProtected = item.path !== '/'
                        if (!isLoggedIn && isProtected) {
                          e.preventDefault()
                          openAuthModal(item.path)
                        }
                      }}
                      className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          isActive
                            ? "text-[#5d5fef] bg-[#f0effe] dark:bg-[#5d5fef]/15 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    ))}
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

            {/* Nút Chuông Thông báo */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Thông báo"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {/* Dropdown Thông báo */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">Thông Báo Học Tập</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#5d5fef]/10 text-[#5d5fef]">
                          {unreadCount} mới
                        </span>
                      </div>
                      <button 
                        onClick={() => setUnreadCount(0)}
                        className="text-xs text-slate-400 hover:text-[#5d5fef] transition-colors cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 my-2 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{n.desc}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-[#5d5fef] hover:bg-[#5d5fef]/5 rounded-lg transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
