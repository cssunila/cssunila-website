"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface DownloadPanduanButtonProps {
  panduanPath: string;
  slug: string;
}

export const DownloadPanduanButton = ({
  panduanPath,
  slug,
}: DownloadPanduanButtonProps) => {
  async function downloadPdf(path: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("site_settings")
      .download(path);

    if (error) {
      toast.error("Gagal mengunduh file");
      console.error(error);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");

    link.href = url;
    link.download = `panduan-${slug ?? "lomba"}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <Button
      onClick={() => downloadPdf(panduanPath)}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-7 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur-md transition hover:bg-white/10 cursor-pointer"
    >
      <Download size={14} /> Unduh
    </Button>
  );
}

interface DaftarActionButtonProps {
  isOpen: boolean;
  isQuota: boolean | null;
  slug: string;
  currentUrl: string;
}

export const DaftarActionButton = ({
  isOpen,
  slug,
  isQuota,
  currentUrl,
}: DaftarActionButtonProps) => {
  const { user, loading } = useAuth();

  if (!isOpen) {
    return (
      <>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Pendaftaran Sedang Ditutup
        </h2>
        <p className="mt-3 text-muted-foreground">
          Cabang ini belum membuka pendaftaran. Pantau pengumuman selanjutnya ya.
        </p>
      </>
    );
  }

  if (isQuota) {
    return (
      <>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Pendaftaran Sudah Penuh
        </h2>
        <p className="mt-3 text-muted-foreground">
          Pendaftaran sudah ditutup. Pantau pengumuman selanjutnya ya.
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="font-display text-3xl font-bold sm:text-4xl">
        Siap untuk bertanding?
      </h2>
      <p className="mt-3 text-muted-foreground">
        Daftarkan timmu sekarang. Pembayaran langsung dari website, tanpa ribet.
      </p>
      {user ? (
        <Link
          href={`/daftar/${slug}`}
          className="btn-hero hover:btn-hero-hover mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold"
        >
          Daftar Sekarang
        </Link>
      ) : (
        <Link
          href={{
            pathname: "/auth",
            query: {
              redirect: currentUrl,
            },
          }}
          className="btn-hero hover:btn-hero-hover mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold"
        >
          {loading ? "Memuat…" : "Masuk dulu untuk mendaftar"}
        </Link>
      )}
    </>
  );
}
