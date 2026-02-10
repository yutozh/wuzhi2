
import React, { useState } from 'react';
import { Item, Category } from '../types';
import { useNavigate } from 'react-router-dom';

interface CollectionProps {
  items: Item[];
}

const Collection: React.FC<CollectionProps> = ({ items }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const categories = Array.from(new Set(items.map(item => item.category)));

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6 pt-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Collection</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Inventory</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
            <span className="material-icons-round text-slate-400 text-xl">tune</span>
          </button>
          <button className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
            <span className="material-icons-round text-slate-400 text-xl">search</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input 
          type="text"
          placeholder="Search your vault..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      {categories.map(cat => {
        const catItems = filteredItems.filter(i => i.category === cat);
        if (catItems.length === 0) return null;

        return (
          <div key={cat} className="mb-8">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{catItems.length} Items</span>
            </div>
            <div className="space-y-4">
              {catItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="bg-white dark:bg-card-dark p-4 rounded-ios shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-3xl">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white text-sm">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {item.purchaseDate.split('-')[0]} • {item.tags[0]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      {item.price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">USD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Collection;
