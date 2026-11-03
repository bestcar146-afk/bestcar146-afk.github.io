import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
Deno.serve(async(req)=>{
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const authorization=req.headers.get('Authorization')||'';
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
 const {data:{user},error}=await db.auth.getUser();if(error||!user)return reply({error:'Sign in required'},401);
 try{
  const {vehicleId}=await req.json();if(typeof vehicleId!=='string'||!/^[-A-Za-z0-9_]{1,120}$/.test(vehicleId))return reply({error:'Invalid vehicle'},400);
  const {data:row,error:e}=await db.from('saved_vehicles').select('summary,snapshot').eq('user_id',user.id).eq('vehicle_id',vehicleId).single();if(e||!row)return reply({error:'Save the vehicle first'},404);
  if(row.snapshot.archivedPreviews?.length)return reply({archived:row.snapshot.archivedPreviews.length});
  const images=(row.snapshot.images||[]).slice(0,4),paths:string[]=[];
  for(let i=0;i<images.length;i++){
   try{
    const url=new URL(images[i]);if(url.protocol!=='https:'||url.port||url.username||url.password||!['image.kolonautointernational.com','image-resize.kolonautointernational.com','www.autobellglobal.com','bestcar146-afk.github.io'].includes(url.hostname))continue;
    if(url.hostname==='image.kolonautointernational.com')url.hostname='image-resize.kolonautointernational.com';
    const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000)});if(!response.ok)continue;
    const type=(response.headers.get('content-type')||'').split(';')[0];if(!['image/jpeg','image/png','image/webp'].includes(type))continue;
    if(Number(response.headers.get('content-length'))>2097152)continue;
    const reader=response.body!.getReader(),chunks:Uint8Array[]=[];let total=0;
    for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>2097152){await reader.cancel();throw Error('Image too large');}chunks.push(value);}
    const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    const path=`${user.id}/${vehicleId}/${i}.${type==='image/png'?'png':type==='image/webp'?'webp':'jpg'}`;
    const {error:upload}=await db.storage.from('saved-vehicle-previews').upload(path,bytes,{contentType:type,upsert:true});if(!upload)paths.push(path);
   }catch{/* Keep the details even if an auction photo is unavailable. */}
  }
  const {error:update}=await db.from('saved_vehicles').update({summary:{...row.summary,archivedPreview:paths[0]||null},snapshot:{...row.snapshot,archivedPreviews:paths}}).eq('user_id',user.id).eq('vehicle_id',vehicleId);if(update)throw update;
  return reply({archived:paths.length});
 }catch{return reply({error:'Photo archive unavailable. Vehicle details remain saved.'},500);}
});
