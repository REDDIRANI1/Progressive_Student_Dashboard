export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'MENTOR';
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  type: string;
  estimatedMinutes?: number;
}

export interface CourseActivity {
  id: number;
  type: string;
  durationMinutes: number;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  lessons?: Lesson[];
  activity?: CourseActivity[];
}

export interface Recommendation {
  title: string;
  reason: string;
}

export interface TimeSeriesPoint {
  date: string;
  minutes: number;
}

export interface CompletionDistributionPoint {
  name: string;
  value: number;
}

export interface StudentDashboardData {
  completedLessons: number;
  totalTimeSpent: number;
  averageProgress: number;
  courses: Course[];
  recommendations: Recommendation[];
  timeSeries: TimeSeriesPoint[];
  completionDistribution: CompletionDistributionPoint[];
  lastActive?: string | null;
}

export interface MentorStudent {
  id: number;
  name: string;
  email: string;
  overallProgress: number;
  totalTimeSpent: number;
  coursesNeedingAttention: string[];
}

export interface MentorStudentDetail {
  student: {
    id: number;
    name: string;
    email: string;
  };
  completedLessons: number;
  totalTimeSpent: number;
  averageProgress: number;
  courses: Course[];
  activity?: CourseActivity[];
}
