import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/job.model';
import { InterviewRequest, InterviewResponse } from '../models/ai.model';

/**
 * AiService
 * Angular concepts demonstrated:
 * - Angular Service with @Injectable({ providedIn: 'root' })
 * - Modern inject() function for Dependency Injection
 * - Angular HttpClient for asynchronous POST requests
 * - Strongly typed RxJS Observables (ApiResponse<InterviewResponse>)
 * - Centralized AI error handling mapping Gemini API errors to readable messages
 */
@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  /**
   * Generates 10 AI-tailored interview questions, 5 revision topics, and 3 preparation tips
   */
  generateInterviewQuestions(request: InterviewRequest): Observable<ApiResponse<InterviewResponse>> {
    return this.http
      .post<ApiResponse<InterviewResponse>>(`${this.apiUrl}/interview-questions`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Centralized HTTP error handling for AI endpoints
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Failed to generate interview questions. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side / network failure
      errorMessage = `Network error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Backend returned custom error message
      errorMessage = error.error.message;
    } else if (error.status === 503) {
      errorMessage = 'Gemini AI service is currently unavailable. Ensure GEMINI_API_KEY is set in backend .env.';
    } else if (error.status === 429) {
      errorMessage = 'AI rate limit or quota exceeded. Please wait a moment and try again.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid Gemini API key configured on the server.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
