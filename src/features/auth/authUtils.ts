export type { UserResponse } from '@/types/api';

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string;
  cccd?: string;
  phone?: string;
  avatarUrl?: string;
  loggedAt?: string;
  loggedInAt?: string;
  provider?: string;
}

// Lấy thông tin tài khoản đang đăng nhập từ LocalStorage
export function getCurrentUser(): UserProfile | null {
  try {
    const rawUserInfo = localStorage.getItem('user_info') || localStorage.getItem('currentUser');
    if (rawUserInfo) {
      const parsed = JSON.parse(rawUserInfo);
      if (parsed && typeof parsed === 'object') {
        return parsed as UserProfile;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc currentUser:', err);
  }
  return null;
}

// Kiểm tra xem người dùng hiện tại có phải là Quản Trị Viên (ADMIN) hay không
export function isAdminUser(): boolean {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return false;
  }
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}

// Kiểm tra người dùng đã đăng nhập chưa (có Access Token hợp lệ và thông tin người dùng)
export function isUserLoggedIn(): boolean {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const hasValidToken = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');
  return Boolean(hasValidToken && getCurrentUser());
}
