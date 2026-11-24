import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { JobApplication } from '../models/job.model';
import { environment } from '../../environments/environment';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/jobs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobService],
    });
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created via Angular Dependency Injection', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all job applications (GET)', () => {
    const mockJobs: JobApplication[] = [
      {
        _id: '1',
        company: 'Google',
        role: 'Frontend Engineer',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        appliedDate: new Date(),
        status: 'Interview Scheduled',
      },
    ];

    service.getJobs().subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].company).toBe('Google');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, count: 1, data: mockJobs });
  });

  it('should create a new job application (POST)', () => {
    const newJob: Partial<JobApplication> = {
      company: 'Microsoft',
      role: 'Software Engineer',
      appliedDate: new Date(),
      status: 'Applied',
    };

    service.createJob(newJob).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.data.company).toBe('Microsoft');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newJob);
    req.flush({ success: true, data: { ...newJob, _id: 'new_id' } });
  });

  it('should update an existing job application (PUT)', () => {
    const updates: Partial<JobApplication> = {
      status: 'Offer Received',
    };

    service.updateJob('job_123', updates).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('Offer Received');
    });

    const req = httpMock.expectOne(`${apiUrl}/job_123`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { _id: 'job_123', status: 'Offer Received' } });
  });

  it('should delete a job application (DELETE)', () => {
    service.deleteJob('job_123').subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('job_123');
    });

    const req = httpMock.expectOne(`${apiUrl}/job_123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: { id: 'job_123' } });
  });
});
