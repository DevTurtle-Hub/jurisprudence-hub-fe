import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  Layers,
  BookOpen,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  Bookmark,
  BookmarkCheck,
  Loader2,
  FileText,
  PenTool,
  HelpCircle,
  Check,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { questionBankApi } from '@/services/questionBankApi'
import type { QuestionBankResponse } from '@/types/questionBank'
import { toast } from 'sonner'

// Các phân loại đề ôn luyện:
// ALL: Tất cả câu hỏi
// MC_CHOICE: Trắc nghiệm A B C D chuẩn
// MC_SCENARIO: Trắc nghiệm tình huống nghiệp vụ
// MC_FILL: Trắc nghiệm điền đáp án
// ESSAY: Tự luận & Án lệ
export type QuizQuestionTypeFilter = 'ALL' | 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY'

// Kiểu dữ liệu câu hỏi ôn luyện đồng nhất
interface QuizQuestionItem {
  id: string | number
  question: string
  title?: string
  category?: string
  questionType: 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY'
  options: string[]
  correctAnswer: number
  textAnswer?: string
  sampleEssay?: string
  explanation?: string
  legalReference?: string
}

// Danh sách câu hỏi dự phòng (Fallback) khi chưa tải hoặc ngân hàng câu hỏi trống
const FALLBACK_QUESTIONS: QuizQuestionItem[] = [
  {
    "id": "mc-25624a860d",
    "title": "Câu 1: Bản chất Nhà nước",
    "category": "Bản chất Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Hoạt động nào sau đây thể hiện bản chất giai cấp của nhà nước?",
    "options": [
      "Phát triển văn hóa, xã hội.",
      "Phát triển khoa học, công nghệ.",
      "Bảo vệ giai cấp bị trị.",
      "Bảo vệ giai cấp thống trị."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-637c4daad6",
    "title": "Câu 2: Chức năng Nhà nước",
    "category": "Chức năng Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Việc nhà nước mở rộng chương trình hỗ trợ hộ nghèo và tạo việc làm cho người dân thuộc chức năng nào sau đây của nhà nước?",
    "options": [
      "Chức năng đối nội.",
      "Chức năng đối ngoại.",
      "Chức năng bảo vệ Tổ quốc.",
      "Chức năng quốc phòng."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-8220f3867f",
    "title": "Câu 3: Đặc trưng Pháp luật",
    "category": "Đặc trưng Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Thuộc tính nào sau đây không là đặc trưng của pháp luật?",
    "options": [
      "Tính quy phạm phổ biến.",
      "Tính tùy nghi về hình thức.",
      "Tính hệ thống.",
      "Tính quyền lực nhà nước."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-0957546770",
    "title": "Câu 4: Nguồn Pháp luật",
    "category": "Nguồn Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nguồn của pháp luật được hiểu là",
    "options": [
      "ý kiến đóng góp của các tổ chức, cá nhân về các vấn đề kinh tế, văn hóa, xã hội.",
      "hình thức chứa đựng và thể hiện các quy phạm pháp luật do nhà nước ban hành hoặc thừa nhận.",
      "tất cả nguyên tắc đạo đức được truyền miệng qua nhiều thế hệ.",
      "nơi lưu trữ văn bản, tài liệu trong các thư viện."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-db8668007a",
    "title": "Câu 5: Quan hệ Pháp luật",
    "category": "Quan hệ Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nghĩa vụ chủ thể trong nội dung của quan hệ pháp luật được hiểu là",
    "options": [
      "cách xử sự mang tính tùy nghi thực hiện theo ý muốn chủ quan của chủ thể.",
      "cách xử sự bắt buộc mà nhà nước yêu cầu chủ thể phải thực hiện.",
      "quyền yêu cầu của cơ quan hành chính nhà nước với cơ quan lập pháp.",
      "sự tự giác thực hiện của chủ thể mà không kèm theo chế tài."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-fb25a1da45",
    "title": "Câu 6: Thực hiện Pháp luật",
    "category": "Thực hiện Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Hình thức thực hiện pháp luật nào đòi hỏi các chủ thể pháp luật phải kiềm chế không thực hiện các hành vi bị pháp luật cấm?",
    "options": [
      "Sử dụng pháp luật.",
      "Thi hành pháp luật.",
      "Tuân thủ pháp luật.",
      "Áp dụng pháp luật."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-9bd4d4084f",
    "title": "Câu 7: Hình thức Áp dụng Pháp luật",
    "category": "Hình thức Áp dụng Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nhận định nào sau đây là đúng?",
    "options": [
      "Sử dụng pháp luật mang tính bắt buộc, áp dụng pháp luật mang tính tùy nghi.",
      "Sử dụng pháp luật do cá nhân thực hiện, áp dụng pháp luật do tổ chức thực hiện.",
      "Sử dụng pháp luật là quyền lựa chọn hành vi pháp lý, áp dụng pháp luật là hoạt động nhân danh nhà nước ra quyết định pháp lý cá biệt.",
      "Sử dụng pháp luật do tổ chức thực hiện, áp dụng pháp luật do cá nhân có thẩm quyền thực hiện mang tính sáng tạo và linh hoạt."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-b64dd9da16",
    "title": "Câu 8: Vi phạm Pháp luật",
    "category": "Vi phạm Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Yếu tố nào sau đây thuộc mặt khách quan của cấu thành vi phạm pháp luật?",
    "options": [
      "Động cơ, mục đích sai trái thúc đẩy chủ thể thực hiện hành vi vi phạm pháp luật.",
      "Lỗi cố ý trực tiếp, lỗi cố ý gián tiếp, lỗi vô ý do cẩu thả, lỗi vô ý vì quá tự tin.",
      "Các quan hệ xã hội được pháp luật bảo vệ bị hành vi trái pháp luật xâm hại.",
      "Hành vi trái pháp luật, hậu quả thiệt hại cho xã hội do hành vi trái pháp luật gây ra."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-91f2b1a324",
    "title": "Câu 9: Nguồn gốc Nhà nước",
    "category": "Nguồn gốc Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin, nhà nước ra đời do nguyên nhân nào sau đây?",
    "options": [
      "Do nhu cầu của số đông người trong xã hội.",
      "Do chiến tranh giữa các bộ lạc.",
      "Do thỏa thuận của các thành viên trong xã hội.",
      "Do mâu thuẫn giai cấp đến mức không thể điều hòa được."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-cb20b4be76",
    "title": "Câu 10: Bản chất & Tính xã hội",
    "category": "Bản chất & Tính xã hội",
    "questionType": "MC_CHOICE",
    "question": "Tính xã hội của nhà nước được hiểu là",
    "options": [
      "một thuộc tính không có ở nhà nước tư sản.",
      "một thuộc tính khách quan, phổ biến của mọi nhà nước.",
      "một thuộc tính chỉ có ở nhà nước xã hội chủ nghĩa.",
      "một thuộc tính chỉ có ở nhà nước phong kiến."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-458a48c864",
    "title": "Câu 11: Đặc trưng quyền lực Nhà nước",
    "category": "Đặc trưng quyền lực Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Khác với các tổ chức xã hội, nhà nước có",
    "options": [
      "chủ quyền quốc gia.",
      "quyền lực hòa nhập với dân cư.",
      "điều lệ riêng.",
      "nguồn tài chính phụ thuộc."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-030a9ffb1a",
    "title": "Câu 12: Bộ máy Nhà nước CHXHCN Việt Nam",
    "category": "Bộ máy Nhà nước CHXHCN Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Hiện nay, cơ quan nào sau đây thuộc bộ máy nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam?",
    "options": [
      "Hội đồng bầu cử quốc gia.",
      "Đảng Cộng sản Việt Nam.",
      "Mặt trận Tổ quốc Việt Nam.",
      "Hội Liên hiệp Phụ nữ Việt Nam."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-569dbea429",
    "title": "Câu 13: Bộ máy Nhà nước CHXHCN Việt Nam",
    "category": "Bộ máy Nhà nước CHXHCN Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Nhận định nào sau đây là sai về Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam?",
    "options": [
      "Nhà nước có một hệ thống pháp luật dân chủ, tiến bộ, phù hợp và khả thi.",
      "Nhà nước được tổ chức và hoạt động theo cơ chế phân chia quyền lực.",
      "Nhà nước đảm bảo vị trí tối thượng của pháp luật trong đời sống xã hội.",
      "Nhà nước được đặt dưới sự lãnh đạo của Đảng Cộng sản Việt Nam."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-e44c3ea22e",
    "title": "Câu 14: Bản chất Pháp luật",
    "category": "Bản chất Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nhận định nào sau đây là đúng?",
    "options": [
      "Pháp luật vừa mang tính giai cấp, vừa mang tính xã hội.",
      "Pháp luật không mang tính giai cấp thuần túy; hoàn toàn tách rời, đối kháng với các lợi ích chung của xã hội.",
      "Trong xã hội hiện đại, tính xã hội của pháp luật hoàn toàn triệt tiêu và thay thế tính giai cấp của pháp luật.",
      "Tính giai cấp và tính xã hội là hai thuộc tính hoàn toàn độc lập với nhau."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-3caf2272c1",
    "title": "Câu 15: Hình thức Pháp luật",
    "category": "Hình thức Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Phương thức thể hiện và tồn tại của pháp luật là",
    "options": [
      "hình thức pháp luật.",
      "công cụ pháp luật.",
      "cấu trúc pháp luật.",
      "bản chất pháp luật."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-9e345518b4",
    "title": "Câu 16: Quy phạm Pháp luật",
    "category": "Quy phạm Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Bộ phận nào trong cơ cấu của quy phạm pháp luật nêu lên cách xử sự mà chủ thể được làm, phải làm hoặc không được làm trong hoàn cảnh cụ thể?",
    "options": [
      "Giả định.",
      "Quy định.",
      "Chế tài.",
      "Biện pháp áp dụng."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-924b4f3f15",
    "title": "Câu 17: Ý thức Pháp luật",
    "category": "Ý thức Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Ý thức pháp luật được hiểu là",
    "options": [
      "các quy định pháp luật do nhà nước đặt ra để định hướng hành vi của các tổ chức, cá nhân.",
      "hành vi của các tổ chức, cá nhân về quan điểm, chính sách của nhà nước.",
      "những học thuyết, tư tưởng của nhà nước đánh giá hành vi xử sự của tổ chức, cá nhân.",
      "những học thuyết, tư tưởng, quan điểm của con người đối với pháp luật."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-5d4cafafdb",
    "title": "Câu 18: Thực hiện Pháp luật",
    "category": "Thực hiện Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Trong các hành vi sau đây, hành vi nào thuộc hình thức thi hành pháp luật?",
    "options": [
      "Công dân tự do lựa chọn ngành nghề kinh doanh theo đúng quy định pháp luật.",
      "Công dân thực hiện nghĩa vụ đóng thuế theo quy định.",
      "Người điều khiển xe ô tô không uống rượu bia khi lái xe.",
      "Cảnh sát giao thông xử phạt người điều khiển xe gắn máy không đội mũ bảo hiểm."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-ede3cc2d06",
    "title": "Câu 19: Áp dụng Pháp luật",
    "category": "Áp dụng Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Trường hợp nào sau đây cần áp dụng pháp luật?",
    "options": [
      "Khi người dân tìm hiểu pháp luật qua sách báo.",
      "Khi cá nhân tự nguyện thực hiện quyền của mình.",
      "Khi giải quyết tranh chấp, xử lý vi phạm pháp luật.",
      "Khi các tổ chức tự đưa ra các nội quy nội bộ."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-acd35e4eb3",
    "title": "Câu 20: Hệ thống Pháp luật Việt Nam",
    "category": "Hệ thống Pháp luật Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Việt Nam không có ngành luật nào sau đây?",
    "options": [
      "Ngành luật hành chính.",
      "Ngành luật dân sự.",
      "Ngành luật tín dụng.",
      "Ngành luật tố tụng hình sự."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-64a609c704",
    "title": "Câu 21: Nguồn gốc Nhà nước",
    "category": "Nguồn gốc Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Quan điểm cho rằng, nhà nước hình thành do Thượng đế trao quyền cho người cai trị thuộc",
    "options": [
      "thuyết khế ước xã hội.",
      "thuyết thần học.",
      "thuyết bạo lực.",
      "học thuyết Mác - Lênin."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-5447dcecba",
    "title": "Câu 22: Bản chất giai cấp của Nhà nước",
    "category": "Bản chất giai cấp của Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Khi ban hành chính sách thuế, nhà nước ưu tiên bảo vệ lợi ích của nhóm nắm quyền lực kinh tế, chính trị. Điều này phản ánh bản chất nào của nhà nước?",
    "options": [
      "Tính xã hội.",
      "Tính giai cấp.",
      "Tính dân chủ.",
      "Tính pháp quyền."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-3bec9419ad",
    "title": "Câu 23: Chủ quyền quốc gia",
    "category": "Chủ quyền quốc gia",
    "questionType": "MC_CHOICE",
    "question": "Nhà nước ký hợp đồng thương mại với quốc gia khác và tự quyết định chính sách đối ngoại. Đây là biểu hiện của",
    "options": [
      "chủ quyền quốc gia.",
      "quản lý văn hóa, xã hội.",
      "quyền lực tư pháp.",
      "quyền lực lập pháp."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-070c4f4508",
    "title": "Câu 24: Chức năng Nhà nước",
    "category": "Chức năng Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Mục đích chính của chức năng đối nội của nhà nước là gì?",
    "options": [
      "Quản lý, phát triển đời sống xã hội.",
      "Bảo vệ chủ quyền quốc gia.",
      "Thiết lập quan hệ ngoại giao.",
      "Kí kết điều ước quốc tế."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-357eaea99b",
    "title": "Câu 25: Hình thức Dân chủ",
    "category": "Hình thức Dân chủ",
    "questionType": "MC_CHOICE",
    "question": "Theo Hiến pháp năm 2013 (sửa đổi, bổ sung năm 2025), nhân dân thực hiện quyền lực nhà nước bằng hình thức nào sau đây?",
    "options": [
      "Dân chủ đại diện, dân chủ hình thức.",
      "Dân chủ trực tiếp, dân chủ nhân dân.",
      "Dân biết, dân làm, dân kiểm tra, dân giám sát, dân thụ hưởng.",
      "Dân chủ trực tiếp, dân chủ đại diện."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-23de95091d",
    "title": "Câu 26: Cơ quan Hành chính Nhà nước",
    "category": "Cơ quan Hành chính Nhà nước",
    "questionType": "MC_CHOICE",
    "question": "Cơ quan hành chính nhà nước ở Việt Nam gồm những cơ quan nào?",
    "options": [
      "Chính phủ, các Bộ, cơ quan ngang Bộ, Hội đồng nhân dân các cấp.",
      "Chính phủ, Ủy ban nhân dân các cấp, Hội đồng nhân dân các cấp.",
      "Chính phủ, các Bộ, cơ quan ngang Bộ, Ủy ban nhân dân các cấp.",
      "Các Bộ, cơ quan ngang Bộ, Hội đồng nhân dân các cấp, Ủy ban nhân dân các cấp."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-3e1b921838",
    "title": "Câu 27: Nhà nước Pháp quyền XHCN",
    "category": "Nhà nước Pháp quyền XHCN",
    "questionType": "MC_CHOICE",
    "question": "Khi nói về Nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam, khẳng định nào sau đây sai?",
    "options": [
      "Nhà nước được tổ chức và hoạt động trên cơ sở chủ quyền của nhân dân.",
      "Nhà nước thừa nhận, tôn trọng và bảo vệ quyền con người, quyền công dân.",
      "Nhà nước có pháp luật chiếm vị trí tối thượng trong đời sống nhà nước và xã hội.",
      "Nhà nước bảo đảm phân chia, kiềm chế, đối trọng giữa các nhánh quyền lực."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-e8b22c5251",
    "title": "Câu 28: Nguyên tắc Pháp quyền",
    "category": "Nguyên tắc Pháp quyền",
    "questionType": "MC_CHOICE",
    "question": "Nội dung nào sau đây thể hiện nguyên tắc pháp quyền trong xây dựng và hoàn thiện Nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam hiện nay?",
    "options": [
      "Mọi cơ quan, tổ chức, cá nhân chỉ được làm những gì mà pháp luật cho phép.",
      "Cơ quan tư pháp có thể hoạt động độc lập với pháp luật nếu vì mục tiêu chính trị.",
      "Quyền lực nhà nước chỉ cần phục tùng mệnh lệnh của cơ quan hành pháp.",
      "Quyền lực nhà nước phải được thực hiện trong khuôn khổ Hiến pháp và pháp luật."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-c72c9b241f",
    "title": "Câu 29: Bản chất Pháp luật Việt Nam",
    "category": "Bản chất Pháp luật Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Đặc điểm nào sau đây không phản ánh bản chất pháp luật của Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam?",
    "options": [
      "Có tính nhân dân, tính xã hội rộng lớn.",
      "Thể hiện ý chí nhà nước của giai cấp công nhân, nhân dân lao động.",
      "Phụ thuộc hoàn toàn nền kinh tế thị trường.",
      "Có quan hệ mật thiết với đường lối của Đảng Cộng sản Việt Nam."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-b69949c71e",
    "title": "Câu 30: Thuộc tính Pháp luật",
    "category": "Thuộc tính Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Quy định tại Điều 29 Hiến pháp năm 2013 (sửa đổi, bổ sung năm 2025): “Công dân đủ 18 tuổi trở lên có quyền biểu quyết khi nhà nước tổ chức trưng cầu ý dân” thể hiện rõ nhất đặc trưng nào của pháp luật?",
    "options": [
      "Tính quy phạm phổ biến.",
      "Tính cưỡng chế nhà nước.",
      "Tính quy phạm bắt buộc.",
      "Tính nghĩa vụ nhà nước."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-3dce8bc1f8",
    "title": "Câu 31: Mối quan hệ Pháp luật và Tập quán",
    "category": "Mối quan hệ Pháp luật và Tập quán",
    "questionType": "MC_CHOICE",
    "question": "Một địa phương có tập quán tảo hôn nhưng chính quyền yêu cầu chấm dứt theo quy định pháp luật. Điều này cho thấy",
    "options": [
      "tập quán được ưu tiên áp dụng.",
      "pháp luật loại bỏ tập quán lạc hậu.",
      "tập quán có giá trị cao hơn pháp luật.",
      "pháp luật phải theo tập quán."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-7dc40439c5",
    "title": "Câu 32: Mối quan hệ Pháp luật và Kinh tế",
    "category": "Mối quan hệ Pháp luật và Kinh tế",
    "questionType": "MC_CHOICE",
    "question": "Trong mối quan hệ giữa pháp luật và kinh tế thì yếu tố nào quyết định yếu tố nào?",
    "options": [
      "Kinh tế và pháp luật tác động lẫn nhau.",
      "Kinh tế quyết định pháp luật.",
      "Pháp luật quyết định kinh tế.",
      "Kinh tế và pháp luật đều giữ vai trò quyết định."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-a2773c03a5",
    "title": "Câu 33: Vai trò Pháp luật XHCN",
    "category": "Vai trò Pháp luật XHCN",
    "questionType": "MC_CHOICE",
    "question": "Khi nói về vai trò của pháp luật Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam, nhận định nào sau đây là sai?",
    "options": [
      "Pháp luật là phương tiện để duy trì bảo vệ trật tự xã hội.",
      "Pháp luật là phương tiện để thể chế hóa đường lối của Đảng Cộng sản Việt Nam.",
      "Pháp luật là phương tiện bảo vệ quyền con người, quyền công dân.",
      "Pháp luật là phương tiện bảo vệ thiểu số giai cấp cầm quyền."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-67524c5473",
    "title": "Câu 34: Án lệ trong Pháp luật Việt Nam",
    "category": "Án lệ trong Pháp luật Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Cơ quan nào ở Việt Nam được phép ban hành án lệ?",
    "options": [
      "Quốc hội.",
      "Công an.",
      "Viện kiểm sát.",
      "Tòa án."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-7b21aa9479",
    "title": "Câu 35: Nguồn Pháp luật Việt Nam",
    "category": "Nguồn Pháp luật Việt Nam",
    "questionType": "MC_CHOICE",
    "question": "Trong các tài liệu sau, tài liệu nào là nguồn của pháp luật Việt Nam?",
    "options": [
      "Giáo trình Lý luận nhà nước và pháp luật của các cơ sở giáo dục đại học.",
      "Công văn hướng dẫn nghiệp vụ của cơ quan hành chính nhà nước.",
      "Nghị quyết của Hội đồng thẩm phán Tòa án nhân dân tối cao.",
      "Bài viết của chuyên gia đăng trên kỷ yếu khoa học."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-fc67000841",
    "title": "Câu 36: Cơ cấu Quy phạm Pháp luật",
    "category": "Cơ cấu Quy phạm Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Điều 34 Hiến pháp năm 2013 (sửa đổi, bổ sung năm 2025) quy định: “Công dân có quyền được bảo đảm an sinh xã hội”. Trong quy phạm pháp luật trên bao gồm những bộ phận nào?",
    "options": [
      "Giả định, quy định, chế tài.",
      "Giả định, quy định.",
      "Quy định, chế tài.",
      "Giả định, chế tài."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-88d328f2f3",
    "title": "Câu 37: Điều luật & Quy phạm Pháp luật",
    "category": "Điều luật & Quy phạm Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nhận định nào sau đây là đúng?",
    "options": [
      "Điều luật và quy phạm pháp luật là hai khái niệm đồng nhất.",
      "Mọi quy phạm pháp luật đều có đầy đủ ba bộ phận.",
      "Điều luật là hình thức thể hiện quy phạm pháp luật.",
      "Một điều luật chỉ có một quy phạm pháp luật."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-d3a1dbcabe",
    "title": "Câu 38: Căn cứ phát sinh Quan hệ Pháp luật",
    "category": "Căn cứ phát sinh Quan hệ Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Điều kiện làm phát sinh quan hệ pháp luật bao gồm?",
    "options": [
      "Chủ thể có năng lực chủ thể, khách thể, nội dung quan hệ pháp luật.",
      "Chủ thể có năng lực chủ thể, quy phạm pháp luật, chế tài.",
      "Quy phạm pháp luật, chủ thể có năng lực chủ thể, trách nhiệm pháp lý.",
      "Chủ thể có năng lực chủ thể, quy phạm pháp luật, sự kiện pháp lý."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-5c0b88cd57",
    "title": "Câu 39: Ý thức Pháp luật & Văn hóa Pháp lý",
    "category": "Ý thức Pháp luật & Văn hóa Pháp lý",
    "questionType": "MC_CHOICE",
    "question": "Anh A tự giác đội mũ bảo hiểm khi đi xe mô tô dù không có cảnh sát giao thông kiểm tra. Hành vi của anh A phản ánh rõ nét yếu tố nào?",
    "options": [
      "Năng lực pháp luật.",
      "Ý thức pháp luật.",
      "Quan hệ pháp luật.",
      "Trách nhiệm pháp lý."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-09b7287c2f",
    "title": "Câu 40: Giải thích Pháp luật",
    "category": "Giải thích Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Nhận định nào là sai về giải thích pháp luật không chính thức?",
    "options": [
      "Được thực hiện bởi các cá nhân, tổ chức không có thẩm quyền giải thích pháp luật.",
      "Lời giải thích được trình bày dưới dạng văn bản hoặc lời nói.",
      "Có hiệu lực bắt buộc đối với mọi đối tượng, chủ thể trong xã hội.",
      "Thường xuất hiện trong quá trình nghiên cứu, giảng dạy, hoặc tuyên truyền pháp luật."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-f482e3c265",
    "title": "Câu 41: Sự kiện Pháp lý",
    "category": "Sự kiện Pháp lý",
    "questionType": "MC_CHOICE",
    "question": "Anh K ký hợp đồng thuê nhà của ông H. Sự kiện nào dưới đây làm phát sinh quan hệ pháp luật giữa anh K và ông H?",
    "options": [
      "Anh K chuyển đồ vào nhà thuê.",
      "Anh K và ông H ký hợp đồng thuê nhà.",
      "Ông H xây dựng căn nhà.",
      "Anh K đăng ký tạm trú."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-9c84cde0b7",
    "title": "Câu 42: Tuân thủ Pháp luật",
    "category": "Tuân thủ Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Anh M không uống rượu bia khi lái xe, anh M thực hiện pháp luật bằng hình thức",
    "options": [
      "áp dụng pháp luật.",
      "sử dụng pháp luật.",
      "tuân thủ pháp luật.",
      "thi hành pháp luật."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-90e83e83c7",
    "title": "Câu 43: Sử dụng Pháp luật",
    "category": "Sử dụng Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Chị H nộp hồ sơ đề nghị cơ quan có thẩm quyền cấp hộ chiếu để phục vụ nhu cầu du lịch nước ngoài. Hành vi của chị H là",
    "options": [
      "sử dụng pháp luật.",
      "tuân thủ pháp luật.",
      "thi hành pháp luật.",
      "áp dụng pháp luật."
    ],
    "correctAnswer": 0,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-8299731c1e",
    "title": "Câu 44: Áp dụng Pháp luật",
    "category": "Áp dụng Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Hành vi nào dưới đây là áp dụng pháp luật?",
    "options": [
      "Nhà trường tổ chức tuyên truyền pháp luật cho học sinh.",
      "Tòa án tuyên phạt bị cáo 5 năm tù.",
      "Học sinh tự giác chấp hành kỉ luật trong trường học.",
      "Công dân nộp thuế thu nhập cá nhân đúng hạn."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-cd8a9eb018",
    "title": "Câu 45: Cấu thành Vi phạm Pháp luật",
    "category": "Cấu thành Vi phạm Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "N (16 tuổi) tự ý điều khiển xe mô tô của gia đình đến trường học. Trên đường đi, N điều khiển xe lạng lách và vượt đèn đỏ. Nhận định nào sau đây là đúng?",
    "options": [
      "N không có năng lực trách nhiệm pháp lý vì N chưa đủ 18 tuổi.",
      "N không có lỗi vì chưa gây ra thiệt hại gì.",
      "Hành vi của N là hành vi trái pháp luật, có lỗi.",
      "Hành vi của N không phải là hành vi nguy hiểm cho xã hội."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-bc06d6b44b",
    "title": "Câu 46: Trách nhiệm Pháp lý",
    "category": "Trách nhiệm Pháp lý",
    "questionType": "MC_CHOICE",
    "question": "Trách nhiệm pháp lý là",
    "options": [
      "nghĩa vụ của các chủ thể tham gia vào quan hệ xã hội.",
      "hậu quả bất lợi mà cá nhân, tổ chức phải gánh chịu khi vi phạm pháp luật.",
      "chế tài của quy phạm pháp luật.",
      "lời xin lỗi khi gây thiệt hại cho người khác."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-60207a8d0b",
    "title": "Câu 47: Hệ thống Pháp luật",
    "category": "Hệ thống Pháp luật",
    "questionType": "MC_CHOICE",
    "question": "Yếu tố nào sau đây không là bộ phận cấu thành của hệ thống pháp luật?",
    "options": [
      "Văn bản quy phạm pháp luật.",
      "Văn bản áp dụng pháp luật.",
      "Ngành luật.",
      "Hiến pháp."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-c34f5dd233",
    "title": "Câu 48: Nghị quyết 66-NQ/TW & Cải cách Thể chế",
    "category": "Nghị quyết 66-NQ/TW & Cải cách Thể chế",
    "questionType": "MC_CHOICE",
    "question": "Theo Nghị quyết số 66-NQ/TW ngày 30/4/2025 của Bộ Chính trị về đổi mới công tác xây dựng và thi hành pháp luật đáp ứng yêu cầu phát triển đất nước trong kỷ nguyên mới, mục tiêu đến năm 2030, Việt Nam có một hệ thống pháp luật",
    "options": [
      "đồng bộ làm cơ sở pháp lý cho hoạt động của bộ máy nhà nước theo mô hình chính quyền 3 cấp.",
      "dân chủ, công bằng, đồng bộ, thống nhất, công khai, minh bạch, khả thi.",
      "cơ bản hoàn thành việc tháo gỡ những “điểm nghẽn” do quy định pháp luật.",
      "chất lượng, hiện đại, tiệm cận chuẩn mực, thông lệ quốc tế tiên tiến và phù hợp với thực tiễn đất nước. Đọc tình huống sau đây và trả lời các câu từ 49 đến 51. Anh M ký hợp đồng mua bán một chiếc máy tính của chị N với giá tiền là 30 triệu đồng và anh M phải thanh toán đủ tiền vào ngày 01/3/2026, chị N phải bàn giao chiếc máy tính vào ngày 05/3/2026. Sau đó, anh M đã thực hiện thanh toán đủ số tiền, đúng thời hạn nhưng chị N không bàn giao chiếc máy tính như cam kết."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-ba8fe174d7",
    "title": "Câu 49: Tình huống Hợp đồng Dân sự",
    "category": "Tình huống Hợp đồng Dân sự",
    "questionType": "MC_SCENARIO",
    "question": "Đọc tình huống: Anh M ký hợp đồng mua bán một chiếc máy tính của chị N với giá 30 triệu đồng, thanh toán đủ ngày 01/3/2026, giao máy ngày 05/3/2026. Anh M đã thanh toán đủ đúng hẹn nhưng chị N không bàn giao máy.\n\nCâu hỏi: Trong tình huống trên, quan hệ pháp luật về hợp đồng mua bán giữa anh M và chị N phát sinh kể từ thời điểm nào?",
    "options": [
      "Việc anh M thanh toán đầy đủ tiền mua chiếc máy tính của chị N.",
      "Anh M soạn thảo hợp đồng mua chiếc máy tính với chị N.",
      "Việc ký kết hợp đồng mua bán chiếc máy tính giữa anh M và chị N.",
      "Chị N không bàn giao chiếc máy tính cho anh M."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-33813214b4",
    "title": "Câu 50: Tình huống Quan hệ Pháp luật",
    "category": "Tình huống Quan hệ Pháp luật",
    "questionType": "MC_SCENARIO",
    "question": "Tình huống anh M và chị N: Khi chị N không bàn giao chiếc máy tính đúng thời hạn theo thỏa thuận, quyền yêu cầu bàn giao chiếc máy tính thuộc về yếu tố nào trong quan hệ pháp luật?",
    "options": [
      "Chủ thể của quan hệ pháp luật.",
      "Nội dung của quan hệ pháp luật.",
      "Khách thể của quan hệ pháp luật.",
      "Năng lực pháp luật của chủ thể."
    ],
    "correctAnswer": 1,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-de27681083",
    "title": "Câu 51: Tình huống Khách thể Pháp lý",
    "category": "Tình huống Khách thể Pháp lý",
    "questionType": "MC_SCENARIO",
    "question": "Tình huống anh M và chị N: Khách thể trong quan hệ pháp luật về hợp đồng mua bán chiếc máy tính trên được xác định là gì?",
    "options": [
      "anh M và chị N.",
      "quyền và nghĩa vụ của anh M và chị N trong hợp đồng.",
      "chiếc máy tính, hành vi pháp lý đúng đắn của anh M và chị N.",
      "hợp đồng mua bán chiếc máy tính. Đọc tình huống sau đây và trả lời các câu từ 52 đến 54. P và Q là nhân viên công ty X. Hai người đã thống nhất kế hoạch chiếm đoạt một số tài sản (ước tính giá trị tài sản khoảng 10 triệu đồng) thuộc sở hữu của công ty. Trong quá trình thực hiện, P khi đang đưa tài sản xuống tầng hầm của công ty để đến điểm hẹn giao cho Q thì bị bảo vệ công ty phát hiện."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-2dddc0ddf4",
    "title": "Câu 52: Tình huống Vi phạm Pháp luật (Mặt chủ quan)",
    "category": "Tình huống Vi phạm Pháp luật (Mặt chủ quan)",
    "questionType": "MC_SCENARIO",
    "question": "Đọc tình huống: P và Q là nhân viên công ty X thống nhất kế hoạch chiếm đoạt tài sản (khoảng 10 triệu đồng) của công ty. Trong lúc P đang đưa tài sản xuống tầng hầm để giao cho Q thì bị bảo vệ phát hiện.\n\nCâu hỏi: Dấu hiệu nào thuộc mặt chủ quan của vi phạm pháp luật trên?",
    "options": [
      "Tài sản thuộc sở hữu công ty X.",
      "Hành vi của P giao tài sản cho Q.",
      "P và Q nhận thức rõ tính trái pháp luật của hành vi và mong muốn thực hiện.",
      "Hành vi bàn bạc, thống nhất kế hoạch chiếm đoạt tài sản của P và Q."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-cf16310940",
    "title": "Câu 53: Tình huống Căn cứ Trách nhiệm Pháp lý",
    "category": "Tình huống Căn cứ Trách nhiệm Pháp lý",
    "questionType": "MC_SCENARIO",
    "question": "Tình huống P và Q: Căn cứ nào trực tiếp làm phát sinh trách nhiệm pháp lý của P và Q?",
    "options": [
      "Ý định chiếm đoạt tài sản xuất hiện trong suy nghĩ của P và Q.",
      "Tài sản thuộc sở hữu của công ty X.",
      "Sự phát hiện của người người bảo vệ đối với hành vi chiếm đoạt tài sản của P và Q.",
      "Hành vi chiếm đoạt tài sản của P và Q được thực hiện với lỗi cố ý."
    ],
    "correctAnswer": 3,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-c3e17b78e6",
    "title": "Câu 54: Tình huống Đồng phạm & Trách nhiệm Pháp lý",
    "category": "Tình huống Đồng phạm & Trách nhiệm Pháp lý",
    "questionType": "MC_SCENARIO",
    "question": "Tình huống P và Q: Nhận định nào sau đây là đúng với tình huống trên?",
    "options": [
      "P chịu trách nhiệm pháp lý vì P là người trực tiếp thực hiện hành vi, Q chưa nhận được tài sản từ P nên không liên đới trách nhiệm.",
      "Không phát sinh trách nhiệm pháp lý vì tài sản chưa bị dịch chuyển khỏi địa điểm công ty X.",
      "Việc xem xét trách nhiệm pháp lý phải căn cứ hành vi trái pháp luật; có lỗi của P và Q không chỉ căn cứ vào hậu quả.",
      "Hành vi của P và Q chưa chiếm đoạt được tài sản nên chỉ vi phạm quy tắc đạo đức nghề nghiệp."
    ],
    "correctAnswer": 2,
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-6c1800a912",
    "title": "Câu 55: Điền khuyết: Hình thức Cấu trúc Nhà nước",
    "category": "Điền khuyết: Hình thức Cấu trúc Nhà nước",
    "questionType": "MC_FILL",
    "question": "Quốc gia A có một bản Hiến pháp, một hệ thống pháp luật thống nhất, một hệ thống cơ quan nhà nước thống nhất từ trung ương đến địa phương và các đơn vị hành chính không có chủ quyền riêng. Quốc gia A có hình thức cấu trúc nhà nước nào? Trả lời:___________________",
    "options": [
      "Nhà nước đơn nhất",
      "Nhà nước liên bang",
      "Nhà nước liên minh",
      "Nhà nước tự trị"
    ],
    "correctAnswer": 0,
    "textAnswer": "Nhà nước đơn nhất",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-5dcf7aec34",
    "title": "Câu 56: Điền khuyết: Nguyên tắc Bộ máy Nhà nước",
    "category": "Điền khuyết: Nguyên tắc Bộ máy Nhà nước",
    "questionType": "MC_FILL",
    "question": "Tổ chức và hoạt động của Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam bảo đảm sự chỉ đạo, lãnh đạo tập trung thống nhất của trung ương với địa phương, của cấp trên với cấp dưới; đồng thời, phải phát huy tính tích cực, chủ động, sáng tạo của địa phương và cấp dưới nhưng luôn phải đảm bảo sự tập trung thống nhất của cấp trên thể hiện nguyên tắc _________. Trả lời:__________",
    "options": [
      "Tập trung dân chủ",
      "Quyền lực thống nhất",
      "Pháp chế xã hội chủ nghĩa",
      "Nhân dân làm chủ"
    ],
    "correctAnswer": 0,
    "textAnswer": "Tập trung dân chủ",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-bb217d0b48",
    "title": "Câu 57: Điền khuyết: Pháp luật & Đạo đức",
    "category": "Điền khuyết: Pháp luật & Đạo đức",
    "questionType": "MC_FILL",
    "question": "Có bao nhiêu nhận định đúng trong các nhận định sau đây? (1) Trong mối quan hệ pháp luật với đạo đức thì pháp luật và đạo đức hoàn toàn độc lập. (2) Trong mối quan hệ pháp luật với đạo đức thì đạo đức có vai trò hỗ trợ cho việc xây dựng pháp luật. (3) Trong mối quan hệ pháp luật với đạo đức thì pháp luật có vai trò ghi nhận các quy phạm đạo đức tốt đẹp. (4) Trong mối quan hệ pháp luật với đạo đức thì pháp luật có vai trò loại bỏ các quy phạm đạo đức lỗi thời. (5) Trong mối quan hệ pháp luật với đạo đức thì pháp luật góp phần hình thành các quan niệm đạo đức mới. (6) Trong mối quan hệ pháp luật với đạo đức thì pháp luật không ngăn cấm, không loại trừ mọi quy phạm đạo đức. Trả lời:__________",
    "options": [
      "4",
      "3",
      "5",
      "2"
    ],
    "correctAnswer": 0,
    "textAnswer": "4",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-db5f6507e8",
    "title": "Câu 58: Điền khuyết: Năng lực Pháp luật",
    "category": "Điền khuyết: Năng lực Pháp luật",
    "questionType": "MC_FILL",
    "question": "Năng lực nào của một cá nhân phản ánh khả năng được nhà nước thừa nhận có các quyền và nghĩa pháp lý theo quy định pháp luật, xuất hiện kể từ khi cá nhân được sinh ra? Trả lời:__________",
    "options": [
      "Năng lực pháp luật",
      "Năng lực hành vi",
      "Năng lực trách nhiệm",
      "Năng lực chủ thể"
    ],
    "correctAnswer": 0,
    "textAnswer": "Năng lực pháp luật",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-40ff6be0b1",
    "title": "Câu 59: Điền khuyết: Lỗi trong Vi phạm Pháp luật",
    "category": "Điền khuyết: Lỗi trong Vi phạm Pháp luật",
    "questionType": "MC_FILL",
    "question": "Bác sĩ X được giao nhiệm vụ thực hiện ca phẫu thuật cho bệnh nhân Y. Trong quá trình thực hiện nhiệm vụ, do không cẩn thận bác sĩ X đã để quên gạc y tế trong ổ bụng của bệnh nhân khiến bệnh nhân bị nhiễm trùng nặng sau 1 tuần xuất viện. Lỗi của bác sĩ X trong trường hợp này là gì? Trả lời:__________",
    "options": [
      "Vô ý do cẩu thả",
      "Vô ý vì quá tự tin",
      "Cố ý gián tiếp",
      "Cố ý trực tiếp"
    ],
    "correctAnswer": 0,
    "textAnswer": "Vô ý do cẩu thả",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "mc-5589fc0dd3",
    "title": "Câu 60: Điền khuyết: Trách nhiệm Kỷ luật Viên chức",
    "category": "Điền khuyết: Trách nhiệm Kỷ luật Viên chức",
    "questionType": "MC_FILL",
    "question": "Anh H là viên chức cơ quan nhà nước, do tự ý nghỉ việc không xin phép liên tục nhiều ngày làm việc nên đã bị xử lý bằng hình thức buộc thôi việc. Trách nhiệm pháp lý nào được áp dụng đối với anh H? Trả lời:__________",
    "options": [
      "Trách nhiệm kỷ luật",
      "Trách nhiệm hành chính",
      "Trách nhiệm dân sự",
      "Trách nhiệm hình sự"
    ],
    "correctAnswer": 0,
    "textAnswer": "Trách nhiệm kỷ luật",
    "explanation": "Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.",
    "legalReference": "Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2"
  },
  {
    "id": "essay-bfaf8e4159",
    "title": "PHẦN I: TỰ LUẬN (30 điểm)",
    "category": "Nghị luận Lý luận CAND & Tư tưởng Hồ Chí Minh",
    "questionType": "ESSAY",
    "question": "Chủ tịch Hồ Chí Minh khẳng định: “Tương lai thuộc về thanh niên. Tương lai là cách mạng luôn tiến lên. Là chủ của tương lai, thanh niên không thể không có lý tưởng cao cả. Vì vậy thanh niên phải có cuộc sống chính trị tích cực và cách mạng.”. (Hồ Chí Minh toàn tập, Tập 12. NXB Chính trị quốc gia - Sự thật, 2011, trang 519)\n\nAnh/chị hãy viết một bài nghị luận (tối thiểu 500 chữ) trình bày cách hiểu của mình về nội dung đoạn trích trên và liên hệ với vai trò của thanh niên trong giai đoạn hiện nay.",
    "options": [],
    "correctAnswer": 0,
    "sampleEssay": "DÀN Ý & BÀI LÀM GỢI Ý CHUẨN T05:\n\nI. MỞ BÀI:\n- Dẫn dắt tư tưởng Hồ Chí Minh về vị trí chiến lược của thanh niên trong sự nghiệp cách mạng: \"Thanh niên là người chủ tương lai của nước nhà\".\n- Trích dẫn câu nói của Bác: “Tương lai thuộc về thanh niên. Tương lai là cách mạng luôn tiến lên...”.\n- Khẳng định tính thời sự và định hướng kim chỉ nam đối với tuổi trẻ, đặc biệt là thế hệ thanh niên Công an nhân dân trong kỷ nguyên mới.\n\nII. THÂN BÀI:\n1. Giải thích và phân tích nội dung câu nói của Bác (10 điểm):\n- \"Tương lai thuộc về thanh niên\": Khẳng định vai trò tiếp nối lịch sử, là lực lượng xung kích gánh vác sứ mệnh dân tộc.\n- \"Tương lai là cách mạng luôn tiến lên\": Cách mạng là dòng chảy liên tục, đòi hỏi sự đổi mới, sáng tạo không ngừng.\n- \"Thanh niên không thể không có lý tưởng cao cả\": Lý tưởng độc lập dân tộc gắn liền với CNXH; phụng sự Tổ quốc, phục vụ nhân dân.\n- \"Cuộc sống chính trị tích cực và cách mạng\": Không thờ ơ chính trị, chủ động rèn luyện bản lĩnh, sẵn sàng cống hiến.\n\n2. Bàn luận và liên hệ thực tiễn với thanh niên hiện nay (14 điểm):\n- Thời cơ và thách thức của kỷ nguyên số, hội nhập quốc tế và các âm mưu diễn biến hòa bình.\n- Vai trò của thanh niên trong phát triển kinh tế - xã hội, bảo vệ an ninh trật tự, tiên phong làm chủ khoa học công nghệ.\n- Phê phán lối sống thực dụng, phai nhạt lý tưởng, \"tự diễn biến\", \"tự chuyển hóa\" ở một bộ phận giới trẻ.\n- Trách nhiệm đặc thù của đoàn viên, thanh niên CAND: Khắc ghi Sáu điều Bác Hồ dạy CAND, bảo vệ Đảng, bảo vệ Nhà nước và giữ vững bình yên cuộc sống.\n\nIII. KẾT BÀI:\n- Khẳng định giá trị trường tồn trong lời căn dặn của Bác.\n- Lời hứa hành động: Không ngừng học tập, tu dưỡng đạo đức cách mạng, phấn đấu xứng danh người chiến sĩ CAND \"Vì nước quên thân, vì dân phục vụ\".",
    "explanation": "Đáp ứng chuẩn thang điểm chấm thi CAND: Phân tích tư tưởng (10đ) + Liên hệ thực tiễn bản thân và CAND (14đ) + Kỹ năng lập luận, chính tả (6đ).",
    "legalReference": "Hồ Chí Minh toàn tập (Tập 12, tr. 519) - Đề cương thi tuyển sinh Văn bằng 2 CAND."
  }
]

// Hàm phân loại câu hỏi từ dữ liệu Ngân hàng
function detectQuestionType(q: QuestionBankResponse): 'MC_CHOICE' | 'MC_SCENARIO' | 'MC_FILL' | 'ESSAY' {
  const text = (q.questionText || '') + ' ' + (q.title || '')
  const lower = text.toLowerCase()

  // 1. Kiểm tra trắc nghiệm điền đáp án trước:
  // Nhận diện dấu gạch dưới dài (_____, _ _ _), dấu chấm dài (.....), "điền vào chỗ trống", hoặc có từ "điền"
  if (
    text.includes('_____') ||
    text.includes('____') ||
    text.includes('___') ||
    text.includes('_ _ _') ||
    text.includes('.....') ||
    text.includes('....') ||
    text.includes('...') ||
    lower.includes('điền vào chỗ trống') ||
    lower.includes('chọn từ thích hợp') ||
    lower.includes('điền từ') ||
    lower.includes('điền đáp án')
  ) {
    return 'MC_FILL'
  }

  // 2. Nếu là câu tự luận thực sự (questionType là ESSAY hoặc không có lựa chọn nào và không phải điền khuyết)
  if (q.questionType?.toUpperCase() === 'ESSAY' || (!q.options || q.options.length === 0)) {
    return 'ESSAY'
  }

  // 3. Kiểm tra tình huống: có từ "tình huống", "giả sử", "trong trường hợp", "tổ công tác", v.v.
  if (
    lower.includes('tình huống') ||
    lower.includes('giả sử') ||
    lower.includes('tổ công tác phát hiện') ||
    lower.includes('vụ án') ||
    lower.includes('trường hợp sau đây')
  ) {
    return 'MC_SCENARIO'
  }

  // Mặc định là trắc nghiệm chọn A B C D
  return 'MC_CHOICE'
}

// Hàm xáo trộn Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function QuizPage() {
  const navigate = useNavigate()

  // Chế độ học: 'FLASHCARD' (Flashcard lật thẻ ghi nhớ) | 'QUIZ' (Trắc nghiệm tính điểm) | 'ESSAY_STUDY' (Luyện Tự luận & Án lệ)
  const [learningMode, setLearningMode] = useState<'FLASHCARD' | 'QUIZ' | 'ESSAY_STUDY'>('FLASHCARD')

  // Phân loại câu hỏi: ALL | MC_CHOICE | MC_SCENARIO | MC_FILL | ESSAY
  const [typeFilter, setTypeFilter] = useState<QuizQuestionTypeFilter>('ALL')

  // Cấu hình lấy câu hỏi: Mặc định lấy ngẫu nhiên 60 câu = 1 bộ đề
  const [questionCount, setQuestionCount] = useState<number>(60)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Danh sách câu hỏi tải từ Ngân hàng
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([])
  const [rawBankQuestions, setRawBankQuestions] = useState<QuestionBankResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFromBank, setIsFromBank] = useState<boolean>(false)

  // Trạng thái phiên học hiện tại
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Trạng thái Flashcard
  const [isFlipped, setIsFlipped] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string | number>>(new Set())

  // Trạng thái nhập liệu cho câu hỏi điền đáp án
  const [fillInputText, setFillInputText] = useState<string>('')

  // Quản lý kích thước font chữ ôn luyện (Mặc định to lên 1 xíu 'large' theo yêu cầu học viên)
  const [quizFontSize, setQuizFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('quiz_font_size') as 'normal' | 'large' | 'xlarge') || 'large'
  })

  const handleFontSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    setQuizFontSize(size)
    localStorage.setItem('quiz_font_size', size)
  }

  // Hàm chuyển đổi raw QuestionBankResponse sang QuizQuestionItem
  const convertToQuizItems = useCallback((rawList: QuestionBankResponse[]): QuizQuestionItem[] => {
    return rawList.map(q => {
      const qType = detectQuestionType(q)
      const opts = q.options || []
      let correctIdx = opts.findIndex(o => o.isCorrect || (o as any).correct)
      if (correctIdx === -1 && q.correctAnswer) {
        correctIdx = opts.findIndex(o => o.label?.toUpperCase() === q.correctAnswer?.toUpperCase())
      }
      if (correctIdx === -1) correctIdx = 0

      // Text đáp án đúng
      let textAns = q.correctAnswer || ''
      if (opts[correctIdx]) {
        textAns = opts[correctIdx].text || (opts[correctIdx] as any).optionText || ''
      }

      return {
        id: q.id,
        category: q.category || 'Pháp luật CAND',
        title: q.title || (qType === 'ESSAY' ? 'Câu hỏi Tự luận & Án lệ' : qType === 'MC_SCENARIO' ? 'Tình huống pháp lý CAND' : qType === 'MC_FILL' ? 'Trắc nghiệm điền đáp án' : 'Trắc nghiệm chọn A B C D'),
        questionType: qType,
        question: q.questionText,
        options: opts.map(o => `${o.label ? o.label + '. ' : ''}${o.text || (o as any).optionText || ''}`),
        correctAnswer: correctIdx,
        textAnswer: textAns,
        sampleEssay: q.sampleEssay || q.explanation,
        explanation: q.explanation,
        legalReference: q.legalReference
      }
    })
  }, [])

  // Sinh danh sách câu hỏi ngẫu nhiên cho phiên học
  const generateSession = (
    pool: QuizQuestionItem[],
    filterCat: string,
    filterType: QuizQuestionTypeFilter,
    limit: number
  ) => {
    let filtered = pool

    // Lọc theo Chuyên đề
    if (filterCat !== 'ALL') {
      filtered = filtered.filter(q => q.category === filterCat)
    }

    // Lọc theo Phân loại dạng bài
    if (filterType !== 'ALL') {
      filtered = filtered.filter(q => q.questionType === filterType)
    }

    // Nếu bộ lọc quá chặt không có câu nào, lấy từ pool lớn
    if (filtered.length === 0) {
      if (filterType !== 'ALL') {
        filtered = pool.filter(q => q.questionType === filterType)
      }
      if (filtered.length === 0) filtered = pool
    }

    // Xáo trộn ngẫu nhiên
    const shuffled = shuffleArray(filtered).slice(0, limit)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setSelectedOption(null)
    setFillInputText('')
    setIsAnswered(false)
    setIsFlipped(false)
    setScore(0)
    setIsFinished(false)
  }

  // Tải dữ liệu từ Ngân hàng câu hỏi
  const loadQuestionBankData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Lấy toàn bộ câu hỏi (bao gồm cả MC & ESSAY) từ ngân hàng - tải tối đa 500 câu
      const res = await questionBankApi.getQuestions({
        page: 1,
        limit: 500,
        isDraft: false,
      })

      let allQuestions = res?.content || []

      if (allQuestions.length === 0) {
        const draftRes = await questionBankApi.getQuestions({
          page: 1,
          limit: 500,
          isDraft: true,
        })
        allQuestions = draftRes?.content || []
      }

      setRawBankQuestions(allQuestions)

      // Lọc các chuyên đề
      const cats = Array.from(
        new Set(
          allQuestions
            .map(q => q.category?.trim())
            .filter((c): c is string => Boolean(c))
        )
      )
      setAvailableCategories(cats)

      if (allQuestions.length > 0) {
        setIsFromBank(true)
        const converted = convertToQuizItems(allQuestions)
        generateSession(converted, categoryFilter, typeFilter, questionCount)
      } else {
        setIsFromBank(false)
        generateSession(FALLBACK_QUESTIONS, 'ALL', typeFilter, questionCount)
      }
    } catch (err) {
      console.warn('Không thể kết nối ngân hàng câu hỏi, dùng dữ liệu mẫu:', err)
      setIsFromBank(false)
      generateSession(FALLBACK_QUESTIONS, 'ALL', typeFilter, questionCount)
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, typeFilter, questionCount, convertToQuizItems])

  // Khởi chạy nạp dữ liệu lần đầu
  useEffect(() => {
    loadQuestionBankData()
  }, [])

  // Đổi danh mục lọc, dạng bài hoặc số lượng
  const handleFilterChange = (cat: string, type: QuizQuestionTypeFilter, count: number) => {
    setCategoryFilter(cat)
    setTypeFilter(type)
    setQuestionCount(count)
    if (type === 'ESSAY') {
      setLearningMode('ESSAY_STUDY')
    }

    const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : FALLBACK_QUESTIONS
    generateSession(pool, cat, type, count)
  }

  // Tái tạo lại danh sách câu hỏi ngẫu nhiên mới
  const handleReshuffle = () => {
    const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : FALLBACK_QUESTIONS
    generateSession(pool, categoryFilter, typeFilter, questionCount)
    toast.success('Đã trộn ngẫu nhiên bộ câu hỏi mới từ Ngân Hàng!')
  }

  const currentQ = questions[currentIndex]

  // Chọn đáp án trong Quiz mode
  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQ.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  // Chuyển câu tiếp theo
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setFillInputText('')
      setIsAnswered(false)
      setIsFlipped(false)
    } else {
      setIsFinished(true)
    }
  }

  // Lùi lại câu trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSelectedOption(null)
      setFillInputText('')
      setIsAnswered(false)
      setIsFlipped(false)
    }
  }

  // Đánh dấu bookmark
  const toggleBookmark = (id: string | number) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast.info('Đã bỏ lưu câu hỏi')
      } else {
        next.add(id)
        toast.success('Đã lưu câu hỏi vào danh sách ôn tập')
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6 pb-16 font-sans antialiased text-slate-900 dark:text-white">
      
      {/* Top Hero Banner Hiện Đại */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/40 dark:via-[#111625] dark:to-teal-950/30 shadow-xl shadow-emerald-500/5">
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-gradient-to-tl from-cyan-500/20 via-blue-500/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 blur-md group-hover:opacity-75 transition-opacity" />
              <img src="/t05-logo.png" alt="T05 Logo" className="relative h-14 w-14 object-contain rounded-2xl p-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-md" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-red-500/15 to-amber-500/15 text-red-700 dark:text-red-300 border border-red-500/25 dark:border-red-800/40 uppercase tracking-wide">
                  T05 • ĐH Cảnh Sát Nhân Dân
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Luyện Đề Thông Minh & Flashcard 3D
                </span>
                {isFromBank && (
                  <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Ngân Hàng Trực Tuyến
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  Ôn Luyện Kiến Thức Pháp Luật CAND
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Hệ thống câu hỏi ngẫu nhiên chuẩn hóa T05 • Ôn nhanh bằng Thẻ Flashcard 3D hoặc Kiểm tra tính điểm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              onClick={handleReshuffle}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-white/90 dark:bg-slate-900/90 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
              title="Lấy ngẫu nhiên bộ câu hỏi khác"
            >
              <Shuffle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Đổi Bộ Khác</span>
            </button>

            <button
              onClick={() => navigate('/question-bank')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all cursor-pointer"
            >
              <Layers className="h-4 w-4" />
              <span>Ngân Hàng Câu Hỏi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Điều Khiển Chế Độ & Bộ Lọc (Text to rõ, dễ đọc & Chỉnh cỡ chữ) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Hàng 1: Toggle Chế Độ Học & Chuyên đề & Quy mô */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          
          {/* Toggle Mode: Flashcard 3D vs Luyện Trắc Nghiệm vs Tự Luận & Án Lệ */}
          <div className="md:col-span-5 flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => {
                setLearningMode('FLASHCARD')
                setIsFlipped(false)
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'FLASHCARD'
                  ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Thẻ Flashcard 3D</span>
            </button>

            <button
              onClick={() => {
                setLearningMode('QUIZ')
                setSelectedOption(null)
                setIsAnswered(false)
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'QUIZ'
                  ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Trắc Nghiệm</span>
            </button>

            <button
              onClick={() => {
                setLearningMode('ESSAY_STUDY')
                setTypeFilter('ESSAY')
                const pool = rawBankQuestions.length > 0 ? convertToQuizItems(rawBankQuestions) : FALLBACK_QUESTIONS
                generateSession(pool, categoryFilter, 'ESSAY', questionCount)
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer",
                learningMode === 'ESSAY_STUDY'
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <PenTool className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Tự Luận & Án Lệ</span>
            </button>
          </div>

          {/* Filter Chuyên đề */}
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(e.target.value, typeFilter, questionCount)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5d5fef]/40"
            >
              <option value="ALL">Tất cả chuyên đề ({rawBankQuestions.length || FALLBACK_QUESTIONS.length} câu)</option>
              {availableCategories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Số lượng câu hỏi */}
          <div className="md:col-span-3 flex items-center justify-end gap-1.5">
            <span className="text-xs font-bold text-slate-500">Quy mô:</span>
            {[
              { label: '30 câu', val: 30 },
              { label: '60 câu', val: 60 },
              { label: 'Toàn bộ', val: 500 }
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleFilterChange(categoryFilter, typeFilter, item.val)}
                className={cn(
                  "px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap",
                  questionCount === item.val
                    ? "bg-[#5d5fef] text-white shadow-xs ring-1 ring-[#5d5fef]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>

        {/* Hàng 2: Tách biệt các phân loại câu hỏi ôn luyện + BỘ CHỈNH CỠ CHỮ THÔNG MINH */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 mr-1">
              <Layers className="h-4 w-4 text-[#5d5fef]" />
              <span>Dạng bài:</span>
            </div>

            {[
              { id: 'ALL', label: '1. Tất cả dạng' },
              { id: 'MC_CHOICE', label: '2. Trắc nghiệm A B C D' },
              { id: 'MC_SCENARIO', label: '3. Tình huống nghiệp vụ' },
              { id: 'MC_FILL', label: '4. Điền đáp án' },
              { id: 'ESSAY', label: '5. Tự luận & Án lệ' },
            ].map((tab) => {
              const isActive = typeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(categoryFilter, tab.id as QuizQuestionTypeFilter, questionCount)}
                  className={cn(
                    "px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1",
                    isActive
                      ? "bg-[#5d5fef] text-white shadow-xs ring-1 ring-[#5d5fef]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* BỘ CHỈNH CỠ CHỮ TIỆN LỢI (A: Chuẩn, A+: To khuyên dùng, A++: Cực to) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-end sm:self-auto shrink-0">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 px-1.5 flex items-center gap-1">
              <Type className="h-3.5 w-3.5" />
              <span>Cỡ chữ:</span>
            </span>
            {[
              { id: 'normal', label: 'A', title: 'Cỡ chữ chuẩn (16px)' },
              { id: 'large', label: 'A+', title: 'Cỡ chữ to rõ ràng - Khuyên dùng (20px)' },
              { id: 'xlarge', label: 'A++', title: 'Cỡ chữ cực to (24px)' }
            ].map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => handleFontSizeChange(sz.id as any)}
                title={sz.title}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                  quizFontSize === sz.id
                    ? "bg-white dark:bg-slate-900 text-[#5d5fef] shadow-xs ring-1 ring-slate-300 dark:ring-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {sz.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-[#5d5fef] animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang chọn ngẫu nhiên câu hỏi từ Ngân hàng đề...</p>
        </div>
      )}

      {/* Nội dung chính: Chưa hoàn thành */}
      {!isLoading && !isFinished && questions.length > 0 && currentQ && (
        <div className="space-y-6">

          {/* Thanh Tiến Trình Học */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span>Câu {currentIndex + 1} / {questions.length}</span>
                {currentQ.category && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentQ.category}
                  </span>
                )}
              </div>
              <div>
                {learningMode === 'QUIZ' && (
                  <span className="text-emerald-600 font-black">Chính xác: {score} câu</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5d5fef] to-[#ff7a00] rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CHẾ ĐỘ 1: THẺ FLASHCARD 3D THÔNG MINH                      */}
          {/* ========================================================= */}
          {learningMode === 'FLASHCARD' && (
            <div className="space-y-5">
              
              {/* Card lật tương tác 3D */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[340px] w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/30 dark:shadow-none p-6 md:p-8 cursor-pointer select-none transition-all duration-300 hover:border-[#5d5fef]/50 hover:shadow-lg flex flex-col justify-between"
              >
                {/* Góc trên: Badge & Bookmark */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-[#5d5fef]/10 text-[#5d5fef]">
                      {isFlipped ? 'Mặt Sau: Đáp Án Đúng' : 'Mặt Trước: Câu Hỏi'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      (Nhấp vào thẻ để lật)
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(currentQ.id)
                    }}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      bookmarkedIds.has(currentQ.id)
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                    )}
                    title="Lưu câu hỏi ôn tập"
                  >
                    {bookmarkedIds.has(currentQ.id) ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Nội dung Mặt Trước / Mặt Sau */}
                <div className="my-6">
                  {!isFlipped ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border",
                          currentQ.questionType === 'ESSAY'
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : currentQ.questionType === 'MC_SCENARIO'
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            : currentQ.questionType === 'MC_FILL'
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        )}>
                          {currentQ.questionType === 'ESSAY'
                            ? '5. Tự luận & Án lệ'
                            : currentQ.questionType === 'MC_SCENARIO'
                            ? '3. Tình huống nghiệp vụ'
                            : currentQ.questionType === 'MC_FILL'
                            ? '4. Trắc nghiệm điền đáp án'
                            : '2. Trắc nghiệm A B C D'}
                        </span>
                        {currentQ.title && (
                          <span className="text-xs font-bold text-slate-500">
                            • {currentQ.title}
                          </span>
                        )}
                      </div>

                      {/* Hiển thị nội dung câu hỏi: nếu là điền đáp án thì thay thế chỗ trống bằng text đã nhập */}
                      {currentQ.questionType === 'MC_FILL' ? (
                        (() => {
                          const blankRegex = /(_+[\s_]*_+|\.{3,})/g
                          const hasBlank = blankRegex.test(currentQ.question)
                          
                          return (
                            <div className="space-y-4">
                              <h2 className={cn(
                                "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                                quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                              )}>
                                {hasBlank ? (
                                  (() => {
                                    const parts = currentQ.question.split(/(_+[\s_]*_+|\.{3,})/)
                                    return parts.map((part, pIdx) => {
                                      if (/^(_+[\s_]*_+|\.{3,})$/.test(part.trim())) {
                                        return (
                                          <span
                                            key={pIdx}
                                            className={cn(
                                              "inline-block mx-1.5 px-3 py-1 rounded-lg border-b-2 font-black transition-all",
                                              fillInputText.trim()
                                                ? "bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-900 dark:text-amber-200"
                                                : "border-slate-400 dark:border-slate-500 text-slate-400 dark:text-slate-500 italic"
                                            )}
                                          >
                                            {fillInputText.trim() || '__________'}
                                          </span>
                                        )
                                      }
                                      return <span key={pIdx}>{part}</span>
                                    })
                                  })()
                                ) : (
                                  <span>
                                    {currentQ.question}{' '}
                                    <span className="inline-block mx-1.5 px-3 py-1 rounded-lg border-b-2 border-amber-500 bg-amber-100 dark:bg-amber-950/70 font-black text-amber-900 dark:text-amber-200">
                                      {fillInputText.trim() || '__________'}
                                    </span>
                                  </span>
                                )}
                              </h2>

                              {/* Ô nhập text trực tiếp cho người học */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-400/40 space-y-2.5"
                              >
                                <label className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                  <span>✍️ Nhập đáp án điền vào chỗ trống:</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={fillInputText}
                                    onChange={(e) => setFillInputText(e.target.value)}
                                    placeholder="Gõ từ hoặc cụm từ cần điền vào đây..."
                                    className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                  />
                                  {fillInputText && (
                                    <button
                                      type="button"
                                      onClick={() => setFillInputText('')}
                                      className="px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                                  Nội dung bạn nhập sẽ lập tức hiển thị tại vị trí gạch ngang ở đề bài.
                                </p>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <h2 className={cn(
                          "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                          quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                        )}>
                          {currentQ.question}
                        </h2>
                      )}

                      {/* Hiển thị các phương án tham khảo cho trắc nghiệm A B C D hoặc tình huống */}
                      {currentQ.questionType !== 'MC_FILL' && currentQ.options && currentQ.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                          {currentQ.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-medium text-slate-800 dark:text-slate-200 leading-relaxed",
                                quizFontSize === 'normal' ? "text-xs sm:text-sm" : quizFontSize === 'large' ? "text-sm sm:text-base" : "text-base sm:text-lg"
                              )}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Thông báo gợi ý cho câu hỏi tự luận */}
                      {currentQ.questionType === 'ESSAY' && (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                          <p className="font-bold flex items-center gap-1.5">
                            <PenTool className="h-4 w-4" />
                            Gợi ý làm bài tự luận:
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                            Hãy chuẩn bị ý trả lời hoặc ghi chép luận điểm chính trước khi lật mặt sau để đối chiếu dàn ý và bài viết mẫu chuẩn T05.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200 py-2">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        ✓ {currentQ.questionType === 'ESSAY' ? 'Dàn ý & Bài viết mẫu tham khảo' : 'Đáp án chính xác'}
                      </span>

                      {currentQ.questionType === 'ESSAY' ? (
                        <div className={cn(
                          "p-5 sm:p-7 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/40 text-slate-800 dark:text-slate-100 space-y-3 whitespace-pre-line leading-loose max-h-[460px] overflow-y-auto",
                          quizFontSize === 'normal' ? "text-sm sm:text-base" : quizFontSize === 'large' ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"
                        )}>
                          {currentQ.sampleEssay || currentQ.explanation || 'Đang cập nhật hướng dẫn trả lời chi tiết cho đề tài này.'}
                        </div>
                      ) : (
                        <div className={cn(
                          "p-5 sm:p-7 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/40 font-black text-emerald-900 dark:text-emerald-200 leading-relaxed",
                          quizFontSize === 'normal' ? "text-base sm:text-xl" : quizFontSize === 'large' ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl sm:text-3xl md:text-4xl"
                        )}>
                          {currentQ.options[currentQ.correctAnswer] || currentQ.textAnswer || 'Đáp án đang cập nhật'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chân Thẻ: Nút điều khiển lùi / tiến */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(!isFlipped)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5d5fef] hover:underline cursor-pointer"
                  >
                    {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{isFlipped ? 'Xem lại câu hỏi' : 'Xem đáp án'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrev()
                      }}
                      disabled={currentIndex === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Câu Trước</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNext()
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#5d5fef]/20 transition-all cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CHẾ ĐỘ 2: LUYỆN TRẮC NGHIỆM ĐÁNH GIÁ ĐIỂM                    */}
          {/* ========================================================= */}
          {learningMode === 'QUIZ' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
              
              {/* Nội dung câu hỏi */}
              <div className="p-5 md:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#5d5fef] block">
                    {currentQ.title || 'Câu hỏi lý thuyết trọng tâm'}
                  </span>
                  <h2 className={cn(
                    "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                    quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                  )}>
                    {currentQ.question}
                  </h2>
                </div>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={cn(
                    "p-2.5 rounded-xl border shrink-0 transition-all cursor-pointer",
                    bookmarkedIds.has(currentQ.id)
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "border-slate-200 dark:border-slate-700 text-slate-400"
                  )}
                  title="Lưu câu hỏi"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>

              {/* Các phương án trả lời hoặc ô nhập điền đáp án */}
              {currentQ.questionType === 'MC_FILL' ? (
                <div className="space-y-4 pt-2">
                  <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-400/40 space-y-3.5">
                    <label className={cn(
                      "font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5",
                      quizFontSize === 'normal' ? "text-sm" : quizFontSize === 'large' ? "text-base" : "text-lg"
                    )}>
                      <span>✍️ Nhập đáp án vào chỗ trống:</span>
                    </label>
                    
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={fillInputText}
                        disabled={isAnswered}
                        onChange={(e) => setFillInputText(e.target.value)}
                        placeholder="Gõ đáp án chính xác..."
                        className={cn(
                          "flex-1 px-5 py-3 font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                          quizFontSize === 'normal' ? "text-base" : quizFontSize === 'large' ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                        )}
                      />

                      {!isAnswered ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!fillInputText.trim()) {
                              toast.warning('Vui lòng nhập đáp án trước khi xác nhận!')
                              return
                            }
                            setIsAnswered(true)
                            const userAns = fillInputText.trim().toLowerCase()
                            const expected = (currentQ.textAnswer || currentQ.options[currentQ.correctAnswer] || '').toLowerCase()
                            if (userAns && expected && (expected.includes(userAns) || userAns.includes(expected))) {
                              setScore(prev => prev + 1)
                              toast.success('Chính xác!')
                            } else {
                              toast.error('Chưa chính xác!')
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base font-bold shadow-xs cursor-pointer transition-all"
                        >
                          Kiểm Tra
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAnswered(false)
                            setFillInputText('')
                          }}
                          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Nhập lại
                        </button>
                      )}
                    </div>

                    {isAnswered && (
                      <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-300/60 dark:border-amber-700/60 space-y-1.5 animate-in fade-in duration-200">
                        <span className={cn(
                          "font-black text-emerald-600 dark:text-emerald-400 block",
                          quizFontSize === 'normal' ? "text-sm sm:text-base" : quizFontSize === 'large' ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                        )}>
                          ✓ Đáp án chuẩn: {currentQ.textAnswer || currentQ.options[currentQ.correctAnswer] || 'Đang cập nhật'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === currentQ.correctAnswer

                    let styleClass = "border-slate-200 dark:border-slate-800 hover:border-[#5d5fef]/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"

                    if (isAnswered) {
                      if (isCorrect) {
                        styleClass = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                      } else if (isSelected && !isCorrect) {
                        styleClass = "border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold"
                      } else {
                        styleClass = "border-slate-100 dark:border-slate-800/60 opacity-50"
                      }
                    } else if (isSelected) {
                      styleClass = "border-[#5d5fef] bg-[#5d5fef]/5 text-[#5d5fef]"
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        className={cn(
                          "w-full text-left p-4 sm:p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 cursor-pointer leading-relaxed",
                          quizFontSize === 'normal' ? "text-base font-medium" : quizFontSize === 'large' ? "text-lg md:text-xl font-semibold" : "text-xl md:text-2xl font-semibold",
                          styleClass
                        )}
                      >
                        <span className={cn(
                          "rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black shrink-0 shadow-xs border border-slate-200 dark:border-slate-700",
                          quizFontSize === 'normal' ? "h-7 w-7 text-xs" : quizFontSize === 'large' ? "h-9 w-9 text-base" : "h-11 w-11 text-lg"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-0.5">{opt}</span>

                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Nút tiếp theo */}
              {isAnswered && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-sm sm:text-base font-bold shadow-md shadow-[#5d5fef]/30 transition-all cursor-pointer"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}

            </div>
          )}
          {/* ========================================================= */}
          {/* CHẾ ĐỘ 3: LUYỆN TỰ LUẬN & ÁN LỆ CHUYÊN SÂU                  */}
          {/* ========================================================= */}
          {learningMode === 'ESSAY_STUDY' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
              
              {/* Tiêu đề & Câu hỏi tự luận */}
              <div className="p-5 md:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      Tự Luận & Án Lệ T05
                    </span>
                    {currentQ.category && (
                      <span className="text-xs sm:text-sm font-bold text-slate-500">
                        • {currentQ.category}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleBookmark(currentQ.id)}
                    className={cn(
                      "p-2.5 rounded-xl border shrink-0 transition-all cursor-pointer",
                      bookmarkedIds.has(currentQ.id)
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-400"
                    )}
                    title="Lưu câu hỏi"
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>

                <h2 className={cn(
                  "font-black text-slate-950 dark:text-white leading-relaxed tracking-normal",
                  quizFontSize === 'normal' ? "text-lg md:text-xl" : quizFontSize === 'large' ? "text-xl md:text-2xl lg:text-3xl" : "text-2xl md:text-3xl lg:text-4xl"
                )}>
                  {currentQ.question}
                </h2>
              </div>

              {/* Khu vực Gợi ý & Dàn ý bài mẫu */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Dàn Ý & Hướng Dẫn Trả Lời Chuẩn
                    </span>
                  </div>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  >
                    {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{isFlipped ? 'Ẩn Đáp Án Mẫu' : 'Xem Dàn Ý & Bài Mẫu'}</span>
                  </button>
                </div>

                {isFlipped ? (
                  <div className="p-6 md:p-8 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3.5 animate-in fade-in duration-200">
                    <span className="text-xs sm:text-sm font-black uppercase text-emerald-700 dark:text-emerald-400 block tracking-wider">
                      ✓ Dàn bài mẫu & Cơ sở luận cứ T05:
                    </span>
                    <div className={cn(
                      "text-slate-800 dark:text-slate-100 whitespace-pre-line leading-loose font-normal",
                      quizFontSize === 'normal' ? "text-sm md:text-base" : quizFontSize === 'large' ? "text-base md:text-lg lg:text-xl" : "text-lg md:text-xl lg:text-2xl"
                    )}>
                      {currentQ.sampleEssay || currentQ.explanation || 'Nội dung bài viết mẫu đang được cập nhật.'}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-slate-500">
                      Đáp án mẫu đang được ẩn để bạn tự rèn luyện kỹ năng phân tích và lập dàn ý.
                    </p>
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Hiển Thị Bài Viết Mẫu</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Điều khiển chuyển câu */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Câu Trước</span>
                </button>

                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MÀN HÌNH KẾT QUẢ KHI HOÀN THÀNH PHIÊN HỌC                  */}
      {/* ========================================================= */}
      {!isLoading && isFinished && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Hoàn Thành Phiên Ôn Luyện!
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Bạn đã hoàn thành phiên học với {questions.length} câu hỏi trắc nghiệm ngẫu nhiên.
            </p>
          </div>

          {/* Thống kê điểm */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-2xl md:text-3xl font-black text-[#5d5fef]">
                {score} / {questions.length}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                {learningMode === 'QUIZ' ? 'Câu trả lời đúng' : 'Số câu đã xem'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-2xl md:text-3xl font-black text-emerald-600">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                Tỷ lệ chính xác
              </div>
            </div>
          </div>

          {/* Hành động tiếp theo */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReshuffle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đổi Bộ Khác Ôn Tiếp</span>
            </button>

            <button
              onClick={() => navigate('/question-bank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5d5fef] hover:bg-[#4b4dc9] text-white text-xs font-bold shadow-sm shadow-[#5d5fef]/30 transition-all cursor-pointer"
            >
              <span>Vào Ngân Hàng Câu Hỏi</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default QuizPage
