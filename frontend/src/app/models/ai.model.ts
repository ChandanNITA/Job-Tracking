/**
 * AI Interview Preparation Models & Types
 * Strongly typed interfaces for Google Gemini integration in CareerTrack.
 */

export type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid-level' | 'Senior';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type InterviewType = 'Technical' | 'Behavioral' | 'Mixed';
export type QuestionCategory = 'Technical' | 'Behavioral' | 'Scenario';

export interface InterviewRequest {
  company: string;
  role: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: QuestionCategory | string;
  difficulty: DifficultyLevel | string;
  answer: string;
  keyPoints: string[];
  practiced?: boolean;
  isExpanded?: boolean;
}

export interface InterviewResponse {
  questions: InterviewQuestion[];
  topicsToRevise: string[];
  preparationTips: string[];
}
