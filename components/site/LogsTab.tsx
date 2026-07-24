/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ReactNode, useState, useRef, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Trophy,
  FileText,
  Bell,
  LogIn,
  Settings,
  CreditCard,
  BarChart3,
  TrendingUp,
  Globe,
  HelpCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

type ActivityLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  status: "success" | "error" | "warning" | "info";
  actor_id: string | null;
  metadata: any;
  created_at: string;
  actor: { full_name: string | null } | null;
};

type LogsResponse = {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  stats: {
    success: number;
    error: number;
    warning: number;
    info: number;
  };
};

const STATUS_CONFIG = {
  success: {
    label: "Berhasil",
    icon: <CheckCircle2 size={12} />,
    badgeCls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  error: {
    label: "Error",
    icon: <XCircle size={12} />,
    badgeCls: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  warning: {
    label: "Peringatan",
    icon: <AlertTriangle size={12} />,
    badgeCls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  info: {
    label: "Info",
    icon: <Activity size={12} />,
    badgeCls: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
};

const ENTITY_ICONS: Record<string, ReactNode> = {
  registration: <CreditCard size={14} />,
  competition: <Trophy size={14} />,
  user: <User size={14} />,
  auth: <LogIn size={14} />,
  notification: <Bell size={14} />,
  news: <FileText size={14} />,
  seminar: <FileText size={14} />,
  site_settings: <Settings size={14} />,
  default: <Activity size={14} />,
};

const ENTITY_OPTIONS = [
  { value: "all", label: "Semua Entitas" },
  { value: "auth", label: "Autentikasi" },
  { value: "user", label: "Pengguna" },
  { value: "registration", label: "Pendaftaran" },
  { value: "competition", label: "Lomba" },
  { value: "news", label: "Berita" },
  { value: "seminar", label: "Seminar" },
  { value: "notification", label: "Notifikasi" },
  { value: "site_settings", label: "Pengaturan" },
];

export default function LogsTab() {
  const suparef = useRef(createClient());
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<LogsResponse>({
    queryKey: ["admin-logs-client", page, statusFilter, entityFilter, debouncedSearch],
    queryFn: async () => {
      const supabase = suparef.current;
      const limit = 30;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("export_logs")
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          status,
          actor_id,
          metadata,
          created_at,
          actor:profiles!export_logs_actor_id_fkey(full_name)
        `, { count: "exact" });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (entityFilter !== "all") {
        query = query.eq("entity_type", entityFilter);
      }

      if (debouncedSearch) {
        query = query.or(
          `action.ilike.%${debouncedSearch}%,entity_type.ilike.%${debouncedSearch}%,metadata::text.ilike.%${debouncedSearch}%`
        );
      }

      const { data: logsData, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const rawLogs = (logsData as any) ?? [];
      const stats = {
        success: rawLogs.filter((l: any) => l.status === "success").length,
        error: rawLogs.filter((l: any) => l.status === "error").length,
        warning: rawLogs.filter((l: any) => l.status === "warning").length,
        info: rawLogs.filter((l: any) => l.status === "info").length,
      };

      return {
        logs: rawLogs,
        total: count ?? 0,
        page,
        limit,
        stats,
      };
    },
    staleTime: 30_000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const stats = data?.stats ?? { success: 0, error: 0, warning: 0, info: 0 };
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const totalSample = logs.length || 1;
  const successRatio = Math.round((stats.success / totalSample) * 100);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  type AnalyticsApiResponse = {
    configured: boolean;
    gaStats: {
      activeUsers30d: number;
      activeUsers7d: number;
      pageViews30d: number;
      sessions30d: number;
    } | null;
    systemStats: {
      totalUsers: number;
      totalRegistrations: number;
    };
  };

  const { data: analyticsData, isLoading: isLoadingGA, refetch: refetchGA } = useQuery<AnalyticsApiResponse>({
    queryKey: ["admin-analytics-api"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Gagal memuat analytics");
      return res.json();
    },
    staleTime: 60_000,
  });

  const gaStats = analyticsData?.gaStats;
  const systemStats = analyticsData?.systemStats;
  const isGaApiConnected = analyticsData?.configured ?? false;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold">Analytics & Activity Logs</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analisis pengunjung Google Analytics, kesehatan sistem, dan rekam jejak aktivitas real-time.
          </p>
        </div>
        <button
          onClick={() => {
            refetch();
            refetchGA();
          }}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Log Sistem */}
        <div className="glass-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Log Sistem
            </span>
            <div className="p-2 rounded-xl bg-cyan-strong/10 text-cyan-strong">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-cyan-strong">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              total ? total.toLocaleString("id-ID") : 0
            }
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            Rekam jejak di database
          </p>
        </div>

        {/* Keberhasilan Sistem */}
        <div className="glass-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Keberhasilan Sistem
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-emerald-400">
            {successRatio}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              `${stats.success} transaksi/aksi sukses`
            }
          </p>
        </div>

        {/* Error & Warning */}
        <div className="glass-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Error & Warning
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-amber-400">
            {stats.error + stats.warning}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              `${stats.error} error, ${stats.warning} warning`
            }
          </p>
        </div>

        {/* User & Pendaftaran */}
        <div className="glass-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              User
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <User size={18} />
            </div>
          </div>
          {isLoadingGA ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              <p className="font-display text-2xl font-bold mt-2 text-sky-400">
                {(systemStats?.totalUsers ?? 0).toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                {(systemStats?.totalRegistrations ?? 0).toLocaleString("id-ID")} tim terdaftar
              </p>
            </>
          )}
        </div>
      </div>

      {/* Google Analytics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* GA Active 30 days */}
        <div className="glass-strong rounded-2xl p-5 border border-cyan-strong/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pengunjung Aktif
            </span>
            <div className="p-2 rounded-xl bg-cyan-strong/10 text-cyan-strong">
              <Globe size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-cyan-strong">
            {isLoadingGA ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              gaStats ? gaStats.activeUsers30d.toLocaleString("id-ID") : "—"
            }
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            User aktif dalam 30 hari
          </p>
        </div>

        {/* GA Active 7 days */}
        <div className="glass-strong rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pengunjung Aktif
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-emerald-400">
            {isLoadingGA ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              gaStats ? gaStats.activeUsers7d.toLocaleString("id-ID") : "—"
            }
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            User aktif dalam 7 hari
          </p>
        </div>

        {/* GA Page Views */}
        <div className="glass-strong rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Halaman di Kunjungi
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="font-display text-2xl font-bold mt-2 text-amber-400">
            {isLoadingGA ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              gaStats ? gaStats.pageViews30d.toLocaleString("id-ID") : "—"
            }
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            Total tayangan halaman
          </p>
        </div>

        {/* Status Koneksi API GA */}
        <div className="glass-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status Data API GA
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isLoadingGA ? (
              <Loader2 size={20} className="animate-spin" />
            ) :
              isGaApiConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Terhubung
                </span>
              ) : gaMeasurementId ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <span className="size-2 rounded-full bg-sky-400" />
                  Pelacak Web Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span className="size-2 rounded-full bg-amber-400" />
                  Tidak aktif
                </span>
              )
            }
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground flex items-center gap-2">
            <Activity size={14} className="text-cyan-strong" /> Distribusi Status Log
          </span>
          <span>{logs.length} item dianalisis</span>
        </div>

        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
          {stats.success > 0 && (
            <div
              style={{ width: `${(stats.success / totalSample) * 100}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Berhasil: ${stats.success}`}
            />
          )}
          {stats.info > 0 && (
            <div
              style={{ width: `${(stats.info / totalSample) * 100}%` }}
              className="bg-sky-500 transition-all duration-500"
              title={`Info: ${stats.info}`}
            />
          )}
          {stats.warning > 0 && (
            <div
              style={{ width: `${(stats.warning / totalSample) * 100}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Peringatan: ${stats.warning}`}
            />
          )}
          {stats.error > 0 && (
            <div
              style={{ width: `${(stats.error / totalSample) * 100}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Error: ${stats.error}`}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Berhasil ({stats.success})</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <span className="size-2 rounded-full bg-sky-500" />
            <span>Info ({stats.info})</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Peringatan ({stats.warning})</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="size-2 rounded-full bg-rose-500" />
            <span>Error ({stats.error})</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari aktivitas, entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/35 text-xs outline-none focus:border-cyan-strong/50 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs outline-none cursor-pointer focus:border-cyan-strong/50 transition"
        >
          <option value="all" className="bg-[#140c26] text-white">Semua Status</option>
          <option value="success" className="bg-[#140c26] text-white">Berhasil</option>
          <option value="error" className="bg-[#140c26] text-white">Error</option>
          <option value="warning" className="bg-[#140c26] text-white">Peringatan</option>
          <option value="info" className="bg-[#140c26] text-white">Info</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => handleFilterChange(setEntityFilter)(e.target.value)}
          className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs outline-none cursor-pointer focus:border-cyan-strong/50 transition"
        >
          {ENTITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#140c26] text-white">{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
            <RefreshCw size={16} className="animate-spin" /> Memuat logs...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 gap-2 text-destructive text-sm">
            <XCircle size={16} /> Gagal memuat logs
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
            <Activity size={32} className="opacity-30" />
            <p>Belum ada aktivitas yang tercatat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">Entitas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">Aksi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45 whitespace-nowrap">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const statusCfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.info;
                  const entityIcon = ENTITY_ICONS[log.entity_type] ?? ENTITY_ICONS.default;
                  return (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                      <td className="px-4 py-3 align-top text-xs whitespace-nowrap text-muted-foreground text-[11px]">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/80">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap border ${statusCfg.badgeCls}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/80">
                        <span className="inline-flex items-center gap-1.5 text-white/60 text-xs font-mono">
                          {entityIcon}
                          {log.entity_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/80 font-medium">{log.action}</td>
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                        {(log.actor as any)?.full_name ?? log.actor_id?.slice(0, 8) ?? "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/80">
                        {log.metadata ? (
                          <details className="max-w-55">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                              Lihat detail
                            </summary>
                            <pre className="mt-1 bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] text-white/70 overflow-auto max-h-40 whitespace-pre">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <p className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </p>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

