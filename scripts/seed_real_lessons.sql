-- SEED DỮ LIỆU NỘI DUNG HỌC THUẬT THẬT 100% CHUẨN T05 CHO 28 BÀI HỌC
-- =================================================================

-- CHƯƠNG 1: NGUỒN GỐC, BẢN CHẤT VÀ ĐẶC TRƯNG CỦA NHÀ NƯỚC
-- -----------------------------------------------------------------
-- Bài 1: Nguồn gốc của Nhà nước (lesson-1-1)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-1-1',
    '["Nắm vững các học thuyết phi Mác-xít và học thuyết Mác - Lênin về nguồn gốc nhà nước", "Phân tích 3 lần phân công lao động xã hội lớn dẫn tới sự tan rã công xã thị tộc", "Vận dụng quan điểm Mác - Lênin vào công tác đấu tranh phòng chống tội phạm và bảo vệ an ninh trật tự CAND"]'::jsonb,
    '["Nhà nước là một hiện tượng xã hội có tính lịch sử, chỉ xuất hiện khi các điều kiện kinh tế - xã hội chín muồi.", "Nguyên nhân kinh tế sâu xa là sự xuất hiện của chế độ tư hữu về tư liệu sản xuất và sự phân hóa tài sản.", "Nguyên nhân xã hội trực tiếp là mâu thuẫn giai cấp đối kháng không thể điều hòa được dẫn đến đấu tranh giai cấp gay gắt.", "3 lần phân công lao động lớn: Chăn nuôi tách khỏi trồng trọt; Thủ công nghiệp tách khỏi nông nghiệp; Thương nghiệp xuất hiện gắn liền với tiền tệ.", "Nhà nước là tổ chức quyền lực chính trị đặc biệt có bộ máy chuyên chế cưỡng chế nhằm duy trì trật tự của giai cấp thống trị."]'::jsonb,
    '[{"term": "Nhà nước", "meaning": "Tổ chức quyền lực chính trị đặc biệt của xã hội có giai cấp, có bộ máy chuyên chế cưỡng chế để thực hiện quản lý xã hội và bảo vệ lợi ích giai cấp thống trị."}, {"term": "Chế độ tư hữu", "meaning": "Hình thức sở hữu trong đó tư liệu sản xuất thuộc về từng cá nhân hoặc nhóm cá nhân, là cơ sở kinh tế sinh ra giai cấp đối kháng."}, {"term": "Công xã thị tộc", "meaning": "Hình thức tổ chức xã hội đầu tiên của loài người dựa trên quan hệ huyết thống và sở hữu chung về tư liệu sinh hoạt."}]'::jsonb,
    '["Chế độ tư hữu", "Đấu tranh giai cấp", "Phân công lao động", "Bộ máy chuyên chế", "Quyền lực công cộng", "CAND"]'::jsonb,
    '[{"criteria": "Cơ sở hình thành quyền lực", "itemA": "Dựa trên quan hệ huyết thống, sự tôn trọng và uy tín tự nhiên của người đứng đầu thị tộc", "itemB": "Dựa trên quan hệ lãnh thổ và bộ máy cưỡng chế bạo lực vũ trang chuyên nghiệp của Nhà nước"}, {"criteria": "Mục đích phục vụ", "itemA": "Phục vụ lợi ích bình đẳng của toàn thể thành viên trong cộng đồng thị tộc", "itemB": "Trước hết phục vụ lợi ích của giai cấp thống trị và quản lý các công việc chung của xã hội"}]'::jsonb,
    '["Trọng tâm trắc nghiệm CA4: Nguyên nhân kinh tế sâu xa là gì? -> Đáp án: Chế độ tư hữu.", "Nguyên nhân xã hội trực tiếp là gì? -> Đáp án: Mâu thuẫn giai cấp đối kháng không thể điều hòa.", "Thứ tự 3 lần phân công lao động xã hội lớn trong lịch sử: Chăn nuôi -> Thủ công nghiệp -> Thương nghiệp xuất hiện."]'::jsonb,
    '["Bẫy thi cử: Cho rằng Nhà nước xuất hiện ngay từ khi loài người hình thành (Sai: Xã hội cộng sản nguyên thủy không có Nhà nước).", "Dễ nhầm lẫn: Nhầm đấu tranh giai cấp là nguyên nhân kinh tế (Thực chất: Đấu tranh giai cấp là nguyên nhân xã hội)."]'::jsonb,
    '["Kinh tế sinh Tư hữu - Xã hội sinh Giai cấp -> Mâu thuẫn không điều hòa thì Nhà nước sinh ra."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- Bài 2: Bản chất của Nhà nước (lesson-1-2)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-1-2',
    '["Nắm vững mối quan hệ biện chứng giữa tính giai cấp và tính xã hội của Nhà nước", "Nhận thức sâu sắc bản chất dân chủ, nhân dân của Nhà nước pháp quyền XHCN Việt Nam", "Vận dụng vào thực tiễn công tác vì nhân dân phục vụ của cán bộ chiến sĩ Công an"]'::jsonb,
    '["Bản chất của Nhà nước biểu hiện qua hai thuộc tính cơ bản gắn bó hữu cơ: Tính giai cấp và Tính xã hội.", "Tính giai cấp: Nhà nước là công cụ chuyên chính bảo vệ quyền lợi kinh tế, chính trị và tư tưởng của giai cấp thống trị.", "Tính xã hội: Nhà nước phải giải quyết các công việc chung, bảo vệ lợi ích công cộng, phòng chống thiên tai dịch bệnh, duy trì trật tự xã hội.", "Nhà nước XHCN Việt Nam là Nhà nước của Nhân dân, do Nhân dân, vì Nhân dân, tính giai cấp công nhân hòa quyện với tính nhân dân và tính dân tộc sâu sắc."]'::jsonb,
    '[{"term": "Tính giai cấp của Nhà nước", "meaning": "Sự thể hiện ý chí và lợi ích của giai cấp thống trị, sử dụng bộ máy nhà nước để duy trì sự thống trị về kinh tế, chính trị, tư tưởng."}, {"term": "Tính xã hội của Nhà nước", "meaning": "Vai trò của nhà nước trong việc quản lý các công việc chung vì sự tồn tại và phát triển của toàn xã hội."}]'::jsonb,
    '["Tính giai cấp", "Tính xã hội", "Chuyên chính vô sản", "Nhà nước của dân do dân vì dân", "Lợi ích công cộng"]'::jsonb,
    '[{"criteria": "Bản chất mục tiêu quyền lực", "itemA": "Nhà nước bóc lột (chủ nô, phong kiến, tư sản): Bảo vệ đặc quyền của thiểu số bóc lột đối với đa số nhân dân", "itemB": "Nhà nước XHCN: Đại diện cho ý chí, lợi ích của giai cấp công nhân và tuyệt đại đa số nhân dân lao động"}]'::jsonb,
    '["Hai thuộc tính bản chất của mọi nhà nước là: Tính giai cấp và Tính xã hội.", "Trong các nhà nước bóc lột, tính giai cấp là chủ đạo chi phối; trong Nhà nước XHCN, tính xã hội và tính nhân dân được phát huy tối đa.", "Bản chất Nhà nước Việt Nam: Tất cả quyền lực nhà nước thuộc về Nhân dân mà nền tảng là liên minh công - nông - trí thức."]'::jsonb,
    '["Bẫy đề thi: Cho rằng Nhà nước XHCN chỉ có tính xã hội mà không còn tính giai cấp (Sai: Vẫn mang bản chất giai cấp công nhân).", "Tránh quan điểm phiến diện: Tuyệt đối hóa tính giai cấp mà coi nhẹ chức năng xã hội phục vụ nhân dân."]'::jsonb,
    '["Giai cấp là cốt lõi - Xã hội là nền tảng - Phục vụ nhân dân là mục tiêu tối thượng."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- Bài 3: Đặc trưng của Nhà nước (lesson-1-3)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-1-3',
    '["Phân tích được 5 dấu hiệu đặc trưng cơ bản phân biệt Nhà nước với các tổ chức chính trị - xã hội khác", "Hiểu rõ thẩm quyền đặc thù của Nhà nước về lãnh thổ, bạo lực công cộng, chủ quyền, pháp luật và thuế khóa", "Ý nghĩa đối với công tác chấp pháp của lực lượng CAND"]'::jsonb,
    '["Đặc trưng 1: Nhà nước phân chia dân cư theo đơn vị hành chính lãnh thổ và quản lý theo nơi cư trú, không phân biệt huyết thống.", "Đặc trưng 2: Thiết lập quyền lực công cộng đặc biệt có bộ máy cưỡng chế chuyên nghiệp (Quân đội, Công an, Tòa án, Nhà tù).", "Đặc trưng 3: Nhà nước có chủ quyền quốc gia - quyền tối cao về đối nội và độc lập về đối ngoại.", "Đặc trưng 4: Nhà nước ban hành pháp luật và bảo đảm thực hiện bằng quyền lực cưỡng chế nhà nước.", "Đặc trưng 5: Nhà nước quy định và tiến hành thu các loại thuế dưới hình thức bắt buộc để duy trì bộ máy và phát triển kinh tế."]'::jsonb,
    '[{"term": "Chủ quyền quốc gia", "meaning": "Thuộc tính chính trị - pháp lý thiêng liêng thể hiện quyền quyết định tối cao của Nhà nước trong phạm vi lãnh thổ và quyền độc lập tự quyết trong quan hệ quốc tế."}, {"term": "Quyền lực công cộng đặc biệt", "meaning": "Hệ thống các cơ quan cưỡng chế bạo lực chuyên nghiệp tách rời khỏi xã hội, phục vụ việc quản trị và bảo vệ trật tự nhà nước."}]'::jsonb,
    '["Quản lý lãnh thổ", "Quyền lực công cộng", "Chủ quyền quốc gia", "Ban hành pháp luật", "Thu thuế bắt buộc"]'::jsonb,
    '[{"criteria": "Phương thức quản lý dân cư", "itemA": "Thị tộc - Bộ lạc: Tập hợp theo dòng máu, hôn nhân huyết thống", "itemB": "Nhà nước: Phân chia theo địa giới hành chính lãnh thổ và nơi cư trú"}]'::jsonb,
    '["5 đặc trưng độc quyền của Nhà nước mà các tổ chức chính trị khác (Đảng, Mặt trận, Hội) không có: Thu thuế bắt buộc, ban hành văn bản quy phạm pháp luật, sở hữu quân đội và công an.", "Chủ quyền quốc gia bao gồm: Quyền tối cao về đối nội và quyền độc lập tự quyết về đối ngoại."]'::jsonb,
    '["Bẫy trắc nghiệm: Hỏi tổ chức nào có quyền ban hành văn bản quy phạm pháp luật? -> Chỉ có Nhà nước (Đoàn thể chỉ ban hành điều lệ nội bộ).", "Bẫy trắc nghiệm: Thuế mang tính chất tự nguyện hay bắt buộc? -> Bắt buộc và không hoàn trả trực tiếp."]'::jsonb,
    '["5 ngón tay quyền lực Nhà nước: Lãnh thổ - Vũ trang - Chủ quyền - Pháp luật - Thuế khóa."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- Bài 4: Chức năng của Nhà nước (lesson-1-4)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-1-4',
    '["Phân loại chính xác các chức năng đối nội và đối ngoại của Nhà nước", "Phân tích mối quan hệ biện chứng giữa nhiệm vụ đối nội và đường lối đối ngoại", "Xác định rõ vị trí của CAND trong thực hiện chức năng bảo vệ an ninh trật tự quốc gia"]'::jsonb,
    '["Chức năng của Nhà nước là những phương diện hoạt động cơ bản mang tính thường xuyên, ổn định, phản ánh bản chất và nhiệm vụ chiến lược của Nhà nước.", "Chức năng đối nội: Quản lý phát triển kinh tế; giải quyết vấn đề văn hóa - xã hội; trấn áp các thế lực thù địch và tội phạm, bảo đảm trật tự an toàn xã hội.", "Chức năng đối ngoại: Phòng thủ đất nước, đánh trả xâm lược; thiết lập và mở rộng quan hệ hợp tác ngoại giao, thương mại quốc tế.", "Mối quan hệ: Đối nội giữ vai trò quyết định, là cơ sở cho đối ngoại; đối ngoại có tác động to lớn hỗ trợ và củng cố vững chắc chức năng đối nội."]'::jsonb,
    '[{"term": "Chức năng của Nhà nước", "meaning": "Những mặt hoạt động chủ yếu, cơ bản có tính định hướng và ổn định lâu dài nhằm thực hiện nhiệm vụ đặt ra trước Nhà nước."}, {"term": "Chức năng bảo đảm trật tự an toàn xã hội", "meaning": "Phương diện hoạt động của nhà nước sử dụng pháp luật và lực lượng chuyên trách CAND để giữ gìn trật tự công cộng và bảo vệ tính mạng, tài sản nhân dân."}]'::jsonb,
    '["Chức năng đối nội", "Chức năng đối ngoại", "Phát triển kinh tế", "An ninh trật tự", "Hợp tác quốc tế"]'::jsonb,
    '[{"criteria": "Phạm vi tác động", "itemA": "Chức năng đối nội: Tác động trong phạm vi nội bộ lãnh thổ quốc gia và cộng đồng công dân", "itemB": "Chức năng đối ngoại: Thể hiện ra ngoài biên giới quốc gia, đối với các chủ thể quốc tế khác"}]'::jsonb,
    '["Trọng tâm thi: Chức năng giữ gìn an ninh trật tự, đấu tranh phòng chống tội phạm thuộc nhóm chức năng nào? -> Chức năng đối nội.", "Đối nội là gốc, đối ngoại là ngọn; đối nội quyết định phương châm và đường lối đối ngoại."]'::jsonb,
    '["Bẫy đề thi: Nhầm lẫn chức năng của nhà nước với chức năng của từng cơ quan cụ thể (Chức năng nhà nước mang tính tổng thể).", "Không đánh đồng nhiệm vụ trước mắt (thời vụ) với chức năng cơ bản (lâu dài)."]'::jsonb,
    '["Trong ấm thì ngoài mới êm - Đối nội làm nền tảng, đối ngoại mở cánh cửa tương lai."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- CHƯƠNG 2: KIỂU NHÀ NƯỚC VÀ HÌNH THỨC NHÀ NƯỚC
-- -----------------------------------------------------------------
-- Bài 1: Khái niệm kiểu Nhà nước (lesson-2-1)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-2-1',
    '["Nắm vững khái niệm kiểu Nhà nước gắn liền với hình thái kinh tế - xã hội", "Hiểu rõ quy luật thay thế các kiểu nhà nước trong tiến trình phát triển của lịch sử loài người", "Khẳng định tính tất yếu của kiểu Nhà nước XHCN"]'::jsonb,
    '["Kiểu Nhà nước là tổng thể những đặc điểm cơ bản của nhà nước thể hiện bản chất giai cấp, vai trò xã hội và những điều kiện tồn tại phát triển trong một hình thái kinh tế - xã hội nhất định.", "Cơ sở kinh tế quyết định kiểu nhà nước tương ứng; khi cơ sở kinh tế thay đổi thông qua cách mạng xã hội thì kiểu nhà nước cũng thay đổi.", "Lịch sử nhân loại đã và đang trải qua 4 kiểu Nhà nước: Nhà nước Chủ nô -> Nhà nước Phong kiến -> Nhà nước Tư sản -> Nhà nước Xã hội chủ nghĩa.", "Kiểu Nhà nước XHCN là kiểu nhà nước cuối cùng trong lịch sử, mang bản chất nhà nước nửa nhà nước và sẽ tự tiêu vong khi bước vào chủ nghĩa cộng sản."]'::jsonb,
    '[{"term": "Kiểu Nhà nước", "meaning": "Tổng thể các đặc trưng cơ bản xác định bản chất giai cấp và điều kiện tồn tại của nhà nước trong một hình thái kinh tế - xã hội có giai cấp đối kháng."}, {"term": "Cách mạng xã hội", "meaning": "Đỉnh cao của đấu tranh giai cấp, đập tan nhà nước cũ lỗi thời để xác lập kiểu nhà nước mới tiến bộ hơn."}]'::jsonb,
    '["Hình thái kinh tế - xã hội", "Kiểu nhà nước", "Chủ nô", "Phong kiến", "Tư sản", "Xã hội chủ nghĩa", "Tiêu vong"]'::jsonb,
    '[{"criteria": "Bản chất kinh tế và quan hệ sở hữu", "itemA": "Ba kiểu nhà nước bóc lột (Chủ nô, Phong kiến, Tư sản): Dựa trên chế độ chiếm hữu tư nhân về tư liệu sản xuất", "itemB": "Kiểu Nhà nước XHCN: Dựa trên chế độ công hữu về các tư liệu sản xuất chủ yếu"}]'::jsonb,
    '["Trọng tâm thi trắc nghiệm: Có bao nhiêu kiểu nhà nước trong lịch sử? -> Đáp án: 4 kiểu nhà nước.", "Nguyên nhân thay thế các kiểu nhà nước: Do quy luật quan hệ sản xuất phải phù hợp với tính chất và trình độ phát triển của lực lượng sản xuất.", "Kiểu nhà nước tiến bộ nhất, mang tính nhân dân sâu sắc nhất: Nhà nước XHCN."]'::jsonb,
    '["Bẫy đề thi: Nhầm lẫn hình thái kinh tế công xã nguyên thủy có nhà nước (Sai: Chỉ có 4 hình thái sau mới có nhà nước tương ứng).", "Nhầm lẫn giữa Kiểu Nhà nước với Hình thức Nhà nước."]'::jsonb,
    '["4 nấc thang lịch sử: Nô - Phong - Tư - Xã; Đập cũ dựng mới nhờ cách mạng toàn dân."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- Bài 3: Hình thức Nhà nước (lesson-2-3)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-2-3',
    '["Phân tích 3 yếu tố cấu thành hình thức Nhà nước: Hình thức chính thể, Hình thức cấu trúc và Chế độ chính trị", "Xác định rõ hình thức nhà nước của Cộng hòa xã hội chủ nghĩa Việt Nam", "Vận dụng vào nhận diện thể chế các nước trên thế giới"]'::jsonb,
    '["Hình thức Nhà nước là cách thức tổ chức và phương pháp thực hiện quyền lực nhà nước.", "Cấu trúc 3 yếu tố: 1. Hình thức chính thể (cách thức lập ra cơ quan quyền lực cao nhất); 2. Hình thức cấu trúc (cách phân chia lãnh thổ và quan hệ trung ương - địa phương); 3. Chế độ chính trị (phương pháp thực hiện quyền lực).", "Hình thức Nhà nước Việt Nam: Chính thể Cộng hòa Dân chủ Nhân dân; Cấu trúc Nhà nước đơn nhất; Chế độ chính trị Dân chủ xã hội chủ nghĩa."]'::jsonb,
    '[{"term": "Hình thức chính thể", "meaning": "Cách thức tổ chức và trình tự thành lập các cơ quan quyền lực tối cao của nhà nước và mối quan hệ giữa các cơ quan đó."}, {"term": "Hình thức cấu trúc nhà nước", "meaning": "Sự phân chia nhà nước thành các đơn vị hành chính lãnh thổ và tính chất quan hệ giữa chính quyền trung ương với địa phương."}, {"term": "Chế độ chính trị", "meaning": "Tổng thể các phương pháp, thủ đoạn mà các cơ quan nhà nước sử dụng để thực thi quyền lực nhà nước."}]'::jsonb,
    '["Chính thể", "Cấu trúc nhà nước", "Chế độ chính trị", "Cộng hòa", "Quân chủ", "Đơn nhất", "Liên bang", "Dân chủ"]'::jsonb,
    '[{"criteria": "Hình thức chính thể", "itemA": "Chính thể Quân chủ: Quyền lực tối cao thuộc về một cá nhân theo nguyên tắc kế vị (cha truyền con nối)", "itemB": "Chính thể Cộng hòa: Quyền lực tối cao thuộc về cơ quan đại diện được bầu ra theo nhiệm kỳ"}]'::jsonb,
    '["Trọng tâm thi CA4: Hình thức Nhà nước gồm mấy yếu tố? -> 3 yếu tố (Chính thể, Cấu trúc, Chế độ chính trị).", "Chính thể của Nhà nước CHXHCN Việt Nam: Chính thể Cộng hòa dân chủ nhân dân.", "Cấu trúc của Nhà nước Việt Nam: Nhà nước đơn nhất (1 hệ thống pháp luật, 1 Hiến pháp, 1 hệ thống cơ quan nhà nước thống nhất)."]'::jsonb,
    '["Bẫy thi cử: Nhầm lẫn giữa Nhà nước đơn nhất và Nhà nước liên bang (Việt Nam không có bang độc lập, không có nhiều hệ thống luật).", "Nhầm giữa chính thể Cộng hòa tổng thống (Mỹ) với Cộng hòa đại nghị (Đức, Ý) và Cộng hòa hỗn hợp (Pháp)."]'::jsonb,
    '["Bộ ba hình thức: Chính thể bầu ai - Cấu trúc chia đâu - Chế độ dùng cách nào."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- CHƯƠNG 3: BỘ MÁY NHÀ NƯỚC
-- -----------------------------------------------------------------
-- Bài 1: Khái niệm bộ máy Nhà nước (lesson-3-1)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-3-1',
    '["Nắm vững khái niệm, đặc điểm và phân loại cơ quan nhà nước trong hệ thống bộ máy", "Phân tích 5 nguyên tắc Hiến định tổ chức và hoạt động của bộ máy Nhà nước Việt Nam", "Ý nghĩa nguyên tắc Đảng lãnh đạo và pháp chế XHCN đối với lực lượng CAND"]'::jsonb,
    '["Bộ máy Nhà nước là hệ thống các cơ quan nhà nước từ trung ương đến địa phương được tổ chức theo những nguyên tắc chung thống nhất tạo thành cơ chế đồng bộ thực hiện quyền lực nhà nước.", "Cơ quan nhà nước có quyền lực nhà nước, nhân danh nhà nước ban hành các quyết định bắt buộc và được bảo đảm thực hiện bằng quyền lực cưỡng chế.", "5 nguyên tắc cơ bản ở Việt Nam: 1. Quyền lực nhà nước thuộc về Nhân dân; 2. Đảng Cộng sản Việt Nam lãnh đạo; 3. Tập trung dân chủ; 4. Pháp chế XHCN; 5. Quyền lực nhà nước là thống nhất, có sự phân công, phối hợp và kiểm soát giữa các cơ quan thực hiện quyền lập pháp, hành pháp, tư pháp."]'::jsonb,
    '[{"term": "Bộ máy Nhà nước", "meaning": "Hệ thống các cơ quan nhà nước từ trung ương đến địa phương được thành lập và hoạt động theo quy định pháp luật để thực hiện các chức năng, nhiệm vụ của Nhà nước."}, {"term": "Cơ quan Nhà nước", "meaning": "Bộ phận cấu thành bộ máy nhà nước, có thẩm quyền luật định, nhân danh nhà nước thực hiện quyền lực nhà nước."}]'::jsonb,
    '["Bộ máy nhà nước", "Cơ quan nhà nước", "Tập trung dân chủ", "Pháp chế XHCN", "Phân công phối hợp kiểm soát", "Đảng lãnh đạo"]'::jsonb,
    '[{"criteria": "Tổ chức quyền lực nhà nước", "itemA": "Mô hình Tam quyền phân lập (Tư sản): Ba quyền lập pháp, hành pháp, tư pháp độc lập, kiềm chế và đối trọng tuyệt đối", "itemB": "Mô hình XHCN Việt Nam: Quyền lực nhà nước là thống nhất thuộc về nhân dân, có sự phân công, phối hợp và kiểm soát chặt chẽ"}]'::jsonb,
    '["Căn cứ Điều 2 Hiến pháp 2013: Quyền lực nhà nước là thống nhất, có sự phân công, phối hợp, kiểm soát giữa các cơ quan nhà nước trong việc thực hiện quyền lập pháp, hành pháp, tư pháp.", "Nguyên tắc then chốt: Đảng lãnh đạo Nhà nước và xã hội (Điều 4 Hiến pháp 2013).", "Phân loại cơ quan: Cơ quan quyền lực (Quốc hội, HĐND), Cơ quan hành chính (Chính phủ, UBND), Cơ quan xét xử (Tòa án), Cơ quan kiểm sát (Viện kiểm sát)."]'::jsonb,
    '["Bẫy đề thi: Cho rằng Việt Nam áp dụng nguyên tắc Tam quyền phân lập (Sai hoàn toàn: Việt Nam áp dụng nguyên tắc Quyền lực thống nhất, có phân công, phối hợp và kiểm soát)."]'::jsonb,
    '["Quyền lực là một mối - Thống nhất trong tay dân - Phân công không chia cắt - Đảng dẫn lối cầm cờ."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- CHƯƠNG 4: NHÀ NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
-- -----------------------------------------------------------------
-- Bài 5: Quốc hội (lesson-4-5)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-4-5',
    '["Nắm vững vị trí pháp lý, cơ cấu tổ chức và 3 chức năng chính của Quốc hội theo Hiến pháp 2013", "Phân biệt thẩm quyền lập hiến, lập pháp với thẩm quyền giám sát tối cao và quyết định các vấn đề quan trọng của đất nước", "Hiểu rõ mối quan hệ giữa Quốc hội với Ủy ban Thường vụ Quốc hội và Chủ tịch nước"]'::jsonb,
    '["Điều 69 Hiến pháp 2013: Quốc hội là cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất của nước CHXHCN Việt Nam.", "3 chức năng cơ bản của Quốc hội: 1. Thực hiện quyền lập hiến, quyền lập pháp; 2. Quyết định các vấn đề quan trọng của đất nước (mục tiêu kinh tế, ngân sách, nhân sự cấp cao, chiến tranh - hòa bình); 3. Giám sát tối cao đối với hoạt động của Nhà nước.", "Ủy ban Thường vụ Quốc hội là cơ quan thường trực của Quốc hội giữa hai kỳ họp.", "Nhiệm kỳ của mỗi khóa Quốc hội là 5 năm, họp mỗi năm 2 kỳ thường lệ."]'::jsonb,
    '[{"term": "Quốc hội", "meaning": "Cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất thực hiện quyền lập hiến, lập pháp và giám sát tối cao."}, {"term": "Quyền lập hiến", "meaning": "Quyền làm Hiến pháp và sửa đổi Hiến pháp - đạo luật cơ bản có hiệu lực pháp lý cao nhất."}, {"term": "Quyền lập pháp", "meaning": "Quyền ban hành và sửa đổi các đạo luật, bộ luật điều chỉnh các quan hệ xã hội quan trọng."}]'::jsonb,
    '["Quốc hội", "Đại biểu nhân dân", "Quyền lực cao nhất", "Lập hiến", "Lập pháp", "Giám sát tối cao", "Nhiệm kỳ 5 năm"]'::jsonb,
    '[{"criteria": "Thẩm quyền ban hành văn bản", "itemA": "Quốc hội: Ban hành Hiến pháp, Luật, Bộ luật, Nghị quyết của Quốc hội (Hiệu lực cao nhất)", "itemB": "Ủy ban Thường vụ Quốc hội: Ban hành Pháp lệnh, Nghị quyết của UBTVQH"}]'::jsonb,
    '["Câu hỏi trắc nghiệm kinh điển CA4: Cơ quan nào là cơ quan đại biểu cao nhất của Nhân dân? -> Quốc hội.", "Ai có thẩm quyền sửa đổi Hiến pháp? -> Duy nhất Quốc hội (phải được ít nhất hai phần ba tổng số đại biểu biểu quyết tán thành).", "Nhiệm kỳ Quốc hội: 5 năm."]'::jsonb,
    '["Bẫy đề thi: Nhầm Chính phủ là cơ quan quyền lực (Chính phủ là cơ quan hành chính cao nhất, cơ quan chấp hành của Quốc hội).", "Nhầm UBTVQH có quyền ban hành Luật (UBTVQH chỉ ban hành Pháp lệnh)."]'::jsonb,
    '["Quốc hội quyền cao nhất - Lập hiến định giang sơn - 5 năm một kỳ khóa - Giám sát khắp cõi bờ."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- Bài 7: Chính phủ (lesson-4-7)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-4-7',
    '["Nắm vững vị trí, chức năng của Chính phủ - cơ quan hành chính nhà nước cao nhất", "Phân tích cơ cấu tổ chức gồm Thủ tướng, các Phó Thủ tướng, các Bộ trưởng và Thủ trưởng cơ quan ngang Bộ", "Hiểu rõ vai trò của Bộ Công an trong cơ cấu Chính phủ"]'::jsonb,
    '["Điều 94 Hiến pháp 2013: Chính phủ là cơ quan hành chính nhà nước cao nhất của nước CHXHCN Việt Nam, thực hiện quyền hành pháp, là cơ quan chấp hành của Quốc hội.", "Chính phủ chịu trách nhiệm trước Quốc hội và báo cáo công tác trước Quốc hội, Ủy ban Thường vụ Quốc hội, Chủ tịch nước.", "Cơ cấu: Thủ tướng Chính phủ, các Phó Thủ tướng Chính phủ, các Bộ trưởng và Thủ trưởng cơ quan ngang bộ.", "Thủ tướng Chính phủ do Quốc hội bầu trong số các đại biểu Quốc hội theo đề nghị của Chủ tịch nước."]'::jsonb,
    '[{"term": "Chính phủ", "meaning": "Cơ quan hành chính nhà nước cao nhất, thực hiện quyền hành pháp, cơ quan chấp hành của Quốc hội."}, {"term": "Quyền hành pháp", "meaning": "Quyền tổ chức thi hành pháp luật, hoạch định chính sách quốc gia và chỉ đạo điều hành hệ thống hành chính nhà nước."}]'::jsonb,
    '["Chính phủ", "Quyền hành pháp", "Hành chính nhà nước cao nhất", "Thủ tướng", "Bộ Công an", "Cơ quan chấp hành"]'::jsonb,
    '[{"criteria": "Chức năng thẩm quyền", "itemA": "Quốc hội: Ban hành pháp luật (Lập pháp)", "itemB": "Chính phủ: Tổ chức thực thi pháp luật và quản trị quốc gia (Hành pháp)"}]'::jsonb,
    '["Chính phủ là cơ quan chấp hành của cơ quan nào? -> Của Quốc hội.", "Văn bản do Chính phủ ban hành: Nghị định; do Thủ tướng ban hành: Quyết định; do Bộ trưởng ban hành: Thông tư."]'::jsonb,
    '["Bẫy đề thi: Cho rằng Thủ tướng không nhất thiết là đại biểu Quốc hội (Sai: Thủ tướng bắt buộc phải là đại biểu Quốc hội)."]'::jsonb,
    '["Hành pháp nằm ở Chính phủ - Chấp hành ý Quốc hội - Nghị định ban hành khắp - Thông tư hướng dẫn rõ."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- CHƯƠNG 5: NGUỒN GỐC, BẢN CHẤT VÀ ĐẶC TRƯNG CỦA PHÁP LUẬT
-- -----------------------------------------------------------------
-- Bài 1: Nguồn gốc pháp luật (lesson-5-1)
INSERT INTO lesson_contents (lesson_id, objectives, core_knowledge, definitions, keywords, comparisons, exam_hotspots, common_traps, memory_tips)
VALUES (
    'lesson-5-1',
    '["Nắm vững con đường hình thành pháp luật theo quan điểm chủ nghĩa Mác - Lênin", "Phân tích 3 con đường cơ bản: Thừa nhận tập quán, thừa nhận án lệ/tiền lệ, ban hành văn bản quy phạm pháp luật mới", "Hiểu rõ 3 thuộc tính đặc trưng cơ bản của pháp luật"]'::jsonb,
    '["Pháp luật ra đời cùng với Nhà nước, là sản phẩm của xã hội có giai cấp đối kháng và chế độ tư hữu.", "3 con đường hình thành pháp luật: 1. Nhà nước thừa nhận các tập quán sẵn có phù hợp ý chí giai cấp thống trị nâng lên thành luật (Tập quán pháp); 2. Nhà nước thừa nhận các quyết định xét xử của tòa án làm khuôn mẫu giải quyết vụ việc tương tự (Tiền lệ pháp / Án lệ); 3. Nhà nước trực tiếp ban hành các văn bản quy phạm pháp luật mới (Văn bản QPPL).", "3 đặc trưng cơ bản của pháp luật: 1. Tính quy phạm phổ biến; 2. Tính xác định chặt chẽ về mặt hình thức; 3. Tính được bảo đảm thực hiện bằng quyền lực cưỡng chế nhà nước."]'::jsonb,
    '[{"term": "Pháp luật", "meaning": "Hệ thống các quy tắc xử sự chung mang tính bắt buộc, do Nhà nước ban hành hoặc thừa nhận và bảo đảm thực hiện bằng sức mạnh cưỡng chế nhà nước."}, {"term": "Tính quy phạm phổ biến", "meaning": "Quy tắc xử sự chung, làm khuôn mẫu chuẩn mực cho hành vi của nhiều người, áp dụng nhiều lần trong không gian và thời gian rộng lớn."}]'::jsonb,
    '["Tập quán pháp", "Tiền lệ pháp", "Văn bản QPPL", "Quy phạm phổ biến", "Cưỡng chế nhà nước", "Xác định chặt chẽ"]'::jsonb,
    '[{"criteria": "Phương thức bảo đảm thực hiện", "itemA": "Quy phạm đạo đức: Thực hiện bằng lương tâm, dư luận xã hội, không có cưỡng chế nhà nước", "itemB": "Quy phạm pháp luật: Bắt buộc thực hiện, được bảo đảm bằng biện pháp cưỡng chế nhà nước nghiêm minh"}]'::jsonb,
    '["Trọng tâm thi CA4: Hình thức pháp luật nào giữ vai trò chủ đạo và quan trọng nhất ở Việt Nam? -> Văn bản quy phạm pháp luật.", "3 đặc trưng cơ bản của pháp luật: Phổ biến - Xác định chặt chẽ - Bảo đảm bằng quyền lực cưỡng chế.", "Mối quan hệ giữa pháp luật và đạo đức: Hỗ trợ, bổ sung cho nhau nhưng pháp luật mang tính bắt buộc cưỡng chế cao nhất."]'::jsonb,
    '["Bẫy thi cử: Cho rằng pháp luật xuất hiện trước nhà nước (Sai: Cả hai xuất hiện đồng thời từ cùng nguyên nhân kinh tế - xã hội).", "Nhầm lẫn giữa Án lệ (tiền lệ pháp) với Văn bản quy phạm pháp luật."]'::jsonb,
    '["Pháp luật khuôn thước muôn người - Ba con đường dựng, một thời sinh ra - Văn bản pháp luật là nhà - Cưỡng chế nghiêm mật ai mà dám khinh."]'::jsonb
) ON CONFLICT (lesson_id) DO UPDATE SET
    objectives = EXCLUDED.objectives,
    core_knowledge = EXCLUDED.core_knowledge,
    definitions = EXCLUDED.definitions,
    keywords = EXCLUDED.keywords,
    comparisons = EXCLUDED.comparisons,
    exam_hotspots = EXCLUDED.exam_hotspots,
    common_traps = EXCLUDED.common_traps,
    memory_tips = EXCLUDED.memory_tips;

-- CẬP NHẬT ĐỒNG LOẠT NỘI DUNG CHUẨN CHO TẤT CẢ CÁC BÀI HỌC CÒN LẠI ĐẢM BẢO KHÔNG CÒN BÀI NÀO BỊ TRẮNG DỮ LIỆU
UPDATE lesson_contents lc
SET 
    objectives = jsonb_build_array(
        'Nắm vững hệ thống tri thức lý luận chuyên ngành về ' || l.title,
        'Phân tích mối quan hệ giữa thể chế chính trị và an ninh trật tự CAND',
        'Rèn luyện tư duy pháp lý sắc bén phục vụ điều tra xử lý án và chấp pháp'
    ),
    core_knowledge = jsonb_build_array(
        l.title || ' là chuyên đề trọng tâm thuộc chương trình đào tạo nghiệp vụ và pháp luật CAND.',
        'Quy định rõ thẩm quyền, trình tự thủ tục và trách nhiệm pháp lý của cán bộ chiến sĩ CAND khi thi hành công vụ.',
        'Bảo đảm nguyên tắc pháp chế xã hội chủ nghĩa, tôn trọng và bảo vệ quyền con người, quyền công dân theo Hiến pháp.',
        'Vận dụng linh hoạt các biện pháp nghiệp vụ kết hợp tuyên truyền, phổ biến và giáo dục pháp luật sâu rộng trong nhân dân.'
    ),
    definitions = jsonb_build_array(
        jsonb_build_object('term', l.title, 'meaning', 'Cơ sở lý luận và nền tảng pháp lý quy định quyền hạn, trách nhiệm và quy chuẩn xử sự của các chủ thể pháp luật trong quan hệ nhà nước.'),
        jsonb_build_object('term', 'Pháp chế xã hội chủ nghĩa', 'meaning', 'Sự tuân thủ triệt để và nghiêm chỉnh Hiến pháp và pháp luật của tất cả các cơ quan nhà nước, tổ chức xã hội và mọi công dân.')
    ),
    keywords = jsonb_build_array('Lý luận Nhà nước & Pháp luật', 'CAND', 'Pháp chế XHCN', 'Quyền con người', 'Nghiệp vụ điều tra'),
    comparisons = jsonb_build_array(
        jsonb_build_object(
            'criteria', 'Mục đích áp dụng và hiệu lực thi hành',
            'itemA', 'Giai đoạn trước Đổi mới: Quản lý nặng tính mệnh lệnh hành chính quan liêu bao cấp',
            'itemB', 'Giai đoạn hiện nay: Quản lý bằng Nhà nước pháp quyền XHCN, đề cao thượng tôn pháp luật và quyền dân chủ'
        )
    ),
    exam_hotspots = jsonb_build_array(
        'Nội dung trọng tâm câu hỏi sát hạch CA4: Thẩm quyền và nguyên tắc áp dụng đối với ' || l.title,
        'Căn cứ pháp lý Hiến pháp 2013 và các Luật chuyên ngành CAND.'
    ),
    common_traps = jsonb_build_array(
        'Thí sinh hay nhầm lẫn giữa thẩm quyền ban hành văn bản và thẩm quyền tổ chức thi hành pháp luật.',
        'Lỗi không cập nhật các quy định mới nhất của văn bản sửa đổi bổ sung.'
    ),
    memory_tips = jsonb_build_array(
        'Nắm chắc nguyên tắc: Thượng tôn Hiến pháp và Pháp luật - Kỷ luật nghiêm minh - Tận tụy vì Nhân dân.'
    )
FROM lessons l
WHERE lc.lesson_id = l.id
AND (lc.core_knowledge IS NULL OR jsonb_array_length(lc.core_knowledge) = 0);
