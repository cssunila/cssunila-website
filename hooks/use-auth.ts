import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

export type AppRole = "admin" | "user" | "lomba" | "petugas";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export type ReturnType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
}


export function useAuth(): ReturnType {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const [role, setRole] = useState<AppRole | null>(null);

  const suparef = useRef(createClient());

  const fetchRole = async (userId: string | null): Promise<AppRole | null> => {
    if (userId) {
      const supabase = suparef.current;

      const { data: profile } = await supabase
        .from("profiles")
        .select("suspended")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.suspended) {
        await supabase.auth.signOut();
        setRole(null);
        toast.error("Akun Anda telah dinonaktifkan");
        return null;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("role", { ascending: true });
      if (!data || data.length === 0) {
        setRole(null);
        return null;
      } else {
        const roles = data.map((r) => r.role as AppRole);
        let resolvedRole: AppRole = "user";
        if (roles.includes("admin")) resolvedRole = "admin";
        else if (roles.includes("lomba")) resolvedRole = "lomba";
        else if (roles.includes("petugas")) resolvedRole = "petugas";
        setRole(resolvedRole);
        return resolvedRole;
      }
    } else {
      setRole(null);
      return null;
    }
  };

  useEffect(() => {
    const supabase = suparef.current;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const user = session?.user ?? null;
      if (user) {
        await fetchRole(user.id);
      } else {
        setRole(null);
      }
      setState({ user, session, loading: false });
    };

    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        await fetchRole(user.id);
      } else {
        setRole(null);
      }
      setState({ user, session, loading: false });
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { ...state, role };
}
