"use client"

import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import RegistrationsTab from "@/components/site/RegistrationsTab";
import CompetitionsTab from "@/components/site/CompetitionsTab";
import NewsTab from "@/components/site/NewsTab";
import SeminarsTab from "@/components/site/SeminarsTab";
import GroupLinksTab from "@/components/site/GroupLinksTab";
import WinnersTab from "@/components/site/WinnersTab";
import SiteSettingsTab from "@/components/site/SiteSettingsTab";
import UsersTab from "@/components/site/UsersTab";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


const AdminPage = () => {
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const isAllowed = role === "admin" || role === "lomba" || role === "petugas";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth");
      } else if (!isAllowed) {
        router.replace("/");
      }
    }
  }, [loading, user, isAllowed, router]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Memuat dashboard admin…
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  const defaultTab = role === "petugas" ? "news" : "reg";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <section className="pt-30 md:pt-32 pb-26 md:pb-30">
        <div className="mx-auto max-w-5xl px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">Admin</span> Dashboard
          </h1>

          <Tabs key={role} defaultValue={defaultTab} className="mt-10">
            <div className="glass px-2.5 py-2 rounded-2xl flex items-center w-full md:w-fit overflow-y-hidden overflow-x-auto">
              <TabsList className="bg-transparent border-0">
                {(role === "admin" || role === "lomba") && <TabsTrigger value="reg" className="p-4 cursor-pointer">Pendaftaran</TabsTrigger>}
                {(role === "admin" || role === "lomba") && <TabsTrigger value="comp" className="p-4 cursor-pointer">Lomba</TabsTrigger>}
                {(role === "admin" || role === "petugas") && <TabsTrigger value="news" className="p-4 cursor-pointer">Berita</TabsTrigger>}
                {(role === "admin" || role === "petugas") && <TabsTrigger value="sem" className="p-4 cursor-pointer">Seminar</TabsTrigger>}
                {(role === "admin" || role === "lomba") && <TabsTrigger value="groups" className="p-4 cursor-pointer">Grup</TabsTrigger>}
                {(role === "admin" || role === "lomba") && <TabsTrigger value="winners" className="p-4 cursor-pointer">Juara</TabsTrigger>}
                {role === "admin" && <TabsTrigger value="website" className="p-4 cursor-pointer">Website</TabsTrigger>}
                {role === "admin" && <TabsTrigger value="users" className="p-4 cursor-pointer">Pengguna</TabsTrigger>}
              </TabsList>
            </div>
            {(role === "admin" || role === "lomba") && <TabsContent value="reg" className="mt-6"><RegistrationsTab /></TabsContent>}
            {(role === "admin" || role === "lomba") && <TabsContent value="comp" className="mt-6"><CompetitionsTab /></TabsContent>}
            {(role === "admin" || role === "petugas") && <TabsContent value="news" className="mt-6"><NewsTab /></TabsContent>}
            {(role === "admin" || role === "petugas") && <TabsContent value="sem" className="mt-6"><SeminarsTab /></TabsContent>}
            {(role === "admin" || role === "lomba") && <TabsContent value="groups" className="mt-6"><GroupLinksTab /></TabsContent>}
            {(role === "admin" || role === "lomba") && <TabsContent value="winners" className="mt-6"><WinnersTab /></TabsContent>}
            {role === "admin" && <TabsContent value="website" className="mt-6"><SiteSettingsTab /></TabsContent>}
            {role === "admin" && <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>}
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    className={`animate-spin text-cyan-strong ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default AdminPage;
