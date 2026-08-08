import useToastBehavior from "~/behaviors/useToast";
import { getLocalUserInfo, saveUserInfo } from "~/utils/auth";
import request from "~/api/request";

Page({
  behaviors: [useToastBehavior],

  data: {
    isNewUser: false,
    isSaving: false,
    genderOptions: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
      { label: "保密", value: "secret" },
    ],
    userInfo: {
      name: "",
      avatar: "",
      gender: "", // male | female | secret | ""（未选）
      vipLevel: "normal",
    },
  },

  onLoad(options) {
    const isNewUser = options.isNewUser === "1";
    this.setData({ isNewUser });
    this.loadUserInfo();
  },

  loadUserInfo() {
    try {
      const userInfo = getLocalUserInfo();

      if (userInfo && userInfo.name) {
        if (!userInfo.vipLevel) {
          userInfo.vipLevel = "normal";
        }
        this.setData({ userInfo });
      }
    } catch (error) {
      console.error("加载用户信息失败:", error);
    }
  },

  onNameInput(e) {
    this.setData({
      "userInfo.name": e.detail.value,
    });
  },

  // 选择头像（使用微信官方头像选择器，个人版小程序可用）
  onChooseAvatar(e) {
    // 优先使用微信官方 open-type="chooseAvatar" 返回的头像
    if (e && e.detail && e.detail.avatarUrl) {
      this.setData({ "userInfo.avatar": e.detail.avatarUrl });
      return;
    }
    // 降级：从相册选择
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        this.setData({ "userInfo.avatar": res.tempFilePaths[0] });
      },
      fail: (err) => {
        console.error("选择头像失败:", err);
        this.onShowToast("#t-toast", "选择头像失败");
      },
    });
  },

  // 使用微信昵称（通过 input type="nickname" 获取）
  onNicknameInput(e) {
    this.setData({ "userInfo.name": e.detail.value });
  },

  onGenderSelect(e) {
    const value = e.currentTarget.dataset.value;
    // 再次点击同一个则取消选择
    this.setData({
      "userInfo.gender": this.data.userInfo.gender === value ? "" : value,
    });
  },

  async onSave() {
    if (this.data.isSaving) return;

    if (!this.data.userInfo.name || !this.data.userInfo.name.trim()) {
      this.onShowToast("#t-toast", "请输入昵称");
      return;
    }

    if (!this.data.userInfo.avatar) {
      this.onShowToast("#t-toast", "请选择头像");
      return;
    }

    this.setData({ isSaving: true });

    try {
      // 将用户信息同步到后端
      const res = await request("/users/profile", "PATCH", {
        name: this.data.userInfo.name.trim(),
        avatar: this.data.userInfo.avatar,
        gender: this.data.userInfo.gender || null,
      });

      // res.data 是响应体 { code, message, data: { userInfo } }
      const serverUserInfo =
        res.data && res.data.data && res.data.data.userInfo;
      const updatedUserInfo = {
        ...this.data.userInfo,
        ...(serverUserInfo || {}),
        vipLevel:
          (serverUserInfo && serverUserInfo.vipLevel) ||
          this.data.userInfo.vipLevel ||
          "normal",
      };

      saveUserInfo(updatedUserInfo);
      this.setData({ isSaving: false });

      this.onShowToast(
        "#t-toast",
        this.data.isNewUser ? "登录成功" : "保存成功",
      );

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error("保存失败:", error);
      this.setData({ isSaving: false });

      // 判断是否为网络错误
      const errMsg = error.errMsg || error.message || "";
      const isNetworkError =
        errMsg.includes("request:fail") ||
        errMsg.includes("ERR_INTERNET_DISCONNECTED") ||
        errMsg.includes("ERR_CONNECTION_REFUSED") ||
        errMsg.includes("ERR_NAME_NOT_RESOLVED") ||
        errMsg.includes("timeout") ||
        errMsg.includes("network");

      if (isNetworkError) {
        this.onShowToast("#t-toast", "网络连接失败，个人信息未修改");
      } else {
        this.onShowToast("#t-toast", "保存失败，请重试");
      }
    }
  },
});
