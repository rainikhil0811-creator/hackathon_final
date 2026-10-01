# 🛒 DukaanSaathi — AI-Powered Inventory for Indian Shopkeepers

> **Hackathon Project** · Smart inventory management using Google Gemini AI (multimodal: image + voice)

![DukaanSaathi](https://img.shields.io/badge/DukaanSaathi-AI%20Inventory-6366f1?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase)

---

## 📖 What is DukaanSaathi?

**DukaanSaathi** ("Shop Friend" in Hindi) is a smart inventory management app built specifically for **Indian kirana/retail shopkeepers**. Instead of manually typing product details, shopkeepers can simply:

1. 📸 **Take a photo** of the product
2. 🎙️ **Speak a voice note** describing it (e.g. *"Parle-G, 12 pieces, 25 rupees, expiry next month"*)
3. 🤖 **Gemini AI** automatically fills in all the product details
4. ✅ Review, edit, and **save to inventory** in seconds

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Stock Entry** | Multimodal Gemini AI reads product photo + voice note to auto-fill inventory fields |
| 📦 **Inventory Management** | View, search, edit, and delete all products with animated UI |
| 🔔 **Expiry Alerts** | Tracks expired & expiring-soon items with bulk remove/dismiss actions |
| 📊 **Dashboard** | Live stats — total products, low stock, expiring soon, already expired |
| 🌙 **Dark / Light Mode** | System-aware theme with manual override |
| 🌐 **Multi-Language** | English, हिंदी, मराठी — full UI and AI transcription support |
| 🔐 **Auth** | Supabase Auth — Register shop, Sign in, with email verification |
| ✨ **Smooth Animations** | Framer Motion page transitions, micro-interactions, skeleton loaders |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **React Router v7** for navigation
- **Supabase JS** for database & auth
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** + **Express 5**
- **Google Gemini AI** (`gemini-2.0-flash`) — multimodal image + audio analysis
- **Multer** for file uploads
- **Supabase** for data persistence
- **dotenv** for config

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

---

### 1. Clone the repo

```bash
git clone https://github.com/rainikhil0811-creator/hackathon_final.git
cd hackathon_final
```

---

### 2. Set up Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MOCK_AI=true              # Set to false to use real Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 Get your Gemini API key free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

Start the backend:
```bash
npm start
# or for dev with auto-reload:
npm run dev
```

---

### 3. Set up Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

> 💡 Find these in your Supabase dashboard → Settings → API

Start the frontend:
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** 🎉

---

### 4. Set up Supabase Database

Run the migration SQL in your Supabase SQL editor:

```bash
# File: supabase/migrations/001_initial_schema.sql
```

Or copy-paste the contents of `supabase/migrations/001_initial_schema.sql` into your Supabase SQL editor and run it.

---

## 🎮 Demo Mode (No API keys needed)

Set `MOCK_AI=true` in `backend/.env` to run without a real Gemini API key. The AI will return randomized realistic product responses (chips, noodles, milk, etc.) for demo purposes.

---

## 📁 Project Structure

```
hackathon_final/
├── backend/
│   ├── index.js              # Express server + Gemini AI endpoint
│   ├── package.json
│   ├── .env                  # Backend secrets (not committed)
│   └── scripts/
│       └── migrate.js        # DB migration runner
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Stats + recent products
│   │   │   ├── AddStock.jsx      # AI Stock Entry (photo + voice)
│   │   │   ├── Inventory.jsx     # Full inventory table with edit/delete
│   │   │   ├── ExpiryAlerts.jsx  # Expired & expiring soon items
│   │   │   ├── Login.jsx         # Sign in + Register shop
│   │   │   └── Profile.jsx       # Language & theme settings
│   │   ├── components/
│   │   │   └── Layout.jsx        # Sidebar + page transitions
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   └── utils/
│   │       ├── supabase.js
│   │       └── translations.js   # EN / HI / MR translations
│   ├── .env                  # Frontend secrets (not committed)
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MOCK_AI` | Use mock responses instead of real Gemini | `true` |
| `GEMINI_API_KEY` | Google Gemini API key | — |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_API_URL` | Backend URL (default: `http://localhost:5000`) |

---

## 📸 How the AI Works

1. User uploads a product **image** (camera or gallery)
2. User records a **voice note** describing the product (optional)
3. Both are sent to the backend as `multipart/form-data`
4. Backend passes them to **Gemini 2.0 Flash** with a structured prompt
5. Gemini returns a JSON with: `product_name`, `brand`, `quantity`, `unit`, `price`, `expiry_date`, `confidence`
6. User reviews & edits the result, then saves to Supabase

---

## 🌐 Languages Supported

| Language | Code |
|---|---|
| English | `en` |
| हिंदी (Hindi) | `hi` |
| मराठी (Marathi) | `mr` |

Change language anytime from the **Profile** page.

---

## 👥 Team

Built with ❤️ for the hackathon by **Nikhil Rai**

---

## 📄 License

MIT License — feel free to use and modify for your own projects.

---

> *DukaanSaathi — Apni dukan, apna saathi* 🛒
