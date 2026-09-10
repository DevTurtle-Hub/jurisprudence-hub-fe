import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

interface AuthPageProps {
  initialMode?: 'login' | 'register'
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const navigate = useNavigate()
  const { openAuthModal } = useAuth()

  useEffect(() => {
    openAuthModal()
    navigate('/', { replace: true })
  }, [navigate, openAuthModal, initialMode])

  return null
}

export default AuthPage
