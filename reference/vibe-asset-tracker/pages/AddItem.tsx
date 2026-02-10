
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { Item, Category } from '../types';
import { generateMotivation, suggestTags } from '../geminiService';

interface AddItemProps {
  onAdd: (item: Item) => void;
}

const AddItem: React.FC<AddItemProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '数码电子' as Category,
    price: '',
    motivation: '',
    icon: '✨',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleAISuggest = async () => {
    if (!form.name) return;
    setLoading(true);
    const motivation = await generateMotivation(form.name, form.category);
    const tags = await suggestTags(form.name);
    setForm(prev => ({ ...prev, motivation }));
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      name: form.name,
      model: `${form.category} • New`,
      category: form.category,
      tags: ['New'],
      price: parseFloat(form.price),
      usageHours: 0,
      icon: form.icon,
      motivation: form.motivation || '开启一段新旅程。',
      purchaseDate: form.purchaseDate,
      accessories: []
    };

    onAdd(newItem);
    navigate('/');
  };

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto no-scrollbar pb-10">
      <header className="px-6 py-6 pt-12 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">添加项目</h1>
        <button 
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
        >
          <span className="material-icons-round text-[20px]">close</span>
        </button>
      </header>

      <main className="px-6 space-y-8">
        <section>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">分类</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setForm(prev => ({ ...prev, category: cat.name }))}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  form.category === cat.name 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary border-indigo-100 dark:border-indigo-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">项目名称</label>
          <div className="relative">
            <input 
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200"
              placeholder="例如：跑步、学习日语、Vibe Coding"
            />
            {form.name && (
              <button 
                onClick={handleAISuggest}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 rounded-xl px-3 py-1.5 flex items-center space-x-1 text-xs text-primary font-bold hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="material-icons-round text-sm">auto_awesome</span>
                <span>{loading ? 'AI Thinking...' : 'AI 润色'}</span>
              </button>
            )}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">备注 / 动机 (可选)</label>
          <textarea 
            value={form.motivation}
            onChange={(e) => setForm(prev => ({ ...prev, motivation: e.target.value }))}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 resize-none h-32"
            placeholder="你的憧憬是什么？"
          />
        </section>

        <div className="grid grid-cols-2 gap-4">
          <section>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">购入日期</label>
            <input 
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
              className="w-full h-14 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300"
            />
          </section>
          <section>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">初始价值 (¥)</label>
            <input 
              type="number"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-center font-bold"
              placeholder="0"
            />
          </section>
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 mt-6 shadow-lg ${
            form.name && form.price 
            ? 'bg-primary text-white shadow-primary/30' 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          保存项目
        </button>
      </main>
    </div>
  );
};

export default AddItem;
