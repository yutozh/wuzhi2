import useToastBehavior from "~/behaviors/useToast";
import { ItemManager } from "~/utils/itemManager";
import { isLoggedIn } from "~/utils/auth";
import request from "~/api/request";

const itemManager = new ItemManager();

Page({
  behaviors: [useToastBehavior],

  data: {
    totalItems: 0,
    totalCategories: 0,

    // 上传状态
    isSyncing: false,

    // 下载确认弹窗
    showDownloadConfirm: false,
    isDownloading: false,
    remoteData: null, // 从后端拉取的原始数据
    remoteSummary: null, // 展示给用户的摘要信息

    // 清空确认对话框
    showDialog: false,
    dialogTitle: "",
    dialogContent: "",
    dialogAction: "",
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    try {
      itemManager.updateData();
      const items = itemManager.getAllItems();
      const categories = itemManager.getCategories();
      this.setData({
        totalItems: items.length,
        totalCategories: categories.length,
      });
    } catch (error) {
      console.error("加载统计数据失败:", error);
    }
  },

  // ─── 云端同步：上传 ───────────────────────────────────────────

  onUploadData() {
    if (!isLoggedIn()) {
      wx.showModal({
        title: "请先登录",
        content: "上传数据需要登录账号，登录后数据将与您的账号绑定。",
        confirmText: "去登录",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: "/pages/my/index" });
        },
      });
      return;
    }

    if (this.data.isSyncing) return;

    wx.showModal({
      title: "上传数据",
      content: `将本地 ${this.data.totalItems} 件物品、${this.data.totalCategories} 个分类上传到云端，覆盖云端已有数据，确认继续？`,
      confirmText: "上传",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) this._doUpload();
      },
    });
  },

  async _doUpload() {
    this.setData({ isSyncing: true });
    try {
      itemManager.updateData();
      const exportJson = itemManager.exportData();
      const parsed = JSON.parse(exportJson);

      await request("/items/sync", "POST", {
        syncType: "full",
        data: {
          items: parsed.items,
          categories: parsed.categories,
        },
      });

      this.onShowToast("#t-toast", "上传成功");
    } catch (error) {
      console.error("上传失败:", error);
      this.onShowToast("#t-toast", "上传失败，请重试");
    } finally {
      this.setData({ isSyncing: false });
    }
  },

  // ─── 云端同步：下载 ───────────────────────────────────────────

  onDownloadData() {
    if (!isLoggedIn()) {
      wx.showModal({
        title: "请先登录",
        content: "下载数据需要登录账号。",
        confirmText: "去登录",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: "/pages/my/index" });
        },
      });
      return;
    }

    if (this.data.isDownloading) return;
    this.setData({ isDownloading: true });
    this._fetchRemoteData();
  },

  async _fetchRemoteData() {
    try {
      const res = await request("/items", "GET");
      // 响应结构：res.data = { code, message, data: { data: { items, categories }, updatedAt, ... } }
      const outer = res.data.data; // { data: {...}, version, itemCount, updatedAt }
      const inner = outer.data; // { items, categories }

      // 计算本地数据
      itemManager.updateData();
      const localItems = itemManager.getAllItems();
      const localCategories = itemManager.getCategories();

      // 计算差异
      const remoteItems = inner.items || [];
      const remoteCategories = inner.categories || [];
      const addedCount = remoteItems.filter(
        (r) => !localItems.find((l) => l.id === r.id),
      ).length;
      const removedCount = localItems.filter(
        (l) => !remoteItems.find((r) => r.id === l.id),
      ).length;
      const updatedCount = remoteItems.filter((r) => {
        const local = localItems.find((l) => l.id === r.id);
        return local && local.updatedAt !== r.updatedAt;
      }).length;

      const remoteSummary = {
        itemCount: outer.itemCount ?? remoteItems.length,
        categoryCount: remoteCategories.length,
        updatedAt: outer.updatedAt ? this._formatDate(outer.updatedAt) : "未知",
        localItemCount: localItems.length,
        localCategoryCount: localCategories.length,
        addedCount,
        removedCount,
        updatedCount,
        noChange: addedCount === 0 && removedCount === 0 && updatedCount === 0,
      };

      this.setData({
        remoteData: inner,
        remoteSummary,
        showDownloadConfirm: true,
        isDownloading: false,
      });
    } catch (error) {
      console.error("获取云端数据失败:", error);
      this.onShowToast("#t-toast", "获取云端数据失败，请重试");
      this.setData({ isDownloading: false });
    }
  },

  // 用户确认覆盖本地数据
  onConfirmDownload() {
    const remote = this.data.remoteData;
    if (!remote) return;

    try {
      const importJson = JSON.stringify({
        items: remote.items || [],
        categories: remote.categories || [],
      });
      itemManager.importData(importJson);
      this.loadStats();
      this.setData({ showDownloadConfirm: false, remoteData: null });
      this.onShowToast("#t-toast", "数据已更新");

      // 通知其他页面刷新
      const app = getApp();
      if (app.eventBus) {
        app.globalData.itemManager.updateData();
        app.eventBus.emit("itemChanged", app.globalData.itemManager);
      }
    } catch (error) {
      console.error("覆盖本地数据失败:", error);
      this.onShowToast("#t-toast", "数据导入失败");
    }
  },

  onCancelDownload() {
    this.setData({ showDownloadConfirm: false, remoteData: null });
  },

  // ─── 本地导出 ─────────────────────────────────────────────────

  onExportJSON() {
    wx.showActionSheet({
      itemList: ["复制到剪贴板", "保存到本地文件"],
      success: (res) => {
        if (res.tapIndex === 0) this.exportToClipboard();
        else if (res.tapIndex === 1) this.exportToFile();
      },
    });
  },

  exportToClipboard() {
    try {
      const jsonData = itemManager.exportData();
      wx.setClipboardData({
        data: jsonData,
        success: () => {
          wx.showModal({
            title: "导出成功",
            content:
              "JSON数据已复制到剪贴板\n\n您可以粘贴到记事本保存或发送给好友。",
            showCancel: false,
            confirmText: "知道了",
          });
        },
        fail: () => this.onShowToast("#t-toast", "复制失败"),
      });
    } catch (error) {
      this.onShowToast("#t-toast", "导出失败");
    }
  },

  exportToFile() {
    try {
      const jsonData = itemManager.exportData();
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const fileName = `vibe-items-${timestamp}.json`;
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      wx.getFileSystemManager().writeFile({
        filePath,
        data: jsonData,
        encoding: "utf8",
        success: () => {
          wx.showModal({
            title: "导出成功",
            content: `文件已保存\n\n文件名：${fileName}`,
            showCancel: false,
            confirmText: "知道了",
          });
        },
        fail: () => this.onShowToast("#t-toast", "保存文件失败"),
      });
    } catch (error) {
      this.onShowToast("#t-toast", "导出失败");
    }
  },

  onExportExcel() {
    this.onShowToast("#t-toast", "功能开发中...");
  },

  // ─── 本地导入 ─────────────────────────────────────────────────

  onImportData() {
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: (res) => {
        const filePath = res.tempFiles[0].path;
        wx.getFileSystemManager().readFile({
          filePath,
          encoding: "utf8",
          success: (readRes) => {
            try {
              itemManager.importData(readRes.data);
              this.loadStats();
              this.onShowToast("#t-toast", "导入成功");
            } catch (error) {
              this.onShowToast("#t-toast", "导入失败: " + error.message);
            }
          },
          fail: () => this.onShowToast("#t-toast", "读取文件失败"),
        });
      },
    });
  },

  // ─── 清空数据 ─────────────────────────────────────────────────

  onClearAllData() {
    this.setData({
      showDialog: true,
      dialogTitle: "确认清空数据",
      dialogContent:
        "此操作将删除所有物品和自定义分类，且不可恢复。确定要继续吗？",
      dialogAction: "clear",
    });
  },

  onDialogConfirm() {
    if (this.data.dialogAction === "clear") {
      try {
        itemManager.clearAllData();
        this.loadStats();
        this.onShowToast("#t-toast", "数据已清空");
      } catch (error) {
        this.onShowToast("#t-toast", "清空失败");
      }
    }
    this.setData({ showDialog: false });
  },

  onDialogCancel() {
    this.setData({ showDialog: false });
  },

  // ─── 工具方法 ─────────────────────────────────────────────────

  _formatDate(isoString) {
    try {
      const d = new Date(isoString);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate(),
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return isoString;
    }
  },

  stopPropagation() {},
});
