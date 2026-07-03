"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Loader2, Eye, EyeClosed } from "lucide-react";
import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Masuk / Daftar — CSS 3.0",
    description: "Masuk atau daftar akun untuk mendaftar lomba CSS 3.0",
};

const Field = ({
    icon: Icon,
    ...props
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
}) => {
    const [eye, setEye] = useState<boolean>(false);

    return (
        <label className="glass relative flex items-center gap-2 rounded-xl px-3 py-2.5">
            <Icon size={16} className="text-muted-foreground" />
            <input
                type={props.type === "password" ? (eye ? "text" : "password") : props.type ?? "text"}
                placeholder={props.placeholder}
                value={props.value}
                required={props.required}
                onChange={(e) => props.onChange(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            {props.type == "password" && <>
                {eye ? <Eye size={16} onClick={() => setEye(false)} className="absolute text-muted-foreground right-3 cursor-pointer" /> : <EyeClosed onClick={() => setEye(true)} size={16} className="absolute text-muted-foreground right-3 cursor-pointer" />}
            </>}
        </label>
    );
}

const GoogleIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.05-3.72 1.05-2.87 0-5.3-1.94-6.16-4.54H2.18v2.85A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.08A6.6 6.6 0 0 1 5.5 12c0-.72.12-1.42.34-2.08V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.85C6.7 7.32 9.13 5.38 12 5.38z" />
        </svg>
    );
}

const FormAuth = () => {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [agree, setAgree] = useState<boolean>(false);
    const suparef = useRef(createClient());

    useEffect(() => {
        const supabase = suparef.current;
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.push("/");
        });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const schema = z.object({
                email: z.string().email("Email tidak valid").max(255),
                password: z.string().min(6, "Password minimal 6 karakter").max(72),
            });

            const parsed = schema.safeParse({ email, password });
            if (!parsed.success) {
                toast.error(parsed.error.issues[0]?.message ?? "Input tidak valid");
                return;
            }

            const supabase = suparef.current;
            if (mode === "register") {
                if(!agree) {
                    toast.error("Anda harus menyetujui syarat dan ketentuan");
                    return;
                }

                const isSame = password === confirmPassword;
                if (!isSame) {
                    toast.error("Password tidak sama");
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth`,
                        data: { full_name: fullName },
                    },
                });

                if (error) throw error;
                toast.success("Akun dibuat. Silakan login.");
                setMode("login");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success("Berhasil masuk!");
                router.push("/");
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            const supabase = suparef.current;
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal masuk dengan Google");
            setGoogleLoading(false);
        }
    };



    return (
        <section>
            <h1 className="mt-6 font-display text-3xl font-bold">
                {mode === "login" ? "Selamat datang" : "Buat akun"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login"
                    ? "Masuk untuk mendaftar lomba & melihat status pendaftaran."
                    : "Daftar akun untuk mulai mendaftar cabang lomba CSS 3.0."}
            </p>

            <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="mt-6 cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-60"
            >
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Lanjutkan dengan Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> atau <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                    <Field icon={UserIcon} placeholder="Nama lengkap" value={fullName} onChange={setFullName} />
                )}
                <Field icon={Mail} placeholder="Email" type="email" value={email} onChange={setEmail} required />
                <Field icon={Lock} placeholder="Password" type="password" value={password} onChange={setPassword} required />
                {mode === "register" && (
                    <>
                        <Field icon={Lock} placeholder="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
                        <label htmlFor="agree" className="flex items-start gap-3 my-2">
                            <input onChange={(e) => setAgree(e.target.checked)} checked={agree} type="checkbox" id="agree" className="appearance-none mt-1 shrink-0 w-5 h-5 checked:bg-secondary rounded-md border" />
                            <span className="text-sm text-muted-foreground">Dengan mendaftar, saya menyetujui <Link href="terms" target="_blank" className="text-secondary font-semibold">Syarat & Ketentuan</Link> dan <Link href="privacy" target="_blank" className="text-secondary font-semibold">Kebijakan Privasi</Link></span>
                        </label>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-hero cursor-pointer hover:btn-hero-hover flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {mode === "login" ? "Masuk" : "Daftar"}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
                <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="font-semibold cursor-pointer text-cyan-strong hover:underline"
                >
                    {mode === "login" ? "Daftar di sini" : "Masuk"}
                </button>
            </p>
        </section>
    );
}

export default FormAuth;