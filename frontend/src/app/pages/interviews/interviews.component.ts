import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobService } from '../../services/job.service';
import { JobApplication } from '../../models/job.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { IconComponent } from '../../components/icon/icon.component';

/**
 * InterviewsComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - Date calculations & dynamic countdown labels
 * - Built-in DatePipe
 * - RxJS Subscription and cleanup
 * - Modern template control flow (@if, @for, @empty)
 */
@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, StatusBadgeComponent, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Interview Schedule</h2>
          <p class="text-sm text-slate-500 mt-1">
            Track all your scheduled technical screens, recruiter calls, and final rounds chronologically.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a
            routerLink="/applications/add"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Schedule New Interview</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-slate-500 mt-4">Loading your interview schedule...</p>
        </div>
      } @else {
        <!-- UPCOMING INTERVIEWS SECTION -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 class="text-base font-bold text-slate-800">
                Upcoming Interviews ({{ upcomingInterviews.length }})
              </h3>
            </div>
            <span class="text-xs text-slate-500">Sorted chronologically</span>
          </div>

          @if (upcomingInterviews.length === 0) {
            <div class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
                <app-icon name="calendar" [size]="28"></app-icon>
              </div>
              <h4 class="text-base font-bold text-slate-800">No Upcoming Interviews</h4>
              <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                You don't have any upcoming interviews scheduled. Set an interview date on any job application to track it here.
              </p>
              <div class="mt-4">
                <a
                  routerLink="/applications"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <app-icon name="briefcase" [size]="14"></app-icon>
                  <span>Manage Applications</span>
                </a>
              </div>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (interview of upcomingInterviews; track interview._id) {
                <div
                  class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <!-- Header: Company & Days Remaining Pill -->
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 class="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {{ interview.company }}
                        </h4>
                        <p class="text-xs font-medium text-slate-500">{{ interview.role }}</p>
                      </div>
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 shadow-xs"
                        [ngClass]="getCountdownClass(interview.interviewDate)"
                      >
                        {{ getCountdownText(interview.interviewDate) }}
                      </span>
                    </div>

                    <!-- Interview Date & Time Badge -->
                    <div class="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3 flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <app-icon name="clock" [size]="18"></app-icon>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-amber-900">
                          {{ interview.interviewDate | date:'fullDate' }}
                        </p>
                        <p class="text-[11px] text-amber-700">Interview Session Scheduled</p>
                      </div>
                    </div>

                    <!-- Notes Section -->
                    @if (interview.notes) {
                      <div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-1">
                        <span class="font-semibold text-slate-700 block">Preparation Notes:</span>
                        <p class="italic text-slate-500 whitespace-pre-line">{{ interview.notes }}</p>
                      </div>
                    }

                    <!-- Location info -->
                    @if (interview.location) {
                      <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                        <app-icon name="map-pin" [size]="14" cssClass="text-slate-400"></app-icon>
                        <span>{{ interview.location }} ({{ interview.workMode }})</span>
                      </div>
                    }
                  </div>

                  <!-- Footer Actions: Edit and External Link -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <app-status-badge [status]="interview.status"></app-status-badge>

                    <div class="flex items-center gap-2">
                      @if (interview.jobLink) {
                        <a
                          [href]="interview.jobLink"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Open Job Posting"
                        >
                          <app-icon name="external-link" [size]="16"></app-icon>
                        </a>
                      }
                      <a
                        [routerLink]="['/applications/edit', interview._id]"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <app-icon name="edit" [size]="14"></app-icon>
                        <span>Edit</span>
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- PAST INTERVIEWS SECTION (IF ANY) -->
        @if (pastInterviews.length > 0) {
          <div class="space-y-4 pt-6">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 class="text-base font-bold text-slate-700">
                Completed / Past Interviews ({{ pastInterviews.length }})
              </h3>
              <span class="text-xs text-slate-400">Previous sessions</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (interview of pastInterviews; track interview._id) {
                <div class="bg-white/80 rounded-2xl border border-slate-200 p-4 shadow-xs opacity-75 hover:opacity-100 transition-opacity">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 class="text-sm font-bold text-slate-800">{{ interview.company }}</h4>
                      <p class="text-xs text-slate-500">{{ interview.role }}</p>
                    </div>
                    <app-status-badge [status]="interview.status"></app-status-badge>
                  </div>
                  <p class="text-xs text-slate-400 mb-2">
                    Was on {{ interview.interviewDate | date:'mediumDate' }}
                  </p>
                  @if (interview.notes) {
                    <p class="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                      "{{ interview.notes }}"
                    </p>
                  }
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class InterviewsComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private sub: Subscription = new Subscription();

  isLoading: boolean = true;
  upcomingInterviews: JobApplication[] = [];
  pastInterviews: JobApplication[] = [];

  ngOnInit(): void {
    this.loadInterviews();

    this.sub.add(
      this.jobService.refreshTrigger$.subscribe(() => {
        this.loadInterviews();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadInterviews(): void {
    this.isLoading = true;

    this.jobService.getJobs().subscribe({
      next: (res) => {
        const allJobs = res.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const jobsWithInterview = allJobs.filter((j) => j.interviewDate);

        // Upcoming (interviewDate >= today) sorted chronologically asc
        this.upcomingInterviews = jobsWithInterview
          .filter((j) => {
            const d = new Date(j.interviewDate!);
            return !isNaN(d.getTime()) && d.getTime() >= today.getTime();
          })
          .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());

        // Past interviews (interviewDate < today) sorted desc
        this.pastInterviews = jobsWithInterview
          .filter((j) => {
            const d = new Date(j.interviewDate!);
            return !isNaN(d.getTime()) && d.getTime() < today.getTime();
          })
          .sort((a, b) => new Date(b.interviewDate!).getTime() - new Date(a.interviewDate!).getTime());

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load interviews:', err);
        this.isLoading = false;
      },
    });
  }

  getCountdownText(interviewDate: string | Date | null | undefined): string {
    if (!interviewDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(interviewDate);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  }

  getCountdownClass(interviewDate: string | Date | null | undefined): string {
    if (!interviewDate) return 'bg-slate-100 text-slate-700';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(interviewDate);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      return 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse';
    }
    if (diffDays <= 3) {
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
}
