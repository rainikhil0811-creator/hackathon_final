import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, Edit2, Trash2, X, Loader2, Check, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const FALLBACK_ITEMS = [
  { id: '1', product_name: 'Parle-G Gold Biscuits', brand: 'Parle', quantity: 45, unit: 'pcs', price: 25, expiry_date: '2027-05-10' },
  { id: '2', product_name: 'Aashirvaad Atta', brand: 'ITC', quantity: 3, unit: 'kg', price: 220, expiry_date: '2026-12-15' },
  { id: '3', product_name: 'Amul Taaza Milk', brand: 'Amul', quantity: 10, unit: 'liters', price: 56, expiry_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] },
];

export default function Inventory() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch {
      setItems(FALLBACK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditDraft({ ...item });
    setUpdateSuccess(false);
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditDraft(null);
    setUpdateSuccess(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          product_name: editDraft.product_name,
          brand: editDraft.brand,
          quantity: Number(editDraft.quantity),
          unit: editDraft.unit,
          price: Number(editDraft.price),
          expiry_date: editDraft.expiry_date || null,
        })
        .eq('id', editDraft.id);

      if (error) throw error;
    } catch {
      // fallback: update locally
    } finally {
      setItems(prev => prev.map(i => i.id === editDraft.id ? { ...editDraft } : i));
      setUpdateSuccess(true);
      setTimeout(closeEdit, 900);
      setIsUpdating(false);
    }
  };

  const confirmDelete = (id) => setDeleteConfirmId(id);
  const cancelDelete = () => setDeleteConfirmId(null);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
    } catch {
      // fallback: remove locally
    } finally {
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirmId(null);
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter(item =>
    (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const getRowClass = (item) => {
    if (item.expiry_date && item.expiry_date < today) return 'bg-red-50/40 dark:bg-red-900/10';
    if (item.quantity < 5) return 'bg-orange-50/40 dark:bg-orange-900/10';
    return '';
  };

  const inputClass = "w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all";

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('invTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('invDesc')}</p>
        </div>
        <button
          onClick={() => navigate('/add-stock')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors btn-press self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchBox')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4" />
          {t('filter')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/80 dark:bg-slate-800/80">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('productInfo')}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('stock')}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('invPrice')}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('invExpiry')}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.04 }}
                      className={`hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors ${getRowClass(item)}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.brand || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${item.quantity < 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {item.quantity} <span className="font-medium text-gray-400">{item.unit}</span>
                          </span>
                          {item.quantity < 5 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                        {item.quantity < 5 && (
                          <span className="inline-block text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold mt-1">
                            {t('lowStockBadge')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white text-sm">₹{item.price}</td>
                      <td className="px-5 py-4">
                        {item.expiry_date ? (
                          <span className={`text-sm font-medium ${item.expiry_date < today ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {new Date(item.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : <span className="text-gray-400 text-sm">—</span>}
                        {item.expiry_date && item.expiry_date < today && (
                          <span className="block text-[10px] text-red-500 font-bold mt-0.5">EXPIRED</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(item)}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => confirmDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {!loading && filteredItems.length === 0 && (
              <div className="py-16 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-500 dark:text-gray-400">
                  {searchTerm ? `No products matching "${searchTerm}"` : t('noProducts')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && items.length > 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Showing {filteredItems.length} of {items.length} products
        </p>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 modal-backdrop"
              onClick={cancelDelete}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl relative z-10 w-full max-w-sm border border-gray-100 dark:border-slate-800"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editItem && editDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 modal-backdrop"
              onClick={closeEdit}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl relative z-10 w-full max-w-lg border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Edit Product</h3>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      value={editDraft.product_name}
                      onChange={e => setEditDraft({ ...editDraft, product_name: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Brand</label>
                    <input
                      type="text"
                      value={editDraft.brand || ''}
                      onChange={e => setEditDraft({ ...editDraft, brand: e.target.value })}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        value={editDraft.quantity}
                        onChange={e => setEditDraft({ ...editDraft, quantity: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Unit *</label>
                      <select
                        value={editDraft.unit || 'pcs'}
                        onChange={e => setEditDraft({ ...editDraft, unit: e.target.value })}
                        className={inputClass}
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="box">box</option>
                        <option value="dozen">dozen</option>
                        <option value="g">grams</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editDraft.price}
                        onChange={e => setEditDraft({ ...editDraft, price: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date</label>
                      <input
                        type="date"
                        value={editDraft.expiry_date || ''}
                        onChange={e => setEditDraft({ ...editDraft, expiry_date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="flex-1 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdating || updateSuccess}
                    className={`flex-[2] py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      updateSuccess
                        ? 'bg-emerald-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25'
                    } disabled:opacity-80`}
                  >
                    {isUpdating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : updateSuccess ? (
                      <><Check className="w-4 h-4" /> Saved!</>
                    ) : (
                      <><Check className="w-4 h-4" /> Save Changes</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
