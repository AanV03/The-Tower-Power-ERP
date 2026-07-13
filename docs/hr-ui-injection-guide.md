# HR UI Injection Guide

## Root Cause: Phone Visibility

The employee API and Prisma model already accept `phone`. The value was not visible because the HR page adapter did not map `employee.phone` into `HrEmployeeRow`, the employee table type did not include `phone`, and the edit dialog did not preload the phone field.

## Logic Injection Points

- `components/modules/hr/hr-client.tsx`
  - `// TODO: Conectar aqui con useHrDashboardData({ locale, branchId })...`
  - Replace `initialEmployees`, `initialAttendances`, `initialContracts`, `timeClockEmployees`, and `metrics` with hook data when the module becomes fully client-driven.
  - `// TODO: Conectar aqui con useHrPositionOptions()...`
  - Replace `HR_POSITION_OPTIONS` with API-provided job position options.

- `components/modules/hr/employee-form-dialog.tsx`
  - The existing submit logic is preserved: it posts or patches `/api/hr/employees` and calls `router.refresh()`.
  - If this becomes hook-based later, replace only the current `fetch(endpoint, ...)` block. Keep the payload shape: `firstName`, `lastName`, `email`, `phone`, `positionName`, `contractType`, `status`.

- `components/modules/hr/hr-config.ts`
  - Update `HR_POSITION_OPTIONS` and `EMPLOYEE_TABLE_COLUMNS` without changing component internals.

## UI State Table

| Element | Condition | Current Behavior |
| --- | --- | --- |
| Employees table | `filteredEmployees.length > 0` | Renders desktop table and mobile cards. |
| Empty employees state | `filteredEmployees.length === 0` | Shows dashed empty message. |
| Attendance panel | `filteredAttendances.length > 0` | Renders desktop panel and mobile cards. |
| Contracts table | `filteredContracts.length > 0` | Renders desktop summary and mobile cards. |
| Mobile pagination | `total*Pages > 1` | Shows previous/next controls. |
| Submit button | `isSubmitting === true` | Disables submit and displays saving copy. |
| Edit dialog | `editingEmployee !== null` | Opens controlled dialog with selected employee values. |
| Position dropdown | `positionOptions.length > 0` | Shows configured position catalog. |
