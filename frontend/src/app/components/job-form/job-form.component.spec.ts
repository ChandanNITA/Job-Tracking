import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { JobFormComponent } from './job-form.component';

describe('JobFormComponent', () => {
  let component: JobFormComponent;
  let fixture: ComponentFixture<JobFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(JobFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with an invalid form (company & role empty)', () => {
    expect(component.jobForm.valid).toBeFalse();
    expect(component.jobForm.get('company')?.valid).toBeFalse();
    expect(component.jobForm.get('role')?.valid).toBeFalse();
  });

  it('should validate company name minimum length', () => {
    const company = component.jobForm.get('company');
    company?.setValue('A');
    expect(company?.hasError('minlength')).toBeTrue();

    company?.setValue('Acme');
    expect(company?.valid).toBeTrue();
  });

  it('should validate valid URL pattern for jobLink', () => {
    const jobLink = component.jobForm.get('jobLink');
    jobLink?.setValue('not-a-valid-url');
    expect(jobLink?.hasError('pattern')).toBeTrue();

    jobLink?.setValue('https://example.com/careers/123');
    expect(jobLink?.valid).toBeTrue();
  });

  it('should be valid when required fields are filled', () => {
    component.jobForm.patchValue({
      company: 'Amazon Web Services',
      role: 'Cloud Solutions Architect',
      appliedDate: '2026-03-15',
      status: 'Applied',
    });

    expect(component.jobForm.valid).toBeTrue();
  });

  it('should emit formSubmit event when valid form is submitted', () => {
    spyOn(component.formSubmit, 'emit');

    component.jobForm.patchValue({
      company: 'Netflix',
      role: 'UI Platform Engineer',
      appliedDate: '2026-03-20',
      status: 'Interview Scheduled',
    });

    component.onSubmit();
    expect(component.formSubmit.emit).toHaveBeenCalled();
  });
});
