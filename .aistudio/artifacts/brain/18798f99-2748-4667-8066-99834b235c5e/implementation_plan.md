# Tekstur Cat Dinding Ceria & Pemilih Tema Interior 3D

Rencana ini menghadirkan tekstur cat dinding 3D beresolusi tinggi yang ceria menggunakan mural geometris warna-warni pastel dan aksen hangat pada dinding utama, dipadukan dengan dinding pendamping berwarna pastel cerah bertekstur sapuan *roller* halus, serta dilengkapi kontrol pemilih tema cat dinding interaktif di dalam panel studio 3D.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain berikut telah diselaraskan dengan pilihan Anda untuk menciptakan suasana ruangan yang hidup, hangat, dan estetis tanpa mengganggu visibilitas perangkat IoT di dinding.

- **Gaya Motif & Tekstur Cat (Dikonfirmasi)**: Menggunakan **Mural Geometris Warna-Warni Pastel & Aksen Hangat** (lengkungan *arch* modern, blok warna koral lembut, kuning *sunshine* hangat, *mint* segar, dan biru langit pastel dengan tekstur mikro bulir cat *eggshell/matte*).
- **Komposisi Penerapan Dinding (Dikonfirmasi)**: Menggunakan **Kombinasi Dinding Aksen Bermotif & Dinding Warna Pastel Cerah** — dinding belakang (Utara) menampilkan mural geometris ceria yang membingkai area jendela dan perangkat HVAC, sedangkan dinding samping (Barat) menggunakan warna dasar pastel hangat yang senada dengan lis *wainscoting* halus.
- **Kontrol Pemilih Tema Dinding (Dikonfirmasi)**: Menyediakan **Pemilih Tema Warna & Motif Dinding** di panel kontrol Studio 3D agar pengguna dapat beralih antar beberapa palet dinding ceria secara *real-time*.

---

### 1. Overview & Core Concept

- **What It Does**: Menggantikan permukaan dinding polos dengan tekstur kanvas prosedural PBR (*albedo* + *bump/roughness* mikro) yang menampilkan komposisi mural geometris ceria serta menyediakan 5 pilihan tema cat dinding kurasi (*Pastel Fiesta*, *Tropical Sunrise*, *Mint & Coral*, *Berry & Lavender Pop*, dan *Warm Ochre*).
- **Target Audience / Persona**: Perancang ruang kerja modern, kafe pintar, ruang kreatif, dan manajer fasilitas yang menginginkan visualisasi *Digital Twin* 3D dengan atmosfer interior yang ramah, segar, dan inspiratif.
- **Key Value**: Menghidupkan suasana ruang 3D secara instan dengan karakter visual yang ceria dan realistis, sekaligus memungkinkan pengguna menyesuaikan palet interior agar serasi dengan fungsi ruangan.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Tampilan Default Ceria**: Saat ruangan 3D ditampilkan, dinding utama langsung menampilkan tekstur cat mural geometris pastel (*Pastel Fiesta*) dengan perpaduan bentuk lengkung organik, lingkaran matahari hangat, dan bidang diagonal lembut yang berpadu rapi dengan jendela kaca dan *baseboard*.
  2. **Pergantian Tema Cat Dinding Secara Langsung**: Pengguna membuka panel Studio 3D di sudut kanan atas kanvas, lalu memilih salah satu dari 5 kartu palet tema dinding ceria. Seluruh segmen dinding langsung memperbarui tekstur dan nuansa warnanya tanpa memuat ulang halaman.
  3. **Interaksi Cahaya & Tekstur Cat**: Saat pengguna mengubah sudut kamera atau mengganti preset pencahayaan, lampu dinding (*wall sconces*) dan cahaya matahari memantulkan tekstur mikro sapuan *roller* cat (*eggshell finish*) secara halus.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: *Vibrant Contemporary Interior & Playful Architectural Mural* — memadukan geometri modern ala studio kreatif dengan palet pastel hangat yang menenangkan mata.
  - *Color Palette & Mood*:
    - **Pastel Fiesta (Default)**: Krem hangat (`#FFFDF9`), Koral Persik (`#FFAD99`), Kuning Mentari (`#FFE082`), Hijau Mint (`#A7F3D0`), dan Biru Langit (`#BAE6FD`).
    - **Tropical Sunrise**: Kuning *Amber* Lembut (`#FEF08A`), *Terracotta* Cerah (`#FDBA74`), Merah Muda *Blush* (`#FECDD3`), dan Krem Tropis (`#FFFBEB`).
    - **Mint & Coral Studio**: Hijau *Sage/Mint* Cerah (`#D1FAE5`), Koral Hangat (`#FCA5A5`), Emas Pasir (`#FDE68A`), dan Putih Gading (`#FAF8F5`).
    - **Berry & Lavender Pop**: Ungu *Lilac* Pastel (`#E9D5FF`), Merah Muda Ceri Lembut (`#FBCFE8`), Biru *Periwinkle* (`#C7D2FE`), dan Kuning *Butter* (`#FEF9C3`).
    - **Warm Ochre**: Krim Arsitektural Cerah (`#FAF6F0`) dengan aksen pita geometris *Ochre* (`#FCD34D`) dan Biru *Teal* Lembut (`#99F6E4`).
  - *Typography & Hierarchy*: Pemilih tema di panel kontrol menampilkan pratinjau *swatch* multi-warna, nama tema satu baris yang ringkas, serta indikator aktif yang jelas.
- **Interactive Feedback & Motion**:
  - Efek *hover* halus pada pilihan palet cat dinding dan pembaruan material Three.js instan dengan *caching* tekstur agar transisi berjalan tanpa jeda.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Generator Tekstur Mural Prosedural Beresolusi Tinggi (1024×512) + Tekstur Mikro Plester/Roller**
  - *Chosen Approach*: Merender komposisi mural geometris (lengkungan, bidang diagonal, lingkaran aksen, dan garis batas artistik) beserta bintik mikro tekstur cat *roller* langsung di atas HTML5 Canvas 2D dan mengubahnya menjadi `THREE.CanvasTexture` dengan `SRGBColorSpace` dan `bumpMap` halus.
  - *Why*: Menghasilkan garis lengkung dan blok warna yang tajam dari dekat maupun jauh, memberikan kesan permukaan cat tembok asli, serta bebas dari ketergantungan file gambar eksternal.
  - *Alternatives Considered*: Membagi dinding menjadi puluhan potongan *mesh* terpisah — ditolak karena berisiko menimbulkan *Z-fighting* dengan perangkat IoT yang menempel di dinding.
- **Decision 2: Pemetaan Koordinat Tekstur Terpadu antara Dinding Aksen & Dinding Pendamping**
  - *Chosen Approach*: Menyediakan dua tekstur yang saling melengkapi untuk setiap tema — satu tekstur **Mural Geometris Aksen** untuk segmen dinding Utara (belakang) dan satu tekstur **Cat Pastel Dua-Nada (Two-Tone Wainscot)** dengan pita aksen horizontal untuk dinding Barat (samping pintu kaca).
  - *Why*: Kombinasi satu dinding fokus bermural penuh dengan dinding pendamping berwarna pastel senada membuat ruangan tampak ceria, dinamis, namun tetap harmonis.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Studio Pencahayaan & Interior HUD                    │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Pemilih Tema Cat Dinding Ceria (5 Palet Mural & Pastel)            │  │
│  │ • Pastel Fiesta │ Tropical Sunrise │ Mint & Coral │ Berry Pop ...  │  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ State: wallTheme
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   Procedural Wall Texture Engine                         │
│  ┌─────────────────────────────────┴──────────────────────────────────┐  │
│  │ • Accent Mural Canvas Generator (1024x512, SRGBColorSpace)         │  │
│  │   Menggambar pola Arch, Sun Circle, Color Blocks & Roller Grain    │  │
│  │ • Companion Pastel Wall Generator (512x512, Two-Tone + Trim Line)  │  │
│  │ • Micro-Stucco Bump & Roughness Map Generator (Eggshell Sheen)     │  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ Material Update
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     3D Room Architecture Meshes                          │
│  ├─ Dinding Utara (Belakang): Material Mural Geometris Pastel & Aksen    │
│  ├─ Dinding Barat (Samping): Material Cat Pastel Cerah Two-Tone          │
│  └─ Baseboard & Crown Molding: Warna Lis Kontras Bersih                  │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Menambahkan tipe `WallPaintTheme = 'pastel_fiesta' | 'tropical_sunrise' | 'mint_coral' | 'berry_pop' | 'warm_ochre'` ke dalam konfigurasi visual (`LightingConfig.wallTheme`) dengan nilai bawaan `'pastel_fiesta'`.
  - Menyimpan referensi `THREE.MeshStandardMaterial` untuk dinding aksen dan dinding pendamping di dalam scene 3D agar pergantian `wallTheme` langsung memperbarui peta tekstur secara efisien.
- **Interactive Component & State Mapping**:
  - Saat pengguna memilih tema cat dinding di panel kontrol, handler `onChange({ wallTheme })` memperbarui state `lightingConfig`.
  - Efek sinkronisasi di viewport 3D mengambil tekstur dari cache, memasangnya ke material dinding aksen dan dinding samping, lalu menandai material dengan `needsUpdate = true` untuk dirender seketika.
