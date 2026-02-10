# 统计页面迁移到轻量级图表库

## 迁移原因

VChart 体积过大，影响小程序包大小。已迁移到自定义的轻量级图表库 WxCharts。

## 迁移完成

### 已完成的工作

1. ✅ 创建了轻量级图表库 `utils/wxCharts.js`

   - 支持柱状图 (column)
   - 支持折线图 (line)
   - 支持饼图 (pie)
   - 基于 Canvas 2D API
   - 体积小巧，仅包含必要功能

2. ✅ 更新了 `pages/stats/index.js`

   - 移除了 VChart 依赖
   - 引入 WxCharts 库
   - 重写了图表初始化逻辑
   - 重写了图表更新逻辑
   - 保持了所有原有功能

3. ✅ 更新了 `pages/stats/index.wxml`

   - 移除了 VChart 组件
   - 使用原生 canvas 元素
   - 使用 type="2d" 以支持新版 Canvas API

4. ✅ 更新了 `pages/stats/index.json`

   - 移除了 chart 组件引用

5. ✅ 更新了 `pages/stats/index.less`
   - 添加了 canvas 样式

## 功能保持

所有原有功能均已保留：

- ✅ 三个图表正常显示
- ✅ 按数量/按价值切换
- ✅ 按年/按月统计
- ✅ 时间范围筛选
- ✅ 数据格式化（金额、数量）
- ✅ 图表颜色（马卡龙配色）
- ✅ 图例显示

## WxCharts 特点

- 轻量级：仅 ~200 行代码
- 专为微信小程序优化
- 支持 Canvas 2D API
- 简单易用的 API
- 支持数据更新

## 使用方式

### 初始化图表

```javascript
const chart = new WxCharts({
  canvasId: "chart1",
  context: this,
  type: "column", // 'column', 'line', 'pie'
  categories: ["1月", "2月", "3月"],
  series: [{ name: "数量", data: [10, 20, 30] }],
  width: 375,
  height: 200,
  padding: [20, 15, 30, 15],
  dataLabel: true,
  colors: ["#C5CAE9"],
});
```

### 更新数据

```javascript
chart.updateData({
  categories: ["4月", "5月", "6月"],
  series: [{ name: "数量", data: [15, 25, 35] }],
});
```

## 注意事项

1. Canvas 必须使用 `type="2d"` 属性
2. 需要在 `onReady` 生命周期中初始化图表
3. 图表尺寸基于实际窗口宽度计算
4. 饼图的 series 数据格式为 `[{ name: '类别', data: 数值 }]`

## 体积对比

- VChart: ~500KB+
- WxCharts: ~10KB
- 减少了约 98% 的体积
