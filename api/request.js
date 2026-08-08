import config from "~/config";

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;
function request(url, method = "GET", data = {}) {
  const header = {
    "content-type": "application/json",
    // 有其他content-type需求加点逻辑判断处理即可
  };
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync("access_token");
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      dataType: "json", // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        setTimeout(() => {
          // 兼容两种情况：
          // 1. 真实 wx.request：res.statusCode 是 HTTP 状态码，2xx 均视为成功
          // 2. Mock 环境：直接把响应体作为 res，用 res.code 判断
          const isSuccess =
            (res.statusCode >= 200 && res.statusCode < 300) || res.code === 200;
          if (isSuccess) {
            resolve(res);
          } else {
            // wx.request的特性，只要有响应就会走success回调，所以在这里判断状态，非200的均视为请求失败
            reject(res);
          }
        }, delay);
      },
      fail(err) {
        setTimeout(() => {
          // 断网、服务器挂了都会fail回调，直接reject即可
          reject(err);
        }, delay);
      },
    });
  });
}

// 导出请求和服务地址
export default request;
