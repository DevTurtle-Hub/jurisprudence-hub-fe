import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, type UserProfile } from './authUtils';
import { AuthApi } from '@/services/api';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  targetRedirectPath: string | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [targetRedirectPath, setTargetRedirectPath] = useState<string | null>(null);

  // Đồng bộ với localStorage khi có sự kiện storage thay đổi
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Khi khởi động, nếu có token thì gọi getMe để xác minh và đồng bộ thông tin mới nhất
  useEffect(() => {
    const rawToken = localStorage.getItem('access_token');
    const token = rawToken && rawToken !== 'undefined' && rawToken !== 'null' && rawToken.trim() !== ''
      ? rawToken.trim()
      : null;

    if (token) {
      AuthApi.getMe()
        .then((profile) => {
          const updatedUser: UserProfile = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            unit: profile.unit,
            avatarUrl: profile.avatarUrl,
            loggedAt: profile.updatedAt || profile.createdAt,
          };
          localStorage.setItem('user_info', JSON.stringify(updatedUser));
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        })
        .catch((err) => {
          console.warn('Phiên đăng nhập không còn hiệu lực:', err);
          setCurrentUser(null);
        });
    } else {
      setCurrentUser(null);
    }
  }, []);

  const login = (user: UserProfile) => {
    localStorage.setItem('user_info', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    AuthApi.logout();
    setCurrentUser(null);
  };

  const openAuthModal = (redirectPath?: string) => {
    if (redirectPath) {
      setTargetRedirectPath(redirectPath);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setTargetRedirectPath(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser && localStorage.getItem('access_token')),
        isAuthModalOpen,
        targetRedirectPath,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
