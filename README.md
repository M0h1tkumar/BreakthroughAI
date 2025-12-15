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

### 🚨 Emergency Features
- **Emergency Button**: Prominent red button on login page - no login required
- **GPS Location**: Auto-detects user coordinates for emergency response
- **Real-time Alerts**: Instant notifications to all active doctor dashboards
- **Emergency Details**: Collects situation description, location, and contact info
- **Multi-channel Response**: Alerts doctors, emergency services, and ambulance dispatch

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

## Key Features

### 📱 Patient Portal
- **Health Report Submission**: Voice input with multilingual support and English translation
- **Image Upload**: Photo capture for medical documentation
- **Specialist Assignment**: Automatic routing based on symptoms (heart→cardiologist, skin→dermatologist)
- **Appointment Booking**: Schedule consultations linked to health reports
- **Secure Data**: Tokenized patient information with encryption

### 👨‍⚕️ Doctor Dashboard
- **Patient Management**: Priority-based patient list with health reports and images
- **AI Diagnosis**: Clinical decision support with medical disclaimers
- **Prescription System**: Digital prescriptions sent to pharmacy and patient
- **Video Consultations**: Integrated video calling for remote consultations
- **Emergency Alerts**: Real-time emergency notifications with location and contact details

### 💊 Pharmacy Portal
- **Prescription Management**: Receive and process doctor prescriptions
- **Inventory Tracking**: Medicine stock management
- **Patient Communication**: WhatsApp integration for prescription notifications

## Recent Updates
- **🚨 Emergency System**: Added emergency button on login page with GPS location access and real-time doctor alerts
- **📱 Patient Health Reports**: Voice input (multilingual), image upload, automatic specialist assignment
- **👨‍⚕️ Doctor Dashboard**: Patient management, AI diagnosis, prescription system, emergency alerts
- **💊 Pharmacy Integration**: Prescription management linked to doctor prescriptions
- **📅 Appointment System**: Booking linked to health reports with calendar integration
- **🔐 Role-Based Authentication**: Doctor/Patient/Pharmacy dashboards with protected routes
- **🧠 AI Council**: Medical-grade AI governance with disclaimers and human validation
- **📊 Medical Reports**: Comprehensive reporting system with search and download

