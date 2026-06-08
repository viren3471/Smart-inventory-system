import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PageTransition } from '../components/Skeleton';
import api from '../api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // PRE-FILLED CREDENTIALS FOR EASY TESTING!
  const [username, setUsername] = useState('shopowner');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Admin');
  
  const [error, setError] = useState('');
  const { isDark, toggle } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 

    try {
      if (isRegister) {
        await api.post('/auth/register', { username, password, role });
        setIsRegister(false); 
        alert('Account created! Please sign in.');
      } else {
        const response = await api.post('/auth/login', { username, password });
        
        // CRITICAL FIX: Save as exactly 'token' so api.ts can find it
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || role);
        
        // BULLETPROOF REDIRECT: Forces browser to load the dashboard!
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password. Did you create this account yet?');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none bg-radial-glow" />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-500/[0.07] rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 -right-32 w-80 h-80 bg-cyan-500/[0.05] rounded-full blur-[100px]"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors z-10"
        >
          {isDark ? (
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-white/10"
              >
                <Store size={20} className="text-zinc-950" strokeWidth={2} />
              </motion.div>
              <h1 className="text-xl font-semibold text-white tracking-tight">SmartShop</h1>
              <p className="text-xs text-zinc-500 mt-1">
                {isRegister ? 'Create your account' : 'Sign in to continue'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Full Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Admin" className="bg-zinc-900">Admin</option>
                    <option value="Cashier" className="bg-zinc-900">Cashier</option>
                  </select>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors mt-2 shadow-lg shadow-blue-500/20"
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}