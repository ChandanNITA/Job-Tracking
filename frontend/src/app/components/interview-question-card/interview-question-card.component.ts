import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewQuestion } from '../../models/ai.model';
import { IconComponent } from '../icon/icon.component';

/**
 * InterviewQuestionCardComponent
 * Angular concepts demonstrated:
 * - Standalone Component (standalone: true)
 * - @Input() and @Output() for Parent-Child communication
 * - Event binding (click, change)
 * - Conditional rendering with modern @if and @for control flow
 * - Two-way interaction state with local toggles (show/hide answer, copy feedback)
 */
@Component({
  selector: 'app-interview-question-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm"
      [ngClass]="{
        'border-emerald-200 bg-emerald-50/20 shadow-md': question.practiced,
        'border-slate-200/90 hover:border-slate-300 hover:shadow-md': !question.practiced
      }"
    >
      <!-- Card Header -->
      <div class="p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <!-- Left: Question Number & Badges -->
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
              [ngClass]="question.practiced ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
            >
              #{{ index + 1 }}
            </span>

            <!-- Category Badge -->
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              [ngClass]="getCategoryBadgeClass(question.category)"
            >
              {{ question.category }}
            </span>

            <!-- Difficulty Badge -->
            <span
              class="px-2 py-0.5 rounded-full text-[11px] font-medium border"
              [ngClass]="getDifficultyBadgeClass(question.difficulty)"
            >
              {{ question.difficulty }}
            </span>

            @if (question.practiced) {
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <app-icon name="check-circle" [size]="12"></app-icon>
                Practiced
              </span>
            }
          </div>

          <!-- Right: Practiced Checkbox & Action Buttons -->
          <div class="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                [checked]="question.practiced"
                (change)="onTogglePracticed($event)"
                class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 cursor-pointer accent-primary-600"
              />
              <span>Mark as Practiced</span>
            </label>
          </div>
        </div>

        <!-- Question Text -->
        <h3
          class="text-base sm:text-lg font-semibold text-slate-800 mt-3.5 leading-snug"
          [ngClass]="{ 'line-through text-slate-400': question.practiced }"
        >
          {{ question.question }}
        </h3>

        <!-- Action Bar: Show/Hide Answer & Copy Button -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            (click)="toggleAnswer()"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none"
            [ngClass]="
              isAnswerVisible
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            "
          >
            <app-icon [name]="isAnswerVisible ? 'chevron-up' : 'chevron-down'" [size]="14"></app-icon>
            <span>{{ isAnswerVisible ? 'Hide Sample Answer' : 'Show Sample Answer' }}</span>
          </button>

          <button
            type="button"
            (click)="copySampleAnswer()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
            [title]="'Copy sample answer to clipboard'"
          >
            <app-icon [name]="isCopied ? 'check' : 'copy'" [size]="14" [cssClass]="isCopied ? 'text-emerald-600' : ''"></app-icon>
            <span>{{ isCopied ? 'Copied!' : 'Copy Answer' }}</span>
          </button>
        </div>
      </div>

      <!-- Expandable Answer & Key Points Section -->
      @if (isAnswerVisible) {
        <div class="bg-slate-50/80 border-t border-slate-100 p-5 sm:p-6 space-y-4 animate-fade-in">
          <!-- Sample Answer Container -->
          <div>
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <app-icon name="lightbulb" [size]="14" cssClass="text-amber-500"></app-icon>
              <span>Recommended Sample Answer</span>
            </h4>
            <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {{ question.answer }}
            </div>
          </div>

          <!-- Key Points / Concepts to Remember -->
          @if (question.keyPoints && question.keyPoints.length > 0) {
            <div>
              <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <app-icon name="book-open" [size]="14" cssClass="text-primary-600"></app-icon>
                <span>Key Concepts & Talking Points</span>
              </h4>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (point of question.keyPoints; track point) {
                  <li class="bg-white rounded-lg p-2.5 border border-slate-200/70 flex items-start gap-2 shadow-xs">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                    <span class="text-slate-700 font-medium">{{ point }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
  `],
})
export class InterviewQuestionCardComponent {
  @Input({ required: true }) question!: InterviewQuestion;
  @Input() index: number = 0;

  @Output() practicedChange = new EventEmitter<{ question: InterviewQuestion; practiced: boolean }>();
  @Output() copyAnswer = new EventEmitter<InterviewQuestion>();

  isAnswerVisible: boolean = false;
  isCopied: boolean = false;

  toggleAnswer(): void {
    this.isAnswerVisible = !this.isAnswerVisible;
  }

  onTogglePracticed(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.question.practiced = input.checked;
    this.practicedChange.emit({ question: this.question, practiced: input.checked });
  }

  copySampleAnswer(): void {
    if (!this.question.answer) return;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.question.answer).then(() => {
        this.triggerCopiedState();
      });
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = this.question.answer;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.triggerCopiedState();
    }

    this.copyAnswer.emit(this.question);
  }

  private triggerCopiedState(): void {
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
    }, 2000);
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Technical':
        return 'bg-blue-100 text-blue-800';
      case 'Behavioral':
        return 'bg-purple-100 text-purple-800';
      case 'Scenario':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getDifficultyBadgeClass(difficulty: string): string {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
