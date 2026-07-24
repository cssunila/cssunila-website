"use client"

import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef } from "react";

type GroupLink = { link_url: string | null; qr_url: string | null; is_visible: boolean };

const GroupLinkPanel = ({ competitionId }: { competitionId: string }) => {
  const suparef = useRef(createClient());

  const { data } = useQuery({
    queryKey: ["group-link", competitionId],
    queryFn: async (): Promise<GroupLink | null> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("group_links")
        .select("link_url, qr_url, is_visible")
        .eq("competition_id", competitionId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!data?.link_url && !data?.qr_url && data?.is_visible) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-200">
        Pendaftaran terverifikasi. Link grup akan tampil di sini segera.
      </div>
    );
  }


  if(!data?.is_visible) {
    return (
      <div className="mt-4 rounded-xl border border-cyan-strong/30 bg-cyan-strong/5 p-3 text-xs text-cyan-strong">
        Pendaftaran terverifikasi. Pantau terus pengumuman selanjutnya ya.
      </div>
    )
  } else {
    return (
      <div className="mt-4 items-center justify-center flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        {data.qr_url && (
          <Image src={data.qr_url} width={96} height={96} alt="QR Grup" className="h-24 w-24 rounded-lg border border-white/10 bg-white p-1" />
        )}
        <div className="flex flex-col items-center gap-1">
          <p className="text-md font-bold text-gray-300">Grup peserta</p>
          {data.link_url && (
            <a href={data.link_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs text-emerald-100 hover:underline">
              Silahkan klik untuk bergabung ke dalam grup
            </a>
          )}
        </div>
      </div>
    );
  }
}

export default GroupLinkPanel;