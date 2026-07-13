import type { HrEmployeeRow } from "@/components/modules/hr/employee-table";

export type HrSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export type EmployeeTableColumn = {
  key: keyof Pick<
    HrEmployeeRow,
    "name" | "phone" | "position" | "branch" | "contract" | "status" | "lastAttendance"
  >;
  label: string;
  className?: string;
};

export const HR_POSITION_OPTIONS: HrSelectOption[] = [
  { value: "Recepcionista", label: "Recepcionista", description: "Atencion al socio y control de acceso" },
  { value: "Entrenador de piso", label: "Entrenador de piso", description: "Operacion de sala y rutinas" },
  { value: "Coach funcional", label: "Coach funcional", description: "Clases grupales y seguimiento" },
  { value: "Nutriologo", label: "Nutriologo", description: "Planes y valoraciones" },
  { value: "Ventas y membresias", label: "Ventas y membresias", description: "Conversion y renovaciones" },
  { value: "Limpieza", label: "Limpieza", description: "Higiene y mantenimiento operativo" },
  { value: "Gerente de sucursal", label: "Gerente de sucursal", description: "Operacion, caja y personal" },
  { value: "Administracion", label: "Administracion", description: "Back office y soporte" },
];

export const EMPLOYEE_TABLE_COLUMNS: EmployeeTableColumn[] = [
  { key: "name", label: "Empleado" },
  { key: "phone", label: "Telefono" },
  { key: "position", label: "Puesto" },
  { key: "branch", label: "Sucursal" },
  { key: "contract", label: "Contrato" },
  { key: "status", label: "Estado" },
  { key: "lastAttendance", label: "Ultimo registro" },
];

export const EMPLOYEE_FORM_COPY = {
  createTitle: "Alta de empleado",
  editTitle: "Editar empleado",
  description: "Captura la informacion operativa del colaborador.",
  submitCreate: "Crear empleado",
  submitEdit: "Guardar cambios",
  submitting: "Guardando...",
  cancel: "Cancelar",
  phoneFallback: "Sin telefono",
  positionFallback: "Sin puesto",
};
