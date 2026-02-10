
import { Item, Category } from './types';

export const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    name: 'Vibe Coding Laptop',
    model: 'MacBook Pro 14" • M3 Max',
    category: '数码电子',
    tags: ['爱好', '电子产品'],
    price: 18500,
    usageHours: 22,
    icon: '💻',
    motivation: '打造一个极致的移动工作站，随时随地开启 Vibe Coding 模式，提升创造效率。',
    purchaseDate: '2024-01-15',
    accessories: [
      {
        id: 'a1',
        name: 'AppleCare+ 服务',
        expiryDate: '2026年1月25日',
        icon: 'verified_user',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500'
      },
      {
        id: 'a2',
        name: 'Magic Mouse 3',
        details: '已购配件 • ¥ 549',
        icon: 'mouse',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500'
      },
      {
        id: 'a3',
        name: 'iCloud+ 2TB',
        details: '自动续费 • ¥ 68.00/月',
        icon: 'cloud_queue',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500'
      }
    ]
  },
  {
    id: '2',
    name: 'AirPods Max',
    model: 'Sky Blue • Space Audio',
    category: '数码电子',
    tags: ['日常', '影音'],
    price: 3999,
    usageHours: 120,
    icon: '🎧',
    motivation: '沉浸式的降噪体验，让通勤路上的每一秒都属于自己的音乐世界。',
    purchaseDate: '2023-12-10',
    accessories: []
  },
  {
    id: '3',
    name: 'Cloud Sneakers',
    model: 'Sport White • Size 42',
    category: '服饰箱包',
    tags: ['运动', '舒适'],
    price: 1299,
    usageHours: 45,
    icon: '👟',
    motivation: '像踩在云朵上一样跑步。',
    purchaseDate: '2024-02-01',
    accessories: []
  }
];

export const CATEGORIES: { name: Category; icon: string }[] = [
  { name: '爱好', icon: '🎨' },
  { name: '数码电子', icon: '💻' },
  { name: '服饰箱包', icon: '👕' },
  { name: '书籍文化', icon: '📚' },
  { name: '居家生活', icon: '🏠' },
  { name: '习惯', icon: '✨' },
  { name: '职业', icon: '💼' }
];
