BreakThrough EliteNeurals

A React-based therapeutic AI chat application built with modern web technologies.

## Guide to run the project

### Prerequisites:
- Node.js (v18+ recommended)
- `npm` (or `pnpm`/`yarn`)

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Build for production:

```
npm run build
```

Preview production build:

```
npm run preview
```

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

That's all — the commands above are enough to run and build the app locally.

## Medical Compliance Features

### 🚫 AI Access Control
- **Doctor-Only AI**: AI Council accessible only to licensed doctors
- **Patient Protection**: Patients never see AI suggestions or interact with AI
- **Role-Based Authentication**: Strict separation between doctor and patient interfaces

### 🧠 AI Council (Doctor Decision Support)
- AI provides clinical insights, pattern recognition, and risk flags
- All AI responses include medical disclaimers
- Human-in-the-loop validation required
- Confidence scores and model versioning

### 📋 Compliance & Audit
- **Auto-Disclaimers**: All AI-assisted reports include mandatory medical disclaimers
- **Audit Logging**: Complete trail of AI usage and doctor interactions
- **Report Approval**: Doctor must approve and lock all final reports
- **Data Encryption**: Patient data tokenized and encrypted

### 🔐 Security Architecture
- Protected routes with role-based access control
- AI endpoints restricted to doctor authentication
- Compliance service enforces medical regulations
- Immutable audit trails for regulatory review

## Recent Updates
- Implemented medical-grade AI governance system
- Added role-based authentication (Doctor/Patient)
- Created compliance monitoring and audit trails
- Built AI Council for doctor-only clinical decision support
- Moved all project files to repository root for cleaner structure
- Updated README with clear run instructions and tech stack

