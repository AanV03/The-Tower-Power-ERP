export interface MockExercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  weight?: string;
  notes?: string;
}

export interface MockWorkout {
  id: string;
  day: string;
  name: string;
  exercises: MockExercise[];
}

export interface MockClass {
  id: string;
  name: string;
  trainer: string;
  time: string;
  capacity: number;
  booked: number;
}

export interface MockProgress {
  weight: number;
  bodyFat: number;
  muscleMass: number;
  points: number;
  level: string;
  nextLevelPoints: number;
  history: { date: string; weight: number; bodyFat: number }[];
}

export const mockWorkouts: MockWorkout[] = [
  {
    id: "w1",
    day: "Lunes / Jueves",
    name: "Pecho y Tríceps (Fuerza)",
    exercises: [
      { id: "e1", name: "Press de Banca con Barra", series: 4, reps: "8-10", weight: "60 kg", notes: "Controlar la bajada" },
      { id: "e2", name: "Press Inclinado con Mancuernas", series: 4, reps: "10-12", weight: "22 kg", notes: "Mantener retracción escapular" },
      { id: "e3", name: "Aperturas en Polea (Cruce)", series: 3, reps: "15", weight: "15 kg", notes: "Enfoque en contracción" },
      { id: "e4", name: "Fondos de Tríceps en Paralelas", series: 3, reps: "Al fallo", weight: "Corporal", notes: "Cuerpo ligeramente inclinado" },
      { id: "e5", name: "Extensión de Tríceps en Polea Alta", series: 4, reps: "12", weight: "20 kg", notes: "Codos pegados al cuerpo" }
    ]
  },
  {
    id: "w2",
    day: "Martes / Viernes",
    name: "Espalda y Bíceps (Hipertrofia)",
    exercises: [
      { id: "e6", name: "Dominadas", series: 4, reps: "8", weight: "Corporal", notes: "Rango completo" },
      { id: "e7", name: "Remo con Barra", series: 4, reps: "10", weight: "50 kg", notes: "Llevar la barra al ombligo" },
      { id: "e8", name: "Jalón al Pecho", series: 3, reps: "12", weight: "45 kg", notes: "Espalda recta" },
      { id: "e9", name: "Curl de Bíceps con Barra EZ", series: 4, reps: "12", weight: "25 kg", notes: "No balancear la espalda" },
      { id: "e10", name: "Curl de Bíceps Martillo", series: 3, reps: "15", weight: "12 kg", notes: "Mancuernas alternas" }
    ]
  },
  {
    id: "w3",
    day: "Miércoles",
    name: "Pierna Completa y Hombro",
    exercises: [
      { id: "e11", name: "Sentadillas Traseras", series: 4, reps: "8-10", weight: "80 kg", notes: "Bajar de forma controlada" },
      { id: "e12", name: "Prensa de Piernas", series: 4, reps: "12", weight: "150 kg", notes: "No bloquear rodillas arriba" },
      { id: "e13", name: "Extensiones de Cuádriceps", series: 3, reps: "15", weight: "40 kg", notes: "Sostener 1s arriba" },
      { id: "e14", name: "Curl Femoral Tumbado", series: 3, reps: "12", weight: "30 kg", notes: "Movimiento lento" },
      { id: "e15", name: "Press Militar con Mancuernas", series: 4, reps: "10", weight: "18 kg", notes: "Hombro bien alineado" },
      { id: "e16", name: "Elevaciones Laterales", series: 4, reps: "15", weight: "8 kg", notes: "Mancuernas ligeras, técnica estricta" }
    ]
  }
];

export const mockClasses: MockClass[] = [
  { id: "c1", name: "Crossfit WOD", trainer: "Coach Carlos", time: "07:00 AM - 08:00 AM", capacity: 20, booked: 14 },
  { id: "c2", name: "Yoga Vinyasa", trainer: "Yogi Elena", time: "08:30 AM - 09:30 AM", capacity: 15, booked: 15 },
  { id: "c3", name: "Spinning Pro", trainer: "Instructor David", time: "06:00 PM - 07:00 PM", capacity: 25, booked: 18 },
  { id: "c4", name: "Funcional HIIT", trainer: "Coach Carlos", time: "07:15 PM - 08:15 PM", capacity: 20, booked: 8 }
];

export const mockProgress: MockProgress = {
  weight: 78.5,
  bodyFat: 14.2,
  muscleMass: 42.1,
  points: 450,
  level: "Guerrero Espartano",
  nextLevelPoints: 600,
  history: [
    { date: "2026-04-01", weight: 81.2, bodyFat: 16.5 },
    { date: "2026-05-01", weight: 79.8, bodyFat: 15.3 },
    { date: "2026-06-01", weight: 78.9, bodyFat: 14.6 },
    { date: "2026-07-01", weight: 78.5, bodyFat: 14.2 }
  ]
};

export function getMockWorkouts(): MockWorkout[] {
  return mockWorkouts;
}

export function getMockClasses(): MockClass[] {
  return mockClasses;
}

export function getMockProgress(): MockProgress {
  return mockProgress;
}

export interface MockTeam {
  id: string;
  name: string;
  membersCount: number;
  description: string;
  monthlyXP: number;
  rank: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  rank: number;
  avatarUrl?: string;
  streak: number;
}

export const mockTeams: MockTeam[] = [
  { id: "t1", name: "Los Espartanos", membersCount: 14, description: "Entrenamiento de fuerza y alta intensidad. ¡A romper límites!", monthlyXP: 14200, rank: 1 },
  { id: "t2", name: "Team Running", membersCount: 22, description: "Amantes del cardio, running y preparación para maratones.", monthlyXP: 11800, rank: 2 },
  { id: "t3", name: "Powerlifters Unidos", membersCount: 8, description: "Sentadilla, banca y peso muerto. Club de fuerza pura.", monthlyXP: 9500, rank: 3 },
  { id: "t4", name: "Yoga & Calma", membersCount: 12, description: "Flexibilidad, balance y paz interior en cada sesión.", monthlyXP: 7200, rank: 4 }
];

export const mockLeaderboard: LeaderboardUser[] = [
  { id: "l1", name: "Daniel Torres", xp: 950, rank: 1, streak: 12 },
  { id: "l2", name: "Sofía Vergara", xp: 820, rank: 2, streak: 8 },
  { id: "l3", name: "Tú (Guerrero)", xp: 450, rank: 3, streak: 5 },
  { id: "l4", name: "Carlos Slim", xp: 420, rank: 4, streak: 3 },
  { id: "l5", name: "Ana Martínez", xp: 380, rank: 5, streak: 2 }
];

export function getMockTeams(): MockTeam[] {
  return mockTeams;
}

export function getMockLeaderboard(): LeaderboardUser[] {
  return mockLeaderboard;
}

