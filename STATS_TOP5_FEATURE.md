# 价值分布 Top5 功能说明

## 功能概述

在价值分布图表下方添加了 Top5 分类详细展示，显示价值最高的5个分类及其占比。

## 功能特点

### 显示内容

1. **分类名称**：左侧显示分类名称
2. **总价值**：右侧显示该分类的总价值（格式化为货币）
3. **进度条**：显示该分类占所有分类总金额的比例
   - 进度条宽度 = 该分类价值 / 所有分类总价值 × 100%
   - 100% 表示占满整个进度条
   - 使用渐变色（紫色渐变）

### 显示条件

- 仅在"按价值"模式下显示
- 仅显示前5个价值最高的分类
- 如果没有数据则不显示

## 数据结构

```javascript
chart3Top5: [
  {
    name: "分类名称",
    value: 1234.56, // 原始价值（元）
    valuePercent: 45, // 占比百分比
    valueDisplay: "¥1,234.56", // 格式化显示
  },
];
```

## 样式设计

### 布局

- 位于价值分布图表下方
- 顶部有分隔线
- 标题："分类价值 Top 5"

### 每个分类项

- 上方：分类名称（左）+ 总价值（右）
- 下方：进度条
- 项目间距：24rpx

### 进度条

- 高度：8rpx
- 背景色：#f1f5f9（浅灰）
- 进度条颜色：紫色渐变（#667eea → #764ba2）
- 圆角：4rpx
- 动画：0.3s 过渡效果

### 颜色方案

- 分类名称：#1e293b（深灰）
- 价值金额：#667eea（紫色）
- 标题：#64748b（中灰）

## 实现细节

### 数据生成（index.js）

```javascript
// 在 generateChart3Data 函数中
const chart3Top5 = Object.entries(categoryStats)
  .map(([name, stats]) => ({
    name,
    value: stats.value,
    valuePercent:
      totalValue > 0 ? Math.round((stats.value / totalValue) * 100) : 0,
    valueDisplay: formatYuan(stats.value),
  }))
  .sort((a, b) => b.value - a.value) // 按价值降序
  .slice(0, 5); // 取前5个
```

### 模板结构（index.wxml）

```xml
<view class="top5-section" wx:if="{{chart3Type === 'value' && chart3Top5.length > 0}}">
  <view class="top5-title">分类价值 Top 5</view>
  <view class="top5-list">
    <view class="top5-item" wx:for="{{chart3Top5}}" wx:key="name">
      <view class="top5-header">
        <text class="top5-name">{{item.name}}</text>
        <text class="top5-value">{{item.valueDisplay}}</text>
      </view>
      <view class="top5-progress">
        <view class="top5-progress-bar" style="width: {{item.valuePercent}}%"></view>
      </view>
    </view>
  </view>
</view>
```

### 样式（index.less）

- `.top5-section` - 容器样式
- `.top5-title` - 标题样式
- `.top5-list` - 列表容器
- `.top5-item` - 单个分类项
- `.top5-header` - 名称和价值行
- `.top5-progress` - 进度条背景
- `.top5-progress-bar` - 进度条填充

## 交互行为

1. **切换到"按价值"**：显示 Top5 列表
2. **切换到"按数量"**：隐藏 Top5 列表
3. **数据更新**：自动重新计算并更新 Top5
4. **进度条动画**：宽度变化有平滑过渡效果

## 示例效果

```
分类价值 Top 5

电子产品                    ¥12,345.67
████████████████████████████████████ (45%)

服装鞋帽                    ¥8,234.56
████████████████████████ (30%)

家居用品                    ¥4,567.89
████████████ (15%)

图书音像                    ¥2,345.67
██████ (8%)

其他                        ¥567.89
██ (2%)
```

## 注意事项

1. 进度条宽度基于百分比，自动适应容器宽度
2. 价值显示使用 formatYuan 函数格式化
3. 仅在"按价值"模式下显示，避免混淆
4. 最多显示5个分类，即使有更多数据
5. 如果分类少于5个，显示所有分类

## 优化建议

1. 可以添加点击分类查看详情的功能
2. 可以添加展开/收起功能，显示更多分类
3. 可以添加排序切换（按价值/按数量）
4. 可以添加进度条上的百分比数字显示
5. 可以为不同价值区间使用不同颜色
