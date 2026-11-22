# Panduan Kontribusi Nawaetu 🙏

Terima kasih atas ketertarikan Anda untuk berkontribusi ke Nawaetu! Setiap kontribusi membantu kami membangun aplikasi habit ibadah yang lebih baik untuk Ummat.

## 📋 Tata Tertib (Code of Conduct)

Proyek ini mengikuti [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Dengan berpartisipasi dan berkontribusi, Anda diharapkan menjunjung tinggi standar dalam [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

- Kami berkomitmen untuk menjaga lingkungan komunitas yang inklusif, ramah, dan sehat.
- Hormati semua kontributor tanpa memandang latar belakang, identitas, atau tingkat pengalaman.
- Fokus pada umpan balik konstruktif, kualitas kode, dan kolaborasi profesional.
- Pelanggaran terhadap Code of Conduct dapat mengakibatkan penangguhan sementara atau permanen dari proyek.

---

## 🚀 Memulai (Getting Started)

### 1. Fork Repositori
Klik tombol **Fork** di sudut kanan atas halaman repositori GitHub.

### 2. Clone Lokal
```bash
git clone https://github.com/username-anda/nawaetu.git
cd nawaetu
```

### 3. Setup Lingkungan Pengembangan
Gunakan Node.js 24.x (versi pastinya ada di `.node-version`) dan npm.

```bash
# Install dependensi dari package-lock.json
npm ci

# Salin template variabel lingkungan
cp .env.example .env.local

# Jalankan server pengembangan lokal
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📝 Panduan Commit

Kami menerapkan aturan **Conventional Commits** untuk kejelasan dan pembaruan changelog otomatis:

```text
type(scope): subject

body (optional)

footer (optional)
```

### Tipe Commit yang Didukung:
- `feat`: Fitur baru (cth., `feat(tilawah): tambah kontrol pemutaran audio`)
- `fix`: Perbaikan bug (cth., `fix(qibla): atasi error kalibrasi kompas`)
- `docs`: Pembaruan dokumentasi (cth., `docs: update panduan kontribusi`)
- `style`: Formatting kode (tanpa perubahan logika)
- `refactor`: Restrukturisasi kode tanpa mengubah fungsi
- `perf`: Peningkatan performa
- `test`: Menambah atau memperbarui pengujian
- `chore`: Tugas pemeliharaan atau update dependensi
- `ci`: Perubahan alur kerja CI/CD
- `build`: Perubahan sistem build atau dependensi
- `revert`: Membatalkan commit sebelumnya

Husky mengecek setiap pesan commit dengan commitlint dan menjalankan `npm run lint` serta `npm run typecheck` sebelum setiap commit.

### Contoh Commit:
```bash
git commit -m "feat(missions): add new daily intention mission system"
git commit -m "fix(dhikr): resolve zen mode portal render issue"
git commit -m "docs: update contributing guidelines"
git commit -m "perf(quran): optimize surah static generation"
```

---

## 🔄 Alur Pull Request

1. **Sinkronkan branch Anda dengan `main`**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push ke Fork Anda**:
   ```bash
   git push origin feature/fitur-keren
   ```

3. **Buat Pull Request**:
   - Jelaskan perubahan Anda menggunakan [Template PR](.github/pull_request_template.md).
   - Referensikan issue terkait (`Closes #123`).
   - Lampirkan tangkapan layar atau rekaman visual untuk perubahan UI.
   - Pastikan semua pengecekan CI/CD lulus.

4. **Review & Feedback**:
   - Tanggapi komentar review dengan cepat.
   - Tambahkan commit baru ke branch fitur Anda bila diminta.
   - Jangan melakukan force-push pada riwayat review kecuali diminta.

5. **Merge**:
   - Commit dapat di-squash atas persetujuan maintainer.
   - Hapus branch fitur Anda setelah di-merge.

---

## 🐛 Bug Reports & 💡 Feature Requests

Sebelum membuat issue:
- Cari di [issue yang sudah ada](https://github.com/hadianr/nawaetu/issues) agar tidak duplikat.
- Pastikan masalahnya masih terjadi di versi terbaru branch `main`.
- Baca [dokumentasi](README.id.md).

### Mengirim Issue:
- **Bug Reports**: Gunakan [GitHub Bug Report Form](https://github.com/hadianr/nawaetu/issues/new?template=bug_report.yml).
- **Feature Requests**: Gunakan [GitHub Feature Request Form](https://github.com/hadianr/nawaetu/issues/new?template=feature_request.yml).

---

## 📚 Panduan Pengembangan

### Gaya Kode & Standar
- Gunakan **TypeScript** strict mode (`tsconfig.json`).
- Ikuti aturan **ESLint** (`npm run lint`).
- Jaga abstraksi komponen tetap rapi dan nama variabel yang deskriptif.

### Lokalisasi (Dua Bahasa)
- Selalu perbarui teks bahasa Inggris (`en`) dan Indonesia (`id`).
- Perbarui kamus terjemahan di `src/data/translations/`.
- Gunakan hook locale, jangan menulis teks statis langsung di komponen.

### Konten Agama
- Dalam teks yang ditulis Nawaetu sendiri, sebut Nabi secara lengkap sebagai "Nabi Muhammad SAW" (Indonesia) atau "Prophet Muhammad SAW" (Inggris), tidak memakai ligatur ﷺ atau "Nabi SAW" saja. `src/data/honorific.test.ts` menjaga aturan ini.
- Teks yang disalin dari sumber berlisensi seperti HadeethEnc dan QuranEnc tetap persis seperti aslinya.
- Lihat [AGENTS.md](AGENTS.md) untuk konvensi repositori selengkapnya.

### Tema & Styling
- Gunakan variabel CSS yang sudah ada: `text-[rgb(var(--color-primary))]`.
- Hindari warna HEX/RGB yang ditulis langsung di komponen.
- Uji perubahan UI di kelima tema: Daylight (bawaan), Emerald, Midnight, Sunset, dan Blossom.

---

## 🧪 Pengujian & Validasi

Jalankan pengecekan berikut sebelum mengirim PR:

```bash
# Jalankan unit & integration tests
npm run test:run

# Cek tipe TypeScript
npm run typecheck

# Jalankan linter
npm run lint

# Cek cakupan baris (CI mensyaratkan minimal 80%)
npm run test:coverage

# Validasi build produksi
npm run build
```

---

## 📦 Alur Rilis

Rilis dikelola oleh maintainer menggunakan script otomatis:
```bash
./scripts/release.sh v1.X.Y
```
Untuk panduan rilis lengkap, lihat [RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md).

---

## 🙋 Komunitas & Dukungan

- 💬 **Pertanyaan & ide**: [GitHub Issues](https://github.com/hadianr/nawaetu/issues)
- 🔒 **Pelaporan Keamanan**: [SECURITY.md](SECURITY.md)
- 📋 **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 📧 **Kontak**: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)

---

## 🙏 Terima Kasih!

Setiap kontribusi, dari perbaikan satu salah ketik sampai fitur besar, berarti bagi umat. Jazakallah khair atas dedikasi dan dukungan Anda!

*"Innama al-a'malu bin-niyyat" — Setiap amal tergantung pada niatnya. Semoga kontribusi Anda menjadi amal jariyah.*
