import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JobApplication, JobStatus, EmploymentType, WorkMode } from '../../models/job.model';
import { IconComponent } from '../icon/icon.component';

/**
 * JobFormComponent
 * Angular concepts demonstrated:
 * - Reactive Forms (FormBuilder, FormGroup, FormControl, Validators)
 * - Standalone Component with ReactiveFormsModule
 * - ngOnInit and ngOnChanges lifecycle hooks
 * - @Input() and @Output() for component reusability (Add & Edit pages)
 * - Input validation & dynamic validation error messages
 * - Helper getters to simplify template expression evaluation
 */
@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-xl font-bold text-slate-800">
            {{ isEditMode ? 'Edit Job Application' : 'Add New Application' }}
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Fill in the details below to track your job application and interview milestones.
          </p>
        </div>

        <!-- 2-column grid for primary info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Company Name (Required) -->
          <div>
            <label for="company" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Company Name <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                id="company"
                type="text"
                formControlName="company"
                placeholder="e.g. Google, Microsoft, Stripe"
                class="w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                [ngClass]="{
                  'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20':
                    isFieldInvalid('company'),
                  'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100':
                    !isFieldInvalid('company')
                }"
              />
            </div>
            @if (isFieldInvalid('company')) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>Company name is required (minimum 2 characters).</span>
              </p>
            }
          </div>

          <!-- Job Role (Required) -->
          <div>
            <label for="role" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Job Role / Title <span class="text-rose-500">*</span>
            </label>
            <input
              id="role"
              type="text"
              formControlName="role"
              placeholder="e.g. Frontend Engineer, Full Stack Developer"
              class="w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
              [ngClass]="{
                'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20':
                  isFieldInvalid('role'),
                'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100':
                  !isFieldInvalid('role')
              }"
            />
            @if (isFieldInvalid('role')) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>Job role is required.</span>
              </p>
            }
          </div>

          <!-- Job Location -->
          <div>
            <label for="location" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Job Location
            </label>
            <input
              id="location"
              type="text"
              formControlName="location"
              placeholder="e.g. San Francisco, CA or Remote"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Employment Type -->
          <div>
            <label for="employmentType" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Employment Type
            </label>
            <select
              id="employmentType"
              formControlName="employmentType"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              @for (type of employmentTypes; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
          </div>

          <!-- Work Mode -->
          <div>
            <label for="workMode" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Work Mode
            </label>
            <select
              id="workMode"
              formControlName="workMode"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              @for (mode of workModes; track mode) {
                <option [value]="mode">{{ mode }}</option>
              }
            </select>
          </div>

          <!-- Job Application URL -->
          <div>
            <label for="jobLink" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Job Application URL
            </label>
            <input
              id="jobLink"
              type="url"
              formControlName="jobLink"
              placeholder="https://company.com/careers/posting-id"
              class="w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
              [ngClass]="{
                'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20':
                  isFieldInvalid('jobLink'),
                'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100':
                  !isFieldInvalid('jobLink')
              }"
            />
            @if (isFieldInvalid('jobLink')) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>Please enter a valid URL starting with http:// or https://</span>
              </p>
            }
          </div>

          <!-- Applied Date (Required) -->
          <div>
            <label for="appliedDate" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Applied Date <span class="text-rose-500">*</span>
            </label>
            <input
              id="appliedDate"
              type="date"
              formControlName="appliedDate"
              class="w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none transition-all"
              [ngClass]="{
                'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20':
                  isFieldInvalid('appliedDate'),
                'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100':
                  !isFieldInvalid('appliedDate')
              }"
            />
            @if (isFieldInvalid('appliedDate')) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>Applied date is required.</span>
              </p>
            }
          </div>

          <!-- Application Status -->
          <div>
            <label for="status" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Application Status
            </label>
            <select
              id="status"
              formControlName="status"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              @for (st of statuses; track st) {
                <option [value]="st">{{ st }}</option>
              }
            </select>
          </div>

          <!-- Expected Salary (Optional) -->
          <div>
            <label for="expectedSalary" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Expected Salary (USD / yr) <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="expectedSalary"
              type="number"
              min="0"
              step="1000"
              formControlName="expectedSalary"
              placeholder="e.g. 145000"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Interview Date (Optional) -->
          <div>
            <label for="interviewDate" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Interview Date <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="interviewDate"
              type="date"
              formControlName="interviewDate"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        <!-- Job Description (Optional) -->
        <div>
          <label for="jobDescription" class="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Job Description <span class="text-slate-400 font-normal">(optional)</span></span>
            <span class="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <app-icon name="sparkles" [size]="12"></app-icon>
              Powers AI Interview Prep
            </span>
          </label>
          <textarea
            id="jobDescription"
            rows="3"
            formControlName="jobDescription"
            placeholder="Paste job posting responsibilities, skills, or requirements to optimize AI question generation..."
            class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400 resize-y"
          ></textarea>
        </div>

        <!-- Notes (Optional) -->
        <div>
          <label for="notes" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Notes / Interview Preparation Tips <span class="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows="3"
            formControlName="notes"
            placeholder="Key talking points, recruiter name, referral info, interview topics..."
            class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400 resize-y"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isSubmitting"
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="jobForm.invalid || isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center gap-2"
          >
            @if (isSubmitting) {
              <span class="inline-block animate-spin">⏳</span>
              <span>Saving...</span>
            } @else {
              <app-icon [name]="isEditMode ? 'check' : 'plus'" [size]="16"></app-icon>
              <span>{{ isEditMode ? 'Update Application' : 'Save Application' }}</span>
            }
          </button>
        </div>
      </div>
    </form>
  `,
})
export class JobFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() initialData?: JobApplication | null = null;
  @Input() isEditMode: boolean = false;
  @Input() isSubmitting: boolean = false;

  @Output() formSubmit = new EventEmitter<Partial<JobApplication>>();
  @Output() formCancel = new EventEmitter<void>();

  readonly employmentTypes: EmploymentType[] = ['Full-time', 'Internship', 'Contract', 'Part-time'];
  readonly workModes: WorkMode[] = ['Remote', 'Hybrid', 'On-site'];
  readonly statuses: JobStatus[] = ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'];

  jobForm: FormGroup = this.fb.group({
    company: ['', [Validators.required, Validators.minLength(2)]],
    role: ['', [Validators.required, Validators.minLength(2)]],
    location: [''],
    employmentType: ['Full-time', Validators.required],
    workMode: ['Remote', Validators.required],
    jobLink: ['', [Validators.pattern('https?://.+')]],
    jobDescription: [''],
    appliedDate: [this.formatDateForInput(new Date()), Validators.required],
    status: ['Applied', Validators.required],
    expectedSalary: [null, [Validators.min(0)]],
    interviewDate: [null],
    notes: [''],
  });

  ngOnInit(): void {
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  /**
   * Helper to format Date objects / ISO strings into 'YYYY-MM-DD' for date inputs
   */
  private formatDateForInput(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  private populateForm(data: JobApplication): void {
    this.jobForm.patchValue({
      company: data.company,
      role: data.role,
      location: data.location || '',
      employmentType: data.employmentType || 'Full-time',
      workMode: data.workMode || 'Remote',
      jobLink: data.jobLink || '',
      jobDescription: data.jobDescription || '',
      appliedDate: this.formatDateForInput(data.appliedDate),
      status: data.status || 'Applied',
      expectedSalary: data.expectedSalary ?? null,
      interviewDate: this.formatDateForInput(data.interviewDate),
      notes: data.notes || '',
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const val = this.jobForm.value;
    const formData: Partial<JobApplication> = {
      ...val,
      expectedSalary: val.expectedSalary !== null && val.expectedSalary !== '' ? Number(val.expectedSalary) : null,
      interviewDate: val.interviewDate ? new Date(val.interviewDate).toISOString() : null,
      appliedDate: new Date(val.appliedDate).toISOString(),
    };

    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
