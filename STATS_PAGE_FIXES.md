# 统计页面细节修复

## 修复内容

### 1. 图表切换时重新绘制

**问题**：切换"按数量/按价值"时，图表没有重新绘制

**解决方案**：

- 在图表数据生成时保存完整的年月信息（year, month）
- 在 `updateChart1()`, `updateChart2()`, `updateChart3()` 方法中，将完整数据传递给图表
- 图表配置会根据数据类型变化而重新生成

### 2. Tooltip 格式化

**问题**：

- 按月显示时只显示"x月"，没有年份
- 数值没有单位和格式化

**解决方案**：

- 添加自定义 `tooltip.formatter` 函数
- 根据 `datum.month` 判断是否为月份数据，显示完整的"xxxx年x月"
- 价值类型使用 `¥xxx,xxx` 格式（使用 `toLocaleString('zh-CN')`）
- 数量类型使用 `x件` 格式
- 饼图额外显示占比百分比

**示例代码**：

```javascript
tooltip: {
  visible: true,
  renderMode: 'canvas',
  formatter: (datum) => {
    const timeLabel = datum.month
      ? `${datum.year}年${datum.month}月`
      : `${datum.year}年`;
    const valueLabel = isValue
      ? `¥${datum.rawValue.toLocaleString('zh-CN')}`
      : `${datum.rawValue}件`;
    return {
      title: timeLabel,
      content: [
        {
          key: isValue ? '价值' : '数量',
          value: valueLabel,
        },
      ],
    };
  },
}
```

### 3. 月份选择器改为级联模式

**问题**：月份筛选使用年月组合一起拖动，不够灵活

**解决方案**：

- 使用 `mode="multiSelector"` 实现级联选择
- 第一列选择年份，第二列选择月份
- 数据结构：
  ```javascript
  yearOptions: [{ label: "2024年", value: 2024 }, ...]
  monthOptions: [{ label: "1月", value: 1 }, ...]
  ```
- 事件处理：
  ```javascript
  onStartYearMonthChange(event) {
    const [yearIndex, monthIndex] = event.detail.value;
    const startMonthYear = this.data.yearOptions[yearIndex].value;
    const startMonth = this.data.monthOptions[monthIndex].value;
    // ...
  }
  ```

### 4. 数据结构更新

新增字段：

```javascript
data: {
  // 月份级联选择器
  startMonthYear: 2023,  // 开始年份
  startMonth: 12,        // 开始月份
  endMonthYear: 2024,    // 结束年份
  endMonth: 11,          // 结束月份

  monthOptions: [
    { label: "1月", value: 1 },
    { label: "2月", value: 2 },
    // ...
  ],
}
```

图表数据增加完整信息：

```javascript
chart1Data: [
  {
    name: "1月",
    year: 2024,
    month: 1,
    count: 5,
    value: 1000,
  },
  // ...
];
```

## 测试要点

1. 切换"按数量/按价值"时，图表应该立即更新
2. 鼠标悬停或点击图表时，tooltip 应该显示：
   - 完整的时间（如"2024年1月"）
   - 格式化的数值（如"¥1,000"或"5件"）
3. 月份选择器应该可以分别选择年和月
4. 选择时间范围超过12个月时应该提示错误

## 技术细节

- 使用 VChart 的 `formatter` 函数自定义 tooltip
- 使用 `toLocaleString('zh-CN')` 格式化数字
- 使用 `mode="multiSelector"` 实现级联选择
- 保持数据的完整性，避免信息丢失
