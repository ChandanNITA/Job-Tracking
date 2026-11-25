import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobApplication, JobStatus } from '../../models/job.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { IconComponent } from '../icon/icon.component';

/**
 * JobCardComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Built-in Angular Pipes: DatePipe, CurrencyPipe
 * - Component communication: @Input() and @Output()
 * - Two-way interaction via dropdown event binding (change)
 */
@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe, StatusBadgeComponent, IconComponent],
  template: `
    <div
      class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <!-- Header: Company & Quick Actions -->
      <div>
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <span class="inline-block text-xs font-semibold text-primary-600 tracking-wide uppercase">
              {{ job.employmentType }}
            </span>
            <h4 class="text-base font-semibold text-slate-800 truncate" [title]="job.company">
              {{ job.company }}
            </h4>
            <p class="text-sm font-medium text-slate-600 truncate" [title]="job.role">
              {{ job.role }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            @if (job.jobLink) {
              <a
                [href]="job.jobLink"
                target="_blank"
                rel="noopener noreferrer"
                class="p-1 text-slate-400 hover:text-primary-600 rounded hover:bg-slate-50 transition-colors"
                title="Open Job Posting"
              >
                <app-icon name="external-link" [size]="16"></app-icon>
              </a>
            }
            <button
              type="button"
              (click)="onEdit()"
              class="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-50 transition-colors"
              title="Edit Application"
            >
              <app-icon name="edit" [size]="16"></app-icon>
            </button>
            <button
              type="button"
              (click)="onDelete()"
              class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors"
              title="Delete Application"
            >
              <app-icon name="trash" [size]="16"></app-icon>
            </button>
          </div>
        </div>

        <!-- Meta Details: Location, Salary, Applied Date -->
        <div class="mt-3 space-y-1.5 text-xs text-slate-500">
          @if (job.location) {
            <div class="flex items-center gap-1.5 truncate">
              <app-icon name="map-pin" [size]="14" cssClass="text-slate-400 shrink-0"></app-icon>
              <span class="truncate">{{ job.location }} ({{ job.workMode }})</span>
            </div>
          }

          @if (job.expectedSalary) {
            <div class="flex items-center gap-1.5">
              <app-icon name="dollar-sign" [size]="14" cssClass="text-slate-400 shrink-0"></app-icon>
              <span>{{ job.expectedSalary | currency:'USD':'symbol':'1.0-0' }} / yr</span>
            </div>
          }

          <div class="flex items-center gap-1.5">
            <app-icon name="calendar" [size]="14" cssClass="text-slate-400 shrink-0"></app-icon>
            <span>Applied: {{ job.appliedDate | date:'mediumDate' }}</span>
          </div>

          @if (job.interviewDate) {
            <div class="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 mt-2 font-medium">
              <app-icon name="clock" [size]="14" cssClass="shrink-0 text-amber-600"></app-icon>
              <span>Interview: {{ job.interviewDate | date:'MMM d, y' }}</span>
            </div>
          }
        </div>

        <!-- Notes Snippet if available -->
        @if (job.notes) {
          <p class="mt-3 text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 italic">
            "{{ job.notes }}"
          </p>
        }

        <!-- Prepare with AI Button -->
        <a
          [routerLink]="['/jobs', job._id, 'interview-preparation']"
          class="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/70 text-xs font-semibold shadow-xs hover:shadow transition-all group-hover:border-indigo-300"
          title="Generate interview preparation questions with Google Gemini"
        >
          <app-icon name="sparkles" [size]="13" cssClass="text-indigo-600"></app-icon>
          <span>Prepare with AI</span>
        </a>
      </div>

      <!-- Footer: Status Switcher Dropdown -->
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <label class="text-xs text-slate-400 font-medium">Status:</label>
        <select
          [value]="job.status"
          (change)="onStatusChange($event)"
          class="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
        >
          <option value="Applied">Applied</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Offer Received">Offer Received</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  `,
})
export class JobCardComponent {
  @Input({ required: true }) job!: JobApplication;

  @Output() edit = new EventEmitter<JobApplication>();
  @Output() delete = new EventEmitter<JobApplication>();
  @Output() statusChange = new EventEmitter<{ job: JobApplication; newStatus: JobStatus }>();

  onEdit(): void {
    this.edit.emit(this.job);
  }

  onDelete(): void {
    this.delete.emit(this.job);
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as JobStatus;
    this.statusChange.emit({ job: this.job, newStatus });
  }
}
