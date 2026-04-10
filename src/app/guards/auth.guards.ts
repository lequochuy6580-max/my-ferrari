import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';

// Guard cho các route cần đăng nhập
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Trên SSR server không có localStorage → mặc định cho qua
  if (!isPlatformBrowser(platformId)) return true;

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

// Guard cho các route chỉ dành cho khách (login, register)
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    router.navigate(['/']);
    return false;
  }
  return true;
};