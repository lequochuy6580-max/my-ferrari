import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeAudio();
  }

  private initializeAudio() {
    if (isPlatformBrowser(this.platformId)) {
      // Kiểm tra xem audio đã tồn tại trong DOM chưa
      let audioElement = document.getElementById('background-audio') as HTMLAudioElement;
      
      if (!audioElement) {
        // Tạo element audio nếu chưa tồn tại
        audioElement = document.createElement('audio');
        audioElement.id = 'background-audio';
        audioElement.loop = true;
        audioElement.volume = 0.3; // 30% volume
        // Không đặt src here, sẽ be set trong playAudio method
        document.body.appendChild(audioElement);
      }
      
      this.audio = audioElement;
      
      // Lắng nghe sự kiện kết thúc nhạc
      this.audio.addEventListener('ended', () => {
        this.audio?.play();
      });
    }
  }

  /**
   * Phát nhạc nền
   * @param src - Đường dẫn đến file nhạc
   */
  playAudio(src: string = 'media/Love In Portofino.mp3') {
    if (!this.audio) return;
    
    // So sánh bằng cách kiểm tra audio.src kết thúc bằng src (tránh lỗi absolute vs relative path)
    const currentSrc = this.audio.src || '';
    const needNewSrc = !currentSrc || (!currentSrc.endsWith(src) && !currentSrc.includes(src));
    
    if (needNewSrc) {
      this.audio.src = src;
    }
    
    if (this.audio.paused) {
      this.audio.play().catch(err => console.warn('Audio play blocked (user interaction needed):', err));
      this.isPlaying = true;
    }
  }

  /**
   * Tạm dừng nhạc
   */
  pauseAudio() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Tiếp tục phát nhạc
   */
  resumeAudio() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(err => console.error('Audio resume error:', err));
      this.isPlaying = true;
    }
  }

  /**
   * Dừng nhạc hoàn toàn
   */
  stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Đặt âm lượng (0-1)
   */
  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Lấy trạng thái phát nhạc
   */
  isAudioPlaying(): boolean {
    return this.isPlaying && (this.audio?.currentTime || 0) > 0;
  }

  /**
   * Kiểm tra xem audio có được hỗ trợ hay không
   */
  isAudioSupported(): boolean {
    return !!(document as any).createElement('audio').canPlayType;
  }
}
