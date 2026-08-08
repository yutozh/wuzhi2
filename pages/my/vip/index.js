import useToastBehavior from "~/behaviors/useToast";

Page({
  behaviors: [useToastBehavior],

  data: {
    currentVipLevel: "normal",
    redeemCode: "",
    showSuccessModal: false,
    successVipName: "",
    successFeatures: [],

    vipLevels: [
      {
        level: "vip",
        badgeImg: "/static/vip_badge.svg",
        name: "VIP会员",
        color: "#d4af37",
        price: "¥9.9/月",
      },
      {
        level: "yearly",
        badgeImg: "/static/vip_yearly.svg",
        name: "年费VIP",
        color: "#4169e1",
        price: "¥99/年",
      },
      {
        level: "permanent",
        badgeImg: "/static/vip_permanent.svg",
        name: "永久VIP",
        color: "#ff6b35",
        price: "¥299/终身",
      },
    ],

    features: [
      { name: "无限物品添加", free: false },
      { name: "高级数据统计", free: false },
      { name: "数据云端同步", free: false },
      { name: "自定义物品类别", free: false },
      { name: "数据导出功能", free: true },
      { name: "专属客服支持", free: false },
      { name: "去除广告", free: false },
      { name: "优先体验新功能", free: false },
    ],

    benefits: [
      {
        icon: "/static/vip-icons/unlimited.svg",
        title: "无限添加",
        desc: "不限数量，随心管理所有物品",
      },
      {
        icon: "/static/vip-icons/cloud.svg",
        title: "云端同步",
        desc: "多设备实时同步，数据永不丢失",
      },
      {
        icon: "/static/vip-icons/chart.svg",
        title: "高级统计",
        desc: "专业数据分析，洞察消费趋势",
      },
      {
        icon: "/static/vip-icons/custom.svg",
        title: "个性定制",
        desc: "自定义类别、标签和主题",
      },
      {
        icon: "/static/vip-icons/support.svg",
        title: "专属客服",
        desc: "7×24小时优先响应服务",
      },
      {
        icon: "/static/vip-icons/gift.svg",
        title: "会员礼包",
        desc: "定期专属福利和惊喜礼包",
      },
    ],
  },

  onLoad() {
    this.loadUserVipStatus();
  },

  onShow() {
    this.loadUserVipStatus();
  },

  loadUserVipStatus() {
    try {
      const userInfo = wx.getStorageSync("user_info");
      if (userInfo && userInfo.vipLevel) {
        this.setData({
          currentVipLevel: userInfo.vipLevel,
        });
      }
    } catch (error) {
      console.error("加载VIP状态失败:", error);
    }
  },

  onCodeInput(e) {
    this.setData({
      redeemCode: e.detail.value.trim(),
    });
  },

  onRedeemCode() {
    const { redeemCode } = this.data;

    if (!redeemCode) {
      this.onShowToast("#t-toast", "请输入兑换码");
      return;
    }

    // 验证兑换码
    const codeMap = {
      happy: { level: "vip", name: "VIP会员" },
      happy2024: { level: "yearly", name: "年费VIP" },
      forever: { level: "permanent", name: "永久VIP" },
    };

    const result = codeMap[redeemCode.toLowerCase()];

    if (!result) {
      this.onShowToast("#t-toast", "兑换码无效，请检查后重试");
      return;
    }

    // 检查是否已经是更高等级
    const levelOrder = { normal: 0, vip: 1, yearly: 2, permanent: 3 };
    if (levelOrder[this.data.currentVipLevel] >= levelOrder[result.level]) {
      this.onShowToast("#t-toast", "您已是该等级或更高等级会员");
      return;
    }

    // 开通成功
    this.activateVip(result.level, result.name);
  },

  activateVip(level, name) {
    try {
      // 更新本地存储
      const userInfo = wx.getStorageSync("user_info") || {};
      userInfo.vipLevel = level;
      wx.setStorageSync("user_info", userInfo);

      console.log("VIP开通成功:", level);

      // 跳转到成功页面
      wx.navigateTo({
        url: `/pages/my/vip-success/index?level=${level}&name=${encodeURIComponent(
          name,
        )}`,
      });
    } catch (error) {
      console.error("VIP开通失败:", error);
      this.onShowToast("#t-toast", "开通失败，请重试");
    }
  },
});
