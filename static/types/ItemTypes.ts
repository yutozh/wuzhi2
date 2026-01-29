// 枚举类型定义
export enum AveragePriceCalculationMethod {
  BY_DAY = "BY_DAY",
  BY_USAGE_COUNT = "BY_USAGE_COUNT",
}

export enum EntityType {
  PHYSICAL = "PHYSICAL",
  VIRTUAL = "VIRTUAL",
  SERVICE = "SERVICE",
}

export enum StatusType {
  NORMAL = "NORMAL",
  LOST = "LOST",
  DAMAGED = "DAMAGED",
  RETIRED = "RETIRED",
}
// // 基础物品数据接口
// export interface BaseItemData {
//   name: string;
//   brand?: string;
//   category: string;
//   icon: string;
//   images: string[];
//   quantity: number;
//   purchasePrice: number; // 单位为分 整数
//   purchaseDate: string; // ISO 8601 格式
//   retireDate?: string; // 可选，ISO 8601 格式
//   averagePriceCalculationMethod: AveragePriceCalculationMethod;
//   entityType: EntityType;
//   remarks?: string;
//   [key: string]: any; // 支持后期添加属性
// }

// // 关联物品接口
// export interface AssociatedItem extends BaseItemData {
//   id: string;
//   parentId: string; // 主物品ID
//   createdAt: string;
//   updatedAt: string;
// }

// // 主物品接口
// export interface Item extends BaseItemData {
//   id: string;
//   associatedItems: AssociatedItem[];
//   createdAt: string;
//   updatedAt: string;
// }

// // 查找条件接口
// export interface SearchCondition {
//   name?: string;
//   category?: string;
//   purchaseDateStart?: string;
//   purchaseDateEnd?: string;
//   priceMin?: number;
//   priceMax?: number;
//   entityType?: EntityType;
//   [key: string]: any;
// }

// // 查找结果接口
// export interface SearchResult {
//   item: Item;
//   matchedAssociatedItem?: AssociatedItem; // 如果是通过关联物品找到的，标记匹配的关联物品
// }
