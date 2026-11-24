import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { JobService } from '../../services/job.service';
import { JobApplication, JobStats } from '../../models/job.model';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { IconComponent } from '../../components/icon/icon.component';

Chart.register(...registerables);

/**
 * DashboardComponent
 * Angular concepts demonstrated:
 * - Standalone Component
 * - ngOnInit, ngAfterViewInit, and ngOnDestroy lifecycle hooks
 * - @ViewChild for accessing native DOM <canvas> elements for Chart.js
 * - Dependency Injection via modern inject()
 * - RxJS Subscription management and unsubscription in ngOnDestroy
 * - Automatic reactive recalculation when applications change
 * - Angular Built-in Control Flow (@if, @for, @empty)
 * - DatePipe and CurrencyPipe formatting
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    CurrencyPipe,
    StatCardComponent,
    StatusBadgeComponent,
    IconComponent,
  ],
  template: `
    <div class="space-y-8 pb-10">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p class="text-sm text-slate-500 mt-1">
            Real-time analytics and status breakdown of your job hunting pipeline.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a
            routerLink="/applications/add"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Quick Add Application</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-slate-500 mt-4">Loading your dashboard data...</p>
        </div>
      } @else {
        <!-- Stat Cards Row (5 Cards) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <app-stat-card
            title="Total Applications"
            [count]="stats.total"
            iconName="briefcase"
            colorScheme="indigo"
          ></app-stat-card>

          <app-stat-card
            title="Applications Pending"
            [count]="stats.applied"
            iconName="clock"
            colorScheme="blue"
          ></app-stat-card>

          <app-stat-card
            title="Interviews"
            [count]="stats.interviewScheduled"
            iconName="calendar"
            colorScheme="amber"
          ></app-stat-card>

          <app-stat-card
            title="Offers Received"
            [count]="stats.offerReceived"
            iconName="check-circle"
            colorScheme="emerald"
          ></app-stat-card>

          <app-stat-card
            title="Rejected"
            [count]="stats.rejected"
            iconName="alert-circle"
            colorScheme="rose"
          ></app-stat-card>
        </div>

        <!-- Charts Section: Donut & Bar Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Donut Chart: Status Distribution -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-800">Application Status Distribution</h3>
                <p class="text-xs text-slate-400 mt-0.5">Ratio of applications by current pipeline stage</p>
              </div>
            </div>

            <div class="relative flex items-center justify-center min-h-[260px] p-2">
              @if (stats.total === 0) {
                <div class="text-center text-slate-400 text-sm py-12">
                  <app-icon name="briefcase" [size]="36" cssClass="mx-auto mb-2 opacity-40"></app-icon>
                  No applications recorded yet.
                </div>
              } @else {
                <canvas #donutCanvas></canvas>
              }
            </div>
          </div>

          <!-- Bar Chart: Monthly Applications -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-800">Monthly Application Volume</h3>
                <p class="text-xs text-slate-400 mt-0.5">Number of job applications submitted per month</p>
              </div>
            </div>

            <div class="relative min-h-[260px] p-2 flex items-center justify-center">
              @if (stats.total === 0) {
                <div class="text-center text-slate-400 text-sm py-12">
                  <app-icon name="calendar" [size]="36" cssClass="mx-auto mb-2 opacity-40"></app-icon>
                  Add job applications to track monthly trends.
                </div>
              } @else {
                <canvas #barCanvas></canvas>
              }
            </div>
          </div>
        </div>

        <!-- Bottom Grid: Recent Applications & Upcoming Interviews -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Recent Job Applications Table (8 Cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-800">Recent Applications</h3>
                <p class="text-xs text-slate-400 mt-0.5">Latest jobs added to your tracking list</p>
              </div>
              <a
                routerLink="/applications"
                class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>View All</span>
                <app-icon name="chevron-right" [size]="14"></app-icon>
              </a>
            </div>

            @if (recentJobs.length === 0) {
              <div class="text-center py-12 text-slate-400 text-sm">
                <app-icon name="briefcase" [size]="32" cssClass="mx-auto mb-2 opacity-40"></app-icon>
                No applications found. Click "Add Application" to get started!
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead>
                    <tr class="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th class="pb-3">Company</th>
                      <th class="pb-3">Role</th>
                      <th class="pb-3">Applied</th>
                      <th class="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (job of recentJobs; track job._id) {
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-3 font-semibold text-slate-800">
                          <a
                            [routerLink]="['/applications/edit', job._id]"
                            class="hover:text-primary-600 transition-colors"
                          >
                            {{ job.company }}
                          </a>
                        </td>
                        <td class="py-3 text-slate-600">{{ job.role }}</td>
                        <td class="py-3 text-slate-500 text-xs">{{ job.appliedDate | date:'mediumDate' }}</td>
                        <td class="py-3">
                          <app-status-badge [status]="job.status"></app-status-badge>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Upcoming Interviews Section (4 Cols) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-800">Upcoming Interviews</h3>
                <p class="text-xs text-slate-400 mt-0.5">Scheduled conversations & countdowns</p>
              </div>
              <a
                routerLink="/interviews"
                class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <app-icon name="chevron-right" [size]="14"></app-icon>
              </a>
            </div>

            @if (upcomingInterviews.length === 0) {
              <div class="text-center py-12 text-slate-400 text-sm">
                <app-icon name="calendar" [size]="32" cssClass="mx-auto mb-2 opacity-40"></app-icon>
                No upcoming interviews scheduled right now.
              </div>
            } @else {
              <div class="space-y-3">
                @for (interview of upcomingInterviews; track interview._id) {
                  <div class="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-colors flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <h4 class="text-sm font-bold text-slate-800 truncate">{{ interview.company }}</h4>
                      <p class="text-xs text-slate-500 truncate">{{ interview.role }}</p>
                      <p class="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                        <app-icon name="calendar" [size]="12"></app-icon>
                        {{ interview.interviewDate | date:'EEEE, MMM d' }}
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        {{ getDaysCountdown(interview.interviewDate) }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private jobService = inject(JobService);

  @ViewChild('donutCanvas') donutCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas?: ElementRef<HTMLCanvasElement>;

  private donutChart?: Chart;
  private barChart?: Chart;
  private sub: Subscription = new Subscription();

  isLoading: boolean = true;
  recentJobs: JobApplication[] = [];
  upcomingInterviews: JobApplication[] = [];

  stats: JobStats = {
    total: 0,
    applied: 0,
    interviewScheduled: 0,
    offerReceived: 0,
    rejected: 0,
    monthlyCounts: {},
  };

  ngOnInit(): void {
    this.loadDashboardData();

    // Re-fetch automatically whenever jobs change anywhere in the app
    this.sub.add(
      this.jobService.refreshTrigger$.subscribe(() => {
        this.loadDashboardData();
      })
    );
  }

  ngAfterViewInit(): void {
    // If data loaded before canvas was initialized, render charts
    if (!this.isLoading) {
      this.initCharts();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroyCharts();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.jobService.getJobs({ sortBy: 'appliedDate', order: 'desc' }).subscribe({
      next: (res) => {
        const jobs = res.data || [];
        this.calculateStats(jobs);
        this.recentJobs = jobs.slice(0, 5);
        this.filterUpcomingInterviews(jobs);
        this.isLoading = false;

        // Render/update charts after DOM updates
        setTimeout(() => {
          this.initCharts();
        }, 50);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoading = false;
      },
    });
  }

  calculateStats(jobs: JobApplication[]): void {
    const stats: JobStats = {
      total: jobs.length,
      applied: 0,
      interviewScheduled: 0,
      offerReceived: 0,
      rejected: 0,
      monthlyCounts: {},
    };

    jobs.forEach((job) => {
      if (job.status === 'Applied') stats.applied++;
      else if (job.status === 'Interview Scheduled') stats.interviewScheduled++;
      else if (job.status === 'Offer Received') stats.offerReceived++;
      else if (job.status === 'Rejected') stats.rejected++;

      const date = new Date(job.appliedDate);
      if (!isNaN(date.getTime())) {
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        stats.monthlyCounts[monthKey] = (stats.monthlyCounts[monthKey] || 0) + 1;
      }
    });

    this.stats = stats;
  }

  filterUpcomingInterviews(jobs: JobApplication[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingInterviews = jobs
      .filter((job) => {
        if (!job.interviewDate) return false;
        const d = new Date(job.interviewDate);
        return !isNaN(d.getTime()) && d.getTime() >= today.getTime();
      })
      .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime())
      .slice(0, 4);
  }

  getDaysCountdown(interviewDate: string | Date | null | undefined): string {
    if (!interviewDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(interviewDate);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  }

  private destroyCharts(): void {
    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = undefined;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined;
    }
  }

  private initCharts(): void {
    this.destroyCharts();

    // 1. Donut Chart: Application Status Distribution
    if (this.donutCanvas?.nativeElement && this.stats.total > 0) {
      const ctx = this.donutCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.donutChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'],
            datasets: [
              {
                data: [
                  this.stats.applied,
                  this.stats.interviewScheduled,
                  this.stats.offerReceived,
                  this.stats.rejected,
                ],
                backgroundColor: [
                  '#3b82f6', // blue-500
                  '#f59e0b', // amber-500
                  '#10b981', // emerald-500
                  '#f43f5e', // rose-500
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  font: { family: 'Inter', size: 12 },
                  color: '#475569',
                  padding: 16,
                },
              },
            },
            cutout: '70%',
          },
        });
      }
    }

    // 2. Bar Chart: Monthly Application Volume
    if (this.barCanvas?.nativeElement && this.stats.total > 0) {
      const ctx = this.barCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const labels = Object.keys(this.stats.monthlyCounts);
        const counts = Object.values(this.stats.monthlyCounts);

        this.barChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.length > 0 ? labels : ['Current Month'],
            datasets: [
              {
                label: 'Applications Submitted',
                data: counts.length > 0 ? counts : [0],
                backgroundColor: '#6366f1',
                borderRadius: 8,
                barThickness: 28,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  color: '#64748b',
                  font: { family: 'Inter' },
                },
                grid: {
                  color: '#f1f5f9',
                },
              },
              x: {
                ticks: {
                  color: '#64748b',
                  font: { family: 'Inter' },
                },
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      }
    }
  }
}
