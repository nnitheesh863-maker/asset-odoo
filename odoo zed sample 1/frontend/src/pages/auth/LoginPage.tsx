import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Layers, Sun, Moon, Settings, ArrowRight, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import UnderwaterBackground from '../../components/ui/UnderwaterBackground';
import FeatureCard from '../../components/ui/FeatureCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

const features = [
  { icon: '📦', title: 'Smart Asset Tracking' },
  { icon: '📅', title: 'Resource Booking' },
  { icon: '🔧', title: 'Predictive Maintenance' },
  { icon: '📊', title: 'Analytics & Reports' },
  { icon: '🔒', title: 'Enterprise Security' },
  { icon: '⚡', title: 'Real-Time Monitoring' },
];

const stats = [
  { value: 2450, suffix: '+', label: 'Assets' },
  { value: 128, suffix: '', label: 'Departments' },
  { value: 5400, suffix: '+', label: 'Employees' },
  { value: 99.9, suffix: '%', label: 'Availability', decimals: 1 },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rememberMe, setRememberMe] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 2,
      y: (clientY / innerHeight - 0.5) * 2,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const tiltX = mousePos.y * 5;
  const tiltY = mousePos.x * -5;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ background: '#020617' }}
    >
      {/* Underwater background */}
      <UnderwaterBackground mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-4"
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-xs font-semibold tracking-wider text-cyan-300/80 uppercase">Odoo Hackathon 2026</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-blue-200/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            aria-label="Toggle dark/light mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-blue-200/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-140px)] items-center px-6 lg:px-10 pb-8">
        {/* Left Side — Branding (hidden on mobile, visible on lg+) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col w-[58%] pr-12 xl:pr-20"
        >
          {/* Logo */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Layers size={28} className="text-white" />
              </div>
              <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 blur-xl opacity-30" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                AssetFlow
              </h1>
              <p className="text-[11px] font-medium text-blue-300/50 tracking-widest uppercase">
                Enterprise Platform
              </p>
            </div>
          </motion.div>

          {/* Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Enterprise Asset &<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                Resource Management
              </span>
            </h2>
            <p className="text-base text-blue-200/50 max-w-md leading-relaxed">
              Track, Allocate, Audit, Maintain, Analyze.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mt-10">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} index={i} />
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            className="grid grid-cols-4 gap-6 mt-10"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  <AnimatedCounter end={s.value} suffix={s.suffix} decimals={(s as any).decimals || 0} />
                </p>
                <p className="text-xs text-blue-300/40 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side — Login Card */}
        <div className="w-full lg:w-[42%] flex justify-center lg:justify-end">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full max-w-[420px]"
          >
            {/* Glow behind card */}
            <div
              className="absolute -inset-1 rounded-[2rem] opacity-40 blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2), rgba(139,92,246,0.15))',
                transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
              }}
            />

            {/* Card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-3xl border border-white/10 backdrop-blur-2xl p-8 sm:p-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Reflection overlay */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
                style={{
                  background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${30 + mousePos.y * 20}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
                }}
              />

              {/* Mobile logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="lg:hidden flex items-center justify-center space-x-3 mb-6"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Layers size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">AssetFlow</span>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 relative z-10"
              >
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome Back <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
                </h2>
                <p className="text-sm text-blue-200/40">Sign in to continue to AssetFlow</p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="email" className="block text-xs font-semibold text-blue-200/50 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-4 text-blue-300/30 group-focus-within:text-cyan-400/70 transition-colors duration-300" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/8 transition-all duration-300 text-sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label htmlFor="password" className="block text-xs font-semibold text-blue-200/50 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-4 text-blue-300/30 group-focus-within:text-cyan-400/70 transition-colors duration-300" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/8 transition-all duration-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-blue-300/30 hover:text-cyan-400/70 transition-colors duration-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Remember Me + Forgot Password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center space-x-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-gradient-to-br peer-checked:from-blue-500 peer-checked:to-cyan-500 peer-checked:border-transparent transition-all duration-300 flex items-center justify-center">
                        {rememberMe && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-blue-200/40 group-hover:text-blue-200/60 transition-colors">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-cyan-400/60 hover:text-cyan-300 transition-colors duration-300"
                  >
                    Forgot Password?
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-white text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4, #7c3aed)',
                      backgroundSize: '200% 200%',
                    }}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(59,130,246,0.2)' }}
                    />

                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="relative my-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <div className="px-4 py-1 bg-white/5 rounded-full backdrop-blur-sm">
                    <Shield size={12} className="text-blue-300/30" />
                  </div>
                </div>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center relative z-10"
              >
                <p className="text-sm text-blue-200/30">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all duration-300"
                  >
                    Create Account
                  </Link>
                </p>
              </motion.div>

              {/* Demo Credentials */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6 p-4 rounded-2xl border border-white/5 bg-white/[0.02] relative z-10"
              >
                <p className="text-[10px] text-blue-300/30 text-center font-semibold uppercase tracking-widest mb-3">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Admin', email: 'admin@assetflow.com' },
                    { label: 'Manager', email: 'manager@assetflow.com' },
                    { label: 'Dept Head', email: 'head@assetflow.com' },
                    { label: 'Employee', email: 'employee@assetflow.com' },
                  ].map((demo) => (
                    <button
                      key={demo.label}
                      onClick={() => { setEmail(demo.email); setPassword('password123'); }}
                      className="px-3 py-2 rounded-lg text-[11px] font-medium text-blue-300/40 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 text-left"
                    >
                      <span className="block text-blue-200/60">{demo.label}</span>
                      <span className="block text-[10px] opacity-50 mt-0.5 truncate">{demo.email}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="relative z-20 flex flex-col sm:flex-row items-center justify-between px-6 lg:px-10 py-4 border-t border-white/5"
      >
        <p className="text-[11px] text-blue-300/20 mb-2 sm:mb-0">
          &copy; 2026 AssetFlow. Built for Odoo Hackathon.
        </p>
        <div className="flex items-center space-x-5">
          {['LinkedIn', 'GitHub', 'Website', 'Privacy', 'Terms'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] text-blue-300/20 hover:text-blue-300/50 transition-colors duration-300"
            >
              {link}
            </a>
          ))}
        </div>
      </motion.footer>
    </div>
  );
}
