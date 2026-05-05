export const NAVBAR_CONTENT = {
  logo: "AyamSehat.AI",
  menu: [
    { label: "Beranda", target: "#beranda" },
    { label: "Fitur", target: "#fitur" },
    { label: "Cara Kerja", target: "#cara-kerja" },
    { label: "Tentang", target: "#tentang" },
  ],
};

export const HERO_CONTENT = {
  headline: "Deteksi Penyakit Ayam Lebih Cepat dan Akurat",
  subHeadline: "Unggah foto feses ayam dan dapatkan diagnosis penyakit secara otomatis menggunakan teknologi Vision Transformer (ViT)",
};

export const STATS_CONTENT = [
  { value: "4", label: "Kelas Penyakit Terdeteksi" },
  { value: "5.000+", label: "Data Latih" },
  { value: "98%", label: "Akurasi Tinggi (ViT)" },
];

export const FITUR_CONTENT = [
  {
    icon: "pi pi-camera",
    title: "Deteksi Otomatis",
    description: "Tidak perlu keahlian khusus, cukup foto feses ayam Anda.",
  },
  {
    icon: "pi pi-bolt",
    title: "Teknologi ViT",
    description: "Menggunakan Vision Transformer, model AI mutakhir untuk klasifikasi citra.",
  },
  {
    icon: "pi pi-clock",
    title: "Hasil Instan",
    description: "Dapatkan hasil diagnosis dalam hitungan detik beserta tingkat akurasi.",
  },
];

export const CARA_KERJA_CONTENT = [
  { number: "1", title: "Daftar Akun", description: "Buat akun gratis untuk mulai menggunakan sistem." },
  { number: "2", title: "Foto Feses Ayam", description: "Ambil foto feses ayam yang ingin didiagnosis." },
  { number: "3", title: "Unggah Gambar", description: "Unggah foto tersebut melalui dashboard sistem." },
  { number: "4", title: "Lihat Hasil", description: "Diagnosis penyakit akan muncul secara otomatis." },
];

export const PENYAKIT_CONTENT = [
  {
    name: "Healthy",
    status: "HEALTHY",
    severity: "success",
    description: "Feses normal dengan tekstur yang konsisten, tidak berair atau berlendir berlebih.",
  },
  {
    name: "Coccidiosis",
    status: "COCCIDIOSIS",
    severity: "danger",
    description: "Infeksi parasit Eimeria yang merusak usus, seringkali feses mengandung darah atau mukus.",
  },
  {
    name: "Newcastle Disease",
    status: "NEWCASTLE",
    severity: "warning",
    description: "Infeksi virus ND yang menyerang saraf dan pernapasan, feses biasanya berwarna kehijauan.",
  },
  {
    name: "Salmonella",
    status: "SALMONELLA",
    severity: "info",
    description: "Infeksi bakteri Salmonella, feses berwarna kekuningan atau putih (berak kapur).",
  },
];

export const FOOTER_CONTENT = {
  description: "Solusi cerdas berbasis AI untuk peternak ayam masa kini.",
  university: "Dikembangkan sebagai bagian dari penelitian skripsi Teknik Informatika Universitas Muhammadiyah Ponorogo",
  copyright: `Copyright © ${new Date().getFullYear()} AyamSehat.AI`,
};
