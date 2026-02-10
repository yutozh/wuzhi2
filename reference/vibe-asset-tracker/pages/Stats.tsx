
import React from 'react';
import { Item } from '../types';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

interface StatsProps {
  items: Item[];
}

const Stats: React.FC<StatsProps> = ({ items }) => {
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  // Mock data for trends
  const trendData = [
    { name: '9月', count: 45, value: 4200 },
    { name: '10月', count: 52, value: 5100 },
    { name: '11月', count: 60, value: 6800 },
    { name: '12月', count: 58, value: 7500 },
    { name: '1月', count: 72, value: 9800 },
    { name: '2月', count: 85, value: 12500 },
  ];

  const distributionData = [
    { name: '数码电子', value: 65, color: '#A5D8FF' },
    { name: '服饰箱包', value: 18, color: '#D0BFFF' },
    { name: '书籍文化', value: 12, color: '#FFD8A8' },
    { name: '居家生活', value: 5, color: '#B2F2BB' },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 pt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">数据统计</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">记录你的资产成长轨迹</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-3xl text-center shadow-sm">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold mb-1 uppercase tracking-wider text-nowrap">总价值</p>
          <p className="text-xl font-bold">¥{(totalValue/1000).toFixed(1)}k</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-3xl text-center shadow-sm">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold mb-1 uppercase tracking-wider text-nowrap">本月新增</p>
          <p className="text-xl font-bold">12</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-3xl text-center shadow-sm">
          <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold mb-1 uppercase tracking-wider text-nowrap">记录天数</p>
          <p className="text-xl font-bold">48<span className="text-xs ml-0.5">d</span></p>
        </div>
      </div>

      {/* Item Count Trend */}
      <section className="bg-white dark:bg-card-dark p-6 rounded-ios-lg shadow-sm border border-slate-50 dark:border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white">物品数量趋势</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">Last 6 Months</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" fill="#C5CAE9" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Asset Value Growth */}
      <section className="bg-white dark:bg-card-dark p-6 rounded-ios-lg shadow-sm border border-slate-50 dark:border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white">资产总值增长</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">Total</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#A5D6A7" strokeWidth={3} dot={false} tension={0.4} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Distribution */}
      <section className="bg-white dark:bg-card-dark p-6 rounded-ios-lg shadow-sm border border-slate-50 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white">年度价值分布</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">2024</span>
        </div>
        <div className="flex items-center">
          <div className="w-1/2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2">
            {distributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-400 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stats;
