import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, Footer],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isLoading = false;
  loginError = '';

  loginfrom = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        this.router.navigate(['/']);
      }
    }
  }

  login(): void {
    this.loginfrom.markAllAsTouched();
    if (this.loginfrom.invalid) return;

    this.isLoading = true;
    this.loginError = '';

    const { username, password } = this.loginfrom.value;

    setTimeout(() => {
      // Chỉ dùng tài khoản đã đăng ký từ localStorage
      const registeredUsers: any[] = isPlatformBrowser(this.platformId)
        ? JSON.parse(localStorage.getItem('users') || '[]')
        : [];

      const matched = registeredUsers.find(
        u => u.username === username && u.password === password
      );

      if (matched) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isLoggedIn',          'true');
          localStorage.setItem('currentUser',         matched.username);
          localStorage.setItem('currentUserFullname', matched.name || matched.username);
          localStorage.setItem('currentUserEmail',    matched.email || '');
        }
        this.router.navigate(['/']);
      } else {
        this.loginError = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        this.loginfrom.get('password')?.reset();
        this.isLoading = false;
      }
    }, 600);
  }
}