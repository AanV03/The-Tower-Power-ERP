"use client";

import { useMemo, useState, useEffect, type FormEvent, type ReactNode } from "react";
import { CalendarClock, ClipboardCheck, FilePlus2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Locale } from "@/lib/i18n";

type Option = {
  id: string;
  label: string;
};

type ServiceOption = Option & {
  specialistId: string;
  price: string;
};

type ActionLabels = {
  generate: string;
  registerSession: string;
  newSpecialist: string;
};

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
    gross: "Monto bruto",
    rent: "Renta",
    commission: "Comision",
    net: "Neto a pagar",
    notes: "Notas de revision",
    service: "Servicio",
    member: "ID de miembro",
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
    created: "Formulario registrado con éxito.",
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
    gross: "Gross amount",
    rent: "Rent",
    commission: "Commission",
    net: "Net payout",
    notes: "Review notes",
    service: "Service",
    member: "Member ID",
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
    created: "Form registered successfully.",
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
    gross: "Montant brut",
    rent: "Loyer",
    commission: "Commission",
    net: "Paiement net",
    notes: "Notes de revision",
    service: "Service",
    member: "ID membre",
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
    created: "Formulaire enregistré avec succès.",
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

export function SpecialistActionDialogs({
  locale,
  labels,
  specialists,
  services,
  branches,
}: {
  locale: Locale;
  labels: ActionLabels;
  specialists: Option[];
  services: ServiceOption[];
  branches: Option[];
}) {
  const text = copy[locale] ?? copy.es;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [settlementOpen, setSettlementOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);

  // Specialist Intake fields
  const [specialistModel, setSpecialistModel] = useState("COMMISSION");

  // Session registration fields
  const [sessionSpecialistId, setSessionSpecialistId] = useState("");
  const [sessionServiceId, setSessionServiceId] = useState("");
  const [sessionPrice, setSessionPrice] = useState("0.00");

  const filteredServices = useMemo(() => {
    if (!sessionSpecialistId) return [];
    return services.filter((s) => s.specialistId === sessionSpecialistId);
  }, [services, sessionSpecialistId]);

  // Settlement auto-calc fields
  const [settleSpecialistId, setSettleSpecialistId] = useState("");
  const [settlePeriodStart, setSettlePeriodStart] = useState("");
  const [settlePeriodEnd, setSettlePeriodEnd] = useState("");
  const [gross, setGross] = useState("0.00");
  const [rent, setRent] = useState("0.00");
  const [commission, setCommission] = useState("0.00");
  const [net, setNet] = useState("0.00");
  const [calculating, setCalculating] = useState(false);

  // Auto-calculate payout numbers when inputs change
  useEffect(() => {
    if (!settleSpecialistId || !settlePeriodStart || !settlePeriodEnd) {
      return;
    }

    let active = true;
    async function calculate() {
      setCalculating(true);
      try {
        const res = await fetch(
          `/api/specialists/settlements?specialistId=${settleSpecialistId}&periodStart=${settlePeriodStart}&periodEnd=${settlePeriodEnd}`
        );
        const data = await res.json();
        if (active && res.ok && data.ok) {
          setGross(Number(data.data.grossAmount).toFixed(2));
          setRent(Number(data.data.rentAmount).toFixed(2));
          setCommission(Number(data.data.commissionAmount).toFixed(2));
          setNet(Number(data.data.netPayout).toFixed(2));
        }
      } catch (err) {
        console.error("Error auto-calculating payout", err);
      } finally {
        if (active) {
          setCalculating(false);
        }
      }
    }

    calculate();
    return () => {
      active = false;
    };
  }, [settleSpecialistId, settlePeriodStart, settlePeriodEnd]);

  // Submit handers
  async function handleCreateSpecialist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        name: formData.get("name") as string,
        specialty: formData.get("specialty") as string,
        type: formData.get("type") as string,
        branchId: (formData.get("branch") as string) || null,
        model: specialistModel,
        fixedRent: formData.get("fixedRent") ? Number(formData.get("fixedRent")) : undefined,
        commissionRate: formData.get("commissionRate") ? Number(formData.get("commissionRate")) : undefined,
        serviceName: (formData.get("serviceName") as string) || undefined,
        servicePrice: formData.get("servicePrice") ? Number(formData.get("servicePrice")) : undefined,
      };

      const response = await fetch("/api/specialists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al crear especialista");
      }

      toast.success(text.created);
      setSpecialistOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        specialistId: sessionSpecialistId,
        serviceId: sessionServiceId,
        memberId: formData.get("member") as string,
        branchId: formData.get("branch") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        price: Number(sessionPrice),
        status: formData.get("status") as string,
      };

      const response = await fetch("/api/specialists/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al registrar sesión");
      }

      toast.success(text.created);
      setSessionOpen(false);
      setSessionSpecialistId("");
      setSessionServiceId("");
      setSessionPrice("0.00");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSettlement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settleSpecialistId || !settlePeriodStart || !settlePeriodEnd) {
      toast.error("Por favor completa los campos de fechas y especialista");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        specialistId: settleSpecialistId,
        periodStart: settlePeriodStart,
        periodEnd: settlePeriodEnd,
        status: formData.get("status") as string,
        notes: (formData.get("notes") as string) || undefined,
      };

      const response = await fetch("/api/specialists/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al generar liquidación");
      }

      toast.success(text.created);
      setSettlementOpen(false);
      setSettleSpecialistId("");
      setSettlePeriodStart("");
      setSettlePeriodEnd("");
      setGross("0.00");
      setRent("0.00");
      setCommission("0.00");
      setNet("0.00");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={labels.generate}>
      {/* Generate Settlement Dialog */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogTrigger render={<Button aria-label={labels.generate} />}>
          <FilePlus2 className="size-4" aria-hidden="true" />
          {labels.generate}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{text.generateTitle}</DialogTitle>
            <DialogDescription>{text.generateDesc}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleCreateSettlement}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect
                  required
                  value={settleSpecialistId}
                  onChange={(e) => setSettleSpecialistId(e.target.value)}
                  aria-label={text.specialist}
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
                <NativeSelect required name="status" aria-label={text.status} defaultValue="DRAFT">
                  <NativeSelectOption value="DRAFT">Draft</NativeSelectOption>
                  <NativeSelectOption value="APPROVED">Approved</NativeSelectOption>
                  <NativeSelectOption value="PAID">Paid</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.periodStart}>
                <Input
                  type="date"
                  value={settlePeriodStart}
                  onChange={(e) => setSettlePeriodStart(e.target.value)}
                  required
                />
              </Field>
              <Field label={text.periodEnd}>
                <Input
                  type="date"
                  value={settlePeriodEnd}
                  onChange={(e) => setSettlePeriodEnd(e.target.value)}
                  required
                />
              </Field>
              <Field label={text.gross}>
                <Input type="text" value={gross} readOnly className="bg-muted text-muted-foreground" />
              </Field>
              <Field label={text.rent}>
                <Input type="text" value={rent} readOnly className="bg-muted text-muted-foreground" />
              </Field>
              <Field label={text.commission}>
                <Input type="text" value={commission} readOnly className="bg-muted text-muted-foreground" />
              </Field>
              <Field label={text.net}>
                <Input
                  type="text"
                  value={calculating ? "Calculando..." : `$${net}`}
                  readOnly
                  className="bg-muted font-semibold text-emerald-600 dark:text-emerald-300"
                />
              </Field>
            </div>
            <Field label={text.notes}>
              <Input name="notes" placeholder="Revision de sesiones, ajustes y pagos pendientes" />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettlementOpen(false)} disabled={loading}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={loading || calculating}>
                {loading ? "Guardando..." : text.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Session Dialog */}
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogTrigger render={<Button variant="outline" aria-label={labels.registerSession} />}>
          <ClipboardCheck className="size-4" aria-hidden="true" />
          {labels.registerSession}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{text.sessionTitle}</DialogTitle>
            <DialogDescription>{text.sessionDesc}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleRegisterSession}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect
                  required
                  value={sessionSpecialistId}
                  onChange={(e) => {
                    setSessionSpecialistId(e.target.value);
                    setSessionServiceId("");
                    setSessionPrice("0.00");
                  }}
                  aria-label={text.specialist}
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
                <NativeSelect
                  required
                  value={sessionServiceId}
                  onChange={(e) => {
                    const serviceId = e.target.value;
                    setSessionServiceId(serviceId);
                    const service = services.find((s) => s.id === serviceId);
                    if (service) {
                      setSessionPrice(Number(service.price).toFixed(2));
                    }
                  }}
                  disabled={!sessionSpecialistId}
                  aria-label={text.service}
                >
                  <NativeSelectOption value="">{text.selectService}</NativeSelectOption>
                  {filteredServices.map((service) => (
                    <NativeSelectOption key={service.id} value={service.id}>
                      {service.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.member}>
                <Input name="member" placeholder="member_..." required />
              </Field>
              <Field label={text.branch}>
                <NativeSelect required name="branch" aria-label={text.branch}>
                  <NativeSelectOption value="">{text.selectBranch}</NativeSelectOption>
                  {branches.map((branch) => (
                    <NativeSelectOption key={branch.id} value={branch.id}>
                      {branch.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.date}>
                <Input name="date" type="date" required />
              </Field>
              <Field label={text.time}>
                <Input name="time" type="time" required />
              </Field>
              <Field label={text.price}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(e.target.value)}
                  required
                />
              </Field>
              <Field label={text.status}>
                <NativeSelect required name="status" aria-label={text.status} defaultValue="SCHEDULED">
                  <NativeSelectOption value="SCHEDULED">Scheduled</NativeSelectOption>
                  <NativeSelectOption value="COMPLETED">Completed</NativeSelectOption>
                  <NativeSelectOption value="CANCELLED">Cancelled</NativeSelectOption>
                  <NativeSelectOption value="NO_SHOW">No-show</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSessionOpen(false)} disabled={loading}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : text.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Specialist Dialog */}
      <Dialog open={specialistOpen} onOpenChange={setSpecialistOpen}>
        <DialogTrigger render={<Button variant="outline" aria-label={labels.newSpecialist} />}>
          <UserPlus className="size-4" aria-hidden="true" />
          {labels.newSpecialist}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{text.specialistTitle}</DialogTitle>
            <DialogDescription>{text.specialistDesc}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleCreateSpecialist}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.name}>
                <Input name="name" placeholder="Dra. Ruiz" required />
              </Field>
              <Field label={text.specialty}>
                <Input name="specialty" placeholder="Nutricion deportiva" required />
              </Field>
              <Field label={text.type}>
                <NativeSelect required name="type" aria-label={text.type} defaultValue="EXTERNAL">
                  <NativeSelectOption value="INTERNAL">Internal</NativeSelectOption>
                  <NativeSelectOption value="EXTERNAL">External</NativeSelectOption>
                  <NativeSelectOption value="CLINIC">Clinic</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.branch}>
                <NativeSelect name="branch" aria-label={text.branch}>
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
                  onChange={(e) => setSpecialistModel(e.target.value)}
                  aria-label={text.model}
                >
                  <NativeSelectOption value="FIXED_RENT">Fixed rent</NativeSelectOption>
                  <NativeSelectOption value="COMMISSION">Commission</NativeSelectOption>
                  <NativeSelectOption value="HYBRID">Hybrid</NativeSelectOption>
                </NativeSelect>
              </Field>
              {(specialistModel === "FIXED_RENT" || specialistModel === "HYBRID") && (
                <Field label={text.fixedRent}>
                  <Input name="fixedRent" type="number" min="0" step="0.01" placeholder="0.00" required />
                </Field>
              )}
              {(specialistModel === "COMMISSION" || specialistModel === "HYBRID") && (
                <Field label={text.commissionRate}>
                  <Input name="commissionRate" type="number" min="0" max="100" step="0.01" placeholder="85" required />
                </Field>
              )}
              <Field label={text.serviceName}>
                <Input name="serviceName" placeholder="Consulta inicial" />
              </Field>
              <Field label={text.servicePrice}>
                <Input name="servicePrice" type="number" min="0" step="0.01" placeholder="650.00" />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSpecialistOpen(false)} disabled={loading}>
                {text.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : text.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
