import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { JobService } from '../../services/job.service';
import { NotificationService } from '../../services/notification.service';
import { JobApplication, JobStatus } from '../../models/job.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { IconComponent } from '../../components/icon/icon.component';

/**
 * JobListComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Dual view modes (Table & Kanban) using template conditional control flow
 * - Two-way data binding with [(ngModel)] on search, filter, and sort inputs
 * - Parent-child component communication with @Input() and @Output()
 * - Angular Pipes: DatePipe, CurrencyPipe
 * - RxJS Subscription management in ngOnInit / ngOnDestroy
 * - Confirmation Modal integration for safe deletion
 * - NotificationService integration for toast feedback
 */
@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    StatusBadgeComponent,
    JobCardComponent,
    ConfirmationModalComponent,
    IconComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Page Title & Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">All Job Applications</h2>
          <p class="text-sm text-slate-500 mt-1">
            Browse, search, filter and manage your application pipeline in Table or Kanban view.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- View Switcher (Table / Kanban) -->
          <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              (click)="viewMode = 'table'"
              [ngClass]="{
                'bg-white text-primary-700 shadow-sm font-semibold': viewMode === 'table',
                'text-slate-600 hover:text-slate-900': viewMode !== 'table'
              }"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              title="Table View"
            >
              <app-icon name="table" [size]="14"></app-icon>
              <span>Table</span>
            </button>
            <button
              type="button"
              (click)="viewMode = 'kanban'"
              [ngClass]="{
                'bg-white text-primary-700 shadow-sm font-semibold': viewMode === 'kanban',
                'text-slate-600 hover:text-slate-900': viewMode !== 'kanban'
              }"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              title="Kanban Board View"
            >
              <app-icon name="kanban" [size]="14"></app-icon>
              <span>Kanban</span>
            </button>
          </div>

          <!-- Add Application Button -->
          <a
            routerLink="/applications/add"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Add Job</span>
          </a>
        </div>
      </div>

      <!-- Search, Filter & Sort Controls Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <!-- Search input (Two-way data binding) -->
          <div class="sm:col-span-6 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <app-icon name="search" [size]="16"></app-icon>
            </div>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onFilterChange()"
              placeholder="Search by company name or job role..."
              class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-slate-400 text-slate-800"
            />
            @if (searchTerm) {
              <button
                type="button"
                (click)="clearSearch()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <app-icon name="x" [size]="14"></app-icon>
              </button>
            }
          </div>

          <!-- Status Filter -->
          <div class="sm:col-span-3">
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-slate-700 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <!-- Date Sort Order -->
          <div class="sm:col-span-3">
            <select
              [(ngModel)]="sortOrder"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-slate-700 cursor-pointer"
            >
              <option value="desc">Date: Newest First</option>
              <option value="asc">Date: Oldest First</option>
            </select>
          </div>
        </div>

        <!-- Filter stats summary bar -->
        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong>{{ filteredJobs.length }}</strong> application(s)</span>
          @if (searchTerm || selectedStatus !== 'All') {
            <button
              type="button"
              (click)="resetFilters()"
              class="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Reset all filters
            </button>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-slate-500 mt-4">Loading job applications...</p>
        </div>
      } @else {
        <!-- VIEW 1: TABLE VIEW -->
        @if (viewMode === 'table') {
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            @if (filteredJobs.length === 0) {
              <div class="text-center py-20 px-4">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <app-icon name="briefcase" [size]="28"></app-icon>
                </div>
                <h3 class="text-base font-bold text-slate-800">No applications found</h3>
                <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {{ searchTerm || selectedStatus !== 'All' ? 'Try adjusting your search or filters to see more results.' : 'Get started by adding your first job application.' }}
                </p>
                <div class="mt-4">
                  <a
                    routerLink="/applications/add"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <app-icon name="plus" [size]="14"></app-icon>
                    <span>Add Application</span>
                  </a>
                </div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm divide-y divide-slate-100">
                  <thead class="bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th class="py-3.5 px-4 sm:px-6">Company</th>
                      <th class="py-3.5 px-4">Job Role</th>
                      <th class="py-3.5 px-4 hidden md:table-cell">Location & Type</th>
                      <th class="py-3.5 px-4">Applied Date</th>
                      <th class="py-3.5 px-4">Status</th>
                      <th class="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    @for (job of filteredJobs; track job._id) {
                      <tr class="hover:bg-slate-50/70 transition-colors group">
                        <!-- Company -->
                        <td class="py-4 px-4 sm:px-6">
                          <div class="font-bold text-slate-800">{{ job.company }}</div>
                          @if (job.expectedSalary) {
                            <div class="text-xs text-slate-400">
                              {{ job.expectedSalary | currency:'USD':'symbol':'1.0-0' }} / yr
                            </div>
                          }
                        </td>

                        <!-- Role -->
                        <td class="py-4 px-4">
                          <span class="font-medium text-slate-700">{{ job.role }}</span>
                          @if (job.interviewDate) {
                            <div class="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                              <app-icon name="calendar" [size]="12"></app-icon>
                              <span>Interview: {{ job.interviewDate | date:'MMM d' }}</span>
                            </div>
                          }
                        </td>

                        <!-- Location & Type -->
                        <td class="py-4 px-4 hidden md:table-cell text-slate-500 text-xs">
                          <div>{{ job.location || 'Not specified' }}</div>
                          <span class="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {{ job.employmentType }} · {{ job.workMode }}
                          </span>
                        </td>

                        <!-- Applied Date -->
                        <td class="py-4 px-4 text-slate-500 text-xs">
                          {{ job.appliedDate | date:'mediumDate' }}
                        </td>

                        <!-- Status with quick switcher -->
                        <td class="py-4 px-4">
                          <select
                            [value]="job.status"
                            (change)="onUpdateStatus(job, $event)"
                            class="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-slate-300"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Offer Received">Offer Received</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <!-- Actions -->
                        <td class="py-4 px-4 sm:px-6 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <a
                              [routerLink]="['/jobs', job._id, 'interview-preparation']"
                              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 transition-all shadow-2xs"
                              title="Prepare with Google Gemini AI"
                            >
                              <app-icon name="sparkles" [size]="13" cssClass="text-indigo-600"></app-icon>
                              <span class="hidden xl:inline">Prepare with AI</span>
                            </a>
                            @if (job.jobLink) {
                              <a
                                [href]="job.jobLink"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View Job Posting"
                              >
                                <app-icon name="external-link" [size]="16"></app-icon>
                              </a>
                            }
                            <button
                              type="button"
                              (click)="navigateEdit(job)"
                              class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Application"
                            >
                              <app-icon name="edit" [size]="16"></app-icon>
                            </button>
                            <button
                              type="button"
                              (click)="promptDelete(job)"
                              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Delete Application"
                            >
                              <app-icon name="trash" [size]="16"></app-icon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- VIEW 2: KANBAN BOARD VIEW -->
        @if (viewMode === 'kanban') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            @for (column of kanbanColumns; track column.status) {
              <div class="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 flex flex-col min-h-[450px]">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div class="flex items-center gap-2">
                    <span [class]="column.dotClass" class="w-2.5 h-2.5 rounded-full"></span>
                    <h3 class="text-sm font-bold text-slate-800">{{ column.title }}</h3>
                  </div>
                  <span class="px-2 py-0.5 text-xs font-semibold bg-white text-slate-600 rounded-full border border-slate-200 shadow-xs">
                    {{ getJobsInColumn(column.status).length }}
                  </span>
                </div>

                <!-- Column Cards List -->
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
                  @for (job of getJobsInColumn(column.status); track job._id) {
                    <app-job-card
                      [job]="job"
                      (edit)="navigateEdit($event)"
                      (delete)="promptDelete($event)"
                      (statusChange)="onCardStatusChange($event)"
                    ></app-job-card>
                  } @empty {
                    <div class="h-36 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <span>No jobs in {{ column.title }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Delete Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="isDeleteModalOpen"
        [title]="'Delete Job Application'"
        [message]="'Are you sure you want to delete the application for ' + (jobToDelete?.company || '') + ' (' + (jobToDelete?.role || '') + ')? This action cannot be reversed.'"
        [isLoading]="isDeleting"
        (confirm)="confirmDelete()"
        (cancel)="closeDeleteModal()"
      ></app-confirmation-modal>
    </div>
  `,
})
export class JobListComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  private sub: Subscription = new Subscription();

  isLoading: boolean = true;
  viewMode: 'table' | 'kanban' = 'table';

  // Filters & Sorting state
  searchTerm: string = '';
  selectedStatus: string = 'All';
  sortOrder: 'asc' | 'desc' = 'desc';

  allJobs: JobApplication[] = [];
  filteredJobs: JobApplication[] = [];

  // Delete modal state
  isDeleteModalOpen: boolean = false;
  isDeleting: boolean = false;
  jobToDelete: JobApplication | null = null;

  readonly kanbanColumns: { title: string; status: JobStatus; dotClass: string }[] = [
    { title: 'Applied', status: 'Applied', dotClass: 'bg-blue-500' },
    { title: 'Interview Scheduled', status: 'Interview Scheduled', dotClass: 'bg-amber-500 animate-pulse' },
    { title: 'Offer Received', status: 'Offer Received', dotClass: 'bg-emerald-500' },
    { title: 'Rejected', status: 'Rejected', dotClass: 'bg-rose-500' },
  ];

  ngOnInit(): void {
    this.fetchJobs();

    // Listen for cross-component refresh triggers
    this.sub.add(
      this.jobService.refreshTrigger$.subscribe(() => {
        this.fetchJobs();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.jobService
      .getJobs({
        search: this.searchTerm,
        status: this.selectedStatus,
        sortBy: 'appliedDate',
        order: this.sortOrder,
      })
      .subscribe({
        next: (res) => {
          this.allJobs = res.data || [];
          this.filteredJobs = [...this.allJobs];
          this.isLoading = false;
        },
        error: (err) => {
          this.notificationService.error(err.message || 'Failed to load jobs');
          this.isLoading = false;
        },
      });
  }

  onFilterChange(): void {
    this.fetchJobs();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onFilterChange();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.sortOrder = 'desc';
    this.fetchJobs();
  }

  getJobsInColumn(status: JobStatus): JobApplication[] {
    return this.filteredJobs.filter((j) => j.status === status);
  }

  navigateEdit(job: JobApplication): void {
    if (job._id) {
      this.router.navigate(['/applications/edit', job._id]);
    }
  }

  onUpdateStatus(job: JobApplication, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as JobStatus;
    this.updateStatus(job, newStatus);
  }

  onCardStatusChange(event: { job: JobApplication; newStatus: JobStatus }): void {
    this.updateStatus(event.job, event.newStatus);
  }

  private updateStatus(job: JobApplication, newStatus: JobStatus): void {
    if (!job._id || job.status === newStatus) return;

    const previousStatus = job.status;
    // Optimistic update
    job.status = newStatus;

    this.jobService.updateJobStatus(job._id, newStatus).subscribe({
      next: () => {
        this.notificationService.success(`Status updated to "${newStatus}" for ${job.company}`);
      },
      error: (err) => {
        job.status = previousStatus; // Revert on failure
        this.notificationService.error(err.message || 'Failed to update status');
      },
    });
  }

  promptDelete(job: JobApplication): void {
    this.jobToDelete = job;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.jobToDelete = null;
  }

  confirmDelete(): void {
    if (!this.jobToDelete?._id) return;

    this.isDeleting = true;
    const company = this.jobToDelete.company;

    this.jobService.deleteJob(this.jobToDelete._id).subscribe({
      next: () => {
        this.notificationService.success(`Application for ${company} deleted successfully`);
        this.isDeleting = false;
        this.closeDeleteModal();
        this.fetchJobs();
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to delete application');
        this.isDeleting = false;
      },
    });
  }
}
