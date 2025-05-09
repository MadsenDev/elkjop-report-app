import React from 'react';

interface StatCardProps {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  goal?: number;
  isCurrency?: boolean;
}

export default function StatCard({ color, icon, label, value, goal, isCurrency }: StatCardProps) {
  return (
    <div style={{
      background: color + '22',
      color,
      borderRadius: 12,
      padding: '12px 18px',
      minWidth: 80,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontWeight: 700,
      fontSize: 17,
      boxShadow: '0 1px 4px #0001',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}:</span>
      <span style={{ color: '#1e293b', fontWeight: 800 }} className="dark:text-white">
        {isCurrency ? value.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }) : value}
        {goal !== undefined && goal > 0 && (
          <span style={{ color: color, fontWeight: 600, marginLeft: 4, fontSize: 15 }}>
            {' / '}
            {isCurrency ? goal.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }) : goal}
          </span>
        )}
      </span>
    </div>
  );
} 