# 🤖 Deadline Guardian AI

An AI-powered productivity companion that proactively helps users plan, prioritize, and complete their tasks before deadlines are missed — instead of relying on passive reminders that are easy to ignore.

---

## 📌 Problem Statement

Students, professionals, and entrepreneurs frequently miss deadlines, assignments, meetings, bill payments, interviews, and other important commitments. Existing productivity tools largely rely on passive reminders (a single notification at a fixed time) that are easy to dismiss and do little to actually help users complete their work on time.

There is a need for a system that goes beyond simple reminders — one that actively assesses risk, builds an actionable plan, and nudges the user with context-aware, personalized communication as the deadline approaches.

---

## 💡 Solution Overview

Deadline Guardian AI lets a user enter any deadline (assignment, interview, bill, meeting) along with a short description and the hours they can realistically dedicate per day. The system then:

1. Uses **Gemini AI** to analyze the task and generate a **risk score**, **risk level**, and a **day-by-day actionable plan**.
2. Stores the deadline, plan, and risk data in **Firestore**.
3. Runs an automated **n8n workflow** that periodically checks Firestore for deadlines approaching their reminder window.
4. Uses **Gemini AI again** to generate a **personalized, context-aware reminder email** (referencing the specific risk score and recommendation, not a generic template).
5. Sends the reminder via **Gmail**, and marks it as sent so the user is never spammed with duplicates.

This moves the experience from "a reminder fired" to "an AI that understands your situation and proactively pushes you toward completing your task."

---

## ✨ Key Features

- **AI Risk Assessment** — Every deadline is scored (0–100) with a risk level (Low / Moderate / High) and clear reasons behind the score.
- **AI-Generated Action Plan** — Gemini breaks down the task into a concrete "today's plan" so the user knows exactly what to do next.
- **Automated, Personalized Reminders** — An n8n workflow checks Firestore on a schedule and uses Gemini to write a unique, context-aware reminder email referencing the user's actual risk score and recommendation — not a static template.
- **Dashboard Overview** — At-a-glance stats: total deadlines, high risk, moderate risk, and completed tasks.
- **Mark Complete / Delete** — Users can manage their deadline list directly from the dashboard.
- **No Duplicate Reminders** — Once a reminder is sent, the system marks it so it never fires twice for the same deadline.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS |
| Database | Firebase Firestore |
| AI / LLM | Google Gemini API |
| Automation | n8n (Schedule Trigger, Firestore REST API, Gmail) |
| Email Delivery | Gmail (via n8n Gmail node) |
| Deployment | Google Cloud |

---

## 🧩 Architecture

```
User enters a deadline (Next.js UI)
        ↓
Gemini AI generates risk score + execution plan
        ↓
Data stored in Firestore (deadline, plan, risk, email, reminderTime)
        ↓
n8n Schedule Trigger runs periodically
        ↓
n8n queries Firestore for deadlines due for a reminder
        ↓
Gemini AI generates a personalized reminder message
        ↓
Gmail sends the reminder email
        ↓
Firestore is updated (reminderSent = true) to prevent duplicates
```

---

## 🖼️ Screenshots

> _Add screenshots of the dashboard, the AI plan output, and a sample reminder email here before submission._

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore enabled
- A Google Gemini API key
- An n8n instance (cloud or self-hosted)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/deadline-guardian-ai.git
cd deadline-guardian-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```
GEMINI_API_KEY=your_gemini_api_key
```
Firebase config is set directly in `lib/firebase.ts`. Replace the values there with your own Firebase project credentials.

### 4. Run the development server
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 5. Set up the n8n reminder workflow
1. Create a Firestore composite index on `reminderSent` (Ascending) and `reminderTime` (Ascending).
2. In n8n, build the workflow: Schedule Trigger → HTTP Request (Firestore `runQuery`) → Loop Over Items → IF (document exists) → Set (extract fields) → Gemini (generate message) → Gmail (send) → HTTP Request (PATCH `reminderSent: true`).
3. Connect Firestore using a Google OAuth2 / Service Account credential with the `https://www.googleapis.com/auth/datastore` scope.
4. Connect Gmail using OAuth2 in n8n.
5. Activate/Publish the workflow.

---

## 🚀 Future Scope

- **Telegram / WhatsApp reminders** alongside email, for instant mobile nudges.
- **Calendar integration** (Google Calendar) to auto-sync deadlines and reminder windows.
- **Voice-enabled assistance** for adding deadlines and checking status hands-free.
- **Adaptive reminder frequency** — increase reminder frequency automatically as risk score rises and the deadline nears.
- **Habit and goal tracking** beyond one-off deadlines, for recurring commitments.
- **Real-time webhook-based plan generation**, complementing the current scheduled workflow with instant AI feedback the moment a deadline is created.

---

## 👤 Author

Built as part of a hackathon submission focused on AI-powered productivity and proactive deadline management.