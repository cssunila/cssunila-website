import { createClient } from "@/supabase/server";
import { ArrowLeft, Calendar, FolderOpen, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import NotFound from "@/components/site/NotFound";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

type NewsItem = {
  title: string;
  category: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
  drive_link: string | null;
  gallery: string[] | null;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  let news: NewsItem | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("title, content, image_url")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    news = data as NewsItem | null;
  } catch (error) {
    console.error("Failed to fetch news detail:", error);
  }

  if (!news) {
    return {
      title: "News Tidak Ditemukan",
    };
  }

  return {
    title: news.title,
    description: news.content,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      title: news.title,
      description: news.content ?? "",
      images: news.image_url ? [news.image_url] : [],
    },
  };
}


const NewsDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  let news: NewsItem | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("title, category, content, image_url, published_at, drive_link, gallery")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    news = data as NewsItem | null;
  } catch { }

  if (!news) return <NotFound />;

  let galleryImages: string[] = [];
  if (news.gallery) {
    try {
      galleryImages = Array.isArray(news.gallery) 
        ? news.gallery 
        : JSON.parse(JSON.stringify(news.gallery));
    } catch {
      galleryImages = [];
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <section className="pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/#berita"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <article className="mt-8">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {news.category && (
                  <span className="rounded-full bg-cyan-strong/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-strong">
                    {news.category}
                  </span>
                )}
                {news.published_at && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <time>
                      {new Date(news.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                )}
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl leading-tight text-foreground">
                {news.title}
              </h1>
            </header>

            {news.image_url && (
              <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                  src={news.image_url}
                  alt={news.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            <div className="glass mt-10 rounded-3xl p-6 md:p-10 leading-relaxed text-foreground/90 space-y-6 text-base sm:text-lg">
              <h2 className="text-muted-foreground mb-1 text-lg">Deskripsi</h2>
              {news.content?.split("\n").map((paragraph, index) => (
                <p key={index} className="text-justify text-muted-foreground">{paragraph}</p>
              ))}

              {news.drive_link && (
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <FolderOpen size={18} className="text-cyan-strong" />
                    <span>Berkas lampiran tersedia di Google Drive</span>
                  </div>
                  <Link
                    href={news.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hero hover:btn-hero-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap"
                  >
                    Buka Google Drive <ExternalLink size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Gallery Section */}
            {galleryImages && galleryImages.length > 0 && (
              <div className="mt-16 space-y-6">
                <h2 className="font-display text-2xl font-bold">Galeri Dokumentasi</h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {galleryImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 hover:border-cyan-strong/40 transition-colors shadow-lg cursor-pointer group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Galeri ${i + 1}`}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default NewsDetailPage;