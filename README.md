 VULSCAN LITE

> A passive web vulnerability scanner that instantly analyzes security headers, SSL certificates, and CMS configurations — giving your website a security health score.

  Live Demo
- **Frontend:** https://statuesque-pegasus-9328c5.netlify.app
- **Backend API:** https://vulnscan-lite-x5ut.onrender.com
- **API Docs:** https://vulnscan-lite-x5ut.onrender.com/docs

 Disclaimer
Only scan websites you own. This tool performs **passive analysis only** — no exploitation or aggressive probing.

---

 Features

- **Header Analysis** — Checks CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- **SSL/TLS Inspection** — Validates certificate, expiry date, cipher suite, TLS version
- **CMS Detection** — Detects WordPress, Drupal, Joomla, Wix, Shopify via meta tags & headers
- **Security Scoring** — 0–100 score with letter grade (A+ to F)
- **Remediation Tips** — Nginx fix snippets for every failed check
- **Scan History** — PostgreSQL-backed scan history
- **PDF Export** — Print-ready security report
- **Rate Limiting** — 5 scans/minute per IP

---

 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python, FastAPI |
| Database | PostgreSQL (Supabase) |
| Scanner | requests, BeautifulSoup, ssl |
| Queue | Celery + Redis |
| Deploy | Netlify (frontend), Render (backend) |

---

 Project Structure
vulnscan-lite/
├── backend/
│   └── app/
│       ├── scanner/
│       │   ├── headers.py      # Header analysis module
│       │   ├── ssl_check.py    # SSL/TLS inspection module
│       │   ├── cms.py          # CMS detection module
│       │   └── main_scan.py    # Master scanner
│       ├── main.py             # FastAPI app
│       ├── database.py         # PostgreSQL connection
│       ├── models.py           # SQLAlchemy models
│       └── requirements.txt
└── frontend/
└── src/
├── pages/
│   ├── ScanPage.jsx    # Scanner UI
│   └── ScanResult.jsx  # Results UI
└── App.jsx

---

  Scanning Logic

### Module 1 — Header Analysis
Checks 5 critical HTTP security headers:

| Header | Purpose | Score |
|---|---|---|
| Content-Security-Policy | Prevents XSS attacks | +10 / -10 |
| X-Frame-Options | Prevents clickjacking | +10 / -10 |
| Strict-Transport-Security | Forces HTTPS | +10 / -10 |
| X-Content-Type-Options | Prevents MIME sniffing | +10 / -10 |
| Referrer-Policy | Controls referrer info | +10 / -10 |

### Module 2 — SSL/TLS Inspection
- Connects via `ssl.create_default_context()`
- Checks certificate validity and expiry
- Grades: A+ (TLS 1.3, 60+ days) → F (expired/TLS 1.0)

### Module 3 — CMS Detection
Detects via:
1. `<meta name="generator">` tag
2. HTTP headers (`X-Powered-By`, `X-Generator`)
3. HTML patterns (`/wp-content/`, `/sites/default/`)

### Scoring Formula
Base Score   = 50
Header Score = +10 per present header, -10 per missing
SSL Bonus    = A+: +20, A: +15, B: +10, F: +0
CMS Penalty  = Outdated CMS: -10
Final        = min(100, max(0, base + headers + ssl + cms))

---

 Local Setup

### Backend
```bash
cd backend/app
pip install -r requirements.txt
# Create .env file with DATABASE_URL and SECRET_KEY
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/scan` | Trigger a scan |
| GET | `/api/scan/{id}/status` | Get scan result |
| GET | `/api/history` | Last 10 scans |
