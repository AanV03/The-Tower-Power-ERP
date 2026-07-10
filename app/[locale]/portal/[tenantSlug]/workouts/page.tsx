"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getMockWorkouts, MockWorkout } from "@/lib/mockServices";
import { ArrowLeft, CheckCircle2, Dumbbell, Clipboard } from "lucide-react";
import { useParams } from "next/navigation";

export default function WorkoutsPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";
  
  const workouts = getMockWorkouts();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const activeWorkout = workouts[activeTab] || workouts[0];

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Mi Rutina</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Sigue tu plan de entrenamiento diario</p>
        </div>
      </div>

      {/* Selector de Días (Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {workouts.map((w, index) => (
          <button
            key={w.id}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === index
                ? "bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-md shadow-[var(--primary-color)]/10"
                : "bg-[var(--surface-color)]/40 text-[var(--text-color)] opacity-70 border-[var(--surface-color)]/50 hover:opacity-100"
            }`}
          >
            {w.day.split(" / ")[0]}
          </button>
        ))}
      </div>

      {/* Info de la Rutina Seleccionada */}
      <div className="p-4 rounded-xl bg-[var(--surface-color)]/25 border border-[var(--surface-color)]/40 flex items-start gap-3">
        <Clipboard className="w-5 h-5 text-[var(--primary-color)] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm text-[var(--text-color)]">{activeWorkout.name}</h3>
          <p className="text-xs text-[var(--text-color)] opacity-50 mt-0.5">Días: {activeWorkout.day}</p>
        </div>
      </div>

      {/* Lista de Ejercicios */}
      <div className="flex flex-col gap-2.5">
        {activeWorkout.exercises.map((exercise, index) => {
          const isDone = completedExercises[exercise.id] || false;
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
              <div className="flex items-start gap-3.5 text-left">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold text-xs shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isDone ? 'line-through opacity-50' : ''}`}>
                    {exercise.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-color)] opacity-60 mt-1">
                    <span>{exercise.series} Series</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-color)] opacity-30"></span>
                    <span>{exercise.reps} Reps</span>
                    {exercise.weight && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-color)] opacity-30"></span>
                        <span className="font-semibold text-[var(--primary-color)]">{exercise.weight}</span>
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

              {/* Botón de Check */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-black"
                    : "border-[var(--surface-color)] text-transparent"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
