import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * PreparationProgressComponent
 * Angular concepts demonstrated:
 * - Standalone Component (standalone: true)
 * - @Input() property binding for parent-child state propagation
 * - Computed getters for reactive progress calculation
 * - Dynamic styling based on preparation milestones
 */
@Component({
  selector: 'app-preparation-progress',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-primary-600 flex items-center justify-center">
            <app-icon name="sparkles" [size]="18"></app-icon>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-800">Preparation Progress</h4>
            <p class="text-xs text-slate-500">{{ motivationalMessage }}</p>
          </div>
        </div>

        <div class="text-right">
          <span class="text-lg font-bold text-slate-800">
            {{ practicedCount }} / {{ totalCount }}
          </span>
          <span class="text-xs text-slate-400 block font-medium">Questions Practiced</span>
        </div>
      </div>

      <!-- Progress bar track -->
      <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r"
          [ngClass]="progressBarGradient"
          [style.width.%]="progressPercentage"
        ></div>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400 pt-0.5 font-medium">
        <span>0%</span>
        <span>{{ progressPercentage }}% Complete</span>
        <span>100%</span>
      </div>
    </div>
  `,
})
export class PreparationProgressComponent {
  @Input() practicedCount: number = 0;
  @Input() totalCount: number = 10;

  get progressPercentage(): number {
    if (!this.totalCount || this.totalCount === 0) return 0;
    return Math.min(100, Math.round((this.practicedCount / this.totalCount) * 100));
  }

  get motivationalMessage(): string {
    const pct = this.progressPercentage;
    if (pct === 0) return 'Ready to start practicing? Check off questions as you go.';
    if (pct < 30) return 'Great start! Keep practicing aloud using the STAR technique.';
    if (pct < 70) return 'Halfway there! Solid progress on role-specific competencies.';
    if (pct < 100) return 'Almost ready! Review remaining scenario & technical questions.';
    return 'Outstanding! All 10 questions practiced. You are well-prepared!';
  }

  get progressBarGradient(): string {
    const pct = this.progressPercentage;
    if (pct < 40) return 'from-primary-500 to-indigo-600';
    if (pct < 80) return 'from-indigo-600 to-amber-500';
    return 'from-emerald-500 to-teal-500';
  }
}
