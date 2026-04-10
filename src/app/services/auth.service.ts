import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// ==========================================
// User Interface
// ==========================================
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  provider?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageKey = 'ferrariAuth';
  private usersKey = 'ferrariUsers';
  
  // BehaviorSubject để track thay đổi của user hiện tại
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // BehaviorSubject để track trạng thái đăng nhập
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  signUp(name: string, email: string, password: string): { success: boolean; message: string } {
    if (!name || !email || !password) {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin!' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
    }

    const users = this.getAllUsers();
    if (users.some((u: User) => u.email === email)) {
      return { success: false, message: 'Email đã được đăng ký!' };
    }

    const newUser: User = {
      id: this.generateId(),
      name: name,
      email: email,
      password: this.hashPassword(password),
      provider: 'local',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    const userForStorage: User = { ...newUser, password: undefined };
    this.setCurrentUser(userForStorage);

    return { success: true, message: 'Đăng ký thành công!' };
  }

  signIn(email: string, password: string): { success: boolean; message: string } {
    if (!email || !password) {
      return { success: false, message: 'Vui lòng điền email và mật khẩu!' };
    }

    const users = this.getAllUsers();
    const user = users.find((u: User) => u.email === email);

    if (!user) {
      return { success: false, message: 'Email không tồn tại!' };
    }

    if (user.password !== this.hashPassword(password)) {
      return { success: false, message: 'Mật khẩu không chính xác!' };
    }

    const userForStorage: User = { ...user, password: undefined };
    this.setCurrentUser(userForStorage);

    return { success: true, message: 'Đăng nhập thành công!' };
  }

  socialLogin(name: string, email: string, provider: string, avatar?: string): { success: boolean; message: string } {
    if (!name || !email || !provider) {
      return { success: false, message: 'Thông tin social không đúng!' };
    }

    const users = this.getAllUsers();
    let user = users.find((u: User) => u.email === email);

    if (!user) {
      user = {
        id: this.generateId(),
        name: name,
        email: email,
        provider: provider,
        avatar: avatar,
        createdAt: new Date().toLocaleString('vi-VN')
      };
      users.push(user);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    this.setCurrentUser(user);
    return { success: true, message: `Đăng nhập với ${provider} thành công!` };
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('✅ Đã đăng xuất');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$;
  }

  isLoggedIn(): boolean {
    try {
      const state = JSON.parse(localStorage.getItem(this.storageKey) || '{"user":null}');
      return state.user !== null;
    } catch {
      return false;
    }
  }

  private setCurrentUser(user: User): void {
    const state: AuthState = {
      isLoggedIn: true,
      user: user
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private getUserFromLocalStorage(): User | null {
    try {
      const state = JSON.parse(localStorage.getItem(this.storageKey) || '{"user":null}');
      return state.user;
    } catch {
      return null;
    }
  }

  private getAllUsers(): User[] {
    try {
      return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private hashPassword(password: string): string {
    // Simple hash for demo purposes (use proper hashing in production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}
