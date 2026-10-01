import { useState, useEffect } from 'react';
import {
  Package, TrendingDown, Clock, CalendarX, Plus, List,
  AlertCircle, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

function StatCard({ title, value, icon: Icon, colorClass, bgClass, loading }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`${bgClass} rounded-2xl p-5 border flex items-center gap-4 hover-lift cursor-default`}
    >
      <div className={`${colorClass} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
          {loading ? <span className="skeleton inline-block w-10 h-7 align-middle" /> : value}
        </p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState({ total: 0, lowStock: 0, expiringSoon: 0, expired: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      const items = error ? getMockItems() : (data || []);

      const today = new Date().toISOString().split('T')[0];
      const sixtyDays = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];

      let expired = 0, expiringSoon = 0, lowStock = 0;
      items.forEach(item => {
        if (item.quantity < 5) lowStock++;
        if (item.expiry_date && item.expiry_date < today) expired++;
        else if (item.expiry_date && item.expiry_date <= sixtyDays) expiringSoon++;
      });

      setStats({ total: items.length, lowStock, expiringSoon, expired });
      setRecentItems(items.slice(0, 5));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const items = getMockItems();
      setStats({ total: items.length, lowStock: 1, expiringSoon: 1, expired: 0 });
      setRecentItems(items.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const getMockItems = () => [
    { id: '1', product_name: 'Parle-G Gold Biscuits', brand: 'Parle', quantity: 45, unit: 'pcs', price: 25, expiry_date: '2027-05-10' },
    { id: '2', product_name: 'Aashirvaad Atta', brand: 'ITC', quantity: 3, unit: 'kg', price: 220, expiry_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0] },
    { id: '3', product_name: 'Amul Taaza Milk', brand: 'Amul', quantity: 10, unit: 'liters', price: 56, expiry_date: new Date(Date.now() + 3*86400000).toISOString().split('T')[0] },
  ];

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateString = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statCards = [
    {
      title: t('totalProducts'),
      value: stats.total,
      icon: Package,
      colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      bgClass: 'bg-white dark:bg-slate-800/60 border-blue-100 dark:border-blue-900/30'
    },
    {
      title: t('lowStock'),
      value: stats.lowStock,
      icon: TrendingDown,
      colorClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
      bgClass: 'bg-white dark:bg-slate-800/60 border-orange-100 dark:border-orange-900/30'
    },
    {
      title: t('expiringSoon'),
      value: stats.expiringSoon,
      icon: Clock,
      colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
      bgClass: 'bg-white dark:bg-slate-800/60 border-amber-100 dark:border-amber-900/30'
    },
    {
      title: t('alreadyExpired'),
      value: stats.expired,
      icon: CalendarX,
      colorClass: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
      bgClass: 'bg-white dark:bg-slate-800/60 border-red-100 dark:border-red-900/30'
    }
  ];

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    if (expiryDate < today) return { label: 'Expired', class: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
    if (expiryDate <= thirtyDays) return { label: 'Expiring Soon', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' };
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{dateString}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
            {greeting} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your shop summary for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 btn-press"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/add-stock')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-500/30 transition-colors btn-press"
          >
            <Plus className="w-4 h-4" />
            {t('addNewStock')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map(card => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </motion.div>

      {/* Alerts Banner */}
      {!loading && (stats.expired > 0 || stats.expiringSoon > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 flex-1">
            {stats.expired > 0 && <span className="text-red-600 dark:text-red-400 font-bold">{stats.expired} item(s) expired. </span>}
            {stats.expiringSoon > 0 && <span>{stats.expiringSoon} item(s) expiring within 60 days. </span>}
            Take action now.
          </p>
          <button
            onClick={() => navigate('/expiry-alerts')}
            className="flex items-center gap-1 text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline flex-shrink-0"
          >
            View Alerts <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700/50">
            <h2 className="font-bold text-gray-900 dark:text-white">Recently Added Products</h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-slate-700/30">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton w-40 h-4" />
                    <div className="skeleton w-24 h-3" />
                  </div>
                  <div className="skeleton w-16 h-5 rounded-full" />
                </div>
              ))
            ) : recentItems.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No products yet. Add your first product!</p>
                <button
                  onClick={() => navigate('/add-stock')}
                  className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
                >
                  + Add Stock
                </button>
              </div>
            ) : (
              recentItems.map((item, i) => {
                const status = getExpiryStatus(item.expiry_date);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.brand || 'No brand'} · {item.quantity} {item.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">₹{item.price}</p>
                      {status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.class}`}>
                          {status.label}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-bold text-gray-900 dark:text-white px-1">Quick Actions</h2>

          {[
            {
              icon: Sparkles,
              label: 'AI Stock Entry',
              desc: 'Photo + Voice to add stock',
              path: '/add-stock',
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/30',
              border: 'hover:border-indigo-200 dark:hover:border-indigo-700/50'
            },
            {
              icon: List,
              label: 'View Inventory',
              desc: 'Manage all products',
              path: '/inventory',
              color: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-emerald-50 dark:bg-emerald-900/30',
              border: 'hover:border-emerald-200 dark:hover:border-emerald-700/50'
            },
            {
              icon: AlertCircle,
              label: 'Expiry Alerts',
              desc: `${stats.expiringSoon + stats.expired} items need attention`,
              path: '/expiry-alerts',
              color: 'text-rose-600 dark:text-rose-400',
              bg: 'bg-rose-50 dark:bg-rose-900/30',
              border: 'hover:border-rose-200 dark:hover:border-rose-700/50'
            }
          ].map((action, i) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              onClick={() => navigate(action.path)}
              className={`w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 ${action.border} rounded-2xl text-left transition-all hover-lift btn-press`}
            >
              <div className={`${action.bg} ${action.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-sm ${action.color}`}>{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto flex-shrink-0" />
            </motion.button>
          ))}

          {/* Last updated */}
          {lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
