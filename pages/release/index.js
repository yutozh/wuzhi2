// pages/release/index.js
import {
  AveragePriceCalculationMethod,
  EntityType,
  StatusType,
} from "~/static/types/ItemTypes";
import { formatToTwoDecimal, toCents, toPrice } from "~/utils/util";
import { ValidationError } from "~/utils/itemManager";
import { isLoggedIn } from "~/utils/auth";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    originFiles: [
      {
        url: "/static/image1.png",
        name: "uploaded1.png",
        type: "image",
      },
      {
        url: "/static/image2.png",
        name: "uploaded2.png",
        type: "image",
      },
    ],
    gridConfig: {
      column: 4,
      width: 160,
      height: 160,
    },
    config: {
      count: 1,
    },
    tags: ["AI绘画", "版权素材", "原创", "风格灵动"],
    personInfo: {
      name: "",
      gender: 0,
      birth: "",
      address: [],
      introduction: "",
      photos: [],
    },
    genderOptions: [
      {
        label: "男",
        value: 0,
      },
      {
        label: "女",
        value: 1,
      },
      {
        label: "保密",
        value: 2,
      },
    ],
    //
    title: "添加物品",
    btnOptionContent: "发布",
    itemManager: null,
    pageType: "add", // add 新增， edit 编辑
    isAssociated: false, // 是否关联物品，根据是否有parentID确定
    formData: {
      name: "",
      brand: "",
      category: "",
      icon: "",
      images: [],
      quantity: 1,
      purchasePrice: "",
      purchaseDate: "",
      status: StatusType.NORMAL,
      lifePeriod: "",
      retireDate: "",
      averagePriceCalculationMethod: AveragePriceCalculationMethod.BY_DAY,
      useTimes: 1,
      entityType: EntityType.PHYSICAL,
      remarks: "",
    },
    selectedStatusLabel: "使用中",
    associatedItems: [],
    categories: [
      { label: "电子产品", value: "电子产品" },
      { label: "服装", value: "服装" },
      { label: "家居用品", value: "家居用品" },
      { label: "图书", value: "图书" },
      { label: "食品", value: "食品" },
      { label: "其他", value: "其他" },
    ],
    entityTypes: [
      { label: "实物", value: EntityType.PHYSICAL },
      { label: "虚拟产品", value: EntityType.VIRTUAL },
      { label: "服务", value: EntityType.SERVICE },
    ],
    statusTypes: [
      { label: "使用中", value: StatusType.NORMAL },
      { label: "退役/报废", value: StatusType.RETIRED },
      { label: "遗失", value: StatusType.LOST },
      { label: "损坏", value: StatusType.DAMAGED },
    ],
    calculationMethods: [
      { label: "按日", value: AveragePriceCalculationMethod.BY_DAY },
      {
        label: "按使用次数",
        value: AveragePriceCalculationMethod.BY_USAGE_COUNT,
      },
    ],
    categoryVisible: false,
    statusVisible: false,
    today: "",
    purchaseDateVisible: false,
    retireDateVisible: false,
    priceError: false,
    priceFormat: (v) => {
      const isNumber = /^\d+(\.\d+)?$/.test(v);
      if (isNumber) {
        return parseFloat(v).toFixed(2);
      }
      return v;
    },
    quantityError: false,
    quantityNotOne: false, // 数量是否不为1
    totalPriceDisplay: "", // 实时总价显示
    // 图标选择相关
    iconSelectorVisible: false,
    candidateIcons: [],
    allIcons: [],
    allIconsDrawerVisible: false,
    selectedIconInDrawer: "",
    // 系列化图标数据
    iconSeries: [], // 存储所有系列信息
    iconsBySeriesId: {}, // 按系列ID分组的图标数据
    currentTabIndex: 0, // 当前选中的tab索引
    selectedIconInfo: null, // 当前选中图标的详细信息
    // 登录提示弹窗
    showLoginModal: false,
  },

  onLoad(options) {
    this.itemManager = app.globalData.itemManager;
    const { pageType, itemId, parentId } = options;
    const categories = this.itemManager.getCategories();
    console.log("options", options);
    this.setData({
      categories: categories.map((item) => {
        return { label: item, value: item };
      }),
      pageType: pageType || "add",
      itemId: itemId || "",
      parentId: parentId || "",
    });

    this.setData({
      today: this.getCurrentDate(),
      isAssociated: this.data.parentId,
    });
    // 加载图标数据
    this.loadIconData();

    // 根据页面类型设置标题和加载数据
    if (pageType === "edit") {
      let title = this.data.parentId ? "编辑关联物品" : "编辑物品";
      this.loadItemData();
      this.setData({
        title: title,
        btnOptionContent: "更新",
      });
    } else if (pageType === "add") {
      let title = this.data.parentId ? "添加关联物品" : "添加物品";
      this.setData({
        title: title,
        btnOptionContent: "提交",
        "formData.purchaseDate": this.getCurrentDate(),
      });

      // 如果是新增关联物品，设置默认值
      if (this.data.parentId) {
        this.setData({
          "formData.category": "其他", // 设置默认类型
          "formData.icon": "default_1", // 设置默认图标
          "formData.entityType": EntityType.PHYSICAL, // 设置默认实体类型
          "formData.averagePriceCalculationMethod":
            AveragePriceCalculationMethod.BY_DAY, // 设置默认成本计算方式
          "formData.useTimes": 1, // 设置默认使用次数
        });
      }
    }
  },

  // 加载物品数据
  loadItemData() {
    if (!this.itemManager || !this.data.itemId) return;

    let item;

    if (this.data.pageType === "edit" && this.data.isAssociated) {
      // 加载关联物品数据
      const parentItem = this.itemManager.getItem(this.data.parentId);
      if (parentItem) {
        item = parentItem.associatedItems.find(
          (assoc) => assoc.id === this.data.itemId,
        );
      }
      this.setData({ title: "编辑关联物品" });
    } else {
      // 加载主物品数据
      item = this.itemManager.getItem(this.data.itemId);
      this.setData({
        title: "编辑物品",
        associatedItems: item.associatedItems || [],
      });
    }

    if (item) {
      const quantity = item.quantity;
      const price = toPrice(item.purchasePrice);
      const quantityNotOne =
        quantity !== undefined && parseFloat(quantity) !== 1;
      this.setData({
        formData: {
          name: item.name,
          brand: item.brand,
          category: item.category,
          icon: item.icon,
          quantity: item.quantity,
          images: [...item.images],
          purchasePrice: price,
          purchaseDate: item.purchaseDate.split("T")[0],
          lifePeriod: item.lifePeriod,
          status: item.status,
          retireDate: item.retireDate ? item.retireDate.split("T")[0] : "",
          averagePriceCalculationMethod: item.averagePriceCalculationMethod,
          useTimes: item.useTimes || 1,
          entityType: item.entityType,
          remarks: item.remarks || "",
        },
        quantityNotOne,
      });
      // 初始化总价显示
      this._updateTotalPriceDisplay(quantity, price);
      // 显示选中的图标
      this.selectIconByID(item.icon);
    }
  },

  // 计算并更新总价显示
  _updateTotalPriceDisplay(quantity, price) {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    const quantityNotOne = !isNaN(q) && q !== 1 && quantity !== "";
    if (quantityNotOne && !isNaN(p) && price !== "") {
      const total = (q * p).toFixed(2);
      this.setData({ totalPriceDisplay: total, quantityNotOne });
    } else {
      this.setData({ totalPriceDisplay: "", quantityNotOne });
    }
  },
  handleSuccess(e) {
    const { files } = e.detail;
    this.setData({
      originFiles: files,
    });
  },
  handleRemove(e) {
    const { index } = e.detail;
    const { originFiles } = this.data;
    originFiles.splice(index, 1);
    this.setData({
      originFiles,
    });
  },
  gotoMap() {
    wx.showToast({
      title: "获取当前位置...",
      icon: "none",
      image: "",
      duration: 1500,
      mask: false,
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  },
  saveDraft() {
    wx.reLaunch({
      url: `/pages/home/index?oper=save`,
    });
  },
  release() {
    wx.reLaunch({
      url: `/pages/home/index?oper=release`,
    });
  },

  // 获取当前日期
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  // 表单输入处理
  onNameInput(e) {
    this.setData({
      "formData.name": e.detail.value,
    });
    // 当物品名称改变时，更新候选图标
    this.updateCandidateIcons(e.detail.value);
  },

  onBrandInput(e) {
    this.setData({
      "formData.brand": e.detail.value,
    });
  },

  // onCategoryChange(e) {
  //   const selectedIndex = parseInt(e.detail.value);
  //   this.setData({
  //     "formData.category": this.data.categories[selectedIndex],
  //     selectedCategoryIndex: selectedIndex,
  //   });
  // },

  onIconInput(e) {
    this.setData({
      "formData.icon": e.detail.value,
    });
  },

  onPurchasePriceInput(e) {
    let val = e.detail.value;

    // 1️⃣ 允许的输入格式：整数或最多两位小数
    const { priceError } = this.data;
    const isNumber = /^\d+(\.\d+)?$/.test(val);

    if (isNumber) {
      // ✅ 合法输入，更新值
      this.setData({
        "formData.purchasePrice": val,
      });
    } else {
      // ❌ 非法输入（多余小数位、多个小数点、非法字符）
      val = formatToTwoDecimal(e.detail.value);
      this.setData({
        "formData.purchasePrice": val,
      });
    }
    if (priceError === isNumber) {
      this.setData({
        priceError: !isNumber,
      });
    }
    // 更新总价显示
    this._updateTotalPriceDisplay(this.data.formData.quantity, val);
  },

  onPurchaseDateChange(e) {
    this.setData({
      "formData.purchaseDate": e.detail.value,
    });
  },

  onRetireDateChange(e) {
    this.setData({
      "formData.retireDate": e.detail.value,
    });
  },

  // onStatusChange(e) {
  //   this.setData({
  //     "formData.status": e.detail.value,
  //   });
  // },

  onCalculationMethodChange(e) {
    this.setData({
      "formData.averagePriceCalculationMethod": e.detail.value,
    });
  },

  onEntityTypeChange(e) {
    this.setData({
      "formData.entityType": e.detail.value,
    });
  },

  onRemarksInput(e) {
    this.setData({
      "formData.remarks": e.detail.value,
    });
  },
  onQuantityInput(e) {
    let val = e.detail.value;

    // 1️⃣ 允许的输入格式：整数或最多两位小数
    const reg = /^\d*\.?\d{0,3}$/;

    if (reg.test(val)) {
      // ✅ 合法输入，更新值
      const quantityNum = parseFloat(val) || 0;
      const quantityNotOne = val !== "" && quantityNum !== 1;
      this.setData({
        "formData.quantity": val,
        quantityError: false,
        quantityNotOne,
      });
      // 更新总价显示
      this._updateTotalPriceDisplay(val, this.data.formData.purchasePrice);
    } else {
      // ❌ 非法输入（多余小数位、多个小数点、非法字符）
      this.setData({
        quantityError: true,
      });
    }
  },

  onUseTimesChange(e) {
    this.setData({
      "formData.useTimes": e.detail.value,
    });
  },

  // 选择框
  showPicker(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      [`${mode}Visible`]: true,
    });
  },
  hidePicker(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      [`${mode}Visible`]: false,
    });
  },
  // 关闭所有选择器（点击遮罩时调用）
  hideAllPickers() {
    this.setData({
      statusVisible: false,
      categoryVisible: false,
      purchaseDateVisible: false,
      retireDateVisible: false,
    });
  },
  onAreaPick(e) {
    const { mode } = e.currentTarget.dataset;
    if (mode === "status") {
      // 更新展示文字
      this.setData({
        "formData.status": e.detail.value,
        selectedStatusLabel: e.detail.label[0],
      });
    }
    console.log("pick", e.detail.value);
  },
  onPickerChange(e) {
    const { value, label } = e.detail;
    const { mode } = e.currentTarget.dataset;

    console.log("picker change:", e.detail);
    this.setData({
      [`formData.${mode}`]: mode === "category" ? value[0] : value,
    });
  },

  // 表单验证
  validateForm() {
    const { name, category, purchasePrice, purchaseDate } = this.data.formData;

    if (!name.trim()) {
      wx.showToast({ title: "请输入物品名称", icon: "none" });
      return false;
    }

    if (!category && !this.data.isAssociated) {
      wx.showToast({ title: "请选择分类", icon: "none" });
      return false;
    }

    if (!purchasePrice || parseFloat(purchasePrice.toString()) < 0) {
      wx.showToast({ title: "请输入有效的购入价格", icon: "none" });
      return false;
    }

    if (!purchaseDate) {
      wx.showToast({ title: "请选择购入日期", icon: "none" });
      return false;
    }

    return true;
  },

  // 金额
  onPriceInput(e) {},

  // 图标选择相关方法
  loadIconData() {
    // 配置要加载的系列（这里可以通过接口获取，目前硬编码）
    const seriesToLoad = ["default", "blue", "green"];

    const iconSeries = [];
    const iconsBySeriesId = {};
    let allIcons = [];

    // 使用静态导入方式加载JSON文件
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

        // 为每个图标添加系列信息和完整路径
        const iconsWithSeries = iconData.icons.map((icon) => ({
          ...icon,
          seriesId: iconData.seriesId,
          seriesName: iconData.seriesName,
          uniqueId: `${iconData.seriesId}_${icon.id}`, // 唯一标识
          fullPath: `/static/icons/${iconData.seriesId}/${icon.filename}`, // 完整路径
        }));

        iconSeries.push({
          seriesId: iconData.seriesId,
          seriesName: iconData.seriesName,
          icons: iconsWithSeries,
        });

        iconsBySeriesId[iconData.seriesId] = iconsWithSeries;
        allIcons = allIcons.concat(iconsWithSeries);
      } catch (error) {
        console.error(`加载图标系列 ${seriesId} 失败:`, error);
      }
    };

    // 加载所有配置的系列
    seriesToLoad.forEach((seriesId) => {
      loadSeries(seriesId);
    });

    this.setData({
      iconSeries,
      iconsBySeriesId,
      allIcons,
    });

    // 初始化候选图标
    this.updateCandidateIcons(this.data.formData.name);
  },

  updateCandidateIcons(itemName) {
    if (!itemName || !this.data.allIcons.length) {
      this.setData({
        candidateIcons: this.data.allIcons.slice(0, 6), // 默认显示前6个
      });
      return;
    }

    const searchTerm = itemName.toLowerCase();
    const matchedIcons = this.data.allIcons.filter((icon) => {
      // 检查图标名称和关键词是否匹配
      const nameMatch = icon.name.toLowerCase().includes(searchTerm);
      const keywordMatch = icon.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm),
      );
      return nameMatch || keywordMatch;
    });

    // 如果匹配的图标少于6个，用其他图标补充
    const candidates =
      matchedIcons.length >= 6
        ? matchedIcons.slice(0, 6)
        : [
            ...matchedIcons,
            ...this.data.allIcons.filter(
              (icon) => !matchedIcons.includes(icon),
            ),
          ].slice(0, 6);

    this.setData({
      candidateIcons: candidates,
    });
  },

  toggleIconSelector() {
    this.setData({
      iconSelectorVisible: !this.data.iconSelectorVisible,
    });
  },

  selectIcon(e) {
    const iconUniqueId = e.currentTarget.dataset.icon;
    const selectedIcon = this.data.allIcons.find(
      (icon) => icon.uniqueId === iconUniqueId,
    );

    this.setData({
      "formData.icon": iconUniqueId,
      selectedIconInfo: selectedIcon,
      iconSelectorVisible: false,
    });
  },

  selectIconByID(iconUniqueId) {
    const selectedIcon = this.data.allIcons.find(
      (icon) => icon.uniqueId === iconUniqueId,
    );

    this.setData({
      selectedIconInfo: selectedIcon,
      iconSelectorVisible: false,
    });
  },

  showAllIcons() {
    this.setData({
      allIconsDrawerVisible: true,
      selectedIconInDrawer: this.data.formData.icon,
    });
  },

  hideAllIconsDrawer() {
    this.setData({
      allIconsDrawerVisible: false,
    });
  },

  onPopupVisibleChange(e) {
    this.setData({
      allIconsDrawerVisible: e.detail.visible,
    });
  },

  selectIconInDrawer(e) {
    const iconUniqueId = e.currentTarget.dataset.icon;
    this.setData({
      selectedIconInDrawer: iconUniqueId,
    });
  },

  confirmIconSelection() {
    const selectedIcon = this.data.allIcons.find(
      (icon) => icon.uniqueId === this.data.selectedIconInDrawer,
    );

    this.setData({
      "formData.icon": this.data.selectedIconInDrawer,
      selectedIconInfo: selectedIcon,
      allIconsDrawerVisible: false,
      iconSelectorVisible: false,
    });
  },

  // Tab切换方法
  onTabChange(e) {
    const tabIndex = e.detail.value;
    this.setData({
      currentTabIndex: tabIndex,
    });
  },

  // 获取当前选中图标的显示信息
  getSelectedIconInfo() {
    const selectedIcon = this.data.formData.icon;
    if (!selectedIcon) return null;

    // 从所有图标中找到选中的图标
    const icon = this.data.allIcons.find(
      (icon) => icon.uniqueId === selectedIcon,
    );
    return icon;
  },

  // 保存数据
  saveItem() {
    if (!this.itemManager || !this.validateForm()) {
      return;
    }

    // 校验登录状态（仅新增时校验，编辑时已有数据无需再提示）
    if (this.data.pageType === "add" && !isLoggedIn()) {
      this.setData({ showLoginModal: true });
      return;
    }

    this._doSaveItem();
  },

  // 登录提示弹窗：用户选择"继续（不登录）"
  onContinueWithoutLogin() {
    this.setData({ showLoginModal: false });
    this._doSaveItem();
  },

  // 登录提示弹窗：用户选择"去登录"
  onGoLogin() {
    this.setData({ showLoginModal: false });
    wx.switchTab({ url: "/pages/my/index" });
  },

  // 关闭登录提示弹窗
  onCloseLoginModal() {
    this.setData({ showLoginModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 实际执行保存逻辑
  _doSaveItem() {
    try {
      // 准备保存的数据
      const saveData = {
        name: this.data.formData.name.trim(),
        brand: this.data.formData.brand,
        category: this.data.isAssociated ? "其他" : this.data.formData.category, // 关联物品使用默认分类
        icon: this.data.isAssociated ? "default_1" : this.data.formData.icon, // 关联物品使用默认图标
        images: this.data.formData.images,
        quantity: this.data.formData.quantity,
        purchasePrice: toCents(this.data.formData.purchasePrice),
        purchaseDate: this.data.formData.purchaseDate,
        status: this.data.formData.status,
        lifePeriod: this.data.formData.lifePeriod,
        retireDate: this.data.formData.retireDate || undefined,
        averagePriceCalculationMethod: this.data.isAssociated
          ? AveragePriceCalculationMethod.BY_DAY
          : this.data.formData.averagePriceCalculationMethod, // 关联物品使用默认计算方式
        useTimes: this.data.isAssociated ? 1 : this.data.formData.useTimes || 1, // 关联物品使用默认次数
        entityType: this.data.isAssociated
          ? EntityType.PHYSICAL
          : this.data.formData.entityType || EntityType.PHYSICAL, // 关联物品使用默认实体类型
        remarks:
          this.data.formData.remarks !== undefined
            ? this.data.formData.remarks
            : "",
      };
      console.log("准备保存的数据:", saveData);
      console.log("this.data:", this.data);

      if (this.data.pageType === "add") {
        if (this.data.parentId) {
          // 添加关联物品
          this.itemManager.createAssociatedItem(this.data.parentId, saveData);
        } else {
          // 添加主物品
          this.itemManager.createItem(saveData);
        }
        wx.showToast({
          title: "添加成功",
          icon: "success",
          duration: 1500,
        });
      } else if (this.data.pageType === "edit") {
        if (this.data.parentId) {
          // 更新关联物品
          this.itemManager.updateAssociatedItem(
            this.data.parentId,
            this.data.itemId,
            saveData,
          );
        } else {
          // 更新主物品
          this.itemManager.updateItem(this.data.itemId, saveData);
        }
        wx.showToast({
          title: "更新成功",
          icon: "success",
          duration: 1500,
        });
      }

      // 通知其他页面
      app.eventBus.emit("itemChanged", app.globalData.itemManager);

      // 延迟返回上一页
      setTimeout(() => {
        wx.reLaunch({
          url: `/pages/home/index?oper=release`,
        });
      }, 1500);
    } catch (error) {
      console.error("保存失败:", error);
      const message =
        error.name === "ValidationError" || error.isValidationError
          ? error.message
          : "保存失败";
      wx.showToast({
        title: message,
        icon: "none",
      });
    }
  },
});
