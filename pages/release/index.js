// pages/release/index.js
import {
  AveragePriceCalculationMethod,
  EntityType,
} from "~/static/types/ItemTypes";
import { formatToTwoDecimal, toCents, toPrice } from "~/utils/util";
import { ValidationError } from "~/utils/ItemManager";

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
    itemManager: null,
    pageType: "add",
    formData: {
      name: "",
      brand: "",
      category: "",
      icon: "",
      images: [],
      quantity: 1,
      purchasePrice: "",
      purchaseDate: "",
      retireDate: "",
      averagePriceCalculationMethod: AveragePriceCalculationMethod.BY_DAY,
      entityType: EntityType.PHYSICAL,
      remarks: "",
    },
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
    calculationMethods: [
      { label: "按日", value: AveragePriceCalculationMethod.BY_DAY },
      {
        label: "按使用次数",
        value: AveragePriceCalculationMethod.BY_USAGE_COUNT,
      },
    ],
    categoryVisible: false,
    today: "",
    purchaseDateVisible: false,
    priceError: false,
    priceFormat: (v) => {
      const isNumber = /^\d+(\.\d+)?$/.test(v);
      if (isNumber) {
        return parseFloat(v).toFixed(2);
      }
      return v;
    },
    quantityError: false,
  },

  onLoad(options) {
    this.itemManager = app.globalData.itemManager;
    const { pageType, itemId, parentId } = options;
    const categories = this.itemManager.getCategories();
    console.log("categories", categories);
    this.setData({
      categories: categories.map((item) => {
        return { label: item, value: item };
      }),
      pageType: pageType || "add",
      itemId: itemId || "",
      parentId: parentId || "",
    });

    // 设置今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    this.setData({
      today: `${year}-${month}-${day}`,
    });

    console.log(this.data.today);
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

  // 表单输入处理
  onNameInput(e) {
    this.setData({
      "formData.name": e.detail.value,
    });
  },

  onBrandInput(e) {
    this.setData({
      "formData.brand": e.detail.value,
    });
  },

  onCategoryChange(e) {
    const selectedIndex = parseInt(e.detail.value);
    this.setData({
      "formData.category": this.data.categories[selectedIndex],
      selectedCategoryIndex: selectedIndex,
    });
  },

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

  onCalculationMethodChange(e) {
    this.setData({
      "formData.averagePriceCalculationMethod": e.detail.value,
    });
  },

  onEntityTypeChange(e) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedType = this.data.entityTypes[selectedIndex];
    this.setData({
      "formData.entityType": selectedType.value,
      selectedEntityTypeIndex: selectedIndex,
      selectedEntityTypeLabel: selectedType.label,
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
      this.setData({
        "formData.quantity": val,
        quantityError: false,
      });
    } else {
      // ❌ 非法输入（多余小数位、多个小数点、非法字符）
      // val = formatToTwoDecimal(e.detail.value);
      this.setData({
        quantityError: true,
      });
    }
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
  onAreaPick(e) {
    console.log("picker pick:", e);
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

    if (!category) {
      wx.showToast({ title: "请选择分类", icon: "none" });
      return false;
    }

    console.log(purchasePrice);
    console.log(purchasePrice.toString());
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

  // 保存数据
  saveItem() {
    if (!this.itemManager || !this.validateForm()) {
      return;
    }

    try {
      // 准备保存的数据
      const saveData = {
        name: this.data.formData.name.trim(),
        brand: this.data.formData.brand,
        category: this.data.formData.category,
        icon: this.data.formData.icon,
        images: this.data.formData.images,
        quantity: this.data.formData.quantity,
        purchasePrice: toCents(this.data.formData.purchasePrice),
        purchaseDate: this.data.formData.purchaseDate,
        retireDate: this.data.formData.retireDate || undefined,
        averagePriceCalculationMethod:
          this.data.formData.averagePriceCalculationMethod,
        entityType: this.data.formData.entityType || undefined,
        remarks: this.data.formData.remarks || undefined,
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
      } else if (this.data.pageType === "associated") {
        // 更新关联物品
        this.itemManager.updateAssociatedItem(
          this.data.parentId,
          this.data.itemId,
          saveData
        );
        wx.showToast({
          title: "更新成功",
          icon: "success",
          duration: 1500,
        });
      } else {
        // 更新主物品
        this.itemManager.updateItem(this.data.itemId, saveData);
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
        error instanceof ValidationError ? error.message : "保存失败";
      wx.showToast({
        title: message,
        icon: "none",
      });
    }
  },
});
