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
      className="notif-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      aria-describedby="notif-modal-desc"
    >
      <div className="notif-modal-box">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="notif-modal-close"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="notif-modal-icon-wrap">
          <div className="notif-modal-icon-ring" />
          <div className="notif-modal-icon-ring notif-modal-icon-ring-2" />
          <div className="notif-modal-icon-core">
            <Bell size={28} strokeWidth={1.8} />
          </div>
          <div className="notif-modal-sparkle">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Content */}
        <div className="notif-modal-content">
          <h2 id="notif-modal-title" className="notif-modal-title">
            Aktifkan Notifikasi
          </h2>
          <p id="notif-modal-desc" className="notif-modal-desc">
            Aktifkan notifikasi push agar kamu bisa langsung mendapatkan update
            terbaru seputar pendaftaran, pembayaran, dan pengumuman lomba —
            bahkan saat kamu sedang tidak membuka halaman ini.
          </p>

          {/* Features */}
          <ul className="notif-modal-features">
            <li>
              <span className="notif-feature-dot" />
              Status pendaftaran &amp; verifikasi
            </li>
            <li>
              <span className="notif-feature-dot" />
              Konfirmasi pembayaran real-time
            </li>
            <li>
              <span className="notif-feature-dot" />
              Pengumuman lomba terbaru
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="notif-modal-actions">
          <button
            onClick={onDismiss}
            className="notif-btn-cancel"
          >
            <BellOff size={15} />
            Nanti Saja
          </button>
          <button
            ref={allowRef}
            onClick={onAllow}
            className="notif-btn-allow"
          >
            <Bell size={15} />
            Izinkan Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
