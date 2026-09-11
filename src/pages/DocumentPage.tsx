import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  BookOpen, Plus, Search, ChevronDown, ChevronUp,
  Trash2, X, FolderPlus, Save, Edit3, ArrowRight,
  Filter, RotateCcw, Loader2, RefreshCw, AlertTriangle,
  Layers, ShieldCheck, Sparkles
} from 'lucide-react'
import { VietnamWavingFlagIcon } from '@/components/common/VietnamWavingFlagIcon'
import { cn } from '@/lib/utils'
import type { 
  ChapterResponse, 
  LessonSummaryResponse, 
  LessonContentRequest 
} from '@/types/api'
import { DocumentApi } from '@/services/api'
import { toast } from 'sonner'
import { CandEmblemIcon, VietnamFlagStarIcon } from '@/components/common/CandIcons'
import { isAdminUser } from '@/features/auth/authUtils'
import { useAuth } from '@/features/auth/AuthContext'
import { toRoman, getEmptyLessonData } from '@/features/documents/utils'

// Bảng màu cho từng chương trên giao diện ngoài
const chapterColorThemes = [
  { 
    bg: 'bg-blue-600', 
    text: 'text-blue-600 dark:text-blue-400', 
    light: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50',
    progress: 'from-blue-600 to-cyan-500',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    border: 'border-blue-200/80 dark:border-blue-800/60',
    glow: 'shadow-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500'
  },
  { 
    bg: 'bg-indigo-600', 
    text: 'text-indigo-600 dark:text-indigo-400', 
    light: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50',
    progress: 'from-indigo-600 to-purple-500',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    border: 'border-indigo-200/80 dark:border-indigo-800/60',
    glow: 'shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500'
  },
  { 
    bg: 'bg-purple-600', 
    text: 'text-purple-600 dark:text-purple-400', 
    light: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50',
    progress: 'from-purple-600 to-pink-500',
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-500',
    border: 'border-purple-200/80 dark:border-purple-800/60',
    glow: 'shadow-purple-500/10 hover:border-purple-400 dark:hover:border-purple-500'
  },
  { 
    bg: 'bg-emerald-600', 
    text: 'text-emerald-600 dark:text-emerald-400', 
    light: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50',
    progress: 'from-emerald-600 to-teal-500',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
    glow: 'shadow-emerald-500/10 hover:border-emerald-400 dark:hover:border-emerald-500'
  },
  { 
    bg: 'bg-amber-600', 
    text: 'text-amber-600 dark:text-amber-400', 
    light: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50',
    progress: 'from-amber-600 to-orange-500',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    border: 'border-amber-200/80 dark:border-amber-800/60',
    glow: 'shadow-amber-500/10 hover:border-amber-400 dark:hover:border-amber-500'
  },
]

// =========================================================================
// COMPONENT TRANG SÁCH GIÁO TRÌNH / CUỐN VỞ BÀI TẬP THỰC TẾ (LIVE PREVIEW)
// =========================================================================
function LessonNotebookPreview({ 
  formData, 
  currentChapter 
}: { 
  formData: {
    title?: string
    objectives?: string
    coreKnowledge?: string
    definitions?: string | { term: string; meaning: string }[]
    keywords?: string
    comparisons?: string | { criteria: string; itemA: string; itemB: string }[]
    examHotspots?: string
    commonTraps?: string
    memoryTips?: string
  }
  currentChapter?: ChapterResponse
}) {
  const objectivesList = (formData?.objectives || '').split('\n').map(s => s.trim()).filter(Boolean)
  const coreList = (formData?.coreKnowledge || '').split('\n').map(s => s.trim()).filter(Boolean)
  const keywordsList = (formData?.keywords || '').split(',').map(s => s.trim()).filter(Boolean)
  const examList = (formData?.examHotspots || '').split('\n').map(s => s.trim()).filter(Boolean)
  const trapList = (formData?.commonTraps || '').split('\n').map(s => s.trim()).filter(Boolean)
  const tipList = (formData?.memoryTips || '').split('\n').map(s => s.trim()).filter(Boolean)

  const validDefs: { term: string; meaning: string }[] = typeof formData?.definitions === 'string'
    ? (formData.definitions || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const colonIdx = line.indexOf(':')
          const dashIdx = line.indexOf(' - ')
          if (colonIdx > 0 && (dashIdx === -1 || colonIdx < dashIdx)) {
            return { term: line.slice(0, colonIdx).trim(), meaning: line.slice(colonIdx + 1).trim() }
          } else if (dashIdx > 0) {
            return { term: line.slice(0, dashIdx).trim(), meaning: line.slice(dashIdx + 3).trim() }
          }
          return { term: `Khái niệm #${idx + 1}`, meaning: line }
        })
    : (formData?.definitions || []).filter(d => d && (d.term?.trim() || d.meaning?.trim()))

  const validComps: { criteria: string; itemA: string; itemB: string }[] = typeof formData?.comparisons === 'string'
    ? (formData.comparisons || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(line => {
          const colonIdx = line.indexOf(':')
          if (colonIdx > 0) {
            const criteria = line.slice(0, colonIdx).trim()
            const rest = line.slice(colonIdx + 1).trim()
            const parts = rest.split(/\s*(?:vs|và|với|;)\s*/i)
            return {
              criteria,
              itemA: parts[0]?.trim() || rest,
              itemB: parts[1]?.trim() || ''
            }
          }
          return { criteria: '', itemA: line, itemB: '' }
        })
    : (formData?.comparisons || []).filter(c => c && (c.criteria?.trim() || c.itemA?.trim() || c.itemB?.trim()))

  return (
    <div className="relative bg-white text-slate-950 rounded-xl p-6 sm:p-9 border border-slate-300 shadow-md font-sans space-y-6 select-none overflow-hidden">
      
      {/* HEADER CHUẨN GIÁO TRÌNH BỘ CÔNG AN / TRƯỜNG ĐH CẢNH SÁT NHÂN DÂN */}
      <div className="border-b-2 border-slate-900 pb-5 space-y-3.5 text-center">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight">
          <div className="text-left space-y-0.5">
            <p className="font-extrabold text-slate-900 tracking-wider">BỘ CÔNG AN</p>
            <p className="font-bold underline decoration-slate-900 decoration-1 underline-offset-4">
              TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-0.5 border border-slate-800 text-[10px] font-bold uppercase tracking-wider rounded">
              (LƯU HÀNH NỘI BỘ)
            </span>
          </div>
        </div>

        <div className="pt-2 space-y-1.5 flex flex-col items-center justify-center text-center w-full">
          <p className="text-xs sm:text-sm font-extrabold uppercase text-slate-800 text-center">
            TẬP BÀI GIẢNG ÔN THI
          </p>
          <h2 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-tight leading-tight text-center">
            MÔN: LÝ LUẬN VỀ NHÀ NƯỚC VÀ PHÁP LUẬT
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 italic max-w-xl mx-auto leading-relaxed text-center">
            (Dành cho thí sinh dự thi tuyển sinh đào tạo trình độ đại học chính quy tuyển mới đối với công dân đã có bằng tốt nghiệp trình độ đại học trở lên - đợt thi tháng 9/2027)
          </p>
        </div>

        {/* Thông tin chương và bài học */}
        <div className="pt-3 flex flex-col items-center gap-1.5 border-t border-slate-200">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 bg-slate-100 px-3.5 py-1 rounded border border-slate-300 shadow-2xs">
            {currentChapter?.title || 'CHƯƠNG ĐANG SOẠN'}
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight leading-snug pt-0.5 text-balance">
            {formData?.title || '(Chưa nhập tên bài học...)'}
          </h1>
        </div>
      </div>

      {/* Nội dung cuốn vở - Định dạng Trắng Đen Chuẩn Mực Học Thuật, Tự Động Đánh Số La Mã I, II, III... Liên Tục */}
      <div className="space-y-6 text-xs sm:text-sm text-slate-900 leading-relaxed">
        {(() => {
          const sections = [
            {
              id: 'objectives',
              title: 'MỤC TIÊU CẦN NẮM',
              hasContent: objectivesList.length > 0,
              render: () => (
                <div className="space-y-1.5 pl-2">
                  {objectivesList.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed font-normal text-slate-900">
                      <span className="text-slate-700 font-bold">•</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'core',
              title: 'KIẾN THỨC TRỌNG TÂM',
              hasContent: coreList.length > 0,
              render: () => (
                <div className="space-y-2 pl-2">
                  {coreList.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed text-slate-900 font-normal">
                      <span className="font-bold text-slate-950 shrink-0">{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'defs',
              title: 'KHÁI NIỆM CẦN NHỚ',
              hasContent: validDefs.length > 0,
              render: () => (
                <div className="space-y-2 pl-2">
                  {validDefs.map((def, i) => (
                    <div key={i} className="leading-relaxed font-normal text-slate-900">
                      <span className="font-bold text-slate-950">• {def.term || `Khái niệm #${i + 1}`}:</span>{' '}
                      <span>{def.meaning || '(Chưa có định nghĩa)'}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'keywords',
              title: 'TỪ KHÓA CỐT LÕI',
              hasContent: keywordsList.length > 0,
              render: () => (
                <div className="flex flex-wrap gap-2 pl-2">
                  {keywordsList.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 font-bold text-slate-800 text-xs">
                      #{kw}
                    </span>
                  ))}
                </div>
              )
            },
            {
              id: 'comps',
              title: 'SO SÁNH & PHÂN BIỆT',
              hasContent: validComps.length > 0,
              render: () => (
                <div className="space-y-2 pl-2">
                  {validComps.map((comp, i) => (
                    <div key={i} className="space-y-1 text-slate-900 font-normal p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="font-bold text-slate-950">
                        {i + 1}. Tiêu chí: {comp.criteria || `Tiêu chí #${i + 1}`}
                      </p>
                      <p className="pl-4">
                        - <strong className="font-semibold text-slate-900">Khía cạnh 1:</strong> {comp.itemA || '(Chưa nhập)'}
                      </p>
                      <p className="pl-4">
                        - <strong className="font-semibold text-slate-900">Khía cạnh 2:</strong> {comp.itemB || '(Chưa nhập)'}
                      </p>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'hotspots',
              title: 'TRỌNG TÂM RA THI SÁT HẠCH',
              hasContent: examList.length > 0,
              render: () => (
                <div className="space-y-1.5 pl-2">
                  {examList.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-900 font-normal">
                      <span className="text-slate-700 font-bold">•</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'traps',
              title: 'BẪY ĐỀ THI & ĐIỂM DỄ NHẦM',
              hasContent: trapList.length > 0,
              render: () => (
                <div className="space-y-1.5 pl-2">
                  {trapList.map((tr, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-900 font-normal">
                      <span className="text-slate-700 font-bold">•</span>
                      <span>{tr}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'tips',
              title: 'MẸO GHI NHỚ NHANH',
              hasContent: tipList.length > 0,
              render: () => (
                <div className="space-y-1 pl-2">
                  {tipList.map((tip, i) => (
                    <p key={i} className="text-slate-900 italic font-normal">
                      "{tip}"
                    </p>
                  ))}
                </div>
              )
            }
          ]

          const activeSections = sections.filter(s => s.hasContent)

          if (activeSections.length === 0) {
            return (
              <p className="text-slate-400 italic text-xs py-8 text-center">
                (Chưa có nội dung. Các mục để trống sẽ tự động được ẩn khỏi trang giáo trình)
              </p>
            )
          }

          return activeSections.map((sec, idx) => (
            <div key={sec.id} className="space-y-2">
              <h2 className="font-black text-slate-950 uppercase tracking-wide text-xs flex items-center gap-1.5">
                <span className="font-black">{toRoman(idx + 1)}.</span>
                <span>{sec.title}</span>
              </h2>
              {sec.render()}
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

export function DocumentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = isAdminUser()
  const { openAuthModal } = useAuth()

  const [chapters, setChapters] = useState<ChapterResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChapterTab, setSelectedChapterTab] = useState<string>('all')

  // Trạng thái thu gọn/mở rộng từng chương (mặc định mở tất cả)
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({})

  // State cho Modal Soạn thảo / Thêm bài học mới (CRUD Studio)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [studioActiveTab, setStudioActiveTab] = useState<'both' | 'form' | 'preview'>('both')

  // State cho Modal Thêm Chương Mới
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterOrder, setNewChapterOrder] = useState<number>(1)

  // State cho Modal Sửa Chương
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingChapterTitle, setEditingChapterTitle] = useState('')
  const [editingChapterOrder, setEditingChapterOrder] = useState<number>(1)
  const [editingChapterDescription, setEditingChapterDescription] = useState('')

  const [formData, setFormData] = useState<{
    chapterId: string
    title: string
    objectives: string
    coreKnowledge: string
    definitions: string
    keywords: string
    comparisons: string
    examHotspots: string
    commonTraps: string
    memoryTips: string
  }>(() => getEmptyLessonData(''))

  // Cuộn mượt đến phần tử mục tiêu và giữ nguyên vị trí, kèm hiệu ứng highlight nhẹ
  const scrollToTarget = (targetId: string) => {
    setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-500')
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
        }, 2000)
      }
    }, 150)
  }

  // Tải danh sách chương & bài học từ máy chủ API thật (hỗ trợ silent reload để không giật màn hình và không mất vị trí cuộn)
  const loadChapters = useCallback(async (query?: string, silent = false) => {
    if (!silent) {
      setIsLoading(true)
    }
    setFetchError(null)
    try {
      const data = await DocumentApi.getChapters(true, query)
      setChapters(data || [])
      if (data && data.length > 0) {
        setNewChapterOrder(data.length + 1)
      }
      return data || []
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách chương:', err)
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setFetchError(axiosErr.response?.data?.message || axiosErr.message || 'Không thể kết nối máy chủ API')
      return []
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadChapters(searchQuery)
  }, [loadChapters, searchQuery])

  // Tự động cuộn đến chương được chọn từ Dropdown Menu Sidebar
  useEffect(() => {
    if (!location.search) return
    const params = new URLSearchParams(location.search)
    const chapterId = params.get('chapter')
    if (chapterId) {
      setSelectedChapterTab(chapterId)
      scrollToTarget(`chapter-${chapterId}`)
    }
  }, [location.search])

  // Đóng/Mở từng chương
  const toggleCollapse = (chapterId: string) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }))
  }

  // Mở Form Thêm bài học mới - TRẮNG THÔNG TIN HOÀN TOÀN ĐỂ USER TỰ NHẬP
  const handleOpenCreateModal = (targetChapterId?: string) => {
    if (!isAdmin) {
      toast.error('Chức năng này yêu cầu quyền Quản trị viên (ADMIN). Vui lòng đăng nhập tài khoản Admin.')
      openAuthModal()
      return
    }
    if (!chapters || chapters.length === 0) {
      toast.error('Vui lòng tạo ít nhất 1 chương trước khi soạn bài học mới.')
      setIsCreateChapterOpen(true)
      return
    }
    setEditingLessonId(null)
    const effectiveChapterId = targetChapterId || (selectedChapterTab !== 'all' ? selectedChapterTab : chapters?.[0]?.id || '')
    const targetChapter = (chapters || []).find(c => c.id === effectiveChapterId) || chapters[0]
    const chosenChapterId = targetChapter?.id || effectiveChapterId
    const nextLessonNumber = (targetChapter?.lessons?.length || 0) + 1
    
    // Khởi tạo form trắng thông tin, riêng tên bài học tự sinh: "Bài {nextLessonNumber}: "
    const emptyData = getEmptyLessonData(chosenChapterId)
    setFormData({
      ...emptyData,
      title: `Bài ${nextLessonNumber}: `
    })
    setIsEditorOpen(true)
  }

  // Mở Form Sửa bài học - Tải chi tiết đầy đủ dạng text từ API thật
  const handleOpenEditModal = async (lesson: LessonSummaryResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingLessonId(lesson.id)
    try {
      const detail = await DocumentApi.getLessonDetail(lesson.id)
      setFormData({
        chapterId: detail.chapterId,
        title: detail.title || '',
        objectives: (detail.content?.objectives || []).join('\n'),
        coreKnowledge: (detail.content?.coreKnowledge || []).join('\n'),
        definitions: (detail.content?.definitions || [])
          .map(d => d.term ? `${d.term}: ${d.definition}` : d.definition)
          .join('\n'),
        keywords: (detail.content?.keywords || []).join(', '),
        comparisons: (detail.content?.comparisons || [])
          .map(c => {
            if (c.conceptB) {
              return `${c.criteria}: ${c.conceptA} vs ${c.conceptB}`
            }
            return c.criteria ? `${c.criteria}: ${c.conceptA}` : c.conceptA
          })
          .join('\n'),
        examHotspots: (detail.content?.examHotspots || []).join('\n'),
        commonTraps: (detail.content?.commonTraps || []).join('\n'),
        memoryTips: (detail.content?.memoryTips || []).join('\n')
      })
    } catch (err) {
      console.warn('Không thể tải chi tiết bài học để chỉnh sửa:', err)
      setFormData({
        chapterId: lesson.chapterId,
        title: lesson.title || '',
        objectives: '',
        coreKnowledge: '',
        definitions: '',
        keywords: '',
        comparisons: '',
        examHotspots: '',
        commonTraps: '',
        memoryTips: ''
      })
    }
    setIsEditorOpen(true)
  }

  // Lưu tạo Chương mới qua DocumentApi.createChapter
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChapterTitle.trim()) return

    const orderNum = newChapterOrder || (chapters?.length || 0) + 1
    const raw = newChapterTitle.trim()
    const fullTitle = raw.toUpperCase().startsWith('CHƯƠNG')
      ? raw
      : `CHƯƠNG ${orderNum}: ${raw.toUpperCase()}`

    try {
      const created = await DocumentApi.createChapter({
        title: fullTitle,
        order: orderNum,
      })
      toast.success('Tạo chương mới thành công!')
      setIsCreateChapterOpen(false)
      setNewChapterTitle('')
      setNewChapterOrder((chapters?.length || 0) + 2)

      // Nếu đang lọc một chương khác thì chuyển về 'all' để chương mới hiển thị
      if (selectedChapterTab !== 'all') {
        setSelectedChapterTab('all')
      }

      await loadChapters(searchQuery, true)

      if (created?.id) {
        setCollapsedChapters(prev => ({ ...prev, [created.id]: false }))
        scrollToTarget(`chapter-${created.id}`)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(axiosErr.response?.data?.message || 'Lỗi khi tạo chương mới')
    }
  }

  // Mở modal sửa chương
  const handleOpenEditChapter = (chapter: ChapterResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingChapterId(chapter.id)
    setEditingChapterTitle(chapter.title)
    setEditingChapterOrder(chapter.order)
    setEditingChapterDescription(chapter.description || '')
    setIsEditChapterOpen(true)
  }

  // Cập nhật thông tin chương qua DocumentApi.updateChapter
  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChapterId || !editingChapterTitle.trim()) return
    try {
      await DocumentApi.updateChapter(editingChapterId, {
        title: editingChapterTitle.trim(),
        order: Number(editingChapterOrder) || 1,
        description: editingChapterDescription.trim() || undefined,
      })
      toast.success('Cập nhật thông tin chương thành công!')
      const updatedId = editingChapterId
      setIsEditChapterOpen(false)
      setEditingChapterId(null)
      await loadChapters(searchQuery, true)
      if (updatedId) {
        scrollToTarget(`chapter-${updatedId}`)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(axiosErr.response?.data?.message || 'Lỗi khi cập nhật chương')
    }
  }

  // Xóa chương qua DocumentApi.deleteChapter
  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAdmin) {
      toast.error('Chức năng xóa chương yêu cầu quyền Quản trị viên (ADMIN). Vui lòng đăng nhập lại.')
      openAuthModal()
      return
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này cùng toàn bộ các bài học bên trong?')) return
    try {
      await DocumentApi.deleteChapter(chapterId)
      toast.success('Đã xóa chương thành công!')
      loadChapters(searchQuery, true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        toast.error('Phiên đăng nhập Admin đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.')
        openAuthModal()
      } else {
        toast.error(axiosErr.response?.data?.message || axiosErr.message || 'Lỗi khi xóa chương')
      }
    }
  }

  // Lưu tạo mới / cập nhật Bài học qua DocumentApi
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    let chosenChapterId = formData.chapterId
    if (!chosenChapterId && chapters && chapters.length > 0) {
      chosenChapterId = chapters[0].id
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên bài học.')
      return
    }
    if (!chosenChapterId) {
      toast.error('Vui lòng chọn chương cho bài học.')
      return
    }

    const targetChapter = (chapters || []).find(c => c.id === chosenChapterId)
    const orderNum = targetChapter ? (targetChapter.lessons?.length || 0) + 1 : 1

    const objectivesArr = (formData.objectives || '').split('\n').map(s => s.trim()).filter(Boolean)
    const coreArr = (formData.coreKnowledge || '').split('\n').map(s => s.trim()).filter(Boolean)
    const kwArr = (formData.keywords || '').split(',').map(s => s.trim()).filter(Boolean)

    const defsArr = (formData.definitions || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const colonIdx = line.indexOf(':')
        const dashIdx = line.indexOf(' - ')
        if (colonIdx > 0 && (dashIdx === -1 || colonIdx < dashIdx)) {
          return {
            term: line.slice(0, colonIdx).trim(),
            definition: line.slice(colonIdx + 1).trim()
          }
        } else if (dashIdx > 0) {
          return {
            term: line.slice(0, dashIdx).trim(),
            definition: line.slice(dashIdx + 3).trim()
          }
        }
        return {
          term: `Khái niệm #${idx + 1}`,
          definition: line
        }
      })

    const compsArr = (formData.comparisons || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const colonIdx = line.indexOf(':')
        if (colonIdx > 0) {
          const criteria = line.slice(0, colonIdx).trim()
          const rest = line.slice(colonIdx + 1).trim()
          const parts = rest.split(/\s*(?:vs|và|với|;)\s*/i)
          return {
            criteria,
            conceptA: parts[0]?.trim() || rest,
            conceptB: parts[1]?.trim() || ''
          }
        }
        return {
          criteria: `Tiêu chí #${idx + 1}`,
          conceptA: line,
          conceptB: ''
        }
      })

    const hotspotsArr = (formData.examHotspots || '').split('\n').map(s => s.trim()).filter(Boolean)
    const trapsArr = (formData.commonTraps || '').split('\n').map(s => s.trim()).filter(Boolean)
    const tipsArr = (formData.memoryTips || '').split('\n').map(s => s.trim()).filter(Boolean)

    const payloadContent: LessonContentRequest = {
      objectives: objectivesArr,
      coreKnowledge: coreArr,
      definitions: defsArr,
      keywords: kwArr,
      comparisons: compsArr,
      examHotspots: hotspotsArr,
      commonTraps: trapsArr,
      memoryTips: tipsArr
    }

    try {
      let targetId: string | null = null
      if (editingLessonId) {
        const updated = await DocumentApi.updateLesson(editingLessonId, {
          title: formData.title.trim(),
          order: orderNum,
          content: payloadContent
        })
        toast.success('Cập nhật bài học thành công!')
        targetId = updated?.id ? `lesson-${updated.id}` : `lesson-${editingLessonId}`
      } else {
        const created = await DocumentApi.createLesson({
          chapterId: chosenChapterId,
          title: formData.title.trim(),
          order: orderNum,
          content: payloadContent
        })
        toast.success('Xuất bản bài học mới thành công!')
        targetId = created?.id ? `lesson-${created.id}` : `chapter-${chosenChapterId}`
      }
      setIsEditorOpen(false)
      setEditingLessonId(null)

      // Đảm bảo chương chứa bài học không bị thu gọn
      if (chosenChapterId) {
        setCollapsedChapters(prev => ({ ...prev, [chosenChapterId]: false }))
      }

      // Tải lại ngầm (silent = true) để bảo toàn vị trí trang
      await loadChapters(searchQuery, true)

      // Cuộn mượt đến ngay bài học hoặc chương vừa lưu
      if (targetId) {
        scrollToTarget(targetId)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(axiosErr.response?.data?.message || 'Lỗi khi lưu bài học')
    }
  }

  // Xóa bài học qua DocumentApi.deleteLesson
  const handleDeleteLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAdmin) {
      toast.error('Chức năng xóa bài học yêu cầu quyền Quản trị viên (ADMIN). Vui lòng đăng nhập lại.')
      openAuthModal()
      return
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này khỏi hệ thống?')) return
    try {
      await DocumentApi.deleteLesson(lessonId)
      toast.success('Đã xóa bài học thành công!')
      loadChapters(searchQuery, true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        toast.error('Phiên đăng nhập Admin đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.')
        openAuthModal()
      } else {
        toast.error(axiosErr.response?.data?.message || axiosErr.message || 'Lỗi khi xóa bài học')
      }
    }
  }

  // Lọc chương theo tab đã chọn và thanh tìm kiếm
  const filteredChapters = (chapters || []).filter(ch => {
    if (!ch) return false
    if (selectedChapterTab !== 'all' && ch.id !== selectedChapterTab) return false
    return true
  }).map(ch => {
    let lessons = ch.lessons || []

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      lessons = lessons.filter(ls => ls.title?.toLowerCase().includes(q))
    }

    return {
      ...ch,
      lessons
    }
  })

  const totalLessons = (chapters || []).reduce((acc, c) => acc + (c?.lessons?.length || 0), 0)
  const filteredLessonsCount = filteredChapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 w-full font-sans antialiased text-slate-900 dark:text-white">
      
      {/* ========================================================================= */}
      {/* 1. BANNER TRANG CHỦ GIÁO TRÌNH HỌC VIỆN CAND BỘ CÔNG AN (PHA MÀU HIỆN ĐẠI) */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-400/40 dark:border-amber-400/30 shadow-2xl bg-slate-900 text-white min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center">
        
        {/* Nền ảnh CAND Banner sáng rực rỡ, sắc nét, full hiển thị chân thật */}
        <img 
          src="/cand-doc-banner-bright.jpg"
          alt="Banner CAND Tổ quốc"
          className="absolute inset-0 w-full h-full object-cover object-center scale-100 select-none pointer-events-none"
        />

        {/* Lớp hiệu ứng ánh sáng gradient mesh đa sắc */}
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-gradient-to-tl from-amber-500/25 via-red-500/15 to-transparent blur-3xl pointer-events-none" />

        {/* Lớp phủ chuyển sắc nhẹ nhàng ở góc trái để chữ nổi bật mà hình ảnh vẫn sáng rõ full 100% */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Nội dung Banner chính */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-center w-full">
          
          <div className="max-w-xl sm:max-w-2xl bg-slate-950/65 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            {/* Huy hiệu Tổ quốc - Học viện CAND */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border border-red-500/60 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider shadow-[0_4px_14px_rgba(220,38,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-md overflow-hidden select-none">
                <span className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />
                <VietnamFlagStarIcon className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">BẢO VỆ TỔ QUỐC • CÔNG AN NHÂN DÂN</span>
              </div>

              {/* Huy hiệu Khóa CA4 Chuẩn phong cách 3D kính bóng ngọc lục bảo */}
              <span className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 border border-emerald-400/60 shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md overflow-hidden group hover:scale-[1.03] transition-all cursor-default select-none">
                <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/25 pointer-events-none" />
                <span className="absolute -inset-x-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-b from-amber-300/30 via-emerald-950 to-slate-950 border border-amber-400/60 shadow-[0_2px_4px_rgba(0,0,0,0.6)] shrink-0">
                  <CandEmblemIcon className="w-4 h-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]" />
                </span>

                <span className="relative z-10 font-black text-[11px] uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-white to-teal-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  CA4 Văn Bằng 2
                </span>

                <span className="relative z-10 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                </span>
              </span>
            </div>

            {/* Tiêu đề chính */}
            <div className="space-y-1">
              <span className="text-xs md:text-sm font-extrabold text-amber-300 uppercase tracking-widest block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Thư Viện Giáo Trình Chuẩn Hóa
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Lý Luận Nhà Nước
                </span>{' '}
                <span className="text-amber-400 font-extrabold">&</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                  Pháp Luật
                </span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-100 max-w-xl leading-relaxed font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Hệ thống hóa toàn diện 5 chuyên đề nền tảng, bám sát thực tiễn công tác Công an nhân dân, phục vụ ôn luyện sát hạch Văn bằng 2 Trường ĐH Cảnh sát nhân dân.
            </p>

            {/* Nút thao tác nhanh (Chỉ hiển thị cho ADMIN) */}
            {isAdmin ? (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Nút Bước 1: Thêm Chương Mới */}
                <button
                  onClick={() => {
                    setNewChapterOrder((chapters?.length || 0) + 1)
                    setIsCreateChapterOpen(true)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-all cursor-pointer border border-amber-300/40"
                >
                  <FolderPlus className="h-4 w-4 stroke-[2.5]" />
                  <span>+ Thêm Chương Mới</span>
                </button>

                {/* Nút Bước 2: Soạn Bài Học Mới (Studio) */}
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-indigo-600/40 hover:scale-[1.02] transition-all cursor-pointer border border-indigo-300/30"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Soạn Bài Học Mới</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/50 text-amber-300 text-xs font-bold shadow-md">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <span>Chế độ Học viên: Toàn quyền tra cứu, đọc sách & ôn luyện</span>
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. STATS BAR: 4 THẺ THỐNG KÊ PHA MÀU HIỆN ĐẠI (ĐỒNG BỘ TOÀN HỆ THỐNG)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Tổng Chương (Blue ⇄ Cyan) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-white dark:from-blue-950/40 dark:via-[#131722] dark:to-cyan-950/20 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Chương Giáo Trình
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block font-mono">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {chapters?.length || 0}
              </span> chuyên đề
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Khung chương trình T05
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <Layers className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Tổng Bài Học (Indigo ⇄ Purple) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:from-indigo-950/40 dark:via-[#131722] dark:to-purple-950/20 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Bài Giảng Điện Tử
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block font-mono">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {totalLessons}
              </span> bài học
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Từ lý thuyết đến án lệ
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <BookOpen className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: Khung Đào Tạo (Emerald ⇄ Teal) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/40 dark:via-[#131722] dark:to-teal-950/20 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Chuẩn Nghiệp Vụ
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Khóa CA4
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              ĐH Cảnh sát nhân dân
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
            <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 4: Công Cụ Ôn Luyện (Amber ⇄ Rose) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-white dark:from-amber-950/40 dark:via-[#131722] dark:to-rose-950/20 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Công Cụ Ôn Thi
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              <span className="bg-gradient-to-r from-amber-500 to-rose-500 dark:from-amber-400 dark:to-rose-400 bg-clip-text text-transparent">
                Highlight & Note
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Đọc to TTS & Lưu tiến độ
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 shrink-0">
            <Sparkles className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. THANH LỌC CHƯƠNG NHANH & THANH TÌM KIẾM BÀI HỌC                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Các nút Tab chọn Chương để xem mạch lạc */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedChapterTab('all')}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer shadow-xs",
                selectedChapterTab === 'all'
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700"
              )}
            >
              Tất Cả Chương ({totalLessons})
            </button>
            {(chapters || []).map((ch, idx) => {
              if (!ch) return null
              const isSelected = selectedChapterTab === ch.id
              const theme = chapterColorThemes[idx % chapterColorThemes.length]
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterTab(ch.id)}
                  className={cn(
                    "px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-xs",
                    isSelected
                      ? cn("bg-gradient-to-r text-white shadow-md scale-[1.02]", theme.gradient)
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700"
                  )}
                >
                  <VietnamWavingFlagIcon className="w-3.5 h-3.5 shrink-0" size={14} />
                  <span>Chương {idx + 1}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-black",
                    isSelected ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  )}>
                    {ch.lessons?.length || 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <input
              type="text"
              placeholder="Tìm bài học, từ khóa, mục tiêu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Thanh thông báo kết quả tìm kiếm nếu có */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Tìm thấy <strong>{filteredLessonsCount}</strong> bài học phù hợp với từ khóa "{searchQuery}"
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="font-bold underline text-blue-700 dark:text-blue-300 hover:text-blue-900 cursor-pointer text-xs"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DANH SÁCH CÁC CHƯƠNG & BÀI HỌC GIÁO TRÌNH                             */}
      {/* ========================================================================= */}
      <div className="space-y-7">
        {isLoading ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <Loader2 className="h-9 w-9 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Đang tải dữ liệu giáo trình...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Đang đồng bộ danh mục từ hệ thống API Jurisprudence Hub</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-sm space-y-4">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-red-900 dark:text-red-200">Không thể kết nối máy chủ API</h3>
              <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">{fetchError}</p>
            </div>
            <button
              onClick={() => loadChapters(searchQuery)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử Kết Nối Lại</span>
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Thư viện giáo trình hiện chưa có chương nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Hãy tạo chương đầu tiên để bắt đầu hệ thống hóa bài giảng và tài liệu học tập.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreateChapterOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25 cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>+ Thêm Chương Mới Đầu Tiên</span>
              </button>
            )}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto shadow-inner">
              <Filter className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Không tìm thấy chương nào trong bộ lọc này</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Chương bạn chọn hiện không tồn tại hoặc đã bị xóa.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedChapterTab('all')
                setSearchQuery('')
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xem tất cả các chương</span>
            </button>
          </div>
        ) : searchQuery.trim() !== '' && filteredLessonsCount === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Search className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Không tìm thấy bài học nào phù hợp</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Không có bài học nào khớp với từ khóa "{searchQuery}".
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25 cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xóa từ khóa tìm kiếm</span>
            </button>
          </div>
        ) : (
          filteredChapters.map((chapter, cIdx) => {
            if (!chapter) return null
            const isCollapsed = collapsedChapters[chapter.id]
            const chapterLessons = chapter.lessons || []
            const colorTheme = chapterColorThemes[cIdx % chapterColorThemes.length]

            return (
              <div 
                key={chapter.id}
                id={`chapter-${chapter.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden scroll-mt-24"
              >
                {/* Dải màu Gradient đại diện cho từng Chương */}
                <div className={cn("h-1.5 w-full bg-gradient-to-r", colorTheme.progress)} />

                {/* Header của Chương */}
                <div 
                  onClick={() => toggleCollapse(chapter.id)}
                  className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/90 transition-all select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <VietnamWavingFlagIcon 
                      className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 drop-shadow-md transition-transform group-hover:scale-105 select-none" 
                      size={48} 
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r shadow-2xs",
                          colorTheme.progress
                        )}>
                          Chương {cIdx + 1}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {chapterLessons.length} bài học chuẩn hóa
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight leading-snug truncate mt-0.5">
                        {chapter.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        {/* Nút Thêm bài học mới cho chương này */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenCreateModal(chapter.id)
                          }}
                          title="Soạn bài học mới cho chương này"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800/60 shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span className="hidden sm:inline">Thêm bài</span>
                        </button>

                        {/* Nút Thêm chương mới */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setNewChapterOrder((chapters?.length || 0) + 1)
                            setIsCreateChapterOpen(true)
                          }}
                          title="Tạo thêm chương mới"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-amber-200/60 dark:border-amber-800/60 shadow-2xs"
                        >
                          <FolderPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span className="hidden sm:inline">Thêm chương</span>
                        </button>

                        <button
                          onClick={(e) => handleOpenEditChapter(chapter, e)}
                          title="Sửa tên chương"
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteChapter(chapter.id, e)}
                          title="Xóa chương"
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Danh sách các bài học của Chương */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-950/20">
                    {chapterLessons.length === 0 ? (
                      <div className="text-center py-10 px-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                        <BookOpen className="h-8 w-8 text-slate-400 mx-auto opacity-50" />
                        <p className="text-xs text-slate-500 font-medium">Chương này chưa có bài học nào</p>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenCreateModal(chapter.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Soạn bài học đầu tiên</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                        {chapterLessons.map((lesson, idx) => {
                          if (!lesson) return null

                          return (
                            <div
                              key={lesson.id}
                              id={`lesson-${lesson.id}`}
                              onClick={() => navigate(`/documents/${lesson.id}`)}
                              className="group rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-2xs hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/80 scroll-mt-24"
                            >
                              {/* Top decorative strip đồng bộ theme chương */}
                              <div className={cn(
                                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300 opacity-60 group-hover:opacity-100",
                                colorTheme.progress
                              )} />

                              <div className="space-y-3.5">
                                {/* Header hàng 1: Badge thứ tự & các nút thao tác */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn(
                                    "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border shadow-2xs",
                                    colorTheme.light
                                  )}>
                                    Bài {idx + 1}
                                  </span>

                                  {/* Thanh công cụ nút thao tác (Chỉ hiển thị cho Admin) */}
                                  {isAdmin && (
                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                      <button
                                        onClick={(e) => handleOpenEditModal(lesson, e)}
                                        title="Chỉnh sửa bài học"
                                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 rounded-md transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>

                                      <button
                                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                                        title="Xóa bài học"
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Tiêu đề bài học */}
                                <h3 className="font-black text-sm sm:text-base text-slate-950 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:via-indigo-300 dark:group-hover:to-purple-300 transition-all line-clamp-2 leading-snug">
                                  {lesson.title}
                                </h3>

                                {/* Ghi chú giáo trình dạng chấm đầu dòng */}
                                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <span>Giáo trình Lý luận Nhà nước và Pháp luật</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                                    <span>Đại học Cảnh sát Nhân dân • Khóa CA4</span>
                                  </div>
                                </div>
                              </div>

                              {/* Chân Thẻ: Dòng CTA & Mũi Tên Hiệu Ứng Đồng Bộ Màu */}
                              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between">
                                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                  <span>Tài Liệu CAND</span>
                                </div>

                                <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                  <span>Đọc bài giảng</span>
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL THÊM CHƯƠNG MỚI (BƯỚC 1)                                         */}
      {/* ========================================================================= */}
      {isAdmin && isCreateChapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#10141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Thêm Chương / Chuyên Đề Mới</h3>
              <button onClick={() => setIsCreateChapterOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số Thứ Tự Chương *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newChapterOrder}
                  onChange={(e) => setNewChapterOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chương / Chuyên Đề *
                </label>
                <input
                  type="text"
                  placeholder="VD: CÔNG TÁC PHÒNG CHỐNG TỘI PHẠM & PHÁP CHẾ CAND..."
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ tự động định dạng: CHƯƠNG {newChapterOrder}: [Tên chương của bạn]</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateChapterOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Lưu Chương
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT THÔNG TIN CHƯƠNG */}
      {isAdmin && isEditChapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#10141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Cập Nhật Thông Tin Chương</h3>
              <button onClick={() => setIsEditChapterOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateChapter} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số Thứ Tự Chương *
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingChapterOrder}
                  onChange={(e) => setEditingChapterOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chương / Chuyên Đề *
                </label>
                <input
                  type="text"
                  value={editingChapterTitle}
                  onChange={(e) => setEditingChapterTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Chương (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={editingChapterDescription}
                  onChange={(e) => setEditingChapterDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditChapterOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL STUDIO SOẠN THẢO BÀI HỌC (BƯỚC 2 - 2 CỘT SONG SONG)            */}
      {/* ========================================================================= */}
      {isAdmin && isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in">
          <div className="bg-white dark:bg-[#10141f] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden">
            
            {/* Header Studio */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#10141f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                      {editingLessonId ? 'Chỉnh Sửa Giáo Trình Bài Học' : 'Studio Soạn Thảo Giáo Trình Bài Học'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase">
                      Biên Soạn Chính Quy
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nhập nội dung biên soạn bên trái • Trang giáo trình bên phải cập nhật trực tiếp theo thời gian thực
                  </p>
                </div>
              </div>

              {/* Nút điều khiển Studio & Chuyển View */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setStudioActiveTab('both')}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      studioActiveTab === 'both' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Song Song (2 Cột)
                  </button>
                  <button
                    onClick={() => setStudioActiveTab('form')}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      studioActiveTab === 'form' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Chỉ Soạn Thảo
                  </button>
                  <button
                    onClick={() => setStudioActiveTab('preview')}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      studioActiveTab === 'preview' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Chỉ Xem Vở
                  </button>
                </div>

                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thân Studio: 2 Cột (Form soạn thảo & Live Preview Cuốn Vở) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* ================================================================= */}
              {/* CỘT TRÁI: FORM SOẠN THẢO CHI TIẾT THEO PHONG CÁCH TRẮNG ĐEN        */}
              {/* ================================================================= */}
              {(studioActiveTab === 'both' || studioActiveTab === 'form') && (
                <div className={cn(
                  "overflow-y-auto p-5 sm:p-7 space-y-6 h-full text-xs bg-white dark:bg-[#10141f]",
                  studioActiveTab === 'both' ? "lg:col-span-6 xl:col-span-6" : "lg:col-span-12"
                )}>
                  
                  {/* THÔNG TIN CHƯƠNG, TÊN BÀI HỌC VÀ THỜI LƯỢNG */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 space-y-3.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-300 text-xs">Chương đang soạn:</span>
                        {editingLessonId ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-black uppercase tracking-wide shadow-2xs">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{chapters.find(c => c.id === formData.chapterId)?.title || 'CHƯƠNG ĐÃ CHỌN'}</span>
                          </div>
                        ) : (
                          <select
                            value={formData.chapterId}
                            onChange={(e) => {
                              const newChapterId = e.target.value
                              const targetCh = (chapters || []).find(c => c.id === newChapterId)
                              const nextNum = (targetCh?.lessons?.length || 0) + 1
                              let updatedTitle = formData.title
                              if (!editingLessonId) {
                                if (!updatedTitle.trim() || /^Bài\s*\d+\s*:\s*/i.test(updatedTitle)) {
                                  const rest = updatedTitle.replace(/^Bài\s*\d+\s*:\s*/i, '')
                                  updatedTitle = `Bài ${nextNum}: ${rest}`
                                }
                              }
                              setFormData({ ...formData, chapterId: newChapterId, title: updatedTitle })
                            }}
                            className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                          >
                            {chapters.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                        Lưu hành nội bộ
                      </span>
                    </div>

                    <div>
                      <label className="block font-black text-slate-900 dark:text-white mb-1.5 uppercase text-xs tracking-wider">
                        Tên Bài Học *
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Bài 1: Nguồn gốc và bản chất của Nhà nước..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        onFocus={(e) => {
                          const val = e.currentTarget.value
                          e.currentTarget.setSelectionRange(val.length, val.length)
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-950 dark:text-white text-sm focus:border-slate-900 focus:outline-hidden"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* CÁC Ô NHẬP NỘI DUNG VĂN BẢN TRỰC TIẾP ĐỂ HỌC */}
                  {(() => {
                    const isObjectivesActive = (formData.objectives || '').trim().length > 0
                    const isCoreActive = (formData.coreKnowledge || '').trim().length > 0
                    const isDefsActive = (formData.definitions || '').trim().length > 0
                    const isKeywordsActive = (formData.keywords || '').trim().length > 0
                    const isCompsActive = (formData.comparisons || '').trim().length > 0
                    const isHotspotsActive = (formData.examHotspots || '').trim().length > 0
                    const isTrapsActive = (formData.commonTraps || '').trim().length > 0
                    const isTipsActive = (formData.memoryTips || '').trim().length > 0

                    let formRomanCount = 0
                    const romanObjectives = isObjectivesActive ? toRoman(++formRomanCount) : null
                    const romanCore = isCoreActive ? toRoman(++formRomanCount) : null
                    const romanDefs = isDefsActive ? toRoman(++formRomanCount) : null
                    const romanKeywords = isKeywordsActive ? toRoman(++formRomanCount) : null
                    const romanComps = isCompsActive ? toRoman(++formRomanCount) : null
                    const romanHotspots = isHotspotsActive ? toRoman(++formRomanCount) : null
                    const romanTraps = isTrapsActive ? toRoman(++formRomanCount) : null
                    const romanTips = isTipsActive ? toRoman(++formRomanCount) : null

                    return (
                      <div className="space-y-6">
                        
                        {/* 1. Mục tiêu cần nắm */}
                        <div className="space-y-2">
                          <label className="font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanObjectives 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanObjectives ? `${romanObjectives}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanObjectives ? `${romanObjectives}. ` : ''}MỤC TIÊU CẦN NẮM</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Nhập mục tiêu học tập (mỗi mục tiêu 1 dòng)..."
                            value={formData.objectives}
                            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 leading-relaxed text-slate-950 dark:text-white font-medium focus:border-slate-900 focus:outline-hidden shadow-2xs"
                          />
                        </div>

                        {/* 2. Kiến thức trọng tâm cốt lõi */}
                        <div className="space-y-2">
                          <label className="font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanCore 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanCore ? `${romanCore}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanCore ? `${romanCore}. ` : ''}KIẾN THỨC TRỌNG TÂM CỐT LÕI</span>
                          </label>
                          <textarea
                            rows={6}
                            placeholder="Nhập nội dung bài giảng, kiến thức trọng tâm cần học..."
                            value={formData.coreKnowledge}
                            onChange={(e) => setFormData({ ...formData, coreKnowledge: e.target.value })}
                            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 leading-relaxed text-slate-950 dark:text-white font-medium focus:border-slate-900 focus:outline-hidden shadow-2xs"
                          />
                        </div>

                        {/* 3. Khái niệm & Thuật ngữ cần nhớ */}
                        <div className="space-y-2">
                          <label className="font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanDefs 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanDefs ? `${romanDefs}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanDefs ? `${romanDefs}. ` : ''}THUẬT NGỮ & KHÁI NIỆM CẦN NHỚ</span>
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Nhập các khái niệm cần nhớ (VD: Quy phạm pháp luật: Quy tắc xử sự chung mang tính bắt buộc...)..."
                            value={formData.definitions}
                            onChange={(e) => setFormData({ ...formData, definitions: e.target.value })}
                            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 leading-relaxed text-slate-950 dark:text-white font-medium focus:border-slate-900 focus:outline-hidden shadow-2xs"
                          />
                        </div>

                        {/* 4. Từ khóa cốt lõi */}
                        <div className="space-y-2">
                          <label className="block font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanKeywords 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanKeywords ? `${romanKeywords}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanKeywords ? `${romanKeywords}. ` : ''}TỪ KHÓA CỐT LÕI</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập các từ khóa quan trọng, phân cách bằng dấu phẩy (VD: Nhà nước, Pháp luật, CAND...)"
                            value={formData.keywords}
                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white font-medium shadow-2xs"
                          />
                        </div>

                        {/* 5. So sánh & Phân biệt */}
                        <div className="space-y-2">
                          <label className="block font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanComps 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanComps ? `${romanComps}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanComps ? `${romanComps}. ` : ''}SO SÁNH & PHÂN BIỆT</span>
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Nhập nội dung so sánh, phân biệt (VD: Nguồn gốc quyền lực: Thị tộc vs Nhà nước...)..."
                            value={formData.comparisons}
                            onChange={(e) => setFormData({ ...formData, comparisons: e.target.value })}
                            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white font-medium shadow-2xs"
                          />
                        </div>

                        {/* 6. Trọng tâm ra thi & 7. Lỗi dễ nhầm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                                romanHotspots 
                                  ? "bg-blue-600 text-white shadow-2xs" 
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                              )}>
                                {romanHotspots ? `${romanHotspots}.` : 'Tùy chọn'}
                              </span>
                              <span>{romanHotspots ? `${romanHotspots}. ` : ''}TRỌNG TÂM RA THI SÁT HẠCH</span>
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Nhập trọng tâm câu hỏi trắc nghiệm hoặc nội dung ôn thi..."
                              value={formData.examHotspots}
                              onChange={(e) => setFormData({ ...formData, examHotspots: e.target.value })}
                              className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white font-medium shadow-2xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                                romanTraps 
                                  ? "bg-blue-600 text-white shadow-2xs" 
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                              )}>
                                {romanTraps ? `${romanTraps}.` : 'Tùy chọn'}
                              </span>
                              <span>{romanTraps ? `${romanTraps}. ` : ''}BẪY ĐỀ THI & LỖI DỄ NHẦM</span>
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Nhập các điểm bẫy đề thi, lỗi sai phổ biến..."
                              value={formData.commonTraps}
                              onChange={(e) => setFormData({ ...formData, commonTraps: e.target.value })}
                              className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white font-medium shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* 8. Mẹo ghi nhớ nhanh */}
                        <div className="space-y-2">
                          <label className="block font-black text-slate-950 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wide">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-black text-[10px] shrink-0 transition-all",
                              romanTips 
                                ? "bg-blue-600 text-white shadow-2xs" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            )}>
                              {romanTips ? `${romanTips}.` : 'Tùy chọn'}
                            </span>
                            <span>{romanTips ? `${romanTips}. ` : ''}MẸO GHI NHỚ NHANH</span>
                          </label>
                          <input
                            type="text"
                            placeholder='VD: "Kinh tế sinh Tư hữu - Xã hội sinh Giai cấp -> Mâu thuẫn không điều hòa thì Nhà nước sinh ra."'
                            value={formData.memoryTips}
                            onChange={(e) => setFormData({ ...formData, memoryTips: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-950 dark:text-white italic shadow-2xs"
                          />
                        </div>

                      </div>
                    )
                  })()}

                </div>
              )}

              {/* ================================================================= */}
              {/* CỘT PHẢI: LIVE PREVIEW CUỐN VỞ HỌC TẬP THỰC TẾ (6 HOẶC 12 CỘT)    */}
              {/* ================================================================= */}
              {(studioActiveTab === 'both' || studioActiveTab === 'preview') && (
                <div className={cn(
                  "overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/60 h-full",
                  studioActiveTab === 'both' ? "lg:col-span-6 xl:col-span-6" : "lg:col-span-12"
                )}>
                  <div className="space-y-3 max-w-3xl mx-auto">
                    
                    {/* Thanh trạng thái Live Preview */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Trang Sách / Cuốn Vở Thực Tế (Live Preview)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Tự động đồng bộ</span>
                    </div>

                    {/* Component hiển thị trang cuốn vở học tập */}
                    <LessonNotebookPreview
                      formData={formData}
                      currentChapter={(chapters || []).find(c => c.id === formData.chapterId)}
                    />

                  </div>
                </div>
              )}

            </div>

            {/* Footer Studio: Nút Lưu & Hủy */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Nội dung chuẩn hóa bám sát ngân hàng thi trắc nghiệm & án lệ CA4</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveLesson}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/25 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingLessonId ? 'Cập Nhật Bài Học' : 'Lưu & Xuất Bản Bài Học'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
export default DocumentPage
