# 🏥 Smart Care Assistant

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/ManojK2K06/AidX.svg)]([https://github.com/ManojK2K06/AidX/graphs/contributors])
[![Issues](https://img.shields.io/github/issues/ManojK2K06/AidX.svg)](https://github.com/ManojK2K06/AidX/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/ManojK2K06/AidX.svg)](https://github.com/ManojK2K06/AidX/pulls)



## 📌 Overview


A smart assistant platform built for small clinics and junior doctors to streamline patient management, detect early warning signs, and improve care in fast-paced, resource-limited environments.

---

## 🚀 Features

### 👩‍⚕️ Doctor/Clinician Side

- Secure login and patient dashboard
- Quick entry of vitals, symptoms, prescriptions, and tasks during rounds
- Voice-to-text input and template-based options
- Auto-generated end-of-day summaries or handoff reports
- Smart alerts for critical symptoms and potential Adverse Drug Reactions (ADR)

### 🧑‍🦲 Patient Side

- Simple daily logging of symptoms and medication intake
- Visual trend tracking for symptoms and vitals
- Reminders for medication and logging
- ADR detection using rule-based or lightweight ML models

### 🌟 Bonus Features

- Auto-generated consultation/discharge reports
- Priority tagging for high-risk patients
- Clinical analytics dashboard

---

## 🧱 Tech Stack

| Layer              | Tech Used                                   |
| ------------------ | ------------------------------------------- |
| **Frontend**       | React.js, Tailwind CSS, Chart.js            |
| **Backend**        | Node.js, Express, Python (Flask for ML)     |
| **Database**       | MongoDB + Mongoose                          |
| **Authentication** | Firebase Auth / Auth0                       |
| **ML/ADR Logic**   | Scikit-learn / Rule-based engine            |
| **Mobile (Opt)**   | React Native + Expo                         |
| **Notifications**  | Firebase Cloud Messaging (FCM)              |
| **Deployment**     | Vercel (Frontend), Render/Railway (Backend) |

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/smart-care-assistant.git
cd smart-care-assistant

# Install server dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start the backend
cd ../backend
npm run dev

# Start the frontend
cd ../frontend
npm start
```
