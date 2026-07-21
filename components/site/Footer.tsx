"use client"

import { Instagram, Youtube, Mail, ArrowUpRight, Map } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/supabase/client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const Footer = ({ marginTop = true }: { marginTop?: boolean }) => {
  const [lomba, setLomba] = useState<string[]>([]);
  const suparef = useRef(createClient());
  const [settings, setSettings] = useState<Record<string, string>>({
    site_logo: "/css-logo.png",
    site_title_main: "CSS",
    site_title_sub: "3.0",
  });

  useEffect(() => {
    (async () => {
      const supabase = suparef.current;

      const { data: compData } = await supabase.from('competitions').select("name");
      if (compData) {
        setLomba(compData.map(comp => comp.name));
      }

      const { data: setValues } = await supabase
        .from("site_settings")
        .select("id, value")
        .in("id", ["site_logo", "site_title_main", "site_title_sub"]);
      if (setValues && setValues.length > 0) {
        const map: Record<string, string> = {};
        setValues.forEach((item) => {
          map[item.id] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    })()
  }, []);

  return (
    <footer className={`relative ${marginTop ? 'mt-12' : ''} border-t border-border/60 pt-16 pb-10`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image src={"/himakom-logo.png"} width={80} height={80} alt={`logo himakom`} className="h-9 w-auto" />
              <Image src={settings.site_logo} width={80} height={80} alt={`${settings.site_title_main} ${settings.site_title_sub}`} className="h-9 w-auto" />
              <span className="font-display text-lg font-bold tracking-wider">
                {settings.site_title_main}<span className="gradient-text"> {settings.site_title_sub}</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Kegiatan perlombaan dan perayaan yang diselenggarakan oleh Himpunan Mahasiswa Jurusan Ilmu Komputer(Himakom), FMIPA, Universitas Lampung. CSS menghadirkan kompetisi di bidang teknologi maupun non-teknologi, yang dirancang sebagai ajang pengembangan potensi, kreativitas, dan kolaborasi bagi siswa, mahasiswa, serta peserta umum.
            </p>
            <div className="mt-5 flex gap-2">
              {[{icon: Instagram, url: "https://www.instagram.com/cssunila"}, {icon: Youtube, url: "https://www.youtube.com/@cssunila"}, {icon: Mail, url: "mailto:cssunila25@gmail.com?subject=Halo CSS"}].map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  aria-label="social"
                  rel="noopener noreferrer"
                  className="glass flex size-10 items-center justify-center rounded-full text-foreground/80 transition hover:text-cyan-strong"
                >
                  <item.icon size={16} />
                </Link>
              ))}
              <Link rel="noopener noreferrer" href={"https://www.tiktok.com/@css.himakom.unila"} className="glass flex size-10 items-center justify-center rounded-full text-foreground/80 transition hover:text-cyan-strong">
                <Image src={"/assets/tiktok.svg"} width={40} height={40} alt={`tiktok logo`} className="h-4 w-auto" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
              Lomba
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {lomba.length > 0 ?
                lomba.map((comp, idx) => (
                  <li key={idx} className="flex items-center gap-2 group"><ArrowUpRight size={14} className="group-hover:text-cyan-strong group-hover:translate-x-0.5 transition-all" /> <Link href="#lomba" className="group-hover:text-foreground">{comp}</Link></li>
                ))
                :
                <li><Link href="#lomba" className="hover:text-foreground">Belum tersedia</Link></li>
              }
            </ul>
          </div>

          <div>
            <h4 className="mb-1 font-display text-sm font-semibold uppercase tracking-wider">
              Kontak Kami
            </h4>
            <Link rel="noopener noreferrer" href="mailto:cssunila25@gmail.com?subject=Halo CSS" className="flex items-center gap-2 text-sm text-cyan-strong"><Mail size={16} /> cssunila25@gmail.com</Link>
            <p className="text-sm text-muted-foreground mt-4 mb-1">
              Jl. Prof.Dr. Ir. Sumatri Brojonegoro No.1 Gedong Meneng, Kec. Rajabasa, Kota Bandar Lampung, Indonesia
            </p>
            <Link rel="noopener noreferrer" href="https://maps.app.goo.gl/qtpKaZCQm6QrHE917" target="_blank" className="flex items-center gap-2 text-sm text-cyan-strong"><Map size={16} /> Gedung UKM FMIPA Unila</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 {settings.site_title_main} {settings.site_title_sub} — Computer Science Showdown. All rights reserved.</p>
          <p>Created With M. Rafly Saputra</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;