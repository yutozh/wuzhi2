const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join("/")} ${[hour, minute, second].map(formatNumber).join(":")}`;
};

// 复制到本地临时路径，方便预览
const getLocalUrl = (path, name) => {
  const fs = wx.getFileSystemManager();
  const tempFileName = `${wx.env.USER_DATA_PATH}/${name}`;
  fs.copyFileSync(path, tempFileName);
  return tempFileName;
};

const formatToTwoDecimal = (input) => {
  let val = input.replace(/[^\d.]/g, "");
  const parts = val.split(".");
  if (parts.length > 1) val = parts[0] + "." + parts.slice(1).join("");
  if (val.startsWith(".")) val = "0" + val;
  if (val.indexOf(".") !== -1) {
    const [intPart, decPart] = val.split(".");
    val = intPart + "." + decPart.slice(0, 2);
  }
  if (!val.includes(".")) {
    val = val.replace(/^0+(\d)/, "$1");
    if (val === "") val = "0";
  } else {
    val = val.replace(/^0+(\d)/, "0$1");
  }
  return val;
};

const toCents = (price) => Math.round(price * 100);
const toPrice = (cents) => Number(cents) / 100;

export { formatTime, getLocalUrl, toCents, toPrice, formatToTwoDecimal };
