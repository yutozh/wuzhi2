import { ItemManager } from "../../utils/itemManager.js";
import { saveMockDataToStorage } from "../../utils/mockData.js";

const itemManager = new ItemManager();

// 辅助函数：将分转换为元，避免浮点数精度问题
function centsToYuan(cents) {
  return Math.round(cents) / 100;
}

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

Page({
  data: {
    loading: true,
    totalValue: 0,
    totalValueDisplay: "¥0",
    totalItems: 0,
    newThisMonth: 0,
    recordingDays: 0,

    // 统计粒度和范围
    granularity: "month", // 'year' 或 'month'
    granularityOptions: [
      { label: "按月", value: "month" },
      { label: "按年", value: "year" },
    ],
    granularityIndex: 0,

    // 时间范围
    startYear: "",
    endYear: "",
    startYearMonth: "",
    endYearMonth: "",
    startMonthYear: "", // 月份选择器的年份
    startMonth: "", // 月份选择器的月份
    endMonthYear: "", // 月份选择器的年份
    endMonth: "", // 月份选择器的月份
    yearOptions: [],
    monthOptions: [
      { label: "1月", value: 1 },
      { label: "2月", value: 2 },
      { label: "3月", value: 3 },
      { label: "4月", value: 4 },
      { label: "5月", value: 5 },
      { label: "6月", value: 6 },
      { label: "7月", value: 7 },
      { label: "8月", value: 8 },
      { label: "9月", value: 9 },
      { label: "10月", value: 10 },
      { label: "11月", value: 11 },
      { label: "12月", value: 12 },
    ],

    // 图表类型选择
    chart1Type: "count", // 'count' 或 'value'
    chart2Type: "count",
    chart3Type: "count",

    // 图表数据
    chart1Data: [],
    chart2Data: [],
    chart3Data: [],
    chart3Top5: [], // Top5 分类详细数据

    // uCharts 图表1配置（柱状图）
    chart1ChartData: {},
    chart1Opts: {
      color: ["#C5CAE9"],
      fontColor: "#888888",
      dataLabel: false,
      fontSize: 11,
      padding: [15, 0, 0, 0],
      enableScroll: false,
      legend: {
        show: false,
      },
      xAxis: {
        disableGrid: true,
        scrollShow: true,
        labelCount: 7,
        fontColor: "#888888",
        fontSize: 11,
      },
      yAxis: {
        data: [{ min: 0, fontColor: "#888888", fontSize: 11 }],
        gridType: "dash",
        dashLength: 4,
      },
      extra: {
        column: {
          type: "group",
          width: 20,
          activeBgColor: "#A5B8D9",
          activeBgOpacity: 0.08,
          barBorderRadius: [3, 3, 0, 0],
        },
      },
    },

    // uCharts 图表2配置（折线图）
    chart2ChartData: {},
    chart2Opts: {
      color: ["#A5D6A7"],
      fontColor: "#888888",
      dataLabel: false,
      padding: [15, 0, 0, 0],
      enableScroll: false,
      legend: {
        show: false,
      },
      xAxis: {
        disableGrid: true,
        scrollShow: true,
        labelCount: 7,
        fontColor: "#888888",
        fontSize: 11,
      },
      yAxis: {
        data: [{ min: 0, fontColor: "#888888", fontSize: 11 }],
        gridType: "dash",
        dashLength: 4,
      },
      extra: {
        line: {
          type: "straight",
          width: 3,
          activeType: "hollow",
        },
      },
    },

    // uCharts 图表3配置（饼图）
    chart3ChartData: {},
    chart3Opts: {
      color: [
        "#A5D8FF",
        "#D0BFFF",
        "#FFD8A8",
        "#B2F2BB",
        "#FFB3BA",
        "#BAFFC9",
        "#BAE1FF",
        "#FFFFBA",
      ],
      padding: [-45, -45, -45, -45],
      enableScroll: false,
      legend: {
        show: false,
      },
      title: {
        name: "",
        fontSize: 0,
        color: "#666666",
      },
      subtitle: {
        name: "",
        fontSize: 0,
        color: "#7cb5ec",
      },
      extra: {
        ring: {
          ringWidth: 30,
          activeOpacity: 0.5,
          activeRadius: 10,
          offsetAngle: 0,
          border: true,
          borderWidth: 3,
          borderColor: "#FFFFFF",
        },
      },
    },
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.refreshData();
  },

  onReady() {
    // 页面渲染完成后初始化图表
    this.updateCharts();
  },

  // 初始化数据
  initData() {
    const items = itemManager.getAllItems();

    // 初始化时间选项
    this.initTimeOptions(items);

    // 设置默认时间范围
    this.setDefaultTimeRange();

    // 刷新数据
    this.refreshData();
  },

  // 初始化时间选项
  initTimeOptions(items) {
    if (items.length === 0) return;

    // 获取所有年份
    const years = [
      ...new Set(
        items.map((item) => new Date(item.purchaseDate).getFullYear()),
      ),
    ];
    years.sort((a, b) => a - b);

    const yearOptions = years.map((year) => ({
      label: `${year}年`,
      value: year,
    }));

    this.setData({ yearOptions });
  },

  // 设置默认时间范围
  setDefaultTimeRange() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (this.data.granularity === "year") {
      // 默认近3年
      const endYear = currentYear;
      const startYear = Math.max(
        currentYear - 2,
        this.data.yearOptions[0]?.value || currentYear,
      );
      this.setData({ startYear, endYear });
    } else {
      // 默认近12个月
      const endYearMonth = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0",
      )}`;
      const startDate = new Date(currentYear, currentMonth - 12, 1);
      const startYearMonth = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      // 设置级联选择器的值
      const startMonthYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endMonthYear = currentYear;
      const endMonth = currentMonth;

      this.setData({
        startYearMonth,
        endYearMonth,
        startMonthYear,
        startMonth,
        endMonthYear,
        endMonth,
      });
    }
  },

  // 刷新数据
  refreshData() {
    itemManager.updateData();
    const items = itemManager.getAllItems();

    this.calculateStats(items);
    this.generateChartData(items);
    this.updateCharts();

    this.setData({ loading: false });
  },

  // 计算统计数据
  calculateStats(items) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 过滤时间范围内的数据
    const filteredItems = this.filterItemsByTimeRange(items);

    // 总价值（分转元）
    const totalValue = centsToYuan(
      filteredItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
    );

    // 本月新增
    const newThisMonth = items.filter((item) => {
      const purchaseDate = new Date(item.purchaseDate);
      return (
        purchaseDate.getMonth() === currentMonth &&
        purchaseDate.getFullYear() === currentYear
      );
    }).length;

    // 记录天数
    let recordingDays = 0;
    if (items.length > 0) {
      const firstDate = new Date(
        Math.min(...items.map((item) => new Date(item.purchaseDate))),
      );
      recordingDays = Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24));
    }

    // 格式化总价值显示
    const totalValueDisplay =
      totalValue >= 1000
        ? `¥${(totalValue / 1000).toFixed(1)}k`
        : `¥${Math.round(totalValue)}`;

    this.setData({
      totalValue,
      totalValueDisplay,
      totalItems: filteredItems.length,
      newThisMonth,
      recordingDays: Math.max(0, recordingDays),
    });
  },

  // 根据时间范围过滤物品
  filterItemsByTimeRange(items) {
    if (this.data.granularity === "year") {
      const startYear = this.data.startYear;
      const endYear = this.data.endYear;
      return items.filter((item) => {
        const year = new Date(item.purchaseDate).getFullYear();
        return year >= startYear && year <= endYear;
      });
    } else {
      const startYearMonth = this.data.startYearMonth;
      const endYearMonth = this.data.endYearMonth;
      return items.filter((item) => {
        const date = new Date(item.purchaseDate);
        const yearMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        return yearMonth >= startYearMonth && yearMonth <= endYearMonth;
      });
    }
  },

  // 生成图表数据
  generateChartData(items) {
    const filteredItems = this.filterItemsByTimeRange(items);

    // 生成图表1数据：物品统计（按时间段的购入统计）
    this.generateChart1Data(filteredItems);

    // 生成图表2数据：物品总值趋势（累计趋势）
    this.generateChart2Data(filteredItems);

    // 生成图表3数据：价值分布（按类别）
    this.generateChart3Data(filteredItems);
  },

  // 生成图表1数据：物品统计
  generateChart1Data(items) {
    const timeData = {};

    if (this.data.granularity === "year") {
      // 按年统计
      for (let year = this.data.startYear; year <= this.data.endYear; year++) {
        timeData[year] = {
          name: `${year}年`,
          year: year,
          count: 0,
          value: 0,
        };
      }

      items.forEach((item) => {
        const year = new Date(item.purchaseDate).getFullYear();
        if (timeData[year]) {
          timeData[year].count++;
          timeData[year].value += centsToYuan(item.purchasePrice || 0);
        }
      });
    } else {
      // 按月统计
      const start = new Date(this.data.startYearMonth + "-01");
      const end = new Date(this.data.endYearMonth + "-01");

      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        const label = `${month}月`;
        timeData[key] = {
          name: label,
          year: year,
          month: month,
          count: 0,
          value: 0,
        };
      }

      items.forEach((item) => {
        const date = new Date(item.purchaseDate);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        if (timeData[key]) {
          timeData[key].count++;
          timeData[key].value += centsToYuan(item.purchasePrice || 0);
        }
      });
    }

    const chart1Data = Object.values(timeData);
    this.setData({ chart1Data });
  },

  // 生成图表2数据：物品总值趋势
  generateChart2Data(items) {
    // 按时间排序
    const sortedItems = [...items].sort(
      (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate),
    );

    const timeData = {};
    let cumulativeCount = 0;
    let cumulativeValue = 0;

    if (this.data.granularity === "year") {
      // 按年统计累计值
      for (let year = this.data.startYear; year <= this.data.endYear; year++) {
        timeData[year] = {
          name: `${year}年`,
          year: year,
          count: cumulativeCount,
          value: cumulativeValue,
        };
      }

      sortedItems.forEach((item) => {
        const year = new Date(item.purchaseDate).getFullYear();
        cumulativeCount++;
        cumulativeValue += centsToYuan(item.purchasePrice || 0);

        // 更新该年及之后所有年份的累计值
        for (let y = year; y <= this.data.endYear; y++) {
          if (timeData[y]) {
            timeData[y].count = cumulativeCount;
            timeData[y].value = cumulativeValue;
          }
        }
      });
    } else {
      // 按月统计累计值
      const start = new Date(this.data.startYearMonth + "-01");
      const end = new Date(this.data.endYearMonth + "-01");

      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        const label = `${month}月`;
        timeData[key] = {
          name: label,
          year: year,
          month: month,
          count: cumulativeCount,
          value: cumulativeValue,
        };
      }

      sortedItems.forEach((item) => {
        const date = new Date(item.purchaseDate);
        const itemKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        cumulativeCount++;
        cumulativeValue += centsToYuan(item.purchasePrice || 0);

        // 更新该月及之后所有月份的累计值
        let updateFlag = false;
        Object.keys(timeData).forEach((key) => {
          if (key === itemKey) updateFlag = true;
          if (updateFlag) {
            timeData[key].count = cumulativeCount;
            timeData[key].value = cumulativeValue;
          }
        });
      });
    }

    console.log("chart2Data:", Object.values(timeData));
    const chart2Data = Object.values(timeData);
    this.setData({ chart2Data });
  },

  // 生成图表3数据：价值分布
  generateChart3Data(items) {
    const categoryStats = {};
    const totalCount = items.length;
    const totalValue = centsToYuan(
      items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
    );

    // 统计各分类
    items.forEach((item) => {
      const category = item.category || "其他";
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, value: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].value += centsToYuan(item.purchasePrice || 0);
    });

    // 转换为百分比并添加颜色
    const colors = [
      "#A5D8FF",
      "#D0BFFF",
      "#FFD8A8",
      "#B2F2BB",
      "#FFB3BA",
      "#BAFFC9",
      "#BAE1FF",
      "#FFFFBA",
    ];

    const chart3Data = Object.entries(categoryStats)
      .map(([name, stats], index) => ({
        name,
        count: stats.count,
        countPercent:
          totalCount > 0 ? Math.round((stats.count / totalCount) * 100) : 0,
        value: stats.value,
        valuePercent:
          totalValue > 0 ? Math.round((stats.value / totalValue) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // 生成 Top5 分类数据（用于详细展示）
    const chart3Top5 = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        value: stats.value,
        valuePercent:
          totalValue > 0 ? Math.round((stats.value / totalValue) * 100) : 0,
        valueDisplay: formatYuan(stats.value),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    this.setData({ chart3Data, chart3Top5 });
  },

  // 初始化图表
  initCharts() {
    // uCharts不需要手动初始化，直接更新数据即可
    this.updateCharts();
  },

  // 更新图表
  updateCharts() {
    this.updateChart1();
    this.updateChart2();
    this.updateChart3();
  },

  // 更新图表1：物品统计（柱状图）
  updateChart1() {
    const dataField = this.data.chart1Type === "count" ? "count" : "value";
    const categories = this.data.chart1Data.map((item) => item.name);
    const data = this.data.chart1Data.map((item) =>
      Math.round(item[dataField]),
    );

    this.setData({
      chart1ChartData: {
        categories: categories,
        series: [
          {
            name: this.data.chart1Type === "count" ? "数量" : "价值",
            data: data,
          },
        ],
      },
    });
  },

  // 更新图表2：物品总值趋势（折线图）
  updateChart2() {
    const dataField = this.data.chart2Type === "count" ? "count" : "value";
    const categories = this.data.chart2Data.map((item) => item.name);
    const data = this.data.chart2Data.map((item) =>
      Math.round(item[dataField]),
    );

    this.setData({
      chart2ChartData: {
        categories: categories,
        series: [
          {
            name: this.data.chart2Type === "count" ? "累计数量" : "累计价值",
            data: data,
          },
        ],
      },
    });
  },

  // 更新图表3：价值分布（饼图）
  updateChart3() {
    const dataField = this.data.chart3Type === "count" ? "count" : "value";

    // 饼图的series格式
    const series = this.data.chart3Data.map((item) => ({
      name: item.name,
      data: item[dataField],
      labelShow: false,
    }));

    this.setData({
      chart3ChartData: {
        series: series,
      },
    });
  },

  // 切换统计粒度
  onGranularityChange(event) {
    const index = event.detail.value;
    const granularity = this.data.granularityOptions[index].value;
    this.setData({ granularity, granularityIndex: index });
    this.setDefaultTimeRange();
    this.refreshData();
  },

  // 切换图表类型
  onChart1TypeChange() {
    const chart1Type = this.data.chart1Type === "count" ? "value" : "count";
    this.setData({ chart1Type });
    this.updateChart1();
  },

  onChart2TypeChange() {
    const chart2Type = this.data.chart2Type === "count" ? "value" : "count";
    this.setData({ chart2Type });
    this.updateChart2();
  },

  onChart3TypeChange() {
    const chart3Type = this.data.chart3Type === "count" ? "value" : "count";
    this.setData({ chart3Type });
    this.updateChart3();
  },

  // 时间范围选择
  onStartYearChange(event) {
    const index = event.detail.value;
    const startYear = this.data.yearOptions[index].value;
    this.setData({ startYear });
    this.refreshData();
  },

  onEndYearChange(event) {
    const index = event.detail.value;
    const endYear = this.data.yearOptions[index].value;
    this.setData({ endYear });
    this.refreshData();
  },

  onStartYearMonthChange(event) {
    const [yearIndex, monthIndex] = event.detail.value;
    const startMonthYear = this.data.yearOptions[yearIndex].value;
    const startMonth = this.data.monthOptions[monthIndex].value;
    const startYearMonth = `${startMonthYear}-${String(startMonth).padStart(
      2,
      "0",
    )}`;

    // 检查范围是否超过12个月
    if (this.checkMonthRange(startYearMonth, this.data.endYearMonth)) {
      this.setData({ startYearMonth, startMonthYear, startMonth });
      this.refreshData();
    } else {
      wx.showToast({
        title: "时间范围不能超过12个月",
        icon: "none",
      });
    }
  },

  onEndYearMonthChange(event) {
    const [yearIndex, monthIndex] = event.detail.value;
    const endMonthYear = this.data.yearOptions[yearIndex].value;
    const endMonth = this.data.monthOptions[monthIndex].value;
    const endYearMonth = `${endMonthYear}-${String(endMonth).padStart(2, "0")}`;

    // 检查范围是否超过12个月
    if (this.checkMonthRange(this.data.startYearMonth, endYearMonth)) {
      this.setData({ endYearMonth, endMonthYear, endMonth });
      this.refreshData();
    } else {
      wx.showToast({
        title: "时间范围不能超过12个月",
        icon: "none",
      });
    }
  },

  // 检查月份范围是否在12个月内
  checkMonthRange(start, end) {
    const startDate = new Date(start + "-01");
    const endDate = new Date(end + "-01");
    const monthDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return monthDiff >= 0 && monthDiff <= 11;
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  // 生成测试数据（开发用）
  generateTestData() {
    wx.showModal({
      title: "生成测试数据",
      content: "是否生成模拟数据用于测试统计功能？",
      success: (res) => {
        if (res.confirm) {
          saveMockDataToStorage();
          this.refreshData();
          wx.showToast({
            title: "测试数据已生成",
            icon: "success",
          });
        }
      },
    });
  },
});
