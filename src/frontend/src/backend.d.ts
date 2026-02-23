import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserSettings {
    workDuration: bigint;
    breakDuration: bigint;
}
export interface SyllabusChapter {
    id: string;
    title: string;
    subject: string;
    notes?: string;
}
export type Time = bigint;
export interface StudySession {
    startTime: Time;
    endTime: Time;
    completed: boolean;
    chapterId?: string;
}
export interface backendInterface {
    createChapter(title: string, subject: string, notes: string | null): Promise<void>;
    deleteChapter(chapterId: string): Promise<void>;
    editChapter(chapterId: string, newTitle: string, newSubject: string, newNotes: string | null): Promise<void>;
    endSession(endTime: Time): Promise<void>;
    getChapters(): Promise<Array<SyllabusChapter>>;
    getCurrentStreak(): Promise<bigint>;
    getSessions(): Promise<Array<StudySession>>;
    getSettings(): Promise<UserSettings>;
    getStatistics(): Promise<{
        weeklyTrends: Array<[bigint, bigint]>;
        dailyStudyTime: Array<[bigint, bigint]>;
        sessionDistribution: Array<[bigint, bigint]>;
    }>;
    login(): Promise<void>;
    logout(): Promise<void>;
    startSession(startTime: Time, chapterId: string | null): Promise<void>;
    updateSettings(workDuration: bigint, breakDuration: bigint): Promise<void>;
}
