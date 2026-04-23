import React, { useState, useEffect } from 'react';
import ScanPage from './pages/ScanPage';
import ScanResult from './pages/ScanResult';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [result, setResult]       = useState(null);
  const [activeTab, setActiveTab] = useState('scanner');
  const [history, setHistory]     = useState([]);

  const tabs = ['Scanner', 'Report', 'History'];

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error('History fetch failed:', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>

      {/* Header */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: '#00ff88', borderRadius: '6px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', color: '#000'
          }}>V</div>
          <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff' }}>
            VulnScan Lite
          </span>
        </div>
        <span style={{
          background: '#1a1200', color: '#ffaa00',
          border: '1px solid #332200',
          padding: '5px 14px', borderRadius: '20px', fontSize: '12px'
        }}>
          ⚠ Only scan websites you own. Passive analysis only.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ padding: '20px 32px 0', display: 'flex', gap: '8px' }}>
        {tabs.map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{
              padding: '8px 20px',
              background: activeTab === tab.toLowerCase() ? '#fff' : 'transparent',
              color: activeTab === tab.toLowerCase() ? '#000' : '#666',
              border: '1px solid #222', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '30px 32px' }}>

        {activeTab === 'scanner' && (
          <ScanPage onResult={(r) => {
            setResult(r);
            setActiveTab('report');
          }} />
        )}

        {activeTab === 'report' && (
          result
            ? <ScanResult result={result} />
            : <p style={{ color: '#444', textAlign: 'center', marginTop: '60px' }}>
                Run a scan first to see the report.
              </p>
        )}

        {activeTab === 'history' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '20px'
            }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                Scan History
              </h2>
              <button onClick={fetchHistory} style={{
                padding: '6px 16px', background: 'transparent',
                border: '1px solid #333', borderRadius: '6px',
                color: '#888', cursor: 'pointer', fontSize: '12px'
              }}>
                ↻ Refresh
              </button>
            </div>

            {history.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', marginTop: '60px' }}>
                No scans yet. Run your first scan!
              </p>
            ) : (
              history.map((scan, i) => (
                <div key={i} style={{
                  background: '#111', border: '1px solid #1e1e1e',
                  borderRadius: '10px', padding: '14px 18px',
                  marginBottom: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px', fontWeight: '500',
                      color: '#fff', fontFamily: 'monospace', marginBottom: '3px'
                    }}>
                      {scan.url}
                    </div>
                    <div style={{ fontSize: '11px', color: '#444' }}>
                      {new Date(scan.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '20px', fontWeight: '700',
                      fontFamily: 'monospace',
                      color: scan.grade?.startsWith('A') ? '#00ff88'
                           : scan.grade?.startsWith('B') ? '#4488ff'
                           : scan.grade?.startsWith('C') ? '#ffaa00'
                           : '#ff4444'
                    }}>
                      {scan.grade}
                    </span>
                    <span style={{
                      fontSize: '13px', color: '#555',
                      background: '#1a1a1a', padding: '3px 10px',
                      borderRadius: '20px'
                    }}>
                      {scan.score}/100
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;