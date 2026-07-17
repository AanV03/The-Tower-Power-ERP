import { InviteAcceptForm } from "@/components/auth/invite-accept-form";

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2 p-6 rounded-2xl border bg-card max-w-sm">
          <p className="text-destructive font-semibold text-lg">Invitación Inválida</p>
          <p className="text-muted-foreground text-sm">El enlace de invitación no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return <InviteAcceptForm token={token} locale="es" />;
}
