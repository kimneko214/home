const CONFIG = {
  // 你的教材库
  TEXTBOOK_LIBRARY_URL: "https://kimneko214.github.io/textbook/",

  // 部署 Cloudflare Worker 后，把这里换成你的 Worker 地址。
  // 例：https://ltc-home-bus.yourname.workers.dev
  TRANSIT_API_URL: "PASTE_YOUR_WORKER_URL_HERE",

  // 家附近先放 3 个候选站。
  // 2407/2408: Oakcrossing at Mapleridge；2409: Oakcrossing Gate at Oakcrossing Rd。
  // 后续如果你只想保留某一个站，删除其他项即可。
  TRANSIT_STOPS: [
    { id: "2407", name: "Oakcrossing at Mapleridge north" },
    { id: "2408", name: "Oakcrossing at Mapleridge south" },
    { id: "2409", name: "Oakcrossing Gate at Oakcrossing Rd" }
  ]
};
