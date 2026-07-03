import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import FormAuth from "@/components/site/FormAuth";
import { createClient } from "@/supabase/server";

export const metadata: Metadata = {
    title: "Masuk / Daftar",
    description: "Masuk atau daftar akun untuk mendaftar lomba",
    openGraph: {
      title: "Masuk / Daftar",
      description: "Masuk atau daftar akun untuk mendaftar lomba",
    }
};

const AuthPage = async () => {
    let logo = "/css-logo.png";
    let titleMain = "CSS";
    let titleSub = "3.0";

    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from("site_settings")
            .select("id, value")
            .in("id", ["site_logo", "site_title_main", "site_title_sub"]);

        if (data) {
            const map: Record<string, string> = {};
            data.forEach((s) => { map[s.id] = s.value; });
            if (map["site_logo"]) logo = map["site_logo"];
            if (map["site_title_main"]) titleMain = map["site_title_main"];
            if (map["site_title_sub"]) titleSub = map["site_title_sub"];
        }
    } catch (e) {
        console.error("Failed to load auth page settings:", e);
    }

    return (
        <div className="relative flex min-h-screen overflow-x-hidden items-center justify-center px-4 py-16">
            <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-sapphire/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-cyan-strong/25 blur-3xl" />

            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={14} /> Kembali ke beranda
                </Link>

                <div className="glass-strong rounded-3xl p-7">
                    <div className="flex items-center gap-3">
                        <Image src={logo} width={80} height={80} alt={`${titleMain} ${titleSub}`} className="h-8 w-auto" />
                        <div>
                            <p className="font-display text-lg font-bold">
                                {titleMain} <span className="gradient-text">{titleSub}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">Computer Science Showdown</p>
                        </div>
                    </div>

                    <FormAuth />
                    
                </div>
            </div>
        </div>
    );
}

export default AuthPage;