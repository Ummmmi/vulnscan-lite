from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "vulnscan",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer    = "json",
    result_serializer  = "json",
    accept_content     = ["json"],
    task_track_started = True,
)

@celery_app.task(bind=True)
def scan_task(self, url: str):
    from scanner.main_scan import run_full_scan
    return run_full_scan(url)