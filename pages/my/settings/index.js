import useToastBehavior from "~/behaviors/useToast";
import { clearAuth } from "~/utils/auth";

Page({
  behaviors: [useToastBehavior],

  data: {
    settings: {
      cardView: true,
    },
  },

  onLoad() {
    this.loadSettings();
  },

  loadSettings() {
    try {
      const settings = wx.getStorageSync("app_settings");
      if (settings) {
        this.setData({ settings });
      }
    } catch (error) {
      console.error("加载设置失败:", error);
    }
  },

  saveSettings() {
    try {
      wx.setStorageSync("app_settings", this.data.settings);
    } catch (error) {
      console.error("保存设置失败:", error);
    }
  },

  onCardViewChange(e) {
    this.setData({ "settings.cardView": e.detail.value });
    this.saveSettings();
    this.onShowToast(
      "#t-toast",
      e.detail.value ? "已切换卡片视图" : "已切换列表视图",
    );
  },

  onAbout() {
    wx.showModal({
      title: "关于应用",
      content: "一个优雅的物品管理工具，帮助您记录和管理生活中的每一件物品",
      showCancel: false,
      confirmText: "知道了",
    });
  },

  onHelp() {
    wx.navigateTo({ url: "/pages/my/help/index" });
  },

  onFeedback() {
    wx.navigateTo({ url: "/pages/my/feedback/index" });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "退出后将清除登录信息，物品数据不受影响，确认退出？",
      confirmText: "退出",
      confirmColor: "#ff3b30",
      cancelText: "取消",
      success: (res) => {
        if (!res.confirm) return;
        clearAuth();
        wx.showToast({ title: "已退出登录", icon: "success", duration: 1500 });
        setTimeout(() => wx.switchTab({ url: "/pages/my/index" }), 1500);
      },
    });
  },
});
