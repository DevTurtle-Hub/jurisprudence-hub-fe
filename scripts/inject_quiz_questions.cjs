const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('d:/jurisprudence-hub-fe/scripts/generated_quiz_questions.json', 'utf8'));
const quizPagePath = 'd:/jurisprudence-hub-fe/src/pages/QuizPage.tsx';
let content = fs.readFileSync(quizPagePath, 'utf8');

const startMarker = 'const FALLBACK_QUESTIONS: QuizQuestionItem[] = [';
const endMarker = '\n]\n\n// Hàm phân loại câu hỏi từ dữ liệu Ngân hàng';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacement = `const FALLBACK_QUESTIONS: QuizQuestionItem[] = ${JSON.stringify(questions, null, 2)}`;
const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + 2);

fs.writeFileSync(quizPagePath, newContent, 'utf8');
console.log('Successfully injected 61 authentic questions into QuizPage.tsx!');
