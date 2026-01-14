# Design Document: 首页优化

## Overview

本设计文档描述了微信小程序首页的优化方案。首页是用户管理物品的核心界面，需要提供清晰的信息展示、灵活的视图模式切换、便捷的筛选搜索功能。设计遵循现代、自然的视觉风格，避免过度设计，注重用户体验和性能。

## Architecture

### 组件结构

```
pages/home/
├── index.wxml      # 页面模板
├── index.js        # 页面逻辑
├── index.less      # 页面样式
└── index.json      # 页面配置
```

### 数据流

1. **初始化**: 从 ItemManager 加载物品数据
2. **筛选**: 用户选择分类 → 过滤物品列表 → 更新视图
3. **搜索**: 用户输入关键词 → 实时过滤 → 更新视图
4. **模式切换**: 用户切换视图模式 → 保存偏好 → 重新渲染
5. **刷新**: 用户下拉 → 重新加载数据 → 更新视图

### 状态管理

页面维护以下状态：

- `items`: 当前展示的物品列表
- `allItems`: 所有物品的完整列表
- `viewMode`: 当前视图模式 ('list' | 'card')
- `selectedCategory`: 当前选中的分类
- `searchQuery`: 当前搜索关键词
- `totalCount`: 物品总数
- `totalValue`: 物品总价值

## Components and Interfaces

### 1. 统计卡片组件 (Statistics Card)

**功能**: 展示物品总数和总价值

**布局**:

```
┌─────────────────────────────┐
│  123        ¥12,345.00      │
│  总物品数量    总价值         │
└─────────────────────────────┘
```

**样式特点**:

- 白色背景，圆角卡片
- 使用网格布局，左右两列
- 数字使用大字号、粗体
- 标签使用小字号、灰色

### 2. 搜索栏组件 (Search Bar)

**功能**: 提供关键词搜索功能

**布局**:

```
┌─────────────────────────────┐
│ 🔍  搜索物品...              │
└─────────────────────────────┘
```

**交互**:

- 实时搜索（输入时触发）
- 支持清除按钮
- 搜索图标固定在左侧

### 3. 分类筛选器 (Category Filter)

**功能**: 按分类筛选物品

**布局**:

```
┌──────┬──────┬──────┬──────┐
│ 全部 │数码产品│衣物鞋包│日常家居│ →
└──────┴──────┴──────┴──────┘
```

**样式**:

- 横向滚动
- 选中状态：绿色背景 + 白色文字
- 未选中状态：白色背景 + 灰色文字 + 边框
- 圆角胶囊形状

### 4. 视图模式切换器 (View Mode Toggle)

**功能**: 在列表模式和卡片模式之间切换

**位置**: 搜索栏右侧

**图标**:

- 列表模式: ☰ (三条横线)
- 卡片模式: ⊞ (网格图标)

### 5. 列表模式物品卡片 (List Mode Item Card)

**布局**:

```
┌─────────────────────────────────────┐
│ ┌────┐                              │
│ │图片│ 物品名称                      │
│ │    │ 品牌名称              ¥123.00│
│ └────┘ [分类]                  x2   │
│        📍 位置信息                   │
└─────────────────────────────────────┘
```

**信息层级**:

- 主要信息: 物品名称（粗体）、价格（大字号、粗体）
- 次要信息: 品牌、分类标签、数量
- 辅助信息: 位置（小字号、灰色）

**样式**:

- 白色背景，圆角卡片
- 左侧：图片（圆角正方形）+ 信息
- 右侧：价格 + 数量（右对齐）
- 卡片间距：16rpx

### 6. 卡片模式物品卡片 (Card Mode Item Card)

**布局**:

```
┌──────────────┐ ┌──────────────┐
│              │ │              │
│    图片      │ │    图片      │
│              │ │              │
│ 物品名称     │ │ 物品名称     │
│ ¥123.00      │ │ ¥456.00      │
│ [分类]       │ │ [分类]       │
└──────────────┘ └──────────────┘
```

**信息层级**:

- 主要信息: 图片、物品名称、价格
- 次要信息: 分类标签

**样式**:

- 白色背景，圆角卡片
- 垂直布局：图片在上，信息在下
- 每行两个卡片，间距：12rpx
- 图片宽高比：1:1

### 7. 空状态组件 (Empty State)

**场景**: 搜索无结果或无物品

**布局**:

```
     📦
  暂无物品
  试试添加一些物品吧
```

**样式**:

- 居中显示
- 图标 + 文字
- 灰色调

## Data Models

### Item 数据结构

```javascript
{
  id: string,                    // 唯一标识
  name: string,                  // 物品名称
  brand: string,                 // 品牌
  category: string,              // 分类
  icon: string,                  // 图片URL
  images: string[],              // 图片列表
  quantity: number,              // 数量
  purchasePrice: number,         // 购入价格（分）
  purchasePriceDisplay: string,  // 显示价格（元）
  purchaseDate: string,          // 购入日期
  location: string,              // 位置
  associatedItems: Item[],       // 关联物品
  entityType: string,            // 实体类型
  createdAt: string,             // 创建时间
  updatedAt: string              // 更新时间
}
```

### ViewMode 枚举

```javascript
const ViewMode = {
  LIST: "list", // 列表模式
  CARD: "card", // 卡片模式
};
```

### 本地存储键

```javascript
const STORAGE_KEYS = {
  VIEW_MODE: "home_view_mode", // 视图模式偏好
  SCROLL_POSITION: "home_scroll_position", // 滚动位置
};
```

## 核心功能实现

### 1. 视图模式切换

```javascript
// 切换视图模式
toggleViewMode() {
  const newMode = this.data.viewMode === 'list' ? 'card' : 'list';
  this.setData({ viewMode: newMode });
  wx.setStorageSync('home_view_mode', newMode);
}

// 加载视图模式偏好
loadViewModePreference() {
  const savedMode = wx.getStorageSync('home_view_mode') || 'list';
  this.setData({ viewMode: savedMode });
}
```

### 2. 搜索和筛选

```javascript
// 搜索输入处理
onSearchInput(e) {
  const query = e.detail.value;
  this.setData({ searchQuery: query });
  this.filterItems();
}

// 分类选择
selectCategory(e) {
  const category = e.currentTarget.dataset.item;
  this.setData({ selectedCategory: category });
  this.filterItems();
}

// 过滤物品
filterItems() {
  const { allItems, searchQuery, selectedCategory } = this.data;

  let filtered = allItems;

  // 分类筛选
  if (selectedCategory !== '全部') {
    filtered = filtered.filter(item => item.category === selectedCategory);
  }

  // 搜索筛选
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query))
    );
  }

  // 更新统计信息
  const totalValue = filtered.reduce((sum, item) =>
    sum + item.purchasePrice, 0
  );

  this.setData({
    items: filtered,
    totalCount: filtered.length,
    totalValue: toPrice(totalValue)
  });
}
```

### 3. 物品详情导航

```javascript
// 点击物品
viewItem(e) {
  const item = e.currentTarget.dataset.item;
  // 保存滚动位置
  const query = wx.createSelectorQuery();
  query.select('.home-content').scrollOffset();
  query.exec((res) => {
    if (res[0]) {
      wx.setStorageSync('home_scroll_position', res[0].scrollTop);
    }
  });

  // 导航到详情页
  wx.navigateTo({
    url: `/pages/item-detail/index?id=${item.id}`
  });
}

// 恢复滚动位置
onShow() {
  const scrollTop = wx.getStorageSync('home_scroll_position');
  if (scrollTop) {
    wx.pageScrollTo({
      scrollTop,
      duration: 0
    });
    wx.removeStorageSync('home_scroll_position');
  }
}
```

### 4. 下拉刷新

```javascript
onRefresh() {
  this.setData({ enable: true });

  // 重新加载数据
  this.itemManager.updateData();
  this.loadData();

  setTimeout(() => {
    this.setData({ enable: false });
  }, 1000);
}
```

## 样式设计规范

### 颜色系统

```less
// 主色调
@primary-color: #34c759; // 绿色（强调色）
@text-primary: #1c1c1e; // 深灰（主要文字）
@text-secondary: #8e8e93; // 中灰（次要文字）
@text-tertiary: #c7c7cc; // 浅灰（辅助文字）

// 背景色
@bg-primary: #ffffff; // 白色（卡片背景）
@bg-secondary: #f2f2f7; // 浅灰（页面背景）

// 边框色
@border-color: #e5e5ea; // 边框
```

### 字体层级

```less
// 字号
@font-size-large: 48rpx; // 大标题（统计数字）
@font-size-title: 32rpx; // 标题（物品名称）
@font-size-body: 28rpx; // 正文（品牌、价格）
@font-size-small: 24rpx; // 小字（标签、位置）

// 字重
@font-weight-bold: 600; // 粗体
@font-weight-medium: 500; // 中等
@font-weight-regular: 400; // 常规
```

### 间距系统

```less
@spacing-xs: 8rpx; // 极小间距
@spacing-sm: 12rpx; // 小间距
@spacing-md: 16rpx; // 中等间距
@spacing-lg: 24rpx; // 大间距
@spacing-xl: 32rpx; // 超大间距
```

### 圆角

```less
@border-radius-sm: 12rpx; // 小圆角（标签）
@border-radius-md: 16rpx; // 中圆角（卡片）
@border-radius-lg: 24rpx; // 大圆角（搜索框）
@border-radius-full: 999rpx; // 全圆角（分类按钮）
```

### 阴影

```less
// 卡片阴影（轻微）
@shadow-card: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

// 悬浮阴影（中等）
@shadow-hover: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
```

## 响应式设计

### 断点

- 小屏幕: < 375px (iPhone SE)
- 中屏幕: 375px - 414px (iPhone 12/13)
- 大屏幕: > 414px (iPhone 12 Pro Max)

### 适配策略

1. **使用 rpx 单位**: 自动适配不同屏幕宽度
2. **弹性布局**: 使用 flex 布局适应内容变化
3. **图片适配**: 使用 mode="aspectFill" 保持比例
4. **触摸区域**: 最小 88rpx × 88rpx

## 性能优化策略

### 1. 图片优化

- 使用懒加载（lazy-load）
- 压缩图片质量
- 使用 WebP 格式
- 设置合理的图片尺寸

### 2. 列表优化

- 虚拟滚动（当物品数量 > 100）
- 分页加载（每页 20 条）
- 使用 wx:key 优化渲染

### 3. 数据缓存

- 缓存筛选结果
- 防抖搜索输入（300ms）
- 缓存图片资源

### 4. 渲染优化

- 使用 setData 批量更新
- 避免频繁的 setData 调用
- 使用 hidden 而非 wx:if（频繁切换时）

## Correctness Properties

_属性（Property）是系统在所有有效执行中应该保持为真的特征或行为。属性是人类可读规范和机器可验证正确性保证之间的桥梁。_

### Property 1: 物品信息完整性

_For any_ 物品，当渲染到页面时，应该包含所有必需的信息字段（名称、品牌、分类、价格、数量、图片）

**Validates: Requirements 1.1, 2.2**

### Property 2: 条件信息显示

_For any_ 物品，当且仅当该物品具有位置信息时，页面应该显示位置标识

**Validates: Requirements 1.2**

### Property 3: 关联物品提示

_For any_ 物品，当且仅当该物品具有关联物品时，页面应该显示关联物品数量提示

**Validates: Requirements 1.3**

### Property 4: 列表模式布局

_For any_ 物品列表，当视图模式为列表模式时，每行应该只包含一个物品

**Validates: Requirements 2.1**

### Property 5: 卡片模式布局

_For any_ 物品列表，当视图模式为卡片模式时，每行应该包含两个物品（最后一行可能只有一个）

**Validates: Requirements 3.1**

### Property 6: 卡片模式信息展示

_For any_ 物品，当在卡片模式下渲染时，应该显示核心信息（图片、名称、价格、分类）

**Validates: Requirements 3.2**

### Property 7: 视图模式切换

_For any_ 当前视图模式，点击切换按钮应该切换到另一个模式（列表↔卡片）

**Validates: Requirements 4.2**

### Property 8: 视图模式持久化（Round-trip）

_For any_ 视图模式，保存到本地存储后重新加载页面，应该恢复相同的视图模式

**Validates: Requirements 4.3, 4.4**

### Property 9: 切换模式时状态不变性

_For any_ 筛选和搜索状态，切换视图模式前后，筛选条件和搜索关键词应该保持不变

**Validates: Requirements 4.5**

### Property 10: 分类选项完整性

_For any_ 分类列表，页面应该渲染所有可用的分类选项（包括"全部"）

**Validates: Requirements 5.1**

### Property 11: 分类筛选正确性

_For any_ 选中的分类（非"全部"），展示的物品列表中所有物品的分类应该等于选中的分类

**Validates: Requirements 5.2**

### Property 12: 分类高亮状态

_For any_ 选中的分类，该分类按钮应该具有高亮样式（不同的背景色和文字色）

**Validates: Requirements 5.4**

### Property 13: 搜索过滤正确性

_For any_ 搜索关键词，展示的物品列表中所有物品的名称或品牌应该包含该关键词（不区分大小写）

**Validates: Requirements 6.2, 6.3**

### Property 14: 搜索清除功能

_For any_ 搜索状态，点击清除按钮后，搜索框应该为空且物品列表应该恢复到筛选前的状态

**Validates: Requirements 6.5**

### Property 15: 统计数量正确性

_For any_ 当前展示的物品列表，显示的总数量应该等于列表中物品的数量

**Validates: Requirements 7.1, 7.3**

### Property 16: 统计价值正确性

_For any_ 当前展示的物品列表，显示的总价值应该等于列表中所有物品价格的总和

**Validates: Requirements 7.2, 7.3**

### Property 17: 价格格式化

_For any_ 价格数值，显示时应该包含货币符号（¥）并使用千位分隔符

**Validates: Requirements 7.5**

### Property 18: 刷新数据更新

_For any_ 物品列表，执行刷新操作后，应该重新从 ItemManager 加载最新数据

**Validates: Requirements 8.2**

### Property 19: 刷新状态指示

_For any_ 刷新操作，在刷新进行中时应该显示加载状态，刷新完成后应该隐藏加载状态

**Validates: Requirements 8.3, 8.5**

### Property 20: 物品导航参数传递

_For any_ 物品，点击后导航到详情页面时，应该传递正确的物品ID作为URL参数

**Validates: Requirements 9.1, 9.2**

### Property 21: 返回状态恢复（Round-trip）

_For any_ 页面状态（滚动位置、筛选条件、搜索关键词），导航到详情页后返回，应该恢复到之前的状态

**Validates: Requirements 9.4**

### Property 22: 触摸区域最小尺寸

_For any_ 可交互元素（按钮、物品卡片），其触摸区域的宽度和高度应该不小于 88rpx

**Validates: Requirements 10.3**

### Property 23: 大数据量优化

_For any_ 物品列表，当数量超过100时，应该启用虚拟滚动或分页加载机制

**Validates: Requirements 11.1**

### Property 24: 图片懒加载

_For any_ 物品图片，应该在进入视口时才开始加载，而不是页面初始化时全部加载

**Validates: Requirements 11.2**

### Property 25: 图片缓存

_For any_ 已加载的图片，再次访问时应该从缓存读取，而不是重新请求网络资源

**Validates: Requirements 11.3**

### Property 26: 对比度可访问性

_For any_ 文字元素，其与背景的对比度应该满足 WCAG AA 标准（至少 4.5:1）

**Validates: Requirements 12.5**

## Error Handling

### 1. 数据加载错误

**场景**: ItemManager 加载数据失败

**处理策略**:

- 捕获异常并记录日志
- 显示友好的错误提示
- 提供重试按钮
- 使用空数组作为降级方案

```javascript
try {
  this.itemManager.updateData();
  this.loadData();
} catch (error) {
  console.error("加载数据失败:", error);
  wx.showToast({
    title: "加载失败，请重试",
    icon: "none",
  });
  this.setData({ items: [] });
}
```

### 2. 图片加载错误

**场景**: 物品图片URL无效或加载失败

**处理策略**:

- 使用 binderror 事件监听图片加载失败
- 显示默认占位图标
- 记录失败的图片URL

```wxml
<image
  src="{{item.icon}}"
  binderror="onImageError"
  data-id="{{item.id}}"
/>
```

```javascript
onImageError(e) {
  const itemId = e.currentTarget.dataset.id;
  const items = this.data.items.map(item => {
    if (item.id === itemId) {
      return { ...item, icon: '/static/default-icon.png' };
    }
    return item;
  });
  this.setData({ items });
}
```

### 3. 搜索输入错误

**场景**: 用户输入特殊字符或超长文本

**处理策略**:

- 限制搜索关键词最大长度（50字符）
- 转义特殊字符
- 防抖处理避免频繁搜索

```javascript
onSearchInput(e) {
  let query = e.detail.value;

  // 限制长度
  if (query.length > 50) {
    query = query.substring(0, 50);
  }

  // 防抖
  clearTimeout(this.searchTimer);
  this.searchTimer = setTimeout(() => {
    this.setData({ searchQuery: query });
    this.filterItems();
  }, 300);
}
```

### 4. 本地存储错误

**场景**: 本地存储空间不足或读写失败

**处理策略**:

- 使用 try-catch 包裹存储操作
- 失败时使用内存状态
- 提示用户清理存储空间

```javascript
saveViewModePreference(mode) {
  try {
    wx.setStorageSync('home_view_mode', mode);
  } catch (error) {
    console.error('保存视图模式失败:', error);
    if (error.errMsg.includes('exceed')) {
      wx.showToast({
        title: '存储空间不足',
        icon: 'none'
      });
    }
  }
}
```

### 5. 导航错误

**场景**: 导航到详情页失败

**处理策略**:

- 验证物品ID有效性
- 捕获导航异常
- 显示错误提示

```javascript
viewItem(e) {
  const item = e.currentTarget.dataset.item;

  if (!item || !item.id) {
    wx.showToast({
      title: '物品信息无效',
      icon: 'none'
    });
    return;
  }

  wx.navigateTo({
    url: `/pages/item-detail/index?id=${item.id}`,
    fail: (error) => {
      console.error('导航失败:', error);
      wx.showToast({
        title: '打开详情失败',
        icon: 'none'
      });
    }
  });
}
```

### 6. 空状态处理

**场景**: 无物品或搜索无结果

**处理策略**:

- 显示友好的空状态提示
- 提供操作建议（添加物品、修改搜索）
- 保持页面布局稳定

```wxml
<view wx:if="{{items.length === 0}}" class="empty-state">
  <image src="/static/empty-icon.png" class="empty-icon" />
  <text class="empty-text">
    {{searchQuery ? '未找到匹配的物品' : '暂无物品'}}
  </text>
  <text class="empty-hint">
    {{searchQuery ? '试试其他关键词' : '点击右下角按钮添加物品'}}
  </text>
</view>
```

## Testing Strategy

### 测试方法

本项目采用**双重测试策略**，结合单元测试和属性测试，确保全面的代码覆盖和正确性验证：

1. **单元测试**: 验证特定示例、边缘情况和错误条件
2. **属性测试**: 验证通用属性在所有输入下的正确性

两种测试方法是互补的，单元测试捕获具体的bug，属性测试验证通用的正确性。

### 测试框架

- **单元测试框架**: Jest（微信小程序测试工具）
- **属性测试框架**: fast-check（JavaScript属性测试库）
- **测试运行器**: 微信开发者工具 + Node.js

### 属性测试配置

每个属性测试必须：

- 运行至少 **100 次迭代**（由于随机化）
- 使用注释标记引用设计文档中的属性
- 标记格式: `// Feature: home-page-optimization, Property {number}: {property_text}`

### 测试用例组织

```
tests/
├── unit/                          # 单元测试
│   ├── home-display.test.js      # 显示相关测试
│   ├── home-filter.test.js       # 筛选相关测试
│   ├── home-search.test.js       # 搜索相关测试
│   └── home-navigation.test.js   # 导航相关测试
├── property/                      # 属性测试
│   ├── display-properties.test.js
│   ├── filter-properties.test.js
│   ├── state-properties.test.js
│   └── performance-properties.test.js
└── helpers/                       # 测试辅助工具
    ├── generators.js              # 数据生成器
    ├── mock-data.js               # 模拟数据
    └── test-utils.js              # 测试工具函数
```

### 单元测试示例

```javascript
// tests/unit/home-filter.test.js
describe("分类筛选功能", () => {
  test('选择"全部"分类应该显示所有物品', () => {
    const page = createPage();
    const allItems = [
      { id: "1", category: "数码产品" },
      { id: "2", category: "衣物鞋包" },
      { id: "3", category: "日常家居" },
    ];

    page.setData({ allItems, selectedCategory: "全部" });
    page.filterItems();

    expect(page.data.items).toHaveLength(3);
  });

  test("选择特定分类应该只显示该分类的物品", () => {
    const page = createPage();
    const allItems = [
      { id: "1", category: "数码产品" },
      { id: "2", category: "衣物鞋包" },
      { id: "3", category: "数码产品" },
    ];

    page.setData({ allItems, selectedCategory: "数码产品" });
    page.filterItems();

    expect(page.data.items).toHaveLength(2);
    expect(page.data.items.every((item) => item.category === "数码产品")).toBe(
      true
    );
  });

  test("搜索结果为空时应该显示空状态", () => {
    const page = createPage();
    page.setData({
      allItems: [{ id: "1", name: "iPhone" }],
      searchQuery: "Android",
    });
    page.filterItems();

    expect(page.data.items).toHaveLength(0);
  });
});
```

### 属性测试示例

```javascript
// tests/property/filter-properties.test.js
import fc from "fast-check";

// Feature: home-page-optimization, Property 11: 分类筛选正确性
describe("Property 11: 分类筛选正确性", () => {
  test("对于任意选中的分类，展示的物品都应该属于该分类", () => {
    fc.assert(
      fc.property(
        fc.array(itemGenerator()), // 生成随机物品列表
        fc.constantFrom(...categories), // 生成随机分类
        (items, selectedCategory) => {
          const page = createPage();
          page.setData({ allItems: items, selectedCategory });
          page.filterItems();

          const displayedItems = page.data.items;

          // 如果选择"全部"，应该显示所有物品
          if (selectedCategory === "全部") {
            return displayedItems.length === items.length;
          }

          // 否则，所有显示的物品都应该属于选中的分类
          return displayedItems.every(
            (item) => item.category === selectedCategory
          );
        }
      ),
      { numRuns: 100 } // 运行100次迭代
    );
  });
});

// Feature: home-page-optimization, Property 13: 搜索过滤正确性
describe("Property 13: 搜索过滤正确性", () => {
  test("对于任意搜索关键词，展示的物品名称或品牌都应该包含该关键词", () => {
    fc.assert(
      fc.property(
        fc.array(itemGenerator()),
        fc.string({ minLength: 1, maxLength: 20 }),
        (items, searchQuery) => {
          const page = createPage();
          page.setData({ allItems: items, searchQuery });
          page.filterItems();

          const displayedItems = page.data.items;
          const query = searchQuery.toLowerCase();

          return displayedItems.every(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              (item.brand && item.brand.toLowerCase().includes(query))
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: home-page-optimization, Property 15: 统计数量正确性
describe("Property 15: 统计数量正确性", () => {
  test("对于任意物品列表，显示的总数量应该等于列表长度", () => {
    fc.assert(
      fc.property(fc.array(itemGenerator()), (items) => {
        const page = createPage();
        page.setData({ items });
        page.updateStatistics();

        return page.data.totalCount === items.length;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: home-page-optimization, Property 16: 统计价值正确性
describe("Property 16: 统计价值正确性", () => {
  test("对于任意物品列表，显示的总价值应该等于所有物品价格的总和", () => {
    fc.assert(
      fc.property(fc.array(itemGenerator()), (items) => {
        const page = createPage();
        page.setData({ items });
        page.updateStatistics();

        const expectedTotal = items.reduce(
          (sum, item) => sum + item.purchasePrice,
          0
        );
        const displayedTotal = parseFloat(
          page.data.totalValue.replace(/,/g, "")
        );

        return Math.abs(displayedTotal - expectedTotal / 100) < 0.01;
      }),
      { numRuns: 100 }
    );
  });
});
```

### 数据生成器

```javascript
// tests/helpers/generators.js
import fc from "fast-check";

// 物品数据生成器
export const itemGenerator = () =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    brand: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
    category: fc.constantFrom(
      "数码产品",
      "衣物鞋包",
      "日常家居",
      "图书",
      "运动",
      "美妆",
      "家具电器",
      "其他"
    ),
    icon: fc.webUrl(),
    images: fc.array(fc.webUrl(), { maxLength: 5 }),
    quantity: fc.integer({ min: 1, max: 100 }),
    purchasePrice: fc.integer({ min: 0, max: 10000000 }), // 分
    purchaseDate: fc.date().map((d) => d.toISOString()),
    location: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    associatedItems: fc.constant([]),
    entityType: fc.constantFrom("PHYSICAL", "VIRTUAL", "SERVICE"),
  });

// 视图模式生成器
export const viewModeGenerator = () => fc.constantFrom("list", "card");

// 分类生成器
export const categoryGenerator = () =>
  fc.constantFrom(
    "全部",
    "数码产品",
    "衣物鞋包",
    "日常家居",
    "图书",
    "运动",
    "美妆",
    "家具电器",
    "其他"
  );
```

### 测试覆盖目标

- **代码覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **属性测试覆盖**: 所有26个正确性属性
- **单元测试覆盖**: 所有核心功能和边缘情况

### 持续集成

测试应该在以下情况下自动运行：

1. 提交代码前（pre-commit hook）
2. 推送到远程仓库时（CI/CD pipeline）
3. 创建Pull Request时
4. 合并到主分支前

### 性能测试

除了功能测试，还需要进行性能测试：

```javascript
// tests/performance/home-performance.test.js
describe("首页性能测试", () => {
  test("渲染100个物品应该在1秒内完成", async () => {
    const items = generateItems(100);
    const startTime = Date.now();

    const page = createPage();
    page.setData({ items });
    await page.render();

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test("搜索操作应该在300ms内完成", async () => {
    const items = generateItems(1000);
    const page = createPage();
    page.setData({ allItems: items, searchQuery: "test" });

    const startTime = Date.now();
    page.filterItems();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(300);
  });
});
```

### 可访问性测试

```javascript
// tests/accessibility/home-a11y.test.js
describe("首页可访问性测试", () => {
  test("所有文字与背景的对比度应该满足WCAG AA标准", () => {
    const page = createPage();
    const elements = page.getAllTextElements();

    elements.forEach((element) => {
      const contrast = calculateContrast(
        element.color,
        element.backgroundColor
      );
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  test("所有可交互元素的触摸区域应该不小于88rpx", () => {
    const page = createPage();
    const interactiveElements = page.getAllInteractiveElements();

    interactiveElements.forEach((element) => {
      expect(element.width).toBeGreaterThanOrEqual(88);
      expect(element.height).toBeGreaterThanOrEqual(88);
    });
  });
});
```
