const cfg = CONFIG;

// ----- 时钟 -----
function updateClocks(){
  const now=new Date();
  const fmt=(tz,opt)=>new Intl.DateTimeFormat("zh-CN",{timeZone:tz,...opt}).format(now);
  const tokyo=fmt("Asia/Tokyo",{hour:"2-digit",minute:"2-digit",hour12:false});
  const london=fmt("America/Toronto",{hour:"2-digit",minute:"2-digit",hour12:false});
  document.getElementById("tokyoClock").textContent=tokyo;
  document.getElementById("londonClock").textContent=london;
  document.getElementById("tokyoDate").textContent=fmt("Asia/Tokyo",{month:"long",day:"numeric",weekday:"short"});
  document.getElementById("londonDate").textContent=fmt("America/Toronto",{month:"long",day:"numeric",weekday:"short"});
  document.getElementById("todayText").textContent=fmt("Asia/Tokyo",{month:"long",day:"numeric",weekday:"short"});
  document.getElementById("tokyoTime").textContent=`Tokyo ${tokyo}`;
}
updateClocks();
setInterval(updateClocks,30000);

// ----- 家，只保存在本机 -----
const HOME_ADDRESS_KEY="dashboard.homeAddress";
const MAP_PROVIDER_KEY="dashboard.mapProvider";
const homeDialog=document.getElementById("homeDialog");
const homeForm=document.getElementById("homeForm");
const homeAddress=document.getElementById("homeAddress");
const mapProvider=document.getElementById("mapProvider");
const homeStatus=document.getElementById("homeStatus");

function getHome(){return localStorage.getItem(HOME_ADDRESS_KEY)||""}
function getProvider(){return localStorage.getItem(MAP_PROVIDER_KEY)||"google"}
function refreshHomeStatus(){homeStatus.textContent=getHome()?"地址已保存在这台设备。":"第一次使用请设置家的地址。"}
function openHomeSettings(){
  homeAddress.value=getHome();
  mapProvider.value=getProvider();
  homeDialog.showModal();
}
function navigateHome(){
  const address=getHome();
  if(!address){openHomeSettings();return}
  const encoded=encodeURIComponent(address);
  const url=getProvider()==="apple"
    ? `https://maps.apple.com/?daddr=${encoded}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  window.open(url,"_blank","noopener");
}
document.getElementById("editHomeBtn").addEventListener("click",openHomeSettings);
document.getElementById("goHomeBtn").addEventListener("click",navigateHome);
homeForm.addEventListener("submit",event=>{
  if(event.submitter?.value!=="save")return;
  event.preventDefault();
  const value=homeAddress.value.trim();
  if(!value){homeAddress.focus();return}
  localStorage.setItem(HOME_ADDRESS_KEY,value);
  localStorage.setItem(MAP_PROVIDER_KEY,mapProvider.value);
  homeDialog.close();
  refreshHomeStatus();
});
document.getElementById("clearHomeBtn").addEventListener("click",()=>{
  localStorage.removeItem(HOME_ADDRESS_KEY);
  localStorage.removeItem(MAP_PROVIDER_KEY);
  homeDialog.close();
  refreshHomeStatus();
});
refreshHomeStatus();

// ----- 实时公交 -----
const arrivalsEl=document.getElementById("arrivals");
const statusEl=document.getElementById("transitStatus");
const updatedEl=document.getElementById("updatedAt");
const refreshBtn=document.getElementById("refreshTransit");

function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

async function loadTransit(){
  if(!cfg.TRANSIT_API_URL || cfg.TRANSIT_API_URL.includes("PASTE_YOUR")){
    statusEl.textContent="还差最后一步：把 Cloudflare Worker 地址填进 config.js。";
    arrivalsEl.innerHTML="";
    updatedEl.textContent="未连接 API";
    return;
  }

  refreshBtn.classList.add("spinning");
  statusEl.textContent="正在更新实时到站…";

  try{
    const stopIds=cfg.TRANSIT_STOPS.map(s=>s.id).join(",");
    const response=await fetch(`${cfg.TRANSIT_API_URL.replace(/\/$/,"")}/arrivals?stops=${encodeURIComponent(stopIds)}`,{cache:"no-store"});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const data=await response.json();

    const names=new Map(cfg.TRANSIT_STOPS.map(s=>[String(s.id),s.name]));
    const arrivals=(data.arrivals||[])
      .filter(x=>x.minutes>=0)
      .sort((a,b)=>a.minutes-b.minutes)
      .slice(0,8);

    if(!arrivals.length){
      statusEl.textContent="目前没有查到这些站点的即将到站车辆。";
      arrivalsEl.innerHTML="";
    }else{
      statusEl.textContent=`未来到站 · ${arrivals.length} 班`;
      arrivalsEl.innerHTML=arrivals.map(item=>`
        <div class="arrival">
          <div class="route-badge">${escapeHtml(item.route||"?")}</div>
          <div class="arrival-main">
            <strong>${escapeHtml(names.get(String(item.stopId)) || `Stop ${item.stopId}`)}</strong>
            <small>${item.direction !== null && item.direction !== undefined ? `Direction ${escapeHtml(item.direction)}` : "LTC realtime"}</small>
          </div>
          <div class="mins">
            <strong>${item.minutes<=0 ? "到站" : item.minutes}</strong>
            <small>${item.minutes<=0 ? "" : "分钟"}</small>
          </div>
        </div>
      `).join("");
    }

    const dt=new Date(data.generatedAt || Date.now());
    updatedEl.textContent=`更新 ${dt.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`;
  }catch(err){
    console.error(err);
    statusEl.textContent="实时公交读取失败，可点右下角打开 LTC 官方页面。";
    arrivalsEl.innerHTML="";
    updatedEl.textContent="连接失败";
  }finally{
    refreshBtn.classList.remove("spinning");
  }
}

refreshBtn.addEventListener("click",loadTransit);
loadTransit();
setInterval(loadTransit,30000);

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
