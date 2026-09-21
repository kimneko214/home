const CONFIG = {

  // ========================================
  // 教材库
  // ========================================

  TEXTBOOK_LIBRARY_URL:
    "https://kimneko214.github.io/textbook/",


  // ========================================
  // London Transit Worker
  // ========================================

  // ↓↓↓ 这里改成 Cloudflare 实际给你的地址
  //
  // 注意：
  //
  // 正确：
  // https://ltc-home-bus.xxxxx.workers.dev
  //
  // 不要写：
  // /health
  //
  // 也不要写：
  // /arrivals

  TRANSIT_API_URL:
    "https://ltc-home-bus.jiangfan0611.workers.dev",


  // ========================================
  // 家附近公交站
  // ========================================

  TRANSIT_STOPS: [

    {
      id: "2409",
      name:
        "Oakcrossing Gate · Southbound"
    },

    {
      id: "2407",
      name:
        "Oakcrossing / Mapleridge"
    },

    {
      id: "2408",
      name:
        "Oakcrossing / Mapleridge"
    }

  ]

};
