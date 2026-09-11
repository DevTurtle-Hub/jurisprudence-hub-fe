import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  Zap,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { DocumentApi } from '@/services/api'
import { examApi } from '@/services/examApi'
import type { ChapterResponse } from '@/types/api'

export function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, currentUser, openAuthModal } = useAuth()

  const [chapters, setChapters] = useState<ChapterResponse[]>([])
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(true)
  const [examRoomsCount, setExamRoomsCount] = useState<number>(0)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')

  // Lấy dữ liệu thật 100% từ Backend Database (Không dùng mock data)
  useEffect(() => {
    let isMounted = true

    const loadRealData = async () => {
      try {
        setIsLoadingChapters(true)
        const chData = await DocumentApi.getChapters(true)
        if (isMounted) {
          if (Array.isArray(chData)) {
            setChapters(chData)
            if (chData.length > 0) {
              setSelectedChapterId(chData[0].id)
            }
          } else {
            setChapters([])
          }
        }
      } catch (err) {
        console.warn('Không thể tải danh sách chương từ máy chủ:', err)
        if (isMounted) setChapters([])
      } finally {
        if (isMounted) setIsLoadingChapters(false)
      }

      try {
        const rooms = await examApi.getRooms()
        let count = 0
        if (Array.isArray(rooms)) count = rooms.length
        else if (rooms?.items) count = rooms.items.length
        else if (rooms?.content) count = rooms.content.length
        if (isMounted) setExamRoomsCount(count)
      } catch {
        // Dự phòng an toàn
      }
    }

    loadRealData()
    return () => { isMounted = false }
  }, [])

  const handleProtectedAction = (actionPath?: string) => {
    if (!isLoggedIn) {
      openAuthModal(actionPath)
    } else if (actionPath) {
      navigate(actionPath)
    }
  }

  // Thống kê thực tế từ dữ liệu giáo trình
  const totalChapters = chapters.length
  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0)
  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0]

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300 pb-16 w-full">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER HIỆN ĐẠI - MÀU SẮC PHA TRỘN MỀM MẠI & SANG TRỌNG           */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 lg:p-10 border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-500/10 via-white to-blue-500/10 dark:from-indigo-950/40 dark:via-[#111625] dark:to-purple-950/30 shadow-xl shadow-indigo-500/5">
        
        {/* Các quả cầu ánh sáng pha màu nền (Ambient blurred color orbs) */}
        <div className="absolute -top-36 -left-36 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-gradient-to-tl from-purple-500/20 via-pink-500/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-400/10 via-amber-400/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Cột trái: Tiêu đề gradient, mô tả & nút bấm màu sắc */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Tag nhận diện pha màu đa sắc */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/15 via-amber-500/10 to-blue-500/15 border border-red-500/25 dark:border-red-400/30 text-red-700 dark:text-red-300 text-xs font-bold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span>Đại Học Cảnh Sát Nhân Dân • Mã trường T05</span>
            </div>

            {/* Tiêu đề pha màu gradient tuyệt đẹp */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.15]">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                  Lý Luận Nhà Nước
                </span>{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-300 dark:via-pink-300 dark:to-rose-300 bg-clip-text text-transparent">
                  Và Pháp Luật
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Cổng học tập trực tuyến chuẩn hóa bám sát ngân hàng câu hỏi & sát hạch nghiệp vụ CAND
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Hệ thống điện tử tích hợp đầy đủ 8 khối học thuật chuyên sâu (Mục tiêu, Kiến thức cốt lõi, Khái niệm, Bảng so sánh, Bẫy lý thuyết, Trọng tâm thi cử), kết hợp phòng thi sát hạch chuẩn hóa và luyện trắc nghiệm thông minh.
            </p>

            {/* Các nút hành động chính phối màu gradient hiện đại */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/documents')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Vào Học Giáo Trình</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </button>

              <button
                onClick={() => handleProtectedAction('/exams')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200/80 dark:border-purple-800/80 bg-purple-50/60 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Phòng Thi Sát Hạch</span>
              </button>

              <button
                onClick={() => handleProtectedAction('/quiz')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/60 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Luyện Đề Nhanh</span>
              </button>
            </div>

            {/* Dải thông số tóm tắt thực tế với các điểm nhấn màu sắc */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <span><strong>{totalChapters}</strong> Chuyên đề lý luận</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <span><strong>{totalLessons}</strong> Bài giảng điện tử</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span>Sát hạch trực tuyến 24/7</span>
              </div>
            </div>

          </div>

          {/* Cột phải: Hình ảnh nhận diện với viền phát sáng gradient tinh tế */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="relative group">
              {/* Vòng hào quang đa sắc phía sau ảnh */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 opacity-25 blur-lg group-hover:opacity-50 transition duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden border border-white/60 dark:border-slate-700 shadow-xl aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                <img 
                  src="/hero-bg.jpg" 
                  alt="Lực lượng Công an nhân dân Việt Nam" 
                  className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-between text-xs border border-white/10 shadow-lg">
                  <div className="flex items-center gap-2 truncate">
                    <img src="/t05-logo.png" alt="T05" className="h-5 w-5 rounded-full object-contain shrink-0 ring-1 ring-amber-400" />
                    <span className="font-bold truncate">Trường ĐH Cảnh Sát Nhân Dân</span>
                  </div>
                  <span className="text-[10.5px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md shrink-0 border border-amber-500/30 font-mono">T05-CAND</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. HÀNG 4 THẺ CHỈ SỐ PHA TRỘN MÀU SẮC ĐA DẠNG (100% REAL DATA)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Chuyên Đề (Pha màu Xanh Dương & Cyan) */}
        <div 
          onClick={() => navigate('/documents')}
          className="relative rounded-2xl p-4.5 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-white dark:from-blue-950/30 dark:via-[#131722] dark:to-cyan-950/20 border border-blue-200/80 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chuyên Đề</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              {totalChapters}
            </span>{' '}
            <span className="text-xs font-bold text-slate-500">Chương</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Giáo trình lý luận trọng tâm</p>
        </div>

        {/* Card 2: Bài Giảng (Pha màu Xanh Lá & Ngọc Lục Bảo) */}
        <div 
          onClick={() => navigate('/documents')}
          className="relative rounded-2xl p-4.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/30 dark:via-[#131722] dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bài Giảng</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              {totalLessons}
            </span>{' '}
            <span className="text-xs font-bold text-slate-500">Bài học</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Đầy đủ 8 khối học thuật</p>
        </div>

        {/* Card 3: Sát Hạch (Pha màu Tím & Indigo) */}
        <div 
          onClick={() => handleProtectedAction('/exams')}
          className="relative rounded-2xl p-4.5 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white dark:from-purple-950/30 dark:via-[#131722] dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-500 shadow-xs hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sát Hạch</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
              {examRoomsCount > 0 ? examRoomsCount : 'Chuẩn CA4'}
            </span>{' '}
            <span className="text-xs font-bold text-slate-500">Bộ đề</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Chấm thi & ký số tự động</p>
        </div>

        {/* Card 4: Luyện Đề (Pha màu Cam & Hổ Phách) */}
        <div 
          onClick={() => handleProtectedAction('/quiz')}
          className="relative rounded-2xl p-4.5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:from-amber-950/30 dark:via-[#131722] dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Luyện Đề</span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-300 bg-clip-text text-transparent">
              24/7
            </span>{' '}
            <span className="text-xs font-bold text-slate-500">Tự do</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Chọn lọc 10 đến 40 câu</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. KHUNG BÀI GIẢNG VÀ CHUYÊN ĐỀ (100% DATA THẬT TỪ DATABASE)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cột trái (8/12): Danh sách các chương và bài học thật */}
        <div className="lg:col-span-8 rounded-3xl p-5 sm:p-6 md:p-7 bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Khung Chương Trình & Bài Giảng Trực Tuyến
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bấm vào từng chuyên đề để xem danh sách bài học và truy cập nội dung chi tiết
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/documents')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100/80 transition-colors cursor-pointer self-start sm:self-center"
            >
              <span>Xem Toàn Bộ Thư Viện</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Danh sách tab chọn chương (Dữ liệu thật 100% từ Database) */}
          {isLoadingChapters ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2.5 text-indigo-500" />
              <span className="text-xs font-semibold">Đang đồng bộ dữ liệu từ máy chủ...</span>
            </div>
          ) : chapters.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="h-9 w-9 mx-auto text-slate-400 dark:text-slate-500 mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có chương giáo trình nào trong CSDL</p>
              <p className="text-xs text-slate-400 mt-1">Dữ liệu từ Database sẽ tự động hiển thị tại đây khi bạn tạo chương mới</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {chapters.map((ch, idx) => {
                  const isSelected = ch.id === selectedChapterId
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-[1.02]"
                          : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60"
                      )}
                    >
                      Chương {idx + 1} ({ch.lessons?.length || 0} bài)
                    </button>
                  )
                })}
              </div>

              {/* Chi tiết chương đang chọn & các bài giảng bên trong */}
              {activeChapter && (
                <div className="space-y-3.5 pt-1">
                  
                  {/* Banner tóm tắt chương với gradient dịu mắt */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-blue-50/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-800/40 shadow-2xs flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                          Chuyên đề trọng tâm
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {activeChapter.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Bao gồm {activeChapter.lessons?.length || 0} bài giảng lý luận chuyên sâu và câu hỏi thực hành CAND
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/documents')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors shrink-0 cursor-pointer hidden sm:inline-flex items-center gap-1"
                    >
                      <span>Mở Chương</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Danh sách bài giảng thật dạng lưới đa cột */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {activeChapter.lessons?.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        onClick={() => navigate(`/documents/${lesson.id}`)}
                        className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40">
                              Bài {idx + 1}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-medium">8 khối học thuật</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                            {lesson.title}
                          </h4>
                        </div>

                        <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:translate-x-0.5 transition-all shrink-0 mt-1">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* Cột phải (4/12): Lối tắt sát hạch & hồ sơ học viên pha màu rực rỡ */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card hồ sơ học viên với viền gradient nổi bật */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/10">
            <div className="p-5 rounded-[23px] bg-white dark:bg-[#131722]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/25 shrink-0">
                  {isLoggedIn && currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserCheck className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider block">
                    Hồ Sơ Học Viên
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {isLoggedIn && currentUser?.name ? currentUser.name : 'Học viên / Thí sinh vãng lai'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isLoggedIn && currentUser?.unit ? currentUser.unit : 'Trường ĐH Cảnh Sát Nhân Dân'}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Trạng thái:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isLoggedIn ? 'Đã kích hoạt' : 'Khách truy cập'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Lối tắt phòng thi sát hạch (Pha màu Tím & Indigo) */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white dark:from-purple-950/30 dark:via-[#131722] dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/50 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                Sát Hạch Trực Tuyến
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Thi thử với bộ đề bám sát ngân hàng câu hỏi sát hạch T05, hệ thống tự động tính điểm và lưu biên bản nộp bài có mã bảo mật.
            </p>

            <button
              onClick={() => handleProtectedAction('/exams')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/35 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Vào Phòng Thi Sát Hạch</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card Lối tắt Luyện Đề Nhanh (Pha màu Xanh Ngọc & Teal) */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/30 dark:via-[#131722] dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/50 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Luyện Trắc Nghiệm Thông Minh
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Chọn nhanh số câu trắc nghiệm (10, 20, 40 câu) để ôn tập tức thì, có đáp án giải thích chi tiết và điều luật quy phạm liên quan.
            </p>

            <button
              onClick={() => handleProtectedAction('/quiz')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Bắt Đầu Luyện Đề</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card Tra cứu văn bản (Pha màu Hổ Phách & Cam) */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:from-amber-950/30 dark:via-[#131722] dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
                <Search className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Thư Viện Tài Liệu CAND
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Tra cứu toàn văn tài liệu pháp luật, các án lệ và quy phạm pháp luật phục vụ đào tạo nghiệp vụ và nghiên cứu tại T05.
            </p>

            <button
              onClick={() => navigate('/documents')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Khám Phá Tài Liệu</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}

export default HomePage
