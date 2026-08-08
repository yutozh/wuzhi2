/**
 * 登录工具模块
 * 封装微信登录 + 后端换取用户信息的完整流程
 */
import request from "~/api/request";

const USER_INFO_KEY = "user_info";
const ACCESS_TOKEN_KEY = "access_token";

/**
 * 检查当前是否已登录
 * 判断依据：本地存储中有 user_info 且有 token
 */
export function isLoggedIn() {
  try {
    const token = wx.getStorageSync(ACCESS_TOKEN_KEY);
    return !!token;
  } catch (e) {
    return false;
  }
}

/**
 * 获取本地缓存的用户信息
 */
export function getLocalUserInfo() {
  try {
    return wx.getStorageSync(USER_INFO_KEY) || null;
  } catch (e) {
    return null;
  }
}

/**
 * 保存用户信息到本地
 */
export function saveUserInfo(userInfo) {
  wx.setStorageSync(USER_INFO_KEY, userInfo);
}

/**
 * 保存 token 到本地
 */
export function saveToken(token) {
  wx.setStorageSync(ACCESS_TOKEN_KEY, token);
}

/**
 * 清除登录信息（退出登录）
 */
export function clearAuth() {
  wx.removeStorageSync(USER_INFO_KEY);
  wx.removeStorageSync(ACCESS_TOKEN_KEY);
}

/**
 * 执行微信登录流程：
 * 1. 调用 wx.login 获取 code
 * 2. 将 code 发送给后端，换取 token 和用户信息
 * 3. 将 token 和用户信息保存到本地
 *
 * @returns {Promise<{userInfo, isNewUser}>}
 */
export function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error("获取微信登录凭证失败"));
          return;
        }

        // 将 code 发送给后端
        request("/auth/wx-login", "POST", { code: loginRes.code })
          .then((res) => {
            // res.data 是响应体 { code, message, data: { token, userInfo, isNewUser } }
            const { token, userInfo, isNewUser } = res.data.data;

            // 保存 token 和用户信息
            saveToken(token);
            saveUserInfo(userInfo);

            resolve({ userInfo, isNewUser: !!isNewUser });
          })
          .catch((err) => {
            console.error("后端登录接口失败:", err);
            reject(err);
          });
      },
      fail(err) {
        console.error("wx.login 失败:", err);
        reject(err);
      },
    });
  });
}
