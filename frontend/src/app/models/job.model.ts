/**
 * CareerTrack - Job Application Models & Types
 * Demonstrates strong TypeScript typing with union types and interfaces.
 */

export type JobStatus = 'Applied' | 'Interview Scheduled' | 'Offer Received' | 'Rejected';
export type EmploymentType = 'Full-time' | 'Internship' | 'Contract' | 'Part-time';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface JobApplication {
  _id?: string;
  company: string;
  role: string;
  location?: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  jobLink?: string;
  jobDescription?: string;
  appliedDate: string | Date;
  status: JobStatus;
  expectedSalary?: number | null;
  interviewDate?: string | Date | null;
  notes?: string;
  daysUntilInterview?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface JobStats {
  total: number;
  applied: number;
  interviewScheduled: number;
  offerReceived: number;
  rejected: number;
  monthlyCounts: { [month: string]: number };
}

export interface JobFilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
