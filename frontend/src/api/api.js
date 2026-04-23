 const BASE_URL = "http://localhost:8000";

// Scan shuru karo
export const startScan = async (url) => {
  const res = await fetch(`${BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json(); // { scan_id: "abc-123" }
};

// Har 2 second mein status check karo
export const pollScanStatus = (scanId, onComplete) => {
  const interval = setInterval(async () => {
    const res = await fetch(`${BASE_URL}/api/scan/${scanId}/status`);
    const data = await res.json();

    if (data.status === "complete") {
      clearInterval(interval);
      onComplete(data.result);
    }
  }, 2000);
};
