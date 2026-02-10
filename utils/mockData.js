// 模拟数据生成器，用于测试统计功能

export function generateMockItems() {
  const categories = [
    "数码产品",
    "衣物鞋包",
    "日常家居",
    "图书",
    "运动",
    "美妆",
    "家具电器",
    "其他",
  ];
  const mockItems = [];

  // 生成过去6个月的数据
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    // 随机生成购买日期（过去6个月内）
    const monthsAgo = Math.floor(Math.random() * 6);
    const daysAgo = Math.floor(Math.random() * 30);
    const purchaseDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsAgo,
      now.getDate() - daysAgo
    );

    const item = {
      id: `mock_${i}`,
      name: `物品${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      purchasePrice: Math.floor(Math.random() * 8000) + 200, // 200-8200元
      purchaseDate: purchaseDate.toISOString(),
      brand: `品牌${Math.floor(Math.random() * 10) + 1}`,
      quantity: 1,
      entityType: "PHYSICAL",
      averagePriceCalculationMethod: "BY_DAY",
      icon: "📱",
      images: [],
      associatedItems: [],
      createdAt: purchaseDate.toISOString(),
      updatedAt: purchaseDate.toISOString(),
    };

    mockItems.push(item);
  }

  return mockItems;
}

// 将模拟数据保存到本地存储
export function saveMockDataToStorage() {
  const mockItems = generateMockItems();
  try {
    wx.setStorageSync("item_manager_data", JSON.stringify(mockItems));
    console.log("模拟数据已保存到本地存储");
    return true;
  } catch (error) {
    console.error("保存模拟数据失败:", error);
    return false;
  }
}

// 清除模拟数据
export function clearMockData() {
  try {
    wx.removeStorageSync("item_manager_data");
    console.log("模拟数据已清除");
    return true;
  } catch (error) {
    console.error("清除模拟数据失败:", error);
    return false;
  }
}
