const cfg =
  CONFIG;


// ==========================================================
// 时间
// ==========================================================

function updateClocks() {

  const now =
    new Date();


  // --------------------------------------------------------
  // 顶部：设备自己的当地时间
  // --------------------------------------------------------

  const localTime =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false
      }
    )
    .format(
      now
    );


  const localDate =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        month:
          "long",

        day:
          "numeric",

        weekday:
          "short"
      }
    )
    .format(
      now
    );


  document
    .getElementById(
      "todayText"
    )
    .textContent =
      localDate;


  document
    .getElementById(
      "tokyoTime"
    )
    .textContent =
      `本机 ${localTime}`;



  // --------------------------------------------------------
  // Tokyo
  // --------------------------------------------------------

  const tokyoTime =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        timeZone:
          "Asia/Tokyo",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false
      }
    )
    .format(
      now
    );


  const tokyoDate =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        timeZone:
          "Asia/Tokyo",

        month:
          "long",

        day:
          "numeric",

        weekday:
          "short"
      }
    )
    .format(
      now
    );


  document
    .getElementById(
      "tokyoClock"
    )
    .textContent =
      tokyoTime;


  document
    .getElementById(
      "tokyoDate"
    )
    .textContent =
      tokyoDate;



  // --------------------------------------------------------
  // London
  // --------------------------------------------------------

  const londonTime =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        timeZone:
          "America/Toronto",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false
      }
    )
    .format(
      now
    );


  const londonDate =

    new Intl.DateTimeFormat(
      "zh-CN",
      {
        timeZone:
          "America/Toronto",

        month:
          "long",

        day:
          "numeric",

        weekday:
          "short"
      }
    )
    .format(
      now
    );


  document
    .getElementById(
      "londonClock"
    )
    .textContent =
      londonTime;


  document
    .getElementById(
      "londonDate"
    )
    .textContent =
      londonDate;

}


updateClocks();


setInterval(
  updateClocks,
  30000
);



// ==========================================================
// 回家
// ==========================================================

const HOME_ADDRESS_KEY =
  "dashboard.homeAddress";


const MAP_PROVIDER_KEY =
  "dashboard.mapProvider";


const homeDialog =
  document.getElementById(
    "homeDialog"
  );


const homeForm =
  document.getElementById(
    "homeForm"
  );


const homeAddress =
  document.getElementById(
    "homeAddress"
  );


const mapProvider =
  document.getElementById(
    "mapProvider"
  );


const homeStatus =
  document.getElementById(
    "homeStatus"
  );



function getHome() {

  return (
    localStorage.getItem(
      HOME_ADDRESS_KEY
    ) || ""
  );

}


function getProvider() {

  return (
    localStorage.getItem(
      MAP_PROVIDER_KEY
    ) || "google"
  );

}


function refreshHomeStatus() {

  homeStatus.textContent =

    getHome()

      ? "地址已保存在这台设备。"

      : "第一次使用请设置家的地址。";

}


function openHomeSettings() {

  homeAddress.value =
    getHome();


  mapProvider.value =
    getProvider();


  homeDialog.showModal();

}


function navigateHome() {

  const address =
    getHome();


  if (
    !address
  ) {

    openHomeSettings();

    return;

  }


  const encoded =
    encodeURIComponent(
      address
    );


  const url =

    getProvider() ===
    "apple"

      ?

      `https://maps.apple.com/?daddr=${encoded}&dirflg=d`

      :

      `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;


  window.open(
    url,
    "_blank",
    "noopener"
  );

}


document
  .getElementById(
    "editHomeBtn"
  )
  .addEventListener(
    "click",
    openHomeSettings
  );


document
  .getElementById(
    "goHomeBtn"
  )
  .addEventListener(
    "click",
    navigateHome
  );


homeForm.addEventListener(
  "submit",
  event => {


    if (
      event.submitter?.value !==
      "save"
    ) {

      return;

    }


    event.preventDefault();


    const value =
      homeAddress.value.trim();


    if (
      !value
    ) {

      homeAddress.focus();

      return;

    }


    localStorage.setItem(
      HOME_ADDRESS_KEY,
      value
    );


    localStorage.setItem(
      MAP_PROVIDER_KEY,
      mapProvider.value
    );


    homeDialog.close();


    refreshHomeStatus();

  }
);


document
  .getElementById(
    "clearHomeBtn"
  )
  .addEventListener(
    "click",
    () => {


      localStorage.removeItem(
        HOME_ADDRESS_KEY
      );


      localStorage.removeItem(
        MAP_PROVIDER_KEY
      );


      homeDialog.close();


      refreshHomeStatus();

    }
  );


refreshHomeStatus();



// ==========================================================
// 公交
// ==========================================================

const arrivalsEl =
  document.getElementById(
    "arrivals"
  );


const statusEl =
  document.getElementById(
    "transitStatus"
  );


const updatedEl =
  document.getElementById(
    "updatedAt"
  );


const refreshBtn =
  document.getElementById(
    "refreshTransit"
  );



// ==========================================================
// HTML escape
// ==========================================================

function escapeHtml(
  text = ""
) {

  return String(text)
    .replace(

      /[&<>"']/g,

      char => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      }[char])

    );

}



// ==========================================================
// 获取所有要查询的 Stop ID
// ==========================================================

function getAllStopIds() {

  return [

    ...new Set(

      cfg.BUS_GROUPS.flatMap(

        group =>
          group.stopIds || []

      )

    )

  ];

}



// ==========================================================
// 判断 HeadSign 是否符合
// ==========================================================

function matchesHeadsign(
  arrival,
  group
) {

  if (
    !group.headsignIncludes ||
    group.headsignIncludes.length === 0
  ) {

    return true;

  }


  const headsign =

    String(
      arrival.headsign || ""
    )
    .toLowerCase();


  return group
    .headsignIncludes
    .some(

      keyword =>

        headsign.includes(
          String(keyword)
            .toLowerCase()
        )

    );

}



// ==========================================================
// 某一个方向的班次
// ==========================================================

function getGroupArrivals(
  allArrivals,
  group
) {

  return allArrivals

    .filter(

      item => {


        const routeMatches =

          String(
            item.route
          )

          ===

          String(
            group.route
          );


        const stopMatches =

          group.stopIds.includes(

            String(
              item.stopId
            )

          );


        const directionMatches =

          matchesHeadsign(
            item,
            group
          );


        return (

          routeMatches &&

          stopMatches &&

          directionMatches

        );

      }

    )

    .sort(

      (
        a,
        b
      ) =>

        a.minutes -
        b.minutes

    )

    .slice(
      0,
      3
    );

}



// ==========================================================
// 时间 Chip
// ==========================================================

function renderTimeChip(
  item
) {

  const timeText =

    item.minutes <= 0

      ? "到站"

      : `${item.minutes} min`;


  const realtime =
    item.realtime === true;


  return `

    <div
      class="bus-time-chip ${realtime ? "live" : "scheduled"}"
    >

      <strong>
        ${escapeHtml(timeText)}
      </strong>

      <small>

        ${
          realtime
            ? "● 实时"
            : "○ 计划"
        }

      </small>

    </div>

  `;

}



// ==========================================================
// 渲染公交方向
// ==========================================================

function renderTransitGroups(
  allArrivals
) {

  arrivalsEl.innerHTML =

    cfg.BUS_GROUPS
      .map(
        group => {


          const arrivals =

            getGroupArrivals(

              allArrivals,

              group

            );


          let timesHtml;


          if (
            arrivals.length > 0
          ) {


            timesHtml =

              arrivals
                .map(
                  renderTimeChip
                )
                .join("");


          }

          else {


            timesHtml = `

              <div class="no-bus">

                暂无即将到站班次

              </div>

            `;

          }


          const firstHeadsign =

            arrivals[0]?.headsign || "";


          return `

            <section class="bus-direction">

              <div class="bus-direction-head">

                <div class="bus-route">

                  ${escapeHtml(group.route)}

                </div>


                <div class="bus-direction-info">

                  <strong>

                    ${escapeHtml(group.title)}

                  </strong>

                  <small>

                    ${escapeHtml(group.subtitle)}

                  </small>

                  ${
                    firstHeadsign

                      ? `

                        <span class="bus-headsign">

                          ${escapeHtml(firstHeadsign)}

                        </span>

                      `

                      : ""
                  }

                </div>

              </div>


              <div class="bus-times">

                ${timesHtml}

              </div>

            </section>

          `;

        }
      )
      .join("");

}



// ==========================================================
// 加载公交
// ==========================================================

async function loadTransit() {

  if (
    !cfg.TRANSIT_API_URL
  ) {

    return;

  }


  refreshBtn.classList.add(
    "spinning"
  );


  statusEl.textContent =
    "正在更新实时公交…";


  try {


    const stopIds =
      getAllStopIds();


    const apiUrl =

      cfg.TRANSIT_API_URL
        .replace(
          /\/$/,
          ""
        )

      +

      `/arrivals?stops=${encodeURIComponent(stopIds.join(","))}`;


    const response =

      await fetch(

        apiUrl,

        {
          cache:
            "no-store"
        }

      );


    if (
      !response.ok
    ) {

      throw new Error(

        `HTTP ${response.status}`

      );

    }


    const data =
      await response.json();


    const arrivals =

      Array.isArray(
        data.arrivals
      )

      ? data.arrivals

      : [];


    renderTransitGroups(
      arrivals
    );


    const liveCount =

      arrivals.filter(
        item =>
          item.realtime === true
      ).length;


    if (
      arrivals.length > 0
    ) {

      statusEl.textContent =

        liveCount > 0

          ? `实时公交 · ${liveCount} 条实时预测`

          : "当前显示计划时刻";

    }

    else {

      statusEl.textContent =
        "目前没有查到即将到站车辆。";

    }


    const updated =

      new Date(
        data.generatedAt ||
        Date.now()
      );


    updatedEl.textContent =

      `更新 ${updated.toLocaleTimeString(
        "zh-CN",
        {
          hour:
            "2-digit",

          minute:
            "2-digit",

          second:
            "2-digit"
        }
      )}`;


  }

  catch (
    error
  ) {


    console.error(
      error
    );


    statusEl.textContent =
      "实时公交读取失败。";


    arrivalsEl.innerHTML = `

      <div class="bus-error">

        无法连接实时公交 API

      </div>

    `;


    updatedEl.textContent =
      "连接失败";

  }

  finally {


    refreshBtn.classList.remove(
      "spinning"
    );

  }

}



// ==========================================================
// 手动刷新
// ==========================================================

refreshBtn.addEventListener(
  "click",
  loadTransit
);


// 第一次加载
loadTransit();


// 每 30 秒更新
setInterval(
  loadTransit,
  30000
);



// ==========================================================
// Service Worker
// ==========================================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator
        .serviceWorker
        .register(
          "./sw.js"
        )
        .catch(
          () => {}
        );

    }
  );

}
