import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { NotificationService } from '../../services/notification.service';
import { JobFormComponent } from '../../components/job-form/job-form.component';
import { JobApplication } from '../../models/job.model';
import { IconComponent } from '../../components/icon/icon.component';

/**
 * EditJobComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - ActivatedRoute injection to read URL route parameters (:id)
 * - Fetching single entity via JobService
 * - Loading and error states
 * - Component reuse: Binding [initialData] and [isEditMode]="true" to JobFormComponent
 * - Navigation via Router
 */
@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, JobFormComponent, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto pb-12">
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-slate-500 mt-4">Loading application details...</p>
        </div>
      } @else if (jobData) {
        <app-job-form
          [initialData]="jobData"
          [isEditMode]="true"
          [isSubmitting]="isSubmitting"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onFormCancel()"
        ></app-job-form>
      } @else {
        <div class="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <app-icon name="alert-circle" [size]="28"></app-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Job Application Not Found</h3>
          <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            The requested application does not exist or may have already been removed.
          </p>
          <div class="mt-6">
            <button
              type="button"
              (click)="onFormCancel()"
              class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all"
            >
              Back to Applications
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class EditJobComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private notificationService = inject(NotificationService);

  jobId: string | null = null;
  jobData: JobApplication | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');

    if (!this.jobId) {
      this.notificationService.error('Invalid Job ID');
      this.router.navigate(['/applications']);
      return;
    }

    this.loadJob();
  }

  loadJob(): void {
    if (!this.jobId) return;

    this.isLoading = true;
    this.jobService.getJobById(this.jobId).subscribe({
      next: (res) => {
        this.jobData = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to load application details');
        this.isLoading = false;
      },
    });
  }

  onFormSubmit(formData: Partial<JobApplication>): void {
    if (!this.jobId) return;

    this.isSubmitting = true;

    this.jobService.updateJob(this.jobId, formData).subscribe({
      next: (res) => {
        this.notificationService.success(
          `Application for "${res.data.company}" updated successfully!`
        );
        this.isSubmitting = false;
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        this.notificationService.error(
          err.message || 'Failed to update job application. Please check inputs.'
        );
        this.isSubmitting = false;
      },
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/applications']);
  }
}
