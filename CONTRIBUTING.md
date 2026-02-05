# Contributing to Nawaetu 🙏

Terima kasih sudah tertarik berkontribusi ke Nawaetu! Setiap kontribusi membantu kami membangun aplikasi ibadah yang lebih baik.

## 📋 Code of Conduct

- Kami berkomitmen untuk menjaga lingkungan yang inklusif dan supportif
- Hormati semua kontributor apapun latar belakang mereka
- Fokus pada kualitas dan ide, bukan personal attacks
- Melanggar dapat hasil dalam removal dari project

## 🚀 Getting Started

### 1. Fork Repository
```bash
# Click "Fork" button di GitHub
```

### 2. Clone Local
```bash
git clone https://github.com/your-username/nawaetu.git
cd nawaetu
```

### 3. Setup Development Environment
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start dev server
npm run dev
```

## 📝 Commit Guidelines

Kami menggunakan **Conventional Commits** untuk clarity:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types:
- `feat`: Fitur baru
- `fix`: Bug fix
- `docs`: Dokumentasi
- `style`: Formatting (no code logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Menambah/update tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples:
```bash
git commit -m "feat(missions): add new daily mission system"
git commit -m "fix(qibla): resolve compass calibration issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor(tasbih): improve preset management"
```

## 🔄 Pull Request Process

1. **Update your branch dari main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

3. **Create Pull Request**
   - Jelas jelaskan apa yang Anda ubah
   - Referensi related issues (#123)
   - Include screenshots jika UI changes
   - Pastikan CI checks pass

4. **Review & Feedback**
   - Respond ke review comments
   - Push additional commits jika needed
   - Jangan force push ke branch

5. **Merge**
   - Squash commits jika diperlukan
   - Delete branch setelah merge

## 🐛 Bug Reports

### Sebelum membuat issue:
- Cek [existing issues](https://github.com/hadianr/nawaetu/issues)
- Test di latest version
- Cek [documentation](README.md)

### Format bug report:
```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. v1.1.0]
- Device: [e.g. iPhone 14, Desktop]
```

## 💡 Feature Requests

### Format:
```markdown
## Description
Clear description of the feature

## Motivation
Why is this useful? What problem does it solve?

## Proposed Solution
How would you implement this?

## Alternative Approaches
Other ways to solve this?

## Additional Context
Any other relevant information
```

## 📚 Development Guidelines

### Code Style
- Use **TypeScript** strict mode
- Follow **ESLint** rules
- Format with **Prettier**
- Use **meaningful variable names**

### Components
```tsx
// ✅ Good
export default function UserProfile({ userId }: UserProfileProps) {
  const { user } = useUser(userId);
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{user.name}</h2>
    </div>
  );
}

// ❌ Avoid
const UserProfile = (props: any) => {
  const u = useUser(props.id);
  return <div>...</div>;
};
```

### Translations
- Tambah text baru di `src/data/settings-translations.ts`
- Support kedua bahasa: Indonesian (id) dan English (en)
- Gunakan `useLocale()` hook di components

```typescript
// Example
const translations = {
  id: {
    myFeature: "Fitur Saya",
    myFeatureDesc: "Deskripsi fitur saya"
  },
  en: {
    myFeature: "My Feature",
    myFeatureDesc: "Description of my feature"
  }
};
```

### Theme Colors
- Gunakan CSS variables: `text-[rgb(var(--color-primary))]`
- Hindari hardcoded colors
- Test di semua themes (5 themes available)

### Performance
- Minimize bundle size
- Use lazy loading untuk components besar
- Optimize images
- Avoid unnecessary re-renders

## 🧪 Testing

Kami encourage tests untuk semua features:

```bash
# Run tests (when available)
npm test

# Build locally
npm run build

# Check TypeScript
npx tsc --noEmit
```

## 📦 Release Process

Hanya maintainers yang bisa melakukan release, tapi Anda bisa request:

1. Pastikan CHANGELOG.md updated
2. Update version di package.json
3. Create git tag `v*.*.*`
4. GitHub Actions otomatis create release

## 🙋 Questions?

- 💬 GitHub Discussions: [Discussions](https://github.com/hadianr/nawaetu/discussions)
- 📧 Email: [support@nawaetu.com](mailto:support@nawaetu.com)
- 📝 Issues: [GitHub Issues](https://github.com/hadianr/nawaetu/issues)

---

## 🙏 Terima Kasih!

Setiap kontribusi, sekecil apapun, membuat perbedaan. Jazakallah khair atas support Anda!

**"Innama al-a'malu bin-niyyat" - Dengan niat yang lurus, setiap kontribusi Anda bernilai.**
