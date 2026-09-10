ALTER TABLE exam_questions_mc ALTER COLUMN correct_answer TYPE VARCHAR(255);
UPDATE exam_questions_mc SET correct_answer = 'Nhà nước đơn nhất' WHERE order_index = 55;
UPDATE exam_questions_mc SET correct_answer = 'Tập trung dân chủ' WHERE order_index = 56;
UPDATE exam_questions_mc SET correct_answer = '4' WHERE order_index = 57;
UPDATE exam_questions_mc SET correct_answer = 'Năng lực pháp luật' WHERE order_index = 58;
UPDATE exam_questions_mc SET correct_answer = 'Vô ý do cẩu thả' WHERE order_index = 59;
UPDATE exam_questions_mc SET correct_answer = 'Trách nhiệm kỷ luật' WHERE order_index = 60;
