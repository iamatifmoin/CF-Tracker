
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: Date;
  emailReminderCount: number;
  emailRemindersEnabled: boolean;
  createdAt: Date;
}

export interface Contest {
  id: number;
  name: string;
  startTimeSeconds: number;
  durationSeconds: number;
  type: string;
  phase: string;
}

export interface ContestParticipation {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}

export interface Submission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: Problem;
  author: {
    contestId: number;
    members: Array<{ handle: string }>;
    participantType: string;
    ghost: boolean;
    startTimeSeconds: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export interface StudentData {
  student: Student;
  contests: ContestParticipation[];
  submissions: Submission[];
  problems: Problem[];
}

export interface SyncSettings {
  frequency: 'daily' | 'weekly';
  time: string; // Format: "HH:MM"
  timezone: string;
  lastSync: Date | null;
  isEnabled: boolean;
}
