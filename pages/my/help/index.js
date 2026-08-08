Page({
  data: {
    qaList: [
      {
        id: 1,
        question: "如何添加一件物品？",
        answer:
          "点击首页右下角的「发布」按钮，填写物品名称、类型、购入日期和价格等信息，点击「提交」即可完成添加。",
        expanded: false,
      },
      {
        id: 2,
        question: "物品的「数量」和「价格」有什么关系？",
        answer:
          "当数量大于 1 时，价格字段会变为「单价」，下方会实时显示合计总价（单价 × 数量）。在统计和首页展示中，物品的总价值也会按数量计算。",
        expanded: false,
      },
      {
        id: 3,
        question: "什么是「关联物品」？",
        answer:
          "关联物品是挂靠在主物品下的附属配件或服务，例如手机的保护壳、笔记本的扩展坞等。在物品详情页点击「添加」即可为当前物品添加关联项。",
        expanded: false,
      },
      {
        id: 4,
        question: "「成本计算法」是什么意思？",
        answer:
          "成本计算法决定如何评估一件物品的日均使用成本。「按天数」是用购入价格除以使用天数；「按使用次数」是用购入价格除以已记录的使用次数，更适合记录低频使用的物品。",
        expanded: false,
      },
      {
        id: 5,
        question: "如何修改已添加的物品？",
        answer:
          "在首页点击某件物品，进入详情抽屉后点击右上角「编辑」按钮，即可修改该物品的全部信息。",
        expanded: false,
      },
      {
        id: 6,
        question: "物品数据保存在哪里？会丢失吗？",
        answer:
          "未登录状态下，数据仅保存在本机缓存中，清理微信缓存或更换设备会导致数据丢失。建议登录账号后使用「数据同步」功能将数据备份到云端，以防丢失。",
        expanded: false,
      },
      {
        id: 7,
        question: "如何自定义物品类别？",
        answer:
          "进入「我的」→「物品类别管理」，可以添加自定义类别、删除非默认类别，也可以长按 ☰ 拖动来调整类别的显示顺序。",
        expanded: false,
      },
      {
        id: 8,
        question: "统计页面的数据是怎么计算的？",
        answer:
          "统计页面默认展示最近 12 个月的数据。总价值 = 各物品（单价 × 数量）的累计，支持按月/按年切换，也可自定义时间范围。",
        expanded: false,
      },
      {
        id: 9,
        question: "首页的物品列表支持搜索吗？",
        answer:
          "支持。点击首页右上角搜索图标展开搜索框，可按物品名称或品牌进行模糊搜索，同时也可以通过顶部分类标签快速筛选。",
        expanded: false,
      },
      {
        id: 10,
        question: "如何导出我的物品数据？",
        answer:
          "进入「我的」→「数据同步与导出」页面，可以将数据导出为文件进行备份，或通过云同步功能在多设备间共享数据。",
        expanded: false,
      },
    ],
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    const qaList = this.data.qaList.map((item) =>
      item.id === id ? { ...item, expanded: !item.expanded } : item,
    );
    this.setData({ qaList });
  },

  goFeedback() {
    wx.navigateTo({ url: "/pages/my/feedback/index" });
  },
});
