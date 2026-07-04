"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Konfirmasi Tindakan",
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="confirm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className="confirm-modal-box">
        {/* Icon */}
        <div className={`confirm-modal-icon ${isDanger ? "confirm-icon-danger" : "confirm-icon-warning"}`}>
          {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="confirm-modal-close"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="confirm-modal-content">
          <h2 id="confirm-modal-title" className="confirm-modal-title">
            {title}
          </h2>
          <p id="confirm-modal-desc" className="confirm-modal-message">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="confirm-modal-actions">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="confirm-btn-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`confirm-btn-confirm ${isDanger ? "confirm-btn-danger" : "confirm-btn-warning"}`}
          >
            {isDanger ? <Trash2 size={15} /> : <AlertTriangle size={15} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
