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
          actor,
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

      return {
        logs: (logsData as any) ?? [],
        total: count ?? 0,
        page,
        limit,
      };
    },
    staleTime: 30_000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-display font-bold">Activity Logs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rekam jejak semua aktivitas — <span className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary"> {total.toLocaleString()} total</span>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
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
      <div className="glass rounded-2xl overflow-hidden">
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
