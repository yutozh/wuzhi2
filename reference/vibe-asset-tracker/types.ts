
export type Category = '数码电子' | '服饰箱包' | '书籍文化' | '居家生活' | '爱好' | '习惯' | '职业';

export interface Accessory {
  id: string;
  name: string;
  price?: number;
  expiryDate?: string;
  details?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface Item {
  id: string;
  name: string;
  model: string;
  category: Category;
  tags: string[];
  price: number;
  usageHours: number;
  icon: string;
  motivation: string;
  purchaseDate: string;
  accessories: Accessory[];
}

export interface StatsData {
  totalValue: number;
  totalItems: number;
  newThisMonth: number;
  recordingDays: number;
}
