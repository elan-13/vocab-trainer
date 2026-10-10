import React from 'react';
import { calculateMemoryBattery } from '../utils/retentionMeter';
import { Battery, BatteryCharging, BatteryWarning, BatteryMedium, Zap } from 'lucide-react';

export const MemoryBattery = ({ word, compact = false, showLabel = true }) => {
  const { percentage, status, color, label, isDue } = calculateMemoryBattery(word);

  if (compact) {
    return (
      <div
        className="memory-battery-compact"
        title={`Ebbinghaus Retention Curve: ${label} (${percentage}%)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.55rem',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${color}40`,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: color,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            display: 'inline-block',
          }}
        />
        <span>{percentage}%</span>
      </div>
    );
  }

  return (
    <div
      className="memory-battery-meter"
      style={{
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.45rem',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontWeight: 600 }}>
          {isDue ? (
            <BatteryWarning size={16} style={{ color: color }} />
          ) : percentage >= 85 ? (
            <BatteryCharging size={16} style={{ color: color }} />
          ) : (
            <BatteryMedium size={16} style={{ color: color }} />
          )}
          <span>Memory Retention Battery</span>
        </div>

        <span
          style={{
            fontWeight: 800,
            color: color,
            textShadow: `0 0 10px ${color}60`,
            fontSize: '0.85rem',
          }}
        >
          {percentage}% &bull; {status}
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: 8,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}90`,
            borderRadius: 999,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.4rem',
            fontSize: '0.725rem',
            color: 'var(--text-dim)',
          }}
        >
          <span>Ebbinghaus Decay Curve</span>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};

export default MemoryBattery;
