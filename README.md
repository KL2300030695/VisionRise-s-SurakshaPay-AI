<p align="center">
  <img src="https://img.shields.io/badge/Guidewire-DEVTrails%202026-blue?style=for-the-badge" alt="DEVTrails 2026" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange?style=for-the-badge" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Genkit-1.x-purple?style=for-the-badge" alt="Genkit" />
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
| 🌫️ Air Quality (AQI) | > 400 | Severe |
| 🚫 Social Disruption | Curfew / Platform pause | Critical |

---

## 🧠 AI & ML Integration

### 1. Dynamic Premium Pricing (Genkit + Gemini 2.5 Flash)
- Analyzes historical weather, traffic, and disruption data per city
- Generates personalized weekly premiums based on persona + hyper-local risk
- Provides transparent risk factor breakdown and AI explanation

### 2. Intelligent Fraud Detection (AI Agent with Tools)
- **GPS Spoofing Detection**: Validates location logs against platform APIs
- **Duplicate Claim Prevention**: Cross-references claim windows per worker
- **Activity Validation**: Verifies worker was active during claimed disruption
- **Outcome**: Claims auto-approved or flagged with confidence score

### 3. AI Support Chat
- Natural language assistant for policy queries and help
- Powered by Gemini 2.5 Flash via Genkit flows

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, ShadCN UI |
| **Backend** | Next.js API Routes, MongoDB, Mongoose |
| **AI Orchestration** | Genkit 1.x |
| **AI Model** | Google Gemini 2.5 Flash |
| **Insurance Platform** | Guidewire Cloud (PolicyCenter + ClaimCenter) |
| **Weather Data** | Open-Meteo API (live, real-time) |
| **Deployment** | Firebase App Hosting |

---

## 📁 Project Structure

```
SurakshaPay-AI/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Landing page (hero, features, CTA)
│   │   ├── login/                # Worker authentication
│   │   ├── onboarding/           # 4-step onboarding wizard
│   │   ├── dashboard/            # Worker policy dashboard
│   │   ├── disruptions/          # Live weather & trigger monitoring
│   │   ├── admin/                # Insurer analytics dashboard
│   │   ├── chat/                 # AI support chat
│   │   └── api/                  # Backend API routes
│   │       ├── auth/             # Authentication endpoints
│   │       ├── onboarding/       # Policy creation + MongoDB persistence
│   │       ├── dashboard/        # Worker dashboard data
│   │       ├── weather/          # Live weather API integration
│   │       ├── disruptions/      # Parametric trigger processing
│   │       └── guidewire/        # Guidewire PolicyCenter & ClaimCenter
│   ├── ai/
│   │   ├── genkit.ts             # Genkit AI configuration
│   │   └── flows/
│   │       ├── ai-powered-premium-calculation.ts  # Dynamic pricing flow
│   │       ├── intelligent-fraud-detection.ts     # Fraud detection agent
│   │       └── support-chat-flow.ts               # AI chat assistant
│   ├── components/               # ShadCN UI components
│   ├── lib/                      # Utilities & parametric engine
│   ├── models/                   # MongoDB/Mongoose models
│   └── hooks/                    # React hooks
├── docs/                         # Documentation & blueprints
├── firestore.rules               # Firebase security rules
├── apphosting.yaml               # Firebase App Hosting config
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
- ✅ AI fraud detection (GPS spoofing, duplicate claims, activity validation)
- ✅ Insurer analytics dashboard (loss ratios, predictive alerts, portfolio breakdown)
- ✅ AI support chat with Gemini
- ✅ Simulated parametric trigger buttons for demo

---

## 💻 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **MongoDB** connection string
- **Google AI API Key** (for Gemini 2.5 Flash)

### Environment Setup

Create a `.env` file in the project root:

```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

### Installation & Running

```bash
# Install dependencies
npm install

# Run the development server (on port 9002)
npm run dev

# Run Genkit AI development server (optional, for testing flows)
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🖥️ Application Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Hero section, features overview, CTAs |
| **Login** | `/login` | Worker sign-in / registration |
| **Onboarding** | `/onboarding` | 4-step wizard: Info → Persona → AI Quote → Policy |
| **Dashboard** | `/dashboard` | Policy overview, payouts, weather alerts |
| **Live Triggers** | `/disruptions` | Real-time weather monitoring for 6 cities |
| **Admin** | `/admin` | Insurer analytics, fraud detection, simulations |
| **AI Chat** | `/chat` | Support assistant powered by Gemini |

---

## 🏆 Key Differentiators

1. **Zero-Touch Claims** — No forms, no calls, no waiting. Triggers are data-driven and instant.
2. **AI-Personalized Pricing** — Every worker gets a unique premium based on city, persona, and real risk data.
3. **Guidewire-Native** — Full PolicyCenter & ClaimCenter integration, not a bolt-on.
4. **Weekly Micro-Premiums** — Aligned with gig economy payout cycles (as low as ₹15/week).
5. **Fraud-Resistant** — AI agent with GPS spoofing detection and duplicate claim prevention.
6. **Live Data** — Real weather APIs, not simulated data. Triggers fire on actual conditions.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Developed for Guidewire DEVTrails 2026</b><br/>
  <i>Protecting India's gig workers, one week at a time.</i>
</p>