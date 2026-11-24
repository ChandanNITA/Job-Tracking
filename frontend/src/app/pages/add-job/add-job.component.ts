import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { NotificationService } from '../../services/notification.service';
import { JobFormComponent } from '../../components/job-form/job-form.component';
import { JobApplication } from '../../models/job.model';

/**
 * AddJobComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Parent-child component architecture (reusing JobFormComponent)
 * - Handling @Output events: (formSubmit) and (formCancel)
 * - Dependency injection with inject(JobService), inject(NotificationService), inject(Router)
 * - Asynchronous API calls with RxJS subscription handling
 */
@Component({
  selector: 'app-add-job',
  standalone: true,
  imports: [CommonModule, JobFormComponent],
  template: `
    <div class="max-w-4xl mx-auto pb-12">
      <app-job-form
        [isEditMode]="false"
        [isSubmitting]="isSubmitting"
        (formSubmit)="onFormSubmit($event)"
        (formCancel)="onFormCancel()"
      ></app-job-form>
    </div>
  `,
})
export class AddJobComponent {
  private jobService = inject(JobService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSubmitting: boolean = false;

  onFormSubmit(formData: Partial<JobApplication>): void {
    this.isSubmitting = true;

    this.jobService.createJob(formData).subscribe({
      next: (res) => {
        this.notificationService.success(
          `Application for "${res.data.company}" created successfully!`
        );
        this.isSubmitting = false;
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        this.notificationService.error(
          err.message || 'Failed to create job application. Please check inputs.'
        );
        this.isSubmitting = false;
      },
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/applications']);
  }
}
