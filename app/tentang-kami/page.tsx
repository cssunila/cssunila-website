import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Tentang Kami",
    description: "Sejarah CSS 3.0",
}

const TentangKami = () => {
    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <Navbar />

            <section className="relative isolate overflow-hidden pt-30 md:pt-32 pb-26 md:pb-30">
                <Image
                    src={"/css-logo.png"}
                    alt=""
                    aria-hidden
                    width={1920}
                    height={1088}
                    className="pointer-events-none absolute inset-0 -z-10 translate-y-8 h-full w-full object-cover opacity-40"
                />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-background/50 via-background/80 to-background" />

                <div className="mx-auto max-w-5xl px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft size={14} /> Kembali ke Beranda
                    </Link>
                    <h1 className="font-display text-shadow text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl md:mb-10 mb-6">
                        <span className="text-foreground">Computer</span>{" "}
                        <span className="gradient-text">Science 3.0 </span>
                    </h1>
                    <p className="text-muted-foreground mb-3 text-justify">
                        <span className="gradient-text">Computer Science Showdown 3.0 (CSS)</span> adalah kegiatan tahunan dalam rangka memperingati Dies Natalis Jurusan Ilmu Komputer FMIPA Universitas Lampung, yang pada tahun ini telah memasuki usia ke-13. Kegiatan ini telah diselenggarakan sejak tahun 2012, dan awalnya dikenal dengan nama PRJ (Pekan Raya Jurusan).
                    </p>
                    <p className="text-muted-foreground mb-3 text-justify">
                        Seiring dengan perkembangan zaman dan kebutuhan akan pembaruan konsep yang lebih relevan dengan bidang Ilmu Komputer, pada tahun 2024 PRJ resmi berganti nama menjadi <span className="gradient-text">CSS (Computer Science Showdown).</span> Pergantian nama ini membawa semangat baru dan nuansa yang lebih segar, dengan harapan mampu menjadi wadah yang lebih inspiratif dan modern bagi seluruh sivitas akademika.
                    </p>
                    <p className="text-muted-foreground mb-3 text-justify">
                        Setiap tahunnya, <span className="gradient-text">CSS</span> dimeriahkan dengan berbagai kompetisi di bidang teknologi maupun non-teknologi, serta penampilan kreatif dari mahasiswa Ilmu Komputer dalam acara puncak. Kegiatan ini menjadi ajang pengembangan potensi, unjuk kreativitas, serta mempererat solidaritas antar mahasiswa, siswa dan masyarakat umum.
                    </p>
                    <p className="text-muted-foreground mb-2 text-justify">
                        Pada tahun ini, <span className="gradient-text">CSS 3.0</span> mengusung tema &quot;Show Your Skill, Enjoy The Thrill&quot;, yang mencerminkan semangat untuk menunjukkan kemampuan terbaik sekaligus menikmati setiap tantangan yang ada. Melalui tema ini, <span className="gradient-text">CSS 3.0</span> diharapkan menjadi momentum bagi mahasiswa dan siswa untuk terus berkembang dan berani tampil dalam dunia yang penuh kompetisi dan inovasi.
                    </p>

                    {/* Penyelenggara */}
                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        <div className="glass-strong rounded-3xl p-8">
                            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sapphire to-cyan-strong">
                                <GraduationCap className="size-5 text-background" />
                            </span>
                            <h3 className="mt-5 font-display text-xl font-bold">
                                Penyelenggara
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Diselenggarakan oleh Himpunan Mahasiswa Ilmu Komputer (Himakom){" "}
                                <strong className="text-foreground">Universitas Lampung</strong>,
                                didukung penuh oleh Fakultas Matematika & Ilmu Pengetahuan Alam
                                serta jajaran alumni.
                            </p>
                        </div>
                        <div className="glass-strong rounded-3xl p-8">
                            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-strong to-sapphire">
                                <Users className="size-5 text-background" />
                            </span>
                            <h3 className="mt-5 font-display text-xl font-bold">
                                Untuk Siapa?
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Pelajar SMA/SMK sederajat, untuk mengasah kemampuan serta mencari pengalaman di dunia teknologi dan ingin
                                tumbuh bersama.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer marginTop={false} />
        </div>
    )
}

export default TentangKami;
