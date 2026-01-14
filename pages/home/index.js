import Message from "tdesign-miniprogram/message/index";
import request from "~/api/request";
import { CATEGORY_COLORS, TIME_FILTER_OPTIONS } from "~/utils/options";
import { toCents, toPrice } from "~/utils/util";

import { EntityType } from "~/static/types/ItemTypes";

import { ItemManager } from "~/utils/itemManager";

// 获取应用实例
const app = getApp();

Page({
  data: {
    enable: false,
    swiperList: [],
    cardInfo: [],
    // 发布
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    canIUseGetUserProfile: false,
    canIUseOpenData:
      wx.canIUse("open-data.type.userAvatarUrl") &&
      wx.canIUse("open-data.type.userNickName"), // 如需尝试获取用户信息可改为false
    // 物品管理
    itemManager: null,
    items: [],
    totalCount: 0,
    totalValue: 0,
    showAssociatedCount: false,
    showFilterModal: false,
    showDetailModal: false,
    currentItem: null,

    searchQuery: "",
    selectedCategory: "全部",
    filterCategories: [],
    filterEntityTypes: [],
    filterTimeOption: -1,
    filterDateStart: "",
    filterDateEnd: "",
    customDateRange: false,

    categories: [],
    timeOptions: TIME_FILTER_OPTIONS,
    entityTypes: [
      { label: "实物", value: EntityType.PHYSICAL },
      { label: "虚拟产品", value: EntityType.VIRTUAL },
      { label: "服务", value: EntityType.SERVICE },
    ],
  },
  // 生命周期
  async onReady() {
    const [cardRes, swiperRes] = await Promise.all([
      request("/home/cards").then((res) => res.data),
      request("/home/swipers").then((res) => res.data),
    ]);

    this.setData({
      cardInfo: cardRes.data,
      focusCardInfo: cardRes.data.slice(0, 3),
      swiperList: swiperRes.data,
    });

    //
    this.itemManager = new ItemManager();
    app.globalData.itemManager = this.itemManager;
    // 注册监听
    const handler = () => {
      if (!this.itemManager) return;
      this.setData({ items: this.itemManager.getAllItems() }); // 触发视图更新
    };
    app.eventBus.on("itemChanged", handler);

    this.loadData();
  },
  onLoad(option) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
    if (option.oper) {
      let content = "";
      if (option.oper === "release") {
        content = "发布成功";
      } else if (option.oper === "save") {
        content = "保存成功";
      }
      this.showOperMsg(content);
    }
  },
  onRefresh() {
    this.refresh();
  },
  async refresh() {
    this.setData({
      enable: true,
    });
    const [cardRes, swiperRes] = await Promise.all([
      request("/home/cards").then((res) => res.data),
      request("/home/swipers").then((res) => res.data),
    ]);

    setTimeout(() => {
      this.setData({
        enable: false,
        cardInfo: cardRes.data,
        swiperList: swiperRes.data,
      });
    }, 1500);
  },
  showOperMsg(content) {
    Message.success({
      context: this,
      offset: [120, 32],
      duration: 4000,
      content,
    });
  },
  goRelease() {
    wx.navigateTo({
      url: "/pages/release/index",
    });
  },

  loadData() {
    if (!this.itemManager) return;

    // this.itemManager.updateData();
    const items = this.itemManager.getAllItems();
    const categories = ["全部", ...this.itemManager.getCategories()];

    // 为每个物品添加分类颜色
    const itemsWithColor = items.map((item) => ({
      ...item,
      categoryColor: this.getCategoryColor(item.category),
    }));

    // 计算总价值
    const totalValue = items.reduce((sum, item) => {
      const itemValue =
        item.purchasePrice +
        item.associatedItems.reduce(
          (assSum, assItem) => assSum + assItem.purchasePrice,
          0
        );
      return sum + itemValue;
    }, 0);

    // 计算总数量
    const totalCountWithAssociated = items.reduce((sum, item) => {
      const itemQuantity = 1 + item.associatedItems.length;
      return sum + itemQuantity;
    }, 0);

    this.setData({
      items: itemsWithColor,
      categories,
      totalCount: items.length,
      totalCountWithAssociated: totalCountWithAssociated,
      totalValue: toPrice(totalValue),
    });

    console.log("->", items);
  },

  // 获取分类颜色
  getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["其他"];
  },

  // 格式化日期
  formatDate(dateStr) {
    return dateStr.split("T")[0];
  },
});
