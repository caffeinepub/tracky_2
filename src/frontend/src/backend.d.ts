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
export interface StudySession {
    startTime: Time;
    endTime: Time;
    completed: boolean;
}
export type Time = bigint;
export interface backendInterface {
    endSession(endTime: Time): Promise<void>;
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
    startSession(startTime: Time): Promise<void>;
    updateSettings(workDuration: bigint, breakDuration: bigint): Promise<void>;
}
