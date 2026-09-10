import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { DocumentApi, InteractionApi } from '@/services/api'
import type { LessonDetailResponse, AnnotationResponse } from '@/types/api'
import { 
  LessonStudyToolbar, 
  AnnotatedText, 
  type StudyAnnotation 
} from '@/features/documents/components/LessonStudyToolbar'
import { cn } from '@/lib/utils'
import { VietnamWavingFlagIcon } from '@/components/common/VietnamWavingFlagIcon'
import { toRoman } from '@/features/documents/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { toast } from 'sonner'

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, openAuthModal } = useAuth()

  const [lesson, setLesson] = useState<LessonDetailResponse | null>(null)
  const [annotations, setAnnotations] = useState<StudyAnnotation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [isSubmittingProgress, setIsSubmittingProgress] = useState<boolean>(false)

  // Cấu hình thanh công cụ học tập & đọc sách
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base')

  // Popover khi click vào 1 đoạn Highlight/Màu chữ đã có
  const [activeAnnotationPopover, setActiveAnnotationPopover] = useState<{
    annotation: StudyAnnotation
    top: number
    left: number
  } | null>(null)

  // Tải chi tiết bài học và danh sách highlight từ API thật
  const fetchLessonData = useCallback(async () => {
    if (!lessonId) return
    setIsLoading(true)
    setError(null)

    try {
      const [lessonData, annotationsData] = await Promise.all([
        DocumentApi.getLessonDetail(lessonId),
        InteractionApi.getAnnotations(lessonId).catch(() => [] as AnnotationResponse[]),
      ])

      setLesson(lessonData)

      // Chuyển đổi sang định dạng StudyAnnotation của giao diện
      const mappedAnnotations: StudyAnnotation[] = (annotationsData || []).map((ann) => ({
        id: ann.id,
        lessonId: ann.lessonId,
        selectedText: ann.selectedText,
        kind: (ann.kind as 'highlight' | 'textColor') || 'highlight',
        color: ann.color || 'yellow',
        note: ann.note,
        createdAt: ann.createdAt || new Date().toISOString(),
      }))

      setAnnotations(mappedAnnotations)
    } catch (err: unknown) {
      console.error('Lỗi khi tải chi tiết bài học:', err)
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Không thể tải nội dung bài học từ máy chủ.')
    } finally {
      setIsLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLessonData()
  }, [fetchLessonData])

  // Callback khi click vào 1 đoạn highlight trên trang
  const handleAnnotationClick = (ann: StudyAnnotation, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setActiveAnnotationPopover({
      annotation: ann,
      top: Math.max(10, rect.top - 60),
      left: Math.max(10, Math.min(window.innerWidth - 300, rect.left + rect.width / 2 - 130))
    })
  }

  // Đánh dấu hoàn thành bài học qua InteractionApi.updateProgress
  const handleMarkDone = async () => {
    if (!lessonId) return

    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để lưu tiến độ hoàn thành bài học vào hồ sơ cá nhân.')
      openAuthModal()
      return
    }

    setIsSubmittingProgress(true)
    try {
      const res = await InteractionApi.updateProgress(lessonId, true)
      setIsCompleted(res.isCompleted)
      toast.success('Chúc mừng bạn đã hoàn thành bài học này!')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(axiosErr.response?.data?.message || 'Không thể lưu tiến độ học tập')
    } finally {
      setIsSubmittingProgress(false)
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-card p-16 text-center space-y-4 max-w-lg mx-auto my-12 animate-in fade-in">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Đang tải giáo trình bài giảng...
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đang nạp 8 khối nội dung học thuật CAND từ hệ thống
        </p>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="dashboard-card p-12 text-center space-y-4 max-w-lg mx-auto my-12 animate-in fade-in">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Không tìm thấy bài học này
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || 'Bài học có thể đã bị xóa hoặc đường dẫn không chính xác.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchLessonData()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại</span>
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5d5fef] text-white text-xs font-bold hover:bg-[#4b4dc9] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về Thư Viện Tài Liệu</span>
          </button>
        </div>
      </div>
    )
  }

  // Cấu hình style theo cỡ chữ
  const bodyTextClass = cn(
    fontSize === 'sm' && 'text-xs sm:text-sm',
    fontSize === 'base' && 'text-sm md:text-base',
    fontSize === 'lg' && 'text-base md:text-lg',
    fontSize === 'xl' && 'text-lg md:text-xl'
  )

  const headingTextClass = cn(
    "font-black uppercase tracking-wide text-slate-950 dark:text-white",
    fontSize === 'sm' && 'text-sm sm:text-base',
    fontSize === 'base' && 'text-base sm:text-lg',
    fontSize === 'lg' && 'text-lg sm:text-xl',
    fontSize === 'xl' && 'text-xl sm:text-2xl'
  )

  const content = lesson.content || {
    objectives: [],
    coreKnowledge: [],
    definitions: [],
    keywords: [],
    comparisons: [],
    examHotspots: [],
    commonTraps: [],
    memoryTips: []
  }

  return (
    <div className="w-full max-w-[1550px] mx-auto space-y-5 pb-24 animate-in fade-in duration-300">
      
      {/* THANH ĐIỀU HƯỚNG QUAY LẠI THƯ VIỆN & TRẠNG THÁI TIẾN ĐỘ */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => navigate('/documents')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#5d5fef] hover:border-[#5d5fef] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Danh Sách Chương & Bài Học</span>
        </button>

        {/* Nút Hoàn thành bài học */}
        <button
          onClick={handleMarkDone}
          disabled={isSubmittingProgress}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer",
            isCompleted 
              ? "bg-emerald-600 text-white shadow-emerald-600/30" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
          )}
        >
          {isSubmittingProgress ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{isCompleted ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học Xong'}</span>
        </button>
      </div>

      {/* THANH CÔNG CỤ HỌC TẬP: HIGHLIGHT, GHI CHÚ, ĐỌC TO & ĐỔI CỠ CHỮ */}
      <LessonStudyToolbar
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        chapterTitle={lesson.chapterTitle || 'GIÁO TRÌNH PHÁP LUẬT CAND'}
        contentRef={contentRef}
        fontSize={fontSize}
        setFontSize={setFontSize}
        annotations={annotations}
        setAnnotations={setAnnotations}
        activeAnnotationPopover={activeAnnotationPopover}
        setActiveAnnotationPopover={setActiveAnnotationPopover}
      />

      {/* KHUNG NỘI DUNG SÁCH BÀI HỌC FULL-PAGE TRỌNG TÂM */}
      <div 
        ref={contentRef}
        id="lesson-content-area"
        className="p-6 sm:p-10 md:p-14 space-y-10 rounded-3xl border transition-all duration-200 w-full shadow-sm select-text bg-white dark:bg-[#10141f] text-slate-900 dark:text-slate-100 border-slate-200/90 dark:border-slate-800"
      >
        
        {/* Header Giáo Trình Chuẩn Bộ Công An */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 space-y-4 text-center">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight">
            <div className="text-left space-y-0.5">
              <p className="font-extrabold tracking-wider">BỘ CÔNG AN</p>
              <p className="font-bold underline decoration-1 underline-offset-4">
                TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 border border-slate-800 dark:border-slate-400 text-[10px] font-bold uppercase tracking-wider rounded">
                (LƯU HÀNH NỘI BỘ)
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2 flex flex-col items-center justify-center text-center w-full">
            <p className="text-xs sm:text-sm font-extrabold uppercase text-slate-800 dark:text-slate-200 text-center">
              TẬP BÀI GIẢNG ÔN THI
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-center text-slate-950 dark:text-white">
              MÔN: LÝ LUẬN VỀ NHÀ NƯỚC VÀ PHÁP LUẬT
            </h2>
            <p className="text-xs italic max-w-xl mx-auto leading-relaxed text-center text-slate-600 dark:text-slate-300">
              (Dành cho thí sinh dự thi tuyển sinh đào tạo trình độ đại học chính quy tuyển mới đối với công dân đã có bằng tốt nghiệp trình độ đại học trở lên - đợt thi tháng 9/2027)
            </p>
          </div>

          {/* Thông tin chương và bài học */}
          <div className="pt-4 flex flex-col items-center gap-2 border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-xl border shadow-2xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
              <VietnamWavingFlagIcon className="w-4 h-4 shrink-0" size={16} />
              <span>{lesson.chapterTitle || 'CHƯƠNG BÀI HỌC'}</span>
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug pt-0.5 text-balance text-slate-950 dark:text-white">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* =================================================================== */}
        {/* NỘI DUNG 8 KHỐI HỌC THUẬT CAND TỰ ĐỘNG ĐÁNH SỐ LA MÃ LIÊN TỤC      */}
        {/* =================================================================== */}
        {(() => {
          let romanCounter = 0
          return (
            <>
              {/* 1. Mục tiêu cần nắm */}
              {content.objectives && content.objectives.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. MỤC TIÊU CẦN NẮM
                  </h2>
                  <div className="space-y-2 pl-2">
                    {content.objectives.map((obj, i) => (
                      <div key={i} className={cn("flex items-start gap-2.5 leading-relaxed font-normal", bodyTextClass)}>
                        <span className="font-bold shrink-0">•</span>
                        <span>
                          <AnnotatedText text={obj} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Kiến thức trọng tâm */}
              {content.coreKnowledge && content.coreKnowledge.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. KIẾN THỨC TRỌNG TÂM
                  </h2>
                  <div className="space-y-3 pl-2">
                    {content.coreKnowledge.map((item, i) => (
                      <div key={i} className={cn("flex items-start gap-2.5 leading-relaxed font-normal", bodyTextClass)}>
                        <span className="font-bold shrink-0">{i + 1}.</span>
                        <span>
                          <AnnotatedText text={item} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Khái niệm cần nhớ */}
              {content.definitions && content.definitions.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. KHÁI NIỆM CẦN NHỚ
                  </h2>
                  <div className="space-y-2.5 pl-2">
                    {content.definitions.map((def, i) => (
                      <div key={i} className={cn("leading-relaxed font-normal", bodyTextClass)}>
                        <span className="font-bold">• {def.term}:</span>{' '}
                        <span>
                          <AnnotatedText 
                            text={def.definition || (def as { meaning?: string }).meaning || ''} 
                            annotations={annotations} 
                            onAnnotationClick={handleAnnotationClick} 
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Từ khóa cốt lõi */}
              {content.keywords && content.keywords.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. TỪ KHÓA CỐT LÕI
                  </h2>
                  <div className="flex flex-wrap gap-2 pl-2">
                    {content.keywords.map((kw, kIdx) => (
                      <span 
                        key={kIdx} 
                        className={cn(
                          "px-3 py-1 rounded-lg font-bold border transition-colors bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                          bodyTextClass
                        )}
                      >
                        #<AnnotatedText text={kw} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. So sánh & phân biệt */}
              {content.comparisons && content.comparisons.length > 0 && (
                <div className="space-y-3.5">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. SO SÁNH & PHÂN BIỆT
                  </h2>
                  <div className="space-y-3.5 pl-2">
                    {content.comparisons.map((comp, i) => (
                      <div key={i} className={cn("space-y-1.5 leading-relaxed font-normal p-3.5 rounded-2xl border bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800", bodyTextClass)}>
                        <p className="font-bold">
                          {i + 1}. Tiêu chí: <AnnotatedText text={comp.criteria} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                        </p>
                        <p className="pl-4">
                          - <strong className="font-semibold">Khái niệm 1:</strong>{' '}
                          <AnnotatedText 
                            text={comp.conceptA || (comp as { itemA?: string }).itemA || ''} 
                            annotations={annotations} 
                            onAnnotationClick={handleAnnotationClick} 
                          />
                        </p>
                        <p className="pl-4">
                          - <strong className="font-semibold">Khái niệm 2:</strong>{' '}
                          <AnnotatedText 
                            text={comp.conceptB || (comp as { itemB?: string }).itemB || ''} 
                            annotations={annotations} 
                            onAnnotationClick={handleAnnotationClick} 
                          />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Trọng tâm ra thi sát hạch */}
              {content.examHotspots && content.examHotspots.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. TRỌNG TÂM RA THI SÁT HẠCH
                  </h2>
                  <div className="space-y-2 pl-2">
                    {content.examHotspots.map((hotspot, i) => (
                      <div key={i} className={cn("flex items-start gap-2.5 leading-relaxed font-normal", bodyTextClass)}>
                        <span className="font-bold shrink-0">•</span>
                        <span>
                          <AnnotatedText text={hotspot} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Bẫy đề thi & điểm dễ nhầm */}
              {content.commonTraps && content.commonTraps.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. BẪY ĐỀ THI & ĐIỂM DỄ NHẦM
                  </h2>
                  <div className="space-y-2 pl-2">
                    {content.commonTraps.map((trap, i) => (
                      <div key={i} className={cn("flex items-start gap-2.5 leading-relaxed font-normal", bodyTextClass)}>
                        <span className="font-bold shrink-0">•</span>
                        <span>
                          <AnnotatedText text={trap} annotations={annotations} onAnnotationClick={handleAnnotationClick} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Mẹo ghi nhớ nhanh */}
              {content.memoryTips && content.memoryTips.length > 0 && (
                <div className="space-y-3">
                  <h2 className={headingTextClass}>
                    {toRoman(++romanCounter)}. MẸO GHI NHỚ NHANH
                  </h2>
                  <div className="space-y-2 pl-2">
                    {content.memoryTips.map((tip, i) => (
                      <p key={i} className={cn("leading-relaxed italic font-normal", bodyTextClass)}>
                        "<AnnotatedText text={tip} annotations={annotations} onAnnotationClick={handleAnnotationClick} />"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        })()}

        {/* ĐIỀU HƯỚNG BÀI TRƯỚC / BÀI TIẾP THEO THEO CHUẨN API NAVIGATION */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {lesson.navigation?.prevLessonId ? (
            <button
              onClick={() => navigate(`/documents/${lesson.navigation.prevLessonId}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>← Bài Trước</span>
            </button>
          ) : <div />}

          {lesson.navigation?.nextLessonId && (
            <button
              onClick={() => navigate(`/documents/${lesson.navigation.nextLessonId}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all ml-auto cursor-pointer"
            >
              <span>Bài Kế Tiếp →</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  )
}

export default LessonDetailPage
