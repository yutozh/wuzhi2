# 统计页面价格单位修复

## 问题

物品的 `purchasePrice` 字段以"分"为单位存储，但统计页面直接使用该值进行计算和显示，导致金额显示错误（实际金额的100倍）。

## 解决方案

在所有涉及价格计算和显示的地方，将价格从"分"转换为"元"（除以100）。

## 修改位置

### 1. calculateStats() - 统计卡片总价值

```javascript
// 总价值（分转元）
const totalValue =
  filteredItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0) / 100;

// 格式化显示（四舍五入）
const totalValueDisplay =
  totalValue >= 1000
    ? `¥${(totalValue / 1000).toFixed(1)}k`
    : `¥${Math.round(totalValue)}`;
```

### 2. generateChart1Data() - 图表1物品统计

```javascript
// 按年统计
timeData[year].value += (item.purchasePrice || 0) / 100; // 分转元

// 按月统计
timeData[key].value += (item.purchasePrice || 0) / 100; // 分转元
```

### 3. generateChart2Data() - 图表2累计趋势

```javascript
// 按年累计
cumulativeValue += (item.purchasePrice || 0) / 100; // 分转元

// 按月累计
cumulativeValue += (item.purchasePrice || 0) / 100; // 分转元
```

### 4. generateChart3Data() - 图表3价值分布

```javascript
// 总价值
const totalValue =
  items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0) / 100; // 分转元

// 各分类价值
categoryStats[category].value += (item.purchasePrice || 0) / 100; // 分转元
```

### 5. updateChart1/2/3() - 图表显示格式化

```javascript
// 价格显示时四舍五入到整数
const valueLabel = isValue
  ? `¥${Math.round(displayValue).toLocaleString("zh-CN")}`
  : `${displayValue}件`;
```

## 关键点

1. **转换时机**：在数据聚合阶段就进行转换，而不是在显示阶段
2. **四舍五入**：显示时使用 `Math.round()` 四舍五入到整数元
3. **千分位格式**：使用 `toLocaleString("zh-CN")` 添加千分位分隔符
4. **一致性**：所有涉及价格的计算都要进行转换

## 测试验证

1. 统计卡片的"总价值"应该显示正确的金额（元）
2. 图表1按价值显示时，tooltip 应该显示正确的金额
3. 图表2按价值显示时，累计价值应该正确
4. 图表3按价值显示时，各分类的价值和占比应该正确
5. 所有金额都应该使用千分位格式（如 ¥1,000）

## 示例

假设有一个物品 `purchasePrice = 199900`（1999元）：

- **转换前**：显示为 ¥199,900
- **转换后**：显示为 ¥2,000（四舍五入）

如果需要保留小数，可以修改为：

```javascript
const valueLabel = isValue
  ? `¥${displayValue.toFixed(2).toLocaleString("zh-CN")}`
  : `${displayValue}件`;
```

这样会显示为 ¥1,999.00
