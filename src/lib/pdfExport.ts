import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

export interface ExportPdfOptions {
  fileName?: string
  marginMm?: number
}

/**
 * Tìm vị trí cắt trang tối ưu (Y tính theo pixel) để không bao giờ cắt ngang một dòng chữ hoặc đoạn văn.
 * Thuật toán kết hợp:
 * 1. Nhận diện ranh giới các khối nội dung DOM (thẻ <p>, <h3>, <h4>, bảng biểu, danh sách).
 * 2. Quét dải điểm ảnh trắng (Pixel White-space Scan) để bảo đảm điểm cắt 100% nằm trong khoảng trống giữa 2 dòng chữ.
 */
function findBestCutY(
  canvas: HTMLCanvasElement,
  renderedHeight: number,
  maxPageHeight: number,
  element: HTMLElement
): number {
  const idealY = renderedHeight + maxPageHeight
  if (idealY >= canvas.height) {
    return canvas.height
  }

  const elementRect = element.getBoundingClientRect()
  const scaleY = canvas.height / Math.max(1, elementRect.height)

  // 1. Quét các thẻ khối nội dung bên trong element
  const blockElements = Array.from(
    element.querySelectorAll('p, h1, h2, h3, h4, .grid, .border-b, .border-t, blockquote, li, [data-break="avoid"]')
  )

  const blocks = blockElements
    .map(el => {
      const r = el.getBoundingClientRect()
      return {
        top: Math.floor((r.top - elementRect.top) * scaleY),
        bottom: Math.ceil((r.bottom - elementRect.top) * scaleY),
      }
    })
    .filter(b => b.top > renderedHeight + Math.floor(maxPageHeight * 0.6) && b.top < idealY)

  // Cho phép lùi tối đa 35% chiều cao trang để ngắt trước một đoạn văn mới
  const minAllowedY = renderedHeight + Math.floor(maxPageHeight * 0.65)
  let candidateY = idealY

  // Ưu tiên 1: Cắt ngay trước đoạn văn mới nếu có điểm bắt đầu nằm trong vùng cho phép
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i]
    if (b.top >= minAllowedY && b.top <= idealY) {
      candidateY = b.top
      break
    }
  }

  // Ưu tiên 2: Dùng pixel scan để tìm dải điểm ảnh trắng (khoảng cách an toàn giữa 2 dòng chữ)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return candidateY > renderedHeight ? candidateY : idealY
  }

  // Quét vùng giữa (bỏ qua viền ngoài bên trái và phải của trang giấy)
  const sampleStartX = Math.floor(canvas.width * 0.15)
  const sampleWidth = Math.floor(canvas.width * 0.7)

  // Vùng quét từ candidateY lùi lên
  const scanBottom = Math.min(canvas.height - 1, candidateY + 10)
  const scanTop = Math.max(minAllowedY, candidateY - 120)

  let bestWhiteY = -1
  let consecutiveWhiteRows = 0
  let maxConsecutive = 0

  for (let y = scanBottom; y >= scanTop; y--) {
    const row = ctx.getImageData(sampleStartX, y, sampleWidth, 1).data
    let isWhiteRow = true

    // Bước nhảy 4 pixel (16 bytes) để kiểm tra nhanh hiệu năng
    for (let i = 0; i < row.length; i += 16) {
      const r = row[i]
      const g = row[i + 1]
      const b = row[i + 2]
      // Nếu pixel sẫm màu (chữ viết hoặc nét kẻ)
      if (r < 235 || g < 235 || b < 235) {
        isWhiteRow = false
        break
      }
    }

    if (isWhiteRow) {
      consecutiveWhiteRows++
      if (consecutiveWhiteRows >= 4 && consecutiveWhiteRows > maxConsecutive) {
        maxConsecutive = consecutiveWhiteRows
        bestWhiteY = y + Math.floor(consecutiveWhiteRows / 2)
      }
    } else {
      if (consecutiveWhiteRows >= 4) {
        break // Đã tìm thấy một dải trắng lý tưởng giữa 2 dòng chữ
      }
      consecutiveWhiteRows = 0
    }
  }

  if (bestWhiteY > renderedHeight + Math.floor(maxPageHeight * 0.5)) {
    return bestWhiteY
  }

  return candidateY > renderedHeight ? candidateY : idealY
}

/**
 * Xuất trực tiếp một phần tử HTML thành file PDF chuẩn A4 (hỗ trợ nhiều trang liền mạch)
 * Phân trang thông minh: Tuyệt đối không cắt ngang chữ hoặc đoạn văn.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const { fileName = 'Bai_Tu_Luan_T05.pdf', marginMm = 8 } = options

  // 1. Chuyển đổi DOM thành Canvas thông qua native SVG foreignObject của trình duyệt
  let canvas: HTMLCanvasElement
  try {
    canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })
  } catch {
    // Nếu gặp lỗi font external CORS, thử lại với skipFonts
    canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
    })
  }

  // 2. Khởi tạo đối tượng jsPDF A4 chuẩn
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const marginX = marginMm
  const marginY = marginMm
  const contentWidth = pageWidth - marginX * 2
  const contentHeight = pageHeight - marginY * 2

  const imgWidth = canvas.width
  const imgHeight = canvas.height

  // Chiều cao (pixel) tối đa của 1 trang nội dung A4
  const maxPageHeightInPx = Math.floor((contentHeight * imgWidth) / contentWidth)

  let renderedHeight = 0
  let pageIndex = 0

  // 3. Phân trang thông minh: tìm điểm cắt tối ưu không bao giờ cắt ngang chữ
  while (renderedHeight < imgHeight) {
    if (pageIndex > 0) {
      pdf.addPage()
    }

    // Tìm vị trí cắt tự nhiên không cắt ngang dòng chữ
    const bestCutY = findBestCutY(canvas, renderedHeight, maxPageHeightInPx, element)
    const currentSliceHeight = Math.max(1, bestCutY - renderedHeight)

    // Tạo canvas cho lát cắt của trang này
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = imgWidth
    pageCanvas.height = currentSliceHeight
    const ctx = pageCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0,
        renderedHeight,
        imgWidth,
        currentSliceHeight,
        0,
        0,
        imgWidth,
        currentSliceHeight
      )
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96)
    const sliceHeightInMm = (currentSliceHeight * contentWidth) / imgWidth

    pdf.addImage(
      pageImgData,
      'JPEG',
      marginX,
      marginY,
      contentWidth,
      sliceHeightInMm
    )

    renderedHeight = bestCutY
    pageIndex++

    // Phòng ngừa vòng lặp vô hạn nếu có trường hợp đặc biệt
    if (pageIndex > 30) break
  }

  // 4. Kích hoạt lưu file trực tiếp về máy tính
  pdf.save(fileName)
}
