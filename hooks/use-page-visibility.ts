"use client"

import { createClient } from "@/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

export type SectionKey = "lomba" | "berita" | "seminar" | "juara";

export type PageVisibility = Record<SectionKey, boolean>;

const DEFAULT_VISIBILITY: PageVisibility = {
  lomba: true,
  berita: true,
  seminar: true,
  juara: true,
};

export function usePageVisibility() {
  const suparef = useRef(createClient());

  const { data, isLoading } = useQuery({
    queryKey: ["page-visibility"],
    queryFn: async (): Promise<PageVisibility> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("page_visibility")
        .select("id, is_visible");
      if (error) throw error;

      const result = { ...DEFAULT_VISIBILITY };
      (data ?? []).forEach((row: { id: string; is_visible: boolean }) => {
        if (row.id in result) {
          (result as Record<string, boolean>)[row.id] = row.is_visible;
        }
      });
      return result;
    },
    staleTime: 30_000,
  });

  return {
    visibility: data ?? DEFAULT_VISIBILITY,
    isLoading,
  };
}

export function useToggleVisibility(sectionKey: SectionKey) {
  const suparef = useRef(createClient());
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: boolean) => {
      const supabase = suparef.current;
      const { error } = await supabase
        .from("page_visibility")
        .upsert(
          { id: sectionKey, is_visible: newValue, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-visibility"] });
    },
  });
}
