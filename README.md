# PayDrift — AI-Powered Spend Drift Intelligence

> **Your company is quietly bleeding money. PayDrift shows you where.**

PayDrift detects invisible cost drift across payroll, AI/LLM tools, and SaaS infrastructure — then uses AI to tell you exactly how to fix it.

---

## The Problem

Companies slowly overspend without realizing it across three major cost centers:

- **People** — Salaries creep up inconsistently, overtime balloons, contractors auto-renew at higher rates
- **AI/LLM Usage** — Teams spin up OpenAI, Claude, and Gemini API calls with zero visibility. Experimental pipelines keep running long after launch
- **SaaS & Cloud** — Unused seats, redundant tools, AWS bills that grow 15% every quarter with no explanation

Finance teams only notice when the quarterly budget is already blown.

## The Solution

PayDrift compares your spending **month-over-month** across every category, finds the changes you didn't notice, and uses AI to generate specific, dollar-backed recommendations.

### Key Features

- **Drift Detection Engine** — Compares recent 3 months vs prior 3 months across all cost categories. Finds the slow creep that spreadsheets miss.
- **AI CFO Advisor** — One-click analysis generates ranked recommendations with estimated savings, effort level, and timeline.
- **Month-over-Month Comparison** — Select any month from a dropdown and get AI-powered insights comparing it to the previous month.
- **Interactive Chat** — Ask follow-up questions like "Which department should we focus first?" or "What if we cut AI spend by 30%?"
- **Dynamic Data Upload** — Drag and drop your own CSV files to analyze your company's actual spend data.
- **Demo Mode** — Try instantly with pre-loaded realistic data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) + Recharts + Lucide Icons |
| **Backend** | FastAPI (Python) + Pandas |
| **AI Agent** | Anthropic Claude API via Dedalus Labs SDK |
| **Data** | CSV upload + Pandas processing |
| **Deployment** | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
paydrift/
├── backend/
│   ├── main.py              # FastAPI app — routes + CORS
│   ├── drift.py             # Drift detection engine (Pandas)
│   ├── agent.py             # AI agent — analysis + chat
│   ├── models.py            # Pydantic request/response models
│   ├── demo_data.py         # Load demo CSV datasets
│   ├── data/
│   │   ├── payroll.csv      # Demo payroll data
│   │   ├── ai_costs.csv     # Demo AI/LLM cost data
│   │   └── saas_cloud.csv   # Demo SaaS/cloud data
│   ├── requirements.txt
│   └── .env                 # API keys (not in repo)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Landing page + Dashboard + AI Chat
│   │   ├── services/
│   │   │   └── api.js       # Backend API client
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- API key from [Anthropic](https://console.anthropic.com) or [Dedalus Labs](https://www.dedaluslabs.ai/dashboard/api-keys)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
# or
DEDALUS_API_KEY=your-dedalus-key-here
```

Start the server:
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/drift` | Returns drift calculations for all 3 datasets |
| `POST` | `/api/analyze` | AI analyzes drift data, returns insights + recommendations |
| `POST` | `/api/chat` | AI answers follow-up questions with drift context |
| `POST` | `/api/upload` | Upload a CSV file to replace demo data |
| `POST` | `/api/reset` | Reset to demo data |
| `GET` | `/health` | Health check |

---

## How It Works

### Drift Detection

The engine splits data into two windows:
- **Before**: Average of the prior 3 months
- **After**: Average of the recent 3 months

For each group (department, AI service, SaaS tool), it calculates:
- Absolute drift ($ change)
- Percentage drift
- Sorts by largest impact first

### AI Analysis

The drift data is formatted into a clean text report and sent to Claude/Gemini with a CFO-advisor system prompt. The AI returns:
- **Analysis** — What happened and why (2-3 sentences)
- **Recommendations** — 5 ranked actions with savings estimates
- **Quick Win** — Easiest thing to do today
- **Risk Alert** — Most dangerous trend if left unchecked

### Chat

Follow-up questions include the full drift data in context, so the AI can answer specifics like "What if we cut AI spend by 30%?" with actual dollar projections.

---

## CSV Format

### Payroll (`payroll.csv`)
```
employee_id, name, department, role, band, type, month, base_salary, overtime, total
```

### AI/LLM Costs (`ai_costs.csv`)
```
team, service, model, month, api_calls, tokens_used, cost
```

### SaaS & Cloud (`saas_cloud.csv`)
```
service, category, month, total_seats, active_seats, monthly_cost
```

---

## Deployment

### Backend → Railway
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Set root directory to `backend`
3. Add API keys in Variables tab
4. Generate a public domain

### Frontend → Vercel
1. Connect GitHub repo at [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Framework: Vite, Output: `dist`
4. Update API URL in `App.jsx` to your Railway URL

