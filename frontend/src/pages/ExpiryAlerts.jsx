import { useState, useEffect } from 'react';
import {
  AlertCircle, AlertTriangle, CalendarX, CheckCircle2,
  Loader2, X, Trash2, Bell, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';

const FALLBACK_ITEMS = [
  { id: '1', product_name: 'Parle-G Gold Biscuits', brand: 'Parle', quantity: 45, unit: 'pcs', price: 25, expiry_date: '2023-05-10' },
  { id: '2', product_name: 'Sunfeast Dark Fantasy', brand: 'ITC', quantity: 15, unit: 'pcs', price: 40, expiry_date: '2024-09-10' },
  { id: '3', product_name: 'Aashirvaad Atta', brand: 'ITC', quantity: 3, unit: 'kg', price: 220, expiry_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] },
  { id: '4', product_name: 'Amul Butter', brand: 'Amul', quantity: 8, unit: 'pcs', price: 55, expiry_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0] },
];

function AlertCard({ item, type, onRemove, onDismiss, isRemoving }) {
  const expired = type === 'expired';

  const daysLeft = () => {
    const today = new Date();
    const exp = new Date(item.expiry_date);
    const diff = Math.round((exp - today) / 86400000);
    return diff;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className={`relative bg-white dark:bg-slate-800/70 rounded-2xl border overflow-hidden hover-lift ${
        expired
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-amber-200 dark:border-amber-900/50'
      }`}
    >
      {/* Coloured top bar */}
      <div className={`h-1.5 w-full ${expired ? 'bg-red-500' : 'bg-amber-400'}`} />

      <div className="p-5">
        {/* Badge */}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            expired
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            {expired ? 'EXPIRED' : `${daysLeft()} days left`}
          </span>
          <button
            onClick={() => onDismiss(item.id)}
            className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 rounded-lg transition-colors"
            title="Dismiss from this view"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{item.product_name}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{item.brand || 'Unknown brand'}</p>

        {/* Info row */}
        <div className="flex gap-3 mt-4 mb-4">
          <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Stock</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{item.quantity} {item.unit}</p>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{expired ? 'Expired On' : 'Expires On'}</p>
            <p className={`font-bold text-sm ${expired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {new Date(item.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action button */}
        {expired ? (
          <button
            onClick={() => onRemove(item.id)}
            disabled={isRemoving === item.id}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 btn-press"
          >
            {isRemoving === item.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Remove from Inventory
          </button>
        ) : (
          <button
            onClick={() => onDismiss(item.id)}
            className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-semibold text-sm rounded-xl border border-amber-200 dark:border-amber-800/50 transition-colors btn-press"
          >
            Clear Alert
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function ExpiryAlerts() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      setItems(data || []);
    } catch {
      setItems(FALLBACK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setIsRemoving(id);
    try {
      await supabase.from('inventory').delete().eq('id', id);
    } catch { /* fallback: remove locally */ } finally {
      setItems(prev => prev.filter(i => i.id !== id));
      setIsRemoving(null);
    }
  };

  const handleDismiss = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearAllExpired = async () => {
    setClearingAll(true);
    const expiredIds = expiredItems.map(i => i.id);
    try {
      for (const id of expiredIds) {
        await supabase.from('inventory').delete().eq('id', id);
      }
    } catch { /* fallback */ } finally {
      setItems(prev => prev.filter(i => !expiredIds.includes(i.id)));
      setClearingAll(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const sixtyDays = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];

  const expiredItems = items.filter(i => i.expiry_date && i.expiry_date < today);
  const expiringSoonItems = items.filter(i => i.expiry_date && i.expiry_date >= today && i.expiry_date <= sixtyDays);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const allClear = expiredItems.length === 0 && expiringSoonItems.length === 0;

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-rose-500" />
            {t('alertsTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('alertsDesc')}</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* All Clear */}
      <AnimatePresence>
        {allClear && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 flex items-center gap-4"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">All Clear! 🎉</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                No expired items and nothing expiring in the next 60 days.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPIRED SECTION ── */}
      {!allClear && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <CalendarX className="w-5 h-5" />
              {t('alreadyExpiredList')}
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold px-2 py-0.5 rounded-full ml-1">
                {expiredItems.length}
              </span>
            </h2>
            {expiredItems.length > 1 && (
              <button
                onClick={handleClearAllExpired}
                disabled={clearingAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {clearingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove All Expired
              </button>
            )}
          </div>

          {expiredItems.length === 0 ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">{t('noExpired')}</span>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {expiredItems.map(item => (
                  <AlertCard
                    key={item.id}
                    item={item}
                    type="expired"
                    onRemove={handleRemove}
                    onDismiss={handleDismiss}
                    isRemoving={isRemoving}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      )}

      {/* Divider */}
      {!allClear && expiredItems.length > 0 && expiringSoonItems.length > 0 && (
        <div className="w-full h-px bg-gray-200 dark:bg-slate-700" />
      )}

      {/* ── EXPIRING SOON SECTION ── */}
      {!allClear && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('expiringNext60')}
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold px-2 py-0.5 rounded-full ml-1">
                {expiringSoonItems.length}
              </span>
            </h2>
            {expiringSoonItems.length > 0 && (
              <button
                onClick={() => expiringSoonItems.forEach(i => handleDismiss(i.id))}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Dismiss All
              </button>
            )}
          </div>

          {expiringSoonItems.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('noExpiring')}</p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {expiringSoonItems.map(item => (
                  <AlertCard
                    key={item.id}
                    item={item}
                    type="expiring"
                    onRemove={handleRemove}
                    onDismiss={handleDismiss}
                    isRemoving={isRemoving}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      )}

      {/* Summary stats */}
      {!allClear && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-wrap gap-6 justify-center border border-gray-200 dark:border-slate-700/50"
        >
          <div className="text-center">
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{expiredItems.length}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Expired</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{expiringSoonItems.length}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Expiring Soon</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{expiredItems.length + expiringSoonItems.length}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Total Alerts</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
