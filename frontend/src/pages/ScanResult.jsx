import React, { useState } from 'react';

const gradeColor = (grade) => {
  if (!grade) return '#fff';
  if (grade.startsWith('A')) return '#00ff88';
  if (grade.startsWith('B')) return '#4488ff';
  if (grade.startsWith('C')) return '#ffaa00';
  return '#ff4444';
};

function ResultPage({ result }) {
  const [expandedFix, setExpandedFix] = useState(null);

  if (!result) return null;

  const { score, grade, headers, ssl, cms } = result;

  const circumference = 2 * Math.PI * 54;
  const offset        = circumference - (score / 100) * circumference;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Top Row: Gauge + Cards */}
      <div style={{
        display             : 'grid',
        gridTemplateColumns : '200px 1fr',
        gap                 : '16px',
        marginBottom        : '24px',
        alignItems          : 'start',
      }}>

        {/* Score Gauge */}
        <div style={{
          background   : '#111',
          border       : '1px solid #1e1e1e',
          borderRadius : '12px',
          padding      : '24px',
          textAlign    : 'center',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54"
              fill="none" stroke="#1e1e1e" strokeWidth="8" />
            <circle cx="60" cy="60" r="54"
              fill="none"
              stroke={gradeColor(grade)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="60" y="55" textAnchor="middle"
              fill={gradeColor(grade)} fontSize="24"
              fontWeight="700" fontFamily="monospace">
              {score}
            </text>
            <text x="60" y="74" textAnchor="middle"
              fill="#555" fontSize="11" fontFamily="sans-serif">
              Grade: {grade}
            </text>
          </svg>
        </div>

        {/* SSL + CMS Info Cards */}
        <div style={{
          display             : 'grid',
          gridTemplateColumns : '1fr 1fr',
          gap                 : '10px',
        }}>
          <InfoCard
            label="SSL Status"
            value={ssl?.valid ? '✓ Valid' : '✗ Invalid'}
            valueColor={ssl?.valid ? '#00ff88' : '#ff4444'}
          />
          <InfoCard
            label="Cert Expires"
            value={ssl?.days_left != null ? `${ssl.days_left} days` : 'N/A'}
            valueColor={ssl?.days_left < 30 ? '#ff4444' : '#ffaa00'}
          />
          <InfoCard
            label="CMS Detected"
            value={
              cms?.detected
                ? `${cms.name}${cms.version && cms.version !== 'Unknown' ? ' ' + cms.version : ''}`
                : 'None detected'
            }
            valueColor={
              cms?.detected
                ? (cms?.outdated ? '#ff4444' : '#ffaa00')
                : '#00ff88'
            }
          />
          <InfoCard
            label="Cipher Suite"
            value={ssl?.version || 'N/A'}
            valueColor="#4488ff"
          />
        </div>
      </div>

      {/* CMS Warning Banner */}
      {cms?.detected && cms?.outdated && (
        <div style={{
          background   : '#1a0a00',
          border       : '1px solid #ff4444',
          borderRadius : '8px',
          padding      : '12px 16px',
          marginBottom : '20px',
          display      : 'flex',
          alignItems   : 'center',
          gap          : '10px',
        }}>
          <span style={{ color: '#ff4444', fontSize: '16px' }}>⚠</span>
          <div>
            <div style={{ color: '#ff4444', fontWeight: '600', fontSize: '13px' }}>
              Outdated {cms.name} detected — v{cms.version}
            </div>
            <div style={{ color: '#664444', fontSize: '11px', marginTop: '2px' }}>
              Latest version: {cms.latest_version} — Update immediately to patch known vulnerabilities
            </div>
          </div>
          <span style={{
            marginLeft   : 'auto',
            color        : '#ff4444',
            fontWeight   : '700',
            fontSize     : '13px',
          }}>-10</span>
        </div>
      )}

      {/* CMS Info Banner — detected but not outdated */}
      {cms?.detected && !cms?.outdated && (
        <div style={{
          background   : '#1a1200',
          border       : '1px solid #ffaa00',
          borderRadius : '8px',
          padding      : '12px 16px',
          marginBottom : '20px',
          display      : 'flex',
          alignItems   : 'center',
          gap          : '10px',
        }}>
          <span style={{ color: '#ffaa00', fontSize: '16px' }}>ℹ</span>
          <div>
            <div style={{ color: '#ffaa00', fontWeight: '600', fontSize: '13px' }}>
              {cms.name} detected
            </div>
            <div style={{ color: '#665500', fontSize: '11px', marginTop: '2px' }}>
              Detected via {cms.detection_method} — Consider hiding generator tags to reduce fingerprinting
            </div>
          </div>
        </div>
      )}

      {/* Passed / Failed Checks */}
      <div style={{
        display             : 'grid',
        gridTemplateColumns : '1fr 1fr',
        gap                 : '16px',
        marginBottom        : '24px',
      }}>

        {/* PASSED */}
        <div>
          <SectionLabel color="#00ff88" icon="✓" text="PASSED CHECKS" />
          {headers?.passed?.length === 0 && (
            <p style={{ color: '#333', fontSize: '13px' }}>No checks passed.</p>
          )}
          {headers?.passed?.map((check, i) => (
            <CheckCard key={i} check={check} type="pass" />
          ))}
        </div>

        {/* FAILED */}
        <div>
          <SectionLabel color="#ff4444" icon="✗" text="FAILED CHECKS" />
          {headers?.failed?.length === 0 && (
            <p style={{ color: '#333', fontSize: '13px' }}>All checks passed! 🎉</p>
          )}
          {headers?.failed?.map((check, i) => (
            <CheckCard
              key={i}
              check={check}
              type="fail"
              expanded={expandedFix === i}
              onToggle={() => setExpandedFix(expandedFix === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* PDF Export Button */}
      <div style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding      : '12px 36px',
            background   : '#00ff88',
            color        : '#000',
            border       : 'none',
            borderRadius : '8px',
            cursor       : 'pointer',
            fontWeight   : '700',
            fontSize     : '14px',
            letterSpacing: '0.03em',
            transition   : 'opacity 0.15s',
          }}
          onMouseOver={e => e.target.style.opacity = '0.85'}
          onMouseOut={e => e.target.style.opacity = '1'}
        >
          ↓ Export PDF Report
        </button>
      </div>

    </div>
  );
}

function SectionLabel({ color, icon, text }) {
  return (
    <div style={{
      fontSize      : '11px',
      fontWeight    : '600',
      letterSpacing : '0.08em',
      color,
      marginBottom  : '10px',
    }}>
      {icon} {text}
    </div>
  );
}

function InfoCard({ label, value, valueColor }) {
  return (
    <div style={{
      background   : '#111',
      border       : '1px solid #1e1e1e',
      borderRadius : '10px',
      padding      : '14px 16px',
    }}>
      <div style={{ fontSize: '11px', color: '#555', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: valueColor || '#fff' }}>
        {value}
      </div>
    </div>
  );
}

function CheckCard({ check, type, expanded, onToggle }) {
  const isPass = type === 'pass';
  return (
    <div
      onClick={!isPass ? onToggle : undefined}
      style={{
        background   : '#111',
        border       : `1px solid ${isPass ? '#0a2a0a' : '#2a0a0a'}`,
        borderRadius : '8px',
        padding      : '12px 14px',
        marginBottom : '8px',
        cursor       : !isPass ? 'pointer' : 'default',
        transition   : 'border-color 0.15s',
      }}
    >
      <div style={{
        display        : 'flex',
        justifyContent : 'space-between',
        alignItems     : 'center',
      }}>
        <div>
          <div style={{
            display     : 'flex',
            alignItems  : 'center',
            gap         : '8px',
            marginBottom: '2px',
          }}>
            <span style={{ color: isPass ? '#00ff88' : '#ff4444', fontSize: '13px' }}>
              {isPass ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
              {check.name}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#444', paddingLeft: '20px' }}>
            {isPass ? check.description : 'Header missing — click for fix'}
          </div>
        </div>
        <span style={{
          fontSize   : '13px',
          fontWeight : '600',
          color      : isPass ? '#00ff88' : '#ff4444',
          flexShrink : 0,
          marginLeft : '8px',
        }}>
          {isPass ? '+10' : '-10'}
        </span>
      </div>

      {!isPass && expanded && (
        <div style={{
          marginTop    : '10px',
          background   : '#0d0d0d',
          border       : '1px solid #222',
          borderRadius : '6px',
          padding      : '10px 12px',
        }}>
          <div style={{
            fontSize      : '10px',
            color         : '#555',
            marginBottom  : '5px',
            textTransform : 'uppercase',
            letterSpacing : '0.05em',
          }}>
            Nginx Fix
          </div>
          <code style={{
            fontSize   : '12px',
            color      : '#00ff88',
            fontFamily : 'monospace',
            lineHeight : '1.6',
          }}>
            {check.fix}
          </code>
        </div>
      )}
    </div>
  );
}

export default ResultPage;