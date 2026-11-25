import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { AiService } from '../../services/ai.service';
import { NotificationService } from '../../services/notification.service';
import { JobApplication } from '../../models/job.model';
import {
  DifficultyLevel,
  ExperienceLevel,
  InterviewQuestion,
  InterviewResponse,
  InterviewType,
} from '../../models/ai.model';
import { PreparationProgressComponent } from '../../components/preparation-progress/preparation-progress.component';
import { InterviewQuestionCardComponent } from '../../components/interview-question-card/interview-question-card.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { IconComponent } from '../../components/icon/icon.component';

/**
 * InterviewPreparationComponent
 * Angular concepts demonstrated:
 * - Standalone Component with direct imports
 * - ActivatedRoute injection to read :id parameter
 * - Reactive Forms (FormBuilder, FormGroup, Validators)
 * - Parent-Child communication with @Input() and @Output()
 * - Conditional rendering and modern template control flow (@if, @for)
 * - RxJS Observable subscription and error handling
 * - Client-side state tracking for active practice sessions
 */
@Component({
  selector: 'app-interview-preparation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PreparationProgressComponent,
    InterviewQuestionCardComponent,
    ConfirmationModalComponent,
    IconComponent,
  ],
  templateUrl: './interview-preparation.component.html',
  styleUrls: ['./interview-preparation.component.css'],
})
export class InterviewPreparationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private aiService = inject(AiService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  jobId: string | null = null;
  job: JobApplication | null = null;
  isLoadingJob: boolean = true;
  isGenerating: boolean = false;
  errorMessage: string = '';

  aiResult: InterviewResponse | null = null;
  selectedCategory: string = 'All';
  isConfirmModalOpen: boolean = false;

  readonly experienceLevels: ExperienceLevel[] = ['Fresher', 'Junior', 'Mid-level', 'Senior'];
  readonly difficultyLevels: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
  readonly interviewTypes: InterviewType[] = ['Mixed', 'Technical', 'Behavioral'];
  readonly categoryFilters: string[] = ['All', 'Technical', 'Behavioral', 'Scenario'];

  prepForm: FormGroup = this.fb.group({
    company: ['', [Validators.required, Validators.maxLength(100)]],
    role: ['', [Validators.required, Validators.maxLength(100)]],
    jobDescription: ['', [Validators.maxLength(3000)]],
    experienceLevel: ['Fresher', [Validators.required]],
    difficulty: ['Medium', [Validators.required]],
    interviewType: ['Mixed', [Validators.required]],
  });

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');

    if (this.jobId) {
      this.loadJobDetails(this.jobId);
    } else {
      this.isLoadingJob = false;
    }
  }

  loadJobDetails(id: string): void {
    this.isLoadingJob = true;
    this.jobService.getJobById(id).subscribe({
      next: (res) => {
        this.job = res.data;
        if (this.job) {
          this.prepForm.patchValue({
            company: this.job.company,
            role: this.job.role,
            jobDescription: this.job.jobDescription || '',
          });
        }
        this.isLoadingJob = false;
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to load job details');
        this.isLoadingJob = false;
      },
    });
  }

  get practicedCount(): number {
    if (!this.aiResult?.questions) return 0;
    return this.aiResult.questions.filter((q) => q.practiced).length;
  }

  get filteredQuestions(): InterviewQuestion[] {
    if (!this.aiResult?.questions) return [];
    if (this.selectedCategory === 'All') {
      return this.aiResult.questions;
    }
    return this.aiResult.questions.filter(
      (q) => q.category.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }

  getQuestionCountForCategory(category: string): number {
    if (!this.aiResult?.questions) return 0;
    if (category === 'All') return this.aiResult.questions.length;
    return this.aiResult.questions.filter(
      (q) => q.category.toLowerCase() === category.toLowerCase()
    ).length;
  }

  getOriginalIndex(question: InterviewQuestion): number {
    if (!this.aiResult?.questions) return 0;
    return this.aiResult.questions.findIndex((q) => q.id === question.id);
  }

  getInterviewTypeDescription(type: InterviewType): string {
    switch (type) {
      case 'Mixed':
        return '5 Tech + 3 HR + 2 Scenario';
      case 'Technical':
        return '8 Tech + 2 Scenario';
      case 'Behavioral':
        return '8 HR/Behavioral + 2 Scenario';
      default:
        return '';
    }
  }

  onGenerate(): void {
    if (this.prepForm.invalid) {
      this.prepForm.markAllAsTouched();
      return;
    }

    // If questions already exist and user has practiced some, ask for confirmation
    if (this.aiResult && this.practicedCount > 0) {
      this.promptRegenerate();
      return;
    }

    this.executeGeneration();
  }

  promptRegenerate(): void {
    this.isConfirmModalOpen = true;
  }

  confirmRegeneration(): void {
    this.isConfirmModalOpen = false;
    this.executeGeneration();
  }

  private executeGeneration(): void {
    this.isGenerating = true;
    this.errorMessage = '';

    const formVal = this.prepForm.value;

    this.aiService
      .generateInterviewQuestions({
        company: formVal.company,
        role: formVal.role,
        jobDescription: formVal.jobDescription,
        experienceLevel: formVal.experienceLevel,
        difficulty: formVal.difficulty,
        interviewType: formVal.interviewType,
      })
      .subscribe({
        next: (res) => {
          this.aiResult = res.data;
          this.selectedCategory = 'All';
          this.isGenerating = false;
          this.notificationService.success(
            `Generated 10 custom interview questions for ${formVal.company}!`
          );
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to generate interview questions.';
          this.isGenerating = false;
          this.notificationService.error(this.errorMessage);
        },
      });
  }

  onQuestionPracticed(event: { question: InterviewQuestion; practiced: boolean }): void {
    if (event.practiced) {
      this.notificationService.info(`Marked Question #${event.question.id} as practiced!`);
    }
  }

  onCopyAnswer(question: InterviewQuestion): void {
    this.notificationService.success(`Sample answer for Question #${question.id} copied to clipboard!`);
  }
}
