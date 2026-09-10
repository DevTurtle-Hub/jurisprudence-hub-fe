import React, { useState, useEffect } from 'react'
import { 
  Highlighter, 
  Type,
  StickyNote, 
  Copy, 
  Volume2, 
  VolumeX, 
  Trash2, 
  X, 
  Check, 
  Download, 
  Printer,
  Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InteractionApi } from '@/services/api'

export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange'
export type TextColor = 'red' | 'blue' | 'emerald' | 'purple' | 'amber'
export type AnnotationKind = 'highlight' | 'textColor'

export interface StudyAnnotation {
  id: string
  lessonId: string
  selectedText: string
  kind: AnnotationKind
  color: string
  note?: string
  createdAt: string
}

export const COLOR_CONFIG: Record<HighlightColor, { 
  name: string
  dotClass: string
  badgeClass: string
  markClass: string
}> = {
  yellow: {
    name: 'Highlight Vàng',
    dotClass: 'bg-yellow-400 hover:ring-2 hover:ring-yellow-300',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-200 dark:border-yellow-700',
    markClass: 'bg-yellow-200/90 text-yellow-950 dark:bg-yellow-400/40 dark:text-yellow-100 shadow-[0_1px_2px_rgba(234,179,8,0.2)]'
  },
  green: {
    name: 'Highlight Xanh mint',
    dotClass: 'bg-emerald-400 hover:ring-2 hover:ring-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    markClass: 'bg-emerald-200/90 text-emerald-950 dark:bg-emerald-400/40 dark:text-emerald-100 shadow-[0_1px_2px_rgba(16,185,129,0.2)]'
  },
  pink: {
    name: 'Highlight Hồng phấn',
    dotClass: 'bg-pink-400 hover:ring-2 hover:ring-pink-300',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/60 dark:text-pink-200 dark:border-pink-700',
    markClass: 'bg-pink-200/90 text-pink-950 dark:bg-pink-400/40 dark:text-pink-100 shadow-[0_1px_2px_rgba(236,72,153,0.2)]'
  },
  blue: {
    name: 'Highlight Lam pastel',
    dotClass: 'bg-sky-400 hover:ring-2 hover:ring-sky-300',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700',
    markClass: 'bg-sky-200/90 text-sky-950 dark:bg-sky-400/40 dark:text-sky-100 shadow-[0_1px_2px_rgba(14,165,233,0.2)]'
  },
  orange: {
    name: 'Highlight Cam đào',
    dotClass: 'bg-amber-400 hover:ring-2 hover:ring-amber-300',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    markClass: 'bg-amber-200/90 text-amber-950 dark:bg-amber-400/40 dark:text-amber-100 shadow-[0_1px_2px_rgba(245,158,11,0.2)]'
  }
}

export const TEXT_COLOR_CONFIG: Record<TextColor, {
  name: string
  dotClass: string
  badgeClass: string
  textClass: string
}> = {
  red: {
    name: 'Chữ Đỏ',
    dotClass: 'bg-red-500 hover:ring-2 hover:ring-red-400',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    textClass: 'text-red-600 dark:text-red-400 font-bold'
  },
  blue: {
    name: 'Chữ Xanh dương',
    dotClass: 'bg-blue-500 hover:ring-2 hover:ring-blue-400',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    textClass: 'text-blue-600 dark:text-blue-400 font-bold'
  },
  emerald: {
    name: 'Chữ Xanh lá',
    dotClass: 'bg-emerald-500 hover:ring-2 hover:ring-emerald-400',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-600 dark:text-emerald-400 font-bold'
  },
  purple: {
    name: 'Chữ Tím',
    dotClass: 'bg-purple-500 hover:ring-2 hover:ring-purple-400',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    textClass: 'text-purple-600 dark:text-purple-400 font-bold'
  },
  amber: {
    name: 'Chữ Cam',
    dotClass: 'bg-amber-500 hover:ring-2 hover:ring-amber-400',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-600 dark:text-amber-400 font-bold'
  }
}

// React Component hiển thị văn bản với highlight & màu chữ an toàn
interface AnnotatedTextProps {
  text: string
  annotations: StudyAnnotation[]
  onAnnotationClick?: (annotation: StudyAnnotation, e: React.MouseEvent) => void
  className?: string
}

export function AnnotatedText({
  text,
  annotations,
  onAnnotationClick,
  className
}: AnnotatedTextProps) {
  if (!text || !annotations || annotations.length === 0) {
    return <span className={className}>{text}</span>
  }

  interface MatchRange {
    start: number
    end: number
    annotation: StudyAnnotation
  }

  const matches: MatchRange[] = []

  annotations.forEach(ann => {
    const query = ann.selectedText?.trim()
    if (!query || query.length < 2) return
    let pos = 0
    while (pos < text.length) {
      const idx = text.indexOf(query, pos)
      if (idx === -1) break
      matches.push({
        start: idx,
        end: idx + query.length,
        annotation: ann
      })
      pos = idx + query.length
    }
  })

  if (matches.length === 0) {
    return <span className={className}>{text}</span>
  }

  matches.sort((a, b) => a.start - b.start)

  // Loại bỏ các đoạn trùng lặp
  const nonOverlapping: MatchRange[] = []
  let lastEnd = 0
  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlapping.push(m)
      lastEnd = m.end
    }
  }

  const nodes: React.ReactNode[] = []
  let cursor = 0

  nonOverlapping.forEach((m, idx) => {
    if (m.start > cursor) {
      nodes.push(text.slice(cursor, m.start))
    }

    const ann = m.annotation
    const isBg = ann.kind === 'highlight'
    const bgConf = COLOR_CONFIG[ann.color as HighlightColor] || COLOR_CONFIG.yellow
    const textConf = TEXT_COLOR_CONFIG[ann.color as TextColor] || TEXT_COLOR_CONFIG.red

    nodes.push(
      <mark
        key={`match_${idx}_${ann.id}`}
        onClick={(e) => {
          e.stopPropagation()
          onAnnotationClick?.(ann, e)
        }}
        className={cn(
          "cursor-pointer rounded-sm px-0.5 transition-all hover:brightness-95 select-text",
          isBg ? bgConf.markClass : textConf.textClass
        )}
        title={ann.note ? `Ghi chú: ${ann.note}` : undefined}
      >
        {text.slice(m.start, m.end)}
        {ann.note && (
          <span className="inline-block ml-0.5 text-[10px] select-none" title={`Ghi chú: ${ann.note}`}>
            📝
          </span>
        )}
      </mark>
    )

    cursor = m.end
  })

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return <span className={className}>{nodes}</span>
}

interface LessonStudyToolbarProps {
  lessonId: string
  lessonTitle: string
  chapterTitle: string
  contentRef: React.RefObject<HTMLDivElement | null>
  fontSize: 'sm' | 'base' | 'lg' | 'xl'
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void
  annotations: StudyAnnotation[]
  setAnnotations: React.Dispatch<React.SetStateAction<StudyAnnotation[]>>
  activeAnnotationPopover: { annotation: StudyAnnotation; top: number; left: number } | null
  setActiveAnnotationPopover: (val: { annotation: StudyAnnotation; top: number; left: number } | null) => void
}

export function LessonStudyToolbar({
  lessonId,
  lessonTitle,
  chapterTitle,
  contentRef,
  fontSize,
  setFontSize,
  annotations,
  setAnnotations,
  activeAnnotationPopover,
  setActiveAnnotationPopover
}: LessonStudyToolbarProps) {
  // Trạng thái Floating Popover khi bôi đen text mới
  const [selectionPopover, setSelectionPopover] = useState<{
    text: string
    top: number
    left: number
    visible: boolean
  }>({ text: '', top: 0, left: 0, visible: false })

  // Chế độ chọn màu: 'bg' (Highlight) hoặc 'text' (Màu Chữ)
  const [colorMode, setColorMode] = useState<'bg' | 'text'>('bg')

  // Trạng thái form ghi chú nhanh trên selection popover
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>('yellow')
  const [selectedKind, setSelectedKind] = useState<AnnotationKind>('highlight')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Drawer danh sách tất cả ghi chú
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Sửa note trên popover
  const [isEditingExistingNote, setIsEditingExistingNote] = useState(false)
  const [existingNoteDraft, setExistingNoteDraft] = useState('')

  // Hiển thị Toast thông báo khi cần
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Lắng nghe sự kiện bôi đen chữ trong bài học
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        if (!isNoteInputOpen) {
          setSelectionPopover(prev => ({ ...prev, visible: false }))
        }
        return
      }

      const text = selection.toString().trim()
      if (text.length < 2) {
        if (!isNoteInputOpen) {
          setSelectionPopover(prev => ({ ...prev, visible: false }))
        }
        return
      }

      // Kiểm tra selection nằm trong vùng bài học
      if (contentRef.current && contentRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        setActiveAnnotationPopover(null)
        setSelectionPopover({
          text,
          top: Math.max(10, rect.top - 70),
          left: Math.max(10, Math.min(window.innerWidth - 320, rect.left + rect.width / 2 - 140)),
          visible: true
        })
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchend', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [contentRef, isNoteInputOpen, setActiveAnnotationPopover])

  // Thêm Highlight Nền
  const handleAddHighlight = async (color: HighlightColor) => {
    if (!selectionPopover.text) return
    const textToSave = selectionPopover.text
    setSelectionPopover(prev => ({ ...prev, visible: false }))
    setIsNoteInputOpen(false)
    window.getSelection()?.removeAllRanges()

    try {
      if (localStorage.getItem('access_token')) {
        const created = await InteractionApi.createAnnotation(lessonId, {
          selectedText: textToSave,
          kind: 'highlight',
          color: color,
        })
        setAnnotations(prev => [{
          id: created.id,
          lessonId: created.lessonId,
          selectedText: created.selectedText,
          kind: 'highlight',
          color: created.color,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        }, ...prev])
        showToast('Đã lưu highlight thành công!')
        return
      }
    } catch (err) {
      console.warn('Không thể lưu annotation lên server:', err)
    }

    const newId = 'ann_' + Date.now()
    const newAnnotation: StudyAnnotation = {
      id: newId,
      lessonId,
      selectedText: textToSave,
      kind: 'highlight',
      color,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    }
    setAnnotations(prev => [newAnnotation, ...prev])
  }

  // Tô Màu Chữ
  const handleAddTextColor = async (color: TextColor) => {
    if (!selectionPopover.text) return
    const textToSave = selectionPopover.text
    setSelectionPopover(prev => ({ ...prev, visible: false }))
    setIsNoteInputOpen(false)
    window.getSelection()?.removeAllRanges()

    try {
      if (localStorage.getItem('access_token')) {
        const created = await InteractionApi.createAnnotation(lessonId, {
          selectedText: textToSave,
          kind: 'textColor',
          color: color,
        })
        setAnnotations(prev => [{
          id: created.id,
          lessonId: created.lessonId,
          selectedText: created.selectedText,
          kind: 'textColor',
          color: created.color,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        }, ...prev])
        showToast('Đã tô màu chữ thành công!')
        return
      }
    } catch (err) {
      console.warn('Không thể lưu màu chữ lên server:', err)
    }

    const newId = 'ann_' + Date.now()
    const newAnnotation: StudyAnnotation = {
      id: newId,
      lessonId,
      selectedText: textToSave,
      kind: 'textColor',
      color,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    }
    setAnnotations(prev => [newAnnotation, ...prev])
  }

  // Thêm Ghi chú đi kèm
  const handleSaveNote = async () => {
    if (!selectionPopover.text) return
    const textToSave = selectionPopover.text
    const finalNote = noteContent.trim()
    setNoteContent('')
    setIsNoteInputOpen(false)
    setSelectionPopover(prev => ({ ...prev, visible: false }))
    window.getSelection()?.removeAllRanges()

    try {
      if (localStorage.getItem('access_token')) {
        const created = await InteractionApi.createAnnotation(lessonId, {
          selectedText: textToSave,
          kind: selectedKind === 'textColor' ? 'textColor' : 'highlight',
          color: selectedColor,
          note: finalNote
        })
        setAnnotations(prev => [{
          id: created.id,
          lessonId: created.lessonId,
          selectedText: created.selectedText,
          kind: selectedKind,
          color: created.color,
          note: created.note,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        }, ...prev])
        showToast('Đã lưu ghi chú học phần thành công!')
        return
      }
    } catch (err) {
      console.warn('Không thể lưu ghi chú lên server:', err)
    }

    const newId = 'ann_' + Date.now()
    const newAnnotation: StudyAnnotation = {
      id: newId,
      lessonId,
      selectedText: textToSave,
      kind: selectedKind,
      color: selectedColor,
      note: finalNote,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    }
    setAnnotations(prev => [newAnnotation, ...prev])
  }

  // Cập nhật note cho annotation đã có
  const handleUpdateExistingNote = () => {
    if (!activeAnnotationPopover) return
    const targetId = activeAnnotationPopover.annotation.id
    const updatedNote = existingNoteDraft.trim()

    setAnnotations(prev => prev.map(a => a.id === targetId ? { ...a, note: updatedNote } : a))
    setActiveAnnotationPopover(null)
    setIsEditingExistingNote(false)
  }

  // Xóa 1 Annotation
  const handleDeleteAnnotation = async (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    setActiveAnnotationPopover(null)
    try {
      if (localStorage.getItem('access_token') && !id.startsWith('ann_')) {
        await InteractionApi.deleteAnnotation(id)
        showToast('Đã xóa đánh dấu!')
      }
    } catch (err) {
      console.warn('Lỗi khi xóa annotation trên server:', err)
    }
  }

  // Sao chép trích dẫn kèm nguồn
  const handleCopyQuote = (text: string) => {
    const quote = `"${text}"\n— [Trích: ${lessonTitle} | ${chapterTitle} - Giáo trình Pháp Luật CAND]`
    navigator.clipboard.writeText(quote)
    setSelectionPopover(prev => ({ ...prev, visible: false }))
    showToast('Đã sao chép trích dẫn kèm nguồn!')
  }

  // Đọc to đoạn đã chọn bằng Speech Synthesis
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      showToast('Đang phát âm thanh đoạn trích...')
    } else {
      showToast('Trình duyệt không hỗ trợ phát giọng nói.')
    }
  }

  // Đọc toàn bài
  const handleToggleFullSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel()
      setIsSpeaking(false)
      showToast('Đã dừng đọc.')
      return
    }

    if (!contentRef.current) return
    const fullText = contentRef.current.innerText || ''
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      showToast('Bắt đầu đọc toàn bộ nội dung bài học...')
    }
  }

  // Xuất toàn bộ ghi chú ra file .txt
  const handleExportNotes = () => {
    if (annotations.length === 0) {
      showToast('Chưa có ghi chú nào để xuất.')
      return
    }

    let fileContent = `SỔ TAY GHI CHÚ BÀI HỌC\nMôn: Lý Luận Nhà Nước & Pháp Luật\nBài: ${lessonTitle}\nChương: ${chapterTitle}\nXuất ngày: ${new Date().toLocaleString('vi-VN')}\n\n`
    fileContent += '='.repeat(50) + '\n\n'

    annotations.forEach((item, idx) => {
      const typeLabel = item.kind === 'textColor' ? 'Tô màu chữ' : 'Highlight'
      fileContent += `[Mục ${idx + 1}] (${typeLabel} - ${item.createdAt})\n`
      fileContent += `Đoạn trích: "${item.selectedText}"\n`
      if (item.note) {
        fileContent += `Ghi chú cá nhân: ${item.note}\n`
      }
      fileContent += '\n' + '-'.repeat(40) + '\n\n'
    })

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Ghi-chu-${lessonId}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã tải xuống sổ tay ghi chú (.txt)!')
  }

  const filteredList = annotations.filter(a => {
    if (filterType === 'all') return true
    if (filterType === 'notes_only') return Boolean(a.note)
    if (filterType === 'highlights_only') return a.kind === 'highlight'
    if (filterType === 'text_colors_only') return a.kind === 'textColor'
    return true
  })

  // Lấy thông tin badge hiển thị
  const getAnnotationBadge = (ann: StudyAnnotation) => {
    if (ann.kind === 'textColor') {
      const conf = TEXT_COLOR_CONFIG[ann.color as TextColor] || TEXT_COLOR_CONFIG.red
      return { name: conf.name, badgeClass: conf.badgeClass }
    }
    const conf = COLOR_CONFIG[ann.color as HighlightColor] || COLOR_CONFIG.yellow
    return { name: conf.name, badgeClass: conf.badgeClass }
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING POPOVER TOOLBAR (Hiện ngay trên đoạn vừa bôi đen)              */}
      {/* ========================================================================= */}
      {selectionPopover.visible && (
        <div 
          style={{ 
            position: 'fixed', 
            top: `${selectionPopover.top}px`, 
            left: `${selectionPopover.left}px`,
            zIndex: 60
          }}
          className="animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-2 min-w-[310px]">
            
            {!isNoteInputOpen ? (
              <div className="space-y-1.5">
                {/* Thanh tab chọn chế độ: Highlight vs Màu Chữ */}
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg">
                    <button
                      onClick={() => setColorMode('bg')}
                      className={cn(
                        "px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors text-[10.5px]",
                        colorMode === 'bg' ? "bg-yellow-500 text-slate-950 shadow-2xs" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <Highlighter className="h-3 w-3" />
                      <span>Highlight</span>
                    </button>
                    <button
                      onClick={() => setColorMode('text')}
                      className={cn(
                        "px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors text-[10.5px]",
                        colorMode === 'text' ? "bg-red-500 text-white shadow-2xs" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <Type className="h-3 w-3" />
                      <span>Màu Chữ</span>
                    </button>
                  </div>

                  {/* Nút Đóng Popover */}
                  <button
                    onClick={() => {
                      setSelectionPopover(prev => ({ ...prev, visible: false }))
                      window.getSelection()?.removeAllRanges()
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Hàng nút màu & các nút thao tác */}
                <div className="flex items-center justify-between gap-2">
                  {/* Các chấm màu */}
                  <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
                    {colorMode === 'bg' ? (
                      (Object.keys(COLOR_CONFIG) as HighlightColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleAddHighlight(c)}
                          title={`Tô ${COLOR_CONFIG[c].name}`}
                          className={cn(
                            "w-5 h-5 rounded-full transition-transform active:scale-90 cursor-pointer shadow-xs",
                            COLOR_CONFIG[c].dotClass
                          )}
                        />
                      ))
                    ) : (
                      (Object.keys(TEXT_COLOR_CONFIG) as TextColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleAddTextColor(c)}
                          title={`Đổi ${TEXT_COLOR_CONFIG[c].name}`}
                          className={cn(
                            "w-5 h-5 rounded-full transition-transform active:scale-90 cursor-pointer shadow-xs flex items-center justify-center text-[9px] font-black text-white",
                            TEXT_COLOR_CONFIG[c].dotClass
                          )}
                        >
                          A
                        </button>
                      ))
                    )}
                  </div>

                  {/* Nút Viết Ghi Chú */}
                  <button
                    onClick={() => {
                      setIsNoteInputOpen(true)
                      setSelectedColor(colorMode === 'bg' ? 'yellow' : 'red')
                      setSelectedKind(colorMode === 'bg' ? 'highlight' : 'textColor')
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    title="Thêm ghi chú cá nhân"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Ghi chú</span>
                  </button>

                  {/* Nút Sao chép */}
                  <button
                    onClick={() => handleCopyQuote(selectionPopover.text)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Sao chép trích dẫn"
                  >
                    <Copy className="h-3.5 w-3.5 text-sky-400" />
                  </button>

                  {/* Nút Đọc phát âm */}
                  <button
                    onClick={() => handleSpeakText(selectionPopover.text)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Đọc đoạn này"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            ) : (
              /* Ô Viết Ghi Chú Nhanh */
              <div className="space-y-2 p-1 min-w-[280px]">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <StickyNote className="h-3.5 w-3.5 text-yellow-400" />
                    Ghi chú ({selectedKind === 'textColor' ? 'Màu Chữ' : 'Highlight'})
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {selectedKind === 'highlight' ? (
                      (Object.keys(COLOR_CONFIG) as HighlightColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={cn(
                            "w-3.5 h-3.5 rounded-full transition-transform cursor-pointer",
                            COLOR_CONFIG[c].dotClass,
                            selectedColor === c ? "ring-2 ring-white scale-110" : "opacity-60"
                          )}
                        />
                      ))
                    ) : (
                      (Object.keys(TEXT_COLOR_CONFIG) as TextColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={cn(
                            "w-3.5 h-3.5 rounded-full transition-transform cursor-pointer flex items-center justify-center text-[7px] text-white",
                            TEXT_COLOR_CONFIG[c].dotClass,
                            selectedColor === c ? "ring-2 ring-white scale-110" : "opacity-60"
                          )}
                        >
                          A
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic line-clamp-1 bg-slate-800/80 px-2 py-1 rounded">
                  "{selectionPopover.text}"
                </p>

                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Nhập ghi chú cá nhân..."
                  className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-yellow-400"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsNoteInputOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-medium cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    Lưu Ghi Chú
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. POPOVER KHI CLICK VÀO 1 ĐOẠN HIGHLIGHT/MÀU CHỮ ĐÃ CÓ TRÊN TRANG         */}
      {/* ========================================================================= */}
      {activeAnnotationPopover && (
        <div 
          style={{ 
            position: 'fixed', 
            top: `${activeAnnotationPopover.top}px`, 
            left: `${activeAnnotationPopover.left}px`,
            zIndex: 60
          }}
          className="animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          <div className="bg-slate-900 text-white px-3 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-2 min-w-[260px] max-w-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider",
                getAnnotationBadge(activeAnnotationPopover.annotation).badgeClass
              )}>
                {getAnnotationBadge(activeAnnotationPopover.annotation).name}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSpeakText(activeAnnotationPopover.annotation.selectedText)}
                  className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  title="Đọc đoạn này"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteAnnotation(activeAnnotationPopover.annotation.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Xóa đánh dấu này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveAnnotationPopover(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Hiển thị / Sửa Note */}
            {!isEditingExistingNote ? (
              <div className="space-y-1.5">
                {activeAnnotationPopover.annotation.note ? (
                  <div className="p-2 rounded-xl bg-yellow-950/40 border border-yellow-800/60 text-xs text-yellow-200 flex items-start gap-1.5">
                    <StickyNote className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{activeAnnotationPopover.annotation.note}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa có ghi chú đính kèm.</p>
                )}

                <button
                  onClick={() => setIsEditingExistingNote(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#818cf8] hover:underline font-bold cursor-pointer pt-0.5"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>{activeAnnotationPopover.annotation.note ? 'Sửa ghi chú' : '+ Thêm ghi chú'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={existingNoteDraft}
                  onChange={(e) => setExistingNoteDraft(e.target.value)}
                  placeholder="Nhập ghi chú mới..."
                  className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-yellow-400"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditingExistingNote(false)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateExistingNote}
                    className="px-2.5 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-[11px]"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. THANH CÔNG CỤ ĐỌC SÁCH THÔNG MINH (Top Reading Toolbar)                 */}
      {/* ========================================================================= */}
      <div className="bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 select-none">
        
        {/* Nhóm 1: Cỡ chữ tùy chỉnh */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
          <span className="text-[11px] font-bold text-slate-400 px-1.5 hidden sm:inline">Cỡ chữ:</span>
          {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => setFontSize(sz)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer",
                fontSize === sz 
                  ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>

        {/* Nhóm 2: Đọc to bằng giọng nói, In ấn & Mở Sổ tay Ghi chú */}
        <div className="flex items-center gap-2">
          {/* Nút Đọc toàn bài */}
          <button
            onClick={handleToggleFullSpeech}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs",
              isSpeaking
                ? "bg-emerald-500 text-white border-emerald-600 animate-pulse"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            )}
            title={isSpeaking ? "Dừng phát âm thanh" : "Đọc toàn bài bằng giọng nói AI"}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-500" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Đang Đọc...' : 'Nghe Bài'}</span>
          </button>

          {/* Nút In bài học */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs hidden sm:flex"
            title="In bài học / Xuất PDF chuẩn A4"
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Nút Mở Sổ Tay Ghi Chú & Highlights */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs font-bold transition-all shadow-md shadow-[#5d5fef]/25 cursor-pointer"
          >
            <StickyNote className="h-3.5 w-3.5 text-yellow-300" />
            <span>Sổ Tay Ghi Chú</span>
            {annotations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[#5d5fef] text-[10px] font-black">
                {annotations.length}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. DRAWER SỔ TAY GHI CHÚ & DANH SÁCH HIGHLIGHT (Slide-over bên phải)       */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111622] w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Header Drawer */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#5d5fef]/10 text-[#5d5fef]">
                  <StickyNote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Sổ Tay Ghi Chú & Trích Dẫn
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {annotations.length} đoạn đánh dấu & ghi chú đã lưu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter loại đánh dấu & nút xuất file */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-[#111622] text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0",
                    filterType === 'all' 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('highlights_only')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0",
                    filterType === 'highlights_only' 
                      ? "bg-yellow-500 text-slate-950 font-black" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Highlight
                </button>
                <button
                  onClick={() => setFilterType('text_colors_only')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0",
                    filterType === 'text_colors_only' 
                      ? "bg-red-500 text-white font-black" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Màu Chữ
                </button>
                <button
                  onClick={() => setFilterType('notes_only')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0",
                    filterType === 'notes_only' 
                      ? "bg-indigo-600 text-white font-black" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Có Note
                </button>
              </div>

              {annotations.length > 0 && (
                <button
                  onClick={handleExportNotes}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer shrink-0"
                  title="Xuất ghi chú ra file .txt"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Xuất .txt</span>
                </button>
              )}
            </div>

            {/* Danh sách các thẻ ghi chú & highlight */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
              {filteredList.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Highlighter className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chưa có đánh dấu nào
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                      Hãy bôi đen bất kỳ đoạn văn bản nào trong bài học để highlight, tô màu chữ và viết ghi chú.
                    </p>
                  </div>
                </div>
              ) : (
                filteredList.map((item) => {
                  const badge = getAnnotationBadge(item)
                  const isBg = item.kind === 'highlight'
                  const bgConf = COLOR_CONFIG[item.color as HighlightColor] || COLOR_CONFIG.yellow
                  const textConf = TEXT_COLOR_CONFIG[item.color as TextColor] || TEXT_COLOR_CONFIG.red

                  return (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#151b29] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 relative group hover:border-slate-300 transition-all"
                    >
                      {/* Header Card */}
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wide",
                          badge.badgeClass
                        )}>
                          {badge.name}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                          <button
                            onClick={() => handleDeleteAnnotation(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Xóa đánh dấu này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Text trích dẫn */}
                      <p className={cn(
                        "text-xs leading-relaxed p-2 rounded-lg italic border-l-2 border-slate-400",
                        isBg ? bgConf.markClass : textConf.textClass
                      )}>
                        "{item.selectedText}"
                      </p>

                      {/* Note cá nhân nếu có */}
                      {item.note && (
                        <div className="p-2.5 rounded-xl bg-yellow-50/80 dark:bg-yellow-950/30 border border-yellow-200/70 dark:border-yellow-800/50 text-xs text-yellow-950 dark:text-yellow-100 flex items-start gap-2">
                          <StickyNote className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-medium">{item.note}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Drawer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 bg-white dark:bg-[#111622]">
              Dữ liệu được lưu tự động trên trình duyệt của bạn
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
