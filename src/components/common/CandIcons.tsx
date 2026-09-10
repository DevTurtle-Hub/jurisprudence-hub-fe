import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: number
}

// 1. Huy hiệu Lá Chắn CAND (Khiên đỏ viền vàng kim 3D, bông lúa, bánh xe & ngôi sao vàng nổi khối có bóng đổ)
export function CandEmblemIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="shieldOuterGold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id="shieldRubyBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="45%" stopColor="#dc2626" />
          <stop offset="80%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#58000c" />
        </radialGradient>
        <linearGradient id="shieldGloss" x1="24" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="starFacetLight" x1="24" y1="12" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="starFacetDark" x1="24" y1="12" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* Vành khiên ngoài bằng vàng kim loại vát 3D */}
      <path 
        d="M24 3L40 9V22C40 32.5 33.2 41.8 24 45C14.8 41.8 8 32.5 8 22V9L24 3Z" 
        fill="url(#shieldOuterGold)" 
        stroke="#fef08a" 
        strokeWidth="0.8"
      />

      {/* Rãnh viền bóng tối tạo chiều sâu 3D */}
      <path 
        d="M24 4.8L38.2 10.2V22C38.2 31.5 32 40.5 24 43.5C16 40.5 9.8 31.5 9.8 22V10.2L24 4.8Z" 
        fill="#78350f" 
        opacity="0.6"
      />

      {/* Lòng khiên tráng men đỏ ruby sang trọng */}
      <path 
        d="M24 6L37 11V22C37 30.5 31.5 38.2 24 41C16.5 38.2 11 30.5 11 22V11L24 6Z" 
        fill="url(#shieldRubyBg)" 
      />

      {/* Hiệu ứng phản quang bóng kính cong trên bề mặt khiên */}
      <path 
        d="M24 6L37 11V18C28 17 18 20 11 22V11L24 6Z" 
        fill="url(#shieldGloss)" 
      />

      {/* Cành bông lúa vàng nổi khối hai bên */}
      <g stroke="url(#shieldOuterGold)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M14 28C14 23 16 18 19 15" />
        <path d="M34 28C34 23 32 18 29 15" />
      </g>
      <circle cx="15" cy="24" r="1.6" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="33" cy="24" r="1.6" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="17" cy="19" r="1.6" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="31" cy="19" r="1.6" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="20" cy="15" r="1.4" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="28" cy="15" r="1.4" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />

      {/* Bánh xe lịch sử ở chân khiên có gờ kim loại */}
      <circle cx="24" cy="34" r="4.8" fill="#991b1b" stroke="url(#shieldOuterGold)" strokeWidth="1.5" />
      <circle cx="24" cy="34" r="2.2" fill="#fef08a" stroke="#b45309" strokeWidth="0.5" />
      <circle cx="24" cy="34" r="0.8" fill="#78350f" />

      {/* Ngôi sao vàng 5 cánh vát khối 3D trung tâm */}
      <g>
        {/* Nửa sáng các cánh sao */}
        <polygon points="24,12 24,22 26.5,18" fill="url(#starFacetLight)" />
        <polygon points="33,18.5 24,22 28,22.5" fill="url(#starFacetLight)" />
        <polygon points="29.5,29 24,22 24,25.5" fill="url(#starFacetLight)" />
        <polygon points="18.5,29 24,22 20,22.5" fill="url(#starFacetLight)" />
        <polygon points="15,18.5 24,22 21.5,18" fill="url(#starFacetLight)" />

        {/* Nửa tối các cánh sao tạo chiều sâu 3D */}
        <polygon points="26.5,18 24,22 33,18.5" fill="url(#starFacetDark)" />
        <polygon points="28,22.5 24,22 29.5,29" fill="url(#starFacetDark)" />
        <polygon points="24,25.5 24,22 18.5,29" fill="url(#starFacetDark)" />
        <polygon points="20,22.5 24,22 15,18.5" fill="url(#starFacetDark)" />
        <polygon points="21.5,18 24,22 24,12" fill="url(#starFacetDark)" />

        {/* Đỉnh sao lóe sáng */}
        <circle cx="24" cy="22" r="0.8" fill="#ffffff" />
      </g>
    </svg>
  )
}

// 2. Biểu tượng Quốc Kỳ - Tổ Quốc (Cờ đỏ sao vàng ánh kim bay phấp phới)
export function VietnamFlagStarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(220,38,38,0.4)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="flagRed" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="goldStar" x1="24" y1="12" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="40%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="flagPole" x1="0" y1="0" x2="10" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
      </defs>
      {/* Cột cờ mạ vàng */}
      <rect x="5" y="4" width="3" height="40" rx="1.5" fill="url(#flagPole)" stroke="#fef08a" strokeWidth="0.5" />
      <circle cx="6.5" cy="4" r="2.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
      {/* Lá cờ đỏ mềm mại */}
      <path 
        d="M8 7C14 5 18 9 24 7C30 5 36 9 42 7V29C36 31 30 27 24 29C18 31 14 27 8 29V7Z" 
        fill="url(#flagRed)" 
        stroke="#b91c1c" 
        strokeWidth="1"
      />
      {/* Ngôi sao vàng 5 cánh ở tâm cờ */}
      <polygon 
        points="25,12 27.2,16.5 32,17 28.3,20.2 29.4,25 25,22.4 20.6,25 21.7,20.2 18,17 22.8,16.5" 
        fill="url(#goldStar)" 
        stroke="#fef08a" 
        strokeWidth="0.4"
      />
    </svg>
  )
}

// 3. Mũ Kê-pi Sĩ Quan CAND (Mũ sĩ quan màu xanh rêu / đen bóng với quân hiệu sao vàng)
export function PoliceKepiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(15,23,42,0.3)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="kepiOlive" x1="24" y1="10" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a1e" />
          <stop offset="50%" stopColor="#2d4f2d" />
          <stop offset="100%" stopColor="#142614" />
        </linearGradient>
        <linearGradient id="visorLeather" x1="24" y1="30" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="goldCord" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {/* Đỉnh chóp mũ (màu ô liu CAND) */}
      <path 
        d="M8 22C8 14 14 8 24 8C34 8 40 14 40 22C37 24 31 25 24 25C17 25 11 24 8 22Z" 
        fill="url(#kepiOlive)" 
        stroke="#365314" 
        strokeWidth="1"
      />
      {/* Thân mũ */}
      <path 
        d="M9 22L11 31C15 32.5 33 32.5 37 31L39 22C35 24 29 25 24 25C19 25 13 24 9 22Z" 
        fill="#142614" 
      />
      {/* Vành lưỡi trai đen bóng */}
      <path 
        d="M7 30C12 36 36 36 41 30C42 34 38 39 24 39C10 39 6 34 7 30Z" 
        fill="url(#visorLeather)" 
        stroke="#334155" 
        strokeWidth="0.8"
      />
      {/* Dây kết vàng sĩ quan */}
      <path 
        d="M9 29.5C14 32.5 34 32.5 39 29.5" 
        stroke="url(#goldCord)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Khuy vàng 2 bên */}
      <circle cx="9.5" cy="29" r="2" fill="#fde047" stroke="#854d0e" strokeWidth="0.5" />
      <circle cx="38.5" cy="29" r="2" fill="#fde047" stroke="#854d0e" strokeWidth="0.5" />
      {/* Quân hiệu CAND gắn trước trán */}
      <circle cx="24" cy="21" r="5" fill="#dc2626" stroke="#fde047" strokeWidth="1" />
      <polygon 
        points="24,18 25,20.5 27.5,20.5 25.5,22 26.2,24.5 24,23 21.8,24.5 22.5,22 20.5,20.5 23,20.5" 
        fill="#fde047" 
      />
    </svg>
  )
}

// 4. Cán Cân Công Lý & Pháp Chế CAND (Cán cân vàng kim sắc nét & thanh gươm chính trực)
export function JusticeScalesCandIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(202,138,4,0.35)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="goldScale" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      {/* Trụ đứng trung tâm */}
      <line x1="24" y1="6" x2="24" y2="42" stroke="url(#goldScale)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Chóp nhọn thanh gươm công lý */}
      <polygon points="24,4 21,9 27,9" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
      {/* Đòn cân ngang */}
      <line x1="8" y1="14" x2="40" y2="14" stroke="url(#goldScale)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="14" r="3" fill="#fde047" stroke="#854d0e" strokeWidth="1" />
      {/* Đĩa cân trái */}
      <line x1="10" y1="14" x2="5" y2="26" stroke="#ca8a04" strokeWidth="1" />
      <line x1="10" y1="14" x2="15" y2="26" stroke="#ca8a04" strokeWidth="1" />
      <path d="M4 26C4 30 16 30 16 26Z" fill="url(#goldScale)" stroke="#a16207" strokeWidth="1" />
      {/* Đĩa cân phải */}
      <line x1="38" y1="14" x2="33" y2="26" stroke="#ca8a04" strokeWidth="1" />
      <line x1="38" y1="14" x2="43" y2="26" stroke="#ca8a04" strokeWidth="1" />
      <path d="M32 26C32 30 44 30 44 26Z" fill="url(#goldScale)" stroke="#a16207" strokeWidth="1" />
      {/* Đế cân vững chãi */}
      <path d="M16 42H32C33 42 34 44 32 44H16C14 44 15 42 16 42Z" fill="url(#goldScale)" stroke="#854d0e" strokeWidth="1" />
      <circle cx="24" cy="38" r="2.5" fill="#fef08a" />
    </svg>
  )
}

// 5. Cuốn Sách Hiến Pháp & Pháp Luật CAND (Bìa đỏ quốc gia, dải lụa vàng & ngôi sao vàng 3D)
export function ConstitutionBookCandIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(185,28,28,0.35)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="bookCoverRed" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="60%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="goldEmboss" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      {/* Độ dày gáy sách */}
      <path d="M6 38V10C6 8 8 7 10 7H40V37H10C8 37 6 38 6 38Z" fill="#7f1d1d" />
      {/* Trang giấy trắng xếp lớp */}
      <path d="M10 39H41V42H10C7.8 42 6 40.2 6 38C6 39.5 7.5 41 9.5 41H41" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
      {/* Bìa sách chính màu đỏ thắm */}
      <path 
        d="M8 8H39C40.1 8 41 8.9 41 10V37C41 37 39 37 38 37H9C7.5 37 6 36 6 34.5V10C6 8.9 6.9 8 8 8Z" 
        fill="url(#bookCoverRed)" 
        stroke="url(#goldEmboss)" 
        strokeWidth="1.2"
      />
      {/* Khung viền chỉ vàng chạm khắc trên bìa sách */}
      <rect x="12" y="12" width="23" height="20" rx="2" stroke="url(#goldEmboss)" strokeWidth="1" strokeDasharray="1 0" />
      {/* Ngôi sao vàng Tổ quốc ở trung tâm bìa */}
      <polygon 
        points="23.5,16 25,19.5 28.8,19.8 25.9,22.4 26.8,26.2 23.5,24.1 20.2,26.2 21.1,22.4 18.2,19.8 22,19.5" 
        fill="url(#goldEmboss)" 
        stroke="#fef08a" 
        strokeWidth="0.4"
      />
      {/* Dải bookmark ruy-băng đỏ buông xuống */}
      <path d="M30 7V16L33 13.5L36 16V7H30Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    </svg>
  )
}

// 6. Thanh Bảo Kiếm & Lá Chắn Bảo Vệ Bình Yên (Thanh gươm lá chắn CAND)
export function SwordShieldPoliceIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(30,58,138,0.35)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="swordSteel" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="shieldBlue" x1="24" y1="12" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Thanh gươm đặt chéo phía sau */}
      <line x1="8" y1="8" x2="40" y2="40" stroke="url(#swordSteel)" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 7L12 12" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
      <circle cx="6" cy="6" r="2.5" fill="#fde047" stroke="#a16207" strokeWidth="0.5" />
      {/* Lá chắn ở trung tâm */}
      <path 
        d="M24 10L36 15V26C36 34 29.5 40.5 24 43C18.5 40.5 12 34 12 26V15L24 10Z" 
        fill="url(#shieldBlue)" 
        stroke="#fbbf24" 
        strokeWidth="1.8"
      />
      {/* Ngôi sao vàng bên trong khiên */}
      <polygon 
        points="24,18 25.8,22.5 30.5,22.8 26.9,25.8 28,30.5 24,28 20,30.5 21.1,25.8 17.5,22.8 22.2,22.5" 
        fill="#fde047" 
        stroke="#ca8a04" 
        strokeWidth="0.5"
      />
    </svg>
  )
}

// 7. Huân Chương Chiến Công & Danh Dự CAND (Nguyệt quế + Dải ruy băng 3 sọc vàng)
export function LaurelHonorMedalIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(202,138,4,0.4)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="ribbonGrad" x1="16" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="medalGold" x1="12" y1="16" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>
      {/* Cuống dải huân chương đỏ 3 sọc vàng */}
      <rect x="16" y="4" width="16" height="12" rx="1.5" fill="url(#ribbonGrad)" stroke="#b91c1c" strokeWidth="0.8" />
      <line x1="20" y1="4" x2="20" y2="16" stroke="#fde047" strokeWidth="1.2" />
      <line x1="24" y1="4" x2="24" y2="16" stroke="#fde047" strokeWidth="1.2" />
      <line x1="28" y1="4" x2="28" y2="16" stroke="#fde047" strokeWidth="1.2" />
      {/* Khoen nối kim loại */}
      <rect x="22" y="14" width="4" height="4" rx="1" fill="#fde047" stroke="#a16207" strokeWidth="0.5" />
      {/* Thân Huân chương tròn bao quanh bằng Vòng Nguyệt Quế */}
      <circle cx="24" cy="30" r="12" fill="url(#medalGold)" stroke="#fef08a" strokeWidth="1" />
      <circle cx="24" cy="30" r="9.5" fill="#991b1b" stroke="#fde047" strokeWidth="0.8" />
      {/* Ngôi sao vàng nổi 3D ở tâm huân chương */}
      <polygon 
        points="24,23 25.5,27 29.5,27.3 26.5,29.8 27.5,33.8 24,31.5 20.5,33.8 21.5,29.8 18.5,27.3 22.5,27" 
        fill="#fde047" 
        stroke="#fef08a" 
        strokeWidth="0.4"
      />
    </svg>
  )
}

// 8. Trụ Cột Pháp Chế & Học Viện CAND (Ngọn đuốc tri thức & Trụ cột công lý)
export function CandAcademyTorchIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_2px_4px_rgba(217,119,6,0.4)]", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="flameGrad" x1="24" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="torchBody" x1="16" y1="20" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      {/* Ngọn lửa tri thức bừng sáng */}
      <path 
        d="M24 4C24 4 29 10 27 15C31 11 31 16 29 19C33 19 33 24 24 24C15 24 15 19 19 19C17 16 17 11 21 15C19 10 24 4 24 4Z" 
        fill="url(#flameGrad)" 
      />
      {/* Đài đuốc vàng */}
      <path d="M16 22H32L29 27H19L16 22Z" fill="url(#torchBody)" stroke="#fef08a" strokeWidth="0.8" />
      {/* Cán đuốc */}
      <path d="M20 27H28L26 44H22L20 27Z" fill="url(#torchBody)" stroke="#a16207" strokeWidth="0.8" />
      {/* Vòng trang sách mở dưới chân đuốc */}
      <path d="M12 40C18 38 22 40 24 42C26 40 30 38 36 40V44C30 42 26 44 24 46C22 44 18 42 12 44V40Z" fill="#1e293b" stroke="#cbd5e1" strokeWidth="0.8" />
    </svg>
  )
}
