const app = getApp();

Component({
  data: {
    value: "", // 初始值设置为空，避免第一次加载时闪烁
    list: [
      {
        icon: "home",
        value: "home",
        label: "首页",
      },
      {
        icon: "chart",
        value: "stats",
        label: "统计",
      },
      {
        icon: "user",
        value: "my",
        label: "我的",
      },
    ],
  },
  lifetimes: {
    ready() {
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      if (curPage) {
        // 根据当前路由设置对应的tabBar值
        let currentValue = "";
        if (curPage.route === "pages/home/index") {
          currentValue = "home";
        } else if (curPage.route === "pages/stats/index") {
          currentValue = "stats";
        } else if (curPage.route === "pages/my/index") {
          currentValue = "my";
        }

        if (currentValue) {
          this.setData({
            value: currentValue,
          });
        }
      }

      // 移除未读消息相关的逻辑，因为统计页面不需要
    },
  },
  methods: {
    handleChange(e) {
      const { value } = e.detail;
      wx.switchTab({ url: `/pages/${value}/index` });
    },
  },
});
