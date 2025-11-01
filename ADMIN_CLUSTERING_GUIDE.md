# Admin Dashboard - Clustering Guide

## Upload Data Kabupaten/Kota

Halaman Admin sekarang mendukung upload file Excel (.xlsx, .xls) dengan data agregat per Kabupaten/Kota untuk clustering K-Means.

### Format File Excel

File Excel harus memiliki kolom-kolom berikut (urutan boleh berbeda):

| Kolom                | Tipe Data | Keterangan                                 |
| -------------------- | --------- | ------------------------------------------ |
| Kabupaten/Kota       | Text      | Nama Kabupaten atau Kota                   |
| Freq_Total           | Number    | Total frekuensi gempa                      |
| Max_MMI              | Number    | MMI (Modified Mercalli Intensity) maksimal |
| Avg_MMI              | Number    | MMI rata-rata                              |
| pop_density          | Number    | Kepadatan populasi                         |
| sex_ratio            | Number    | Rasio jenis kelamin                        |
| vulnerable_age_ratio | Number    | Rasio usia rentan                          |
| poverty_ratio        | Number    | Rasio kemiskinan                           |
| disability_ratio     | Number    | Rasio disabilitas                          |

### Contoh Data

```
Kabupaten/Kota          Freq_Total  Max_MMI  Avg_MMI  pop_density  sex_ratio  vulnerable_age_ratio  poverty_ratio  disability_ratio
Kabupaten Bandung       73          4        3.03     6.45         105.4      79.89                 10.36          11.90
Kabupaten Bandung Barat 14          3        3        13.70        104.3      78.73                 10.49          10.64
Kabupaten Bekasi        1           3        3        25.41        103.2      64.33                 4.82           8.93
```

### Catatan Penting

1. **Pemisah Desimal**: Gunakan koma (,) atau titik (.) sebagai pemisah desimal. Sistem akan otomatis mengenali keduanya.
2. **Nama Kolom**: Nama kolom harus sama persis dengan yang tertera di tabel di atas. Kolom "Kabupaten/Kota" juga bisa ditulis sebagai "Kabupaten" atau "Kota".

3. **Jumlah Cluster (K)**: Tidak perlu ditentukan manual. Server akan otomatis menentukan jumlah cluster yang optimal berdasarkan data yang diunggah.

4. **Format File**: Hanya menerima file Excel (.xlsx atau .xls). File CSV tidak lagi didukung untuk clustering.

### Cara Penggunaan

1. **Download Template**:

   - Klik tombol "Download Template" untuk mendapatkan file Excel contoh
   - File template sudah berisi struktur kolom yang benar

2. **Isi Data**:

   - Buka file template di Excel atau Google Sheets
   - Isi data untuk setiap Kabupaten/Kota
   - Pastikan tidak ada baris kosong di tengah data

3. **Upload File**:

   - Klik area upload atau tombol "Select Excel File"
   - Pilih file Excel yang sudah diisi
   - Sistem akan validasi format dan menampilkan jumlah data yang berhasil dimuat

4. **Run Clustering**:
   - Setelah data dimuat, klik tombol "Run Clustering & Update Map"
   - Tunggu proses clustering selesai (ditandai dengan notifikasi sukses)
   - Hasil clustering otomatis tersimpan dan bisa dilihat di halaman Peta

### Troubleshooting

**Error: "Missing column: [nama_kolom]"**

- Pastikan semua kolom yang diperlukan ada di file Excel
- Periksa ejaan nama kolom (case-sensitive)

**Error: "File is empty or invalid"**

- File Excel mungkin kosong atau corrupt
- Coba download ulang template dan isi kembali

**Data tidak muncul di peta**

- Pastikan file GeoJSON Jawa Barat sudah tersedia
- Periksa console browser untuk error
- Refresh halaman peta setelah clustering selesai

### Technical Details

- **Library**: Menggunakan `xlsx` library untuk parsing file Excel
- **Storage**: Hasil clustering disimpan di localStorage dengan key "clusterGeoJSON"
- **API Endpoint**: `POST http://127.0.0.1:8000/cluster`
- **Response Format**: GeoJSON FeatureCollection

### Format Response dari Server

Server diharapkan mengembalikan response dalam format GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NAME_2": "Kabupaten Bandung",
        "cluster": 1,
        ...
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    },
    ...
  ]
}
```

Property `cluster` di setiap feature menentukan cluster mana kabupaten tersebut masuk.
