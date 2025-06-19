
import { Student, ContestParticipation, Submission } from '../types/student';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1234567890',
    codeforcesHandle: 'alice_codes',
    currentRating: 1650,
    maxRating: 1750,
    lastUpdated: new Date('2024-06-14T10:30:00Z'),
    emailReminderCount: 2,
    emailRemindersEnabled: true,
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1234567891',
    codeforcesHandle: 'bob_solver',
    currentRating: 1420,
    maxRating: 1480,
    lastUpdated: new Date('2024-06-13T15:45:00Z'),
    emailReminderCount: 0,
    emailRemindersEnabled: true,
    createdAt: new Date('2024-02-10T14:20:00Z'),
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    phone: '+1234567892',
    codeforcesHandle: 'carol_cf',
    currentRating: 1890,
    maxRating: 1950,
    lastUpdated: new Date('2024-06-14T08:15:00Z'),
    emailReminderCount: 1,
    emailRemindersEnabled: false,
    createdAt: new Date('2024-01-20T11:30:00Z'),
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1234567893',
    codeforcesHandle: 'david_competitive',
    currentRating: 2150,
    maxRating: 2200,
    lastUpdated: new Date('2024-06-14T12:00:00Z'),
    emailReminderCount: 0,
    emailRemindersEnabled: true,
    createdAt: new Date('2024-03-05T16:45:00Z'),
  },
  {
    id: '5',
    name: 'Eva Martinez',
    email: 'eva.martinez@example.com',
    phone: '+1234567894',
    codeforcesHandle: 'eva_algorithm',
    currentRating: 1180,
    maxRating: 1200,
    lastUpdated: new Date('2024-06-12T20:30:00Z'),
    emailReminderCount: 3,
    emailRemindersEnabled: true,
    createdAt: new Date('2024-04-12T10:15:00Z'),
  }
];

export const generateMockContests = (handle: string): ContestParticipation[] => {
  const contests: ContestParticipation[] = [];
  const baseRating = 1200 + Math.random() * 800;
  let currentRating = baseRating;
  
  for (let i = 0; i < 20; i++) {
    const ratingChange = (Math.random() - 0.5) * 100;
    const newRating = Math.max(800, Math.min(3000, currentRating + ratingChange));
    
    contests.push({
      contestId: 1800 + i,
      contestName: `Codeforces Round #${850 + i}`,
      handle,
      rank: Math.floor(Math.random() * 5000) + 1,
      oldRating: Math.round(currentRating),
      newRating: Math.round(newRating),
      ratingUpdateTimeSeconds: Date.now() / 1000 - (20 - i) * 7 * 24 * 3600,
      problemsSolved: Math.floor(Math.random() * 6) + 1,
      totalProblems: Math.floor(Math.random() * 3) + 6,
    });
    
    currentRating = newRating;
  }
  
  return contests.reverse();
};

export const generateMockSubmissions = (handle: string): Submission[] => {
  const submissions: Submission[] = [];
  const verdicts = ['OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'];
  const languages = ['GNU C++17', 'Python 3', 'Java 8', 'C# 8'];
  const problemTypes = ['PROGRAMMING', 'CONTEST'];
  
  for (let i = 0; i < 100; i++) {
    const isAccepted = Math.random() > 0.3;
    submissions.push({
      id: i + 1,
      contestId: 1800 + Math.floor(Math.random() * 20),
      creationTimeSeconds: Date.now() / 1000 - Math.random() * 30 * 24 * 3600,
      relativeTimeSeconds: Math.random() * 7200,
      problem: {
        contestId: 1800 + Math.floor(Math.random() * 20),
        index: String.fromCharCode(65 + Math.floor(Math.random() * 6)),
        name: `Problem ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        type: problemTypes[Math.floor(Math.random() * problemTypes.length)],
        rating: 800 + Math.floor(Math.random() * 2000),
        tags: ['implementation', 'math', 'greedy'].slice(0, Math.floor(Math.random() * 3) + 1),
      },
      author: {
        contestId: 1800 + Math.floor(Math.random() * 20),
        members: [{ handle }],
        participantType: 'CONTESTANT',
        ghost: false,
        startTimeSeconds: Date.now() / 1000 - Math.random() * 30 * 24 * 3600,
      },
      programmingLanguage: languages[Math.floor(Math.random() * languages.length)],
      verdict: isAccepted ? 'OK' : verdicts[Math.floor(Math.random() * verdicts.length)],
      testset: 'TESTS',
      passedTestCount: isAccepted ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10),
      timeConsumedMillis: Math.floor(Math.random() * 2000) + 100,
      memoryConsumedBytes: Math.floor(Math.random() * 50000000) + 1000000,
    });
  }
  
  return submissions.sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
};
