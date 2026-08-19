/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowLeft,
  Users,
  Wallet,
  Trophy,
  CheckCircle2,
  Lock,
  Clock,
  Search,
  UserCheck,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { getIcon } from "@/lib/icons";
import { createClient } from "@/supabase/server";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { dateActive } from "@/lib/formatTanggal";
import ShareButton from "@/components/site/ShareButton";
import { Metadata } from "next";
import { DownloadPanduanButton, DaftarActionButton } from "@/components/site/LombaActions";
import parseDateRange from "@/lib/parseDate";
import { MapLocationView } from "@/components/site/Maps";

type Props = {
  params: Promise<{ slug: string }>;
};

type CompetitionData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string[];
  icon: string | null;
  accent: string | null;
  fee_idr: number;
  quota: number;
  team_size: string | null;
  is_open: boolean;
  pj_1: string;
  no_pj_1: string;
  pj_2: string;
  no_pj_2: string;
  banner: string;
  panduan: string;
  juara_1: string;
  juara_2: string;
  juara_3: string;
  is_multi_slot: boolean;
  rules: string[];
  timeline: { date: string; label: string }[];
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  location_type: string | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let comp: CompetitionData | null = null;
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_URL ?? "http://localhost:3000";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("competitions")
      .select("name, tagline, description, banner, icon")
      .eq("slug", slug)
      .maybeSingle();

    comp = data as unknown as CompetitionData | null;
  } catch (error) {
    console.error("Failed to fetch competition metadata:", error);
  }

  if (!comp) {
    return {
      title: "Lomba Tidak Ditemukan",
    };
  }

  const descStr = Array.isArray(comp.description)
    ? comp.description.join(" ")
    : comp.description ?? "";

  return {
    title: comp.name,
    description: descStr.slice(0, 160) || `Ikuti perlombaan ${comp.name} dalam event CSS UNILA 3.0.`,
    alternates: {
      canonical: `/lomba/${slug}`,
    },
    openGraph: {
      title: `${comp.name} – CSS UNILA 3.0`,
      description: descStr.slice(0, 200) || `Detail perlombaan ${comp.name} CSS UNILA 3.0.`,
      url: `${baseUrl}/lomba/${slug}`,
      images: comp.banner ? [{ url: comp.banner }] : [{ url: "/css-logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${comp.name} – CSS UNILA 3.0`,
      description: descStr.slice(0, 200),
      images: comp.banner ? [comp.banner] : ["/css-logo.png"],
    },
  };
}

type IconProps = {
  icon: string;
};

const DynamicIcon = ({ icon }: IconProps) => {
  const IconNew = getIcon(icon) as LucideIcon;
  return <IconNew size={36} className="text-cyan-strong" />;
};

const LombaDetail = async ({ params }: Props) => {
  const { slug } = await params;
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_URL ?? "http://localhost:3000";

  let c: CompetitionData | null = null;
  let pendaftarCount: number | null = null;

  try {
    const { data, error } = await supabase
      .from("competitions")
      .select(
        "id,slug,name,tagline,description,icon,accent,fee_idr,quota,team_size,is_open,rules,timeline,pj_1,no_pj_1,pj_2,no_pj_2,banner,juara_1,juara_2,juara_3,panduan,is_multi_slot,location_name,latitude,longitude,location_type"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const { data: register } = await supabase
        .from("registrations")
        .select("id")
        .eq("competition_id", data.id)
        .in("status", ["verified", "pending_verification"]);

      c = {
        ...(data as any),
        rules: Array.isArray(data.rules) ? (data.rules as string[]) : [],
        timeline: Array.isArray(data.timeline)
          ? (data.timeline as { date: string; label: string }[])
          : [],
      };

      if (register) pendaftarCount = register.length;
    }
  } catch (error) {
    console.error("Failed to fetch competition detail:", error);
  }

  if (!c) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <Search size={58} className="text-muted-foreground animate-floating-smooth" />
          <h1 className="text-4xl font-bold">Lomba tidak ditemukan</h1>
          <Link
            href="/#lomba"
            className="mt-3 inline-flex gap-2 items-center btn-hero rounded-lg px-4 py-3 text-black"
          >
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const currentUrl = `${baseUrl}/lomba/${slug}`;
  const date = parseDateRange(c.timeline.length > 0 ? c.timeline[0].date : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${c.name} – CSS UNILA 3.0`,
    startDate: date?.startDate || "",
    description: Array.isArray(c.description) ? c.description.join(" ") : "",
    url: currentUrl,
    image: c.banner || `${baseUrl}/css-logo.png`,
    offers: {
      "@type": "Offer",
      price: c.fee_idr,
      priceCurrency: "IDR",
    },
    organizer: {
      "@type": "Organization",
      name: "Himakom UNILA – CSS UNILA 3.0",
      url: baseUrl,
    },
    location: {
      "@type": "Place",
      name: "Universitas Lampung",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandar Lampung",
        addressRegion: "Lampung",
        addressCountry: "ID",
      },
    },
  };

  let activeIndex: number | undefined;
  c.timeline.forEach((item, index) => {
    const date = parseDateRange(item.date);
    if (dateActive(date?.startDate ?? "")) activeIndex = index;
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="relative pt-30 md:pt-32 pb-18 md:pb-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/#lomba"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} /> Kembali ke Beranda
            </Link>
            <ShareButton
              title={c.name}
              url={currentUrl}
              text={`Ayo daftar ${c.name}. Lihat detail lomba selengkapnya di: `}
            />
          </div>

          <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-center">
            {!c.is_open && (
              <span className="inline-flex md:hidden items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                <Lock size={10} /> Pendaftaran Ditutup
              </span>
            )}
            <div className="glass-strong flex shrink-0 size-20 items-center justify-center rounded-3xl">
              <DynamicIcon icon={c.icon ?? "Trophy"} />
            </div>
            <div>
              {!c.is_open && (
                <span className="hidden md:inline-flex items-center mb-2 gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  <Lock size={10} /> Pendaftaran Ditutup
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
                  {c.tagline}
                </span>
              </div>
              <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">
                {c.name}
              </h1>
            </div>
          </div>

          <div className="mt-8 max-w-5xl">
            {c.description.length > 0 &&
              c.description.map((text, i) => (
                <p key={i} className="text-lg text-muted-foreground mb-4 text-justify">
                  {text}
                </p>
              ))}
          </div>

          {c.quota > 0 && (pendaftarCount ?? 0) >= c.quota && (
            <div className="mt-8 max-w-5xl flex items-center justify-center rounded-2xl p-4 bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span className="text-lg font-medium uppercase tracking-widest animate-pulse">
                KUOTA PENDAFTARAN TELAH HABIS!
              </span>
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Wallet,
                label: "Biaya",
                value: `Rp ${c.fee_idr.toLocaleString("id-ID")}`,
              },
              {
                icon: Users,
                label: "Kuota",
                value: `${c.quota > 0 ? c.quota + " tim" : "Tidak ada batasan"}`,
              },
              { icon: Users, label: "Tim", value: c.team_size ?? "-" },
              { icon: UserCheck, label: "Pendaftar", value: pendaftarCount ?? "-" },

            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <s.icon size={14} /> {s.label}
                </div>
                <div className="mt-2 font-display text-base font-semibold">
                  {s.value}
                </div>
              </div>
            ))}
            {c.is_multi_slot && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Users size={14} /> Multi Slot
                </div>
                <div className="mt-2 font-display text-base font-semibold">
                  Tersedia
                </div>
              </div>
            )}
            {c.location_type === "online" && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <MapPin size={14} /> Lokasi
                </div>
                <div className="mt-2 font-display text-base font-semibold">
                  {c.location_name === "other" ? "Platform online" : c.location_name}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="S&K" className="py-12 pt-24">
        <div className="mx-auto grid max-w-5xl items-start gap-8 px-4 md:grid-cols-2">
          <div className="glass rounded-3xl p-7">
            <h2 className="font-display text-2xl font-bold">Syarat & Ketentuan</h2>
            <ul className="mt-5 space-y-3">
              {c.rules.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Belum ada syarat tersedia.
                </li>
              )}
              {c.rules.map((r) => (
                <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-cyan-strong"
                  />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative isolate p-7 min-h-96">
            <Image
              src={"/assets/banner_juara.png"}
              alt="Gambar Banner Juara"
              width={120}
              height={120}
              className="pointer-events-none animate-floating-smooth absolute top-2/3 -translate-y-1/2 left-1/2 -translate-x-1/2 -z-10 h-auto w-62 object-cover opacity-80"
            />

            <h2 className="font-display text-2xl font-bold mb-1">Penghargaan</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Pemenang dalam perlombaan {c.name} ini akan mendapatkan hadiah sebagai
              berikut
            </p>
            <div className="space-y-6 font-display">
              {c.juara_1 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-14 h-14">
                    <Image
                      src={"/assets/juara_1.png"}
                      alt="Gambar Juara 1"
                      width={200}
                      height={200}
                      className="object-cover absolute z-10 w-30 h-30 pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className="uppercase text-xs font-semibold font-display text-cyan-strong">
                      Juara 1
                    </p>
                    <span className="text-sm">{c.juara_1}</span>
                  </div>
                </div>
              )}
              {c.juara_2 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-14 h-14">
                    <Image
                      src={"/assets/juara_2.png"}
                      alt="Gambar Juara 2"
                      width={200}
                      height={200}
                      className="object-cover absolute z-10 w-22 h-22 pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className="uppercase text-xs font-semibold font-display text-cyan-strong">
                      Juara 2
                    </p>
                    <span className="text-sm">{c.juara_2}</span>
                  </div>
                </div>
              )}
              {c.juara_3 && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-14 h-14">
                    <Image
                      src={"/assets/juara_3.png"}
                      alt="Gambar Juara 3"
                      width={200}
                      height={200}
                      className="object-cover absolute z-10 w-22 h-22 pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className="uppercase text-xs font-semibold font-display text-cyan-strong">
                      Juara 3
                    </p>
                    <span className="text-sm">{c.juara_3}</span>
                  </div>
                </div>
              )}
              {!c.juara_1 && !c.juara_2 && !c.juara_3 && (
                <div className="flex border bg-background/30 backdrop-blur-sm rounded-2xl p-8 flex-col items-center justify-center gap-2 mt-12">
                  <Trophy size={48} className="text-muted-foreground" />
                  <h2 className="text-center tracking-tight text-muted-foreground w-4/5">
                    Penghargaan {c.name} belum ditentukan oleh panitia.
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <span className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-strong">
            <Clock size={14} /> Timeline Lomba
          </span>
          <h2 className="mt-3 font-display text-3xl text-center mb-10 font-bold sm:text-4xl">
            Timeline <span className="gradient-text">{c.name}</span>
          </h2>
          <div className="relative flex flex-col">
            {c.timeline.length > 0 && (
              <>
                <div className="absolute left-4 top-0 bottom-0 w-px bg-linear-to-b from-sapphire via-cyan-strong to-transparent md:left-1/2" />
                {c.timeline.map((item, i) => {
                  const date = parseDateRange(item.date);
                  return (
                    <div
                      key={`${item.label}-${i}`}
                      className="relative group mb-8 md:mb-12 w-full"
                    >
                      <span
                        className={`absolute left-4 top-6 size-4 -translate-x-1/2 rounded-full border-2 group-hover:scale-125 transition-all duration-300 border-cyan-strong ${activeIndex === i ? "animate-pulse" : ""} ${dateActive(date?.startDate ?? "") ? "bg-cyan-strong" : "bg-cyan-strong/60"
                          } shadow-[0_0_14px_var(--cyan-strong)] md:left-1/2`}
                        aria-hidden
                      />
                      <div
                        className={`glass group-hover:scale-105 ${activeIndex === i ? "animate-pulse" : ""} ${activeIndex === i ? "border! border-cyan-strong/60!" : ""} transition-all duration-300 ml-10 p-5 rounded-2xl md:ml-0 md:w-[calc(50%-2.5rem)] ${i % 2 === 0
                          ? "md:mr-auto md:text-right"
                          : "md:ml-auto md:text-left"
                          }`}
                      >
                        <div className="text-xs font-medium tracking-wider text-cyan-strong uppercase glass inline-flex justify-center items-center rounded-xl px-2.5 py-2">
                          {item.date}
                        </div>
                        <h3 className="mt-1 group-hover:text-cyan-strong transition-all duration-200 font-display text-xl font-semibold">
                          {item.label}
                        </h3>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            {c.timeline.length <= 0 && (
              <div className="max-w-lg mx-auto flex border bg-background/30 backdrop-blur-sm rounded-2xl p-8 flex-col items-center justify-center gap-3 mt-12">
                <Clock size={48} className="text-muted-foreground" />
                <h2 className="text-center tracking-tight text-muted-foreground w-4/5">
                  Timeline {c.name} belum ditentukan oleh panitia.
                </h2>
              </div>
            )}
          </div>
        </div>
      </section>

      {c.location_type === "offline" && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4">
            <MapLocationView
              locationName={c.location_name}
              latitude={c.latitude}
              longitude={c.longitude}
            />
          </div>
        </section>
      )}

      <section className="py-12">
        <div
          className={`mx-auto grid grid-cols-1 justify-center ${c.panduan ? "md:grid-cols-2" : ""
            } items-start max-w-5xl px-4 gap-8`}
        >
          <div
            className={`glass order-2 lg:order-1 rounded-3xl p-7 ${c.panduan ? "" : "max-w-lg mx-auto"
              }`}
          >
            <h2 className="font-display text-3xl font-bold mb-1">Narahubung</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Jika terdapat pertanyaan atau kendala pendaftaran terkait lomba. Silahkan
              hubungin narahubung {c.name}
            </p>
            <div className={`flex items-center flex-wrap gap-8`}>
              {c.pj_1 && (
                <Link
                  href={`https://wa.me/${c.no_pj_1.replace(/^0/, "62")}`}
                  className="flex shrink-0 items-center gap-3 group"
                >
                  <Image
                    src={"/assets/whatsapp.svg"}
                    width={30}
                    height={30}
                    alt="icon whatsapp"
                  />
                  <div>
                    <p className="font-semibold">{c.pj_1}</p>
                    <p className="text-sm text-muted-foreground group-hover:text-cyan-strong">
                      {c.no_pj_1}
                    </p>
                  </div>
                </Link>
              )}
              {c.pj_2 && (
                <Link
                  href={`https://wa.me/${c.no_pj_2.replace(/^0/, "62")}`}
                  className="flex shrink-0 items-center gap-3 group"
                >
                  <Image
                    src={"/assets/whatsapp.svg"}
                    width={30}
                    height={30}
                    alt="icon whatsapp"
                  />
                  <div>
                    <p className="font-semibold">{c.pj_2}</p>
                    <p className="text-sm text-muted-foreground group-hover:text-cyan-strong">
                      {c.no_pj_2}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
          {c.panduan && (
            <div className={`glass order-2 lg:order-1 rounded-3xl p-7`}>
              <h2 className="font-display text-3xl font-bold mb-1">Panduan Lomba</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Untuk teknis dan pelaksanaan lomba lebih lanjut. Silahkan unduh dan
                membaca terlebih dahulu buku panduan {c.name}
              </p>
              <DownloadPanduanButton panduanPath={c.panduan} slug={c.slug} />
            </div>
          )}
        </div>
      </section>

      {/* {c.banner && (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="flex justify-center group items-center">
              <Image
                src={c.banner}
                alt={`Logo banner ${c.name}`}
                preload
                width={120}
                height={120}
                className="pointer-events-none opacity-60 object-contain transition-all group-hover:scale-105 group-hover:animate-none w-auto rounded-lg shadow-[1px_1px_15px_rgba(0,0,0,0.2)] h-100 brightness-150 animate-floating-smooth"
              />
            </div>
          </div>
        </section>
      )} */}

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-10">
            <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 size-64 -translate-x-1/2 rounded-full bg-cyan-strong/30 blur-3xl" />
            <DaftarActionButton
              isOpen={c.is_open}
              isQuota={c.quota > 0 ? (pendaftarCount ?? 0) >= c.quota : null}
              slug={c.slug}
              currentUrl={currentUrl}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LombaDetail;