# 🔍 AI Debug Helper

<div align="center">

![AI Debug Helper](https://img.shields.io/badge/AI-Debug%20Helper-blueviolet?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/Version-1.0.0-success?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-7-orange?style=for-the-badge)
![Patterns](https://img.shields.io/badge/Patterns-80+-blue?style=for-the-badge)

**Catch AI-generated code bugs before they catch you!**

*A real-time code analyzer that detects hallucinations, security risks, and common mistakes in AI-generated code.*

[Live Demo](#) • [Features](#-features) • [Supported Languages](#-supported-languages) • [Getting Started](#-getting-started)

</div>

---

## 🎯 Why AI Debug Helper?

AI-generated code is powerful but often contains subtle bugs:

- 🤖 **Hallucinated methods** - APIs that don't exist (e.g., `Array.isEmpty()` in JavaScript)
- 🔐 **Security vulnerabilities** - Hardcoded secrets, SQL injection risks
- ⚠️ **Runtime errors** - Missing `await`, unhandled promises
- 📉 **Deprecated syntax** - Outdated patterns that will break

**AI Debug Helper catches these issues instantly!**

---

## ✨ Features

### 🔬 Real-Time Analysis
Paste your code and get instant feedback with line-by-line issue detection.

### 🌍 Multi-Language Support
Works with **7 programming languages** out of the box.

### 🎓 Educational Feedback
Each issue includes:
- ❓ **Why it matters** - Understand the problem
- 🔧 **Suggested fix** - One-click corrections
- 📍 **Line numbers** - Jump directly to issues

### 🧪 Built-in Test Suite
25 automated tests validate detection accuracy.

### 📊 Health Score
Visual indicator showing overall code quality.

---

## 🗣️ Supported Languages

| Language | Patterns | Key Detections |
|----------|----------|----------------|
| ![JS](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) | 16 | Hallucinated methods, missing await, loose equality |
| ![TS](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | 16 | Type issues, React security patterns |
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | 12 | Mutable defaults, missing self, deprecated APIs |
| ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) | 7 | Ignored errors, try/catch hallucination, panic usage |
| ![Rust](https://img.shields.io/badge/-Rust-000000?logo=rust&logoColor=white) | 8 | Excessive unwrap, unsafe blocks, lifetime issues |
| ![C++](https://img.shields.io/badge/-C++-00599C?logo=cplusplus&logoColor=white) | 11 | Memory leaks, buffer overflows, unsafe functions |
| ![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white) | 9 | String ==, resource leaks, generic exceptions |

---

## 🛡️ Detection Categories

### 🔴 Critical (Security & Runtime)
- Hardcoded API keys, tokens, passwords
- SQL injection vulnerabilities
- `eval()` usage
- Missing error handling
- Hallucinated methods/APIs

### 🟠 Warning (Logic & Deprecated)
- Off-by-one errors
- Mutable default arguments
- Deprecated functions
- Resource leaks

### 🔵 Info (Code Quality)
- Console statements
- TODO comments
- Style issues

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-debug-helper.git
cd ai-debug-helper

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📸 Screenshots

### Code Analysis View
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 AI Debug Helper                              [JS ▼]     │
├─────────────────────────────────────────────────────────────┤
│  SOURCE CODE                    │  ISSUES (3)               │
│                                 │                           │
│  1 │ const API_KEY = "sk-123"; │  🔴 CRITICAL Line 1       │
│  2 │ async function getData() { │     Hardcoded secret      │
│  3 │   const r = fetch(url);   │  🔴 CRITICAL Line 3       │
│  4 │   return r.json();        │     Missing await          │
│  5 │ }                         │  🔵 INFO Line 3            │
│                                 │     fetch without catch   │
├─────────────────────────────────────────────────────────────┤
│  HEALTH SCORE: ████████░░ 67%                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Suite

Run the built-in test suite to validate all patterns:

1. Click the **Test Suite** tab
2. Click **Run All Tests**
3. View results with pass/fail status

**25 tests covering:**
- ✅ JavaScript/TypeScript patterns
- ✅ Python patterns
- ✅ Go patterns
- ✅ Rust patterns
- ✅ C++ patterns
- ✅ Java patterns
- ✅ Language detection

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7
- **Editor**: @uiw/react-textarea-code-editor
- **Icons**: Lucide React
- **Styling**: Custom CSS with glassmorphism

---

## 📝 License

MIT License - feel free to use in your projects!

---

## 🤝 Contributing

Contributions are welcome! To add new patterns:

1. Edit `src/utils/patterns.ts`
2. Add your pattern to the appropriate language array
3. Add a test case in `src/components/TestSuite.tsx`
4. Submit a PR

---

## 🙏 Acknowledgments

Built to help developers catch AI-generated code bugs faster.

---

<div align="center">

**Made with ❤️ for developers who use AI coding assistants**

⭐ Star this repo if it helped you catch a bug!

</div>
