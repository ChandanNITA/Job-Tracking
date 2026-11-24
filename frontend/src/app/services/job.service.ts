import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, JobApplication, JobFilterParams, JobStats } from '../models/job.model';

/**
 * JobService
 * Angular concepts demonstrated:
 * - Angular Service with @Injectable
 * - Modern inject() function for Dependency Injection
 * - Angular HttpClient for asynchronous HTTP communication
 * - RxJS Observables, pipeable operators (tap, catchError)
 * - BehaviorSubject for reactive refresh triggering
 * - Environment configuration separation
 */
@Injectable({
  providedIn: 'root',
})
export class JobService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jobs`;

  // Reactive trigger to notify subscribers when job data changes
  private refreshTriggerSubject = new BehaviorSubject<void>(undefined);
  public refreshTrigger$ = this.refreshTriggerSubject.asObservable();

  /**
   * Triggers a refresh across all listening components
   */
  public triggerRefresh(): void {
    this.refreshTriggerSubject.next();
  }

  /**
   * Get all job applications with optional search, status filtering, and sorting
   */
  getJobs(filters?: JobFilterParams): Observable<ApiResponse<JobApplication[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search && filters.search.trim()) {
        params = params.set('search', filters.search.trim());
      }
      if (filters.status && filters.status !== 'All') {
        params = params.set('status', filters.status);
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.order) {
        params = params.set('order', filters.order);
      }
    }

    return this.http
      .get<ApiResponse<JobApplication[]>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a single job application by ID
   */
  getJobById(id: string): Observable<ApiResponse<JobApplication>> {
    return this.http
      .get<ApiResponse<JobApplication>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new job application
   */
  createJob(jobData: Partial<JobApplication>): Observable<ApiResponse<JobApplication>> {
    return this.http
      .post<ApiResponse<JobApplication>>(this.apiUrl, jobData)
      .pipe(
        tap(() => this.triggerRefresh()),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing job application
   */
  updateJob(id: string, jobData: Partial<JobApplication>): Observable<ApiResponse<JobApplication>> {
    return this.http
      .put<ApiResponse<JobApplication>>(`${this.apiUrl}/${id}`, jobData)
      .pipe(
        tap(() => this.triggerRefresh()),
        catchError(this.handleError)
      );
  }

  /**
   * Update just the status of a job application (quick action from Kanban or Table)
   */
  updateJobStatus(id: string, status: string): Observable<ApiResponse<JobApplication>> {
    return this.updateJob(id, { status } as Partial<JobApplication>);
  }

  /**
   * Delete a job application
   */
  deleteJob(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.http
      .delete<ApiResponse<{ id: string }>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.triggerRefresh()),
        catchError(this.handleError)
      );
  }

  /**
   * Get aggregated dashboard statistics
   */
  getStats(): Observable<ApiResponse<JobStats>> {
    return this.http
      .get<ApiResponse<JobStats>>(`${this.apiUrl}/stats/summary`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Centralized HTTP error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}: ${error.statusText || 'Error'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
