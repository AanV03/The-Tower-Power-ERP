"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, FilePlus2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  StandardDialogContent,
  StandardDialogDescription,
  StandardDialogFooter,
  StandardDialogHeader,
  StandardDialogTitle,
} from "@/components/shared/standard-dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Locale } from "@/lib/i18n";
import { headerPrimaryActionClass } from "@/lib/utils";

type Option = {
  id: string;
  label: string;
};

type ServiceOption = Option & {
  specialistId: string;
  price: string;
};

type MemberOption = Option & {
  branchId: string;
};

type ActionLabels = {
  generate: string;
  registerSession: string;
  newSpecialist: string;
};

type SpecialistModel = "FIXED_RENT" | "COMMISSION" | "HYBRID";

const copy = {
  es: {
    generateTitle: "Generar liquidacion",
    generateDesc:
      "Prepara el cierre del periodo calculando bruto, renta, comision y neto antes de aprobar el pago.",
    sessionTitle: "Registrar sesion",
    sessionDesc:
      "Registrar sesion sirve para capturar una cita o servicio de especialista a un miembro. Esa sesion alimenta comisiones, agenda y liquidaciones.",
    specialistTitle: "Nuevo especialista",
    specialistDesc:
      "Alta rapida para especialista interno, externo o clinica, con modelo comercial y primer servicio.",
    specialist: "Especialista",
    periodStart: "Inicio del periodo",
    periodEnd: "Fin del periodo",
    notes: "Notas de revision",
    service: "Servicio",
    member: "Miembro",
    memberOptional: "Miembro (opcional)",
    selectMember: "Selecciona miembro",
    walkInMember: "Cliente General / Walk-in",
    branch: "Sucursal",
    date: "Fecha",
    time: "Hora",
    price: "Precio",
    status: "Estado",
    name: "Nombre",
    specialty: "Especialidad",
    type: "Tipo",
    model: "Modelo",
    fixedRent: "Renta fija",
    commissionRate: "Comision %",
    serviceName: "Primer servicio",
    servicePrice: "Precio del servicio",
    submit: "Guardar",
    cancel: "Cancelar",
    selectSpecialist: "Selecciona especialista",
    selectService: "Selecciona servicio",
    selectBranch: "Selecciona sucursal",
  },
  en: {
    generateTitle: "Generate settlement",
    generateDesc:
      "Prepares the period close by calculating gross, rent, commission, and net payout before approval.",
    sessionTitle: "Register session",
    sessionDesc:
      "Registering a session captures a specialist appointment or service for a member. That session feeds commissions, agenda, and settlements.",
    specialistTitle: "New specialist",
    specialistDesc:
      "Quick intake for an internal specialist, external partner, or clinic with a commercial model and first service.",
    specialist: "Specialist",
    periodStart: "Period start",
    periodEnd: "Period end",
    notes: "Review notes",
    service: "Service",
    member: "Member",
    memberOptional: "Member (optional)",
    selectMember: "Select member",
    walkInMember: "General client / Walk-in",
    branch: "Branch",
    date: "Date",
    time: "Time",
    price: "Price",
    status: "Status",
    name: "Name",
    specialty: "Specialty",
    type: "Type",
    model: "Model",
    fixedRent: "Fixed rent",
    commissionRate: "Commission %",
    serviceName: "First service",
    servicePrice: "Service price",
    submit: "Save",
    cancel: "Cancel",
    selectSpecialist: "Select specialist",
    selectService: "Select service",
    selectBranch: "Select branch",
  },
  fr: {
    generateTitle: "Generer reglement",
    generateDesc:
      "Prepare la cloture de periode avec brut, loyer, commission et paiement net avant approbation.",
    sessionTitle: "Enregistrer seance",
    sessionDesc:
      "Enregistrer une seance capture un rendez-vous ou service de specialiste pour un membre. Cette seance alimente commissions, agenda et reglements.",
    specialistTitle: "Nouveau specialiste",
    specialistDesc:
      "Creation rapide pour specialiste interne, partenaire externe ou clinique avec modele commercial et premier service.",
    specialist: "Specialiste",
    periodStart: "Debut periode",
    periodEnd: "Fin periode",
    notes: "Notes de revision",
    service: "Service",
    member: "Membre",
    memberOptional: "Membre (optionnel)",
    selectMember: "Selectionner membre",
    walkInMember: "Client general / Walk-in",
    branch: "Succursale",
    date: "Date",
    time: "Heure",
    price: "Prix",
    status: "Statut",
    name: "Nom",
    specialty: "Specialite",
    type: "Type",
    model: "Modele",
    fixedRent: "Loyer fixe",
    commissionRate: "Commission %",
    serviceName: "Premier service",
    servicePrice: "Prix du service",
    submit: "Enregistrer",
    cancel: "Annuler",
    selectSpecialist: "Selectionner specialiste",
    selectService: "Selectionner service",
    selectBranch: "Selectionner succursale",
  },
} satisfies Record<Locale, Record<string, string>>;

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function timeInputValue(date = new Date()) {
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function monthStartInputValue() {
  const date = new Date();
  date.setDate(1);
  return dateInputValue(date);
}

function monthEndInputValue() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  return dateInputValue(date);
}

function dateTimeToIso(dateValue: string, timeValue: string) {
  if (!dateValue) return "";
  return new Date(`${dateValue}T${timeValue || "00:00"}`).toISOString();
}

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    const issue = Array.isArray(result?.issues) ? result.issues[0]?.message : undefined;
    throw new Error(issue ?? result?.message ?? "No se pudo completar la operacion.");
  }

  return result.data;
}

export function SpecialistActionDialogs({
  locale,
  labels,
  specialists,
  services,
  members,
  branches,
}: {
  locale: Locale;
  labels: ActionLabels;
  specialists: Option[];
  services: ServiceOption[];
  members: MemberOption[];
  branches: Option[];
}) {
  const router = useRouter();
  const text = copy[locale] ?? copy.es;
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);
  const [submitting, setSubmitting] = useState<"settlement" | "session" | "specialist" | null>(null);
  const [specialistModel, setSpecialistModel] = useState<SpecialistModel>("COMMISSION");
  const [sessionSpecialistId, setSessionSpecialistId] = useState("");
  const [sessionServiceId, setSessionServiceId] = useState("");
  const [sessionPrice, setSessionPrice] = useState("0.00");
  const [sessionBranchId, setSessionBranchId] = useState(branches[0]?.id ?? "");
  const [settleSpecialistId, setSettleSpecialistId] = useState("");
  const [settlePeriodStart, setSettlePeriodStart] = useState(() => monthStartInputValue());
  const [settlePeriodEnd, setSettlePeriodEnd] = useState(() => monthEndInputValue());

  const filteredServices = useMemo(() => {
    if (!sessionSpecialistId) return [];
    return services.filter((service) => service.specialistId === sessionSpecialistId);
  }, [services, sessionSpecialistId]);
  const hasSessionServices = filteredServices.length > 0;

  const filteredMembers = useMemo(() => {
    if (!sessionBranchId) return members;
    return members.filter((member) => member.branchId === sessionBranchId);
  }, [members, sessionBranchId]);

  async function handleSettlementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settleSpecialistId || !settlePeriodStart || !settlePeriodEnd) {
      toast.error("Completa especialista e intervalo de fechas.");
      return;
    }

    setSubmitting("settlement");
    try {
      const formData = new FormData(event.currentTarget);
      await postJson("/api/specialists/settlements", {
        specialistId: settleSpecialistId,
        periodStart: settlePeriodStart,
        periodEnd: settlePeriodEnd,
        status: formData.get("status"),
      });
      toast.success("Liquidacion generada correctamente.");
      setSettlementOpen(false);
      setSettleSpecialistId("");
      setSettlePeriodStart(monthStartInputValue());
      setSettlePeriodEnd(monthEndInputValue());
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar la liquidacion.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSessionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting("session");
    try {
      const formData = new FormData(event.currentTarget);
      const branchId = String(formData.get("branchId") ?? "").trim();
      const dateValue = String(formData.get("date") ?? "").trim();
      const timeValue = String(formData.get("time") ?? "").trim();

      if (!sessionSpecialistId || !branchId || !dateValue || !timeValue) {
        toast.error("Completa especialista, sucursal, fecha y hora.");
        return;
      }

      await postJson("/api/specialists/sessions", {
        specialistId: sessionSpecialistId,
        serviceId: sessionServiceId || undefined,
        serviceName: formData.get("serviceName") || undefined,
        memberId: String(formData.get("memberId") ?? "").trim() || undefined,
        branchId,
        scheduledDate: dateValue,
        scheduledTime: timeValue,
        scheduledAt: dateTimeToIso(dateValue, timeValue),
        price: sessionPrice,
        status: formData.get("status"),
      });
      toast.success("Sesion registrada correctamente.");
      setSessionOpen(false);
      setSessionSpecialistId("");
      setSessionServiceId("");
      setSessionPrice("0.00");
      setSessionBranchId(branches[0]?.id ?? "");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la sesion.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSpecialistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSubmitting("specialist");
    try {
      await postJson("/api/specialists", {
        name: formData.get("name"),
        specialty: formData.get("specialty"),
        type: formData.get("type"),
        branchId: formData.get("branchId") || null,
        contractModel: specialistModel,
        fixedRentAmount: formData.get("fixedRentAmount") || undefined,
        commissionRate: formData.get("commissionRate") || undefined,
        serviceName: formData.get("serviceName") || undefined,
        servicePrice: formData.get("servicePrice") || undefined,
      });
      toast.success("Especialista creado correctamente.");
      setSpecialistOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el especialista.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={labels.generate}>
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogTrigger render={<Button aria-label={labels.generate} className={headerPrimaryActionClass} />}>
          <FilePlus2 className="size-4" aria-hidden="true" />
          {labels.generate}
        </DialogTrigger>
        <StandardDialogContent className="max-h-[90vh] overflow-y-auto">
          <StandardDialogHeader>
            <StandardDialogTitle>{text.generateTitle}</StandardDialogTitle>
            <StandardDialogDescription>{text.generateDesc}</StandardDialogDescription>
          </StandardDialogHeader>
          <form className="grid gap-4" onSubmit={handleSettlementSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect
                  required
                  value={settleSpecialistId}
                  onChange={(event) => setSettleSpecialistId(event.target.value)}
                  aria-label={text.specialist}
                  disabled={submitting === "settlement"}
                >
                  <NativeSelectOption value="">{text.selectSpecialist}</NativeSelectOption>
                  {specialists.map((specialist) => (
                    <NativeSelectOption key={specialist.id} value={specialist.id}>
                      {specialist.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.status}>
                <NativeSelect name="status" required aria-label={text.status} defaultValue="DRAFT" disabled={submitting === "settlement"}>
                  <NativeSelectOption value="DRAFT">Draft</NativeSelectOption>
                  <NativeSelectOption value="APPROVED">Approved</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.periodStart}>
                <Input
                  type="date"
                  value={settlePeriodStart}
                  onChange={(event) => setSettlePeriodStart(event.target.value)}
                  required
                  disabled={submitting === "settlement"}
                />
              </Field>
              <Field label={text.periodEnd}>
                <Input
                  type="date"
                  value={settlePeriodEnd}
                  onChange={(event) => setSettlePeriodEnd(event.target.value)}
                  required
                  disabled={submitting === "settlement"}
                />
              </Field>
            </div>
            <Field label={text.notes}>
              <Input name="notes" placeholder="Revision de sesiones, ajustes y pagos pendientes" disabled={submitting === "settlement"} />
            </Field>
            <StandardDialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettlementOpen(false)} disabled={submitting === "settlement"}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={submitting === "settlement"}>
                {submitting === "settlement" ? "Calculando..." : text.submit}
              </Button>
            </StandardDialogFooter>
          </form>
        </StandardDialogContent>
      </Dialog>

      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogTrigger render={<Button variant="outline" aria-label={labels.registerSession} />}>
          <ClipboardCheck className="size-4" aria-hidden="true" />
          {labels.registerSession}
        </DialogTrigger>
        <StandardDialogContent className="max-h-[90vh] overflow-y-auto">
          <StandardDialogHeader>
            <StandardDialogTitle>{text.sessionTitle}</StandardDialogTitle>
            <StandardDialogDescription>{text.sessionDesc}</StandardDialogDescription>
          </StandardDialogHeader>
          <form className="grid gap-4" onSubmit={handleSessionSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect
                  required
                  value={sessionSpecialistId}
                  onChange={(event) => {
                    const specialistId = event.target.value;
                    const firstService = services.find((service) => service.specialistId === specialistId);
                    setSessionSpecialistId(specialistId);
                    setSessionServiceId(firstService?.id ?? "");
                    setSessionPrice(firstService ? Number(firstService.price).toFixed(2) : "650.00");
                  }}
                  aria-label={text.specialist}
                  disabled={submitting === "session"}
                >
                  <NativeSelectOption value="">{text.selectSpecialist}</NativeSelectOption>
                  {specialists.map((specialist) => (
                    <NativeSelectOption key={specialist.id} value={specialist.id}>
                      {specialist.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.service}>
                {hasSessionServices ? (
                  <NativeSelect
                    required
                    value={sessionServiceId}
                    onChange={(event) => {
                      const serviceId = event.target.value;
                      setSessionServiceId(serviceId);
                      const service = services.find((item) => item.id === serviceId);
                      if (service) setSessionPrice(Number(service.price).toFixed(2));
                    }}
                    disabled={!sessionSpecialistId || submitting === "session"}
                    aria-label={text.service}
                  >
                    <NativeSelectOption value="">{text.selectService}</NativeSelectOption>
                    {filteredServices.map((service) => (
                      <NativeSelectOption key={service.id} value={service.id}>
                        {service.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                ) : (
                  <Input
                    name="serviceName"
                    defaultValue="Consulta General"
                    required
                    disabled={!sessionSpecialistId || submitting === "session"}
                    aria-label={text.service}
                  />
                )}
              </Field>
              <Field label={text.memberOptional}>
                <NativeSelect name="memberId" aria-label={text.memberOptional} disabled={submitting === "session"}>
                  <NativeSelectOption value="">{text.walkInMember}</NativeSelectOption>
                  {filteredMembers.map((member) => (
                    <NativeSelectOption key={member.id} value={member.id}>
                      {member.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.branch}>
                <NativeSelect
                  name="branchId"
                  required
                  value={sessionBranchId}
                  onChange={(event) => setSessionBranchId(event.target.value)}
                  aria-label={text.branch}
                  disabled={submitting === "session"}
                >
                  <NativeSelectOption value="">{text.selectBranch}</NativeSelectOption>
                  {branches.map((branch) => (
                    <NativeSelectOption key={branch.id} value={branch.id}>
                      {branch.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.date}>
                <Input name="date" type="date" defaultValue={dateInputValue()} required disabled={submitting === "session"} />
              </Field>
              <Field label={text.time}>
                <Input name="time" type="time" defaultValue={timeInputValue()} required disabled={submitting === "session"} />
              </Field>
              <Field label={text.price}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sessionPrice}
                  onChange={(event) => setSessionPrice(event.target.value)}
                  required
                  disabled={submitting === "session"}
                />
              </Field>
              <Field label={text.status}>
                <NativeSelect name="status" required aria-label={text.status} defaultValue="COMPLETED" disabled={submitting === "session"}>
                  <NativeSelectOption value="SCHEDULED">Scheduled</NativeSelectOption>
                  <NativeSelectOption value="COMPLETED">Completed</NativeSelectOption>
                  <NativeSelectOption value="CANCELLED">Cancelled</NativeSelectOption>
                  <NativeSelectOption value="NO_SHOW">No-show</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <StandardDialogFooter>
              <Button type="button" variant="outline" onClick={() => setSessionOpen(false)} disabled={submitting === "session"}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={submitting === "session"}>
                {submitting === "session" ? "Guardando..." : text.submit}
              </Button>
            </StandardDialogFooter>
          </form>
        </StandardDialogContent>
      </Dialog>

      <Dialog open={specialistOpen} onOpenChange={setSpecialistOpen}>
        <DialogTrigger render={<Button variant="outline" aria-label={labels.newSpecialist} />}>
          <UserPlus className="size-4" aria-hidden="true" />
          {labels.newSpecialist}
        </DialogTrigger>
        <StandardDialogContent className="max-h-[90vh] overflow-y-auto">
          <StandardDialogHeader>
            <StandardDialogTitle>{text.specialistTitle}</StandardDialogTitle>
            <StandardDialogDescription>{text.specialistDesc}</StandardDialogDescription>
          </StandardDialogHeader>
          <form className="grid gap-4" onSubmit={handleSpecialistSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.name}>
                <Input name="name" placeholder="Dra. Ruiz" required disabled={submitting === "specialist"} />
              </Field>
              <Field label={text.specialty}>
                <Input name="specialty" placeholder="Nutricion deportiva" required disabled={submitting === "specialist"} />
              </Field>
              <Field label={text.type}>
                <NativeSelect name="type" required aria-label={text.type} defaultValue="EXTERNAL" disabled={submitting === "specialist"}>
                  <NativeSelectOption value="INTERNAL">Internal</NativeSelectOption>
                  <NativeSelectOption value="EXTERNAL">External</NativeSelectOption>
                  <NativeSelectOption value="CLINIC">Clinic</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.branch}>
                <NativeSelect name="branchId" aria-label={text.branch} disabled={submitting === "specialist"}>
                  <NativeSelectOption value="">{text.selectBranch}</NativeSelectOption>
                  {branches.map((branch) => (
                    <NativeSelectOption key={branch.id} value={branch.id}>
                      {branch.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.model}>
                <NativeSelect
                  required
                  value={specialistModel}
                  onChange={(event) => setSpecialistModel(event.target.value as SpecialistModel)}
                  aria-label={text.model}
                  disabled={submitting === "specialist"}
                >
                  <NativeSelectOption value="FIXED_RENT">Fixed rent</NativeSelectOption>
                  <NativeSelectOption value="COMMISSION">Commission</NativeSelectOption>
                  <NativeSelectOption value="HYBRID">Hybrid</NativeSelectOption>
                </NativeSelect>
              </Field>
              {(specialistModel === "FIXED_RENT" || specialistModel === "HYBRID") && (
                <Field label={text.fixedRent}>
                  <Input name="fixedRentAmount" type="number" min="0" step="0.01" placeholder="0.00" required disabled={submitting === "specialist"} />
                </Field>
              )}
              {(specialistModel === "COMMISSION" || specialistModel === "HYBRID") && (
                <Field label={text.commissionRate}>
                  <Input name="commissionRate" type="number" min="0" max="100" step="0.01" placeholder="85" required disabled={submitting === "specialist"} />
                </Field>
              )}
              <Field label={text.serviceName}>
                <Input name="serviceName" placeholder="Consulta inicial" disabled={submitting === "specialist"} />
              </Field>
              <Field label={text.servicePrice}>
                <Input name="servicePrice" type="number" min="0" step="0.01" placeholder="650.00" disabled={submitting === "specialist"} />
              </Field>
            </div>
            <StandardDialogFooter>
              <Button type="button" variant="outline" onClick={() => setSpecialistOpen(false)} disabled={submitting === "specialist"}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={submitting === "specialist"}>
                {submitting === "specialist" ? "Guardando..." : text.submit}
              </Button>
            </StandardDialogFooter>
          </form>
        </StandardDialogContent>
      </Dialog>
    </div>
  );
}
