Page({
  data: {
    vipLevel: "",
    vipName: "",
    badgeImg: "",
    features: [],
  },

  onLoad(options) {
    const { level, name } = options;

    // VIP配置
    const vipConfig = {
      vip: {
        badgeImg: "/static/vip_badge.svg",
        features: ["无限物品添加", "高级数据统计", "自定义类别", "去除广告"],
      },
      yearly: {
        badgeImg: "/static/vip_yearly.svg",
        features: ["无限物品添加", "高级数据统计", "云端同步", "专属客服"],
      },
      permanent: {
        badgeImg: "/static/vip_permanent.svg",
        features: [
          "所有VIP功能",
          "终身免费更新",
          "优先体验新功能",
          "专属会员礼包",
        ],
      },
    };

    const config = vipConfig[level] || vipConfig.vip;

    this.setData({
      vipLevel: level,
      vipName: decodeURIComponent(name),
      badgeImg: config.badgeImg,
      features: config.features,
    });
  },

  onStartExperience() {
    // 返回到个人中心
    wx.navigateBack({
      delta: 2, // 返回两层（跳过VIP开通页）
    });
  },

  onBackToProfile() {
    // 返回到个人中心
    wx.navigateBack({
      delta: 2,
    });
  },
});
