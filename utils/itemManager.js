import {
  AveragePriceCalculationMethod,
  EntityType,
} from "../static/types/ItemTypes.js";

import { toPrice } from "./util.js";

// 数据验证错误类
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.isValidationError = true; // 添加明确的标识
  }
}

// 物品管理类
export class ItemManager {
  constructor() {
    this.items = [];
    this.categories = [
      "数码产品",
      "衣物鞋包",
      "日常家居",
      "图书",
      "运动",
      "美妆",
      "家具电器",
      "其他",
    ];
    this.STORAGE_KEY = "item_manager_data";
    this.CATEGORIES_STORAGE_KEY = "item_manager_categories";

    this.loadFromStorage();
    this.loadCategoriesFromStorage();
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // 获取当前时间戳
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // 数据验证
  validateItemData(data) {
    if (!data.name || data.name.trim() === "") {
      throw new ValidationError("物品名称不能为空");
    }

    if (!data.category || data.category.trim() === "") {
      throw new ValidationError("物品分类不能为空");
    }

    // 验证分类是否存在
    if (data.category && !this.categories.includes(data.category)) {
      throw new ValidationError("无效的物品分类，请先添加该分类");
    }

    if (data.purchasePrice === undefined || data.purchasePrice < 0) {
      throw new ValidationError("购入价格必须为非负数");
    }

    if (!data.purchaseDate) {
      throw new ValidationError("购入日期不能为空");
    }

    // 验证日期格式
    if (data.purchaseDate && isNaN(Date.parse(data.purchaseDate))) {
      throw new ValidationError("购入日期格式无效");
    }

    if (data.retireDate && isNaN(Date.parse(data.retireDate))) {
      throw new ValidationError("退役日期格式无效");
    }

    // 验证退役日期不能早于购入日期
    if (data.retireDate && data.purchaseDate) {
      const purchaseTime = new Date(data.purchaseDate).getTime();
      const retireTime = new Date(data.retireDate).getTime();
      if (retireTime < purchaseTime) {
        throw new ValidationError("退役日期不能早于购入日期");
      }
    }

    if (
      !Object.values(AveragePriceCalculationMethod).includes(
        data.averagePriceCalculationMethod,
      )
    ) {
      throw new ValidationError("无效的均价计算方式");
    }

    if (!Object.values(EntityType).includes(data.entityType)) {
      throw new ValidationError("无效的实体属性");
    }
  }

  // 创建物品
  createItem(data) {
    this.validateItemData(data);

    const now = this.getCurrentTimestamp();
    const newItem = {
      id: this.generateId(),
      ...data,
      associatedItems: [],
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  // 更新物品
  updateItem(id, data) {
    const item = this.items.find((item) => item.id === id);
    if (!item) {
      throw new Error("物品不存在");
    }

    // 创建合并后的数据进行验证
    const mergedData = { ...item, ...data };
    this.validateItemData(mergedData);

    // 更新物品数据
    Object.assign(item, data, { updatedAt: this.getCurrentTimestamp() });
    this.saveToStorage();
    return item;
  }

  // 删除物品
  deleteItem(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // 根据ID获取物品
  getItem(id) {
    return this.items.find((item) => item.id === id);
  }

  // 根据parent ID和关联物品ID获取物品
  getAssociatedItem(parentId, associatedId) {
    const parentItem = this.items.find((item) => item.id === parentId);
    if (!parentItem) {
      throw new Error("主物品不存在");
    }
    const associatedItem = parentItem.associatedItems.find(
      (item) => item.id === associatedId,
    );
    if (!associatedItem) {
      throw new Error("关联物品不存在");
    }
    return associatedItem;
  }

  // 重新加载物品和类别
  updateData() {
    this.loadFromStorage();
    this.loadCategoriesFromStorage();
  }

  // 获取所有物品
  getAllItems() {
    return [...this.items];
  }

  // 获取所有分类
  getCategories() {
    return [...this.categories];
  }

  // 添加新分类
  addCategory(category) {
    const trimmedCategory = category.trim();
    if (!trimmedCategory) {
      throw new ValidationError("分类名称不能为空");
    }

    if (this.categories.includes(trimmedCategory)) {
      return false; // 分类已存在
    }

    this.categories.push(trimmedCategory);
    this.saveCategoriesToStorage();
    return true;
  }

  // 检查分类是否存在
  categoryExists(category) {
    return this.categories.includes(category);
  }

  // 创建关联物品
  createAssociatedItem(parentId, data) {
    const parentItem = this.items.find((item) => item.id === parentId);
    if (!parentItem) {
      throw new Error("主物品不存在");
    }

    this.validateItemData(data);

    const now = this.getCurrentTimestamp();
    const newAssociatedItem = {
      id: this.generateId(),
      parentId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    parentItem.associatedItems.push(newAssociatedItem);
    parentItem.updatedAt = now;
    this.saveToStorage();
    return newAssociatedItem;
  }

  // 更新关联物品
  updateAssociatedItem(parentId, associatedId, data) {
    const parentItem = this.items.find((item) => item.id === parentId);
    if (!parentItem) {
      throw new Error("主物品不存在");
    }

    const associatedItem = parentItem.associatedItems.find(
      (item) => item.id === associatedId,
    );
    if (!associatedItem) {
      throw new Error("关联物品不存在");
    }

    // 创建合并后的数据进行验证
    const mergedData = { ...associatedItem, ...data };
    this.validateItemData(mergedData);

    // 更新关联物品数据
    const now = this.getCurrentTimestamp();
    Object.assign(associatedItem, data, { updatedAt: now });
    parentItem.updatedAt = now;
    this.saveToStorage();
    return associatedItem;
  }

  // 删除关联物品
  deleteAssociatedItem(parentId, associatedId) {
    const parentItem = this.items.find((item) => item.id === parentId);
    if (!parentItem) {
      throw new Error("主物品不存在");
    }

    const index = parentItem.associatedItems.findIndex(
      (item) => item.id === associatedId,
    );
    if (index === -1) {
      return false;
    }

    parentItem.associatedItems.splice(index, 1);
    parentItem.updatedAt = this.getCurrentTimestamp();
    this.saveToStorage();
    return true;
  }

  // 搜索物品
  searchItems(condition) {
    const results = [];

    for (const item of this.items) {
      // 检查主物品是否匹配
      if (this.matchesCondition(item, condition)) {
        results.push({ item });
      }

      // 检查关联物品是否匹配
      for (const associatedItem of item.associatedItems) {
        if (this.matchesCondition(associatedItem, condition)) {
          results.push({
            item,
            matchedAssociatedItem: associatedItem,
          });
        }
      }
    }

    return results;
  }

  // 检查物品是否匹配条件
  matchesCondition(item, condition) {
    // 名称匹配（模糊搜索）
    if (
      condition.name &&
      !item.name.toLowerCase().includes(condition.name.toLowerCase())
    ) {
      return false;
    }

    // 分类匹配（模糊搜索）
    if (
      condition.category &&
      !item.category.toLowerCase().includes(condition.category.toLowerCase())
    ) {
      return false;
    }

    // 购入日期范围
    if (condition.purchaseDateStart || condition.purchaseDateEnd) {
      const purchaseTime = new Date(item.purchaseDate).getTime();

      if (condition.purchaseDateStart) {
        const startTime = new Date(condition.purchaseDateStart).getTime();
        if (purchaseTime < startTime) {
          return false;
        }
      }

      if (condition.purchaseDateEnd) {
        const endTime = new Date(condition.purchaseDateEnd).getTime();
        if (purchaseTime > endTime) {
          return false;
        }
      }
    }

    // 价格范围
    if (
      condition.priceMin !== undefined &&
      item.purchasePrice < condition.priceMin
    ) {
      return false;
    }

    if (
      condition.priceMax !== undefined &&
      item.purchasePrice > condition.priceMax
    ) {
      return false;
    }

    // 实体属性
    if (condition.entityType && item.entityType !== condition.entityType) {
      return false;
    }

    // 检查其他自定义条件
    for (const [key, value] of Object.entries(condition)) {
      if (
        [
          "name",
          "category",
          "purchaseDateStart",
          "purchaseDateEnd",
          "priceMin",
          "priceMax",
          "entityType",
        ].includes(key)
      ) {
        continue;
      }

      if (value !== undefined && item[key] !== value) {
        return false;
      }
    }

    return true;
  }

  // 保存到本地存储
  saveToStorage() {
    try {
      const data = JSON.stringify(this.items);
      wx.setStorageSync(this.STORAGE_KEY, data);
    } catch (error) {
      console.error("保存数据到本地存储失败:", error);
      throw new Error("保存数据失败");
    }
  }

  // 从本地存储加载
  loadFromStorage() {
    try {
      const data = wx.getStorageSync(this.STORAGE_KEY);
      if (data) {
        this.items = JSON.parse(data);
        // 将价格字段转换为显示格式
        this.items = this.items.map((item) => ({
          ...item,
          purchasePriceDisplay: toPrice(item.purchasePrice),
          associatedItems: item.associatedItems.map((assItem) => ({
            ...assItem,
            purchasePriceDisplay: toPrice(assItem.purchasePrice),
          })),
        }));
        console.log("从本地存储加载数据:", this.items);
      }
    } catch (error) {
      console.error("从本地存储加载数据失败:", error);
      this.items = [];
    }
  }

  // 保存分类到本地存储
  saveCategoriesToStorage() {
    try {
      const data = JSON.stringify(this.categories);
      wx.setStorageSync(this.CATEGORIES_STORAGE_KEY, data);
    } catch (error) {
      console.error("保存分类数据到本地存储失败:", error);
      throw new Error("保存分类数据失败");
    }
  }

  // 从本地存储加载分类
  loadCategoriesFromStorage() {
    try {
      const data = wx.getStorageSync(this.CATEGORIES_STORAGE_KEY);
      if (data) {
        const savedCategories = JSON.parse(data);
        const defaultCategories = [
          "数码产品",
          "衣物鞋包",
          "日常家居",
          "图书",
          "运动",
          "美妆",
          "家具电器",
          "其他",
        ];

        // 以已保存的顺序为准，补充缺失的默认分类到末尾
        const allCategories = [...savedCategories];
        defaultCategories.forEach((category) => {
          if (!allCategories.includes(category)) {
            allCategories.push(category);
          }
        });

        this.categories = allCategories;
      }
    } catch (error) {
      console.error("从本地存储加载分类数据失败:", error);
      // 保持默认分类
    }
  }

  // 清空所有数据
  clearAllData() {
    this.items = [];
    // 重置为默认分类
    this.categories = [
      "数码产品",
      "衣物鞋包",
      "日常家居",
      "图书",
      "运动",
      "美妆",
      "家具电器",
      "其他",
    ];
    try {
      wx.removeStorageSync(this.STORAGE_KEY);
      wx.removeStorageSync(this.CATEGORIES_STORAGE_KEY);
    } catch (error) {
      console.error("清空本地存储失败:", error);
    }
  }

  // 导出数据（用于备份）
  exportData() {
    return JSON.stringify(
      {
        items: this.items,
        categories: this.categories,
      },
      null,
      2,
    );
  }

  // 导入数据（用于恢复）
  importData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);

      // 兼容旧版本数据格式（只有items数组）
      if (Array.isArray(importedData)) {
        // 旧格式，只导入物品数据
        for (const item of importedData) {
          if (!item.id || !item.name || !item.category) {
            throw new Error("导入的数据包含无效的物品信息");
          }
        }
        this.items = importedData;
      } else if (importedData.items && Array.isArray(importedData.items)) {
        // 新格式，导入物品和分类数据
        for (const item of importedData.items) {
          if (!item.id || !item.name || !item.category) {
            throw new Error("导入的数据包含无效的物品信息");
          }
        }

        this.items = importedData.items;

        if (importedData.categories && Array.isArray(importedData.categories)) {
          // 合并分类，确保默认分类不会丢失
          const defaultCategories = [
            "数码产品",
            "衣物鞋包",
            "日常家居",
            "图书",
            "运动",
            "美妆",
            "家具电器",
            "其他",
          ];

          const allCategories = [...defaultCategories];
          importedData.categories.forEach((category) => {
            if (!allCategories.includes(category)) {
              allCategories.push(category);
            }
          });

          this.categories = allCategories;
        }
      } else {
        throw new Error("无效的数据格式");
      }

      this.saveToStorage();
      this.saveCategoriesToStorage();
    } catch (error) {
      console.error("导入数据失败:", error);
      throw new Error("导入数据失败: " + error.message);
    }
  }
}
