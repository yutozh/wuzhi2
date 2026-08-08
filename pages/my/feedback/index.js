import request from "~/api/request";
import { isLoggedIn } from "~/utils/auth";

Page({
  data: {
    categories: [
      { label: "功能建议", value: "feature" },
      { label: "Bug 反馈", value: "bug" },
      { label: "体验问题", value: "ux" },
      { label: "数据问题", value: "data" },
      { label: "其他", value: "other" },
    ],
    selectedCategory: "",
    content: "",
    email: "",
    captchaInput: "",
    captchaImage: "",
    captchaLoading: false,
    submitting: false,
  },

  onLoad() {
    // 未登录则弹窗引导，并返回上一页
    if (!isLoggedIn()) {
      wx.showModal({
        title: "请先登录",
        content: "提交反馈需要登录账号，登录后即可使用。",
        confirmText: "去登录",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: "/pages/my/index" });
          else wx.navigateBack();
        },
      });
      return;
    }

    this.loadCaptcha();
  },

  // 请求验证码
  async loadCaptcha() {
    if (this.data.captchaLoading) return;
    this.setData({ captchaLoading: true, captchaInput: "" });

    try {
      const res = await request("/feedback/captcha", "GET");
      // 响应结构：res.data = { code, message, data: { code, message, data: { image, ... } } }
      let { image } = res.data.data.data;

      let captchaImage = "";

      if (image && image.startsWith("data:image/svg+xml;base64,")) {
        // 微信小程序 <image> 不支持 SVG
        // 用 background-image 内联样式渲染，直接把 data URI 作为背景图
        captchaImage = image;
      } else if (
        image &&
        !image.startsWith("data:") &&
        !image.startsWith("http")
      ) {
        // 裸 Base64 PNG/JPG，补全前缀
        captchaImage = `data:image/png;base64,${image}`;
      } else {
        captchaImage = image || "";
      }
      this.setData({ captchaImage });
    } catch (error) {
      console.error("获取验证码失败:", error);
      wx.showToast({ title: "验证码加载失败，请点击刷新", icon: "none" });
    } finally {
      this.setData({ captchaLoading: false });
    }
  },

  onSelectCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.value });
  },

  onContentChange(e) {
    this.setData({ content: e.detail.value });
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value });
  },

  onCaptchaInput(e) {
    this.setData({ captchaInput: e.detail.value });
  },

  onRefreshCaptcha() {
    this.loadCaptcha();
  },

  async onSubmit() {
    const { selectedCategory, content, email, captchaInput, submitting } =
      this.data;

    if (submitting) return;

    if (!selectedCategory) {
      wx.showToast({ title: "请选择反馈类型", icon: "none" });
      return;
    }

    if (!content.trim()) {
      wx.showToast({ title: "请填写反馈内容", icon: "none" });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      wx.showToast({ title: "邮箱格式不正确", icon: "none" });
      return;
    }

    if (!captchaInput.trim()) {
      wx.showToast({ title: "请输入验证码", icon: "none" });
      return;
    }

    this.setData({ submitting: true });

    try {
      await request("/feedback", "POST", {
        category: selectedCategory,
        content: content.trim(),
        email: email.trim() || undefined,
        captcha: captchaInput.trim(),
      });

      wx.showToast({
        title: "感谢您的反馈！",
        icon: "success",
        duration: 1500,
      });

      // 重置表单
      this.setData({
        selectedCategory: "",
        content: "",
        email: "",
        captchaInput: "",
        captchaImage: "",
        submitting: false,
      });

      setTimeout(() => wx.navigateBack(), 1500);
    } catch (error) {
      console.error("提交反馈失败:", error);
      this.setData({ submitting: false });

      const errMsg = error.errMsg || error.message || "";
      const isNetwork =
        errMsg.includes("request:fail") || errMsg.includes("ERR_");

      if (!isNetwork) {
        // 非网络错误（如验证码错误），刷新验证码
        this.loadCaptcha();
      }

      wx.showToast({
        title: isNetwork ? "网络异常，请稍后重试" : "验证码错误，请重新输入",
        icon: "none",
      });
    }
  },
});
