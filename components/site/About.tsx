import { ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type AboutProps = {
  title?: string;
  description?: string;
  highlights?: string[];
  logo?: string;
};

const DEFAULT_HIGHLIGHTS = [
  "Menambah pengalaman di CV",
  "Sertifikat Resmi",
  "Relasi Skill",
  "Hadiah uang tunai",
];

const About = ({ title, description, highlights, logo }: AboutProps) => {
  const aboutTitle = title || "Apa itu Computer Science Showdown 3.0?";
  const aboutDesc = description || `
  Dalam rangka Dies Natalis Jurusan, kami ingin mengadakan serangkaian acara besar yang bersifat pengembangan keilmuan sebagai refleksi dari Visi dan Misi FMIPA yang menuntut kami untuk selalu menjujung tinggi tentang penelitian. Dies Natalis Jurusan Ilmu Komputer ini juga merupakan momentum untuk memberikan kesempatan kepada para pelajar dan umum di luar sana.

  Maka melalui acara ini kami berupaya untuk mengoptimalkan kehidupan saintis dengan kreatifitas yang kaya akan imajinasi dalam memberikan terobosan - terobosan baru bagi perkembangan ilmu pengetahuan dan teknologi. Acara ini juga sebagai ajang motivasi bagi kami untuk menjadi lebih baik, dengan adanya tekad untuk maju dan terus memberikan manfaat bagi sivitas akademika Jurusan Ilmu Komputer khususnya dan sivitas akademika FMIPA Universitas Lampung.
  `;
  const aboutHighlights = (highlights && highlights.length > 0) ? highlights : DEFAULT_HIGHLIGHTS;
  const aboutLogo = logo || "/css-logo.png";

  return (
    <section id="about" className="relative isolate py-24">
      <Image
        src={"/assets/elektrik.png"}
        alt=""
        aria-hidden
        width={1920}
        height={1088}
        className="pointer-events-none animate-floating-smooth absolute inset-0 -z-10 h-full w-full object-cover opacity-80"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-linear-to-br from-sapphire/30 to-cyan-strong/20 blur-3xl" />
          <div className="glass-strong relative mx-auto flex aspect-square max-w-md items-center justify-center rounded-3xl p-10">
            <Image src={aboutLogo} width={200} height={400} alt="Logo CSS 3.0" className="w-full max-w-65" loading="eager" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-strong">
            <Sparkles size={14} /> Tentang CSS
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">{aboutTitle}</span>
          </h2>
          {aboutDesc.split("\n").map((desc, i) => (
            <p key={i} className="mt-5 text-muted-foreground text-justify">
              {desc}
              {i == aboutDesc.split("\n").length - 1 &&
                <Link href="/tentang-kami" className="ml-3 text-cyan-strong group inline-flex items-center gap-1">
                  Lihat selengkapnya
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 transition-all" />
                </Link>
              }
            </p>
          ))}

          <ul className="mt-6 flex justify-start flex-wrap gap-3 text-sm">
            {aboutHighlights.map((f) => (
              <li
                key={f}
                className="glass flex items-center gap-2 rounded-xl px-3 py-2.5"
              >
                <span className="size-1.5 border-2 shrink-0 rounded-full bg-cyan-strong shadow-[0_0_10px_var(--cyan-strong)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About;