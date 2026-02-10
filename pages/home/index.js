import Message from "tdesign-miniprogram/message/index";
import request from "~/api/request";
import { CATEGORY_COLORS, TIME_FILTER_OPTIONS } from "~/utils/options";
import { toPrice } from "~/utils/util";

import {
  EntityType,
  AveragePriceCalculationMethod,
  StatusType,
} from "~/static/types/ItemTypes";

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
    items: [], // 当前展示的物品列表（经过筛选和搜索）
    allItems: [], // 所有物品的完整列表
    viewMode: "list", // 视图模式：'list' | 'card'
    totalCount: 0, // 全部物品总数量（不受筛选影响）
    totalValue: 0, // 全部物品总价值（不受筛选影响）
    filteredCount: 0, // 筛选后的物品数量
    filteredValue: 0, // 筛选后的物品价值
    showAssociatedCount: false,
    showFilterModal: false,
    showDetailModal: false,
    currentItem: null,
    currentItemDetail: null, // 当前查看的物品详情（包含格式化数据）
    useTimesEditing: false, // 是否正在编辑使用次数

    // 排序相关
    sortOptions: [
      { label: "按记录时间倒序", value: "recordTime_desc" },
      { label: "按买入时间倒序", value: "purchaseTime_desc" },
      { label: "按金额由高到低", value: "price_desc" },
      { label: "按金额由低到高", value: "price_asc" },
    ],
    currentSortIndex: 0, // 当前排序选项索引

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

    // 分页相关
    pageSize: 20, // 每页加载20条数据
    currentPage: 1, // 当前页码
    hasMoreData: false, // 是否还有更多数据
    isLoadingMore: false, // 是否正在加载更多
    filteredItems: [], // 筛选后的完整列表（用于分页）

    // 图标数据
    iconsByUniqueId: {}, // 按唯一ID索引的图标数据

    // 新增的UI状态
    showSearch: false, // 搜索框展开状态
    categoryDragging: false, // 分类拖拽状态
    categoryStartX: 0, // 分类拖拽起始位置
    categoryScrollLeft: 0, // 分类滚动位置
    drawerAnimated: false, // 抽屉动画状态
    isSorting: false, // 排序动画状态
  },

  // 搜索防抖定时器
  searchTimer: null,
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

    // 加载图标数据
    this.loadIconData();

    //
    this.itemManager = new ItemManager();
    app.globalData.itemManager = this.itemManager;
    // 注册监听
    const handler = () => {
      if (!this.itemManager) return;
      this.loadData(); // 重新加载数据并应用筛选
    };
    app.eventBus.on("itemChanged", handler);

    this.loadData();
  },
  onLoad(option) {
    // 加载视图模式偏好
    this.loadViewModePreference();

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

  onShow() {
    // 恢复筛选和搜索状态
    try {
      const navigationState = wx.getStorageSync("home_navigation_state");
      if (navigationState) {
        this.setData({
          selectedCategory: navigationState.selectedCategory || "全部",
          searchQuery: navigationState.searchQuery || "",
          viewMode: navigationState.viewMode || "list",
        });

        // 重新应用筛选
        this.filterItems();
      }
    } catch (error) {
      console.error("恢复导航状态失败:", error);
    }

    // 恢复滚动位置
    try {
      const scrollTop = wx.getStorageSync("home_scroll_position");
      if (scrollTop) {
        // 使用 setTimeout 确保页面已经渲染完成
        setTimeout(() => {
          wx.pageScrollTo({
            scrollTop,
            duration: 0,
          });
        }, 100);
      }
    } catch (error) {
      console.error("恢复滚动位置失败:", error);
    }

    // 清理本地存储的临时数据
    try {
      wx.removeStorageSync("home_scroll_position");
      wx.removeStorageSync("home_navigation_state");
    } catch (error) {
      console.error("清理临时数据失败:", error);
    }
  },
  onRefresh() {
    this.refresh();
  },
  async refresh() {
    // 显示刷新状态指示器
    this.setData({
      enable: true,
    });

    try {
      // 并行加载轮播图和卡片数据
      const [cardRes, swiperRes] = await Promise.all([
        request("/home/cards").then((res) => res.data),
        request("/home/swipers").then((res) => res.data),
      ]);

      // 重新从 ItemManager 加载物品数据
      if (this.itemManager) {
        this.itemManager.updateData();
      }

      // 保存当前的筛选和搜索状态
      const { selectedCategory, searchQuery, viewMode } = this.data;

      // 调用 loadData 方法更新页面（会重新应用筛选）
      this.loadData();

      // 恢复筛选和搜索状态（loadData 会重置这些状态）
      this.setData({
        selectedCategory,
        searchQuery,
        viewMode,
      });

      // 重新应用筛选（保持当前的筛选和搜索状态）
      this.filterItems();

      // 延迟隐藏刷新指示器，确保用户能看到刷新动画
      setTimeout(() => {
        this.setData({
          enable: false,
          cardInfo: cardRes.data,
          swiperList: swiperRes.data,
        });
      }, 1000);
    } catch (error) {
      // 捕获数据加载异常
      console.error("刷新数据失败:", error);

      // 隐藏刷新指示器
      this.setData({
        enable: false,
      });

      // 显示错误提示信息
      wx.showModal({
        title: "刷新失败",
        content: "数据加载失败，请检查网络连接后重试",
        showCancel: true,
        confirmText: "重试",
        cancelText: "取消",
        success: (res) => {
          // 提供重试选项
          if (res.confirm) {
            // 用户点击重试，再次调用刷新
            this.refresh();
          }
        },
      });
    }
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

    // 加载所有物品数据
    const allItems = this.itemManager.getAllItems();
    const categories = ["全部", ...this.itemManager.getCategories()];

    // 为每个物品添加分类颜色、图标路径和格式化日期
    const itemsWithColor = allItems.map((item) => ({
      ...item,
      categoryColor: this.getCategoryColor(item.category),
      iconPath: this.getIconPath(item.icon), // 添加图标路径
      purchaseDateFormatted: this.formatDate(item.purchaseDate), // 格式化日期
    }));

    // 计算全部物品的统计信息（不受筛选影响）
    const totalCount = itemsWithColor.length;
    const totalValueInCents = itemsWithColor.reduce((sum, item) => {
      const itemValue =
        item.purchasePrice +
        (item.associatedItems || []).reduce(
          (assSum, assItem) => assSum + assItem.purchasePrice,
          0
        );
      return sum + itemValue;
    }, 0);
    const totalValueInYuan = toPrice(totalValueInCents);
    const formattedTotalValue = this.formatPriceWithCommas(totalValueInYuan);

    // 保存完整物品列表和全局统计
    this.setData({
      allItems: itemsWithColor,
      categories,
      totalCount,
      totalValue: formattedTotalValue,
    });

    // 应用筛选和搜索
    this.filterItems();
  },

  // 加载图标数据
  loadIconData() {
    const seriesToLoad = ["default", "blue", "green"];
    const iconsByUniqueId = {};

    const loadSeries = (seriesId) => {
      try {
        let iconData;
        if (seriesId === "default") {
          iconData = require("../../static/icons/icon_default.json");
        } else if (seriesId === "blue") {
          iconData = require("../../static/icons/icon_blue.json");
        } else if (seriesId === "green") {
          iconData = require("../../static/icons/icon_green.json");
        } else {
          console.warn(`未知的图标系列: ${seriesId}`);
          return;
        }

        // 为每个图标建立唯一ID到路径的映射
        iconData.icons.forEach((icon) => {
          const uniqueId = `${iconData.seriesId}_${icon.id}`;
          const fullPath = `/static/icons/${iconData.seriesId}/${icon.filename}`;
          iconsByUniqueId[uniqueId] = {
            ...icon,
            seriesId: iconData.seriesId,
            seriesName: iconData.seriesName,
            uniqueId,
            fullPath,
          };
        });
      } catch (error) {
        console.error(`加载图标系列 ${seriesId} 失败:`, error);
      }
    };

    // 加载所有配置的系列
    seriesToLoad.forEach((seriesId) => {
      loadSeries(seriesId);
    });
    console.log("加载的图标数据:", iconsByUniqueId);

    this.setData({
      iconsByUniqueId,
    });
  },

  // 根据图标唯一ID获取图标路径
  getIconPath(iconUniqueId) {
    if (!iconUniqueId) {
      return "/static/icon_td.png"; // 默认图标
    }

    const iconInfo = this.data.iconsByUniqueId[iconUniqueId];
    if (iconInfo && iconInfo.fullPath) {
      return iconInfo.fullPath;
    }

    // 如果找不到对应的图标，返回默认图标
    console.warn(`找不到图标: ${iconUniqueId}`);
    return "/static/icon_td.png";
  },

  // 过滤物品列表（根据搜索和筛选条件）
  filterItems() {
    const { allItems, searchQuery, selectedCategory } = this.data;

    let filtered = allItems;

    // 分类筛选
    if (selectedCategory !== "全部") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // 搜索筛选（按名称和品牌，不区分大小写）
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          // 按名称模糊搜索（不区分大小写）
          item.name.toLowerCase().includes(query) ||
          // 按品牌模糊搜索（不区分大小写）
          (item.brand && item.brand.toLowerCase().includes(query))
      );
    }

    // 应用排序
    filtered = this.applySorting(filtered);

    // 检测物品数量是否超过100，启用分页
    const usePagination = filtered.length > 100;

    if (usePagination) {
      // 保存筛选后的完整列表
      this.setData({
        filteredItems: filtered,
        currentPage: 1,
      });

      // 只加载第一页数据
      this.loadPage(1, filtered);
    } else {
      // 数据量不大，直接显示全部
      const filteredCount = filtered.length;
      const filteredValueInCents = filtered.reduce((sum, item) => {
        const itemValue =
          item.purchasePrice +
          (item.associatedItems || []).reduce(
            (assSum, assItem) => assSum + assItem.purchasePrice,
            0
          );
        return sum + itemValue;
      }, 0);
      const filteredValueInYuan = toPrice(filteredValueInCents);
      const formattedFilteredValue =
        this.formatPriceWithCommas(filteredValueInYuan);

      // 批量更新数据（一次 setData 调用）
      this.setData({
        items: filtered,
        filteredItems: filtered,
        filteredCount,
        filteredValue: formattedFilteredValue,
        hasMoreData: false,
        currentPage: 1,
      });
    }
  },

  // 加载指定页的数据
  loadPage(page, filteredList) {
    const { pageSize } = this.data;
    const filtered = filteredList || this.data.filteredItems;

    // 计算起始和结束索引
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filtered.length);

    // 获取当前页的数据
    const pageItems = filtered.slice(startIndex, endIndex);

    // 判断是否还有更多数据
    const hasMoreData = endIndex < filtered.length;

    // 如果是第一页，直接设置；否则追加到现有数据
    const items = page === 1 ? pageItems : [...this.data.items, ...pageItems];

    // 计算筛选后的统计信息（基于完整的筛选列表）
    const filteredCount = filtered.length;
    const filteredValueInCents = filtered.reduce((sum, item) => {
      const itemValue =
        item.purchasePrice +
        (item.associatedItems || []).reduce(
          (assSum, assItem) => assSum + assItem.purchasePrice,
          0
        );
      return sum + itemValue;
    }, 0);
    const filteredValueInYuan = toPrice(filteredValueInCents);
    const formattedFilteredValue =
      this.formatPriceWithCommas(filteredValueInYuan);

    // 批量更新数据
    this.setData({
      items,
      filteredCount,
      filteredValue: formattedFilteredValue,
      currentPage: page,
      hasMoreData,
      isLoadingMore: false,
    });
  },

  // 应用排序
  applySorting(items) {
    const { currentSortIndex, sortOptions } = this.data;
    const sortOption = sortOptions[currentSortIndex];

    if (!sortOption) return items;

    const sortedItems = [...items];

    switch (sortOption.value) {
      case "recordTime_desc":
        // 按记录时间倒序（创建时间）
        return sortedItems.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.purchaseDate).getTime();
          const timeB = new Date(b.createdAt || b.purchaseDate).getTime();
          return timeB - timeA;
        });

      case "purchaseTime_desc":
        // 按买入时间倒序
        return sortedItems.sort((a, b) => {
          const timeA = new Date(a.purchaseDate).getTime();
          const timeB = new Date(b.purchaseDate).getTime();
          return timeB - timeA;
        });

      case "price_desc":
        // 按金额由高到低
        return sortedItems.sort((a, b) => {
          const priceA = a.purchasePrice || 0;
          const priceB = b.purchasePrice || 0;
          return priceB - priceA;
        });

      case "price_asc":
        // 按金额由低到高
        return sortedItems.sort((a, b) => {
          const priceA = a.purchasePrice || 0;
          const priceB = b.purchasePrice || 0;
          return priceA - priceB;
        });

      default:
        return sortedItems;
    }
  },

  // 切换排序方式
  toggleSort() {
    const { currentSortIndex, sortOptions } = this.data;
    const nextIndex = (currentSortIndex + 1) % sortOptions.length;

    // 添加排序动画类
    this.setData({
      currentSortIndex: nextIndex,
      isSorting: true,
    });

    // 延迟应用筛选和排序，让动画先开始
    setTimeout(() => {
      this.filterItems();

      // 动画完成后移除动画类
      setTimeout(() => {
        this.setData({
          isSorting: false,
        });
      }, 400);
    }, 100);
  },
  loadMore() {
    const { hasMoreData, isLoadingMore, currentPage } = this.data;

    // 如果没有更多数据或正在加载，直接返回
    if (!hasMoreData || isLoadingMore) {
      return;
    }

    // 设置加载状态
    this.setData({ isLoadingMore: true });

    // 加载下一页
    this.loadPage(currentPage + 1);
  },

  // 格式化价格，添加千位分隔符
  formatPriceWithCommas(price) {
    // 确保价格是数字
    const numPrice = Number(price);

    // 处理无效数字
    if (isNaN(numPrice)) {
      return "0.00";
    }

    // 格式化为两位小数
    const fixedPrice = numPrice.toFixed(2);

    // 分离整数和小数部分
    const [integerPart, decimalPart] = fixedPrice.split(".");

    // 添加千位分隔符
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // 返回格式化后的价格
    return `${formattedInteger}.${decimalPart}`;
  },

  // 获取分类颜色
  getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["其他"];
  },

  // 格式化日期
  formatDate(dateStr) {
    return dateStr.split("T")[0];
  },

  // 搜索输入处理（带防抖和长度限制）
  onSearchInput(e) {
    let query = e.detail.value;

    // 限制搜索关键词长度（50字符）
    if (query.length > 50) {
      query = query.substring(0, 50);
      wx.showToast({
        title: "搜索关键词过长",
        icon: "none",
        duration: 1500,
      });
    }

    // 只在搜索关键词变化时更新
    if (query === this.data.searchQuery) {
      return;
    }

    // 更新搜索关键词
    this.setData({ searchQuery: query });

    // 清除之前的定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // 防抖处理（300ms）
    this.searchTimer = setTimeout(() => {
      this.filterItems();
    }, 300);
  },

  // 清除搜索
  clearSearch() {
    // 清空搜索关键词
    this.setData({ searchQuery: "" });

    // 清除防抖定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    // 恢复完整物品列表（应用分类筛选）
    this.filterItems();
  },

  // 切换视图模式
  toggleViewMode() {
    const newMode = this.data.viewMode === "list" ? "card" : "list";
    this.setData({ viewMode: newMode });

    // 保存视图模式偏好到本地存储
    try {
      wx.setStorageSync("home_view_mode", newMode);
    } catch (error) {
      console.error("保存视图模式失败:", error);
      if (error.errMsg && error.errMsg.includes("exceed")) {
        wx.showToast({
          title: "存储空间不足",
          icon: "none",
        });
      }
    }
  },

  // 记录使用次数
  recordUsage() {
    const item = this.data.currentItem;
    if (!item || !this.itemManager) return;

    try {
      // 增加使用次数
      const newUseTimes = (item.useTimes || 1) + 1;
      this.itemManager.updateItem(item.id, {
        useTimes: newUseTimes,
      });

      // 更新当前显示的物品数据
      const updatedItem = { ...item, useTimes: newUseTimes };
      const updatedItemDetail = this.formatItemDetail(updatedItem);

      this.setData({
        currentItem: updatedItem,
        currentItemDetail: updatedItemDetail,
      });

      // 重新加载列表数据
      this.loadData();

      wx.showToast({
        title: "使用记录已更新",
        icon: "success",
        duration: 1500,
      });
    } catch (error) {
      console.error("记录使用失败:", error);
      wx.showToast({
        title: "记录失败",
        icon: "none",
        duration: 2000,
      });
    }
  },

  // 增加使用次数
  increaseUseTimes() {
    const item = this.data.currentItem;
    if (!item || !this.itemManager) return;

    try {
      const newUseTimes = (item.useTimes || 1) + 1;
      this.itemManager.updateItem(item.id, {
        useTimes: newUseTimes,
      });

      // 更新当前显示的物品数据
      const updatedItem = { ...item, useTimes: newUseTimes };
      const updatedItemDetail = this.formatItemDetail(updatedItem);

      this.setData({
        currentItem: updatedItem,
        currentItemDetail: updatedItemDetail,
      });

      // 重新加载列表数据
      this.loadData();

      wx.showToast({
        title: "使用次数已增加",
        icon: "success",
        duration: 1000,
      });
    } catch (error) {
      console.error("更新使用次数失败:", error);
      wx.showToast({
        title: "更新失败",
        icon: "none",
        duration: 1500,
      });
    }
  },

  // 减少使用次数
  decreaseUseTimes() {
    const item = this.data.currentItem;
    if (!item || !this.itemManager) return;

    const currentUseTimes = item.useTimes || 1;
    if (currentUseTimes <= 0) {
      wx.showToast({
        title: "使用次数不能小于0",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    try {
      const newUseTimes = currentUseTimes - 1;
      this.itemManager.updateItem(item.id, {
        useTimes: newUseTimes,
      });

      // 更新当前显示的物品数据
      const updatedItem = { ...item, useTimes: newUseTimes };
      const updatedItemDetail = this.formatItemDetail(updatedItem);

      this.setData({
        currentItem: updatedItem,
        currentItemDetail: updatedItemDetail,
      });

      // 重新加载列表数据
      this.loadData();

      wx.showToast({
        title: "使用次数已减少",
        icon: "success",
        duration: 1000,
      });
    } catch (error) {
      console.error("更新使用次数失败:", error);
      wx.showToast({
        title: "更新失败",
        icon: "none",
        duration: 1500,
      });
    }
  },

  // 加载视图模式偏好
  loadViewModePreference() {
    try {
      const savedMode = wx.getStorageSync("home_view_mode");
      if (savedMode === "list" || savedMode === "card") {
        this.setData({ viewMode: savedMode });
      } else {
        // 如果没有保存的偏好或值无效，使用默认的列表模式
        this.setData({ viewMode: "list" });
      }
    } catch (error) {
      console.error("读取视图模式失败:", error);
      // 读取失败时使用默认的列表模式
      this.setData({ viewMode: "list" });
    }
  },

  // 分类选择处理
  selectCategory(e) {
    const category = e.currentTarget.dataset.item;
    this.setData({ selectedCategory: category });
    this.filterItems();
  },

  // 查看物品详情
  viewItem(e) {
    const item = e.currentTarget.dataset.item;

    // 验证物品ID有效性
    if (!item || !item.id) {
      console.error("物品信息无效:", item);
      wx.showToast({
        title: "物品信息无效",
        icon: "none",
      });
      return;
    }

    // 显示详情弹窗
    this.showItemDetail(item);
  },

  // 显示物品详情弹窗
  // 显示物品详情弹窗
  showItemDetail(item) {
    // 格式化物品详情数据
    const itemDetail = this.formatItemDetail(item);

    this.setData({
      currentItem: item,
      currentItemDetail: itemDetail,
      useTimesEditing: false, // 重置编辑状态
    });

    // 先显示遮罩，然后延迟显示抽屉动画
    this.setData({
      showDetailModal: true,
    });

    // 使用 setTimeout 确保 DOM 更新后再触发动画
    setTimeout(() => {
      this.setData({
        drawerAnimated: true,
      });
    }, 50);
  },

  // 格式化物品详情数据
  formatItemDetail(item) {
    // 状态标签映射
    const statusLabels = {
      [StatusType.NORMAL]: "使用中",
      [StatusType.RETIRED]: "退役/报废",
      [StatusType.LOST]: "遗失",
      [StatusType.DAMAGED]: "损坏",
    };

    // 实体类型标签映射
    const entityTypeLabels = {
      PHYSICAL: "实物",
      VIRTUAL: "虚拟产品",
      SERVICE: "服务",
    };

    // 实体类型图标映射
    const entityTypeIcons = {
      PHYSICAL: "📦",
      VIRTUAL: "💾",
      SERVICE: "🛠️",
    };

    // 成本计算方式标签映射
    const calculationMethodLabels = {
      [AveragePriceCalculationMethod.BY_DAY]: "按天数",
      [AveragePriceCalculationMethod.BY_USAGE_COUNT]: "按使用次数",
    };

    const showUseTimes =
      item.averagePriceCalculationMethod ===
      AveragePriceCalculationMethod.BY_USAGE_COUNT;

    // 格式化关联物品，添加图标和类型信息
    const formattedAssociatedItems = (item.associatedItems || []).map(
      (assItem) => ({
        ...assItem,
        entityType: assItem.entityType || "PHYSICAL",
        entityTypeIcon:
          entityTypeIcons[assItem.entityType || "PHYSICAL"] || "📦",
        purchasePriceDisplay: this.formatPriceWithCommas(
          toPrice(assItem.purchasePrice)
        ),
      })
    );

    return {
      ...item,
      statusLabel: statusLabels[item.status] || "未知",
      entityTypeLabel: entityTypeLabels[item.entityType] || "未知",
      calculationMethodLabel:
        calculationMethodLabels[item.averagePriceCalculationMethod] || "未知",
      purchaseDateFormatted: this.formatDate(item.purchaseDate),
      retireDateFormatted: item.retireDate
        ? this.formatDate(item.retireDate)
        : "",
      showUseTimes: showUseTimes,
      showRetireDate: item.status !== StatusType.NORMAL,
      associatedItemsCount: (item.associatedItems || []).length,
      associatedItems: formattedAssociatedItems,
      totalAssociatedValue: this.calculateAssociatedItemsValue(
        item.associatedItems || []
      ),
      useTimes: item.useTimes || 1, // 确保包含使用次数
    };
  },

  // 计算关联物品总价值
  calculateAssociatedItemsValue(associatedItems) {
    const totalCents = associatedItems.reduce(
      (sum, item) => sum + item.purchasePrice,
      0
    );
    return toPrice(totalCents);
  },

  // 关闭详情弹窗
  closeDetailModal() {
    // 先隐藏抽屉动画
    this.setData({
      drawerAnimated: false,
    });

    // 延迟隐藏整个模态框
    setTimeout(() => {
      this.setData({
        showDetailModal: false,
        currentItem: null,
        currentItemDetail: null,
        useTimesEditing: false, // 重置编辑状态
      });
    }, 400); // 与动画时长一致
  },

  // 阻止事件冒泡（防止点击弹窗内容时关闭弹窗）
  stopPropagation() {
    // 空方法，仅用于阻止事件冒泡
  },

  // 开始编辑使用次数
  startEditUseTimes() {
    this.setData({
      useTimesEditing: true,
    });
  },

  // 结束编辑使用次数（点击其他地方时调用）
  endEditUseTimes() {
    if (this.data.useTimesEditing) {
      // 保存更新并退出编辑模式
      this.saveUseTimesUpdate();
    }
  },

  // 编辑物品（从详情弹窗跳转）
  editItemFromDetail() {
    const item = this.data.currentItem;
    if (!item) return;

    // 关闭弹窗
    this.closeDetailModal();

    // 保存当前滚动位置到本地存储
    try {
      const query = wx.createSelectorQuery();
      query.select(".home-content").scrollOffset();
      query.exec((res) => {
        if (res && res[0]) {
          wx.setStorageSync("home_scroll_position", res[0].scrollTop);
        }
      });
    } catch (error) {
      console.error("保存滚动位置失败:", error);
    }

    // 保存当前筛选和搜索状态
    try {
      const navigationState = {
        selectedCategory: this.data.selectedCategory,
        searchQuery: this.data.searchQuery,
        viewMode: this.data.viewMode,
      };
      wx.setStorageSync("home_navigation_state", navigationState);
    } catch (error) {
      console.error("保存导航状态失败:", error);
    }

    // 导航到编辑页面
    wx.navigateTo({
      url: `/pages/release/index?itemId=${item.id}&pageType=edit`,
      fail: (error) => {
        console.error("导航失败:", error);
        wx.showToast({
          title: "打开编辑页面失败",
          icon: "none",
        });
      },
    });
  },

  // 步进器数值变化（仅更新显示，不保存）
  onUseTimesChange(e) {
    const newUseTimes = e.detail.value;
    const updatedItemDetail = {
      ...this.data.currentItemDetail,
      useTimes: newUseTimes,
    };

    // 只更新显示，不保存到后端
    this.setData({
      currentItemDetail: updatedItemDetail,
    });
  },

  // 保存使用次数更新（点击外部区域时调用）
  saveUseTimesUpdate() {
    const item = this.data.currentItem;
    const newUseTimes = this.data.currentItemDetail.useTimes;

    if (!item || !this.itemManager) return;

    // 如果数值没有变化，直接退出编辑模式
    if (newUseTimes === item.useTimes) {
      this.setData({
        useTimesEditing: false,
      });
      return;
    }

    try {
      // 更新物品的使用次数
      this.itemManager.updateItem(item.id, {
        useTimes: newUseTimes,
      });

      // 更新当前显示的物品数据
      const updatedItem = { ...item, useTimes: newUseTimes };

      this.setData({
        currentItem: updatedItem,
        useTimesEditing: false, // 隐藏步进器
      });

      // 重新加载列表数据
      this.loadData();

      wx.showToast({
        title: "更新成功",
        icon: "success",
        duration: 1500,
      });
    } catch (error) {
      console.error("更新使用次数失败:", error);
      wx.showToast({
        title: "更新失败",
        icon: "none",
        duration: 2000,
      });

      // 恢复原始数值
      const originalItemDetail = this.formatItemDetail(item);
      this.setData({
        currentItemDetail: originalItemDetail,
        useTimesEditing: false,
      });
    }
  },

  // 编辑关联物品
  editAssociatedItem(e) {
    const associatedItem = e.currentTarget.dataset.associatedItem;
    const parentItem = this.data.currentItem;

    if (!associatedItem || !parentItem) {
      wx.showToast({
        title: "物品信息无效",
        icon: "none",
      });
      return;
    }

    // 保存当前滚动位置到本地存储
    try {
      const query = wx.createSelectorQuery();
      query.select(".home-content").scrollOffset();
      query.exec((res) => {
        if (res && res[0]) {
          wx.setStorageSync("home_scroll_position", res[0].scrollTop);
        }
      });
    } catch (error) {
      console.error("保存滚动位置失败:", error);
    }

    // 保存当前筛选和搜索状态
    try {
      const navigationState = {
        selectedCategory: this.data.selectedCategory,
        searchQuery: this.data.searchQuery,
        viewMode: this.data.viewMode,
      };
      wx.setStorageSync("home_navigation_state", navigationState);
    } catch (error) {
      console.error("保存导航状态失败:", error);
    }

    // 关闭详情弹窗
    this.closeDetailModal();

    // 导航到编辑页面，编辑关联物品
    wx.navigateTo({
      url: `/pages/release/index?pageType=edit&parentId=${parentItem.id}&itemId=${associatedItem.id}`,
      fail: (error) => {
        console.error("导航失败:", error);
        wx.showToast({
          title: "打开编辑页面失败",
          icon: "none",
        });
      },
    });
  },

  // 新增关联物品
  addAssociatedItem() {
    const item = this.data.currentItem;
    if (!item) return;

    // 关闭详情弹窗
    this.closeDetailModal();

    // 保存当前滚动位置到本地存储
    try {
      const query = wx.createSelectorQuery();
      query.select(".home-content").scrollOffset();
      query.exec((res) => {
        if (res && res[0]) {
          wx.setStorageSync("home_scroll_position", res[0].scrollTop);
        }
      });
    } catch (error) {
      console.error("保存滚动位置失败:", error);
    }

    // 保存当前筛选和搜索状态
    try {
      const navigationState = {
        selectedCategory: this.data.selectedCategory,
        searchQuery: this.data.searchQuery,
        viewMode: this.data.viewMode,
      };
      wx.setStorageSync("home_navigation_state", navigationState);
    } catch (error) {
      console.error("保存导航状态失败:", error);
    }

    // 导航到编辑页面，添加关联物品
    wx.navigateTo({
      url: `/pages/release/index?pageType=add&parentId=${item.id}`,
      fail: (error) => {
        console.error("导航失败:", error);
        wx.showToast({
          title: "打开编辑页面失败",
          icon: "none",
        });
      },
    });
  },
  onImageError(e) {
    const itemId = e.currentTarget.dataset.id;
    console.error("图片加载失败，物品ID:", itemId);

    // 使用默认占位图标替换失败的图片
    const items = this.data.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, iconPath: "/static/icon_td.png" };
      }
      return item;
    });

    // 同时更新 allItems 中的图片
    const allItems = this.data.allItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, iconPath: "/static/icon_td.png" };
      }
      return item;
    });

    // 批量更新数据（一次 setData 调用）
    this.setData({
      items,
      allItems,
    });
  },

  // 切换搜索框显示状态
  toggleSearch() {
    this.setData({
      showSearch: !this.data.showSearch,
    });
  },

  // 分类拖拽开始
  onCategoryTouchStart(e) {
    const touch = e.touches[0];
    this.setData({
      categoryDragging: true,
      categoryStartX: touch.pageX,
    });

    // 获取当前滚动位置
    const query = wx.createSelectorQuery();
    query.select(".category-scroll").scrollOffset();
    query.exec((res) => {
      if (res && res[0]) {
        this.setData({
          categoryScrollLeft: res[0].scrollLeft,
        });
      }
    });
  },

  // 分类拖拽移动
  onCategoryTouchMove(e) {
    if (!this.data.categoryDragging) return;

    const touch = e.touches[0];
    const deltaX = this.data.categoryStartX - touch.pageX;
    const newScrollLeft = this.data.categoryScrollLeft + deltaX * 2; // 增加滚动速度

    // 设置滚动位置
    wx.createSelectorQuery()
      .select(".category-scroll")
      .node()
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          res[0].node.scrollLeft = Math.max(0, newScrollLeft);
        }
      });
  },

  // 分类拖拽结束
  onCategoryTouchEnd() {
    this.setData({
      categoryDragging: false,
    });
  },
});
