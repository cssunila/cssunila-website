import { createClient } from "@/supabase/server";
import Image from "next/image";

const LoadingScreen = async ({ label = "Memuat halaman" }: { label?: string }) => {
    let siteLogo: string | undefined;
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("site_settings").select("value").eq("id", "site_logo").maybeSingle();
        if (error) throw error;
        if (data) siteLogo = data.value;
    } catch { }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            {/* ambient orbs */}
            <div className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-72 w-72 rounded-full bg-sapphire/30 blur-3xl animate-float" />
            <div className="pointer-events-none absolute -right-16 bottom-1/4 -z-10 h-80 w-80 rounded-full bg-cyan-strong/25 blur-3xl animate-float [animation-delay:1.5s]" />

            <div className="flex flex-col items-center gap-8 text-center">
                {/* orbiting loader */}
                <div className="relative h-40 w-40">
                    <div className="absolute inset-0 rounded-full border border-white/10" />
                    <div className="absolute inset-0 animate-[spin_2.4s_linear_infinite] rounded-full border-2 border-transparent border-t-cyan-strong border-r-cyan-strong/60" />
                    <div className="absolute inset-2 animate-[spin_3.6s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-sapphire border-l-sapphire/60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image loading="eager" src={siteLogo || "/css-logo.png"} alt="CSS LOGO" width={100} height={100} className="object-contain w-28 h-28" />
                    </div>
                    <div className="absolute inset-0 -z-10 rounded-full bg-cyan-strong/20 blur-2xl animate-pulse" />
                </div>

                <div className="space-y-2">
                    <p className="font-display text-lg font-semibold text-foreground">{label}</p>
                    <div className="flex flex-col items-center justify-center gap-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        <span className="ml-2">Menyiapkan pengalaman terbaikmu</span>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block size-1.5 rounded-full bg-cyan-strong animate-[pulse_1.4s_ease-in-out_infinite]" />
                            <span className="inline-block size-1.5 rounded-full bg-cyan-strong animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:.2s]" />
                            <span className="inline-block size-1.5 rounded-full bg-cyan-strong animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:.4s]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;