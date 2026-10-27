(()=>{
let rate=1343.36;
const usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
function render(){const C=window.BCSCosts,fx='1 USD = ₩'+rate.toLocaleString('en-US',{maximumFractionDigits:2});
const table=(headers,rows)=>'<div class="table-wrap"><table><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody><tfoot><tr><td colspan="'+headers.length+'" class="rate">'+fx+'</td></tr></tfoot></table></div>';
document.getElementById('auctionFees').innerHTML=C.houses.map(h=>'<h3>'+h[0]+'</h3>'+table(['Vehicle price','Calculation','Fee (USD)'],[['All prices',(h[1]*100).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'% of vehicle price','Minimum '+usd(C.roundUp5(h[2]/rate))+(h[3]?' · Maximum '+usd(C.roundUp5(h[3]/rate)):' · No maximum')]])).join('')+'<h3>Others</h3>'+table(['Vehicle price (USD equivalent)','Vehicle type','Standard fee (USD, VAT included)'],C.others.map(r=>[(r[0]?'Over '+usd(r[0]/rate):'Up to')+(r[1]?(r[0]?' – ':' ')+usd(r[1]/rate):''),r[3],usd(C.roundUp5(r[2]/rate))]));
document.getElementById('transportFees').innerHTML=table(['Vehicle region','Transport (USD)'],C.regions.map(r=>[r[0],usd(C.roundUp5(r[1]/rate)+50)]));document.querySelectorAll('.rate').forEach(e=>e.textContent=fx);
}
async function refresh(){try{const r=await fetch('../fx.json',{cache:'no-store'});if(!r.ok)throw Error();const x=await r.json();if(x.bank==='Hana Bank'&&x.rate_type==='TT_BUY'&&Number(x.krw_per_usd)>0)rate=Number(x.krw_per_usd);}catch(e){}render();}render();refresh();setInterval(refresh,300000);
})();
