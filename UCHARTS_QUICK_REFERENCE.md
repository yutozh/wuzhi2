# uCharts 快速参考

## 数据格式

### 柱状图/折线图

```javascript
{
  categories: ["1月", "2月", "3月"],
  series: [{
    name: "数量",
    data: [10, 20, 30]
  }]
}
```

### 饼图/环形图

```javascript
{
  series: [
    { name: "类别1", data: 30 },
    { name: "类别2", data: 50 },
    { name: "类别3", data: 20 },
  ];
}
```

## 常用配置

### 颜色

```javascript
opts: {
  color: ["#C5CAE9", "#A5D6A7"]; // 单色或多色数组
}
```

### 内边距

```javascript
opts: {
  padding: [15, 15, 0, 15]; // [上, 右, 下, 左]
}
```

### 图例

```javascript
opts: {
  legend: {
    show: false; // 隐藏图例
  }
}
```

### X轴

```javascript
opts: {
  xAxis: {
    disableGrid: true,   // 禁用网格线
    scrollShow: true     // 显示滚动条
  }
}
```

### Y轴

```javascript
opts: {
  yAxis: {
    data: [{ min: 0 }],  // 最小值
    gridType: "dash",     // 虚线网格
    dashLength: 4         // 虚线长度
  }
}
```

### 柱状图特殊配置

```javascript
opts: {
  extra: {
    column: {
      type: "group",           // 分组柱状图
      width: 30,               // 柱宽
      activeBgColor: "#A5B8D9",
      activeBgOpacity: 0.08
    }
  }
}
```

### 折线图特殊配置

```javascript
opts: {
  extra: {
    line: {
      type: "straight",   // 直线 | curve 曲线
      width: 2,           // 线宽
      activeType: "hollow" // 激活点样式
    }
  }
}
```

### 环形图特殊配置

```javascript
opts: {
  extra: {
    pie: {
      activeOpacity: 0.5,    // 激活透明度
      activeRadius: 10,      // 激活半径增量
      ringWidth: 50,         // 环形宽度
      border: true,          // 显示边框
      borderWidth: 2,        // 边框宽度
      borderColor: "#FFFFFF" // 边框颜色
    }
  }
}
```

## 更新图表

只需使用 setData 更新 chartData：

```javascript
this.setData({
  chart1ChartData: newData,
});
```

uCharts 会自动检测数据变化并重绘图表。

## 图表类型

- `column` - 柱状图
- `line` - 折线图
- `area` - 区域图
- `pie` - 饼图
- `ring` - 环形图
- `radar` - 雷达图
- `arcbar` - 圆弧进度条
- `gauge` - 仪表盘
- 更多类型见官方文档

## 注意事项

1. 必须在 JSON 中配置组件引用
2. 数据格式必须正确（categories + series 或 series）
3. 颜色配置在 opts.color 中，不是 CSS
4. 更新数据使用 setData，不需要手动调用更新方法
5. 图表会自动适应容器大小
