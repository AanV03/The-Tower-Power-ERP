"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Activity,
  Laptop,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Wifi,
  WifiOff,
  Database,
  Lock,
  Unlock,
  QrCode,
  Fingerprint,
  Smartphone,
  Search,
} from "lucide-react";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Device = {
  id: string;
  name: string;
  code: string;
  type: string; // "TURNSTILE" | "BIOMETRIC" | "QR_SCANNER"
  status: string; // "ONLINE" | "OFFLINE" | "MAINTENANCE"
  branchId: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type Branch = {
  id: string;
  name: string;
};

type AccessLog = {
  id: string;
  type: string;
  allowed: boolean;
  memberName: string;
  memberId: string;
  deviceName: string;
  deviceCode: string;
  planName: string | null;
  reason: string | null;
  timestamp: string;
};

const accessLabels = {
  es: {
    title: "Control de Acceso",
    subtitle: "Gestión de hardware de acceso físico y telemetrías de torniquetes por sucursal.",
    totalDevices: "Total de Dispositivos",
    devicesOnline: "Lectores Online",
    devicesOffline: "Lectores Offline",
    accessesToday: "Accesos Hoy",
    successRate: "Tasa de Éxito",
    simulatorTitle: "Simulador de Molinete",
    simulatorDesc: "Simula el escaneo de una credencial física o código QR en el dispositivo.",
    selectDevice: "Dispositivo de Escaneo",
    selectMember: "Miembro que Escanea",
    searchMemberPlaceholder: "Buscar miembro por nombre...",
    scanButton: "Simular Escaneo",
    scanning: "Escaneando...",
    accessGranted: "ACCESO AUTORIZADO",
    accessDenied: "ACCESO DENEGADO",
    ready: "DISPOSITIVO LISTO",
    registerDevice: "Registrar Dispositivo",
    registerDeviceDesc: "Añade un nuevo lector de accesos (torniquete, biométrico o escáner QR).",
    deviceName: "Nombre del Dispositivo",
    deviceCode: "Código (Identificador único)",
    deviceType: "Tipo de Dispositivo",
    branch: "Sucursal",
    status: "Estado",
    actions: "Acciones",
    online: "En línea",
    offline: "Fuera de línea",
    maintenance: "Mantenimiento",
    turnstile: "Molinete / Torniquete",
    biometric: "Lector Biométrico",
    qrScanner: "Escáner QR",
    save: "Guardar",
    cancel: "Cancelar",
    deleteConfirm: "¿Estás seguro de eliminar este dispositivo?",
    noDevices: "No hay dispositivos registrados.",
    noLogs: "No hay registros de acceso recientes.",
    deviceUpdated: "Dispositivo actualizado con éxito.",
    deviceCreated: "Dispositivo registrado con éxito.",
    deviceDeleted: "Dispositivo eliminado.",
    selectBranch: "Seleccionar Sucursal",
  },
  en: {
    title: "Access Control",
    subtitle: "Physical access hardware management and turnstile telemetries by branch.",
    totalDevices: "Total Devices",
    devicesOnline: "Online Readers",
    devicesOffline: "Offline Readers",
    accessesToday: "Accesses Today",
    successRate: "Success Rate",
    simulatorTitle: "Turnstile Simulator",
    simulatorDesc: "Simulate scanning a physical credential or QR code on the device.",
    selectDevice: "Scanning Device",
    selectMember: "Scanning Member",
    searchMemberPlaceholder: "Search member by name...",
    scanButton: "Simulate Scan",
    scanning: "Scanning...",
    accessGranted: "ACCESS GRANTED",
    accessDenied: "ACCESS DENIED",
    ready: "DEVICE READY",
    registerDevice: "Register Device",
    registerDeviceDesc: "Add a new access reader (turnstile, biometric, or QR scanner).",
    deviceName: "Device Name",
    deviceCode: "Code (Unique Identifier)",
    deviceType: "Device Type",
    branch: "Branch",
    status: "Status",
    actions: "Actions",
    online: "Online",
    offline: "Offline",
    maintenance: "Maintenance",
    turnstile: "Turnstile",
    biometric: "Biometric Reader",
    qrScanner: "QR Scanner",
    save: "Save",
    cancel: "Cancel",
    deleteConfirm: "Are you sure you want to delete this device?",
    noDevices: "No registered devices.",
    noLogs: "No recent access logs.",
    deviceUpdated: "Device updated successfully.",
    deviceCreated: "Device registered successfully.",
    deviceDeleted: "Device deleted.",
    selectBranch: "Select Branch",
  },
  fr: {
    title: "Contrôle d'Accès",
    subtitle: "Gestion du matériel d'accès physique et télémétries des molinets par succursale.",
    totalDevices: "Total des Dispositifs",
    devicesOnline: "Lecteurs En Ligne",
    devicesOffline: "Lecteurs Hors Ligne",
    accessesToday: "Accès Aujourd'hui",
    successRate: "Taux de Réussite",
    simulatorTitle: "Simulateur de Molinete",
    simulatorDesc: "Simuler le scan d'une carte physique ou code QR sur le dispositif.",
    selectDevice: "Dispositif de Scan",
    selectMember: "Membre qui Scanne",
    searchMemberPlaceholder: "Rechercher un membre par nom...",
    scanButton: "Simuler le Scan",
    scanning: "Scan en cours...",
    accessGranted: "ACCÈS AUTORISÉ",
    accessDenied: "ACCÈS REFUSÉ",
    ready: "DISPOSITIF PRÊT",
    registerDevice: "Enregistrer un Dispositif",
    registerDeviceDesc: "Ajouter un nouveau lecteur d'accès (molinete, biométrique ou scanner QR).",
    deviceName: "Nom du Dispositif",
    deviceCode: "Code (Identifiant Unique)",
    deviceType: "Type de Dispositif",
    branch: "Succursale",
    status: "Statut",
    actions: "Actions",
    online: "En Ligne",
    offline: "Hors Ligne",
    maintenance: "Maintenance",
    turnstile: "Molinete",
    biometric: "Lecteur Biométrique",
    qrScanner: "Scanner QR",
    save: "Sauvegarder",
    cancel: "Annuler",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce dispositif?",
    noDevices: "Aucun dispositif enregistré.",
    noLogs: "Aucun journal d'accès récent.",
    deviceUpdated: "Dispositif mis à jour avec succès.",
    deviceCreated: "Dispositif enregistré avec succès.",
    deviceDeleted: "Dispositif supprimé.",
    selectBranch: "Sélectionner la Succursale",
  }
};

const statusColors: Record<string, string> = {
  ONLINE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/5",
  OFFLINE: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/5",
  MAINTENANCE: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/5",
};

export function AccessClient({
  locale,
  devices: initialDevices,
  members,
  branches,
  recentLogs: initialRecentLogs,
}: {
  locale: Locale;
  devices: Device[];
  members: Member[];
  branches: Branch[];
  recentLogs: AccessLog[];
}) {
  const t = accessLabels[locale] ?? accessLabels.es;

  // Local state
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [localLogs, setLocalLogs] = useState<AccessLog[]>(initialRecentLogs);

  // Modals / Dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSavingDevice, setIsSavingDevice] = useState(false);
  const [newDeviceForm, setNewDeviceForm] = useState({
    name: "",
    code: "",
    type: "TURNSTILE",
    status: "ONLINE",
    branchId: branches[0]?.id ?? "",
  });

  // Simulator State
  const [simulatorDeviceCode, setSimulatorDeviceCode] = useState(devices[0]?.code ?? "");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SCANNING" | "ALLOWED" | "DENIED">("IDLE");
  const [scanResponse, setScanResponse] = useState<{
    allowed: boolean;
    memberName?: string;
    planName?: string | null;
    message?: string;
  } | null>(null);

  // Sync simulator select when devices load/change
  useEffect(() => {
    if (devices.length > 0 && !simulatorDeviceCode) {
      setSimulatorDeviceCode(devices[0].code);
    }
  }, [devices, simulatorDeviceCode]);

  // Handle outside click for member search results dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowMemberResults(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filtered members list based on query
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return [];
    return members.filter((m) =>
      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
    ).slice(0, 5);
  }, [members, memberSearchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === "ONLINE").length;
    const offline = total - online;

    // Accesos hoy (UTC-6 offset or simple calendar date comparison)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLogs = localLogs.filter((log) => log.timestamp.startsWith(todayStr));
    const totalAccesses = todayLogs.length;

    const allowedAccesses = todayLogs.filter((log) => log.allowed).length;
    const rate = totalAccesses > 0 ? Math.round((allowedAccesses / totalAccesses) * 100) : 100;

    return { total, online, offline, totalAccesses, rate };
  }, [devices, localLogs]);

  // Selected device helper for the simulator
  const activeSimulatorDevice = useMemo(() => {
    return devices.find((d) => d.code === simulatorDeviceCode) ?? null;
  }, [devices, simulatorDeviceCode]);

  // Create Device Handler
  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceForm.name || !newDeviceForm.code) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setIsSavingDevice(true);
    try {
      const res = await fetch("/api/access/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeviceForm),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al crear dispositivo");

      setDevices((prev) => [result.data, ...prev]);
      toast.success(t.deviceCreated);
      setShowAddModal(false);
      setNewDeviceForm({
        name: "",
        code: "",
        type: "TURNSTILE",
        status: "ONLINE",
        branchId: branches[0]?.id ?? "",
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingDevice(false);
    }
  };

  // Toggle Device Status Handler
  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/access/devices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al actualizar");

      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: result.data.status } : d))
      );
      toast.success(t.deviceUpdated);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete Device Handler
  const handleDeleteDevice = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const res = await fetch(`/api/access/devices/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al eliminar");

      setDevices((prev) => prev.filter((d) => d.id !== id));
      toast.success(t.deviceDeleted);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Run access scan simulator
  const handleSimulateScan = async () => {
    if (!selectedMember) {
      toast.error("Selecciona un miembro para simular.");
      return;
    }
    if (!simulatorDeviceCode) {
      toast.error("Selecciona un dispositivo para simular.");
      return;
    }

    setScanStatus("SCANNING");
    setScanResponse(null);

    try {
      const res = await fetch("/api/access/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          deviceCode: simulatorDeviceCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || result.message || "Error de telemetría.");
      }

      const isAllowed = result.data.allowed;
      setScanResponse(result.data);
      setScanStatus(isAllowed ? "ALLOWED" : "DENIED");

      // Build & prepend new event log client-side
      const newLog: AccessLog = {
        id: Math.random().toString(),
        type: isAllowed ? "member.access.allowed" : "member.access.denied",
        allowed: isAllowed,
        memberName: selectedMember.name,
        memberId: selectedMember.id,
        deviceName: activeSimulatorDevice?.name ?? "Dispositivo",
        deviceCode: simulatorDeviceCode,
        planName: result.data.planName ?? null,
        reason: result.data.reason ?? null,
        timestamp: new Date().toISOString(),
      };

      setLocalLogs((prev) => [newLog, ...prev]);

      // Highlight in toast
      if (isAllowed) {
        toast.success(`Acceso Autorizado: ${selectedMember.name}`);
      } else {
        toast.error(`Acceso Denegado: ${result.data.message || "Verificar estado"}`);
      }
    } catch (err: any) {
      setScanStatus("DENIED");
      setScanResponse({
        allowed: false,
        message: err.message || "Error de conexión con el lector.",
      });
      toast.error(err.message);
    } finally {
      // Auto-reset simulator back to IDLE after 4 seconds
      setTimeout(() => {
        setScanStatus("IDLE");
        setScanResponse(null);
      }, 4000);
    }
  };

  // Helper to format Date string
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(locale === "es" ? "es-MX" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "TURNSTILE":
        return <Lock className="size-4 text-primary" />;
      case "BIOMETRIC":
        return <Fingerprint className="size-4 text-violet-500" />;
      case "QR_SCANNER":
        return <QrCode className="size-4 text-orange-500" />;
      default:
        return <Smartphone className="size-4 text-slate-400" />;
    }
  };

  const getDeviceName = (type: string) => {
    switch (type) {
      case "TURNSTILE":
        return t.turnstile;
      case "BIOMETRIC":
        return t.biometric;
      case "QR_SCANNER":
        return t.qrScanner;
      default:
        return type;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 bg-background/30 flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="size-7 text-primary animate-pulse" />
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-semibold text-xs py-4 px-4 shadow-lg hover:shadow-primary/20 shrink-0 cursor-pointer"
        >
          <Plus className="size-4 mr-2" />
          {t.registerDevice}
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 select-none shrink-0">
        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.totalDevices}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t.devicesOnline}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.online}</p>
            <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              {stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% OK
            </Badge>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.accessesToday}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.totalAccesses}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">{t.successRate}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-foreground">{stats.rate}%</p>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
        {/* Left Section: Tabs of Devices & Logs */}
        <div className="lg:col-span-7 flex flex-col glass-panel rounded-xl border border-border overflow-hidden min-h-[450px]">
          <Tabs defaultValue="devices" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 pb-0 border-b border-border flex items-center justify-between shrink-0">
              <TabsList className="bg-muted/50 p-0.5 rounded-lg border">
                <TabsTrigger value="devices" className="text-xs font-semibold px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t.totalDevices} ({devices.length})
                </TabsTrigger>
                <TabsTrigger value="logs" className="text-xs font-semibold px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t.accessesToday} ({localLogs.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Devices Tab Content */}
            <TabsContent value="devices" className="flex-1 overflow-y-auto p-4 min-h-0">
              {devices.length === 0 ? (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3 select-none">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <WifiOff className="size-6" />
                  </div>
                  <p className="text-sm font-semibold">{t.noDevices}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3">{t.deviceName}</th>
                        <th className="pb-3">{t.deviceCode}</th>
                        <th className="pb-3">{t.deviceType}</th>
                        <th className="pb-3">{t.status}</th>
                        <th className="pb-3 text-right">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {devices.map((device) => (
                        <tr key={device.id} className="text-sm font-medium hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 pr-2 font-semibold text-foreground">{device.name}</td>
                          <td className="py-3.5 pr-2"><code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded font-mono text-muted-foreground">{device.code}</code></td>
                          <td className="py-3.5 pr-2 flex items-center gap-1.5 mt-2">
                            {getDeviceIcon(device.type)}
                            <span className="text-xs text-muted-foreground">{getDeviceName(device.type)}</span>
                          </td>
                          <td className="py-3.5 pr-2">
                            <select
                              value={device.status}
                              onChange={(e) => handleToggleStatus(device.id, e.target.value)}
                              className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded border outline-none cursor-pointer",
                                statusColors[device.status]
                              )}
                            >
                              <option value="ONLINE" className="text-foreground bg-background">{t.online}</option>
                              <option value="OFFLINE" className="text-foreground bg-background">{t.offline}</option>
                              <option value="MAINTENANCE" className="text-foreground bg-background">{t.maintenance}</option>
                            </select>
                          </td>
                          <td className="py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-destructive hover:bg-destructive/10 cursor-pointer"
                              onClick={() => handleDeleteDevice(device.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Live Logs Tab Content */}
            <TabsContent value="logs" className="flex-1 overflow-y-auto p-4 min-h-0">
              {localLogs.length === 0 ? (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3 select-none">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Database className="size-6" />
                  </div>
                  <p className="text-sm font-semibold">{t.noLogs}</p>
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {localLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200",
                        log.allowed
                          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.02]"
                          : "border-red-500/20 bg-red-500/5 dark:bg-red-500/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-8 rounded-full flex items-center justify-center text-xs font-bold select-none",
                          log.allowed
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-500/10 text-red-700 dark:text-red-300"
                        )}>
                          {log.memberName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{log.memberName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 select-none">
                            {getDeviceIcon(log.deviceCode.includes("QR") ? "QR_SCANNER" : log.deviceCode.includes("BIO") ? "BIOMETRIC" : "TURNSTILE")}
                            <span>{log.deviceName} ({log.deviceCode})</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 select-none">
                        <div className="text-right">
                          {log.allowed ? (
                            <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold text-[10px]">
                              {t.accessGranted}
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20 font-bold text-[10px]">
                              {t.accessDenied}
                            </Badge>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                            <Calendar className="size-3" />
                            {formatTime(log.timestamp)}
                          </p>
                        </div>

                        {!log.allowed && log.reason && (
                          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] select-none uppercase tracking-wider shrink-0 max-w-[120px] truncate">
                            {log.reason === "NO_ACTIVE_SUBSCRIPTION" ? "Sin Plan" : log.reason === "MEMBER_INACTIVE" ? "Inactivo" : log.reason}
                          </Badge>
                        )}
                        {log.allowed && log.planName && (
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px] select-none shrink-0 max-w-[120px] truncate">
                            {log.planName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Section: Hardware simulator console */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="glass-panel p-5 rounded-xl border border-border flex flex-col h-full min-h-[450px]">
            <div className="flex items-center gap-2 pb-3 border-b shrink-0">
              <Laptop className="size-5 text-[var(--brand-orange)]" />
              <h2 className="text-base font-bold text-foreground">{t.simulatorTitle}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-2 shrink-0">{t.simulatorDesc}</p>

            {/* Virtual Gate Visual representation */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 shrink-0 select-none">
              <div className={cn(
                "relative size-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 shadow-lg",
                scanStatus === "IDLE" && "border-border bg-muted/40 text-muted-foreground",
                scanStatus === "SCANNING" && "border-primary bg-primary/10 text-primary animate-pulse",
                scanStatus === "ALLOWED" && "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20 scale-105",
                scanStatus === "DENIED" && "border-red-500 bg-red-500/10 text-red-500 shadow-red-500/20 scale-105"
              )}>
                {scanStatus === "IDLE" && (
                  <>
                    <Lock className="size-10 text-muted-foreground/80 mb-1" />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase">{t.ready}</span>
                  </>
                )}
                {scanStatus === "SCANNING" && (
                  <>
                    <RefreshCw className="size-10 text-primary animate-spin mb-1" />
                    <span className="text-[10px] font-bold tracking-widest text-primary uppercase">{t.scanning}</span>
                  </>
                )}
                {scanStatus === "ALLOWED" && (
                  <>
                    <Unlock className="size-12 text-emerald-400 mb-1 animate-bounce" />
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">{t.accessGranted}</span>
                  </>
                )}
                {scanStatus === "DENIED" && (
                  <>
                    <Lock className="size-12 text-red-400 mb-1" />
                    <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">{t.accessDenied}</span>
                  </>
                )}
              </div>

              {/* Instant feedback summary screen under the LED */}
              {scanResponse && (
                <div className={cn(
                  "mt-4 p-3 rounded-lg border text-center max-w-[280px] animate-in zoom-in-95 duration-200",
                  scanResponse.allowed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"
                )}>
                  <p className="text-xs font-bold truncate text-foreground">
                    {scanResponse.memberName || selectedMember?.name}
                  </p>
                  {scanResponse.planName && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Plan: {scanResponse.planName}</p>
                  )}
                  <p className="text-[10px] font-semibold mt-1 bg-primary/10 text-primary py-0.5 px-2 rounded-full inline-block">
                    {scanResponse.message}
                  </p>
                </div>
              )}
            </div>

            {/* Input elements */}
            <div className="space-y-4 pt-4 border-t border-border shrink-0">
              {/* Select device to scan onto */}
              <div className="grid gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="sim-device">
                  {t.selectDevice}
                </label>
                <select
                  id="sim-device"
                  className="glass-control w-full text-foreground rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer bg-card"
                  value={simulatorDeviceCode}
                  onChange={(e) => setSimulatorDeviceCode(e.target.value)}
                >
                  <option value="" disabled className="text-muted-foreground bg-background">Seleccionar dispositivo...</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.code} className="text-foreground bg-background">
                      {d.name} ({d.code}) - {d.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search member dropdown lookup */}
              <div className="grid gap-1 relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="sim-member">
                  {t.selectMember}
                </label>
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    id="sim-member"
                    type="text"
                    placeholder={t.searchMemberPlaceholder}
                    value={selectedMember ? selectedMember.name : memberSearchQuery}
                    onChange={(e) => {
                      setMemberSearchQuery(e.target.value);
                      setSelectedMember(null);
                      setShowMemberResults(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMemberResults(true);
                    }}
                    className="glass-control w-full text-foreground placeholder:text-muted-foreground rounded-lg pl-9 pr-8 py-2 text-xs focus:ring-1 focus:ring-primary h-9 outline-none bg-card"
                  />
                  {selectedMember && (
                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberSearchQuery("");
                      }}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <XCircle className="size-4" />
                    </button>
                  )}
                </div>

                {/* Member Dropdown Results */}
                {showMemberResults && filteredMembers.length > 0 && (
                  <ul
                    className="absolute bottom-full mb-1 z-10 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-[160px] overflow-y-auto select-none"
                  >
                    {filteredMembers.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(m);
                            setMemberSearchQuery("");
                            setShowMemberResults(false);
                          }}
                          className="w-full text-left p-2 text-xs hover:bg-muted cursor-pointer flex flex-col focus:outline-none focus:bg-muted"
                        >
                          <span className="font-bold text-foreground text-left">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate text-left">{m.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Simulation Trigger button */}
              <Button
                onClick={handleSimulateScan}
                disabled={
                  scanStatus === "SCANNING" ||
                  !selectedMember ||
                  !simulatorDeviceCode ||
                  activeSimulatorDevice?.status !== "ONLINE"
                }
                className="w-full py-5 rounded-lg bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-xs transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
              >
                {scanStatus === "SCANNING" ? t.scanning : t.scanButton}
              </Button>

              {activeSimulatorDevice && activeSimulatorDevice.status !== "ONLINE" && (
                <p className="text-[10px] text-amber-400 flex items-center gap-1 select-none">
                  <AlertTriangle className="size-3.5" />
                  El dispositivo seleccionado no está disponible. Cambia su estado para simular.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Dialog Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleCreateDevice}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">{t.registerDevice}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{t.registerDeviceDesc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="dev-name">
                  {t.deviceName} *
                </label>
                <Input
                  id="dev-name"
                  type="text"
                  placeholder="Ej. Molinete Principal"
                  required
                  className="glass-control text-foreground text-sm px-3.5 py-2"
                  value={newDeviceForm.name}
                  onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="dev-code">
                  {t.deviceCode} *
                </label>
                <Input
                  id="dev-code"
                  type="text"
                  placeholder="Ej. TRN-ENT-01"
                  required
                  className="glass-control text-foreground text-sm px-3.5 py-2 font-mono"
                  value={newDeviceForm.code}
                  onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="dev-type">
                    {t.deviceType}
                  </label>
                  <select
                    id="dev-type"
                    className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                    value={newDeviceForm.type}
                    onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="TURNSTILE" className="text-foreground bg-background">{t.turnstile}</option>
                    <option value="BIOMETRIC" className="text-foreground bg-background">{t.biometric}</option>
                    <option value="QR_SCANNER" className="text-foreground bg-background">{t.qrScanner}</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="dev-status">
                    {t.status}
                  </label>
                  <select
                    id="dev-status"
                    className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                    value={newDeviceForm.status}
                    onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="ONLINE" className="text-foreground bg-background">{t.online}</option>
                    <option value="OFFLINE" className="text-foreground bg-background">{t.offline}</option>
                    <option value="MAINTENANCE" className="text-foreground bg-background">{t.maintenance}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="dev-branch">
                  {t.branch}
                </label>
                <select
                  id="dev-branch"
                  className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                  value={newDeviceForm.branchId}
                  onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, branchId: e.target.value }))}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-foreground bg-background">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSavingDevice}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-xs px-4 py-2 cursor-pointer"
              >
                {isSavingDevice ? "..." : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
