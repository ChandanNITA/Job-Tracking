import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobStatus } from '../../models/job.model';

/**
 * StatusBadgeComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - @Input decorator for data binding from parent components
 * - Computed getters for dynamic CSS classes
 * - Clean visual status styling according to business rules
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="badgeClass"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide shadow-sm"
    >
      <span [class]="dotClass" class="w-1.5 h-1.5 rounded-full"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status: JobStatus | string = 'Applied';

  get badgeClass(): string {
    switch (this.status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Interview Scheduled':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Offer Received':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  get dotClass(): string {
    switch (this.status) {
      case 'Applied':
        return 'bg-blue-500';
      case 'Interview Scheduled':
        return 'bg-amber-500 animate-pulse';
      case 'Offer Received':
        return 'bg-emerald-500';
      case 'Rejected':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}
