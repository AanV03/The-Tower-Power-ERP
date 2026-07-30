export type PortalWorkoutExercise = {
  id: string;
  name: string;
  series: number;
  reps: string;
  weight: string | null;
  restSeconds: number | null;
  notes: string | null;
};

export type PortalWorkout = {
  id: string;
  day: string;
  name: string;
  description: string | null;
  exercises: PortalWorkoutExercise[];
};

export type PortalClass = {
  id: string;
  name: string;
  trainer: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "ATTENDED" | "CANCELLED" | null;
};

export type PortalSettings = {
  pushNotifications: boolean;
  reminders: boolean;
  darkMode: boolean;
};

export type PortalProgress = {
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  points: number;
  level: string;
  nextLevelPoints: number;
  history: Array<{
    date: string;
    weight: number | null;
    bodyFat: number | null;
    muscleMass: number | null;
  }>;
};

export type PortalTeam = {
  id: string;
  name: string;
  membersCount: number;
  description: string;
  monthlyXP: number;
  rank: number;
  joined: boolean;
};

export type PortalLeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  rank: number;
  isCurrentMember: boolean;
};
