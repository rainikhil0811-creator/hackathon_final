import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// ─── DEMO CREDENTIALS (shown on login page) ───────────────────────
const DEMO_EMAIL    = 'demo@dukaansaathi.in';
const DEMO_PASSWORD = 'demo1234';
const DEMO_SHOP     = 'Ramesh Kirana Store';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [shopName, setShopName]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading]       = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setShopName('');
  };

  // ── Demo login — bypasses Supabase, sets auth state ───────────────
  const handleDemoLogin = () => {
    setDemoLoading(true);
    setError(null);
    setTimeout(() => {
      login({ email: DEMO_EMAIL, shopName: DEMO_SHOP, isDemo: true });
      setDemoLoading(false);
      navigate('/');
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // Allow demo credentials without hitting Supabase
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          login({ email: DEMO_EMAIL, shopName: DEMO_SHOP, isDemo: true });
          setTimeout(() => navigate('/'), 600);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        login({ email, shopName: 'My Shop', isDemo: false });
        navigate('/');
      } else {
        if (!shopName.trim()) throw new Error('Please enter your shop name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { shop_name: shopName.trim() } }
        });
        if (error) throw error;

        if (data?.user && !data?.session) {
          setSuccessMsg('Account created! Please check your email to confirm, then sign in.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
        } else {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        }
      }
    } catch (err) {
      const msg = err.message;
      if (msg.includes('Invalid login credentials'))
        setError('Incorrect email or password. Try the Demo Login below!');
      else if (msg.includes('User already registered'))
        setError('An account with this email already exists. Try signing in instead.');
      else if (msg.includes('Email not confirmed'))
        setError('Please confirm your email before signing in.');
      else if (msg.includes('fetch') || msg.includes('network') || msg.includes('URL'))
        setError('Cannot reach server. Use the Demo Login button below to explore the app!');
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10"
      >
        <div className="flex justify-center mb-5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/30">
            <PackagePlus className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">DukaanSaathi</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {isLogin ? 'Smart inventory for your shop' : 'Create your shop account'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-4"
      >
        {/* ── DEMO LOGIN CARD ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-xl shadow-indigo-500/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-white flex items-center gap-2 text-sm mb-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                Quick Demo Login
              </p>
              <div className="space-y-1 text-xs text-indigo-100 font-mono bg-white/10 rounded-xl p-3">
                <div className="flex gap-2">
                  <span className="text-indigo-300 w-20 shrink-0">Email</span>
                  <span className="text-white font-bold">{DEMO_EMAIL}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-300 w-20 shrink-0">Password</span>
                  <span className="text-white font-bold">{DEMO_PASSWORD}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-300 w-20 shrink-0">Shop</span>
                  <span className="text-white font-bold">{DEMO_SHOP}</span>
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="mt-4 w-full py-3 bg-white hover:bg-gray-50 text-indigo-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md text-sm disabled:opacity-80"
          >
            {demoLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Opening Demo...</>
            ) : (
              <><Zap className="w-4 h-4 text-indigo-500" /> Enter Demo Dashboard</>
            )}
          </motion.button>
        </motion.div>

        {/* ── AUTH FORM CARD ── */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-3xl border border-gray-100 dark:border-slate-800 px-8 py-8">

          {/* Mode Tabs */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-7">
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Register Shop
            </button>
          </div>

          {/* Success message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="shopname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Ramesh Kirana Store"
                    required={!isLogin}
                    autoComplete="organization"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder={isLogin ? DEMO_EMAIL : 'you@example.com'}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-red-500">*</span>
                {!isLogin && <span className="text-gray-400 font-normal ml-1">(min. 6 characters)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick-fill demo credentials button */}
            {isLogin && (
              <button
                type="button"
                onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
                className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium"
              >
                ← Fill demo credentials
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md shadow-indigo-500/25 transition-colors mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <><LogIn className="w-4 h-4" /> Sign In to Dashboard</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </motion.button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              {isLogin
                ? "Don't have an account? Click Register Shop above."
                : 'Already have an account? Click Sign In above.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
