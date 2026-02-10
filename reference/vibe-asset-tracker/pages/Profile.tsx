
import React from 'react';
import { Item } from '../types';

interface ProfileProps {
  items: Item[];
}

const Profile: React.FC<ProfileProps> = ({ items }) => {
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
      <div className="px-6 pt-16 flex flex-col items-center mb-10">
        <div className="relative w-64 h-48 bg-indigo-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-sm">
          <img 
            alt="Profile Avatar" 
            className="w-40 h-40 object-contain" 
            src="https://picsum.photos/200/200" 
          />
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-700/90 p-2 rounded-full shadow-lg">
            <span className="material-icons-round text-primary text-xl">favorite</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <button className="w-full text-left bg-white dark:bg-slate-800 p-5 rounded-ios shadow-sm flex items-center justify-between border border-slate-50 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-icons-round text-primary">person_outline</span>
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white">Vibe Coder</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">ID: 20260125</p>
            </div>
          </div>
          <span className="material-icons-round text-slate-300 dark:text-slate-600">chevron_right</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-ios shadow-sm overflow-hidden border border-slate-50 dark:border-slate-700">
          {[
            { icon: 'cloud_sync', label: '数据同步与导出' },
            { icon: 'category', label: '物品类别管理' },
            { icon: 'settings', label: '应用设置' },
          ].map((item, idx, arr) => (
            <button 
              key={item.label}
              className={`w-full flex items-center justify-between px-5 py-5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <span className="material-icons-round text-slate-400 dark:text-slate-500">{item.icon}</span>
                <span className="font-medium dark:text-white">{item.label}</span>
              </div>
              <span className="material-icons-round text-slate-300 dark:text-slate-600">chevron_right</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-ios-lg">
            <div className="text-[10px] text-indigo-400 dark:text-indigo-300 font-bold mb-1 uppercase tracking-widest">Total Value</div>
            <div className="text-2xl font-bold dark:text-indigo-100">¥{(totalValue/1000).toFixed(1)}k</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-ios-lg">
            <div className="text-[10px] text-emerald-400 dark:text-emerald-300 font-bold mb-1 uppercase tracking-widest">Total Items</div>
            <div className="text-2xl font-bold dark:text-emerald-100">{items.length}</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-300 dark:text-slate-700 font-bold tracking-widest uppercase">Version 1.0.4 • Made with Love</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
