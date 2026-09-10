import React from 'react'

interface CandEmblemIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number
}

export function CandEmblemRealisticIcon({ className = "h-12 w-12", size = 48, ...props }: CandEmblemIconProps) {
  const idPrefix = React.useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Gradient Vàng Kim Loại 3D */}
        <linearGradient id={`${idPrefix}-goldPrimary`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7A1" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#E5A00D" />
          <stop offset="100%" stopColor="#9E6B00" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-goldLight`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBE6" />
          <stop offset="45%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#C68A00" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4940C" />
          <stop offset="50%" stopColor="#946200" />
          <stop offset="100%" stopColor="#5E3C00" />
        </linearGradient>

        {/* Gradient Đỏ Cờ / Đỏ Khiên Tổ Quốc */}
        <radialGradient id={`${idPrefix}-redShield`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FF2A3B" />
          <stop offset="45%" stopColor="#D90429" />
          <stop offset="85%" stopColor="#900C1F" />
          <stop offset="100%" stopColor="#58000C" />
        </radialGradient>

        <linearGradient id={`${idPrefix}-redBanner`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E61C2E" />
          <stop offset="50%" stopColor="#B3091B" />
          <stop offset="100%" stopColor="#78020E" />
        </linearGradient>

        {/* Đổ bóng Kim loại */}
        <filter id={`${idPrefix}-dropShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        
        <filter id={`${idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFE066" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-dropShadow)`}>
        {/* 1. HÀO QUANG SAO VÀNG / BÁNH XE LỊCH SỬ NỀN */}
        <circle cx="60" cy="55" r="46" fill="none" stroke={`url(#${idPrefix}-goldPrimary)`} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.75" />
        <circle cx="60" cy="55" r="48.5" fill="none" stroke={`url(#${idPrefix}-goldLight)`} strokeWidth="0.8" opacity="0.4" />

        {/* 2. THANH GƯƠM BẢO VỆ TỔ QUỐC (ĐỨNG THẲNG TRUNG TÂM PHÍA SAU KHIÊN) */}
        {/* Chuôi gươm & Đỉnh chuôi */}
        <path d="M58 8 H62 V14 H58 Z" fill={`url(#${idPrefix}-goldLight)`} />
        <circle cx="60" cy="8" r="3.2" fill={`url(#${idPrefix}-goldPrimary)`} stroke="#FFF" strokeWidth="0.5" />
        {/* Đốc gươm (Thanh ngang) */}
        <path d="M46 14 C46 12.5 74 12.5 74 14 C74 15.5 46 15.5 46 14 Z" fill={`url(#${idPrefix}-goldLight)`} stroke={`url(#${idPrefix}-goldDark)`} strokeWidth="0.6" />
        {/* Mũi gươm lộ phía dưới */}
        <path d="M57.5 96 L60 106 L62.5 96 Z" fill={`url(#${idPrefix}-goldPrimary)`} stroke={`url(#${idPrefix}-goldDark)`} strokeWidth="0.5" />

        {/* 3. CÀNH NGUYỆT QUẾ / BÔNG LÚA VÀNG ÔM 2 BÊN KHIÊN */}
        {/* Nhánh Trái */}
        <g fill={`url(#${idPrefix}-goldLight)`} stroke={`url(#${idPrefix}-goldDark)`} strokeWidth="0.4">
          <path d="M22 46 C16 43 14 36 21 34 C26 38 25 43 22 46 Z" />
          <path d="M19 57 C13 54 12 47 18 44 C24 48 22 54 19 57 Z" />
          <path d="M19 69 C13 67 13 60 19 57 C24 61 23 67 19 69 Z" />
          <path d="M22 80 C17 79 17 72 23 69 C27 74 25 79 22 80 Z" />
          <path d="M29 89 C24 90 23 83 29 80 C33 84 32 89 29 89 Z" />
          <path d="M38 96 C33 98 32 92 37 88 C41 91 41 96 38 96 Z" />
        </g>

        {/* Nhánh Phải */}
        <g fill={`url(#${idPrefix}-goldLight)`} stroke={`url(#${idPrefix}-goldDark)`} strokeWidth="0.4">
          <path d="M98 46 C104 43 106 36 99 34 C94 38 95 43 98 46 Z" />
          <path d="M101 57 C107 54 108 47 102 44 C96 48 98 54 101 57 Z" />
          <path d="M101 69 C107 67 107 60 101 57 C96 61 97 67 101 69 Z" />
          <path d="M98 80 C103 79 103 72 97 69 C93 74 95 79 98 80 Z" />
          <path d="M91 89 C96 90 97 83 91 80 C87 84 88 89 91 89 Z" />
          <path d="M82 96 C87 98 88 92 83 88 C79 91 79 96 82 96 Z" />
        </g>

        {/* 4. LÁ CHẮN AN NINH TỔ QUỐC (SHIELD CHÍNH) */}
        {/* Viền ngoài Lá chắn (Vàng dày viền kép) */}
        <path
          d="M60 18 C78 18 88 23 88 33 C88 64 77 82 60 95 C43 82 32 64 32 33 C32 23 42 18 60 18 Z"
          fill={`url(#${idPrefix}-goldPrimary)`}
          stroke={`url(#${idPrefix}-goldLight)`}
          strokeWidth="1.2"
        />

        {/* Viền rãnh nổi 3D */}
        <path
          d="M60 21.5 C75 21.5 84 25.5 84 34 C84 62 74 78 60 90 C46 78 36 62 36 34 C36 25.5 45 21.5 60 21.5 Z"
          fill={`url(#${idPrefix}-goldDark)`}
        />

        {/* Lòng Khiên Đỏ Rực Sang Trọng */}
        <path
          d="M60 23.5 C73.5 23.5 81.5 27 81.5 35 C81.5 60 72 75.5 60 86.5 C48 75.5 38.5 60 38.5 35 C38.5 27 46.5 23.5 60 23.5 Z"
          fill={`url(#${idPrefix}-redShield)`}
          stroke={`url(#${idPrefix}-goldLight)`}
          strokeWidth="0.8"
        />

        {/* 5. NGÔI SAO VÀNG 5 CÁNH TỎA SÁNG 3D TRUNG TÂM */}
        <g transform="translate(60, 52) scale(1.15)">
          {/* Cánh trên */}
          <polygon points="0,-18 0,0 -5.5,-4" fill="#FFF7A1" />
          <polygon points="0,-18 5.5,-4 0,0" fill="#E5A00D" />
          {/* Cánh phải trên */}
          <polygon points="17,-5.5 0,0 5.5,-4" fill="#FFF7A1" />
          <polygon points="17,-5.5 7,7 0,0" fill="#D4940C" />
          {/* Cánh phải dưới */}
          <polygon points="10.5,14.5 0,0 7,7" fill="#FFD700" />
          <polygon points="10.5,14.5 -0,9 0,0" fill="#9E6B00" />
          {/* Cánh trái dưới */}
          <polygon points="-10.5,14.5 0,0 -0,9" fill="#D4940C" />
          <polygon points="-10.5,14.5 -7,7 0,0" fill="#7A4F00" />
          {/* Cánh trái trên */}
          <polygon points="-17,-5.5 0,0 -7,7" fill="#FFD700" />
          <polygon points="-17,-5.5 -5.5,-4 0,0" fill="#FFE566" />
          {/* Tâm sao điểm nhấn sáng */}
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* 6. DẢI LỤA ĐỎ VIỀN VÀNG (CAND RIBBON DƯỚI ĐÁY) */}
        {/* Nếp gấp 2 cánh ribbon */}
        <path d="M26 95 L34 91 L35 101 L25 103 Z" fill="#58000C" stroke={`url(#${idPrefix}-goldPrimary)`} strokeWidth="0.5" />
        <path d="M94 95 L86 91 L85 101 L95 103 Z" fill="#58000C" stroke={`url(#${idPrefix}-goldPrimary)`} strokeWidth="0.5" />
        
        {/* Thân dải lụa chính uốn cong */}
        <path
          d="M32 94 C44 98 76 98 88 94 C89 99 87 104 88 105 C75 109 45 109 32 105 C33 102 31 97 32 94 Z"
          fill={`url(#${idPrefix}-redBanner)`}
          stroke={`url(#${idPrefix}-goldPrimary)`}
          strokeWidth="0.9"
        />

        {/* Chữ CAND hoặc Ngôi sao nhỏ trên dải lụa */}
        <text
          x="60"
          y="103"
          textAnchor="middle"
          fill={`url(#${idPrefix}-goldLight)`}
          fontSize="6.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2"
          filter={`url(#${idPrefix}-glow)`}
        >
          CAND
        </text>
      </g>
    </svg>
  )
}
