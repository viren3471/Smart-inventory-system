import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Receipt,
  Truck,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Store,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/udhaar', label: 'Udhaar Ledger', icon: BookOpen },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const location = useLocation();

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/10 text-white'
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
    }`;

  const NavLinks = () => (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => linkClass(isActive)}
        >
          <Icon size={16} strokeWidth={1.5} />
          <span>{label}</span>
          {location.pathname === to && (
            <motion.div
              layoutId="activeIndicator"
              className="ml-auto w-1 h-1 rounded-full bg-accent-blue"
              style={{ boxShadow: '0 0 6px rgba(59,130,246,0.6)' }}
            />
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-lg"
      >
        <Menu size={18} className="text-zinc-400" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 bg-zinc-950 border-r border-white/[0.06] z-40">
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <Store size={14} className="text-zinc-950" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">SmartShop</span>
        </div>

        <div className="flex-1 mt-2 overflow-y-auto">
          <NavLinks />
        </div>

        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all duration-200 w-full"
          >
            {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full mt-0.5">
            <LogOut size={16} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed left-0 top-0 w-64 h-full bg-zinc-950 border-r border-white/[0.06] z-50 lg:hidden"
            >
              <div className="px-5 pt-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                    <Store size={14} className="text-zinc-950" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold text-white tracking-tight">SmartShop</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                  <X size={16} className="text-zinc-500" />
                </button>
              </div>
              <div className="flex-1 mt-2 overflow-y-auto">
                <NavLinks />
              </div>
              <div className="p-3 border-t border-white/[0.06]">
                <button
                  onClick={toggle}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all w-full"
                >
                  {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
