import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  icon: ReactNode;
  glow?: 'blue' | 'green' | 'red' | 'none';
  delay?: number;
}

export default function KPICard({ title, value, change, changeType, icon, glow = 'none', delay = 0 }: KPICardProps) {
  const glowShadow = {
    blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]',
    green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    red: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]',
    none: '',
  }[glow];

  const iconGlow = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    none: 'text-zinc-500',
  }[glow];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] ${glowShadow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-zinc-500 tracking-wide">{title}</p>
          <p className="text-5xl font-medium tracking-tight text-white mt-3">{value}</p>
          {change && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={`text-xs font-medium ${
                  changeType === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {changeType === 'up' ? '+' : ''}{change}
              </span>
              <span className="text-xs text-zinc-600">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${iconGlow}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
