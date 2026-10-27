(()=>{
const houses=[['K Car Auction',0.022,165000,440000],['Kolon Auto Auction',0.02585,165000,null],['Lotte Auto Auction',0.022,110000,440000],['Autobell Smart Auction',0.022,165000,440000]];
const others=[[0,1000000,140000,'All vehicles'],[1000000,5000000,300000,'All vehicles'],[5000000,10000000,305000,'Korean light car (경차)'],[5000000,10000000,365000,'Regular car'],[10000000,15000000,365000,'All vehicles'],[15000000,30000000,395000,'All vehicles'],[30000000,40000000,475000,'All vehicles'],[40000000,null,505000,'All vehicles']];
const regions=[['Seoul',20000,['서울','seoul']],['Incheon / Gyeonggi',30000,['인천','incheon','경기','gyeonggi']],['Daejeon / Sejong / Chungnam / Chungbuk',50000,['대전','daejeon','세종','sejong','충남','chungnam','충북','chungbuk']],['Daegu / Gyeongbuk / Gangwon',80000,['대구','daegu','경북','gyeongbuk','강원','gangwon']],['Gwangju / Jeonnam / Jeonbuk',110000,['광주','gwangju','전남','jeonnam','전북','jeonbuk']],['Busan / Gyeongnam / Ulsan / Jeju',150000,['부산','busan','경남','gyeongnam','울산','ulsan','제주','jeju']],['Other / location not provided',80000,[]]];
const roundUp5=n=>Math.ceil(n/5)*5;
function transportKrw(region){const s=String(region||'').toLowerCase();return (regions.find(r=>r[2].some(k=>s.includes(k)))||regions[6])[1];}
function auctionFeeKrw(c,bidUsd,rate){const won=Math.round(Number(bidUsd)*rate);if(c.source==='Others'){const row=others.find(r=>won<= (r[1]??Infinity)&& (r[3]!=='Korean light car (경차)'||c.koreanLightCar===true));return row[2];}const h=houses.find(h=>h[0]===c.source);return h?Math.min(h[3]??Infinity,Math.max(h[2],won*h[1])):0;}
function costs(c,bid,rate){const auctionFeeUsd=roundUp5(auctionFeeKrw(c,bid,rate)/rate),transportUsd=roundUp5(transportKrw(c.region)/rate)+50,handlingUsd=250;return {auctionFeeUsd,transportUsd,handlingUsd,total:roundUp5(Number(bid)+auctionFeeUsd+transportUsd+handlingUsd)};}
window.BCSCosts={houses,others,regions,roundUp5,transportKrw,auctionFeeKrw,costs};
})();
