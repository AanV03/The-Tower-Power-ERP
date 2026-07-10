"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getMockTeams, getMockLeaderboard, MockTeam, LeaderboardUser } from "@/lib/mockServices";
import { ArrowLeft, Users, Trophy, Flame, Plus, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function TeamsPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";
  
  const [teams, setTeams] = useState<MockTeam[]>(getMockTeams());
  const [joinedTeams, setJoinedTeams] = useState<Record<string, boolean>>({});
  const leaderboard = getMockLeaderboard();
  const [activeSubTab, setActiveSubTab] = useState<"groups" | "leaderboard">("groups");

  const handleJoinTeam = (teamId: string) => {
    const isJoined = joinedTeams[teamId];
    
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            membersCount: isJoined ? t.membersCount - 1 : t.membersCount + 1
          };
        }
        return t;
      })
    );

    setJoinedTeams(prev => ({
      ...prev,
      [teamId]: !isJoined
    }));

    if (!isJoined) {
      toast.success("¡Te has unido al equipo!");
    } else {
      toast.info("Has salido del equipo.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Comunidad & Teams</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Entrena en grupo y compite con amigos</p>
        </div>
      </div>

      {/* Selector de sub-pestañas */}
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
          Clasificación (XP)
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeSubTab === "groups" ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">Equipos recomendados</span>
            <button 
              onClick={() => toast.info("Creación de equipos deshabilitada en modo demo.")}
              className="flex items-center gap-1 text-xs font-bold text-[var(--primary-color)] hover:underline"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo
            </button>
          </div>

          {teams.map(team => {
            const isJoined = joinedTeams[team.id] || false;
            return (
              <div 
                key={team.id}
                className={`p-4 rounded-xl border transition-all ${
                  isJoined 
                    ? "bg-emerald-500/5 border-emerald-500/30" 
                    : "bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-color)]">{team.name}</h3>
                    <p className="text-[11px] text-[var(--text-color)] opacity-50 mt-0.5">{team.description}</p>
                  </div>
                  {isJoined && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Miembro
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--surface-color)]/40 text-[var(--text-color)] opacity-70">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[var(--primary-color)]" />
                      {team.membersCount} Socios
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[var(--primary-color)]">
                      {team.monthlyXP} XP mensual
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      isJoined
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "bg-[var(--primary-color)] text-black"
                    }`}
                  >
                    {isJoined ? "Salir" : "Unirse"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="px-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50">Ranking del Gimnasio</span>
          </div>

          <div className="flex flex-col gap-2 bg-[var(--surface-color)]/20 p-2.5 rounded-xl border border-[var(--surface-color)]/30">
            {leaderboard.map(user => {
              const isMe = user.name.includes("Tú");
              return (
                <div 
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isMe 
                      ? "bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25" 
                      : "hover:bg-[var(--surface-color)]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Number / Icon */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {user.rank === 1 ? (
                        <Trophy className="w-5 h-5 text-amber-400" />
                      ) : user.rank === 2 ? (
                        <Trophy className="w-4 h-4 text-neutral-300" />
                      ) : (
                        <span className="text-xs font-bold opacity-60">#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar circular */}
                    <div className={`w-8 h-8 rounded-full bg-[var(--surface-color)] flex items-center justify-center text-xs font-bold border ${
                      isMe ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-neutral-700'
                    }`}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="text-left">
                      <p className={`text-sm font-semibold ${isMe ? 'text-[var(--primary-color)]' : ''}`}>{user.name}</p>
                      <p className="text-[10px] text-[var(--text-color)] opacity-50 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" /> Racha de {user.streak} días
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-[var(--text-color)]">{user.xp} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
