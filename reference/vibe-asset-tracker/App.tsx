
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { INITIAL_ITEMS } from './constants';
import { Item, StatsData } from './types';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import AddItem from './pages/AddItem';
import ItemDetails from './pages/ItemDetails';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const addItem = (newItem: Item) => {
    setItems(prev => [newItem, ...prev]);
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-white dark:bg-gray-900 overflow-hidden shadow-2xl relative">
        <Routes>
          <Route path="/" element={<Home items={items} />} />
          <Route path="/collection" element={<Collection items={items} />} />
          <Route path="/stats" element={<Stats items={items} />} />
          <Route path="/profile" element={<Profile items={items} />} />
          <Route path="/add" element={<AddItem onAdd={addItem} />} />
          <Route path="/item/:id" element={<ItemDetails items={items} />} />
        </Routes>
        <NavBar />
      </div>
    </HashRouter>
  );
};

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Don't show navbar on Add Item or Item Detail pages for full screen effect if needed
  // But standard is keeping it fixed
  const hideNav = location.pathname.startsWith('/add') || location.pathname.includes('/item/');

  return (
    <nav className={`fixed bottom-0 w-full max-w-[430px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800 px-8 py-4 flex justify-between items-center z-50 transition-transform ${hideNav ? 'translate-y-24' : 'translate-y-0'}`}>
      <button 
        onClick={() => navigate('/')}
        className={`${isActive('/') ? 'text-primary' : 'text-slate-400 dark:text-slate-600'} transition-colors`}
      >
        <span className="material-icons-round text-2xl">home</span>
      </button>
      <button 
        onClick={() => navigate('/stats')}
        className={`${isActive('/stats') ? 'text-primary' : 'text-slate-400 dark:text-slate-600'} transition-colors`}
      >
        <span className="material-icons-round text-2xl">bar_chart</span>
      </button>
      
      {/* Centered Add Button */}
      <button 
        onClick={() => navigate('/add')}
        className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 -mt-10 border-4 border-white dark:border-gray-900 active:scale-90 transition-transform"
      >
        <span className="material-icons-round">add</span>
      </button>

      <button 
        onClick={() => navigate('/collection')}
        className={`${isActive('/collection') ? 'text-primary' : 'text-slate-400 dark:text-slate-600'} transition-colors`}
      >
        <span className="material-icons-round text-2xl">grid_view</span>
      </button>
      <button 
        onClick={() => navigate('/profile')}
        className={`${isActive('/profile') ? 'text-primary' : 'text-slate-400 dark:text-slate-600'} transition-colors`}
      >
        <span className="material-icons-round text-2xl">person</span>
      </button>
    </nav>
  );
};

export default App;
