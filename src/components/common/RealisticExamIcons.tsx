import { useId } from 'react'
import { cn } from '@/lib/utils'

interface RealisticIconProps {
  size?: number
  className?: string
}

// 1. Đồng Hồ Bấm Giờ 3D Thời Gian (Stopwatch mạ vàng kim loại 3D vát khối sang trọng)
export function RealisticClock3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(245,158,11,0.45)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-clockBezel`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-clockFace`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-glassGloss`} x1="16" y1="5" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Crown nút bấm đồng hồ */}
      <rect x="14" y="1" width="4" height="3" rx="1" fill={`url(#${idPrefix}-clockBezel)`} stroke="#78350F" strokeWidth="0.4" />
      {/* Vành viền vàng kim vát 3D */}
      <circle cx="16" cy="17" r="13" fill={`url(#${idPrefix}-clockBezel)`} stroke="#FEF08A" strokeWidth="0.6" />
      {/* Rãnh bóng tối tạo chiều sâu */}
      <circle cx="16" cy="17" r="10.8" fill="#78350F" opacity="0.35" />
      {/* Mặt đồng hồ ngà vàng */}
      <circle cx="16" cy="17" r="10" fill={`url(#${idPrefix}-clockFace)`} stroke="#CA8A04" strokeWidth="0.4" />
      {/* Vạch giờ */}
      <line x1="16" y1="8" x2="16" y2="9.8" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="24.2" x2="16" y2="26" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="17" x2="8.8" y2="17" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23.2" y1="17" x2="25" y2="17" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
      {/* Kim giờ xanh navy vát khối */}
      <line x1="16" y1="17" x2="19.8" y2="13.2" stroke="#1E3A8A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Kim phút đỏ thể thao */}
      <line x1="16" y1="17" x2="16" y2="10" stroke="#DC2626" strokeWidth="1.3" strokeLinecap="round" />
      {/* Chốt kim trung tâm mạ vàng */}
      <circle cx="16" cy="17" r="1.6" fill="#DC2626" stroke="#FEF08A" strokeWidth="0.6" />
      {/* Ánh bóng gương kính cong */}
      <path d="M7 15C8 10 12 7 16 7C20 7 24 10 25 15C21 13 11 13 7 15Z" fill={`url(#${idPrefix}-glassGloss)`} />
    </svg>
  )
}

// 2. Phiếu Thi Trắc Nghiệm 3D (Thẻ bài thi indigo nổi khối với huy hiệu dấu tích xanh bảo chứng)
export function RealisticQuiz3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(99,102,241,0.45)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-quizCard`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-quizBorder`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-checkBadge`} x1="18" y1="16" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Bóng đổ thẻ */}
      <rect x="5" y="4" width="22" height="25" rx="4" fill="#312E81" opacity="0.18" />
      {/* Tấm bài thi 3D */}
      <rect x="5" y="3" width="22" height="25" rx="4" fill={`url(#${idPrefix}-quizCard)`} stroke={`url(#${idPrefix}-quizBorder)`} strokeWidth="1.2" />
      {/* Kẹp tài liệu đỉnh thẻ mạ xanh tím */}
      <path d="M11 2H21C21.5 2 22 2.5 22 3V5H10V3C10 2.5 10.5 2 11 2Z" fill="#4F46E5" stroke="#312E81" strokeWidth="0.5" />
      <circle cx="16" cy="3.5" r="0.8" fill="#FEF08A" />
      {/* Các câu hỏi trắc nghiệm A, B, C */}
      <circle cx="9.5" cy="10" r="2" fill="#6366F1" />
      <line x1="13.5" y1="10" x2="22.5" y2="10" stroke="#4338CA" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="15.5" r="2" fill="#818CF8" />
      <line x1="13.5" y1="15.5" x2="20.5" y2="15.5" stroke="#6366F1" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9.5" cy="21" r="2" fill="#A5B4FC" />
      <line x1="13.5" y1="21" x2="18" y2="21" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" />
      {/* Huy hiệu Dấu Tích Xanh ĐÚNG nổi khối góc dưới */}
      <circle cx="23" cy="22" r="6" fill={`url(#${idPrefix}-checkBadge)`} stroke="#D1FAE5" strokeWidth="1" />
      <path d="M20.5 22L22.2 23.8L25.8 19.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 3. Văn Bản Tự Luận 3D (Văn kiện nghị luận trang trọng cuộn góc với con dấu sáp đỏ sao vàng)
export function RealisticEssay3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(16,185,129,0.45)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-docGrad`} x1="4" y1="2" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-sealRed`} x1="18" y1="20" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      {/* Tấm giấy văn bản */}
      <path d="M6 4C6 2.9 6.9 2 8 2H20L26 8V28C26 29.1 25.1 30 24 30H8C6.9 30 6 29.1 6 28V4Z" fill={`url(#${idPrefix}-docGrad)`} stroke="#10B981" strokeWidth="1.2" />
      {/* Góc gấp 3D trang giấy */}
      <path d="M20 2V7C20 7.6 20.4 8 21 8H26L20 2Z" fill="#A7F3D0" stroke="#059669" strokeWidth="0.8" />
      {/* Dòng chữ văn bản nghị luận */}
      <line x1="10" y1="10.5" x2="17" y2="10.5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="14.5" x2="22" y2="14.5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="10" y1="18.5" x2="18" y2="18.5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="10" y1="22.5" x2="15" y2="22.5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" />
      {/* Con dấu sáp đỏ uy nghiêm với ngôi sao vàng */}
      <circle cx="21.5" cy="23.5" r="4.8" fill={`url(#${idPrefix}-sealRed)`} stroke="#FEF08A" strokeWidth="0.8" />
      <polygon points="21.5,21 22.3,22.8 24.3,22.9 22.8,24.2 23.3,26.1 21.5,25.1 19.7,26.1 20.2,24.2 18.7,22.9 20.7,22.8" fill="#FDE047" stroke="#92400E" strokeWidth="0.3" />
    </svg>
  )
}

// 4. Thí Sinh / Nhóm Thí Sinh 3D (Huy hiệu thí sinh tham gia thi)
export function RealisticUsers3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_1.5px_3px_rgba(99,102,241,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-usrPrimary`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-usrSec`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      {/* Nhân vật phía sau */}
      <circle cx="16.5" cy="7.5" r="3" fill={`url(#${idPrefix}-usrSec)`} />
      <path d="M13.5 18C13.5 15.5 15 13.5 17.5 13.5C19.5 13.5 21 15 21.5 17" stroke={`url(#${idPrefix}-usrSec)`} strokeWidth="1.6" strokeLinecap="round" />
      {/* Nhân vật chính phía trước */}
      <circle cx="8.5" cy="6.5" r="3.8" fill={`url(#${idPrefix}-usrPrimary)`} stroke="#FFFFFF" strokeWidth="0.8" />
      <path d="M3 18.5C3 14.8 5.5 12.5 9 12.5C12.5 12.5 15 14.8 15 18.5" fill={`url(#${idPrefix}-usrPrimary)`} stroke="#EEF2FF" strokeWidth="0.6" />
    </svg>
  )
}

// 5. Thẻ Học Ghi Nhớ Flashcard 3D (Thẻ bài xếp tầng bóng đổ nổi khối chuyển sắc tím - xanh)
export function RealisticFlashcard3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(139,92,246,0.45)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-fcBack`} x1="2" y1="5" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-fcFront`} x1="6" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-fcBorder`} x1="6" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-glowBadge`} x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      {/* Thẻ phía sau xếp nghiêng 3D */}
      <rect x="4" y="6" width="21" height="23" rx="4" transform="rotate(-9 4 6)" fill={`url(#${idPrefix}-fcBack)`} opacity="0.8" />
      {/* Thẻ chính phía trước */}
      <rect x="7" y="3.5" width="22" height="25" rx="4" fill={`url(#${idPrefix}-fcFront)`} stroke={`url(#${idPrefix}-fcBorder)`} strokeWidth="1.2" />
      {/* Ký hiệu ghi nhớ trung tâm */}
      <circle cx="18" cy="11.5" r="3.2" fill="#7C3AED" />
      <path d="M16.8 10.3C16.8 9.6 17.3 9.1 18 9.1C18.7 9.1 19.2 9.6 19.2 10.3C19.2 11 18.5 11.4 18 11.8V12.3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
      <circle cx="18" cy="13.5" r="0.5" fill="#FFFFFF" />
      {/* Dòng tóm tắt kiến thức */}
      <line x1="12" y1="18" x2="24" y2="18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="22" x2="21" y2="22" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round" />
      {/* Huy hiệu xoay lật 3D */}
      <circle cx="24.5" cy="24" r="5" fill={`url(#${idPrefix}-glowBadge)`} stroke="#E0F2FE" strokeWidth="0.8" />
      <path d="M22.5 24.5A2.2 2.2 0 1 1 26.2 25.2L27 26.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 6. Phân Loại Dạng Bài 3D (3 tầng khối đa chiều nổi bật sắc chàm tím)
export function RealisticLayers3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(99,102,241,0.4)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-layerBot`} x1="4" y1="18" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-layerMid`} x1="4" y1="11" x2="28" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-layerTop`} x1="4" y1="4" x2="28" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* Tầng 3 đáy */}
      <path d="M16 28L4 22L16 16L28 22L16 28Z" fill={`url(#${idPrefix}-layerBot)`} stroke="#6366F1" strokeWidth="0.8" />
      {/* Tầng 2 giữa */}
      <path d="M16 21L4 15L16 9L28 15L16 21Z" fill={`url(#${idPrefix}-layerMid)`} stroke="#A5B4FC" strokeWidth="0.8" />
      {/* Tầng 1 trên cùng */}
      <path d="M16 14L4 8L16 2L28 8L16 14Z" fill={`url(#${idPrefix}-layerTop)`} stroke="#EEF2FF" strokeWidth="1" />
      <circle cx="16" cy="8" r="2" fill="#FFFFFF" opacity="0.85" />
    </svg>
  )
}

// 7. Quy Mô Câu Hỏi 3D (Thước ngắm mục tiêu trắc nghiệm chính xác)
export function RealisticScale3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(14,165,233,0.4)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-scaleOuter`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-scaleInner`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill={`url(#${idPrefix}-scaleOuter)`} stroke="#BAE6FD" strokeWidth="1" />
      <circle cx="16" cy="16" r="9.5" fill={`url(#${idPrefix}-scaleInner)`} stroke="#0284C7" strokeWidth="0.8" />
      {/* Vạch ngắm */}
      <circle cx="16" cy="16" r="5.5" stroke="#0284C7" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="16" cy="16" r="2.6" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.8" />
      {/* Kim chỉ trục */}
      <line x1="16" y1="4" x2="16" y2="7.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="24.5" x2="16" y2="28" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4" y1="16" x2="7.5" y2="16" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="24.5" y1="16" x2="28" y2="16" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// 8. Cỡ Chữ Typography 3D (Huy hiệu điều chỉnh tỷ lệ văn bản)
export function RealisticTypography3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(99,102,241,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-typoPlate`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-typoA`} x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="6" fill={`url(#${idPrefix}-typoPlate)`} stroke="#818CF8" strokeWidth="1.2" />
      {/* Ký tự A lớn 3D */}
      <path d="M12 22L16 8.5L20 22M13.2 18.2H18.8" stroke={`url(#${idPrefix}-typoA)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Vạch đo kích thước */}
      <circle cx="23" cy="9" r="1.5" fill="#10B981" />
      <line x1="22" y1="22" x2="27" y2="22" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// 9. Vở Nháp Tự Luận 3D (Sổ tay lò xo kèm bút ký luyện viết)
export function RealisticNotebook3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(16,185,129,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-bookCover`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-penGold`} x1="18" y1="14" x2="30" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>
      </defs>
      {/* Bìa sổ */}
      <rect x="6" y="3" width="21" height="26" rx="3.5" fill={`url(#${idPrefix}-bookCover)`} stroke="#059669" strokeWidth="1.2" />
      {/* Khuyên xoắn sổ lò xo */}
      <circle cx="6" cy="8" r="1.2" fill="#047857" />
      <circle cx="6" cy="13" r="1.2" fill="#047857" />
      <circle cx="6" cy="18" r="1.2" fill="#047857" />
      <circle cx="6" cy="23" r="1.2" fill="#047857" />
      {/* Các dòng kẻ ô ly */}
      <line x1="11" y1="9" x2="23" y2="9" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11" y1="13.5" x2="23" y2="13.5" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="18" x2="20" y2="18" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="22.5" x2="18" y2="22.5" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bút máy ký tên */}
      <path d="M21 21L27 15L29 17L23 23L20 24L21 21Z" fill={`url(#${idPrefix}-penGold)`} stroke="#78350F" strokeWidth="0.8" />
    </svg>
  )
}

// 10. Dàn Ý Chuẩn T05 3D (Cuộn thư pháp lệnh mạ vàng và cây cấu trúc luận cứ)
export function RealisticOutline3DIcon({ size = 20, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-scrollBg`} x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="60%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <rect x="5" y="4" width="22" height="24" rx="3.5" fill={`url(#${idPrefix}-scrollBg)`} stroke="#D97706" strokeWidth="1.2" />
      {/* Luận điểm I */}
      <circle cx="10" cy="10" r="1.8" fill="#D97706" />
      <line x1="14" y1="10" x2="23" y2="10" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
      {/* Luận điểm II */}
      <circle cx="10" cy="16" r="1.8" fill="#2563EB" />
      <line x1="14" y1="16" x2="23" y2="16" stroke="#1D4ED8" strokeWidth="1.6" strokeLinecap="round" />
      {/* Luận điểm III */}
      <circle cx="10" cy="22" r="1.8" fill="#059669" />
      <line x1="14" y1="22" x2="21" y2="22" stroke="#047857" strokeWidth="1.6" strokeLinecap="round" />
      {/* Con dấu chứng nhận chuẩn T05 */}
      <circle cx="23.5" cy="6.5" r="2.8" fill="#EF4444" stroke="#FEF08A" strokeWidth="0.7" />
    </svg>
  )
}

// 11. Ruy Băng Đánh Dấu Bookmark 3D (Dải lụa mạ vàng kim gắn sao trang trọng)
export function RealisticRibbon3DIcon({ size = 18, isSaved = false, className }: RealisticIconProps & { isSaved?: boolean }) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 hover:scale-110", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-goldRib`} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-grayRib`} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <path
        d="M6 3C6 2.44772 6.44772 2 7 2H17C17.5523 2 18 2.44772 18 3V21L12 17.5L6 21V3Z"
        fill={isSaved ? `url(#${idPrefix}-goldRib)` : `url(#${idPrefix}-grayRib)`}
        stroke={isSaved ? "#78350F" : "#64748B"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {isSaved && (
        <polygon
          points="12,6.5 13,9 15.8,9.3 13.7,11.2 14.3,14 12,12.5 9.7,14 10.3,11.2 8.2,9.3 11,9"
          fill="#FFFBEB"
          stroke="#92400E"
          strokeWidth="0.4"
        />
      )}
    </svg>
  )
}

// 12. Xúc Xắc Đổi Bộ Khác 3D (Khối lập phương ngọc lục bảo chuyển sắc)
export function RealisticDice3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(16,185,129,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-diceTop`} x1="4" y1="2" x2="28" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-diceLeft`} x1="4" y1="14" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-diceRight`} x1="16" y1="14" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>
      {/* Mặt trên */}
      <path d="M16 3L27 9L16 15L5 9L16 3Z" fill={`url(#${idPrefix}-diceTop)`} stroke="#ECFDF5" strokeWidth="0.8" />
      {/* Mặt trái */}
      <path d="M5 9L16 15V29L5 23V9Z" fill={`url(#${idPrefix}-diceLeft)`} stroke="#065F46" strokeWidth="0.8" />
      {/* Mặt phải */}
      <path d="M16 15L27 9V23L16 29V15Z" fill={`url(#${idPrefix}-diceRight)`} stroke="#064E3B" strokeWidth="0.8" />
      {/* Điểm nút chấm */}
      <circle cx="16" cy="9" r="1.5" fill="#047857" />
      <circle cx="10" cy="18" r="1.2" fill="#ECFDF5" />
      <circle cx="12" cy="22" r="1.2" fill="#ECFDF5" />
      <circle cx="21" cy="17" r="1.2" fill="#A7F3D0" />
      <circle cx="23" cy="22" r="1.2" fill="#A7F3D0" />
    </svg>
  )
}

// 13. Ngân Hàng Câu Hỏi / Kho Lưu Trữ 3D (Tủ kho số pháp luật CAND)
export function RealisticVault3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(16,185,129,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-vaultBody`} x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="50%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-wheelGrad`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="4" fill={`url(#${idPrefix}-vaultBody)`} stroke="#047857" strokeWidth="1.2" />
      {/* Bánh lái két sắt bảo mật */}
      <circle cx="16" cy="16" r="6.5" fill={`url(#${idPrefix}-wheelGrad)`} stroke="#78350F" strokeWidth="1" />
      <circle cx="16" cy="16" r="3" fill="#047857" />
      <line x1="16" y1="10.5" x2="16" y2="21.5" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10.5" y1="16" x2="21.5" y2="16" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />
      {/* Chốt bản lề vàng kim */}
      <circle cx="7" cy="8" r="1.2" fill="#FDE047" stroke="#78350F" strokeWidth="0.4" />
      <circle cx="7" cy="24" r="1.2" fill="#FDE047" stroke="#78350F" strokeWidth="0.4" />
    </svg>
  )
}

// 14. Tờ Giấy Thi A4 Tài Liệu 3D (Tờ giấy thi chính quy Bộ Công An với góc gấp 3D và con dấu đỏ)
export function RealisticA4Document3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(16,185,129,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-paperBg`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-foldGrad`} x1="20" y1="2" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-goldAccent`} x1="5" y1="2" x2="27" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      {/* Thân tờ giấy A4 với góc cắt */}
      <path
        d="M6 3C5.44772 3 5 3.44772 5 4V28C5 28.5523 5.44772 29 6 29H26C26.5523 29 27 28.5523 27 28V10L20 3H6Z"
        fill={`url(#${idPrefix}-paperBg)`}
        stroke="#94A3B8"
        strokeWidth="1"
      />
      {/* Dải viền header trên cùng của tờ giấy */}
      <path d="M5 4C5 3.44772 5.44772 3 6 3H20L17 6H5V4Z" fill={`url(#${idPrefix}-goldAccent)`} opacity="0.8" />
      {/* Góc gấp 3D ở góc trên bên phải */}
      <path d="M20 3V9C20 9.55228 20.4477 10 21 10H27L20 3Z" fill={`url(#${idPrefix}-foldGrad)`} />
      {/* Tiêu đề tài liệu / Quốc hiệu */}
      <line x1="8" y1="8" x2="16" y2="8" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
      {/* Các dòng chữ đề bài (ở trên) */}
      <line x1="8" y1="12" x2="24" y2="12" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="15" x2="22" y2="15" stroke="#334155" strokeWidth="1.1" strokeLinecap="round" />
      {/* Vạch phân cách giữa đề bài và bài làm */}
      <line x1="8" y1="18" x2="24" y2="18" stroke="#059669" strokeWidth="1.3" strokeDasharray="1.5 1.5" />
      {/* Các dòng chữ bài làm (ở dưới) */}
      <line x1="8" y1="21" x2="23" y2="21" stroke="#2563EB" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="24" x2="20" y2="24" stroke="#475569" strokeWidth="1.1" strokeLinecap="round" />
      {/* Con dấu đỏ xác nhận tài liệu chuẩn T05 */}
      <circle cx="23" cy="24.5" r="2.8" fill="#EF4444" opacity="0.85" />
      <circle cx="23" cy="24.5" r="1.8" fill="#FEE2E2" />
      <polygon points="23,23.3 23.4,24.2 24.3,24.3 23.6,24.9 23.8,25.8 23,25.3 22.2,25.8 22.4,24.9 21.7,24.3 22.6,24.2" fill="#DC2626" />
    </svg>
  )
}

// 15. Máy In / Xuất Tài Liệu 3D (Thiết bị in tài liệu A4 chuẩn)
export function RealisticPrinter3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-printerBody`} x1="4" y1="10" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      {/* Khay nạp giấy trên */}
      <rect x="9" y="3" width="14" height="8" rx="1.5" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.8" />
      <line x1="12" y1="6" x2="20" y2="6" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      {/* Thân máy in */}
      <rect x="4" y="10" width="24" height="13" rx="3" fill={`url(#${idPrefix}-printerBody)`} stroke="#475569" strokeWidth="1" />
      {/* Khe xuất giấy */}
      <rect x="7" y="18" width="18" height="2" rx="0.5" fill="#1E293B" />
      {/* Tờ giấy đang in xuất ra ở dưới */}
      <rect x="8" y="19" width="16" height="9" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.8" />
      <line x1="11" y1="22" x2="21" y2="22" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="25" x2="18" y2="25" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
      {/* Đèn báo tín hiệu xanh */}
      <circle cx="8" cy="14" r="1.2" fill="#10B981" />
      <circle cx="12" cy="14" r="1.2" fill="#F59E0B" />
    </svg>
  )
}

// 16. Tài Liệu Xuất PDF 3D (Biểu tượng xuất ra file PDF chuẩn)
export function RealisticPdf3DIcon({ size = 18, className }: RealisticIconProps) {
  const idPrefix = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(239,68,68,0.35)]", className)}
    >
      <defs>
        <linearGradient id={`${idPrefix}-pdfBg`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-pdfBadge`} x1="6" y1="14" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-fold`} x1="20" y1="2" x2="26" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      {/* Tờ giấy nền trắng viền xám */}
      <path d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z" fill={`url(#${idPrefix}-pdfBg)`} stroke="#CBD5E1" strokeWidth="1" />
      {/* Nếp gấp góc phải */}
      <path d="M20 2V8H26L20 2Z" fill={`url(#${idPrefix}-fold)`} />
      {/* Các dòng chữ tượng trưng */}
      <line x1="10" y1="7" x2="16" y2="7" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="18" y2="10" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      {/* Thẻ đỏ PDF nổi bật */}
      <rect x="7" y="15" width="18" height="11" rx="2" fill={`url(#${idPrefix}-pdfBadge)`} stroke="#991B1B" strokeWidth="0.5" />
      {/* Chữ PDF màu trắng */}
      <text x="16" y="23.2" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.4">
        PDF
      </text>
    </svg>
  )
}
