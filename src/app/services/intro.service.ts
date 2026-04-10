import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntroService {
  private fullIntroVisible$ = new BehaviorSubject<boolean>(false);
  private miniIntroVisible$ = new BehaviorSubject<boolean>(false);
  private currentPageName$ = new BehaviorSubject<string>('');

  private readonly SESSION_KEY = 'ferrari_intro_shown';
  private autoDismissTimer: any = null;
  private pendingPageName: string = ''; // ← lưu trang đang chờ

  fullIntro$ = this.fullIntroVisible$.asObservable();
  miniIntro$ = this.miniIntroVisible$.asObservable();
  pageName$ = this.currentPageName$.asObservable();

  checkAndShowIntro(): void {
    const alreadyShown = sessionStorage.getItem(this.SESSION_KEY);
    if (!alreadyShown) {
      this.fullIntroVisible$.next(true);

      // Auto dismiss sau 3 giây
      this.autoDismissTimer = setTimeout(() => {
        this.dismissFullIntro();
      }, 3000);
    }
  }

  dismissFullIntro(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
    this.fullIntroVisible$.next(false);
    sessionStorage.setItem(this.SESSION_KEY, 'true');

    // Sau khi full intro kết thúc, hiện mini intro cho trang hiện tại
    if (this.pendingPageName) {
      setTimeout(() => {
        this.triggerMiniIntro(this.pendingPageName);
        this.pendingPageName = '';
      }, 300); // đợi exit animation xong
    }
  }

  showMiniIntro(pageName: string): void {
    // Nếu full intro đang chạy → lưu lại tên trang, hiện sau
    if (this.fullIntroVisible$.getValue()) {
      this.pendingPageName = pageName;
      return;
    }
    this.triggerMiniIntro(pageName);
  }

  private triggerMiniIntro(pageName: string): void {
    this.currentPageName$.next(pageName);
    this.miniIntroVisible$.next(true);

    setTimeout(() => {
      this.miniIntroVisible$.next(false);
    }, 1800);
  }

  isFullIntroActive(): boolean {
    return this.fullIntroVisible$.getValue();
  }
}