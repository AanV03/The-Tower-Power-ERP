import type { NavGroup, NavItem } from "@/data/navigation";
import type { TenantContext } from "@/lib/auth/rbac";

type NavigationPermissionItem = Pick<NavItem, "id">;
type NavigationPermissionGroup<TItem extends NavigationPermissionItem = NavItem> = Omit<
  NavGroup,
  "items"
> & {
  items: TItem[];
};

const GRANULAR_PERMISSION_LEVELS = new Set(["read", "write", "approve", "admin"]);

function splitPermission(permission: string) {
  const [prefix, level, ...rest] = permission.split(".");

  if (!prefix || !level || rest.length > 0 || !GRANULAR_PERMISSION_LEVELS.has(level)) {
    return null;
  }

  return { prefix, level };
}

export function hasClientPermission(context: TenantContext | null | undefined, permission: string) {
  if (!context) return false;
  if (context.permissions.includes(permission)) return true;

  const requested = splitPermission(permission);
  if (!requested) return false;

  return context.permissions.some((ownedPermission) => {
    const owned = splitPermission(ownedPermission);

    return owned?.prefix === requested.prefix && owned.level === "admin";
  });
}

function moduleKeyFromNavigationItem(item: NavigationPermissionItem) {
  return item.id.toUpperCase();
}

export function canReadNavigationItem(
  context: TenantContext | null | undefined,
  item: NavigationPermissionItem,
) {
  if (!context) return false;

  const moduleKey = moduleKeyFromNavigationItem(item);
  const readPermission = `${item.id}.read`;

  return context.modules.includes(moduleKey) && hasClientPermission(context, readPermission);
}

export function filterNavigationItemsByPermission<TItem extends NavigationPermissionItem>(
  items: TItem[],
  context: TenantContext | null | undefined,
) {
  return items.filter((item) => canReadNavigationItem(context, item));
}

export function filterNavigationGroupsByPermission<TItem extends NavigationPermissionItem>(
  groups: NavigationPermissionGroup<TItem>[],
  context: TenantContext | null | undefined,
) {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavigationItemsByPermission(group.items, context),
    }))
    .filter((group) => group.items.length > 0);
}
