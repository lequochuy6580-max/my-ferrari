import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-container">
      <div class="chart-wrapper">
        <h3>{{ title }}</h3>
        <div class="chart">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-container {
      background: #111;
      border: 1px solid #f00;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
    }

    .chart-wrapper {
      width: 100%;
    }

    .chart-wrapper h3 {
      color: #f00;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .chart {
      background: #000;
      border-radius: 5px;
      padding: 10px;
      min-height: 300px;
    }

    canvas {
      max-width: 100%;
    }
  `]
})
export class ChartsComponent implements OnInit {
  @Input() title = 'Chart';
  @Input() data: any = {};
  @Input() type: 'bar' | 'line' | 'pie' = 'bar';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.renderChart();
      }, 100);
    }
  }

  private renderChart() {
    // Simplified canvas-based chart rendering
    // For production, consider using Chart.js or ng2-charts library
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Example: Simple bar chart
    if (this.type === 'bar') {
      this.drawBarChart(ctx, canvas);
    }
  }

  private drawBarChart(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Simple bar chart implementation
    const width = canvas.width;
    const height = canvas.height;
    const labels = this.data.labels || [];
    const values = this.data.values || [];

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (labels.length === 0) return;

    const barWidth = width / labels.length;
    const maxValue = Math.max(...values, 1);
    const scale = (height - 40) / maxValue;

    // Draw bars
    ctx.fillStyle = '#f00';
    labels.forEach((label: string, index: number) => {
      const value = values[index] || 0;
      const barHeight = value * scale;
      const x = index * barWidth + 10;
      const y = height - barHeight - 30;
      ctx.fillRect(x, y, barWidth - 20, barHeight);

      // Draw labels
      ctx.fillStyle = '#aaa';
      ctx.font = '12px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + (barWidth - 20) / 2, height - 10);
      ctx.fillStyle = '#f00';
    });
  }
}
