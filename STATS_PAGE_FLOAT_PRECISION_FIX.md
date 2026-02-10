# 浮点数精度问题修复

## 问题描述

在将价格从"分"转换为"元"时（除以100），出现了 JavaScript 浮点数精度问题，导致显示类似 `495.13000000000005` 的数值。

## 原因分析

JavaScript 使用 IEEE 754 双精度浮点数标准，某些十进制小数无法精确表示为二进制浮点数，导致计算时出现精度误差。

例如：

```javascript
49513 / 100; // 可能得到 495.13000000000005
```

## 解决方案

### 1. 创建辅助函数处理分转元

```javascript
// 辅助函数：将分转换为元，避免浮点数精度问题
function centsToYuan(cents) {
  return Math.round(cents) / 100;
}
```

**原理**：先对分进行四舍五入（确保是整数），再除以100，避免浮点数累加误差。

### 2. 创建金额格式化函数

```javascript
// 辅助函数：格式化金额显示
function formatYuan(yuan) {
  // 保留两位小数，去除末尾的0
  const fixed = yuan.toFixed(2);
  const trimmed = fixed.replace(/\.?0+$/, "");
  // 手动添加千分位分隔符
  const parts = trimmed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `¥${parts.join(".")}`;
}
```

**功能**：

- 保留两位小数
- 去除末尾无意义的0（如 `100.00` 显示为 `100`，`100.50` 显示为 `100.5`）
- 添加千分位分隔符（如 `1,000`）
- 添加货币符号 `¥`

### 3. 替换所有除以100的操作

**修改前**：

```javascript
timeData[year].value += (item.purchasePrice || 0) / 100;
```

**修改后**：

```javascript
timeData[year].value += centsToYuan(item.purchasePrice || 0);
```

### 4. 替换所有金额格式化

**修改前**：

```javascript
const valueLabel = isValue
  ? `¥${Math.round(displayValue).toLocaleString("zh-CN")}`
  : `${displayValue}件`;
```

**修改后**：

```javascript
const valueLabel = isValue ? formatYuan(displayValue) : `${displayValue}件`;
```

## 修改位置

1. **calculateStats()** - 总价值计算
2. **generateChart1Data()** - 图表1数据生成（按年和按月）
3. **generateChart2Data()** - 图表2数据生成（按年和按月累计）
4. **generateChart3Data()** - 图表3数据生成（总价值和分类价值）
5. **updateChart1()** - 图表1显示格式化
6. **updateChart2()** - 图表2显示格式化
7. **updateChart3()** - 图表3显示格式化

## 显示效果

| 原始值（分） | 转换后（元） | 格式化显示 |
| ------------ | ------------ | ---------- |
| 49513        | 495.13       | ¥495.13    |
| 100000       | 1000.00      | ¥1,000     |
| 100050       | 1000.50      | ¥1,000.5   |
| 199900       | 1999.00      | ¥1,999     |

## 技术要点

1. **先四舍五入再除法**：避免浮点数累加误差
2. **toFixed(2)**：统一保留两位小数
3. **正则去除末尾0**：`/\.?0+$/` 匹配小数点和末尾的0
4. **手动千分位**：`/\B(?=(\d{3})+(?!\d))/g` 每三位数字添加逗号
5. **一致性**：所有金额处理使用相同的函数

## 测试验证

1. 检查统计卡片的总价值显示
2. 检查图表tooltip中的金额显示
3. 确认没有出现类似 `495.13000000000005` 的数值
4. 确认千分位分隔符正确显示
5. 确认末尾无意义的0被正确去除
