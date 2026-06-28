"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare, CheckCircle2, Clock, Dumbbell } from "lucide-react";

type ChurnRisk = "high" | "medium" | "low";

type MemberAtRisk = {
  id: string;
  name: string;
  plan: string;
  lastVisit: string;
  daysInactive: number;
  churnScore: number;
  risk: ChurnRisk;
  contacted: boolean;
};

const MEMBERS_AT_RISK: MemberAtRisk[] = [
  {
    id: "1",
    name: "Carlos Mendoza",
    plan: "Anual Élite",
    lastVisit: "hace 28 días",
    daysInactive: 28,
    churnScore: 91,
    risk: "high",
    contacted: false,
  },
  {
    id: "2",
    name: "Sofía Ramírez",
    plan: "Mensual Básico",
    lastVisit: "hace 21 días",
    daysInactive: 21,
    churnScore: 74,
    risk: "high",
    contacted: false,
  },
  {
    id: "3",
    name: "Andrés Torres",
    plan: "Trimestral Pro",
    lastVisit: "hace 14 días",
    daysInactive: 14,
    churnScore: 58,
    risk: "medium",
    contacted: false,
  },
  {
    id: "4",
    name: "Valeria Núñez",
    plan: "Mensual Plus",
    lastVisit: "hace 10 días",
    daysInactive: 10,
    churnScore: 42,
    risk: "medium",
    contacted: false,
  },
  {
    id: "5",
    name: "Miguel Ángel Ruiz",
    plan: "Semestral Gold",
    lastVisit: "hace 7 días",
    daysInactive: 7,
    churnScore: 25,
    risk: "low",
    contacted: false,
  },
];

const riskConfig: Record<ChurnRisk, { label: string; color: string; badge: string; scoreColor: string }> = {
  high: {
    label: "Alto riesgo",
    color: "border-l-red-500",
    badge: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    scoreColor: "text-red-500",
  },
  medium: {
    label: "Riesgo medio",
    color: "border-l-amber-500",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    scoreColor: "text-amber-500",
  },
  low: {
    label: "Riesgo bajo",
    color: "border-l-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    scoreColor: "text-emerald-500",
  },
};

export function ChurnInterventionsPanel() {
  const [members, setMembers] = useState<MemberAtRisk[]>(MEMBERS_AT_RISK);

  const handleSendMessage = (member: MemberAtRisk) => {
    toast.success(`Mensaje de retención enviado a ${member.name}.`);
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, contacted: true } : m))
    );
  };

  const handleMarkContacted = (member: MemberAtRisk) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, contacted: true } : m))
    );
    toast.success(`${member.name} marcado como contactado.`);
  };

  const highRiskCount = members.filter((m) => m.risk === "high").length;
  const contactedCount = members.filter((m) => m.contacted).length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            Churn e Intervenciones
          </CardTitle>
          <CardDescription>
            Miembros en riesgo de abandono — actúa ahora para retenerlos.
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 text-xs">
            {highRiskCount} críticos
          </Badge>
          <span className="text-[10px] text-muted-foreground">{contactedCount}/{members.length} contactados</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {members.map((member) => {
          const config = riskConfig[member.risk];
          return (
            <div
              key={member.id}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border border-l-4 ${config.color} bg-card/50 hover:bg-card transition-all duration-200 ${member.contacted ? "opacity-60" : ""}`}
            >
              {/* Left side: member info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-muted/60 shrink-0">
                  <Dumbbell className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-foreground truncate">{member.name}</p>
                    {member.contacted && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0 h-4">
                        <CheckCircle2 className="size-2.5 mr-1" />
                        Contactado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{member.plan}</span>
                    <span className="text-[10px] text-muted-foreground/60">•</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {member.lastVisit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: score + actions */}
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-center">
                  <p className={`text-base font-extrabold tabular-nums ${config.scoreColor}`}>
                    {member.churnScore}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                </div>

                <Badge variant="outline" className={`text-[10px] hidden sm:flex ${config.badge}`}>
                  {config.label}
                </Badge>

                <div className="flex gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleSendMessage(member)}
                    disabled={member.contacted}
                    className="h-7 text-xs gap-1 hover:border-primary hover:text-primary"
                  >
                    <MessageSquare className="size-3" />
                    <span className="hidden sm:inline">Enviar</span>
                  </Button>
                  {!member.contacted && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleMarkContacted(member)}
                      className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="size-3" />
                      <span className="hidden sm:inline">Contactado</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress bar summary */}
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso de intervenciones</span>
            <span className="font-semibold text-foreground">{contactedCount}/{members.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(contactedCount / members.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
