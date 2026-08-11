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
```bash
# Install dependensi
npm install

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
   - Jangan melakukan force-push pada riwayat review kecuali diminta.

---

## 🐛 Bug Reports & 💡 Feature Requests

- **Bug Reports**: Gunakan [GitHub Bug Report Form](https://github.com/hadianr/nawaetu/issues/new?template=bug_report.yml).
- **Feature Requests**: Gunakan [GitHub Feature Request Form](https://github.com/hadianr/nawaetu/issues/new?template=feature_request.yml).

---

## 🧪 Pengujian & Validasi

```bash
# Jalankan unit & integration tests
npm run test:run

# Cek tipe TypeScript
npm run typecheck

# Jalankan linter
npm run lint

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

- 💬 **GitHub Discussions**: [Discussions Hub](https://github.com/hadianr/nawaetu/discussions)
- 🔒 **Pelaporan Keamanan**: [SECURITY.md](SECURITY.md)
- 📋 **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 📧 **Kontak**: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)

---

## 🙏 Terima Kasih!

*"Innama al-a'malu bin-niyyat" — Setiap amal tergantung pada niatnya. Semoga kontribusi Anda menjadi amalan jariyah.*
