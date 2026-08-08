import useToastBehavior from "~/behaviors/useToast";
import { ItemManager } from "~/utils/itemManager";

const itemManager = new ItemManager();

Page({
  behaviors: [useToastBehavior],

  data: {
    categories: [], // [{ name, isDefault, translateY }]，顺序固定为原始顺序
    newCategory: "",
    showDialog: false,
    dialogTitle: "",
    dialogContent: "",
    deleteTarget: null,
    defaultCategories: [
      "数码产品",
      "衣物鞋包",
      "日常家居",
      "图书",
      "运动",
      "美妆",
      "家具电器",
      "其他",
    ],
    draggingIndex: -1,
    dragOffsetY: 0,
  },

  _dragStartY: 0,
  _rowHeight: 0,
  _lastTargetIndex: -1,

  onLoad() {
    this.loadCategories();
  },
  onShow() {
    this.loadCategories();
  },

  loadCategories() {
    try {
      itemManager.updateData();
      const categories = itemManager.getCategories();
      this.setData({
        categories: categories.map((name) => ({
          name,
          isDefault: this.data.defaultCategories.includes(name),
          translateY: 0,
        })),
        draggingIndex: -1,
        dragOffsetY: 0,
      });
    } catch (error) {
      console.error("加载分类失败:", error);
    }
  },

  // ─── 拖动排序 ─────────────────────────────────────

  onDragStart(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const touchY = e.touches[0].clientY;

    // 查询行高
    wx.createSelectorQuery()
      .select("#category-row-0")
      .boundingClientRect((rect) => {
        this._rowHeight = rect ? rect.height : 56;
      })
      .exec();

    this._dragStartY = touchY;
    this._lastTargetIndex = index;

    // 重置所有行的 translateY
    const categories = this.data.categories.map((c) => ({
      ...c,
      translateY: 0,
    }));
    this.setData({ categories, draggingIndex: index, dragOffsetY: 0 });
  },

  onDragMove(e) {
    if (this.data.draggingIndex < 0) return;

    const touchY = e.touches[0].clientY;
    const offsetY = touchY - this._dragStartY;
    const rowH = this._rowHeight || 56;
    const fromIndex = this.data.draggingIndex;
    const total = this.data.categories.length;

    // 计算目标位置
    const moved = Math.round(offsetY / rowH);
    const targetIndex = Math.max(0, Math.min(total - 1, fromIndex + moved));

    // 更新被拖动行的偏移
    const updates = { dragOffsetY: offsetY };

    // 只在目标位置变化时更新其他行的 translateY（减少 setData 次数）
    if (targetIndex !== this._lastTargetIndex) {
      this._lastTargetIndex = targetIndex;

      const categories = this.data.categories.map((item, i) => {
        if (i === fromIndex) {
          return { ...item, translateY: 0 }; // 被拖动行自身用 dragOffsetY 控制
        }
        // 其他行：如果它在 fromIndex 和 targetIndex 之间，则整体位移一行
        let ty = 0;
        if (fromIndex < targetIndex) {
          // 向下拖：fromIndex+1 ~ targetIndex 的行上移一格
          if (i > fromIndex && i <= targetIndex) ty = -rowH;
        } else {
          // 向上拖：targetIndex ~ fromIndex-1 的行下移一格
          if (i >= targetIndex && i < fromIndex) ty = rowH;
        }
        return { ...item, translateY: ty };
      });

      updates.categories = categories;
    }

    this.setData(updates);
  },

  onDragEnd() {
    if (this.data.draggingIndex < 0) return;

    const fromIndex = this.data.draggingIndex;
    const targetIndex = this._lastTargetIndex;

    // 先清除动画状态
    const categories = this.data.categories.map((c) => ({
      ...c,
      translateY: 0,
    }));
    this.setData({ categories, draggingIndex: -1, dragOffsetY: 0 });

    if (fromIndex === targetIndex) return;

    // 持久化新顺序
    const names = this.data.categories.map((c) => c.name);
    const [item] = names.splice(fromIndex, 1);
    names.splice(targetIndex, 0, item);

    itemManager.categories = names;
    itemManager.saveCategoriesToStorage();
    this.loadCategories();
  },

  // ─── 普通操作 ──────────────────────────────────────

  onCategoryInput(e) {
    this.setData({ newCategory: e.detail.value });
  },

  onAddCategory() {
    const category = this.data.newCategory.trim();
    if (!category) {
      this.onShowToast("#t-toast", "请输入分类名称");
      return;
    }
    try {
      const success = itemManager.addCategory(category);
      if (success) {
        this.setData({ newCategory: "" });
        this.loadCategories();
        this.onShowToast("#t-toast", "添加成功");
      } else {
        this.onShowToast("#t-toast", "分类已存在");
      }
    } catch (error) {
      this.onShowToast("#t-toast", error.message || "添加失败");
    }
  },

  onDeleteCategory(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      showDialog: true,
      dialogTitle: "确认删除",
      dialogContent: `确定要删除分类"${name}"吗？`,
      deleteTarget: name,
    });
  },

  onDialogConfirm() {
    if (this.data.deleteTarget) {
      try {
        const categories = itemManager.getCategories();
        const index = categories.indexOf(this.data.deleteTarget);
        if (index > -1) {
          categories.splice(index, 1);
          itemManager.categories = categories;
          itemManager.saveCategoriesToStorage();
          this.loadCategories();
          this.onShowToast("#t-toast", "删除成功");
        }
      } catch (error) {
        this.onShowToast("#t-toast", "删除失败");
      }
    }
    this.setData({ showDialog: false, deleteTarget: null });
  },

  onDialogCancel() {
    this.setData({ showDialog: false, deleteTarget: null });
  },
});
