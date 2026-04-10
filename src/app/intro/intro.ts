import { Component, OnDestroy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IntroService } from '../services/intro.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrl: './intro.css'
})
export class IntroComponent implements OnDestroy {
  showFull = false;
  showMini = false;
  pageName = '';
  isExiting = false;
  miniKey = 0; // ← force re-render mini bar mỗi lần hiện

  private subs = new Subscription();

  constructor(
    private introService: IntroService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      // Subscribe full intro
      this.subs.add(
        this.introService.fullIntro$.subscribe(val => {
          if (val) {
            this.isExiting = false;
            this.showFull = true;
          } else if (this.showFull) {
            this.isExiting = true;
            setTimeout(() => {
              this.showFull = false;
              this.isExiting = false;
              this.cdr.detectChanges();
            }, 900);
          }
          this.cdr.detectChanges();
        })
      );

      // Subscribe mini intro
      this.subs.add(
        this.introService.miniIntro$.subscribe(val => {
          if (val) {
            // Tăng key để Angular destroy và recreate element → animation chạy lại
            this.miniKey++;
          }
          this.showMini = val;
          this.cdr.detectChanges();
        })
      );

      // Subscribe tên trang
      this.subs.add(
        this.introService.pageName$.subscribe(name => {
          this.pageName = name;
          this.cdr.detectChanges();
        })
      );

      this.introService.checkAndShowIntro();
    });
  }

  skipIntro(): void {
    this.introService.dismissFullIntro();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}