# Contributing to SplitFlow

Thank you for your interest in contributing to SplitFlow! We welcome contributions from developers of all skill levels.

---

## 🛠️ Development Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/your-username/splitflow.git
   cd splitflow
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🌿 Branching Strategy

- Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feat/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```
- Keep commits focused and use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add split by itemized receipt`
  - `fix: correct pairwise calculation on multi-payer splits`
  - `docs: update live exchange rates documentation`
  - `style: refine dark mode contrast tokens`

---

## 🧪 Testing & Validation

Before submitting a pull request, ensure the production bundle builds without errors:

```bash
npm run build
```

---

## 🚀 Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch.
3. Describe the problem your PR solves and attach screenshots or GIFs of any UI changes.
4. A maintainer will review your code promptly!

---

## 📄 License

By contributing to SplitFlow, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
