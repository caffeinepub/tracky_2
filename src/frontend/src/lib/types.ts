// Local type definitions since backend is empty
export interface StudySession {
  startTime: bigint;
  endTime: bigint;
  completed: boolean;
  chapterId: string | null;
}

export interface UserSettings {
  workDuration: bigint;
  breakDuration: bigint;
}

export interface SyllabusChapter {
  id: string;
  title: string;
  subject: string;
  notes: string | null;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  lastSessionDay: number;
}

// Extended backend interface with expected methods
export interface ExtendedBackendInterface {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getCurrentStreak: () => Promise<bigint>;
  getSessions: () => Promise<StudySession[]>;
  getSettings: () => Promise<UserSettings>;
  updateSettings: (workDuration: bigint, breakDuration: bigint) => Promise<void>;
  startSession: (startTime: bigint, chapterId: string | null) => Promise<void>;
  endSession: (endTime: bigint) => Promise<void>;
  getStatistics: () => Promise<{
    dailyStudyTime: Array<[bigint, bigint]>;
    weeklyTrends: Array<[bigint, bigint]>;
    sessionDistribution: Array<[bigint, bigint]>;
  }>;
  getChapters: () => Promise<SyllabusChapter[]>;
  addChapter: (title: string, subject: string) => Promise<void>;
  editChapter: (id: string, title: string, subject: string, notes: string | null) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  markChapterAsCompleted: (id: string) => Promise<void>;
  markChapterAsIncomplete: (id: string) => Promise<void>;
}
