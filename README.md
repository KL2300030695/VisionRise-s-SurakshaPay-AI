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
3. MONITORING        → Parametric engine monitors live weather triggers (5 sources)
4. DETECTION         → Disruption event occurs (e.g., Flash flood in Mumbai)
5. ZERO-TOUCH PAYOUT → AI verifies event → ₹500 sent instantly to UPI wallet
```

---

## ⚡ Parametric Triggers (5 Automated Sources)

SurakshaPay's zero-touch engine polls **5 disruption sources** (3 live APIs + 2 mock APIs) and automatically creates claims for affected workers.

| # | Trigger | Source | Threshold | Severity | Type |
|---|---|---|---|---|---|
| 1 | 🌧️ Heavy Rainfall | Open-Meteo Live API | > 8 mm/hr | High / Critical | 🟢 Live |
| 2 | 🌡️ Extreme Heat | Open-Meteo Live API | > 42°C | High / Critical | 🟢 Live |
| 3 | 🌫️ Poor Air Quality | Open-Meteo AQI API | > 400 Indian AQI | High / Critical | 🟢 Live |
| 4 | 🌊 Flood / Waterlogging | IMD Mock API | ≥ Orange Alert | High / Critical | 🟡 Mock |
| 5 | 🚫 Urban Curfew / Bandh | Civil Alert Mock API | ≥ High Severity | High / Critical | 🟡 Mock |

### Monitored Cities
Mumbai • Delhi • Bangalore • Hyderabad • Chennai • Kolkata

### How Auto-Scan Works
1. **Poll** all 5 disruption sources across 6 Indian cities
2. **Detect** threshold breaches (e.g., rainfall > 8mm/hr in Mumbai)
3. **Match** affected workers via active policies in Firestore
4. **Create** claims automatically (zero paperwork)
5. **Generate** UPI payout links for instant disbursement
6. **Sync** with Guidewire ClaimCenter for insurer records

---

## 🧠 AI & ML Integration

### 1. Dynamic Premium Pricing Engine (`SP-DPE-v2.1`)

A 5-factor ML-style pricing model that recalculates personalized weekly premiums:

| Factor | What It Does | Data Source |
|---|---|---|
| 🌧️ **Seasonal Risk** | City-specific monthly risk multipliers (e.g., Mumbai Jul = 1.50x) | Historical weather patterns |
| 🏘️ **Zone Safety Score** | Hyper-local risk scoring (waterlogging, heat, AQI, traffic) | Zone-level risk data per city |
| 🏅 **Claim History & Loyalty** | Discounts for low-claim workers, surcharges for high-frequency | Firestore claim records |
| 🌩️ **Predictive Forecast** | 7-day weather forecast risk adjustment | Open-Meteo Forecast API (live) |
| 🍕 **Persona Risk Weighting** | Food delivery (+₹0.5) vs E-commerce (−₹0.5) exposure | Persona selection |

**Result**: Premiums range from **₹10–₹40/week**, personalized per worker. Model confidence scores are displayed transparently.

### 2. AI-Powered Premium Calculation (Genkit + Gemini 2.5 Flash)
- Analyzes historical weather, traffic, and disruption data per city.
- Generates personalized weekly premiums based on persona + hyper-local risk.
- Provides transparent risk factor breakdown with AI-driven explanations.

### 3. Intelligent Fraud Detection (AI Agent with Tools)
- **GPS Spoofing Detection**: Validates location logs against platform APIs.
- **Duplicate Claim Prevention**: Cross-references claim windows per worker.
- **Activity Validation**: Verifies worker was active during claimed disruption.
- **Outcome**: Claims auto-approved or flagged with confidence scores.

### 4. AI Support Chat
- Natural language assistant for policy queries and real-time help.
- Powered by Gemini 2.5 Flash via Genkit flows.

### 5. Premium Design System (next-themes + ShadCN)
- **Glassmorphism Aesthetic**: Modern, semi-transparent UI for a premium feel.
- **Dynamic Theming**: Seamless Dark/Light mode switching with system preference detection.
- **Animated Components**: Smooth transitions and interactive elements for enhanced UX.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15.5, React 19, Tailwind CSS 3.4, ShadCN UI, Recharts |
| **Theme System** | `next-themes` (Dark/Light Mode, Glassmorphism) |
| **Backend** | Next.js API Routes (12 route groups) |
| **Persistence** | **Firebase / Firestore** (Primary), MongoDB/Mongoose (Legacy/Archive) |
| **AI Orchestration** | Genkit 1.28 |
| **AI Model** | Google Gemini 2.5 Flash |
| **Notifications** | Resend API |
| **Insurance Platform** | Guidewire Cloud (PolicyCenter + ClaimCenter) |
| **Weather Data** | Open-Meteo API (live weather + AQI + 7-day forecast) |
| **Payments** | UPI Deep Link Intent Generation |
| **Deployment** | Firebase App Hosting |

---

## 📁 Project Structure

```
SurakshaPay-AI/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Premium Landing page
│   │   ├── login/                    # Glassmorphic Login
│   │   ├── onboarding/              # 4-step onboarding wizard
│   │   ├── dashboard/               # Worker policy dashboard + live weather
│   │   ├── policy/                   # Policy management + AI dynamic pricing
│   │   ├── claims/                   # Claims management + auto-scan + pipeline
│   │   ├── disruptions/             # Live weather monitoring (6 cities)
│   │   ├── admin/                    # Insurer analytics & simulations
│   │   ├── chat/                     # AI support chat
│   │   └── api/                      # Backend API routes
│   │       ├── auth/                 # Authentication endpoints
│   │       ├── admin/                # Admin data endpoints
│   │       ├── admin-auth/           # Admin authentication
│   │       ├── claims/               # Claims CRUD + stimulation
│   │       │   └── stimulate/        # Manual claim stimulation
│   │       ├── dashboard/            # Dashboard data aggregation
│   │       ├── diag/                 # Diagnostics endpoint
│   │       ├── disruptions/          # Disruption event data
│   │       ├── guidewire/            # Guidewire PolicyCenter/ClaimCenter sync
│   │       ├── onboarding/           # Worker registration + policy creation
│   │       ├── premium/              # Dynamic premium recalculation
│   │       ├── triggers/             # Parametric trigger engine
│   │       │   └── auto-scan/        # Automated 5-source disruption scanner
│   │       └── weather/              # Live weather data endpoint
│   ├── ai/                           # AI Orchestration
│   │   ├── genkit.ts                 # Genkit configuration
│   │   ├── dev.ts                    # Development server
│   │   └── flows/                    # AI Workflows
│   │       ├── ai-powered-premium-calculation.ts
│   │       ├── intelligent-fraud-detection.ts
│   │       └── support-chat-flow.ts
│   ├── lib/                          # Business Logic & Services
│   │   ├── firebase.ts               # Firebase initialization
│   │   ├── firestore-service.ts      # Universal Firestore CRUD
│   │   ├── weather-service.ts        # Open-Meteo live weather + AQI
│   │   ├── parametric-engine.ts      # Core trigger threshold logic
│   │   ├── automated-trigger-service.ts  # 5-source auto-scan engine
│   │   ├── dynamic-pricing-engine.ts # ML-style 5-factor premium pricing
│   │   ├── mock-apis.ts             # IMD flood + civil disruption mock APIs
│   │   ├── upi-utils.ts             # UPI deep link payout generation
│   │   └── resend.ts                # Email notification service
│   ├── models/                       # Data Models
│   │   ├── GigWorker.ts
│   │   ├── InsurancePolicy.ts
│   │   ├── Claim.ts
│   │   ├── DisruptionEvent.ts
│   │   ├── Location.ts
│   │   ├── ParametricTriggerRule.ts
│   │   └── RiskProfile.ts
│   ├── components/                   # UI Components
│   │   ├── ui/                       # ShadCN base components
│   │   ├── report-issue-dialog.tsx   # Manual claim reporting
│   │   ├── theme-provider.tsx        # Theme management
│   │   └── theme-toggle.tsx          # Dark/Light mode switcher
│   └── hooks/                        # Custom React hooks
├── public/                           # Static assets & AI images
├── docs/                             # Project documentation
├── scripts/                          # Utility scripts
├── firestore.rules                   # Firestore security rules
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
- ✅ Live weather monitoring (Open-Meteo API + AQI, 6 Indian cities)
- ✅ Parametric trigger engine (Rain, Heat, Wind, AQI thresholds)
- ✅ **5 automated disruption sources** (3 live APIs + 2 mock APIs)
- ✅ Zero-touch claim flow with Guidewire ClaimCenter sync
- ✅ Automated UPI payout link generation
- ✅ Worker dashboard with live weather watch
- ✅ **Dynamic Pricing Engine (SP-DPE-v2.1)** — 5-factor ML-style premium adjustment
- ✅ **Policy Management page** with AI pricing breakdown
- ✅ **Claims Management page** with auto-scan & pipeline visualization
- ✅ IMD flood alert mock API (seasonal, probabilistic)
- ✅ Civil disruption alert mock API (bandh, protest, curfew)

### Phase 3 — Scale & Optimize ✅
- ✅ **Premium UI/UX**: Dark/Light mode & Glassmorphism implementation
- ✅ **Firebase Migration**: Transition to Firestore for real-time persistence
- ✅ **Redesigned Auth**: Enhanced security and premium login experience
- ✅ AI fraud detection (GPS spoofing, duplicate claims, activity validation)
- ✅ Insurer analytics dashboard (loss ratios, predictive alerts, portfolio breakdown)
- ✅ AI support chat with Gemini
- ✅ Manual claim reporting via Report Issue dialog

---

## 🖥️ Application Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Premium hero section, features, personas & CTAs |
| **Auth** | `/login` | Redesigned glassmorphic worker login |
| **Onboarding** | `/onboarding` | 4-step wizard: Info → Persona → AI Quote → Policy Activation |
| **Dashboard** | `/dashboard` | Policy overview, payouts, live weather watch & quick actions |
| **Policy** | `/policy` | Full policy details + AI dynamic pricing breakdown (5 factors) |
| **Claims** | `/claims` | Zero-touch pipeline visualization, auto-scan, claim history |
| **Live Triggers** | `/disruptions` | Real-time weather monitoring for 6 Indian cities |
| **Admin** | `/admin` | Insurer analytics, fraud detection & trigger simulations |
| **AI Chat** | `/chat` | Support assistant powered by Gemini 2.5 Flash |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth` | POST | Worker authentication |
| `/api/admin-auth` | POST | Admin authentication |
| `/api/onboarding` | POST | Worker registration + policy creation |
| `/api/dashboard` | GET | Dashboard data aggregation |
| `/api/claims` | GET | Fetch worker claims with stats |
| `/api/claims/stimulate` | POST | Manual claim stimulation for testing |
| `/api/triggers/auto-scan` | POST | Run 5-source automated disruption scan |
| `/api/premium/recalculate` | POST | AI dynamic premium recalculation |
| `/api/weather` | GET | Live weather data for all cities |
| `/api/disruptions` | GET | Disruption event data |
| `/api/guidewire` | POST | Guidewire PolicyCenter/ClaimCenter sync |
| `/api/admin` | GET | Admin analytics data |
| `/api/diag` | GET | System diagnostics |

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

## 🏆 Key Differentiators

1. **Zero-Touch Claims** — No forms, no calls, no waiting. 5 automated trigger sources drive instant claims.
2. **AI-Personalized Pricing** — Every worker gets a unique premium via the 5-factor Dynamic Pricing Engine (SP-DPE-v2.1).
3. **Premium UX** — Modern dark/light mode interface with glassmorphism for a high-end feel.
4. **Guidewire-Native** — Full PolicyCenter & ClaimCenter integration, not a bolt-on.
5. **Real-time Persistence** — Powered by Firestore for instant updates and reliability.
6. **Fraud-Resistant** — AI agent with GPS spoofing detection and duplicate claim prevention.
7. **UPI-First Payouts** — Deep link UPI intent generation for instant mobile disbursement.
8. **Transparent AI** — All pricing factors shown with confidence scores; no black-box decisions.

---

## 📊 Demo: Zero-Touch Flow

```
🌧️ Heavy Rain (12mm/hr) detected in Mumbai via Open-Meteo
       ↓
🔎 Auto-Scan finds 3 active policies in Mumbai
       ↓
📋 3 claims created automatically in Firestore
       ↓
🛡️ Synced to Guidewire ClaimCenter (GW-CLM-XXXXX)
       ↓
💰 UPI payout links generated (₹500 × 3 = ₹1,500)
       ↓
⏱️ Total time: 4.2 minutes (zero human intervention)
```

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Developed for Guidewire DEVTrails 2026</b><br/>
  <i>Protecting India's gig workers, one week at a time.</i>
</p>