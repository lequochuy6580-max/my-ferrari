import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: string = '';
  avatarInitial: string = '';
  isMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;

  private routerSub!: Subscription;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object  // phân biệt browser vs SSR server
  ) {}

  ngOnInit(): void {
    // Chỉ đọc localStorage khi chạy trên browser
    if (isPlatformBrowser(this.platformId)) {
      this.syncAuthState();

      this.routerSub = this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          this.syncAuthState();
          this.isMenuOpen = false;
          this.isUserMenuOpen = false;
        });
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private syncAuthState(): void {
    // Hàm này chỉ được gọi sau khi đã kiểm tra isPlatformBrowser
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.currentUser = localStorage.getItem('currentUser') ?? '';
    const fullname = localStorage.getItem('currentUserFullname') ?? this.currentUser;
    this.avatarInitial = fullname.charAt(0).toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isUserMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserFullname');
      localStorage.removeItem('currentUserEmail');
      localStorage.removeItem('currentUserJoinDate');
    }
    this.isLoggedIn = false;
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }
}