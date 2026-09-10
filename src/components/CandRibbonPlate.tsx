import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface CandRibbonPlateProps {
  order: number
  title: string
  active?: boolean
  onClick?: () => void
}

export function CandRibbonPlate({ order, title, active, onClick }: CandRibbonPlateProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between gap-2 border cursor-pointer",
        active
          ? "bg-gradient-to-r from-red-700 via-red-600 to-red-800 border-amber-400 text-white shadow-md shadow-red-900/40"
          : "bg-slate-900/80 hover:bg-slate-900 border-white/10 text-slate-200 hover:text-white hover:border-white/30"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn(
          "w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 shadow-xs",
          active ? "bg-amber-400 text-slate-950" : "bg-white/15 text-amber-300"
        )}>
          {order}
        </span>
        <span className="font-bold text-xs truncate">
          {title}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 shrink-0 transition-transform",
        active ? "text-amber-300 translate-x-0.5" : "text-slate-400"
      )} />
    </button>
  )
}
