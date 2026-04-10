import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authGuard, guestGuard } from './auth.guards';

// Helper: chạy CanActivateFn trong Angular DI context
function runGuard(guard: Function) {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );
}

describe('Auth Guards', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: navigateMock } },
      ],
    });

    // Reset trạng thái trước mỗi test
    localStorage.clear();
    navigateMock.mockClear();
  });

  // ─── authGuard: bảo vệ route cần đăng nhập (/profile...) ───
  describe('authGuard', () => {
    it('should allow access when user is logged in', () => {
      localStorage.setItem('isLoggedIn', 'true');

      const result = runGuard(authGuard);

      expect(result).toBe(true);
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should block and redirect to /login when not logged in', () => {
      // localStorage trống
      const result = runGuard(authGuard);

      expect(result).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith(['/login']);
    });

    it('should block when isLoggedIn is "false" string', () => {
      localStorage.setItem('isLoggedIn', 'false');

      const result = runGuard(authGuard);

      expect(result).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith(['/login']);
    });
  });

  // ─── guestGuard: bảo vệ /login và /register ───
  describe('guestGuard', () => {
    it('should allow access when user is NOT logged in', () => {
      // localStorage trống
      const result = runGuard(guestGuard);

      expect(result).toBe(true);
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should block and redirect to / when already logged in', () => {
      localStorage.setItem('isLoggedIn', 'true');

      const result = runGuard(guestGuard);

      expect(result).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith(['/']);
    });

    it('should allow access when isLoggedIn is "false" string', () => {
      localStorage.setItem('isLoggedIn', 'false');

      const result = runGuard(guestGuard);

      expect(result).toBe(true);
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});