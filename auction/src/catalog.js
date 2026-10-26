import {db,currentUser,saveBid,message,friendly,money} from './client.js';
let user=null;
const login=document.getElementById('clientLogin');
currentUser().then(u=>{user=u;login.textContent=u?'My account':'Client login';login.href=u?'/auction/account/':'/auction/login/';});
db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;login.textContent=user?'My account':'Client login';login.href=user?'/auction/account/':'/auction/login/';});
window.BCSAccounts={
 async submit(vehicle,amount,button,status){
 button.disabled=true;
 try{
 user=await currentUser();
 if(!user){sessionStorage.setItem('bcs-pending-vehicle',vehicle.id);sessionStorage.setItem('bcs-pending-amount',String(amount));location.assign('/auction/login/');return;}
 const saved=await saveBid(vehicle.id,amount);
 message(status,(saved.is_demo?'Demo bid saved':'Pre-bid saved')+': '+money(saved.maximum_bid_usd)+'. View or update it in My Bids.');
 sessionStorage.removeItem('bcs-pending-vehicle');sessionStorage.removeItem('bcs-pending-amount');
 }catch(e){message(status,friendly(e),true);}finally{button.disabled=false;status.classList.add('show');}
 },
 async vehicles(){const {data,error}=await db.from('vehicles').select('id,starting_bid_usd,bidding_closes_at,status,is_demo');if(error)throw error;return data;}
};
window.dispatchEvent(new Event('bcs-accounts-ready'));
