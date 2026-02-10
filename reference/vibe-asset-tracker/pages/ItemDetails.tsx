
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item } from '../types';

interface ItemDetailsProps {
  items: Item[];
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ items }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const item = items.find(i => i.id === id);

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Item not found</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 relative h-full">
      {/* Semi-transparent background for modal effect */}
      <div className="flex-1" onClick={() => navigate('/')}></div>

      {/* Slide-up Content */}
      <div className="bg-white dark:bg-gray-900 rounded-t-ios-lg shadow-2xl h-[92%] flex flex-col overflow-hidden animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <button className="text-primary font-bold text-lg">编辑</button>
          <h2 className="text-lg font-bold dark:text-white">物品详情</h2>
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
          >
            <span className="material-icons-round text-gray-500 text-sm">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
          {/* Main Display */}
          <div className="flex flex-col items-center py-6 mb-4">
            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-ios shadow-inner flex items-center justify-center text-6xl mb-4">
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-1">{item.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{item.model}</p>
            <div className="flex space-x-2">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full">
                  {tag}
                </span>
              ))}
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full">
                {item.category}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-ios shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">购入价值</p>
              <p className="text-lg font-bold dark:text-white">¥ {item.price.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-ios shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">累计使用</p>
              <p className="text-lg font-bold dark:text-white">
                {item.usageHours} <span className="text-xs font-bold text-slate-400">HRS</span>
              </p>
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">关联服务与配件</h4>
              <button className="text-primary text-xs font-bold flex items-center">
                <span className="material-icons-round text-sm mr-1">add_circle_outline</span>添加
              </button>
            </div>
            
            <div className="space-y-3">
              {item.accessories.length > 0 ? (
                item.accessories.map(acc => (
                  <div key={acc.id} className="bg-white dark:bg-slate-800 p-4 rounded-ios shadow-sm flex items-center justify-between border border-slate-50 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${acc.iconBg} dark:opacity-20 rounded-xl flex items-center justify-center`}>
                        <span className={`material-icons-round ${acc.iconColor}`}>{acc.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {acc.expiryDate ? `到期日: ${acc.expiryDate}` : acc.details}
                        </p>
                      </div>
                    </div>
                    <span className="material-icons-round text-slate-300 text-lg">chevron_right</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-ios border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-medium italic">暂无关联项目</p>
                </div>
              )}
            </div>
          </div>

          {/* Motivation */}
          <div className="mt-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">使用动机</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-ios italic relative overflow-hidden">
              <span className="material-icons-round absolute -right-2 -top-2 text-primary opacity-5 text-6xl">format_quote</span>
              <p className="text-sm text-slate-600 dark:text-slate-300 relative z-10 leading-relaxed">
                "{item.motivation}"
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-gray-900 via-white dark:via-gray-900 pt-10 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
            记录一次使用
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ItemDetails;
