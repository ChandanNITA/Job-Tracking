import { Routes } from '@angular/router';

/**
 * Application Routes Configuration
 * Angular concepts demonstrated:
 * - Angular Router configuration
 * - Lazy-loading Standalone Components via loadComponent
 * - Parameterized routing (:id)
 * - Wildcard (**) and default route redirects
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard | CareerTrack',
  },
  {
    path: 'applications',
    loadComponent: () =>
      import('./pages/job-list/job-list.component').then((m) => m.JobListComponent),
    title: 'All Applications | CareerTrack',
  },
  {
    path: 'applications/add',
    loadComponent: () =>
      import('./pages/add-job/add-job.component').then((m) => m.AddJobComponent),
    title: 'Add Job Application | CareerTrack',
  },
  {
    path: 'applications/edit/:id',
    loadComponent: () =>
      import('./pages/edit-job/edit-job.component').then((m) => m.EditJobComponent),
    title: 'Edit Job Application | CareerTrack',
  },
  {
    path: 'interviews',
    loadComponent: () =>
      import('./pages/interviews/interviews.component').then((m) => m.InterviewsComponent),
    title: 'Interview Schedule | CareerTrack',
  },
  {
    path: 'jobs/:id/interview-preparation',
    loadComponent: () =>
      import('./pages/interview-preparation/interview-preparation.component').then(
        (m) => m.InterviewPreparationComponent
      ),
    title: 'AI Interview Preparation | CareerTrack',
  },
  {
    path: 'applications/:id/interview-preparation',
    redirectTo: 'jobs/:id/interview-preparation',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
