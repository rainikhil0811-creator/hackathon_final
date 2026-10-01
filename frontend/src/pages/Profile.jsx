import { User, Store, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, changeTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative z-10">
      <header>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 drop-shadow-sm">
          {t('profileTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('profileDesc')}</p>
      </header>

      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/10 p-8">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Store className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Ramesh Kirana Store</h2>
            <p className="text-gray-500 font-medium">ramesh@kiranastore.com</p>
            <span className="inline-block mt-3 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800/50">
              {t('proPlan')}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-200 border-b border-white/30 dark:border-white/10 pb-3">{t('langPref')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${language === 'en' ? 'bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-500/50 shadow-md' : 'bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <Globe className={`w-6 h-6 ${language === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                  <span className={`font-bold ${language === 'en' ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>English</span>
                </div>
                <input type="radio" name="lang" checked={language === 'en'} onChange={() => changeLanguage('en')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
              </label>
              
              <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${language === 'hi' ? 'bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-500/50 shadow-md' : 'bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xl w-6 h-6 flex items-center justify-center ${language === 'hi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>अ</span>
                  <span className={`font-bold ${language === 'hi' ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>हिंदी</span>
                </div>
                <input type="radio" name="lang" checked={language === 'hi'} onChange={() => changeLanguage('hi')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${language === 'mr' ? 'bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-500/50 shadow-md' : 'bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xl w-6 h-6 flex items-center justify-center ${language === 'mr' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>म</span>
                  <span className={`font-bold ${language === 'mr' ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>मराठी</span>
                </div>
                <input type="radio" name="lang" checked={language === 'mr'} onChange={() => changeLanguage('mr')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
              </label>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-3">{t('langPrefDesc')}</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-200 border-b border-white/30 dark:border-white/10 pb-3">{t('appearance')}</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => changeTheme('light')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                  theme === 'light' 
                    ? 'bg-indigo-500/10 dark:bg-indigo-900/30 border border-indigo-300/50 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                    : 'bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Sun className="w-5 h-5" /> {t('light')}
              </button>
              
              <button 
                onClick={() => changeTheme('dark')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                  theme === 'dark' 
                    ? 'bg-indigo-500/10 dark:bg-indigo-900/30 border border-indigo-300/50 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                    : 'bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Moon className="w-5 h-5" /> {t('dark')}
              </button>

              <button 
                onClick={() => changeTheme('system')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                  theme === 'system' 
                    ? 'bg-indigo-500/10 dark:bg-indigo-900/30 border border-indigo-300/50 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                    : 'bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="w-5 h-5" /> {t('system')}
              </button>
            </div>
          </section>

          <div className="pt-6 mt-8 border-t border-white/30 dark:border-white/10 flex justify-end">
            <button className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 border border-white/10">
              {t('saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
