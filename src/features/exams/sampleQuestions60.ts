import type { MultipleChoiceQuestion } from './types'

export function generateSample60Questions(): MultipleChoiceQuestion[] {
  const topics = [
    {
      q: 'Theo học thuyết Mác - Lênin, nguyên nhân sâu xa và trực tiếp dẫn đến sự xuất hiện của Nhà nước là gì?',
      opts: [
        'Sự xuất hiện của chế độ tư hữu và sự phân hóa xã hội thành các giai cấp đối kháng không thể điều hòa.',
        'Nhu cầu liên kết quản lý các công trình thủy lợi trị thủy và phòng vệ tự nhiên trong xã hội cổ đại.',
        'Sự thỏa thuận theo khế ước xã hội giữa các cá nhân tự do để bảo vệ trật tự chung.',
        'Sự phát triển tự nhiên của mô hình gia đình phụ quyền thành thị tộc và bộ lạc.'
      ],
      ans: 'A',
      exp: 'Sự xuất hiện của chế độ tư hữu về tư liệu sản xuất và phân hóa giai cấp đối kháng là nguyên nhân kinh tế - xã hội trực tiếp sinh ra Nhà nước.',
      ref: 'Giáo trình Lý luận Nhà nước & Pháp luật'
    },
    {
      q: 'Cấu trúc hoàn chỉnh của một Quy phạm pháp luật chuẩn trong hệ thống pháp luật Việt Nam gồm những bộ phận nào?',
      opts: [
        'Mở đầu, Nội dung điều chỉnh, Hiệu lực thi hành.',
        'Giả định, Quy định, Chế tài.',
        'Chủ thể, Khách thể, Khách quan, Chủ quan.',
        'Mệnh lệnh quản lý, Biện pháp cưỡng chế, Hình phạt.'
      ],
      ans: 'B',
      exp: 'Một quy phạm pháp luật điển hình gồm 3 bộ phận: Giả định, Quy định, và Chế tài.',
      ref: 'Lý luận chung về Quy phạm Pháp luật'
    },
    {
      q: 'Theo Hiến pháp năm 2013, cơ quan nào là cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất của Nước CHXHCN Việt Nam?',
      opts: [
        'Chính phủ nước CHXHCN Việt Nam.',
        'Quốc hội nước CHXHCN Việt Nam.',
        'Tòa án Nhân dân Tối cao.',
        'Mặt trận Tổ quốc Việt Nam.'
      ],
      ans: 'B',
      exp: 'Điều 69 Hiến pháp 2013 quy định Quốc hội là cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất.',
      ref: 'Điều 69, Hiến pháp năm 2013'
    },
    {
      q: 'Hình thức thực hiện pháp luật nào mà trong đó các chủ thể tự kiềm chế không tiến hành những hành vi mà pháp luật nghiêm cấm?',
      opts: [
        'Tuân thủ pháp luật (Tuân theo pháp luật).',
        'Thi hành pháp luật (Chấp hành pháp luật).',
        'Sử dụng pháp luật.',
        'Áp dụng pháp luật của cơ quan có thẩm quyền.'
      ],
      ans: 'A',
      exp: 'Tuân thủ pháp luật là hành vi kiềm chế không vi phạm các điều cấm của pháp luật.',
      ref: 'Hình thức thực hiện pháp luật'
    },
    {
      q: 'Văn bản quy phạm pháp luật nào sau đây có hiệu lực pháp lý cao nhất trong toàn bộ hệ thống văn bản quy phạm pháp luật Việt Nam?',
      opts: [
        'Bộ luật Hình sự.',
        'Nghị quyết của Quốc hội.',
        'Hiến pháp.',
        'Lệnh của Chủ tịch nước.'
      ],
      ans: 'C',
      exp: 'Hiến pháp là luật cơ bản của Nhà nước, có hiệu lực pháp lý cao nhất.',
      ref: 'Điều 119 Hiến pháp 2013'
    },
    {
      q: 'Năng lực chủ thể trong quan hệ pháp luật bao gồm hai yếu tố cấu thành nào sau đây?',
      opts: [
        'Năng lực pháp luật và Năng lực hành vi pháp luật.',
        'Năng lực nhận thức và Năng lực kiểm soát hành vi.',
        'Quyền công dân và Nghĩa vụ công dân.',
        'Ý chí độc lập và Tư cách pháp nhân hợp pháp.'
      ],
      ans: 'A',
      exp: 'Năng lực chủ thể gồm Năng lực pháp luật và Năng lực hành vi pháp luật.',
      ref: 'Giáo trình Lý luận Nhà nước & Pháp luật'
    },
    {
      q: 'Yếu tố nào sau đây thuộc mặt khách quan của vi phạm pháp luật?',
      opts: [
        'Lỗi cố ý hoặc vô ý của chủ thể.',
        'Hành vi trái pháp luật, hậu quả nguy hại và mối quan hệ nhân quả.',
        'Động cơ và mục đích vi phạm pháp luật.',
        'Khả năng nhận thức tính chất nguy hiểm cho xã hội.'
      ],
      ans: 'B',
      exp: 'Mặt khách quan gồm hành vi nguy hại, hậu quả thực tế, quan hệ nhân quả, thời gian, địa điểm, công cụ vi phạm.',
      ref: 'Cấu thành vi phạm pháp luật'
    },
    {
      q: 'Trong hoạt động tố tụng hình sự của lực lượng CAND, biện pháp ngăn chặn nào sau đây chỉ được áp dụng đối với người bị giữ trong trường hợp khẩn cấp hoặc phạm tội quả tang?',
      opts: [
        'Tạm giam.',
        'Tạm giữ.',
        'Cấm đi khỏi nơi cư trú.',
        'Bảo lĩnh.'
      ],
      ans: 'B',
      exp: 'Tạm giữ được áp dụng đối với người bị giữ trong trường hợp khẩn cấp, phạm tội quả tang, đầu thú hoặc truy nã.',
      ref: 'Điều 117 Bộ luật Tố tụng hình sự 2015'
    },
    {
      q: 'Nguyên tắc nào sau đây là nguyên tắc tổ chức và hoạt động cốt lõi của lực lượng Công an nhân dân Việt Nam?',
      opts: [
        'Đặt dưới sự lãnh đạo tuyệt đối, trực tiếp về mọi mặt của Đảng Cộng sản Việt Nam.',
        'Hoạt động độc lập không chịu sự kiểm sát của cơ quan tư pháp.',
        'Chỉ tuân theo mệnh lệnh của chính quyền địa phương cấp cơ sở.',
        'Áp dụng pháp luật theo tập quán địa phương nơi công tác.'
      ],
      ans: 'A',
      exp: 'Điều 4 Luật CAND 2018 quy định CAND đặt dưới sự lãnh đạo tuyệt đối, trực tiếp về mọi mặt của Đảng Cộng sản Việt Nam.',
      ref: 'Điều 4 Luật Công an nhân dân 2018'
    },
    {
      q: 'Án lệ ở Việt Nam được Hội đồng Thẩm phán Tòa án nhân dân tối cao lựa chọn và Chánh án TANDTC công bố nhằm mục đích chính nào?',
      opts: [
        'Thay thế hoàn toàn các quy định của văn bản luật khi có sự mâu thuẫn.',
        'Để các Tòa án nghiên cứu, áp dụng trong xét xử, bảo đảm áp dụng thống nhất pháp luật.',
        'Dùng riêng cho các vụ án có yếu tố nước ngoài hoặc tranh chấp quốc tế.',
        'Hủy bỏ các bản án sơ thẩm đã có hiệu lực pháp luật.'
      ],
      ans: 'B',
      exp: 'Án lệ được áp dụng để bảo đảm áp dụng thống nhất pháp luật trong xét xử các vụ việc tương tự.',
      ref: 'Nghị quyết 04/2019/NQ-HĐTP'
    },
    {
      q: 'Hành vi nào sau đây bị nghiêm cấm tuyệt đối theo Điều lệnh Công an nhân dân?',
      opts: [
        'Học tập nâng cao trình độ chuyên môn ngoài giờ hành chính.',
        'Uống rượu, bia, chất có cồn trong ngày làm việc, giờ làm việc và khi mang trang phục CAND.',
        'Tham gia đóng góp ý kiến xây dựng đơn vị.',
        'Tham gia hoạt động thể thao do cơ quan tổ chức.'
      ],
      ans: 'B',
      exp: 'Điều lệnh CAND nghiêm cấm cán bộ chiến sĩ uống rượu bia trong ngày làm việc, giờ làm việc và khi mang trang phục CAND.',
      ref: 'Thông tư số 09/2021/TT-BCA về Điều lệnh CAND'
    },
    {
      q: 'Khái niệm "Tội phạm" theo Bộ luật Hình sự Việt Nam hiện hành được phân loại thành mấy nhóm theo mức độ nguy hiểm?',
      opts: [
        '2 loại: Ít nghiêm trọng và Rất nghiêm trọng.',
        '3 loại: Nhẹ, Trung bình, Nặng.',
        '4 loại: Ít nghiêm trọng, Nghiêm trọng, Rất nghiêm trọng, Đặc biệt nghiêm trọng.',
        '5 loại theo khung hình phạt từ cải tạo không giam giữ đến tử hình.'
      ],
      ans: 'C',
      exp: 'Căn cứ Điều 9 BLHS 2015, tội phạm được phân thành 4 loại theo mức độ nguy hiểm cho xã hội.',
      ref: 'Điều 9 Bộ luật Hình sự 2015'
    },
    {
      q: 'Trong hoạt động kiểm tra nồng độ cồn, phiếu kết quả in ra từ máy đo nồng độ cồn có giá trị pháp lý là nguồn chứng cứ nào?',
      opts: [
        'Vật chứng.',
        'Dữ liệu điện tử / Kết luận giám định.',
        'Lời khai của người làm chứng.',
        'Kết quả thu thập được từ phương tiện, thiết bị kỹ thuật nghiệp vụ.'
      ],
      ans: 'D',
      exp: 'Kết quả đo là tài liệu thu thập từ phương tiện, thiết bị kỹ thuật nghiệp vụ theo Luật Xử lý vi phạm hành chính.',
      ref: 'Luật Xử lý vi phạm hành chính'
    },
    {
      q: 'Thời hạn tạm giữ người theo thủ tục tố tụng hình sự thông thường không được quá bao nhiêu giờ?',
      opts: [
        '24 giờ.',
        '36 giờ.',
        '72 giờ (3 ngày).',
        '96 giờ (4 ngày).'
      ],
      ans: 'C',
      exp: 'Thời hạn tạm giữ không quá 03 ngày (72 giờ) kể từ khi cơ quan điều tra nhận người bị bắt.',
      ref: 'Điều 118 Bộ luật Tố tụng hình sự 2015'
    },
    {
      q: 'Chủ thể nào sau đây có thẩm quyền ký Quyết định khởi tố vụ án hình sự?',
      opts: [
        'Cán bộ điều tra thụ lý hồ sơ.',
        'Thủ trưởng hoặc Phó Thủ trưởng Cơ quan điều tra được phân công.',
        'Trưởng Công an xã bất kỳ.',
        'Kiểm tra viên Viện kiểm sát nhân dân.'
      ],
      ans: 'B',
      exp: 'Thủ trưởng, Phó Thủ trưởng Cơ quan điều tra có thẩm quyền ra quyết định khởi tố vụ án hình sự.',
      ref: 'Điều 36 & Điều 153 BLTTHS 2015'
    }
  ]

  const shortAnswers = [
    {
      q: 'Về hình thức cấu trúc nhà nước, Nước Cộng hòa xã hội chủ nghĩa Việt Nam là nhà nước:',
      ans: 'Nhà nước đơn nhất',
      exp: 'Việt Nam là một nhà nước đơn nhất, có chủ quyền quốc gia thống nhất, một hệ thống pháp luật và một hệ thống cơ quan nhà nước từ trung ương đến địa phương.',
      ref: 'Điều 1 Hiến pháp năm 2013'
    },
    {
      q: 'Nguyên tắc tổ chức và hoạt động cơ bản nhất của bộ máy Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam là nguyên tắc:',
      ans: 'Tập trung dân chủ',
      exp: 'Nguyên tắc tập trung dân chủ kết hợp sự lãnh đạo tập trung thống nhất của cấp trên với việc phát huy tính chủ động sáng tạo của cấp dưới và quyền làm chủ của nhân dân.',
      ref: 'Điều 8 Hiến pháp năm 2013'
    },
    {
      q: 'Cơ quan có thẩm quyền cao nhất thực hiện quyền công tố và kiểm sát hoạt động tư pháp tại Việt Nam là:',
      ans: 'Viện kiểm sát nhân dân tối cao',
      exp: 'Theo Hiến pháp 2013 và Luật Tổ chức VKSND, Viện kiểm sát nhân dân tối cao là cơ quan thực hành quyền công tố, kiểm sát hoạt động tư pháp cao nhất.',
      ref: 'Điều 107 Hiến pháp năm 2013'
    },
    {
      q: 'Hành vi vi phạm các quy định về trật tự, kỷ cương trong nội bộ cơ quan, đơn vị CAND sẽ bị xử lý theo hình thức trách nhiệm pháp lý nào?',
      ans: 'Trách nhiệm kỷ luật',
      exp: 'Cán bộ chiến sĩ vi phạm điều lệnh, kỷ luật nội bộ CAND phải chịu trách nhiệm kỷ luật theo quy định của Bộ Công an.',
      ref: 'Thông tư số 09/2021/TT-BCA về Điều lệnh CAND'
    },
    {
      q: 'Độ tuổi tối thiểu chịu trách nhiệm hình sự về mọi tội phạm theo quy định của Bộ luật Hình sự Việt Nam là đủ bao nhiêu tuổi?',
      ans: '16 tuổi',
      exp: 'Khoản 1 Điều 12 Bộ luật Hình sự 2015 quy định: Người từ đủ 16 tuổi trở lên phải chịu trách nhiệm hình sự về mọi tội phạm.',
      ref: 'Điều 12 Bộ luật Hình sự 2015'
    },
    {
      q: 'Văn bản quy phạm pháp luật do Chính phủ ban hành để quy định chi tiết điều, khoản, điểm được giao trong luật được gọi là:',
      ans: 'Nghị định',
      exp: 'Theo Luật Ban hành văn bản quy phạm pháp luật, Chính phủ ban hành Nghị định để quy định chi tiết các luật, nghị quyết của Quốc hội.',
      ref: 'Luật Ban hành văn bản quy phạm pháp luật 2015'
    }
  ]

  const questions: MultipleChoiceQuestion[] = []

  // Câu 1 đến 54: Trắc nghiệm 4 lựa chọn (A, B, C, D)
  for (let i = 1; i <= 54; i++) {
    const t = topics[(i - 1) % topics.length]
    const letters = ['A', 'B', 'C', 'D']
    const correctLetter = letters[(i - 1) % 4]
    
    // Đảo nhẹ thứ tự hoặc tạo options
    const options = [
      { id: `opt-${i}-a`, label: 'A', text: t.opts[0] },
      { id: `opt-${i}-b`, label: 'B', text: t.opts[1] },
      { id: `opt-${i}-c`, label: 'C', text: t.opts[2] },
      { id: `opt-${i}-d`, label: 'D', text: t.opts[3] }
    ]

    questions.push({
      id: `mc-q-${i}`,
      order: i,
      question: `Câu ${i}: ${t.q}`,
      options,
      correctAnswer: correctLetter,
      explanation: `[Câu ${i}] ${t.exp}`,
      legalReference: t.ref
    })
  }

  // Câu 55 đến 60: Trả lời ngắn / Điền khuyết
  for (let i = 55; i <= 60; i++) {
    const s = shortAnswers[i - 55]
    questions.push({
      id: `mc-q-${i}`,
      order: i,
      question: `Câu ${i}: ${s.q}`,
      options: [
        { id: `opt-${i}-ans`, label: 'Đáp án', text: s.ans }
      ],
      correctAnswer: s.ans,
      explanation: `[Câu ${i}] ${s.exp}`,
      legalReference: s.ref
    })
  }

  return questions
}
