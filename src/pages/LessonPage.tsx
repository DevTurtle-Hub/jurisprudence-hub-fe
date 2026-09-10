import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentApi } from '@/services/api'
import type { ChapterResponse } from '@/types/api'

const moduleThemes = [
  {
    badgeBg: 'bg-blue-600 text-white',
    cardBorder: 'hover:border-blue-500/50',
    titleColor: 'text-blue-600 dark:text-blue-400',
    barColor: 'bg-blue-600',
  },
  {
    badgeBg: 'bg-indigo-600 text-white',
    cardBorder: 'hover:border-indigo-500/50',
    titleColor: 'text-indigo-600 dark:text-indigo-400',
    barColor: 'bg-indigo-600',
  },
  {
    badgeBg: 'bg-purple-600 text-white',
    cardBorder: 'hover:border-purple-500/50',
    titleColor: 'text-purple-600 dark:text-purple-400',
    barColor: 'bg-purple-600',
  },
  {
    badgeBg: 'bg-emerald-600 text-white',
    cardBorder: 'hover:border-emerald-500/50',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-600',
  },
]

export function LessonPage() {
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<ChapterResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChapters = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await DocumentApi.getChapters(true)
      setChapters(data || [])
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách chuyên đề:', err)
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Không thể kết nối máy chủ API')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChapters()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Ngân Hàng Chuyên Đề & Bài Giảng CA4
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chương trình lý luận chuẩn hóa đồng bộ trực tiếp từ máy chủ Giáo trình CAND
          </p>
        </div>

        <button
          onClick={() => navigate('/documents')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs w-fit cursor-pointer"
        >
          <BookOpen className="h-4 w-4" />
          <span>Xem Thư Viện Đầy Đủ</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Đang tải danh sách chuyên đề...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-900/50 space-y-3">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchChapters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">Chưa có chuyên đề nào được xuất bản</h3>
          <p className="text-xs text-slate-500">Các bài giảng mới sẽ hiển thị tại đây khi Ban Khảo Thí xuất bản.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, idx) => {
            const theme = moduleThemes[idx % moduleThemes.length]
            const firstLessonId = ch.lessons?.[0]?.id

            return (
              <div 
                key={ch.id}
                className={cn(
                  "dashboard-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group transition-all border-2",
                  theme.cardBorder
                )}
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "px-3 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1.5",
                      theme.badgeBg
                    )}>
                      <BookOpen className="h-3 w-3" />
                      <span>Chuyên Đề {idx + 1}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {ch.lessons?.length || 0} bài giảng
                    </span>
                  </div>

                  <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#5d5fef] transition-colors leading-snug">
                    {ch.title}
                  </h2>

                  {ch.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-normal">
                      {ch.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {firstLessonId ? (
                    <button
                      onClick={() => navigate(`/documents/${firstLessonId}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Vào Học Ngay</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/documents')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      <span>Xem Chương</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LessonPage
