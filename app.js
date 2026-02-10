// app.js
import config from "./config";
import Mock from "./mock/index";
import createBus from "./utils/eventBus";
import { connectSocket, fetchUnreadNum } from "./mock/chat";
import { ItemManager } from "~/utils/ItemManager";

// 在应用启动前就过滤警告
// (function () {
//   const originalWarn = console.warn;
//   const originalLog = console.log;
//   const originalError = console.error;

//   const filterMessage = (message) => {
//     return (
//       message.includes("wx.getSystemInfoSync") ||
//       message.includes("getSystemInfoSync") ||
//       message.includes("is deprecated") ||
//       message.includes("Please use wx.getSystemSetting") ||
//       message.includes("wx.getAppAuthorizeSetting") ||
//       message.includes("wx.getDeviceInfo") ||
//       message.includes("wx.getWindowInfo") ||
//       message.includes("wx.getAppBaseInfo")
//     );
//   };

//   console.warn = function (...args) {
//     const message = args.join(" ");
//     if (filterMessage(message)) return;
//     originalWarn.apply(console, args);
//   };

//   console.log = function (...args) {
//     const message = args.join(" ");
//     if (filterMessage(message)) return;
//     originalLog.apply(console, args);
//   };

//   console.error = function (...args) {
//     const message = args.join(" ");
//     if (filterMessage(message)) return;
//     originalError.apply(console, args);
//   };
// })();

if (config.isMock) {
  Mock();
}

App({
  onLaunch() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    this.getUnreadNum();
    this.connect();
  },
  globalData: {
    userInfo: null,
    unreadNum: 0, // 未读消息数量
    socket: null, // SocketTask 对象
    itemManager: new ItemManager(),
  },

  /** 全局事件总线 */
  eventBus: createBus(),

  /** 初始化WebSocket */
  connect() {
    const socket = connectSocket();
    socket.onMessage((data) => {
      data = JSON.parse(data);
      if (data.type === "message" && !data.data.message.read)
        this.setUnreadNum(this.globalData.unreadNum + 1);
    });
    this.globalData.socket = socket;
  },

  /** 获取未读消息数量 */
  getUnreadNum() {
    fetchUnreadNum().then(({ data }) => {
      this.globalData.unreadNum = data;
      this.eventBus.emit("unread-num-change", data);
    });
  },

  /** 设置未读消息数量 */
  setUnreadNum(unreadNum) {
    this.globalData.unreadNum = unreadNum;
    this.eventBus.emit("unread-num-change", unreadNum);
  },
});
