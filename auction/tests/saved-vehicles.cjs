const fs=require('node:fs'),vm=require('node:vm'),a=require('node:assert/strict');
(async()=>{
 const records=new Map();let fetches=0,archives=0;
 const button={disabled:false,textContent:'',nextElementSibling:null,after(note){this.nextElementSibling=note}};
 const db={from(){let id;return {select(){return this},eq(k,v){if(k==='vehicle_id')id=v;return this},async maybeSingle(){return {data:records.has(id)?{vehicle_id:id}:null}},async insert(row){records.set(row.vehicle_id,JSON.parse(JSON.stringify(row)));return {error:null}}}},functions:{async invoke(){archives++;return {data:{archived:4}}}}};
 const ctx={db,currentUser:async()=>({id:'owner'}),location:{origin:'https://bestcar146-afk.github.io'},URL,window:{},document:{createElement(){return {dataset:{},setAttribute(){},matches(){return true}}}},fetch:async()=>{fetches++;return {ok:true,json:async()=>({id:'K1',overview:{engine:'1998 cc'},inspection:{grade:'A'},images:['https://example.com/photo.jpg']})}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('auction/src/saved.js','utf8').replace(/^import .*\n/,'').replaceAll('export ',''),ctx);
 await ctx.saveVehicle({id:'K1',year:2026,make:'KIA',model:'K5',source:'Kolon Auto Auction',start:12345,close:'2027-01-01',detailUrl:'/details.json'},button);
 a.equal(records.get('K1').snapshot.overview.engine,'1998 cc');a.equal(records.get('K1').snapshot.detailUrl,undefined);a.equal(records.get('K1').summary.price,12345);a.equal(button.textContent,'♥ Saved');a.equal(archives,1);
 ctx.fetch=async()=>{throw Error('Source has disappeared')};await ctx.saveVehicle({id:'K1'},button);a.equal(fetches,1);a.equal(records.get('K1').snapshot.inspection.grade,'A');a.equal(archives,1);
 let listing={window:{}};vm.runInNewContext(fs.readFileSync('auction/listing.js','utf8'),listing);a.equal(listing.window.BCSListing.isOpen({close:'2000-01-01'}),false);a.equal(listing.window.BCSListing.isOpen({close:'2099-01-01',bidStatus:'open'}),true);
 console.log('PASS: independent full snapshot, preserved price/specs/inspection, repeat save avoids downloads, snapshot survives unavailable source, closed auctions excluded.');
})();
