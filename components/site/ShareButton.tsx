"use client";

import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  text?: string;
  url?: string;
};

export default function ShareButton({
  title,
  text = "",
  url,
}: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = url ?? window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link berhasil disalin");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Gagal membagikan:", error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center text-white cursor-pointer"
    >
      <Share2 size={20} />
    </button>
  );
}