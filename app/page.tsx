import About from "@/components/site/About";
import Competitions from "@/components/site/Competitions";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Navbar from "@/components/site/Navbar";
import News from "@/components/site/News";
import Seminars from "@/components/site/Seminars";
import Sponsors from "@/components/site/Sponsors";
import Timeline from "@/components/site/Timeline";
import { createClient } from "@/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing Page",
}

export default async function Home() {
  let totalLomba = 4;
  let totalHadiah = "35Jt+";
  let totalPeserta = 0;

  let heroTagline: string | undefined;
  let heroSubtitle: string | undefined;
  let aboutTitle: string | undefined;
  let aboutDesc1: string | undefined;
  let aboutDesc2: string | undefined;
  let aboutHighlights: string[] | undefined;
  let siteLogo: string | undefined;
  let timelineItems: { start_date: string; end_date: string; label: string; description: string }[] | undefined;

  function formatCurrencyShort(value: number) {
    const num = Number(value);

    if (num >= 1_000_000_000) {
      return `${parseFloat((num / 1_000_000_000).toFixed(1))}B`;
    }

    if (num >= 1_000_000) {
      return `${parseFloat((num / 1_000_000).toFixed(1))}M`;
    }

    if (num >= 1_000) {
      return `${parseFloat((num / 1_000).toFixed(1))}k`;
    }

    return `${num}`;
  }

  try {
    const supabase = await createClient();

    const { data: comps } = await supabase.from("competitions").select("juara_1,juara_2,juara_3");
    if (comps) {
      totalLomba = comps.length;
      let totalPrizeValue = 0;
      comps.forEach((c) => {
        if (c.juara_1) {
          const clean = c.juara_1.replace(/[^0-9]/g, "");
          if (clean) totalPrizeValue += parseInt(clean, 10);
        }
        if (c.juara_2) {
          const clean = c.juara_2.replace(/[^0-9]/g, "");
          if (clean) totalPrizeValue += parseInt(clean, 10);
        }
        if (c.juara_3) {
          const clean = c.juara_3.replace(/[^0-9]/g, "");
          if (clean) totalPrizeValue += parseInt(clean, 10);
        }
      });
      totalHadiah = totalPrizeValue > 0 ? formatCurrencyShort(totalPrizeValue) : "0";
    }

    const { count } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified");
    if (count !== null) totalPeserta = count;

    const { data: settings } = await supabase
      .from("site_settings")
      .select("id, value");

    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.id] = s.value; });

      heroTagline = map["hero_tagline"] || undefined;
      heroSubtitle = map["hero_subtitle"] || undefined;
      aboutTitle = map["about_title"] || undefined;
      aboutDesc1 = map["about_description_1"] || undefined;
      aboutDesc2 = map["about_description_2"] || undefined;
      siteLogo = map["site_logo"] || undefined;

      if (map["about_highlights"]) {
        try {
          const parsed = JSON.parse(map["about_highlights"]);
          if (Array.isArray(parsed)) aboutHighlights = parsed;
        } catch { }
      }
    }

    const { data: tlItems } = await supabase
      .from("timeline_items")
      .select("start_date, end_date, label, description")
      .order("position", { ascending: true });

    if (tlItems && tlItems.length > 0) {
      timelineItems = tlItems;
    }
  } catch { }

  const visibility = {
    lomba: true,
    berita: true,
    seminar: true,
    juara: true,
  };

  try {
    const supabase = await createClient();
    const { data: visData } = await supabase
      .from("page_visibility")
      .select("id, is_visible");
    if (visData) {
      visData.forEach((row) => {
        if (row.id === "lomba") visibility.lomba = row.is_visible;
        if (row.id === "berita") visibility.berita = row.is_visible;
        if (row.id === "seminar") visibility.seminar = row.is_visible;
        if (row.id === "juara") visibility.juara = row.is_visible;
      });
    }
  } catch { }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero
          totalLomba={totalLomba}
          totalHadiah={totalHadiah}
          totalPeserta={totalPeserta}
          tagline={heroTagline}
          subtitle={heroSubtitle}
        />
        <About
          title={aboutTitle}
          description1={aboutDesc1}
          description2={aboutDesc2}
          highlights={aboutHighlights}
          logo={siteLogo}
        />
        <Timeline items={timelineItems} />
        {visibility.lomba && <Competitions />}
        {visibility.berita && <News />}
        {visibility.seminar && <Seminars />}
        <Sponsors />
      </main>
      <Footer />
    </div>
  );
}