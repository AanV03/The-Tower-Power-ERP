"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CalendarClock, ClipboardCheck, FilePlus2, UserPlus } from "lucide-react";
import { toast } from "sonner";

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
    created: "Formulario registrado en el prototipo.",
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
    created: "Form registered in the prototype.",
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
    created: "Formulaire enregistre dans le prototype.",
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

function submitPrototype(event: FormEvent<HTMLFormElement>, message: string, close: () => void) {
  event.preventDefault();
  toast.success(message);
  close();
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
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);

  const defaultServicePrice = useMemo(() => services[0]?.price ?? "0", [services]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={labels.generate}>
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
          <form className="grid gap-4" onSubmit={(event) => submitPrototype(event, text.created, () => setSettlementOpen(false))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect required aria-label={text.specialist}>
                  <NativeSelectOption value="">{text.selectSpecialist}</NativeSelectOption>
                  {specialists.map((specialist) => (
                    <NativeSelectOption key={specialist.id} value={specialist.id}>
                      {specialist.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.status}>
                <NativeSelect required aria-label={text.status} defaultValue="DRAFT">
                  <NativeSelectOption value="DRAFT">Draft</NativeSelectOption>
                  <NativeSelectOption value="APPROVED">Approved</NativeSelectOption>
                  <NativeSelectOption value="PAID">Paid</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.periodStart}>
                <Input type="date" required />
              </Field>
              <Field label={text.periodEnd}>
                <Input type="date" required />
              </Field>
              <Field label={text.gross}>
                <Input type="number" min="0" step="0.01" placeholder="0.00" required />
              </Field>
              <Field label={text.rent}>
                <Input type="number" min="0" step="0.01" placeholder="0.00" />
              </Field>
              <Field label={text.commission}>
                <Input type="number" min="0" step="0.01" placeholder="0.00" />
              </Field>
              <Field label={text.net}>
                <Input type="number" min="0" step="0.01" placeholder="0.00" required />
              </Field>
            </div>
            <Field label={text.notes}>
              <Input placeholder="Revision de sesiones, ajustes y pagos pendientes" />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettlementOpen(false)}>
                {text.cancel}
              </Button>
              <Button type="submit">{text.submit}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
          <form className="grid gap-4" onSubmit={(event) => submitPrototype(event, text.created, () => setSessionOpen(false))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.specialist}>
                <NativeSelect required aria-label={text.specialist}>
                  <NativeSelectOption value="">{text.selectSpecialist}</NativeSelectOption>
                  {specialists.map((specialist) => (
                    <NativeSelectOption key={specialist.id} value={specialist.id}>
                      {specialist.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.service}>
                <NativeSelect required aria-label={text.service}>
                  <NativeSelectOption value="">{text.selectService}</NativeSelectOption>
                  {services.map((service) => (
                    <NativeSelectOption key={service.id} value={service.id}>
                      {service.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.member}>
                <Input placeholder="member_..." required />
              </Field>
              <Field label={text.branch}>
                <NativeSelect required aria-label={text.branch}>
                  <NativeSelectOption value="">{text.selectBranch}</NativeSelectOption>
                  {branches.map((branch) => (
                    <NativeSelectOption key={branch.id} value={branch.id}>
                      {branch.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.date}>
                <Input type="date" required />
              </Field>
              <Field label={text.time}>
                <Input type="time" required />
              </Field>
              <Field label={text.price}>
                <Input type="number" min="0" step="0.01" defaultValue={defaultServicePrice} required />
              </Field>
              <Field label={text.status}>
                <NativeSelect required aria-label={text.status} defaultValue="SCHEDULED">
                  <NativeSelectOption value="SCHEDULED">Scheduled</NativeSelectOption>
                  <NativeSelectOption value="COMPLETED">Completed</NativeSelectOption>
                  <NativeSelectOption value="CANCELLED">Cancelled</NativeSelectOption>
                  <NativeSelectOption value="NO_SHOW">No-show</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSessionOpen(false)}>
                {text.cancel}
              </Button>
              <Button type="submit">{text.submit}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
          <form className="grid gap-4" onSubmit={(event) => submitPrototype(event, text.created, () => setSpecialistOpen(false))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.name}>
                <Input placeholder="Dra. Ruiz" required />
              </Field>
              <Field label={text.specialty}>
                <Input placeholder="Nutricion deportiva" required />
              </Field>
              <Field label={text.type}>
                <NativeSelect required aria-label={text.type} defaultValue="EXTERNAL">
                  <NativeSelectOption value="INTERNAL">Internal</NativeSelectOption>
                  <NativeSelectOption value="EXTERNAL">External</NativeSelectOption>
                  <NativeSelectOption value="CLINIC">Clinic</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.branch}>
                <NativeSelect aria-label={text.branch}>
                  <NativeSelectOption value="">{text.selectBranch}</NativeSelectOption>
                  {branches.map((branch) => (
                    <NativeSelectOption key={branch.id} value={branch.id}>
                      {branch.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field label={text.model}>
                <NativeSelect required aria-label={text.model} defaultValue="COMMISSION">
                  <NativeSelectOption value="FIXED_RENT">Fixed rent</NativeSelectOption>
                  <NativeSelectOption value="COMMISSION">Commission</NativeSelectOption>
                  <NativeSelectOption value="HYBRID">Hybrid</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label={text.fixedRent}>
                <Input type="number" min="0" step="0.01" placeholder="0.00" />
              </Field>
              <Field label={text.commissionRate}>
                <Input type="number" min="0" max="100" step="0.01" placeholder="85" />
              </Field>
              <Field label={text.serviceName}>
                <Input placeholder="Consulta inicial" />
              </Field>
              <Field label={text.servicePrice}>
                <Input type="number" min="0" step="0.01" placeholder="650.00" />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSpecialistOpen(false)}>
                {text.cancel}
              </Button>
              <Button type="submit">{text.submit}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
