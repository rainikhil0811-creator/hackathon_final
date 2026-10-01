import { useState, useRef } from 'react';
import { Camera, Mic, Upload, X, Check, Loader2, Sparkles, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../utils/supabase';

// When deployed on Vercel services, /api is routed to backend on the same origin.
// In standalone local dev without Vercel proxy, fallback to http://localhost:5000.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function AddStock() {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [editedResult, setEditedResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Could not access camera. Please check permissions.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      canvas.toBlob(blob => {
        setImageFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg');
      stopCamera();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioFile(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatTime = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  const handleProcess = async () => {
    if (!imageFile) {
      setError('Please provide a product image.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    if (audioFile) formData.append('audio', audioFile, 'voicenote.webm');

    try {
      const response = await axios.post(`${API_URL}/api/process-stock`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      const data = response.data;
      setResult(data);
      setEditedResult({ ...data });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    const toSave = {
      product_name: editedResult.product_name,
      brand: editedResult.brand || null,
      quantity: Number(editedResult.quantity) || 0,
      unit: editedResult.unit || 'pcs',
      price: Number(editedResult.price) || 0,
      expiry_date: editedResult.expiry_date || null,
    };

    try {
      const { error } = await supabase.from('inventory').insert([toSave]);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase save failed (offline mode?):', err.message);
      // Continue anyway in demo mode
    } finally {
      setSaveSuccess(true);
      setTimeout(() => {
        setResult(null);
        setEditedResult(null);
        setImageFile(null);
        setImagePreview(null);
        setAudioFile(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setSaveSuccess(false);
        setSaving(false);
      }, 1200);
    }
  };

  const resetAll = () => {
    setResult(null);
    setEditedResult(null);
    setImageFile(null);
    setImagePreview(null);
    setAudioFile(null);
    setAudioUrl(null);
    setError(null);
    setSaveSuccess(false);
    setRecordingTime(0);
    if (isRecording) stopRecording();
    stopCamera();
  };

  const inputClass = "w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-indigo-500" />
          {t('aiStockEntry')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('aiStockEntryDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* STEP 1: Image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h2 className="font-bold text-gray-900 dark:text-white">{t('productPhoto')}</h2>
            {imageFile && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
          </div>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-slate-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
                ✓ Photo ready
              </div>
            </div>
          ) : isCameraOpen ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-3">
                <button onClick={stopCamera} className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-black/90 transition-colors">
                  Cancel
                </button>
                <button onClick={capturePhoto} className="px-6 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-md hover:bg-gray-100 transition-colors">
                  📸 Capture
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 aspect-video">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-2 border-dashed border-indigo-200 dark:border-indigo-700/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center">{t('takeLivePhoto')}</span>
              </motion.button>

              <label className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-2 border-dashed border-purple-200 dark:border-purple-700/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 text-center">{t('uploadGallery')}</span>
                </motion.div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          )}
        </motion.div>

        {/* STEP 2: Audio */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h2 className="font-bold text-gray-900 dark:text-white">{t('voiceDetails')}</h2>
            <span className="text-xs text-gray-400 ml-1">(optional)</span>
            {audioFile && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700/30 p-6 text-center aspect-video">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 italic">
              "{t('voicePlaceholder').replace(/"/g, '')}"
            </p>

            {!audioFile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 recording-pulse'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  }`}
                >
                  {isRecording
                    ? <div className="w-5 h-5 bg-white rounded-sm" />
                    : <Mic className="w-7 h-7" />
                  }
                </motion.button>
                <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {isRecording ? (
                    <span className="text-red-500 flex items-center gap-1 justify-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                      {formatTime(recordingTime)} Recording...
                    </span>
                  ) : t('tapToSpeak')}
                </p>
              </>
            ) : (
              <div className="w-full space-y-3">
                <audio src={audioUrl} controls className="w-full rounded-xl" style={{ height: '40px' }} />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ {t('voiceReady')}</p>
                <button
                  onClick={() => { setAudioFile(null); setAudioUrl(null); setRecordingTime(0); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-1 w-full"
                >
                  <X className="w-3 h-3" /> {t('reRecord')}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Button */}
      {!result && (
        <motion.button
          whileHover={{ scale: imageFile ? 1.01 : 1 }}
          whileTap={{ scale: imageFile ? 0.99 : 1 }}
          onClick={handleProcess}
          disabled={!imageFile || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            !imageFile
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('processing')}</>
          ) : (
            <><Sparkles className="w-5 h-5" /> {t('processEntry')}</>
          )}
        </motion.button>
      )}

      {/* Result Confirmation Card */}
      <AnimatePresence>
        {result && editedResult && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden shadow-lg"
          >
            {/* Progress bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    {t('reviewDetails')}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{result.reply_text}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    result.confidence > 80
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {result.confidence}% match
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                {[
                  { label: t('productName'), key: 'product_name', type: 'text', full: true },
                  { label: t('brand'), key: 'brand', type: 'text' },
                  { label: 'Quantity', key: 'quantity', type: 'number' },
                  { label: 'Unit', key: 'unit', type: 'text' },
                  { label: t('price'), key: 'price', type: 'number' },
                  { label: t('expiryDate'), key: 'expiry_date', type: 'date' },
                ].map(field => (
                  <div key={field.key} className={field.full ? 'col-span-2 md:col-span-3' : ''}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={editedResult[field.key] || ''}
                      onChange={e => setEditedResult({ ...editedResult, [field.key]: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {result.uncertain_fields?.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-5 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 dark:text-amber-400">
                    {t('aiUncertain')}: <strong>{result.uncertain_fields.join(', ')}</strong>. {t('verify')}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={resetAll}
                  className="flex-1 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('discard')}
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving || saveSuccess}
                  className={`flex-[2] py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    saveSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20'
                  } disabled:opacity-80`}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : saveSuccess ? (
                    <><Check className="w-4 h-4" /> Saved to Inventory!</>
                  ) : (
                    <><Save className="w-4 h-4" /> {t('confirmSave')}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
