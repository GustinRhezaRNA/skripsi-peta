import { AlertTriangle, Map, Shield, BookOpen, Waves } from "lucide-react";
import { Button } from "../../components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50/60 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Edukasi Gempa Bumi & Mitigasi
                </h1>
                <p className="mt-3 text-white/90">
                  Pelajari langkah mitigasi sebelum, saat, dan setelah gempa.
                  Akses peta risiko untuk mengenali wilayah rawan dan rencana
                  kesiapsiagaan Anda.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="text-white" variant={"default"}>
                    <a href="/map" className="inline-flex items-center gap-2">
                      <Map className="w-4 h-4" /> Lihat Peta Risiko
                    </a>
                  </Button>
                  <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                    <a href="#mitigasi" className="inline-flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Panduan Mitigasi
                    </a>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                  <div className="text-white/80">Wilayah Terdampak</div>
                  <div className="mt-1 text-2xl font-semibold">Jawa Barat</div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                  <div className="text-white/80">Metode Analisis</div>
                  <div className="mt-1 text-2xl font-semibold">K-Means</div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                  <div className="text-white/80">Sumber Gempa</div>
                  <div className="mt-1 text-2xl font-semibold">BMKG</div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                  <div className="text-white/80">Kerentanan</div>
                  <div className="mt-1 text-2xl font-semibold">Data BPS</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </section>

        {/* Fakta Singkat */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: AlertTriangle,
              title: "Kenali Risiko",
              desc:
                "Setiap wilayah memiliki tingkat bahaya berbeda. Pahami sejarah gempa dan karakteristik lokal.",
            },
            {
              icon: Waves,
              title: "Waspada Tsunami",
              desc:
                "Di wilayah pesisir, gempa kuat berpotensi memicu tsunami.",
            },
            {
              icon: BookOpen,
              title: "Edukasi Keluarga",
              desc:
                "Siapkan tas siaga, rencana komunikasi, dan latihan evakuasi sederhana bersama keluarga.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{title}</h3>
                  <p className="mt-1 text-gray-700 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Mitigasi */}
        <section id="mitigasi" className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-900">
            Panduan Mitigasi Gempa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                phase: "Sebelum Gempa",
                tips: [
                  "Amankan perabot berat dan benda di atas",
                  "Siapkan tas siaga: P3K, senter, makanan, dokumen",
                  "Ketahui titik aman di rumah/kantor",
                ],
              },
              {
                phase: "Saat Gempa",
                tips: [
                  "Lindungi kepala, berlindung di bawah meja kokoh",
                  "Jauhi kaca/jendela dan benda yang bisa jatuh",
                  "Jika di luar, menjauh dari bangunan/tiang",
                ],
              },
              {
                phase: "Setelah Gempa",
                tips: [
                  "Evakuasi dengan tenang, cek kondisi keluarga",
                  "Waspada gempa susulan dan kebocoran gas",
                  "Ikuti informasi resmi dari BPBD/BMKG",
                ],
              },
            ].map(({ phase, tips }) => (
              <div
                key={phase}
                className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm"
              >
                <h3 className="font-semibold text-blue-900">{phase}</h3>
                <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                  {tips.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Cek Peta Risiko di Daerah Anda
            </h3>
            <p className="text-sm text-blue-900/80">
              Gunakan peta interaktif untuk memahami sebaran risiko dan prioritas
              mitigasi.
            </p>
          </div>
          <Button asChild>
            <a href="/map" className="inline-flex items-center gap-2">
              <Map className="w-4 h-4" /> Buka Peta GIS
            </a>
          </Button>
        </section>

        {/* Referensi */}
        <section className="pb-4">
          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-900">Referensi</h3>
            <ul className="mt-3 text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>BMKG – Informasi Guncangan dan MMI</li>
              <li>BPS Jawa Barat – Publikasi indikator sosial</li>
              <li>BPBD – Pedoman mitigasi bencana</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;