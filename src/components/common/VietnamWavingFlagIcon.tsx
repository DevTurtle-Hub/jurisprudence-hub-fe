import React from 'react'

interface VietnamWavingFlagIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number
}

export function VietnamWavingFlagIcon({ className = "h-12 w-12", size = 48, ...props }: VietnamWavingFlagIconProps) {
  const idPrefix = React.useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Gradient Cột Cờ Vàng Kim Loại 3D */}
        <linearGradient id={`${idPrefix}-goldPole`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF4A3" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#D4940C" />
          <stop offset="90%" stopColor="#8A5A00" />
          <stop offset="100%" stopColor="#5E3C00" />
        </linearGradient>

        {/* Gradient Đỉnh Cột Tròn Vàng 3D */}
        <radialGradient id={`${idPrefix}-goldSphere`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFF275" />
          <stop offset="55%" stopColor="#FFD700" />
          <stop offset="85%" stopColor="#B87D00" />
          <stop offset="100%" stopColor="#664100" />
        </radialGradient>

        {/* Gradient Vải Cờ Đỏ Uốn Lượn 3D (Hiệu ứng Nếp Gấp Sóng Vải) */}
        <linearGradient id={`${idPrefix}-flagWave`} x1="0%" y1="0%" x2="100%" y2="15%">
          <stop offset="0%" stopColor="#E61025" />
          <stop offset="20%" stopColor="#FF3347" />
          <stop offset="38%" stopColor="#B80014" />
          <stop offset="55%" stopColor="#FF2A3E" />
          <stop offset="72%" stopColor="#990010" />
          <stop offset="88%" stopColor="#FF384D" />
          <stop offset="100%" stopColor="#D10519" />
        </linearGradient>

        {/* Gradient Nếp Gập Phía Dưới Cờ */}
        <linearGradient id={`${idPrefix}-flagUnderfold`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5ECEC" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#D6C5C5" />
          <stop offset="100%" stopColor="#EDE0E0" />
        </linearGradient>

        {/* Gradient Ngôi Sao Vàng 3D */}
        <linearGradient id={`${idPrefix}-starGold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEE0" />
          <stop offset="30%" stopColor="#FFF200" />
          <stop offset="70%" stopColor="#FFBF00" />
          <stop offset="100%" stopColor="#D48800" />
        </linearGradient>

        {/* Đổ bóng thực tế */}
        <filter id={`${idPrefix}-flagShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>

        <filter id={`${idPrefix}-starGlow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFF275" floodOpacity="0.8" />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-flagShadow)`}>
        {/* 1. LỚP VẢI GẬP / PHẢN QUANG DƯỚI ĐÁY CỜ (NHƯ ẢNH MẪU) */}
        <path
          d="M 23 70 
             C 34 76, 48 64, 62 70 
             C 74 76, 84 66, 95 72 
             L 94 77 
             C 83 71, 73 81, 61 75 
             C 47 69, 33 81, 23 75 
             Z"
          fill={`url(#${idPrefix}-flagUnderfold)`}
          opacity="0.95"
        />

        {/* 2. THÂN LÁ CỜ ĐỎ UỐN LƯỢN CHÂN THỰC */}
        <path
          d="M 22 22 
             C 36 17, 48 30, 64 23 
             C 76 17, 85 24, 94 20 
             C 96 20, 97 22, 97 24
             L 95 68 
             C 84 62, 74 72, 62 66 
             C 48 60, 34 72, 22 66 
             Z"
          fill={`url(#${idPrefix}-flagWave)`}
        />

        {/* 3. LỚP PHỦ BÓNG & NẾP GẤP SÁNG TỐI 3D */}
        {/* Nếp lượn sóng 1: Vùng sáng đỉnh sóng trái */}
        <path
          d="M 22 22 C 32 18, 42 25, 46 27 L 46 68 C 42 66, 32 60, 22 66 Z"
          fill="white"
          opacity="0.12"
        />
        {/* Nếp lượn sóng 2: Vùng tối hốc sóng giữa */}
        <path
          d="M 46 27 C 52 30, 58 27, 64 23 L 62 66 C 58 69, 52 70, 46 68 Z"
          fill="black"
          opacity="0.22"
        />
        {/* Nếp lượn sóng 3: Vùng sáng đỉnh sóng phải */}
        <path
          d="M 64 23 C 74 18, 83 23, 94 20 L 95 68 C 84 69, 74 62, 62 66 Z"
          fill="white"
          opacity="0.15"
        />

        {/* 4. NGÔI SAO VÀNG 5 CÁNH UỐN THEO NẾP CỜ */}
        <g transform="translate(56, 44) rotate(-3) scale(1.05)" filter={`url(#${idPrefix}-starGlow)`}>
          {/* Cánh trên */}
          <polygon points="0,-15 0,0 -4.5,-3.5" fill="#FFFBE6" />
          <polygon points="0,-15 4.5,-3.5 0,0" fill="#E6A800" />
          {/* Cánh phải trên */}
          <polygon points="14.5,-4.5 0,0 4.5,-3.5" fill="#FFF7A1" />
          <polygon points="14.5,-4.5 6,6 0,0" fill="#D4940C" />
          {/* Cánh phải dưới */}
          <polygon points="9,12 0,0 6,6" fill="#FFD700" />
          <polygon points="9,12 0,7.5 0,0" fill="#A86E00" />
          {/* Cánh trái dưới */}
          <polygon points="-9,12 0,0 0,7.5" fill="#D4940C" />
          <polygon points="-9,12 -6,6 0,0" fill="#8A5A00" />
          {/* Cánh trái trên */}
          <polygon points="-14.5,-4.5 0,0 -6,6" fill="#FFD700" />
          <polygon points="-14.5,-4.5 -4.5,-3.5 0,0" fill="#FFF275" />
          {/* Điểm sáng trung tâm */}
          <circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
        </g>

        {/* 5. CỘT CỜ KIM LOẠI MẠ VÀNG 3D */}
        {/* Thân cột cờ */}
        <rect x="18" y="16" width="4.5" height="74" rx="2" fill={`url(#${idPrefix}-goldPole)`} />
        {/* Vòng giữ cờ trên */}
        <ellipse cx="20.25" cy="22" rx="3.5" ry="1.5" fill="#FFF4A3" stroke="#8A5A00" strokeWidth="0.4" />
        {/* Vòng giữ cờ dưới */}
        <ellipse cx="20.25" cy="66" rx="3.5" ry="1.5" fill="#FFF4A3" stroke="#8A5A00" strokeWidth="0.4" />
        {/* Chóp đỉnh cột hình cầu vàng bóng */}
        <circle cx="20.25" cy="13" r="5.5" fill={`url(#${idPrefix}-goldSphere)`} />
        <ellipse cx="18.5" cy="11.5" rx="1.8" ry="1.2" fill="#FFFFFF" opacity="0.85" />
        {/* Khớp nối dưới quả cầu */}
        <rect x="18.5" y="16" width="3.5" height="2" rx="0.5" fill="#B87D00" />
        {/* Chân đế cột cờ */}
        <ellipse cx="20.25" cy="90" rx="3.8" ry="1.8" fill={`url(#${idPrefix}-goldSphere)`} />
      </g>
    </svg>
  )
}
