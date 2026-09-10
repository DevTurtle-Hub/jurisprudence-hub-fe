import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { LessonPage } from '@/pages/LessonPage'
import { QuizPage } from '@/pages/QuizPage'
import { DocumentPage } from '@/pages/DocumentPage'
import { LessonDetailPage } from '@/pages/LessonDetailPage'
import { ExamPage } from '@/pages/ExamPage'
import { ExamTakingPage } from '@/pages/ExamTakingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { QuestionBankPage } from '@/pages/QuestionBankPage'

// Định nghĩa Router của hệ thống sử dụng React Router v6 Data Router API
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-950">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-red-600">404 - Không tìm thấy trang</h1>
          <p className="text-slate-600 dark:text-slate-400">Đường dẫn bạn truy cập không tồn tại hoặc đã bị di dời.</p>
          <a href="/" className="inline-block rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700">
            Quay về Trang chủ
          </a>
        </div>
      </div>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <HomePage />,
      },
      {
        path: 'register',
        element: <HomePage />,
      },
      {
        path: 'lessons',
        element: <LessonPage />,
      },
      {
        path: 'documents',
        element: <DocumentPage />,
      },
      {
        path: 'documents/:lessonId',
        element: <LessonDetailPage />,
      },
      {
        path: 'exams',
        element: <ExamPage />,
      },
      {
        path: 'exams/:roomId',
        element: <ExamTakingPage />,
      },
      {
        path: 'exams/:roomId/take',
        element: <ExamTakingPage />,
      },
      {
        path: 'exam/:roomId',
        element: <ExamTakingPage />,
      },
      {
        path: 'exam-room/:roomId',
        element: <ExamTakingPage />,
      },
      {
        path: 'quiz',
        element: <QuizPage />,
      },
      {
        path: 'question-bank',
        element: <QuestionBankPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: (
          <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
            <div className="space-y-4 max-w-md">
              <h1 className="text-3xl font-extrabold text-red-600">404 - Không tìm thấy trang</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Đường dẫn bạn truy cập không tồn tại hoặc đã bị di dời.</p>
              <a href="/documents" className="inline-block rounded-xl bg-[#5d5fef] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#4b4dc9]">
                Quay về Thư viện bài học
              </a>
            </div>
          </div>
        ),
      },
    ],
  },
])
