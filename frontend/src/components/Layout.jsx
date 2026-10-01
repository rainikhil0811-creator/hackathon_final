import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, PackagePlus, List, Bell, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)',  transition: { duration: 0.2, ease: 'easeIn' } }
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/',              label: t('dashboard'), icon: Home },
    { path: '/add-stock',    label: t('addStock'),  icon: PackagePlus },
    { path: '/inventory',    label: t('inventory'), icon: List },
    { path: '/expiry-alerts',label: t('alerts'),    icon: Bell },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
      isActive
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* ── SIDEBAR (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 px-4 py-5 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-7">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
            <PackagePlus className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white">DukaanSaathi</span>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <item.icon className={`w-4.5 h-4.5 relative z-10 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} style={{ width: '18px', height: '18px' }} />
                  <span className="relative z-10 text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400 dark:text-indigo-500 relative z-10" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1">
          <NavLink to="/profile" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <User className="w-4.5 h-4.5 relative z-10 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
                <span className="relative z-10 text-sm">{t('profile')}</span>
              </>
            )}
          </NavLink>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut style={{ width: '18px', height: '18px' }} className="flex-shrink-0" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PackagePlus className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-sm">DukaanSaathi</span>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content — animated */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 md:p-8 max-w-7xl mx-auto pb-28 md:pb-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 z-30 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {[...navItems, { path: '/profile', label: t('profile'), icon: User }].map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="flex-1"
            >
              {({ isActive }) => (
                <div className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-bg"
                      className="absolute w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative z-10"
                  >
                    <item.icon style={{ width: '20px', height: '20px' }} />
                  </motion.div>
                  <span className="text-[10px] font-semibold relative z-10 leading-none">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
