/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut, ShieldCheck, History, Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import NotifPermissionModal from "./NotifPermissionModal";
import { useBrowserNotification } from "@/hooks/use-browser-notification";

const links = [
    { href: "/", label: "Beranda" },
    { href: "/#about", label: "Tentang Kami" },
    { href: "/#timeline", label: "Timeline" },
    { href: "/#lomba", label: "Lomba" },
    { href: "/#berita", label: "Berita" },
    { href: "/#seminar", label: "Seminar" },
    { href: "/pengumuman", label: "Pengumuman" },
    { href: "/kontak", label: "Kontak" },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { user, loading, role } = useAuth();
    const suparef = useRef(createClient());
    const router = useRouter();
    const isAdmin = ["petugas","lomba","admin"].includes(role || "");

    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const { shouldShowModal: showNotifModal, requestPermission, dismissModal } = useBrowserNotification(!!user);
    const [allowedComps, setAllowedComps] = useState<string[]>([]);

    const [settings, setSettings] = useState<Record<string, string>>({
        site_logo: "/css-logo.png",
        site_favicon: "/favicon.ico",
        site_title_main: "CSS",
        site_title_sub: "3.0",
    });

    const [visibility, setVisibility] = useState<Record<string, boolean>>({
        lomba: true,
        berita: true,
        seminar: true,
        juara: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = suparef.current;
            const { data } = await supabase
                .from("site_settings")
                .select("id, value")
                .in("id", ["site_logo", "site_favicon", "site_title_main", "site_title_sub"]);
            if (data && data.length > 0) {
                const map: Record<string, string> = {};
                data.forEach((item) => {
                    map[item.id] = item.value;
                });
                setSettings((prev) => ({
                    ...prev,
                    ...map,
                }));
            }
        };

        const fetchVisibility = async () => {
            try {
                const supabase = suparef.current;
                const { data } = await supabase
                    .from("page_visibility")
                    .select("id, is_visible");
                if (data && data.length > 0) {
                    const map: Record<string, boolean> = {
                        lomba: true,
                        berita: true,
                        seminar: true,
                        juara: true,
                    };
                    data.forEach((row: any) => {
                        map[row.id] = row.is_visible;
                    });
                    setVisibility(map);
                }
            } catch (e) {
                console.error("Gagal memuat visibilitas halaman", e);
            }
        };

        fetchSettings();
        fetchVisibility();
    }, []);

    useEffect(() => {
        if (settings.site_favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.getElementsByTagName("head")[0].appendChild(link);
            }
            link.href = settings.site_favicon;
        }
    }, [settings.site_favicon]);

    const fetchNotifications = async () => {
        if (!user) return;
        const supabase = suparef.current;
        const query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(8);

        if (role === "admin") {
            query.or(`user_id.eq.${user.id},is_for_admin.eq.true`);
        } else if (role === "lomba") {
            const { data: allowedCompsData } = await supabase
                .from("user_competitions")
                .select("competition_id")
                .eq("user_id", user.id);
            const allowedCompIds = (allowedCompsData ?? []).map((c) => c.competition_id);
            
            if (allowedCompIds.length > 0) {
                query.or(`user_id.eq.${user.id},and(is_for_admin.eq.true,competition_id.in.(${allowedCompIds.join(",")}))`);
            } else {
                query.eq("user_id", user.id);
            }
        } else {
            query.eq("user_id", user.id);
        }

        const { data, error } = await query;
        if (!error && data) {
            setNotifications(data);
        }
    };

    const markAsRead = async (id: string) => {
        const supabase = suparef.current;
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const supabase = suparef.current;
        const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .in("id", unreadIds);

        if (!error) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            toast.success("Semua notifikasi ditandai dibaca");
        }
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchAllowedComps = async () => {
            if (user && role === "lomba") {
                const supabase = suparef.current;
                const { data } = await supabase
                    .from("user_competitions")
                    .select("competition_id")
                    .eq("user_id", user.id);
                setAllowedComps((data ?? []).map((c) => c.competition_id));
            } else {
                setAllowedComps([]);
            }
        };
        fetchAllowedComps();
    }, [user, role]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const supabase = suparef.current;
            const channel = supabase
                .channel("realtime-notifications")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                    },
                    (payload: any) => {
                        const newNotif = payload.new;
                        const isForMe = newNotif.user_id === user.id ||
                            (newNotif.is_for_admin && (
                                role === "admin" || 
                                (role === "lomba" && newNotif.competition_id && allowedComps.includes(newNotif.competition_id))
                            ));

                        if (isForMe) {
                            setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
                            toast.info(newNotif.title, {
                                description: newNotif.message,
                            });
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, role, allowedComps]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotif(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    async function doSignOut() {
        const supabase = suparef.current;
        await supabase.auth.signOut();
        toast.success("Berhasil keluar");
        router.push("/");
    }

    function handleSignOut() {
        setShowLogoutConfirm(true);
    }

    const activeLinks = links.filter((link) => {
        if (link.href === "/#lomba") return visibility.lomba;
        if (link.href === "/#berita") return visibility.berita;
        if (link.href === "/#seminar") return visibility.seminar;
        if (link.href === "/pengumuman") return visibility.juara;
        return true;
    });

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"
                }`}
        >
            <div className="mx-auto max-w-7xl px-4">
                <nav
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${scrolled ? "glass-strong" : "glass"
                        }`}
                >
                    <Link href={"/"} className="flex items-center gap-2">
                        <Image src={settings.site_logo} width={60} height={60} alt={`${settings.site_title_main} ${settings.site_title_sub}`} className="h-7 w-auto" />
                        <span className="font-display text-sm font-bold tracking-wider">
                            {settings.site_title_main} <span className="gradient-text">{settings.site_title_sub}</span>
                        </span>
                    </Link>

                    <ul className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
                        {activeLinks.map((l) => (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            {user && (
                                <div className="relative inline-flex" ref={notifRef}>
                                    <button
                                        onClick={() => setShowNotif(!showNotif)}
                                        className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/2 p-2 hover:bg-white/5 text-foreground transition cursor-pointer"
                                        aria-label="Notifikasi"
                                    >
                                        <Bell size={16} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotif && (
                                        <div className="absolute -right-10 md:right-0 mt-12 w-80 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl z-50">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                                                <h4 className="font-display text-sm font-semibold">Notifikasi</h4>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-cyan-strong hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Check size={12} /> Tandai semua dibaca
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                                {notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                                        Tidak ada notifikasi
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => !n.is_read && markAsRead(n.id)}
                                                            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${n.is_read
                                                                ? "bg-white/1 border-white/5 hover:bg-white/2"
                                                                : "bg-cyan-strong/5 border-cyan-strong/20 hover:bg-cyan-strong/10"
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-1">
                                                                <p className={`text-xs font-semibold ${n.is_read ? "text-foreground" : "text-cyan-strong"}`}>
                                                                    {n.title}
                                                                </p>
                                                                {!n.is_read && (
                                                                    <span className="h-1.5 w-1.5 mt-1 rounded-full bg-cyan-strong" />
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                                                                {n.message}
                                                            </p>
                                                            <span className="mt-1 block text-[9px] text-muted-foreground/60">
                                                                {new Date(n.created_at).toLocaleTimeString("id-ID", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="rounded-md p-2 text-foreground lg:hidden"
                                onClick={() => setOpen((o) => !o)}
                                aria-label="Menu"
                            >
                                {open ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                            {!loading && user ? (
                                <>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="inline-flex text-xs items-center gap-2 rounded-lg border border-cyan-strong/40 bg-cyan-strong/10 px-4 py-2 font-medium text-cyan-strong transition hover:bg-cyan-strong/20"
                                        >
                                            <ShieldCheck size={14} /> <span className="hidden lg:inline">Admin</span>
                                        </Link>
                                    )}
                                    {!isAdmin && (
                                        <Link
                                            href="/history"
                                            className="btn-hero hover:btn-hero-hover inline-flex gap-2 items-center rounded-lg px-4 py-2 text-xs font-semibold"
                                        >
                                            <History size={14} /> <span className="hidden lg:inline">Riwayat</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="inline-flex gap-2 items-center rounded-lg px-4 py-2 text-xs bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 cursor-pointer text-destructive transition"
                                        aria-label="Keluar"
                                    >
                                        <LogOut size={14} /> <span className="hidden lg:inline">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth"
                                        className="btn-hero hover:btn-hero-hover rounded-full px-4 py-2 text-sm font-semibold"
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {open && (
                    <div className="glass-strong mt-2 rounded-2xl p-4 lg:hidden">
                        <ul className="flex flex-col gap-1">
                            {activeLinks.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        onClick={() => setOpen(false)}
                                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="mt-2">
                                {user ? (
                                    !isAdmin && (
                                        <Link
                                            href="/history"
                                            onClick={() => setOpen(false)}
                                            className="btn-hero block rounded-full px-4 py-2 text-center text-sm font-semibold"
                                        >
                                            Riwayat Saya
                                        </Link>
                                    )
                                ) : (
                                    <Link
                                        href="/auth"
                                        onClick={() => setOpen(false)}
                                        className="btn-hero block rounded-full px-4 py-2 text-center text-sm font-semibold"
                                    >
                                        Masuk / Daftar
                                    </Link>
                                )}
                            </li>
                            <li>
                                {user && isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="block text-center rounded-full border border-cyan-strong/40 bg-cyan-strong/10 px-4 py-2 text-sm font-medium text-cyan-strong transition hover:bg-cyan-strong/20"
                                    >
                                        Admin
                                    </Link>
                                )}
                            </li>
                            <li>
                                {user && (
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full items-center flex justify-center rounded-full px-4 py-3 border border-destructive/30 text-sm bg-destructive/30 hover:bg-destructive/40 cursor-pointer text-destructive transition"
                                        aria-label="Keluar"
                                    >
                                        Keluar
                                    </button>
                                )}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={showLogoutConfirm}
                variant="danger"
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari akun?"
                confirmLabel="Ya, Keluar"
                cancelLabel="Batal"
                onConfirm={() => { setShowLogoutConfirm(false); doSignOut(); }}
                onCancel={() => setShowLogoutConfirm(false)}
            />

            <NotifPermissionModal
                open={showNotifModal}
                onAllow={requestPermission}
                onDismiss={dismissModal}
            />
        </header>
    );
}

export default Navbar;