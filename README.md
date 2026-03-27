<p align="center">
  <img src="https://img.shields.io/badge/Guidewire-DEVTrails%202026-blue?style=for-the-badge" alt="DEVTrails 2026" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange?style=for-the-badge" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Theme-Premium%20Glass-8B5CF6?style=for-the-badge" alt="Premium Theme" />
</p>

# 🛡️ SurakshaPay AI

### AI-Powered Parametric Income Protection for India's Gig Economy

> **Built for Guidewire DEVTrails 2026** — SurakshaPay AI protects India's 300M+ gig delivery partners (Zomato, Swiggy, Zepto, Blinkit, Amazon, Flipkart, etc.) from **loss of income** due to weather, pollution, and social disruptions.

> 🔒 **GOLDEN RULE**: We insure **LOSS OF INCOME ONLY** — strictly excluding health, life, accident, or vehicle repair coverage, fully aligned with DEVTrails constraints.

---

## 🚨 The Problem

India's platform-based delivery partners lose **20–30% of their monthly earnings** when extreme weather, pollution, curfews, or sudden zone closures prevent them from working. Currently, there is **no structured safety net** for these uncontrollable events. Traditional insurance is too slow, too paper-heavy, and completely misaligned with the gig economy's pace.

## 💡 Our Solution

SurakshaPay AI provides a **weekly, parametric income protection layer**. Unlike traditional insurance, we don't require "claims filing." We use real-time data (weather, traffic, social signals) to detect disruptions. When a trigger is met (e.g., Rainfall > 8mm/hr), we **automatically initiate a claim and process a payout** for lost wages.

| | Traditional Insurance | SurakshaPay AI |
|---|---|---|
| **Premiums** | Monthly/annual | Weekly micro-premiums (₹15–₹40) |
| **Claims** | Manual filing & paperwork | Zero-touch parametric triggers |
| **Payout Speed** | Days to weeks | **4.2 min average** |
| **Pricing** | One-size-fits-all | AI-personalized per city & persona |
| **Data** | Historical only | Live weather + AI prediction |

---

## 🎯 Target Personas

| Persona | Platforms | Key Risk |
|---|---|---|
| 🏍️ **Food Delivery** | Zomato, Swiggy | Peak lunch/dinner rain |
| 🛒 **Grocery / Q-Commerce** | Zepto, Blinkit, Dunzo | Waterlogging, flash floods |
| 📦 **E-Commerce** | Amazon, Flipkart | Transit blockage, curfews |

---

## 👤 Persona-Based Scenarios

### Scenario 1: The Foodie in Mumbai (Zomato/Swiggy)
**Rahul** delivers food in Mumbai. During the monsoon, a sudden heavy rainstorm (>15mm/hr) causes severe waterlogging, making it impossible for him to ride for 4 hours.
- **SurakshaPay Action**: Parametric trigger detects "Heavy Rain" in Mumbai.
- **Result**: ₹500 is instantly credited to Rahul's UPI wallet for lost income, no claim form needed.

### Scenario 2: The Grocery Hero in Delhi (Zepto/Blinkit)
**Amit** works for Zepto in Delhi. A severe heatwave hits, with temperatures crossing 45°C. For safety, Amit stops working during the peak afternoon hours (12 PM - 4 PM).
- **SurakshaPay Action**: Parametric trigger detects "Extreme Heat" (>42°C).
- **Result**: Amit receives a notification and a ₹500 payout, protecting his daily wage.

---

## 📱 Platform Choice: Why Web?

For the Guidewire DEVTrails 2026, we have chosen a **Responsive Web App (Next.js)** for the following reasons:
1. **Zero Friction**: Gig workers don't need to download another heavy app. They can access SurakshaPay instantly via a link shared by their platform partner.
2. **Speed of Deployment**: Next.js allows for rapid iteration and seamless integration with Guidewire's cloud-native APIs.
3. **Cross-Platform**: Works perfectly on both Android (most common for riders) and iOS without separate codebases.
4. **Integration Ready**: Easy to embed as a "Micro-App" within existing platform partner apps (like Zomato/Swiggy rider apps).

---

## 🔄 End-to-End Workflow

```
1. ONBOARDING        → Worker selects persona + city, AI calculates weekly premium
2. ACTIVATION        → Worker pays weekly premium (e.g., ₹25) via UPI
3. MONITORING        → Parametric engine monitors live weather triggers
4. DETECTION         → Disruption event occurs (e.g., Flash flood in Mumbai)
5. ZERO-TOUCH PAYOUT → AI verifies event → ₹500 sent instantly to UPI wallet
```

---

## ⚡ Parametric Triggers

| Trigger | Threshold | Severity |
|---|---|---|
| 🌧️ Heavy Rainfall | > 8 mm/hr | High |
| 🌡️ Extreme Heat | > 42°C | Critical |
| 💨 High Wind | > 20 m/s | High |
| 🌫️ Air Quality ## 🧠 AI & ML Integration

### 1. Dynamic Premium Pricing (Genkit + Gemini 2.5 Flash)
- Analyzes historical weather, traffic, and disruption data per city.
- Generates personalized weekly premiums based on persona + hyper-local risk.
- Provides transparent risk factor breakdown with AI-driven explanations.

### 2. Premium Design System (next-themes + ShadCN)
- **Glassmorphism Aesthetic**: Modern, semi-transparent UI for a premium feel.
- **Dynamic Theming**: Seamless Dark/Light mode switching with system preference detection.
- **Animated Components**: Smooth transitions and interactive elements for enhanced UX.

### 3. Intelligent Fraud Detection (AI Agent with Tools)
- **GPS Spoofing Detection**: Validates location logs against platform APIs.
- **Duplicate Claim Prevention**: Cross-references claim windows per worker.
- **Activity Validation**: Verifies worker was active during claimed disruption.
- **Outcome**: Claims auto-approved or flagged with confidence scores.

### 4. AI Support Chat
- Natural language assistant for policy queries and real-time help.
- Powered by Gemini 2.5 Flash via Genkit flows.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, ShadCN UI |
| **Theme System** | `next-themes` (Dark/Light Mode, Glassmorphism) |
| **Backend** | Next.js API Routes |
| **Persistence** | **Firebase / Firestore** (Primary), MongoDB (Legacy/Archive) |
| **AI Orchestration** | Genkit 1.x |
| **AI Model** | Google Gemini 2.5 Flash |
| **Notifications** | Resend API |
| **Insurance Platform** | Guidewire Cloud (PolicyCenter + ClaimCenter) |
| **Weather Data** | Open-Meteo API (live, real-time) |
| **Deployment** | Firebase App Hosting |

---

## 📁 Project Structure

```
SurakshaPay-AI/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/               # Auth-guarded routes
│   │   ├── page.tsx              # Premium Landing page
│   │   ├── login/                # Glassmorphic Login
│   │   ├── register/             # Redesigned Registration
│   │   ├── onboarding/           # 4-step onboarding wizard
│   │   ├── dashboard/            # Worker policy dashboard
│   │   ├── disruptions/          # Live weather monitoring
│   │   ├── admin/                # Insurer analytics & simulations
│   │   ├── chat/                 # AI support chat
│   │   └── api/                  # Backend API routes (Auth, Weather, Guidewire)
│   ├── ai/                       # AI Orchestration (Genkit, Gemini)
│   │   ├── genkit.ts             # Genkit configuration
│   │   └── flows/                # AI Workflows (Pricing, Fraud, Chat)
│   ├── components/               # UI Components
│   │   ├── ui/                   # ShadCN base components
│   │   ├── theme-provider.tsx    # Theme management
│   │   └── theme-toggle.tsx      # Dark/Light mode switcher
│   ├── lib/                      # Business Logic & Services
│   │   ├── firebase.ts           # Firebase Initialization
│   │   ├── firestore-service.ts  # Universal Firestore CRUD
│   │   ├── parametric-engine.ts  # Core trigger logic
│   │   └── guidewire-api.ts      # Cloud integration
│   ├── models/                   # Legacy MongoDB schemas (Mongoose)
│   └── hooks/                    # Custom React hooks
├── public/                       # Static assets & AI images
├── firestore.rules               # Security rules for persistence layer
└── package.json
```

---

## 🗺️ Development Roadmap

### Phase 1 — Foundations ✅
- ✅ Persona-based onboarding (Food / Grocery / E-commerce)
- ✅ AI-powered weekly premium calculation (Gemini 2.5 Flash)
- ✅ Guidewire PolicyCenter integration
- ✅ MongoDB data persistence

### Phase 2 — Automation ✅
- ✅ Live weather monitoring (Open-Meteo API, 6 Indian cities)
- ✅ Parametric trigger engine (Rain, Heat, Wind, AQI thresholds)
- ✅ Zero-touch claim flow with Guidewire ClaimCenter sync
- ✅ Worker dashboard with live weather watch

### Phase 3 — Scale & Optimize ✅
- ✅ **Premium UI/UX**: Dark/Light mode & Glassmorphism implementation
- ✅ **Firebase Migration**: Transition to Firestore for real-time persistence
- ✅ **Redesigned Auth**: Enhanced security and premium login experience
- ✅ AI fraud detection (GPS spoofing, duplicate claims, activity validation)
- ✅ Insurer analytics dashboard (loss ratios, predictive alerts, portfolio breakdown)
- ✅ AI support chat with Gemini

---

## 💻 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Firebase Project** (with Firestore enabled)
- **Google AI API Key** (for Gemini 2.5 Flash)

### Environment Setup

Create a `.env.local` file in the project root:

```env
# AI
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Legacy (Optional)
MONGODB_URI=your_mongodb_connection_string
```

### Installation & Running

```bash
# Install dependencies
npm install

# Run the development server (on port 9002)
npm run dev

# Run Genkit AI development server (optional)
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## 🖥️ Application Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Premium Hero section, features, & CTAs |
| **Auth** | `/login`, `/register` | Redesigned Glassmorphic worker access |
| **Onboarding** | `/onboarding` | 4-step wizard: Info → Persona → AI Quote → Policy |
| **Dashboard** | `/dashboard` | Policy overview, payouts, & live weather watch |
| **Live Triggers** | `/disruptions` | Real-time weather monitoring for 6 Indian cities |
| **Admin** | `/admin` | Insurer analytics, fraud detection, & simulations |
| **AI Chat** | `/chat` | Support assistant powered by Gemini 2.5 Flash |

---

## 🏆 Key Differentiators

1. **Zero-Touch Claims** — No forms, no calls, no waiting. Triggers are data-driven and instant.
2. **AI-Personalized Pricing** — Every worker gets a unique premium based on city, persona, and real risk data.
3. **Premium UX** — Modern dark/light mode interface with glassmorphism for a high-end feel.
4. **Guidewire-Native** — Full PolicyCenter & ClaimCenter integration, not a bolt-on.
5. **Real-time Persistence** — Powered by Firestore for instant updates and reliability.
6. **Fraud-Resistant** — AI agent with GPS spoofing detection and duplicate claim prevention.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Developed for Guidewire DEVTrails 2026</b><br/>
  <i>Protecting India's gig workers, one week at a time.</i>
</p>