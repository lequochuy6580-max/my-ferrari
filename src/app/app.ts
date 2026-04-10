import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IntroService } from './services/intro.service';
import { AudioService } from './services/audio.service';
import { IntroComponent } from './intro/intro';
import { NavbarComponent } from './navbar/navbar';

const PAGE_NAMES: Record<string, string> = {
  '':           'Home',
  'home':       'Home',
  'shop':       'Shop',
  'detail':     'Detail',
  'viewdetail': 'Car Detail',
  'cart':       'Cart',
  'checkout':   'Checkout',
  'login':      'Sign In',
  'register':   'Register',
  'profile':    'Profile',       // ← THÊM
  'news':       'Ferrari Blog',
  'blog':       'Article',
  'admin':      'Admin',
  'pagination': 'Products',
  'products':   'Products',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IntroComponent,
    NavbarComponent,
  ],
  template: `
    <app-intro></app-intro>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private introService: IntroService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    // Khởi tạo nhạc nền
    this.audioService.playAudio();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects
          .split('?')[0]
          .split('/')[1]
          || '';

        const pageName = PAGE_NAMES[path] || path.charAt(0).toUpperCase() + path.slice(1);
        this.introService.showMiniIntro(pageName);
      });
  }
}