"use client";

import { useEffect, useRef } from "react";
import { Bell, BellOff, X, Sparkles } from "lucide-react";

interface NotifPermissionModalProps {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export default function NotifPermissionModal({
  open,
  onAllow,
  onDismiss,
}: NotifPermissionModalProps) {
  const allowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => allowRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-notif-overlay-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      aria-describedby="notif-modal-desc"
    >
      <div className="relative w-full max-w-100 bg-background backdrop-blur-[28px] saturate-160 border border-accent-foreground rounded-3xl p-8 pb-7 shadow-[0_32px_80px_-16px_oklch(0.1_0.05_270_/_0.9),_inset_0_0_0_1px_oklch(0.72_0.14_200_/_0.08)] animate-notif-box-in">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/90 cursor-pointer transition-all duration-150"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="relative w-18 h-18 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-accent-foreground animate-notif-pulse-ring" />
          <div className="absolute inset-0 rounded-full border-[1.5px] border-accent-foreground animate-notif-pulse-ring [animation-delay:1.25s]" />
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-linear-to-br from-[oklch(0.52_0.3_274)] to-[oklch(0.72_0.14_200)] text-white shadow-[0_0_28px_oklch(0.72_0.14_200_/_0.45)]">
            <Bell size={28} strokeWidth={1.8} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-5.5 h-5.5 flex items-center justify-center rounded-full bg-linear-to-br from-[oklch(0.85_0.18_85)] to-[oklch(0.72_0.22_55)] text-white shadow-[0_2px_8px_oklch(0.85_0.18_85_/_0.5)] animate-notif-sparkle">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 id="notif-modal-title" className="text-xl font-bold text-white mb-2.5 tracking-tight">
            Izinkan Notifikasi
          </h2>
          <p id="notif-modal-desc" className="text-sm text-muted-foreground leading-relaxed">
            Izinkan notifikasi agar kamu bisa langsung mendapatkan update
            terbaru tentang pendaftaran, pembayaran dan pengumuman lomba.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-none inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground text-xs font-medium cursor-pointer transition-all duration-150 whitespace-nowrap"
          >
            <BellOff size={15} />
            Nanti Saja
          </button>
          <button
            ref={allowRef}
            onClick={onAllow}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl border-none bg-linear-to-r from-[oklch(0.52_0.3_274)] to-[oklch(0.72_0.14_200)] text-white text-sm font-semibold cursor-pointer shadow-[0_4px_20px_oklch(0.72_0.14_200_/_0.35)] hover:shadow-[0_8px_28px_oklch(0.72_0.14_200_/_0.5)] hover:-translate-y-0.5 hover:brightness-[1.08] active:translate-y-0 transition-all duration-200"
          >
            <Bell size={15} />
            Izinkan Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
