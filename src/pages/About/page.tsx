import { Info, Map, Users } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="p-6 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="bg-white/15 border border-white/20 rounded-xl p-3">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Sistem Pemetaan Risiko Gempa Bumi
                </h1>
                <p className="mt-2 text-white/90 max-w-3xl">
                  WebGIS interaktif berbasis clustering dan indikator kerentanan sosial
                  untuk mendukung edukasi kebencanaan serta mitigasi bencana gempa bumi.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deskripsi */}
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-blue-900">Deskripsi</h2>
            <div className="mt-3 space-y-4 leading-relaxed text-gray-700">
              <p>
                Website ini merupakan hasil penelitian skripsi dengan judul
                “Rancang Bangun Sistem Pemetaan Risiko Gempa Bumi Berbasis
                Clustering dan Kerentanan Sosial Menggunakan Platform WebGIS”
                yang disusun oleh <span className="font-medium">Gustin Rheza Rasyidi N.A.</span> untuk
                memenuhi salah satu syarat kelulusan pada jenjang Sarjana
                Informatika di Universitas Islam Negeri Maulana Malik Ibrahim
                Malang.
              </p>
              <p>
                Sistem ini menampilkan informasi spasial dan deskriptif mengenai
                hasil analisis risiko gempa bumi di wilayah Indonesia dengan
                mengombinasikan data kejadian gempa yang dirasakan (BMKG) dan
                indikator kerentanan sosial. Analisis dilakukan menggunakan
                metode <span className="font-medium">K-Means Clustering</span> untuk mengelompokkan tingkat
                bahaya dan kerentanan wilayah, kemudian divisualisasikan melalui
                platform WebGIS interaktif.
              </p>
              <p>
                Pengembangan sistem ini bertujuan untuk menghadirkan peta risiko
                yang lebih dinamis, terbuka, dan mudah diakses, sehingga dapat
                mendukung proses edukasi kebencanaan serta menjadi bahan
                pertimbangan bagi pihak yang berkepentingan dalam upaya mitigasi
                bencana gempa bumi.
              </p>
            </div>
          </section>

          {/* Highlight / Ringkasan */}
          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-blue-900">Ringkasan</h3>
            <ul className="mt-3 space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Clustering menggunakan K-Means</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Data gempa dirasakan dari BMKG</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Indikator kerentanan sosial dari publikasi BPS</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Visualisasi WebGIS interaktif</span>
              </li>
            </ul>
          </aside>
        </div>

        {/* Sumber Data */}
        <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-blue-900">Sumber Data</h2>
          </div>

          <p className="mt-2 text-gray-700">
            Data yang digunakan terdiri dari dua kelompok utama, yaitu data gempa
            dirasakan dan data kerentanan sosial, yang masing-masing berperan
            dalam proses analisis dan pemetaan risiko.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-lg border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Map className="w-4 h-4" />
                <span>Data Gempa Dirasakan (BMKG)</span>
              </div>
              <p className="mt-2 text-gray-700 leading-relaxed">
                Mencakup waktu kejadian, kedalaman, lokasi episentrum, pusat
                gempa, nilai MMI maksimum, kota/provinsi terdampak, dan MMI
                wilayah terkait. Digunakan untuk menggambarkan tingkat aktivitas
                seismik dan dasar analisis clustering tingkat bahaya.
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Users className="w-4 h-4" />
                <span>Data Kerentanan Sosial (BPS)</span>
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                <li>
                  Kepadatan penduduk dan <em>rasio jenis kelamin</em> (2020)
                </li>
                <li>
                  Rasio umur rentan (kelompok umur per kabupaten/kota Jawa Barat)
                </li>
                <li>
                  Rasio penduduk miskin (persentase per kabupaten/kota, 2020)
                </li>
                <li>
                  Rasio penduduk disabilitas (Long Form SP 2020)
                </li>
              </ul>
              <p className="mt-2 text-gray-700">
                Seluruh indikator diolah menjadi parameter kuantitatif untuk
                pengelompokan wilayah (clustering) sehingga terbentuk peta
                prioritas mitigasi risiko gempa.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Page;