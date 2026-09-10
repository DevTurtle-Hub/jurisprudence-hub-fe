const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/VAN QUY/.gemini/antigravity-ide/brain/b812dfa7-674e-4377-962f-b1d4a9cd40d2/.system_generated/tasks/task-730.log';
const raw = fs.readFileSync(logPath, 'utf8');

// The file has lines separated by |||
// But some questions span multiple lines.
// Let's normalize entries by finding lines starting with 'mc-'
const rawLines = raw.split(/\r?\n/);
const entries = [];
let current = '';

for (const line of rawLines) {
  if (line.startsWith('mc-')) {
    if (current) entries.push(current);
    current = line;
  } else {
    current += ' ' + line.trim();
  }
}
if (current) entries.push(current);

console.log(`Found ${entries.length} raw question entries.`);

const correctAnswersMap = {
  1: { ans: 3, letter: 'D' },
  2: { ans: 0, letter: 'A' },
  3: { ans: 1, letter: 'B' },
  4: { ans: 1, letter: 'B' },
  5: { ans: 1, letter: 'B' },
  6: { ans: 2, letter: 'C' },
  7: { ans: 2, letter: 'C' },
  8: { ans: 3, letter: 'D' },
  9: { ans: 3, letter: 'D' },
  10: { ans: 1, letter: 'B' },
  11: { ans: 0, letter: 'A' },
  12: { ans: 0, letter: 'A' },
  13: { ans: 1, letter: 'B' },
  14: { ans: 0, letter: 'A' },
  15: { ans: 0, letter: 'A' },
  16: { ans: 1, letter: 'B' },
  17: { ans: 3, letter: 'D' },
  18: { ans: 1, letter: 'B' },
  19: { ans: 2, letter: 'C' },
  20: { ans: 2, letter: 'C' },
  21: { ans: 1, letter: 'B' },
  22: { ans: 1, letter: 'B' },
  23: { ans: 0, letter: 'A' },
  24: { ans: 0, letter: 'A' },
  25: { ans: 3, letter: 'D' },
  26: { ans: 2, letter: 'C' },
  27: { ans: 3, letter: 'D' },
  28: { ans: 3, letter: 'D' },
  29: { ans: 2, letter: 'C' },
  30: { ans: 0, letter: 'A' },
  31: { ans: 1, letter: 'B' },
  32: { ans: 1, letter: 'B' },
  33: { ans: 3, letter: 'D' },
  34: { ans: 3, letter: 'D' },
  35: { ans: 2, letter: 'C' },
  36: { ans: 1, letter: 'B' },
  37: { ans: 2, letter: 'C' },
  38: { ans: 3, letter: 'D' },
  39: { ans: 1, letter: 'B' },
  40: { ans: 2, letter: 'C' },
  41: { ans: 1, letter: 'B' },
  42: { ans: 2, letter: 'C' },
  43: { ans: 0, letter: 'A' },
  44: { ans: 1, letter: 'B' },
  45: { ans: 2, letter: 'C' },
  46: { ans: 1, letter: 'B' },
  47: { ans: 1, letter: 'B' },
  48: { ans: 1, letter: 'B' },
  49: { ans: 2, letter: 'C' },
  50: { ans: 1, letter: 'B' },
  51: { ans: 2, letter: 'C' },
  52: { ans: 2, letter: 'C' },
  53: { ans: 3, letter: 'D' },
  54: { ans: 2, letter: 'C' },
  55: { ans: 0, letter: 'D', text: 'Nhà nước đơn nhất' },
  56: { ans: 0, letter: 'A', text: 'Tập trung dân chủ' },
  57: { ans: 0, letter: 'A', text: '4' },
  58: { ans: 0, letter: 'A', text: 'Năng lực pháp luật' },
  59: { ans: 0, letter: 'A', text: 'Vô ý do cẩu thả' },
  60: { ans: 0, letter: 'A', text: 'Trách nhiệm kỷ luật' }
};

const categoryMap = {
  1: 'Bản chất Nhà nước',
  2: 'Chức năng Nhà nước',
  3: 'Đặc trưng Pháp luật',
  4: 'Nguồn Pháp luật',
  5: 'Quan hệ Pháp luật',
  6: 'Thực hiện Pháp luật',
  7: 'Hình thức Áp dụng Pháp luật',
  8: 'Vi phạm Pháp luật',
  9: 'Nguồn gốc Nhà nước',
  10: 'Bản chất & Tính xã hội',
  11: 'Đặc trưng quyền lực Nhà nước',
  12: 'Bộ máy Nhà nước CHXHCN Việt Nam',
  13: 'Bộ máy Nhà nước CHXHCN Việt Nam',
  14: 'Bản chất Pháp luật',
  15: 'Hình thức Pháp luật',
  16: 'Quy phạm Pháp luật',
  17: 'Ý thức Pháp luật',
  18: 'Thực hiện Pháp luật',
  19: 'Áp dụng Pháp luật',
  20: 'Hệ thống Pháp luật Việt Nam',
  21: 'Nguồn gốc Nhà nước',
  22: 'Bản chất giai cấp của Nhà nước',
  23: 'Chủ quyền quốc gia',
  24: 'Chức năng Nhà nước',
  25: 'Hình thức Dân chủ',
  26: 'Cơ quan Hành chính Nhà nước',
  27: 'Nhà nước Pháp quyền XHCN',
  28: 'Nguyên tắc Pháp quyền',
  29: 'Bản chất Pháp luật Việt Nam',
  30: 'Thuộc tính Pháp luật',
  31: 'Mối quan hệ Pháp luật và Tập quán',
  32: 'Mối quan hệ Pháp luật và Kinh tế',
  33: 'Vai trò Pháp luật XHCN',
  34: 'Án lệ trong Pháp luật Việt Nam',
  35: 'Nguồn Pháp luật Việt Nam',
  36: 'Cơ cấu Quy phạm Pháp luật',
  37: 'Điều luật & Quy phạm Pháp luật',
  38: 'Căn cứ phát sinh Quan hệ Pháp luật',
  39: 'Ý thức Pháp luật & Văn hóa Pháp lý',
  40: 'Giải thích Pháp luật',
  41: 'Sự kiện Pháp lý',
  42: 'Tuân thủ Pháp luật',
  43: 'Sử dụng Pháp luật',
  44: 'Áp dụng Pháp luật',
  45: 'Cấu thành Vi phạm Pháp luật',
  46: 'Trách nhiệm Pháp lý',
  47: 'Hệ thống Pháp luật',
  48: 'Nghị quyết 66-NQ/TW & Cải cách Thể chế',
  49: 'Tình huống Hợp đồng Dân sự',
  50: 'Tình huống Quan hệ Pháp luật',
  51: 'Tình huống Khách thể Pháp lý',
  52: 'Tình huống Vi phạm Pháp luật (Mặt chủ quan)',
  53: 'Tình huống Căn cứ Trách nhiệm Pháp lý',
  54: 'Tình huống Đồng phạm & Trách nhiệm Pháp lý',
  55: 'Điền khuyết: Hình thức Cấu trúc Nhà nước',
  56: 'Điền khuyết: Nguyên tắc Bộ máy Nhà nước',
  57: 'Điền khuyết: Pháp luật & Đạo đức',
  58: 'Điền khuyết: Năng lực Pháp luật',
  59: 'Điền khuyết: Lỗi trong Vi phạm Pháp luật',
  60: 'Điền khuyết: Trách nhiệm Kỷ luật Viên chức'
};

const quizQuestions = [];

for (const entry of entries) {
  const parts = entry.split('|||');
  if (parts.length < 7) continue;
  const id = parts[0].trim();
  const order = parseInt(parts[1].trim(), 10);
  let questionText = parts[2].trim();
  const optionsRaw = parts[6].trim();

  const options = [];
  const optMatches = optionsRaw.split(';;;');
  for (const opt of optMatches) {
    let cleanOpt = opt.replace(/^[A-D]:\s*/, '').trim();
    cleanOpt = cleanOpt.replace(/Câu trắc nghiệm trả lời ngắn.*$/i, '').trim();
    if (cleanOpt) options.push(cleanOpt);
  }

  let questionType = 'MC_CHOICE';
  if (order >= 49 && order <= 54) {
    questionType = 'MC_SCENARIO';
  } else if (order >= 55 && order <= 60) {
    questionType = 'MC_FILL';
  }

  const ansMeta = correctAnswersMap[order] || { ans: 0 };
  const category = categoryMap[order] || 'Lý luận Nhà nước & Pháp luật';

  let textAnswer = undefined;
  if (questionType === 'MC_FILL') {
    textAnswer = ansMeta.text;
    if (order === 55) options.splice(0, options.length, 'Nhà nước đơn nhất', 'Nhà nước liên bang', 'Nhà nước liên minh', 'Nhà nước tự trị');
    else if (order === 56) options.splice(0, options.length, 'Tập trung dân chủ', 'Quyền lực thống nhất', 'Pháp chế xã hội chủ nghĩa', 'Nhân dân làm chủ');
    else if (order === 57) options.splice(0, options.length, '4', '3', '5', '2');
    else if (order === 58) options.splice(0, options.length, 'Năng lực pháp luật', 'Năng lực hành vi', 'Năng lực trách nhiệm', 'Năng lực chủ thể');
    else if (order === 59) options.splice(0, options.length, 'Vô ý do cẩu thả', 'Vô ý vì quá tự tin', 'Cố ý gián tiếp', 'Cố ý trực tiếp');
    else if (order === 60) options.splice(0, options.length, 'Trách nhiệm kỷ luật', 'Trách nhiệm hành chính', 'Trách nhiệm dân sự', 'Trách nhiệm hình sự');
  }

  // Handle situational scenario prefix cleanup if needed
  if (order === 49) {
    questionText = 'Đọc tình huống: Anh M ký hợp đồng mua bán một chiếc máy tính của chị N với giá 30 triệu đồng, thanh toán đủ ngày 01/3/2026, giao máy ngày 05/3/2026. Anh M đã thanh toán đủ đúng hẹn nhưng chị N không bàn giao máy.\n\nCâu hỏi: Trong tình huống trên, quan hệ pháp luật về hợp đồng mua bán giữa anh M và chị N phát sinh kể từ thời điểm nào?';
  } else if (order === 50) {
    questionText = 'Tình huống anh M và chị N: Khi chị N không bàn giao chiếc máy tính đúng thời hạn theo thỏa thuận, quyền yêu cầu bàn giao chiếc máy tính thuộc về yếu tố nào trong quan hệ pháp luật?';
  } else if (order === 51) {
    questionText = 'Tình huống anh M và chị N: Khách thể trong quan hệ pháp luật về hợp đồng mua bán chiếc máy tính trên được xác định là gì?';
  } else if (order === 52) {
    questionText = 'Đọc tình huống: P và Q là nhân viên công ty X thống nhất kế hoạch chiếm đoạt tài sản (khoảng 10 triệu đồng) của công ty. Trong lúc P đang đưa tài sản xuống tầng hầm để giao cho Q thì bị bảo vệ phát hiện.\n\nCâu hỏi: Dấu hiệu nào thuộc mặt chủ quan của vi phạm pháp luật trên?';
  } else if (order === 53) {
    questionText = 'Tình huống P và Q: Căn cứ nào trực tiếp làm phát sinh trách nhiệm pháp lý của P và Q?';
  } else if (order === 54) {
    questionText = 'Tình huống P và Q: Nhận định nào sau đây là đúng với tình huống trên?';
  }

  quizQuestions.push({
    id,
    title: `Câu ${order}: ${category}`,
    category,
    questionType,
    question: questionText,
    options,
    correctAnswer: ansMeta.ans,
    textAnswer,
    explanation: `Căn cứ giáo trình Lý luận Nhà nước & Pháp luật (T05 CAND) và văn bản pháp luật hiện hành.`,
    legalReference: `Giáo trình CAND Chuẩn 2026 - Bộ đề thi CA4 Văn bằng 2`
  });
}

// Thêm câu 61: Câu Tự luận CAND chính thức
quizQuestions.push({
  id: 'essay-bfaf8e4159',
  title: 'PHẦN I: TỰ LUẬN (30 điểm)',
  category: 'Nghị luận Lý luận CAND & Tư tưởng Hồ Chí Minh',
  questionType: 'ESSAY',
  question: `Chủ tịch Hồ Chí Minh khẳng định: “Tương lai thuộc về thanh niên. Tương lai là cách mạng luôn tiến lên. Là chủ của tương lai, thanh niên không thể không có lý tưởng cao cả. Vì vậy thanh niên phải có cuộc sống chính trị tích cực và cách mạng.”. (Hồ Chí Minh toàn tập, Tập 12. NXB Chính trị quốc gia - Sự thật, 2011, trang 519)\n\nAnh/chị hãy viết một bài nghị luận (tối thiểu 500 chữ) trình bày cách hiểu của mình về nội dung đoạn trích trên và liên hệ với vai trò của thanh niên trong giai đoạn hiện nay.`,
  options: [],
  correctAnswer: 0,
  sampleEssay: `DÀN Ý & BÀI LÀM GỢI Ý CHUẨN T05:

I. MỞ BÀI:
- Dẫn dắt tư tưởng Hồ Chí Minh về vị trí chiến lược của thanh niên trong sự nghiệp cách mạng: "Thanh niên là người chủ tương lai của nước nhà".
- Trích dẫn câu nói của Bác: “Tương lai thuộc về thanh niên. Tương lai là cách mạng luôn tiến lên...”.
- Khẳng định tính thời sự và định hướng kim chỉ nam đối với tuổi trẻ, đặc biệt là thế hệ thanh niên Công an nhân dân trong kỷ nguyên mới.

II. THÂN BÀI:
1. Giải thích và phân tích nội dung câu nói của Bác (10 điểm):
- "Tương lai thuộc về thanh niên": Khẳng định vai trò tiếp nối lịch sử, là lực lượng xung kích gánh vác sứ mệnh dân tộc.
- "Tương lai là cách mạng luôn tiến lên": Cách mạng là dòng chảy liên tục, đòi hỏi sự đổi mới, sáng tạo không ngừng.
- "Thanh niên không thể không có lý tưởng cao cả": Lý tưởng độc lập dân tộc gắn liền với CNXH; phụng sự Tổ quốc, phục vụ nhân dân.
- "Cuộc sống chính trị tích cực và cách mạng": Không thờ ơ chính trị, chủ động rèn luyện bản lĩnh, sẵn sàng cống hiến.

2. Bàn luận và liên hệ thực tiễn với thanh niên hiện nay (14 điểm):
- Thời cơ và thách thức của kỷ nguyên số, hội nhập quốc tế và các âm mưu diễn biến hòa bình.
- Vai trò của thanh niên trong phát triển kinh tế - xã hội, bảo vệ an ninh trật tự, tiên phong làm chủ khoa học công nghệ.
- Phê phán lối sống thực dụng, phai nhạt lý tưởng, "tự diễn biến", "tự chuyển hóa" ở một bộ phận giới trẻ.
- Trách nhiệm đặc thù của đoàn viên, thanh niên CAND: Khắc ghi Sáu điều Bác Hồ dạy CAND, bảo vệ Đảng, bảo vệ Nhà nước và giữ vững bình yên cuộc sống.

III. KẾT BÀI:
- Khẳng định giá trị trường tồn trong lời căn dặn của Bác.
- Lời hứa hành động: Không ngừng học tập, tu dưỡng đạo đức cách mạng, phấn đấu xứng danh người chiến sĩ CAND "Vì nước quên thân, vì dân phục vụ".`,
  explanation: `Đáp ứng chuẩn thang điểm chấm thi CAND: Phân tích tư tưởng (10đ) + Liên hệ thực tiễn bản thân và CAND (14đ) + Kỹ năng lập luận, chính tả (6đ).`,
  legalReference: `Hồ Chí Minh toàn tập (Tập 12, tr. 519) - Đề cương thi tuyển sinh Văn bằng 2 CAND.`
});

fs.writeFileSync('d:/jurisprudence-hub-fe/scripts/generated_quiz_questions.json', JSON.stringify(quizQuestions, null, 2), 'utf8');
console.log(`Successfully generated ${quizQuestions.length} questions to generated_quiz_questions.json!`);
