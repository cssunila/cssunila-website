import { createClient } from "@/supabase/server";
import { ArrowLeft, Calendar, MapPin, Mic, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seminar | CSS 3.0",
  description: "Seminar terbaru CSS 3.0",
  openGraph: {
    title: "Seminar | CSS 3.0",
    description: "Seminar terbaru CSS 3.0",
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

type SeminarItem = {
  title: string;
  description: string | null;
  speaker: string | null;
  speaker_image_url: string | null;
  location: string | null;
  image_url: string | null;
  scheduled_at: string | null;
};

export default async function SeminarDetailPage({ params }: Props) {
  const { slug } = await params;
  let seminar: SeminarItem | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("seminars")
      .select("title, description, speaker, speaker_image_url, location, image_url, scheduled_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    seminar = data as SeminarItem | null;
  } catch (error) {
    console.error("Failed to fetch seminar detail:", error);
  }

  if (!seminar) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <section className="pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/#seminar"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Seminar
          </Link>

          <article className="mt-8">
            <header className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-strong">
                <Mic size={14} />
                <span>Seminar & Talkshow CSS 3.0</span>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl leading-tight text-foreground">
                {seminar.title}
              </h1>
            </header>

            {/* Banner/Header Image */}
            {seminar.image_url && (
              <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                  src={seminar.image_url}
                  alt={seminar.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {/* Event details card */}
              <div className="md:col-span-2 space-y-8">
                <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                  <h2 className="font-display text-xl font-bold text-foreground">Tentang Seminar</h2>
                  <div className="leading-relaxed text-foreground/80 space-y-4 text-base sm:text-lg">
                    {seminar.description?.split("\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speaker & Info Sidebar */}
              <div className="space-y-6">
                {/* Speaker Card */}
                <div className="glass rounded-3xl p-6 text-center border border-cyan-strong/20">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-strong block mb-4">Pembicara Utama</span>
                  
                  <div className="relative mx-auto size-24 overflow-hidden rounded-full border border-white/10 bg-slate-900 shadow-inner">
                    {seminar.speaker_image_url ? (
                      <Image
                        src={seminar.speaker_image_url}
                        alt={seminar.speaker || "Speaker"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User size={36} />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-foreground leading-snug">
                    {seminar.speaker?.split("—")[0]?.trim() || "Pembicara"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {seminar.speaker?.split("—")[1]?.trim() || ""}
                  </p>
                </div>

                {/* Logistics Card */}
                <div className="glass rounded-3xl p-6 space-y-4">
                  {seminar.scheduled_at && (
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="mt-0.5 text-cyan-strong shrink-0" />
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Waktu Acara</span>
                        <span className="text-xs font-semibold text-foreground">
                          {new Date(seminar.scheduled_at).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">
                          {new Date(seminar.scheduled_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB
                        </span>
                      </div>
                    </div>
                  )}

                  {seminar.location && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 text-cyan-strong shrink-0" />
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Lokasi</span>
                        <span className="text-xs font-semibold text-foreground leading-tight block">
                          {seminar.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
