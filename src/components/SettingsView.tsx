import { motion } from 'motion/react';
import { Palette, UserCircle, Save, Sliders, Bell, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function SettingsView() {
  const [themeColor, setThemeColor] = useState('var(--primary-color)');
  const [defaultAvatarStyle, setDefaultAvatarStyle] = useState('avataaars');

  const avatarStyles = ['avataaars', 'bottts', 'identicon', 'initials', 'micah'];
  const presetColors = ['var(--primary-color)', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  const handleSave = () => {
    // Just a mock save for now. In a real app this would save to local storage or backend.
    document.documentElement.style.setProperty('--primary-color', themeColor);
    // Rough calculation for hover state (darker)
    document.documentElement.style.setProperty('--primary-hover', themeColor);
    localStorage.setItem('wtp-theme', themeColor);
    alert('Settings saved successfully! (Theme customization previewed)');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20 select-none font-sans max-w-4xl"
    >
      <section>
        <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
          System Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium">Customize your workspace and preferences</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Appearance Settings */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 md:col-span-2 space-y-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[var(--primary-color)]" />
              <h3 className="text-sm font-bold text-slate-800">Theme Color</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Select a primary color for your dashboard.</p>
            
            <div className="flex flex-wrap gap-3">
              {presetColors.map(color => (
                <div 
                  key={color}
                  onClick={() => setThemeColor(color)}
                  className={`w-10 h-10 rounded-full cursor-pointer transition-all flex items-center justify-center ${themeColor === color ? 'ring-4 ring-offset-2 ring-slate-200 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative">
                <input 
                  type="color" 
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-10 h-10 rounded-full cursor-pointer opacity-0 absolute inset-0"
                />
                <div 
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-slate-300 flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  <Sliders className="w-4 h-4 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <UserCircle className="w-5 h-5 text-[var(--primary-color)]" />
              <h3 className="text-sm font-bold text-slate-800">Worker Avatar Style</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Choose the default generated avatar style for new workers.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {avatarStyles.map(style => (
                <div 
                  key={style}
                  onClick={() => setDefaultAvatarStyle(style)}
                  className={`border rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${defaultAvatarStyle === style ? 'border-[var(--primary-color)] bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=preview`} 
                    alt={style}
                    className="w-10 h-10 rounded-full bg-white shadow-sm"
                  />
                  <span className="text-[10px] font-bold text-slate-600 capitalize">{style}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* General Settings */}
        <section className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                <p className="text-[10px] text-slate-500">Manage alerts and sounds</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Shield className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Security & PIN</h4>
                <p className="text-[10px] text-slate-500">Update supervisor PIN</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Smartphone className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Device Sync</h4>
                <p className="text-[10px] text-slate-500">Connect mobile app</p>
              </div>
            </div>
          </div>
        </section>
        
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

    </motion.div>
  );
}
