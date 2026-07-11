import type {
  AccountingLabels,
  AccountType,
  DisplayColumn,
  JournalEntryStatus,
  JournalEntryType,
  NormalBalance,
  SelectOption,
  StatusVisualConfig,
} from "./types";

export const accountingLabels: AccountingLabels = {
  searchPlaceholder: "Buscar cuenta o poliza...",
  registerEntry: "Registrar poliza",
  refresh: "Actualizar",
  export: "Exportar",
  validate: "Validar cuadre",
  editorTitle: "Editor de poliza",
  editorDescription: "Captura cargos y abonos con validacion formal de cuadre.",
  date: "Fecha",
  type: "Tipo",
  concept: "Concepto general",
  reference: "Referencia",
  debit: "Debe",
  credit: "Haber",
  difference: "Diferencia",
  balanced: "Cuadrada",
  unbalanced: "Descuadrada",
  addLine: "Agregar partida",
  saveDraft: "Guardar borrador",
  accountsTitle: "Catalogo de cuentas",
  accountsDescription: "Cuentas disponibles para integrar la poliza.",
  entriesTitle: "Polizas recientes",
  entriesDescription: "Actividad contable del periodo actual.",
  emptyAccountsTitle: "Sin cuentas configuradas",
  emptyAccountsDescription: "Configura el catalogo contable antes de registrar polizas.",
  emptyEntriesTitle: "Sin polizas recientes",
  emptyEntriesDescription: "Crea la primera poliza para iniciar el control contable.",
  errorTitle: "No se pudo cargar contabilidad",
  retry: "Reintentar",
};

export const accountTypeLabels: Record<AccountType, string> = {
  asset: "Activo",
  liability: "Pasivo",
  equity: "Capital",
  income: "Ingreso",
  expense: "Gasto",
};

export const normalBalanceLabels: Record<NormalBalance, string> = {
  debit: "Deudora",
  credit: "Acreedora",
};

export const journalEntryTypeOptions: SelectOption<JournalEntryType>[] = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Egreso" },
  { value: "daily", label: "Diario" },
  { value: "adjustment", label: "Ajuste" },
];

export const journalEntryStatusConfig: Record<JournalEntryStatus, StatusVisualConfig> = {
  draft: { label: "Borrador", className: "border-border text-muted-foreground" },
  balanced: { label: "Cuadrada", className: "bg-emerald-500/15 text-emerald-600" },
  posted: { label: "Registrada", className: "bg-primary/15 text-primary" },
  void: { label: "Cancelada", className: "bg-destructive/15 text-destructive" },
};

export const journalLineColumns: DisplayColumn[] = [
  { id: "account", label: "Cuenta" },
  { id: "description", label: "Descripcion" },
  { id: "debit", label: "Debe", align: "right" },
  { id: "credit", label: "Haber", align: "right" },
];

export const accountPanelColumns: DisplayColumn[] = [
  { id: "code", label: "Codigo" },
  { id: "name", label: "Cuenta" },
  { id: "normalBalance", label: "Naturaleza" },
  { id: "status", label: "Estado" },
];
