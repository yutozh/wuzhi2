import useToastBehavior from "~/behaviors/useToast";
import { ItemManager } from "~/utils/itemManager";
import { isLoggedIn, wxLogin, saveUserInfo } from "~/utils/auth";

const itemManager = new ItemManager();

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoggedIn: false,
    isLoggingIn: false, // 防止重复点击
    userInfo: {
      name: "立即登录",
      id: "",
      avatar: "",
      vipLevel: "normal", // VIP等级：normal, vip, yearly, permanent
    },
    vipConfig: {
      normal: {
        badge: "/static/vip_normal.svg",
        color: "#1c1c1e",
        name: "",
        showBadge: false,
      },
      vip: {
        badge: "/static/vip_badge.svg",
        color: "#d4af37",
        name: "VIP",
        showBadge: true,
      },
      yearly: {
        badge: "/static/vip_yearly.svg",
        color: "#4169e1",
        name: "年费VIP",
        showBadge: true,
      },
      permanent: {
        badge: "/static/vip_permanent.svg",
        color: "#ff6b35",
        name: "永久VIP",
        showBadge: true,
      },
    },
    menuList: [
      {
        icon: "workspace_premium",
        label: "开通会员",
        type: "vip",
        url: "/pages/my/vip/index",
        highlight: true,
      },
      {
        icon: "cloud_sync",
        label: "数据同步与导出",
        type: "sync",
        url: "/pages/my/data-sync/index",
      },
      {
        icon: "category",
        label: "物品类别管理",
        type: "category",
        url: "/pages/my/category-manage/index",
      },
      {
        icon: "settings",
        label: "应用设置",
        type: "settings",
        url: "/pages/my/settings/index",
      },
    ],
    totalValue: 0,
    totalValueDisplay: "0.0k",
    totalItems: 0,
  },

  onLoad() {
    this.checkLoginStatus();
    this.calculateStats();
  },

  onShow() {
    this.checkLoginStatus();
    this.calculateStats();
  },

  checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync("user_info");
      console.log("检查登录状态，userInfo:", userInfo);

      if (userInfo && userInfo.name) {
        // 已登录，确保有vipLevel字段
        if (!userInfo.vipLevel) {
          userInfo.vipLevel = "normal";
        }
        this.setData({
          isLoggedIn: true,
          userInfo,
        });
        console.log("用户已登录，VIP等级:", userInfo.vipLevel);
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: {
            name: "立即登录",
            id: "",
            avatar: "",
            vipLevel: "normal",
          },
        });
        console.log("用户未登录");
      }
    } catch (error) {
      console.error("检查登录状态失败:", error);
      this.setData({ isLoggedIn: false });
    }
  },

  calculateStats() {
    try {
      itemManager.updateData();
      const items = itemManager.getAllItems();

      const totalValue = items.reduce(
        (sum, item) => sum + (item.purchasePrice || 0),
        0,
      );

      let totalValueDisplay = "0.0k";
      if (totalValue >= 1000) {
        totalValueDisplay = (totalValue / 1000).toFixed(1) + "k";
      } else {
        totalValueDisplay = totalValue.toFixed(0);
      }

      this.setData({
        totalValue,
        totalValueDisplay,
        totalItems: items.length,
      });
    } catch (error) {
      console.error("计算统计数据失败:", error);
      this.setData({
        totalValue: 0,
        totalValueDisplay: "0.0k",
        totalItems: 0,
      });
    }
  },

  onEditProfile() {
    if (!this.data.isLoggedIn) {
      // 未登录，触发微信登录流程
      this.doWxLogin();
    } else {
      // 已登录，进入编辑页
      wx.navigateTo({
        url: "/pages/my/profile-edit/index",
      });
    }
  },

  // 执行微信登录
  doWxLogin() {
    if (this.data.isLoggingIn) return;
    this.setData({ isLoggingIn: true });

    wxLogin()
      .then(({ userInfo, isNewUser }) => {
        this.setData({
          isLoggedIn: true,
          isLoggingIn: false,
          userInfo: {
            ...userInfo,
            vipLevel: userInfo.vipLevel || "normal",
          },
        });

        // 登录成功后进入资料编辑页（新老用户都进入，让用户确认/修改昵称头像）
        wx.navigateTo({
          url: `/pages/my/profile-edit/index?isNewUser=${isNewUser ? 1 : 0}`,
        });
      })
      .catch((err) => {
        console.error("登录失败:", err);
        this.setData({ isLoggingIn: false });
        this.onShowToast("#t-toast", "登录失败，请重试");
      });
  },

  onMenuClick(e) {
    const { type, url } = e.currentTarget.dataset;

    if (url) {
      wx.navigateTo({
        url,
        fail: (err) => {
          console.error("页面跳转失败:", err);
          this.onShowToast("#t-toast", "页面开发中...");
        },
      });
    } else {
      this.onShowToast("#t-toast", "功能开发中...");
    }
  },
});
