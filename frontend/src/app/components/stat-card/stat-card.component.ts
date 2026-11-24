import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * StatCardComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Multiple @Input() properties
 * - Interpolation ({{ title }}, {{ count }})
 * - Property binding for dynamic classes
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
    >
      <div class="space-y-1">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">{{ title }}</p>
        <h3 class="text-2xl font-bold text-slate-800 tracking-tight">{{ count }}</h3>
        @if (subtitle) {
          <p class="text-xs text-slate-400">{{ subtitle }}</p>
        }
      </div>

      <div [class]="iconBgClass" class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
        <app-icon [name]="iconName" [size]="22" [cssClass]="iconColorClass"></app-icon>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) count: number = 0;
  @Input() iconName: string = 'briefcase';
  @Input() colorScheme: 'indigo' | 'blue' | 'amber' | 'emerald' | 'rose' = 'indigo';
  @Input() subtitle?: string;

  get iconBgClass(): string {
    switch (this.colorScheme) {
      case 'blue':
        return 'bg-blue-50 border border-blue-100';
      case 'amber':
        return 'bg-amber-50 border border-amber-100';
      case 'emerald':
        return 'bg-emerald-50 border border-emerald-100';
      case 'rose':
        return 'bg-rose-50 border border-rose-100';
      case 'indigo':
      default:
        return 'bg-indigo-50 border border-indigo-100';
    }
  }

  get iconColorClass(): string {
    switch (this.colorScheme) {
      case 'blue':
        return 'text-blue-600';
      case 'amber':
        return 'text-amber-600';
      case 'emerald':
        return 'text-emerald-600';
      case 'rose':
        return 'text-rose-600';
      case 'indigo':
      default:
        return 'text-indigo-600';
    }
  }
}
