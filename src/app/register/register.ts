import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const pw2 = group.get('confirmPassword')?.value;
  return pw && pw2 && pw !== pw2 ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, Footer],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  isLoading = false;
  registerError = '';
  registerSuccess = false;
  private redirectTimer: any;

  registerfrom = new FormGroup({
    fullname:        new FormControl('', [Validators.required, Validators.minLength(3)]),
    email:           new FormControl('', [Validators.required, Validators.email]),
    username:        new FormControl('', [Validators.required, Validators.minLength(4)]),
    password:        new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

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

  ngOnDestroy(): void {
    clearTimeout(this.redirectTimer);
  }

  f(name: string) { return this.registerfrom.get(name); }

  register(): void {
    this.registerfrom.markAllAsTouched();
    if (this.registerfrom.invalid) return;

    this.isLoading = true;
    this.registerError = '';

    const { fullname, email, username, password } = this.registerfrom.value;

    // Kiểm tra trùng với tài khoản mặc định
    const defaultAccounts = ['admin', 'xuan'];

    if (isPlatformBrowser(this.platformId)) {
      // Kiểm tra trùng với tài khoản đã đăng ký trong localStorage
      const existingUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]');
      const isDuplicate =
        defaultAccounts.includes(username ?? '') ||
        existingUsers.some(u => u.username === username);

      if (isDuplicate) {
        this.registerError = 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.';
        this.isLoading = false;
        return;
      }
    }

    this.redirectTimer = setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        // ── Lưu session ──
        localStorage.setItem('isLoggedIn',          'true');
        localStorage.setItem('currentUser',         username ?? '');
        localStorage.setItem('currentUserFullname', fullname ?? '');
        localStorage.setItem('currentUserEmail',    email ?? '');

        // ── Lưu vào users[] (bao gồm password để login sau được) ──
        const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({
          id:        Date.now().toString(),
          username:  username ?? '',
          password:  password ?? '',        // ← lưu password để login dùng
          name:      fullname ?? '',
          email:     email ?? '',
          phone:     '',
          address:   '',
          createdAt: new Date().toLocaleDateString('vi-VN'),
        });
        localStorage.setItem('users', JSON.stringify(users));
      }

      this.registerSuccess = true;
      this.isLoading = false;
      this.router.navigate(['/']);
    }, 700);
  }
}