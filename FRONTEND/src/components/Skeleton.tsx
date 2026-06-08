import { motion } from 'framer-motion';

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-10 w-36 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
