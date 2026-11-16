/**
 * Semua konten portofolio ada di file ini.
 * Tambah, hapus, atau ubah urutan card di array `cards` di bawah.
 *
 * Gambar disimpan di folder /public/images, lalu dipanggil dengan path "/images/nama-file.jpg".
 * `preview` (kotak kecil kiri bawah) boleh berupa gambar atau video .mp4.
 */

export type CardColors = {
  /** Warna latar halaman saat card ini aktif */
  background: string;
  /** Warna judul, garis kiri, titik navigasi, dan bingkai preview */
  accent: string;
  /** Warna teks deskripsi & header: "light" (putih) atau "dark" (hitam) */
  text: "light" | "dark";
};

export type CardDetail = { label: string; value: string };

export type Card = {
  slug: string;
  /** Nama pendek untuk tooltip titik navigasi (opsional, default: title) */
  label?: string;
  /** Teks kecil di atas judul (opsional) */
  eyebrow?: string;
  title: string;
  description: string;
  /** Gambar utama yang tampil di kolom WebGL */
  image: string;
  /** Gambar / video kecil di pojok kiri bawah (opsional) */
  preview?: string;
  colors: CardColors;
  /** Daftar info tambahan, cocok untuk card profil (opsional) */
  details?: CardDetail[];
  /** Tombol di bawah deskripsi (opsional) */
  cta?: { label: string; href: string };
};

export const site = {
  name: "Aufa Alfirdausi",
  title: "Aufa Alfirdausi — Portfolio",
  description: "Portofolio Aufa Alfirdausi",
  /** Tautan di pojok kanan atas */
  headerLink: { label: "Kontak", href: "mailto:aufalfirdausi@gmail.com" },
};

export const cards: Card[] = [
  {
    slug: "profil",
    label: "Profil",
    eyebrow: "Web & Mobile Developer",
    title: "Aufa Alfirdausi",
    description:
      "Halo! Saya developer yang suka membangun website dan aplikasi mobile yang rapi, cepat, dan enak dipakai.",
    image: "/images/profile.jpg",
    preview: "/images/profile-preview.jpg",
    colors: { background: "#3d6681", accent: "#d5dedd", text: "light" },
    details: [
      { label: "Tempat, Tgl Lahir", value: "Pagar Alam, 11 Desember 2007" },
      { label: "Domisili", value: "Aceh Besar, Indonesia" },
      { label: "Pendidikan", value: "SMkN5 TELKOM BANDA ACEH" },
      { label: "Email", value: "aufalfirdausi@gmail.com" },
    ],
    cta: { label: "Hubungi saya", href: "mailto:aufalfirdausi@gmail.com" },
  },
  {
    slug: "ai-orchestrator",
    label: "AI Orchestrator",
    eyebrow: "Personal AI Workflow",
    title: "AI Orchestrator",
    description:
      "Platform otomasi workflow AI lokal ala n8n: susun node secara visual, jalankan, dan pantau riwayatnya. Setiap hari otomatis membuat konten dengan berbagai style art untuk Telegram & Instagram.",
    image: "/images/ai-orchestrator.jpg",
    preview: "/images/ai-orchestrator-preview.jpg",
    colors: { background: "#121630", accent: "#8ea8ff", text: "light" },
    details: [
      { label: "Frontend", value: "Next.js · React Flow" },
      { label: "Backend", value: "Express · MySQL" },
      { label: "AI", value: "Gemini · Ollama" },
      { label: "Integrasi", value: "Telegram · Google Sheets" },
    ],
    cta: {
      label: "Lihat di GitHub",
      href: "https://github.com/aufalfirdausi/Automation-image-ai",
    },
  },
  {
    slug: "edugenzi",
    eyebrow: "Website Profil · Kursus Teknologi Anak",
    title: "Edugenzi",
    description:
      "Website profil kursus Coding, Desain, Robotik & Public Speaking untuk anak 6–18 tahun di Banda Aceh. Dilengkapi kuis minat & bakat yang hasilnya bisa diunduh sebagai PDF.",
    image: "/images/edugenzi.jpg",
    preview: "/images/edugenzi-preview.jpg",
    colors: { background: "#dde7cf", accent: "#2f7d22", text: "dark" },
    details: [
      { label: "Framework", value: "Next.js 16 · React 19" },
      { label: "Styling", value: "Tailwind CSS v4" },
      { label: "Rendering", value: "Server Components · SSG" },
      { label: "Fitur", value: "Kuis Minat & Bakat · PDF" },
    ],
    cta: {
      label: "Lihat di GitHub",
      href: "https://github.com/aufalfirdausi/edugenzi",
    },
  },
  {
    slug: "realtime-pos",
    title: "Kasir Realtime",
    description:
      "Aplikasi point of sales dengan pembaruan data secara realtime untuk usaha kecil dan menengah.",
    image: "/images/project-3.jpg",
    preview: "/images/project-3-preview.jpg",
    colors: { background: "#1c1c1e", accent: "#f5c249", text: "light" },
    cta: { label: "Lihat proyek", href: "#" },
  },
  {
    slug: "aufa-write",
    title: "Aufa Write",
    description:
      "Aplikasi catatan Android yang ringan dengan penyimpanan offline, dibuat dengan React Native.",
    image: "/images/project-4.jpg",
    preview: "/images/project-4-preview.jpg",
    colors: { background: "#dbe7de", accent: "#2f6b4f", text: "dark" },
    cta: { label: "Lihat proyek", href: "#" },
  },
  {
    slug: "tanstack-start",
    title: "Fullstack Lab",
    description:
      "Eksperimen aplikasi fullstack memakai TanStack Start, React Query, dan Prisma.",
    image: "/images/project-5.jpg",
    preview: "/images/project-5-preview.jpg",
    colors: { background: "#cfdff2", accent: "#ee7a62", text: "dark" },
    cta: { label: "Lihat proyek", href: "#" },
  },
];
