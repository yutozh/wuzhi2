# VChart 图表更新和 Tooltip 修复

## 问题分析

### 问题1：图表切换时不重新绘制

**原因**：在微信小程序中，VChart 组件需要通过 `setData` 改变 spec 对象的引用才能触发重新渲染。简单地修改 data 中的某个字段不会触发图表更新。

### 问题2：Tooltip 格式化不生效

**原因**：微信小程序中的 VChart 不支持 `formatter` 函数（函数无法序列化传递给组件）。需要在数据准备阶段就格式化好所有显示文本。

## 解决方案

### 1. 数据预格式化

在 `updateChart1/2/3()` 方法中，将所有需要在 tooltip 中显示的内容预先格式化为字符串：

```javascript
const formattedData = this.data.chart1Data.map((item) => {
  const displayValue = item[dataField];
  const timeLabel = item.month
    ? `${item.year}年${item.month}月`
    : `${item.year}年`;
  const valueLabel = isValue
    ? `¥${displayValue.toLocaleString("zh-CN")}`
    : `${displayValue}件`;

  return {
    time: item.name,
    value: displayValue,
    timeLabel: timeLabel, // 预格式化的时间标签
    valueLabel: valueLabel, // 预格式化的数值标签
    typeLabel: isValue ? "价值" : "数量", // 预格式化的类型标签
  };
});
```

### 2. Tooltip 配置使用字段引用

使用 `tooltip.mark` 配置，通过字段名引用预格式化的数据：

```javascript
tooltip: {
  visible: true,
  mark: {
    title: {
      key: "timeLabel",
      value: "timeLabel",
    },
    content: [
      {
        key: "typeLabel",
        value: "valueLabel",
      },
    ],
  },
}
```

### 3. 强制触发图表更新

使用 `JSON.parse(JSON.stringify())` 创建新的对象引用：

```javascript
this.setData({
  chart1Options: JSON.parse(JSON.stringify(chart1Options)),
});
```

### 4. 切换类型时重新生成数据

在切换图表类型时，使用回调函数确保数据先更新，再更新图表配置：

```javascript
onChart1TypeChange() {
  const chart1Type = this.data.chart1Type === 'count' ? 'value' : 'count';
  this.setData({ chart1Type }, () => {
    // 回调中重新生成图表数据和配置
    this.generateChartData(itemManager.getAllItems());
    this.updateChart1();
  });
},
```

## 关键点

1. **不能使用函数**：微信小程序的 VChart 组件不支持 formatter 等函数配置
2. **数据预处理**：所有格式化工作必须在数据准备阶段完成
3. **对象引用**：必须改变对象引用才能触发图表重新渲染
4. **字段映射**：tooltip 通过字段名引用数据，而不是通过函数计算

## 数据格式示例

### 图表1和图表2（柱状图和折线图）

```javascript
{
  time: "1月",              // X轴显示
  value: 1000,             // Y轴数值
  timeLabel: "2024年1月",  // Tooltip 标题
  valueLabel: "¥1,000",    // Tooltip 数值
  typeLabel: "价值",       // Tooltip 类型标签
}
```

### 图表3（饼图）

```javascript
{
  type: "电子产品",        // 分类名称
  value: 45,              // 百分比数值
  valueLabel: "¥10,000",  // Tooltip 实际数值
  percentLabel: "45%",    // Tooltip 百分比
  typeLabel: "价值",      // Tooltip 类型标签
  color: "#A5D8FF",       // 颜色
}
```

## 测试验证

1. 切换"按数量/按价值"时，图表应该立即更新显示不同的数据
2. 鼠标悬停或点击图表时，tooltip 应该显示：
   - 完整的时间标签（如"2024年1月"）
   - 格式化的数值（如"¥1,000"或"5件"）
   - 正确的类型标签
3. 饼图应该显示实际数值和占比百分比

## 技术要点

- VChart 小程序版本的限制：不支持函数配置
- 数据驱动：所有显示内容都通过数据字段控制
- 深拷贝：使用 JSON 序列化确保对象引用改变
- 回调机制：使用 setData 回调确保数据更新顺序
