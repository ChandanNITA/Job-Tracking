import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * ConfirmationModalComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - @Input() for modal title, message, and visibility
 * - @Output() with EventEmitter for notifying parent components
 * - Event binding: (click)="onConfirm()"
 * - Conditional rendering with modern @if block syntax
 */
@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <!-- Backdrop with soft blur -->
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <!-- Modal Dialog -->
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div
            class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100 p-6"
            (click)="$event.stopPropagation()"
          >
            <!-- Icon -->
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <app-icon name="trash" [size]="22"></app-icon>
            </div>

            <!-- Content -->
            <div class="text-center">
              <h3 class="text-lg font-semibold leading-6 text-slate-800">
                {{ title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  {{ message }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex flex-col sm:flex-row-reverse gap-2 sm:gap-3">
              <button
                type="button"
                [disabled]="isLoading"
                (click)="onConfirm()"
                class="inline-flex w-full justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                @if (isLoading) {
                  <span class="inline-block animate-spin mr-2">⏳</span> Deleting...
                } @else {
                  Delete Application
                }
              </button>
              <button
                type="button"
                (click)="onCancel()"
                [disabled]="isLoading"
                class="inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Deletion';
  @Input() message: string = 'Are you sure you want to delete this job application? This action cannot be undone.';
  @Input() isLoading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
