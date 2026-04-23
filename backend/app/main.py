from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
import uuid, json

from database import engine, get_db, Base
from models import ScanHistory

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title       = "VulnScan Lite API",
    description = "Passive web vulnerability scanner",
    version     = "1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["http://localhost:3000", "http://localhost:3002"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

class ScanRequest(BaseModel):
    url: str


@app.get("/", tags=["Health"])
def root():
    """API health check"""
    return {"status": "ok", "message": "VulnScan API is running!"}


@app.post("/api/scan", tags=["Scanner"])
@limiter.limit("5/minute")
def start_scan(request: Request, body: ScanRequest, db: Session = Depends(get_db)):
    """Trigger scan — tries Celery async first, falls back to sync"""

    scan_id = str(uuid.uuid4())

    try:
        # Try Celery async first
        try:
            from celery_worker import scan_task
            task   = scan_task.delay(body.url)
            result = task.get(timeout=30)
        except Exception:
            # Celery not available — run sync directly
            from scanner.main_scan import run_full_scan
            result = run_full_scan(body.url)

        # Save to PostgreSQL
        scan = ScanHistory(
            id          = scan_id,
            url         = body.url,
            score       = result["score"],
            grade       = result["grade"],
            result_json = json.dumps(result)
        )
        db.add(scan)
        db.commit()

        return {
            "scan_id" : scan_id,
            "status"  : "complete",
            "result"  : result
        }

    except Exception as e:
        return {"scan_id": scan_id, "status": "error", "error": str(e)}


@app.get("/api/scan/{scan_id}/status", tags=["Scanner"])
def get_status(scan_id: str, db: Session = Depends(get_db)):
    """Fetch scan result by ID"""

    scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "status" : "complete",
        "result" : json.loads(scan.result_json)
    }


@app.get("/api/history", tags=["History"])
def get_history(db: Session = Depends(get_db)):
    """Return last 10 scans from database"""

    scans = db.query(ScanHistory)\
              .order_by(ScanHistory.created_at.desc())\
              .limit(10).all()

    return [
        {
            "id"         : s.id,
            "url"        : s.url,
            "score"      : s.score,
            "grade"      : s.grade,
            "created_at" : str(s.created_at)
        }
        for s in scans
    ]