"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Flame,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type {
  PortalLeaderboardEntry,
  PortalTeam,
} from "@/lib/portal/types";

type TeamsClientProps = {
  available: boolean;
  initialTeams: PortalTeam[];
  initialLeaderboard: PortalLeaderboardEntry[];
  locale: string;
  tenantSlug: string;
};

type ErrorEnvelope = {
  message?: string;
};

export default function TeamsClient({
  available,
  initialTeams,
  initialLeaderboard,
  locale,
  tenantSlug,
}: TeamsClientProps) {
  const [teams, setTeams] = useState(initialTeams);
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    "groups" | "leaderboard"
  >("groups");

  async function handleJoinTeam(team: PortalTeam) {
    const nextJoined = !team.joined;
    setPendingTeamId(team.id);

    try {
      const response = await fetch(
        `/api/client/teams?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: team.id, joined: nextJoined }),
        },
      );
      const payload = (await response.json()) as ErrorEnvelope;
      if (!response.ok) {
        throw new Error(payload.message ?? "No fue posible actualizar el equipo.");
      }

      setTeams((current) =>
        current.map((item) =>
          item.id === team.id
            ? {
                ...item,
                joined: nextJoined,
                membersCount: Math.max(
                  0,
                  item.membersCount + (nextJoined ? 1 : -1),
                ),
              }
            : item,
        ),
      );
      if (nextJoined) {
        toast.success("Te has unido al equipo.");
      } else {
        toast.info("Has salido del equipo.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el equipo.",
      );
    } finally {
      setPendingTeamId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">
            Comunidad & Teams
          </h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Entrena en grupo y compite con amigos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 p-1 bg-[var(--surface-color)]/30 rounded-xl border border-[var(--surface-color)]/40">
        <button
          onClick={() => setActiveSubTab("groups")}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === "groups"
              ? "bg-[var(--primary-color)] text-black shadow"
              : "text-[var(--text-color)] opacity-70 hover:opacity-100"
          }`}
        >
          Equipos
        </button>
        <button
          onClick={() => setActiveSubTab("leaderboard")}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === "leaderboard"
              ? "bg-[var(--primary-color)] text-black shadow"
              : "text-[var(--text-color)] opacity-70 hover:opacity-100"
          }`}
        >
          Clasificacion (XP)
        </button>
      </div>

      {!available ? (
        <div className="p-6 rounded-xl bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 text-center">
          <Users className="w-7 h-7 text-[var(--primary-color)] mx-auto mb-2" />
          <p className="text-sm font-semibold">
            Comunidad temporalmente no disponible
          </p>
        </div>
      ) : activeSubTab === "groups" ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">
              Equipos disponibles
            </span>
          </div>
          {teams.length === 0 && (
            <p className="p-5 text-center text-sm opacity-60">
              Aun no hay equipos en este gimnasio.
            </p>
          )}
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 rounded-xl border transition-all ${
                team.joined
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[var(--text-color)]">
                    {team.name}
                  </h3>
                  <p className="text-[11px] text-[var(--text-color)] opacity-50 mt-0.5">
                    {team.description}
                  </p>
                </div>
                {team.joined && (
                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    <Check className="w-2.5 h-2.5" /> Miembro
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-col items-stretch gap-3 border-t border-[var(--surface-color)]/40 pt-3 text-xs text-[var(--text-color)] opacity-70 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[var(--primary-color)]" />
                    {team.membersCount} Socios
                  </span>
                  <span className="font-semibold text-[var(--primary-color)]">
                    {team.monthlyXP} XP mensual
                  </span>
                </div>
                <button
                  disabled={pendingTeamId === team.id}
                  onClick={() => handleJoinTeam(team)}
                  className={`w-full rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all sm:w-auto ${
                    team.joined
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-[var(--primary-color)] text-black"
                  } disabled:opacity-50`}
                >
                  {pendingTeamId === team.id
                    ? "Guardando..."
                    : team.joined
                      ? "Salir"
                      : "Unirse"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="px-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">
              Ranking del Gimnasio
            </span>
          </div>
          <div className="flex flex-col gap-2 bg-[var(--surface-color)]/20 p-2.5 rounded-xl border border-[var(--surface-color)]/30">
            {initialLeaderboard.length === 0 && (
              <p className="p-4 text-center text-sm opacity-60">
                No hay puntos registrados este mes.
              </p>
            )}
            {initialLeaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all ${
                  entry.isCurrentMember
                    ? "bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25"
                    : "hover:bg-[var(--surface-color)]/40"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {entry.rank <= 2 ? (
                      <Trophy className={`w-5 h-5 ${entry.rank === 1 ? "text-amber-400" : "text-neutral-300"}`} />
                    ) : (
                      <span className="text-xs font-bold opacity-60">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-[var(--surface-color)] flex items-center justify-center text-xs font-bold border ${
                    entry.isCurrentMember
                      ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                      : "border-neutral-700"
                  }`}>
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className={`truncate text-sm font-semibold ${entry.isCurrentMember ? "text-[var(--primary-color)]" : ""}`}>
                      {entry.isCurrentMember ? `${entry.name} (Tu)` : entry.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-color)] opacity-50 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Puntos del mes
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-black text-[var(--text-color)]">
                  {entry.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
