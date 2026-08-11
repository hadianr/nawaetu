# Contributing to Nawaetu 🙏

Thank you for your interest in contributing to Nawaetu! Every contribution helps us build a better spiritual habit tracker for the global Ummah.

## 📋 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating and contributing, you are expected to uphold the standards outlined in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

- We are committed to fostering an inclusive, welcoming, and healthy community environment.
- Respect all contributors regardless of their background, identity, or experience level.
- Focus on constructive feedback, code quality, and professional collaboration.
- Violations of the Code of Conduct may result in temporary or permanent suspension from the project.

---

## 🚀 Getting Started

### 1. Fork the Repository
Click the **Fork** button at the top right of the GitHub repository page.

### 2. Clone Locally
```bash
git clone https://github.com/your-username/nawaetu.git
cd nawaetu
```

### 3. Setup Development Environment
```bash
# Install dependencies
npm install

# Copy environment variable template
cp .env.example .env.local

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📝 Commit Guidelines

We enforce **Conventional Commits** for clarity and automated changelog generation:

```text
type(scope): subject

body (optional)

footer (optional)
```

### Supported Commit Types:
- `feat`: New feature (e.g., `feat(tilawah): add audio playback controls`)
- `fix`: Bug fix (e.g., `fix(qibla): resolve compass calibration error`)
- `docs`: Documentation updates (e.g., `docs: update setup instructions`)
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring without functional changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks or dependency updates
- `ci`: CI/CD workflow changes

### Example Commits:
```bash
git commit -m "feat(missions): add new daily intention mission system"
git commit -m "fix(dhikr): resolve OLED zen mode portal render issue"
git commit -m "docs: update contributing guidelines to English"
git commit -m "perf(quran): optimize surah static generation"
```

---

## 🔄 Pull Request Process

1. **Update your branch with `main`**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

3. **Create Pull Request**:
   - Provide a clear description of your changes using our [PR Template](.github/pull_request_template.md).
   - Reference related issues (`Closes #123`).
   - Include screenshots or visual recordings for UI changes.
   - Ensure all CI/CD checks pass.

4. **Review & Feedback**:
   - Respond to review comments promptly.
   - Push additional commits to your feature branch if requested.
   - Avoid force-pushing over existing review history unless requested.

5. **Merge**:
   - Squash commits if necessary upon maintainer approval.
   - Delete your feature branch after merging.

---

## 🐛 Bug Reports & 💡 Feature Requests

Before creating an issue:
- Search [existing issues](https://github.com/hadianr/nawaetu/issues) to avoid duplicates.
- Verify the issue on the latest `main` branch version.
- Review our [Documentation](README.md).

### Submitting Issues:
- **Bug Reports**: Please use our interactive [GitHub Bug Report Form](https://github.com/hadianr/nawaetu/issues/new?template=bug_report.yml).
- **Feature Requests**: Please use our interactive [GitHub Feature Request Form](https://github.com/hadianr/nawaetu/issues/new?template=feature_request.yml).

---

## 📚 Development Guidelines

### Code Style & Standards
- Use **TypeScript** strict mode (`tsconfig.json`).
- Follow **ESLint** rules (`npm run lint`).
- Maintain clean component abstractions and descriptive variable names.

### React Components
```tsx
// ✅ Recommended
interface UserProfileProps {
  userId: string;
}

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

### Localization (Bilingual Support)
- Always maintain both English (`en`) and Indonesian (`id`) translations.
- Update translation dictionaries under `src/data/` or component locale configs.
- Use locale hooks rather than hardcoding static text strings.

### Theming & Styling
- Use predefined CSS variables: `text-[rgb(var(--color-primary))]`.
- Avoid hardcoded HEX/RGB color values in components.
- Test UI changes across all 5 available theme options (Light, Dark, OLED, etc.).

---

## 🧪 Testing & Validation

We encourage running tests before submitting a PR:

```bash
# Run unit & integration tests
npm run test:run

# Run TypeScript type check
npm run typecheck

# Run linter
npm run lint

# Validate production build
npm run build
```

---

## 📦 Release Workflow

Releases are managed by maintainers using the automated script:
```bash
./scripts/release.sh v1.X.Y
```
For complete release instructions and CI deployment steps, refer to [RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md).

---

## 🙋 Community & Support

- 💬 **GitHub Discussions**: [Discussions Hub](https://github.com/hadianr/nawaetu/discussions)
- 🔒 **Security Reporting**: [SECURITY.md](SECURITY.md)
- 📋 **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 📧 **Direct Contact**: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)

---

## 🙏 Thank You!

Every contribution, whether a single typo fix or a major feature, makes a difference for the Ummah. Jazakallah Khair for your dedication and support!

*"Innama al-a'malu bin-niyyat" — Actions are judged by intentions. May your contributions bring lasting blessings.*
