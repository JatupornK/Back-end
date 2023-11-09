const timeZone = "Asia/Bangkok";
const date = new Date();
const options = {
  timeZone,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};
exports.currentTime = date.toLocaleString("en-US", options);
date.setFullYear(date.getFullYear() + 1);
exports.nextOneYear = date.toLocaleString("en-us", options);

