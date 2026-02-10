
import React, { useState, useRef, useEffect } from 'react';
import { Item, Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';

interface HomeProps {
  items: Item[];
}

const Home: React.FC<HomeProps> = ({ items }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | '全部'>('全部');
  
  // Drag-to-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  const filteredItems = selectedCategory === '全部' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const categoryOptions = ['全部', ...CATEGORIES.map(c => c.name)];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-black relative select-none">
      {/* Top Background Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/50 dark:from-indigo-900/10 to-transparent pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="px-6 pt-14 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vault</h1>
          <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">Asset Management</p>
        </div>
        <div className="flex space-x-3">
          <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-100 dark:border-slate-800">
            <span className="material-icons-round text-xl">search</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
            <img src="https://picsum.photos/id/64/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Portfolio Card */}
      <div className="px-6 mb-10">
        <div className="bg-slate-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Net Worth</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center">
                <span className="material-icons-round text-[12px] mr-1">trending_up</span>
                +8.2%
              </span>
            </div>
            
            <div className="flex items-baseline mb-8">
              <span className="text-slate-600 text-2xl mr-1 font-medium">¥</span>
              <h2 className="text-5xl font-bold text-white tracking-tighter leading-none">
                {totalValue.toLocaleString()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-1">Vault Size</p>
                <p className="text-white font-black text-lg">{items.length} <span className="text-[10px] text-slate-500 font-medium">ITEMS</span></p>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-1">Activity</p>
                <p className="text-white font-black text-lg">High <span className="text-[10px] text-slate-500 font-medium">7D</span></p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute left-1/2 bottom-0 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
        </div>
      </div>

      {/* Category Overview - Refined as per request with Drag Support */}
      <div className="mb-6 relative">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex space-x-8 overflow-x-auto no-scrollbar px-6 items-end min-h-[60px] cursor-grab active:cursor-grabbing scroll-smooth`}
        >
          {categoryOptions.map((catName) => {
            const isActive = selectedCategory === catName;
            return (
              <button 
                key={catName}
                onClick={() => setSelectedCategory(catName as any)}
                className={`flex-shrink-0 transition-all duration-300 pb-2 relative group whitespace-nowrap outline-none ${
                  isActive 
                    ? 'text-2xl font-black text-slate-900 dark:text-white' 
                    : 'text-sm font-bold text-slate-400 dark:text-slate-600 hover:text-slate-600'
                }`}
              >
                {catName}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 dark:bg-white rounded-full animate-in fade-in slide-in-from-left-2 duration-300"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {selectedCategory === '全部' ? '最近记录' : `${selectedCategory} 列表`}
          </h3>
          <div className="flex items-center space-x-1">
             <span className="material-icons-round text-slate-300 text-sm">sort</span>
             <span className="text-[10px] font-bold text-slate-300 uppercase">Newest</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.slice(0, 10).map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight">{item.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-black text-primary/80 uppercase">{item.category}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] text-slate-400 font-bold">{item.purchaseDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">¥{item.price.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Value</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <span className="material-icons-round text-slate-200 dark:text-slate-800 text-6xl mb-4">folder_open</span>
              <p className="text-slate-400 font-bold text-sm">此分类暂无资产</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Footer Space */}
      <div className="h-20"></div>
    </div>
  );
};

export default Home;
