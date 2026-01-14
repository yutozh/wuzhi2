// 分类颜色映射
const CATEGORY_COLORS = {
  数码产品: "#007AFF",
  衣物鞋包: "#FF3B30",
  日常家居: "#34C759",
  图书: "#FF9500",
  运动: "#5856D6",
  美妆: "#FF2D92",
  家具电器: "#8E8E93",
  其他: "#6D6D70",
};

// 预设时间筛选选项
const TIME_FILTER_OPTIONS = [
  { label: "近7天", days: 7 },
  { label: "近30天", days: 30 },
  { label: "近3个月", days: 90 },
  { label: "近6个月", days: 180 },
  { label: "近1年", days: 365 },
  { label: "全部", days: -1 },
];

module.exports = {
  CATEGORY_COLORS,
  TIME_FILTER_OPTIONS,
};
