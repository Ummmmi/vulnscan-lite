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
  const [url, setUrl]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [steps, setSteps]       = useState([]);
  const [error, setError]       = useState(null);
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  // Rotate facts every 2 seconds while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % SECURITY_FACTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setSteps([]);
    setError(null);
    setProgress(0);
    setFactIndex(Math.floor(Math.random() * SECURITY_FACTS.length));

    SCAN_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setSteps(prev => [...prev, step]);
        setProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 100));
      }, i * 700);
    });

    try {
      const res  = await fetch('http://127.0.0.1:8000/api/scan', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.status === 'complete' && data.result) {
        const animationTime = SCAN_STEPS.length * 700 + 500;
        setTimeout(() => {
          setLoading(false);
          onResult(data.result);
        }, animationTime);
      } else {
        setTimeout(() => {
          setLoading(false);
          setError(data.error || 'Scan failed. Try again.');
        }, SCAN_STEPS.length * 700);
      }

    } catch (e) {
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
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px #00ff88'
            }} />
          </div>

          {/* Security Fact — shown while scanning */}
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
              <span style={{
                fontSize   : '16px',
                flexShrink : 0,
                marginTop  : '1px'
              }}>💡</span>
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
                  transition: 'opacity 0.3s ease',
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