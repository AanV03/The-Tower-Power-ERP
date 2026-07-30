"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Dumbbell,
} from "lucide-react";

import type { PortalWorkout } from "@/lib/portal/types";

type WorkoutsClientProps = {
  locale: string;
  tenantSlug: string;
  workouts: PortalWorkout[];
};

export default function WorkoutsClient({
  locale,
  tenantSlug,
  workouts,
}: WorkoutsClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<
    Record<string, boolean>
  >({});
  const activeWorkout = workouts[activeTab];

  function toggleExercise(exerciseId: string) {
    setCompletedExercises((current) => ({
      ...current,
      [exerciseId]: !current[exerciseId],
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Mi Rutina</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Sigue tu plan de entrenamiento diario
          </p>
        </div>
      </div>

      {activeWorkout ? (
        <>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-2 scrollbar-none">
            {workouts.map((workout, index) => (
              <button
                key={workout.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeTab === index
                    ? "bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-md shadow-[var(--primary-color)]/10"
                    : "bg-[var(--surface-color)]/40 text-[var(--text-color)] opacity-70 border-[var(--surface-color)]/50 hover:opacity-100"
                }`}
              >
                {workout.day.split(" / ")[0]}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-color)]/25 border border-[var(--surface-color)]/40 flex items-start gap-3">
            <Clipboard className="w-5 h-5 text-[var(--primary-color)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                {activeWorkout.name}
              </h3>
              <p className="text-xs text-[var(--text-color)] opacity-50 mt-0.5">
                Dias: {activeWorkout.day}
              </p>
              {activeWorkout.description && (
                <p className="text-xs text-[var(--text-color)] opacity-50 mt-1">
                  {activeWorkout.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {activeWorkout.exercises.map((exercise, index) => {
              const isDone = completedExercises[exercise.id] ?? false;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => toggleExercise(exercise.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/30 opacity-70"
                      : "bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40 hover:bg-[var(--surface-color)]/50"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3.5 text-left">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold text-xs shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-semibold text-sm ${isDone ? "line-through opacity-50" : ""}`}>
                        {exercise.name}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-color)] opacity-60">
                        <span>{exercise.series} Series</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-color)] opacity-30" />
                        <span>{exercise.reps} Reps</span>
                        {exercise.weight && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--text-color)] opacity-30" />
                            <span className="font-semibold text-[var(--primary-color)]">
                              {exercise.weight}
                            </span>
                          </>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-[10px] text-[var(--text-color)] opacity-40 mt-1 italic">
                          Nota: {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : "border-[var(--surface-color)] text-transparent"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-8 rounded-xl bg-[var(--surface-color)]/25 border border-[var(--surface-color)]/40 text-center">
          <Dumbbell className="w-8 h-8 text-[var(--primary-color)] mx-auto mb-3" />
          <p className="font-semibold text-sm">Sin rutina asignada</p>
          <p className="text-xs text-[var(--text-color)] opacity-50 mt-1">
            Tu entrenador publicara aqui tu proximo plan.
          </p>
        </div>
      )}
    </div>
  );
}
