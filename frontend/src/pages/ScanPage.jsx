import React, { useState, useEffect } from 'react';

const SCAN_STEPS = [
  'Hostname resolved',
  'Headers analyzed',
  'SSL certificate checked',
  'CMS detection complete',
  'Report ready!',
];

const SECURITY_FACTS = [
  "43% of cyber attacks target small businesses.",
  "A data breach costs $4.45M on average in 2023.",
  "Missing CSP header allows XSS attacks.",
  "TLS 1.3 is 40% faster than TLS 1.2.",
  "Outdated CMS is #1 cause of website hacks.",
  "HSTS prevents SSL stripping attacks.",
  "60% of breaches involve unpatched vulnerabilities.",
  "X-Frame-Options prevents clickjacking attacks.",
  "Let's Encrypt issues 3M+ certificates daily.",
  "Google flags HTTP sites as 'Not Secure' since 2018.",
];

function ScanPage({ onResult }) {
  const [url, setUrl]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [steps, setSteps]         = useState([]);
  const [error, setError]         = useState(null);
  const [progress, setProgress]   = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [scanDone, setScanDone]   = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  // Facts rotate karo — 4 seconds per fact
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % SECURITY_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  // Jab dono complete ho — backend + animation — result dikhao
  useEffect(() => {
    if (scanDone && pendingResult && progress >= 100) {
      setTimeout(() => {
        setLoading(false);
        onResult(pendingResult);
        setScanDone(false);
        setPendingResult(null);
      }, 500);
    }
  }, [scanDone, pendingResult, progress]);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setSteps([]);
    setError(null);
    setProgress(0);
    setScanDone(false);
    setPendingResult(null);
    setFactIndex(Math.floor(Math.random() * SECURITY_FACTS.length));

    // Animation steps — 1 step har 3 seconds
    // Agar backend slow hai toh steps repeat hote rahenge
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      const step = SCAN_STEPS[Math.min(stepIndex, SCAN_STEPS.length - 1)];
      setSteps(prev => {
        // Last step repeat mat karo
        if (prev.length > 0 && prev[prev.length - 1] === SCAN_STEPS[SCAN_STEPS.length - 1]) {
          return prev;
        }
        if (stepIndex < SCAN_STEPS.length) {
          return [...prev, step];
        }
        return prev;
      });
      setProgress(Math.min(
        Math.round(((Math.min(stepIndex + 1, SCAN_STEPS.length)) / SCAN_STEPS.length) * 95),
        95
      ));
      stepIndex++;
    }, 3000);

    try {
      const res  = await fetch('https://vulnscan-lite-x5ut.onrender.com/api/scan', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ url }),
      });
      const data = await res.json();

      clearInterval(stepInterval);

      if (data.status === 'complete' && data.result) {
        // Show all steps complete
        setSteps(SCAN_STEPS);
        setProgress(100);
        setScanDone(true);
        setPendingResult(data.result);
      } else {
        setLoading(false);
        setError(data.error || 'Scan failed. Try again.');
      }

    } catch (e) {
      clearInterval(stepInterval);
      setLoading(false);
      setError('Failed to connect to backend. Is it running?');
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>

      <h1 style={{
        fontSize: '32px', fontWeight: '700',
        color: '#00ff88', marginBottom: '8px',
        fontFamily: 'monospace'
      }}>
        Scan a Website
      </h1>
      <p style={{ color: '#555', fontSize: '14px', marginBottom: '32px' }}>
        Check headers, SSL, and CMS configurations instantly
      </p>

      {/* URL Input */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
          placeholder="https://example.com"
          style={{
            flex: 1, padding: '13px 16px',
            background: '#111', border: '1px solid #222',
            borderRadius: '8px', color: '#fff',
            fontSize: '14px', fontFamily: 'monospace', outline: 'none',
          }}
        />
        <button
          onClick={handleScan}
          disabled={loading || !url}
          style={{
            padding: '13px 28px',
            background: loading ? '#1a1a1a' : '#ffffff',
            color: loading ? '#444' : '#000',
            border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600', fontSize: '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      {/* Cold start warning */}
      {loading && steps.length === 0 && (
        <div style={{
          color: '#555', fontSize: '13px', marginBottom: '12px'
        }}>
          ⏳ Waking up server... first scan may take 30-50 seconds
        </div>
      )}

      {/* Progress Steps */}
      {steps.length > 0 && (
        <div style={{
          background: '#111', border: '1px solid #1e1e1e',
          borderRadius: '12px', padding: '20px 24px', textAlign: 'left',
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', marginBottom: '10px'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#00ff88', flexShrink: 0,
                boxShadow: '0 0 6px #00ff88'
              }} />
              <span style={{ color: '#00ff88', fontSize: '14px' }}>{step}</span>
            </div>
          ))}

          {/* Progress Bar */}
          <div style={{
            height: '3px', background: '#1a1a1a',
            borderRadius: '2px', marginTop: '14px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: '#00ff88', borderRadius: '2px',
              transition: 'width 1s ease',
              boxShadow: '0 0 8px #00ff88'
            }} />
          </div>

          {/* Security Fact */}
          {loading && (
            <div style={{
              marginTop    : '16px',
              background   : '#0a1a0a',
              border       : '1px solid #1a3a1a',
              borderRadius : '8px',
              padding      : '10px 14px',
              display      : 'flex',
              alignItems   : 'flex-start',
              gap          : '10px',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
              <div>
                <div style={{
                  fontSize     : '10px',
                  color        : '#00ff88',
                  fontWeight   : '600',
                  letterSpacing: '0.08em',
                  marginBottom : '4px',
                  textTransform: 'uppercase'
                }}>
                  Did you know?
                </div>
                <div style={{
                  fontSize  : '13px',
                  color     : '#888',
                  lineHeight: '1.5',
                }}>
                  {SECURITY_FACTS[factIndex]}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '16px', background: '#1a0000',
          border: '1px solid #330000', borderRadius: '8px',
          padding: '12px 16px', color: '#ff4444', fontSize: '14px'
        }}>
          ✗ {error}
        </div>
      )}

    </div>
  );
}

export default ScanPage;