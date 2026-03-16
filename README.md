# SurakshaPay AI: Parametric Income Protection for India's Gig Economy

SurakshaPay AI is an **AI-powered parametric insurance platform** built for **Guidewire DEVTrails 2026**, designed to protect India’s gig delivery partners (Zomato, Swiggy, Zepto, Blinkit, Dunzo, Amazon, Flipkart, etc.) from **loss of income** due to external disruptions.

> 🔒 **GOLDEN RULE**: We insure **LOSS OF INCOME ONLY** — strictly excluding health, life, accident, or vehicle repair coverage, fully aligned with DEVTrails constraints.

---

## 🚨 1. Problem Statement & Strategy

### The Problem
India’s platform-based delivery partners lose **20–30% of their monthly earnings** when extreme weather, pollution, curfews, or sudden zone closures prevent them from working. Currently, there is **no structured safety net** for these uncontrollable events.

### Our Strategy
We provide a **weekly, parametric income protection layer**. Unlike traditional insurance, SurakshaPay AI doesn't require "claims filing." We use real-time data (weather, traffic, social signals) to detect disruptions. When a "trigger" is met (e.g., Rainfall > 10mm/hr), we automatically initiate a claim and process a payout for lost wages.

---

## 🎯 2. Persona & End-to-End Workflow

### Target Personas
- **Food Delivery**: Swiggy, Zomato partners (High risk: Peak lunch/dinner rain).
- **Grocery / Q-Commerce**: Zepto, Blinkit, Dunzo partners (High risk: Waterlogging).
- **E-Commerce**: Amazon, Flipkart partners (High risk: Transit blockage/curfews).

### End-to-End Workflow
1.  **Onboarding**: Worker selects their persona and city. AI calculates a **Weekly Premium** based on hyper-local risk.
2.  **Activation**: Worker pays the weekly premium (e.g., ₹25) to protect their next 7 days.
3.  **Monitoring**: Our parametric engine monitors real-time triggers in the worker's city.
4.  **Detection**: A disruption event occurs (e.g., Flash flood in Mumbai).
5.  **Zero-Touch Payout**: AI verifies the event and the worker's active status. A payout (e.g., ₹500) is sent instantly to their UPI wallet.

---

## 💰 3. Weekly Pricing & Parametric Triggers

### Weekly Premium Model
Gig workers operate on a weekly payout cycle. Our model matches this:
- **Premiums**: Paid every Monday.
- **Coverage**: Valid for 7 days.
- **Renewal**: Simple one-tap renewal via the dashboard.

### Parametric Triggers (Indicative)
- 🌧 **Environmental**: Rainfall > 10 mm/hr or Temperature > 45°C.
- 🌫 **Pollution**: AQI > 400 (Severe) for more than 4 hours.
- 🚫 **Social**: Government-mandated curfews or platform-wide "operations paused" status.

---

## 🧠 4. AI & ML Integration (Genkit + Gemini 2.5 Flash)

### Dynamic Pricing Engine
- **Logic**: Uses Gemini to analyze historical weather/disruption data for a specific city + persona.
- **Result**: Adjusts the weekly premium. (e.g., Monsoon season in Mumbai = slightly higher premium, higher coverage).

### Intelligent Fraud Detection
- **Anomaly Detection**: Gemini reasons through mock platform logs to catch GPS spoofing or fake weather reports.
- **Duplicate Prevention**: Logic ensures only one payout per worker per event window.
- **Outcome**: Claims are automatically "Approved" or "Flagged for Review" with a confidence score.

---

## 🏗️ 5. Tech Stack & Development Plan

### Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase Firestore (Data), Firebase Auth (Security).
- **AI Orchestration**: Genkit 1.x.
- **AI Model**: Google Gemini 2.5 Flash.

### Phased Roadmap
- **Phase 1 (Foundations)**: Onboarding, Weekly Pricing Logic, Idea Document.
- **Phase 2 (Automation)**: Parametric Trigger Engine, Zero-Touch Claim Flow.
- **Phase 3 (Scale & Optimize)**: AI Fraud Detection (GPS spoofing), Insurer Analytics Dashboard, Simulated Payouts.

---

## 💻 6. Technical Setup & Deployment

SurakshaPay AI is deployed as a **Web Application** to ensure universal access across Android and iOS devices without requiring an app store download—critical for gig workers with varying phone storage.

### Git Initialization Instructions
To push this project to your repository, run the following commands in your terminal:

```bash
git init
git add .
git commit -m "first commit: SurakshaPay AI Foundation"
git branch -M main
git remote add origin https://github.com/KL2300030695/SurakshaPay-AI.git
git push -u origin main
```

---
*Developed for Guidewire DEVTrails 2026.*