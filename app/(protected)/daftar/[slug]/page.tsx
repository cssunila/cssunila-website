"use client"

import { use, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck, Upload, CheckCircle2, Info, Save } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import ConfirmModal from "@/components/site/ConfirmModal";
import { useFormDraft } from "@/hooks/use-form-draft";

type FieldRow = {
    id: string;
    key: string;
    label: string;
    field_type: "text" | "textarea" | "number" | "email" | "tel" | "url" | "select" | "file";
    placeholder: string | null;
    required: boolean;
    options: string[] | null;
    position: number;
};

type CompRow = {
    id: string;
    name: string;
    slug: string;
    fee_idr: number;
    is_open: boolean;
    is_multi_slot: boolean;
    slot: number;
    quota: number;
    team_size: string | null;
    kategori_peserta: "tim" | "individu";
    competition_fields: FieldRow[];
};

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground/90">
                {label} {required && <span className="text-destructive">*</span>}
            </span>
            {children}
        </label>
    );
}

const DaftarLomba = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = use(params);
    const { user, role } = useAuth();
    const router = useRouter();
    const isAdmin = ["lomba", "admin"].includes(role || "");

    const [teamName, setTeamName] = useState("");
    const [leaderName, setLeaderName] = useState("");
    const [leaderWhatsapp, setLeaderWhatsapp] = useState("");
    const [leaderEmail, setLeaderEmail] = useState("");
    const [slot, setSlot] = useState<number>(1);
    const [agree, setAggre] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [openInformation, setOpenInformation] = useState<boolean>(false);

    const [draftRestoredAt, setDraftRestoredAt] = useState<number | null>(null);
    const [restoredFileKeys, setRestoredFileKeys] = useState<string[]>([]);
    const draftRestoredRef = useRef(false);
    const compReadyRef = useRef(false);

    const { saveDraft, readDraft, clearDraft } = useFormDraft(slug, user?.id);

    const suparef = useRef(createClient());

    useEffect(() => {
        (async () => {
            if (comp?.kategori_peserta === "individu") setTeamName("-");
            if (user?.email) setLeaderEmail((v) => v || user.email!);
            if (user?.user_metadata.full_name) setLeaderName((v) => v || user.user_metadata.full_name!);
            if (user?.phone) setLeaderWhatsapp((v) => v || user.phone!);
        })();
    }, [user]);

    const uploadFile = async (fieldKey: string, file: File) => {
        if (!user) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file maksimum 2 MB");
            return;
        }

        setUploading((u) => ({ ...u, [fieldKey]: true }));
        try {
            const ext = file.name.split(".").pop() ?? "bin";
            const extAccept = ["jpg", "jpeg", "png", "webp", "pdf"];
            if (!extAccept.includes(ext.toLowerCase())) {
                toast.error("Ekstensi file tidak didukung");
                return;
            }

            const path = `${slug}/${user.id}/${fieldKey}-${crypto.randomUUID()}.${ext}`;
            const supabase = suparef.current;
            const { error } = await supabase.storage
                .from("registration-files")
                .upload(path, file, { upsert: false, contentType: file.type });
            if (error) throw error;
            setAnswers((a) => ({ ...a, [fieldKey]: path }));
            toast.success(`File "${file.name}" terunggah`);
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setUploading((u) => ({ ...u, [fieldKey]: false }));
        }
    }

    const { data: comp, isLoading } = useQuery({
        queryKey: ["comp-fields", slug],
        queryFn: async (): Promise<CompRow | null> => {
            const supabase = suparef.current;
            const { data, error } = await supabase
                .from("competitions")
                .select("id, name, slug, fee_idr, is_open, team_size, is_multi_slot, slot, quota, kategori_peserta, competition_fields(id,key,label,field_type,placeholder,required,options,position)")
                .eq("slug", slug)
                .maybeSingle();
            if (error) throw error;
            if (!data) return null;
            const fields = ([...(data.competition_fields ?? [])] as FieldRow[]).sort((a, b) => a.position - b.position);
            return { ...data, competition_fields: fields } as CompRow;
        },
    });

    const { data: { metodePay } = { metodePay: "midtrans" } } = useQuery({
        queryKey: ["site-qris-url"],
        queryFn: async (): Promise<{ metodePay: "midtrans" | "manual" }> => {
            const supabase = suparef.current;
            const { data } = await supabase
                .from("site_settings")
                .select("id, value")
                .in("id", ["site_metode_payment"]);

            const metodePay = data?.find((s) => s.id === "site_metode_payment")

            return { metodePay: metodePay?.value ?? "" };
        },
    });

    useEffect(() => {
        (async () => {
            if (!comp || !user || draftRestoredRef.current) return;

            compReadyRef.current = true;
            draftRestoredRef.current = true;

            const draft = readDraft();
            if (!draft) return;

            const fileKeys = comp.competition_fields
                .filter((f) => f.field_type === "file")
                .map((f) => f.key);

            setTeamName((v) => v || draft.teamName);
            setLeaderName((v) => v || draft.leaderName);
            setLeaderWhatsapp((v) => v || draft.leaderWhatsapp);
            setLeaderEmail((v) => v || draft.leaderEmail);
            setSlot(draft.slot ?? 1);

            if (Object.keys(draft.answers).length > 0) {
                setAnswers(draft.answers);
            }

            const restoredFiles = fileKeys.filter((k) => !!draft.answers[k]);
            if (restoredFiles.length > 0) setRestoredFileKeys(restoredFiles);

            setDraftRestoredAt(draft.savedAt);
            toast.info("Data berhasil dipulihkan", { duration: 5000 });
        })();
    }, [comp, user, readDraft]);

    useEffect(() => {
        if (!draftRestoredRef.current || !user) return;

        const fileKeys = comp?.competition_fields
            .filter((f) => f.field_type === "file")
            .map((f) => f.key) ?? [];

        saveDraft({
            teamName,
            leaderName,
            leaderWhatsapp,
            leaderEmail,
            slot,
            answers,
            fileFields: fileKeys,
        });
    }, [teamName, leaderName, leaderWhatsapp, leaderEmail, slot, answers, user, comp, saveDraft]);

    const submit = useMutation({
        mutationFn: async () => {
            if (!comp || !user) throw new Error("Data belum siap");

            if (!teamName.trim() || !leaderName.trim() || !leaderWhatsapp.trim() || !leaderEmail.trim()) {
                throw new Error("Isi data pendaftar, email, whatsapp dan nama tim");
            }

            if (!agree) {
                throw new Error("Harap menyetujui data anda sudah benar");
            }

            const supabase = suparef.current;
            const { data: register } = await supabase
                .from("registrations")
                .select("id")
                .eq("competition_id", comp.id)
                .in("status", ["verified", "pending_verification"]);

            if (register && comp.quota > 0) {
                if (register.length >= comp.quota) {
                    throw new Error("Pendaftaran sudah penuh!");
                }
            }

            for (const f of comp.competition_fields) {
                if (f.required && !answers[f.key]?.trim()) {
                    throw new Error(`Isi Field "${f.label}"`);
                }
            }

            const { data: reg, error: e1 } = await supabase
                .from("registrations")
                .insert({
                    competition_id: comp.id,
                    user_id: user.id,
                    team_name: teamName.trim(),
                    leader_name: leaderName.trim(),
                    leader_whatsapp: leaderWhatsapp.trim(),
                    leader_email: leaderEmail.trim(),
                    slot,
                    status: "pending_payment",
                    is_manual: metodePay === "manual" ? true : false,
                })
                .select("id")
                .single();
            if (e1) throw e1;

            const rows = comp.competition_fields.map((f) => ({
                registration_id: reg.id,
                field_id: f.id,
                field_key: f.key,
                field_label: f.label,
                value: answers[f.key]?.trim() ?? null,
            }));
            if (rows.length) {
                const { error: e2 } = await supabase.from("registration_answers").insert(rows);
                if (e2) throw e2;
            }

            const { error: e3 } = await supabase.from("payments").insert({
                registration_id: reg.id,
                user_id: user.id,
                amount_idr: comp.fee_idr * slot,
                status: "pending",
            });
            if (e3) throw e3;

            return reg.id;
        },
        onSuccess: () => {
            clearDraft();
            toast.success("Pendaftaran terkirim. Lanjut ke pembayaran di riwayat.");
            router.push("/history");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return (
        <>
            <div className="relative min-h-screen overflow-x-hidden">
                <Navbar />
                <section className="pt-30 md:pt-32 pb-26 md:pb-30">
                    <div className="mx-auto max-w-2xl px-4">
                        <Link href={comp ? `/lomba/${comp.slug}` : `/#lomba`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft size={14} /> Kembali ke Lomba
                        </Link>

                        {isLoading && <div className="glass mt-8 rounded-2xl p-10 text-center text-sm text-muted-foreground">Memuat…</div>}

                        {!isLoading && !comp && (
                            <div className="glass mt-8 rounded-2xl p-10 text-center">Lomba tidak ditemukan.</div>
                        )}

                        {comp && (
                            <>
                                <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                                    Daftar <span className="gradient-text">{comp.name}</span>
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Biaya pendaftaran <span className="text-foreground">Rp. {(comp.fee_idr * slot).toLocaleString("id-ID")}</span> · {comp.team_size}
                                </p>

                                {user && (
                                    <div className="mt-4 flex items-center gap-2">
                                        {draftRestoredAt && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-strong/25 bg-cyan-strong/10 px-3 py-2 text-sm font-medium text-cyan-strong">
                                                <CheckCircle2 size={14} />
                                                Data berhasil dipulihkan
                                            </span>
                                        )}
                                    </div>
                                )}

                                {!comp.is_open && (
                                    <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-400">
                                        Pendaftaran {comp.name} sedang ditutup.
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="mt-6 flex items-start gap-2 bg-cyan-strong/10 border border-cyan-strong/15 rounded-2xl p-4">
                                        <Info className="shrink-0 size-4 text-cyan-strong" />
                                        <p className="text-sm text-cyan-strong">
                                            Sebagai Admin, anda dapat mendaftarkan peserta melalui halaman <Link href="/admin" className="text-cyan-strong font-semibold">admin</Link>.
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (comp.is_open) {
                                            if (slot > 1) {
                                                setOpenInformation(true);
                                                return;
                                            }
                                            submit.mutate();
                                        }
                                    }}
                                    className="glass mt-8 space-y-5 rounded-3xl p-6"
                                >
                                    {comp.kategori_peserta === "tim" &&
                                        <Field label="Nama Tim" required>
                                            <input disabled={!comp.is_open} value={teamName} onChange={(e) => setTeamName(e.target.value)} className={"inputCls disabled:cursor-not-allowed"} maxLength={100} placeholder="Radar" required />
                                        </Field>
                                    }
                                    <Field label={comp.kategori_peserta === "tim" ? "Nama Pendaftar" : "Nama Peserta"} required>
                                        <input disabled={!comp.is_open} value={leaderName} onChange={(e) => setLeaderName(e.target.value)} className={"inputCls disabled:cursor-not-allowed"} maxLength={100} placeholder="Bangraff" required />
                                    </Field>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="WhatsApp Pendaftar" required>
                                            <input disabled={!comp.is_open} value={leaderWhatsapp} onChange={(e) => setLeaderWhatsapp(e.target.value)} className={"inputCls disabled:cursor-not-allowed"} maxLength={20} required placeholder="08xxxxxxxxxx" />
                                        </Field>
                                        <Field label="Email Pendaftar" required>
                                            <input disabled={!comp.is_open} type="email" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} className={"inputCls disabled:cursor-not-allowed"} maxLength={255} required placeholder="cssunila25@gmail.com" />
                                        </Field>
                                    </div>
                                    {!!comp.is_multi_slot &&
                                        <Field label="Slot">
                                            <select
                                                disabled={!comp.is_open}
                                                value={slot}
                                                onChange={(e) => setSlot(Number(e.target.value))}
                                                className={"inputCls disabled:cursor-not-allowed"}
                                            >
                                                {Array.from({ length: comp.slot }).map((_, index) => (
                                                    <option className="bg-background" key={index + 1} value={index + 1}>{index + 1}</option>
                                                ))}
                                            </select>
                                        </Field>
                                    }

                                    <div className="my-4 h-px bg-white/10" />

                                    {comp.competition_fields.map((f) => (
                                        <Field key={f.id} label={f.label} required={f.required}>
                                            {f.field_type === "textarea" ? (
                                                <textarea
                                                    disabled={!comp.is_open}
                                                    value={answers[f.key] ?? ""}
                                                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                                                    placeholder={f.placeholder ?? ""}
                                                    rows={4}
                                                    maxLength={2000}
                                                    className={"inputCls disabled:cursor-not-allowed resize-none"}
                                                    required={f.required}
                                                />
                                            ) : f.field_type === "select" ? (
                                                <select
                                                    disabled={!comp.is_open}
                                                    value={answers[f.key] ?? ""}
                                                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                                                    className={"inputCls disabled:cursor-not-allowed"}
                                                    required={f.required}
                                                >
                                                    <option value="">-- Pilih --</option>
                                                    {(f.options ?? []).map((o) => (
                                                        <option key={o} value={o} className="bg-background">{o}</option>
                                                    ))}
                                                </select>
                                            ) : f.field_type === "file" ? (
                                                <div className="space-y-2">
                                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/2 px-4 py-4 text-sm text-muted-foreground hover:bg-white/5">
                                                        {uploading[f.key] ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                        <span>{uploading[f.key] ? "Mengunggah…" : (answers[f.key] ? "Ganti file" : (f.placeholder || "Pilih file (Max 2 MB)"))}</span>
                                                        <input
                                                            disabled={!comp.is_open}
                                                            type="file"
                                                            className="hidden disabled:cursor-not-allowed"
                                                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                            required={f.required && !answers[f.key]}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) uploadFile(f.key, file);
                                                            }}
                                                        />
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">Tip: File yang diterima &quot;.jpg&quot;, &quot;.jpeg&quot;, &quot;.png&quot;, &quot;.webp&quot;, &quot;.pdf&quot;. Max 2 MB</p>
                                                    {answers[f.key] && (
                                                        <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                                                            <CheckCircle2 size={12} />
                                                            {restoredFileKeys.includes(f.key)
                                                                ? `File dipulihkan: ${answers[f.key].split("/").pop()}`
                                                                : answers[f.key].split("/").pop()
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    disabled={!comp.is_open}
                                                    type={f.field_type}
                                                    value={answers[f.key] ?? ""}
                                                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                                                    placeholder={f.placeholder ?? ""}
                                                    maxLength={500}
                                                    className={"inputCls disabled:cursor-not-allowed"}
                                                    required={f.required}
                                                />
                                            )}
                                        </Field>
                                    ))}

                                    <label htmlFor="agree"
                                        className="flex items-start gap-3 cursor-pointer"
                                    >
                                        <input disabled={!comp.is_open} type="checkbox" id="agree" className="appearance-none mt-1 shrink-0 checked:bg-secondary size-3.5 bg-muted-foreground rounded-lg border-none" required onChange={(e) => setAggre(e.target.checked)} />
                                        <span className="text-sm text-muted-foreground">
                                            Saya menyetujui bahwa saya telah membaca <Link href={`/lomba/${slug}#S&K`} className="text-cyan-strong font-semibold">S&K</Link> dan semua informasi yang saya berikan adalah benar dan akurat.
                                        </span>
                                    </label>

                                    <div className="rounded-xl border border-white/10 bg-white/2 p-4 text-xs text-muted-foreground">
                                        <p className="flex items-start gap-2">
                                            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-cyan-strong" />
                                            Setelah pengiriman, kamu akan diarahkan ke halaman riwayat untuk menyelesaikan pembayaran.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!comp.is_open || submit.isPending || isAdmin}
                                        className="btn-hero cursor-pointer disabled:cursor-not-allowed hover:btn-hero-hover inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
                                    >
                                        {submit.isPending && <Loader2 size={16} className="animate-spin" />}
                                        Kirim Pendaftaran
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </section>
                <Footer />
            </div>

            <ConfirmModal
                open={openInformation}
                variant="warning"
                title="Konfirmasi Pendaftaran"
                message={`Karena anda mendaftar ${slot} slot, maka anda dikenakan biaya tambahan sebesar ${slot} X ${comp ? comp.fee_idr.toLocaleString("id-ID") : 0} = Rp. ${comp ? (comp.fee_idr * slot).toLocaleString("id-ID") : 0}.`}
                confirmLabel="Ya, Setuju"
                onConfirm={() => {
                    setOpenInformation(false)
                    submit.mutate();
                }}
                onCancel={() => setOpenInformation(false)}
            />
        </>
    );
}



export default DaftarLomba;
