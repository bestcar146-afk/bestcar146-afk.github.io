(() => {
  const DEALER_FEE_KRW = 500000;
  const HANDLING_USD = 250;
  let FX_KRW_PER_USD = 1343.36;
  let FX_AS_OF = '2026-10-05T12:45:19Z';
  let FX_SOURCE = 'Google Finance';

  const T3 = {
    en: {
      listed_price:'Korean listed price', vehicle_cost:'Vehicle cost', dealer_fee:'Encar dealer fee',
      transport_est:'Estimated transport', documents_free:'Documents', handling_fee:'Handling',
      total_est:'Estimated total', request:'REQUEST PURCHASE', details:'Vehicle details',
      inspection:'Inspection report', insurance:'Insurance history', condition:'Vehicle condition',
      listed_sync:'Listed at last sync', fx_note:'Google Finance reference rate',
      transport_basis:'Transport estimated from seller region using the upper end of the reference range.',
      free:'Free', not_provided:'Not provided', yes:'Yes', no:'No',
      accident:'Accident flagged by inspection', simple_repair:'Simple repairs reported',
      claims:'Recorded claims / accidents', my_claims:'Claims involving this car', my_payout:'Payouts for this car',
      other_claims:'Claims involving other vehicles', other_payout:'Payouts for damage to others',
      owner_changes:'Ownership changes', total_loss:'Total-loss records', flood_total:'Flood total-loss records',
      flood_partial:'Partial flood-loss records', theft:'Theft records', seats:'Seats', power:'Power',
      registration:'Registration month', source:'Source', close_request:'Close request form',
      name:'Name / Company', country:'Country', whatsapp:'WhatsApp number', notes:'Notes (optional)',
      save_draft:'Save request draft', saved:'Draft saved on this device only — not yet sent to BEST CAR STAR.',
      data_caution:'Provider records. Missing information does not mean accident-free. Availability and condition must be confirmed before purchase.'
    },
    fr: {
      listed_price:'Prix affiché en Corée', vehicle_cost:'Coût du véhicule', dealer_fee:'Frais concessionnaire Encar',
      transport_est:'Transport estimé', documents_free:'Documents', handling_fee:'Frais de service',
      total_est:'Total estimé', request:"DEMANDER L’ACHAT", details:'Détails du véhicule',
      inspection:"Rapport d’inspection", insurance:"Historique d’assurance", condition:'État du véhicule',
      listed_sync:'Annonce lors de la dernière synchronisation', fx_note:'Taux de référence Google Finance',
      transport_basis:'Transport estimé selon la région du vendeur en utilisant la limite haute de la fourchette de référence.',
      free:'Gratuit', not_provided:'Non fourni', yes:'Oui', no:'Non',
      accident:"Accident signalé par l’inspection", simple_repair:'Réparations simples signalées',
      claims:'Sinistres / accidents enregistrés', my_claims:'Sinistres sur ce véhicule', my_payout:'Indemnités pour ce véhicule',
      other_claims:'Sinistres causés à autrui', other_payout:'Indemnités pour dommages à autrui',
      owner_changes:'Changements de propriétaire', total_loss:'Cas de perte totale', flood_total:'Pertes totales par inondation',
      flood_partial:'Dommages partiels par inondation', theft:'Cas de vol', seats:'Places', power:'Puissance',
      registration:'Mois de mise en circulation', source:'Source', close_request:'Fermer le formulaire',
      name:'Nom / Société', country:'Pays', whatsapp:'Numéro WhatsApp', notes:'Notes (facultatif)',
      save_draft:'Enregistrer le brouillon', saved:"Brouillon enregistré sur cet appareil uniquement — pas encore envoyé à BEST CAR STAR.",
      data_caution:"Données du fournisseur. Une information non fournie ne signifie pas absence d’accident. La disponibilité et l’état doivent être confirmés avant achat."
    }
  };
  const tt = k => (T3[lang] && T3[lang][k]) || T3.en[k] || k;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const usd = n => '$' + Math.round(Number(n)||0).toLocaleString('en-US');
  const usd2 = n => '$' + (Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0});

  const style = document.createElement('style');
  style.textContent = `
    .dialog{width:min(1240px,calc(100% - 24px));height:min(900px,calc(100vh - 30px));max-height:calc(100vh - 30px);overflow:hidden}
    .s3-detail{display:grid;grid-template-columns:minmax(0,3fr) minmax(360px,2fr);height:100%;clear:both}
    .s3-gallery-pane{padding:20px;background:#eef4f8;overflow-y:auto;min-width:0}
    .s3-main-photo{position:relative;aspect-ratio:4/3;width:100%;background:#fff;border-radius:16px;overflow:hidden;display:grid;place-items:center}
    .s3-main-photo img{width:100%;height:100%;object-fit:contain;display:block}
    .s3-photo-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border:0;border-radius:50%;background:rgba(16,36,59,.86);color:#fff;font-size:24px;display:grid;place-items:center}
    .s3-photo-nav.prev{left:14px}.s3-photo-nav.next{right:14px}
    .s3-photo-count{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(16,36,59,.9);color:#fff;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800}
    .s3-thumbs{display:flex;gap:9px;overflow-x:auto;padding:12px 2px 4px}
    .s3-thumb{width:92px;aspect-ratio:4/3;flex:0 0 auto;border:2px solid transparent;border-radius:10px;padding:0;overflow:hidden;background:white}
    .s3-thumb.active{border-color:#10243b}.s3-thumb img{width:100%;height:100%;object-fit:cover}
    .s3-info-pane{overflow-y:auto;padding:30px 30px 50px;background:#fff}
    .s3-kicker{font-size:11px;font-weight:900;letter-spacing:2px;color:#5488a6}
    .s3-title{font-size:31px;line-height:1.08;margin:8px 0 5px}.s3-trim{color:#657483;margin-bottom:13px}
    .s3-key{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 14px}.s3-pill{background:#f1f5f8;padding:7px 9px;border-radius:999px;font-size:12px;font-weight:700}
    .s3-status{display:inline-flex;align-items:center;gap:7px;color:#137951;font-size:12px;font-weight:800}.s3-status:before{content:'';width:8px;height:8px;border-radius:50%;background:#1ca36f}
    .s3-price-label{color:#71808f;font-size:12px;margin-top:16px}.s3-price{font-size:34px;font-weight:950;margin:2px 0}.s3-listed{color:#7b8793;font-size:12px}
    .s3-cost{border:1px solid #dce4eb;border-radius:16px;padding:15px;margin:18px 0 12px;background:#fbfcfd}
    .s3-cost-head{font-weight:900;margin-bottom:7px}.s3-cost-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;color:#536273;font-size:13px}.s3-cost-row b{color:#10243b;text-align:right}
    .s3-cost-total{border-top:1px dashed #ccd6de;margin-top:5px;padding-top:12px;display:flex;justify-content:space-between;gap:12px;font-size:20px;font-weight:950}
    .s3-fx{font-size:11px;color:#7b8794;line-height:1.45;margin-top:8px}.s3-request-btn{width:100%;font-size:15px;margin:4px 0 16px}
    .s3-request-wrap{display:none;border:1px solid #dce4eb;border-radius:15px;padding:14px;margin-bottom:16px}.s3-request-wrap.open{display:block}
    .s3-request-wrap input,.s3-request-wrap textarea{width:100%;border:1px solid #d7dfe6;border-radius:10px;padding:11px;margin:5px 0}.s3-request-wrap textarea{min-height:76px}
    .s3-accordion{border-top:1px solid #e2e8ee}.s3-accordion details{border-bottom:1px solid #e2e8ee}.s3-accordion summary{list-style:none;cursor:pointer;padding:15px 2px;font-weight:900;display:flex;justify-content:space-between}.s3-accordion summary::-webkit-details-marker{display:none}.s3-accordion summary:after{content:'+';font-size:21px;color:#637484}.s3-accordion details[open] summary:after{content:'−'}
    .s3-section-body{padding:0 2px 16px}.s3-info-row{display:flex;justify-content:space-between;gap:14px;padding:7px 0;font-size:13px;color:#617080}.s3-info-row b{color:#10243b;text-align:right;overflow-wrap:anywhere}
    .s3-note{font-size:11px;color:#7b8794;line-height:1.5;margin-top:9px}
    @media(max-width:850px){
      .dialog{height:auto;max-height:calc(100vh - 20px);overflow:auto;margin:10px auto}
      .s3-detail{grid-template-columns:1fr;height:auto}
      .s3-gallery-pane,.s3-info-pane{overflow:visible}
      .s3-gallery-pane{padding:12px}.s3-info-pane{padding:20px}
      .s3-title{font-size:27px}
    }
  `;
  document.head.appendChild(style);

  const makeMap = {
    'ChevroletGMDaewoo':'Chevrolet','Chevrolet GM Daewoo':'Chevrolet','GM Daewoo':'Chevrolet','쉐보레(GM대우)':'Chevrolet','GM대우':'Chevrolet',
    'KG_Mobility_Ssangyong':'KGM','KG Mobility Ssangyong':'KGM','KG모빌리티(쌍용)':'KGM','SsangYong':'KGM','쌍용':'KGM',
    'MercedesBenz':'Mercedes-Benz','Mercedes Benz':'Mercedes-Benz','LandRover':'Land Rover','VolksWagen':'Volkswagen'
  };
  function normMake(v){const s=String(v||'').replace(/_/g,' ').replace(/\s+/g,' ').trim();return makeMap[v]||makeMap[s]||s;}
  function replaceKorean(s){
    let out=String(s||'');
    const maps = lang==='fr' ? [
      ['프리미엄','Premium'],['익스클루시브','Exclusive'],['노블레스','Noblesse'],['시그니처','Signature'],['럭셔리','Luxury'],['모던','Modern'],['스마트','Smart'],['디럭스','Deluxe'],['스페셜','Special'],
      ['하이브리드','Hybride'],['가솔린','Essence'],['휘발유','Essence'],['디젤','Diesel'],['전기','Électrique'],['터보','Turbo'],['자동','Automatique'],['오토','Automatique'],['수동','Manuelle'],
      ['사륜','4WD'],['4륜','4WD'],['2륜','2WD'],['전륜','FWD'],['후륜','RWD'],
      ['검정색','Noir'],['흰색','Blanc'],['진주색','Blanc nacré'],['은색','Argent'],['은회색','Gris argent'],['회색','Gris'],['쥐색','Gris foncé'],['청색','Bleu'],['갈대색','Beige']
    ] : [
      ['프리미엄','Premium'],['익스클루시브','Exclusive'],['노블레스','Noblesse'],['시그니처','Signature'],['럭셔리','Luxury'],['모던','Modern'],['스마트','Smart'],['디럭스','Deluxe'],['스페셜','Special'],
      ['하이브리드','Hybrid'],['가솔린','Gasoline'],['휘발유','Gasoline'],['디젤','Diesel'],['전기','Electric'],['터보','Turbo'],['자동','Automatic'],['오토','Automatic'],['수동','Manual'],
      ['사륜','4WD'],['4륜','4WD'],['2륜','2WD'],['전륜','FWD'],['후륜','RWD'],
      ['검정색','Black'],['흰색','White'],['진주색','Pearl white'],['은색','Silver'],['은회색','Silver gray'],['회색','Gray'],['쥐색','Dark gray'],['청색','Blue'],['갈대색','Beige']
    ];
    for(const [a,b] of maps) out=out.split(a).join(b);
    return out.replace(/\s+/g,' ').trim();
  }
  function normModel(v, make){
    let s=replaceKorean(String(v||'').replace(/_/g,' '));
    const prefixes=['ChevroletGMDaewoo','Chevrolet GM Daewoo','GM Daewoo','Chevrolet','KGM','SsangYong',make];
    for(const p of prefixes){if(p && s.toLowerCase().startsWith(String(p).toLowerCase()))s=s.slice(String(p).length).trim();}
    return s || 'Vehicle';
  }
  function normVehicle(c){
    const make=normMake(c.make);
    return {...c,make,model:normModel(c.model,make),trim:replaceKorean(c.trim),fuel:replaceKorean(c.fuel),transmission:replaceKorean(c.transmission),drive:replaceKorean(c.drive),color:replaceKorean(c.color)};
  }

  function transportFor(location){
    const raw=String(location||'');
    const s=raw.toLowerCase();
    const has=(...xs)=>xs.some(x=>s.includes(x.toLowerCase())||raw.includes(x));
    if(has('서울','seoul')) return {krw:20000,tier:'0–20 km'};
    if(has('인천','incheon','경기','gyeonggi')) return {krw:30000,tier:'20–50 km'};
    if(has('대전','daejeon','세종','sejong','충남','chungnam','충북','chungbuk')) return {krw:50000,tier:'50–100 km'};
    if(has('대구','daegu','경북','gyeongbuk','강원','gangwon')) return {krw:80000,tier:'100–200 km'};
    if(has('광주','gwangju','전남','jeonnam','전북','jeonbuk')) return {krw:110000,tier:'200–300 km'};
    if(has('부산','busan','경남','gyeongnam','울산','ulsan','제주','jeju')) return {krw:150000,tier:'300+ km'};
    return {krw:80000,tier:'Estimated'};
  }
  function cost(c){
    const trn=transportFor(c.location);
    const vehicleKrw=(Number(c.price)||0)+DEALER_FEE_KRW;
    const vehicleUsd=vehicleKrw/FX_KRW_PER_USD;
    const transportUsd=trn.krw/FX_KRW_PER_USD;
    return {vehicleKrw,vehicleUsd,transportKrw:trn.krw,transportUsd,tier:trn.tier,documentsUsd:0,handlingUsd:HANDLING_USD,totalUsd:vehicleUsd+transportUsd+HANDLING_USD};
  }
  function bool(v){return v===true?tt('yes'):v===false?tt('no'):tt('not_provided');}
  function val(v){return v===null||v===undefined||v===''?tt('not_provided'):String(v);}
  function row(label,value){return `<div class="s3-info-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;}

  const oldCard = window.carCard || carCard;
  carCard = function(raw){
    const c=normVehicle(raw), cb=cost(c);
    const img=(c.photos&&c.photos[0])?`<img src="${esc(c.photos[0])}" alt="${esc(c.year+' '+c.make+' '+c.model)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="photo-fallback" style="display:none">${t('photos_unavailable')}</div>`:`<div class="photo-fallback">${t('photos_unavailable')}</div>`;
    return `<article class="card"><div class="car-photo"><span class="source-pill">${esc(c.source||'Korean Marketplace')}</span>${img}<button type="button" class="photo-open" data-car="${esc(c.id)}" aria-label="${t('view_vehicle')}"></button></div><div class="card-body"><h3>${esc((c.year||'')+' '+c.make+' '+c.model)}</h3><div class="trim">${esc(c.trim||'')}</div><div class="spec-row"><span class="spec">${c.mileage==null?'—':Number(c.mileage).toLocaleString()+' km'}</span><span class="spec">${esc(c.fuel)}</span></div><div class="price-label">${tt('listed_price')}</div><div class="price">${krw(c.price)}</div><div class="estimate"><span>${tt('total_est')}</span><strong>${usd(cb.totalUsd)}</strong></div><button class="btn btn-primary" data-car="${esc(c.id)}">${t('view_vehicle')}</button></div></article>`;
  };

  openVehicle = function(id){
    let raw=inventory.find(x=>x.id===id); if(!raw)return;
    const d=raw.details||{}, sp=d.spec||{};
    raw={...raw,transmission:sp.transmission||raw.transmission,engine:sp.engine_cc?Number(sp.engine_cc).toLocaleString()+' cc':raw.engine,color:sp.color||raw.color,drive:sp.drive||raw.drive,photos:[...new Set([...(raw.photos||[]),...(d.photos||[])])]};
    const c=normVehicle(raw), cb=cost(c), photos=(c.photos||[]).filter(Boolean);
    const first=photos[0]||'';
    const keySpecs=[c.mileage==null?'—':Number(c.mileage).toLocaleString()+' km',c.fuel,c.transmission].filter(Boolean);
    const checked=d.checked_at?new Date(d.checked_at).toLocaleString(lang==='fr'?'fr-FR':'en-GB',{timeZone:'Asia/Seoul'}):'';
    const fxDate=FX_AS_OF?new Date(FX_AS_OF).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB',{timeZone:'Asia/Seoul'}):'';

    let detailsHtml='';
    detailsHtml+=row(t('mileage'),c.mileage==null?'—':Number(c.mileage).toLocaleString()+' km');
    detailsHtml+=row(t('fuel'),c.fuel||tt('not_provided'));
    detailsHtml+=row(t('transmission'),c.transmission||tt('not_provided'));
    detailsHtml+=row(t('drivetrain'),c.drive||tt('not_provided'));
    detailsHtml+=row(t('engine'),c.engine||tt('not_provided'));
    detailsHtml+=row(t('color'),c.color||tt('not_provided'));
    detailsHtml+=row(t('location'),replaceKorean(tr(c.location)));
    detailsHtml+=row(tt('seats'),sp.seats==null?tt('not_provided'):sp.seats);
    detailsHtml+=row(tt('power'),sp.power_ps?sp.power_ps+' PS':tt('not_provided'));
    if(sp.registration) detailsHtml+=row(tt('registration'),String(sp.registration).slice(0,4)+'-'+String(sp.registration).slice(4,6));

    const ins=d.inspection;
    let inspectionHtml=ins ? row(tt('accident'),bool(ins.accdient))+row(tt('simple_repair'),bool(ins.simpleRepair)) : row(tt('inspection'),tt('not_provided'));
    const rec=d.insurance;
    let insuranceHtml=rec ? [
      row(tt('claims'),val(rec.accidentCnt)),row(tt('my_claims'),val(rec.myAccidentCnt)),row(tt('my_payout'),rec.myAccidentCost==null?tt('not_provided'):krw(rec.myAccidentCost)),
      row(tt('other_claims'),val(rec.otherAccidentCnt)),row(tt('other_payout'),rec.otherAccidentCost==null?tt('not_provided'):krw(rec.otherAccidentCost)),
      row(tt('owner_changes'),val(rec.ownerChangeCnt)),row(tt('total_loss'),val(rec.totalLossCnt)),row(tt('flood_total'),val(rec.floodTotalLossCnt)),row(tt('flood_partial'),val(rec.floodPartLossCnt)),row(tt('theft'),val(rec.robberCnt))
    ].join('') : row(tt('insurance'),tt('not_provided'));
    if(d.kb_history){
      insuranceHtml += row(tt('total_loss'),bool(d.kb_history.totalLoss))+row(lang==='fr'?'Dommages par inondation':'Flood damage',bool(d.kb_history.floodDamage))+row(lang==='fr'?'Usage commercial':'Commercial use',bool(d.kb_history.commercialUse))+row(tt('owner_changes'),val(d.kb_history.ownershipChanges));
    }

    const thumbs=photos.map((u,i)=>`<button class="s3-thumb ${i===0?'active':''}" type="button" data-photo="${i}"><img src="${esc(u)}" alt=""></button>`).join('');
    $('#detailContent').innerHTML=`
      <div class="s3-detail">
        <section class="s3-gallery-pane">
          <div class="s3-main-photo">
            ${first?`<img id="s3MainImage" src="${esc(first)}" alt="${esc(c.year+' '+c.make+' '+c.model)}">`:`<div class="photo-fallback">${t('photos_unavailable')}</div>`}
            ${photos.length>1?'<button class="s3-photo-nav prev" type="button" aria-label="Previous">‹</button><button class="s3-photo-nav next" type="button" aria-label="Next">›</button>':''}
            <div class="s3-photo-count" id="s3PhotoCount">${photos.length?'1 / '+photos.length:'0 / 0'}</div>
          </div>
          <div class="s3-thumbs">${thumbs}</div>
        </section>
        <section class="s3-info-pane">
          <div class="s3-kicker">DIRECT PURCHASE · ${esc(c.id)}</div>
          <h2 class="s3-title">${esc((c.year||'')+' '+c.make+' '+c.model)}</h2>
          <div class="s3-trim">${esc(c.trim||'')}</div>
          <div class="s3-status">${tt('listed_sync')}</div>
          <div class="s3-key">${keySpecs.map(x=>`<span class="s3-pill">${esc(x)}</span>`).join('')}</div>

          <div class="s3-price-label">${tt('vehicle_cost')} · ${tt('dealer_fee')} included</div>
          <div class="s3-price">${usd(cb.vehicleUsd)}</div>
          <div class="s3-listed">${tt('listed_price')}: ${krw(c.price)} + ${krw(DEALER_FEE_KRW)} dealer fee</div>

          <div class="s3-cost">
            <div class="s3-cost-head">${t('purchase_cost')}</div>
            <div class="s3-cost-row"><span>${tt('vehicle_cost')}</span><b>${usd(cb.vehicleUsd)}</b></div>
            <div class="s3-cost-row"><span>${tt('transport_est')} <small>(${esc(cb.tier)})</small></span><b>${usd(cb.transportUsd)} <small>· ${krw(cb.transportKrw)}</small></b></div>
            <div class="s3-cost-row"><span>${tt('documents_free')}</span><b>${tt('free')}</b></div>
            <div class="s3-cost-row"><span>${tt('handling_fee')}</span><b>${usd(HANDLING_USD)}</b></div>
            <div class="s3-cost-total"><span>${tt('total_est')}</span><b>${usd(cb.totalUsd)}</b></div>
            <div class="s3-fx">${tt('fx_note')}: 1 USD = ₩${FX_KRW_PER_USD.toLocaleString('en-US',{maximumFractionDigits:2})}${fxDate?' · '+fxDate:''}. ${tt('transport_basis')}</div>
          </div>

          <button type="button" class="btn btn-primary s3-request-btn" id="s3RequestBtn">${tt('request')}</button>
          <div class="s3-request-wrap" id="s3RequestWrap">
            <input id="reqName" required placeholder="${tt('name')}">
            <input id="reqCountry" required placeholder="${tt('country')}">
            <input id="reqWhatsapp" required placeholder="${tt('whatsapp')}">
            <textarea id="reqNotes" placeholder="${tt('notes')}"></textarea>
            <button type="button" class="btn btn-primary" id="s3SaveDraft" style="width:100%;margin-top:6px">${tt('save_draft')}</button>
            <div class="request-success" id="requestSuccess">${tt('saved')}</div>
          </div>

          <div class="s3-accordion">
            <details open><summary>${tt('details')}</summary><div class="s3-section-body">${detailsHtml}</div></details>
            <details><summary>${tt('inspection')}</summary><div class="s3-section-body">${inspectionHtml}<div class="s3-note">${tt('data_caution')}</div></div></details>
            <details><summary>${tt('insurance')}</summary><div class="s3-section-body">${insuranceHtml}<div class="s3-note">${tt('data_caution')}</div></div></details>
          </div>
          <div class="s3-note">${tt('source')}: ${esc(c.source||'Korean Marketplace')}${checked?' · '+(lang==='fr'?'Détails vérifiés ':'Details checked ')+esc(checked)+' KST':''}</div>
        </section>
      </div>`;

    $('#vehicleModal').classList.add('open'); $('#vehicleModal').setAttribute('aria-hidden','false');
    let pi=0;
    function showPhoto(i){if(!photos.length)return;pi=(i+photos.length)%photos.length;const im=document.getElementById('s3MainImage');if(im)im.src=photos[pi];const count=document.getElementById('s3PhotoCount');if(count)count.textContent=(pi+1)+' / '+photos.length;document.querySelectorAll('.s3-thumb').forEach((b,j)=>b.classList.toggle('active',j===pi));}
    const prev=document.querySelector('.s3-photo-nav.prev'),next=document.querySelector('.s3-photo-nav.next');
    if(prev)prev.onclick=()=>showPhoto(pi-1); if(next)next.onclick=()=>showPhoto(pi+1);
    document.querySelectorAll('.s3-thumb').forEach(b=>b.onclick=()=>showPhoto(Number(b.dataset.photo)));
    const rb=document.getElementById('s3RequestBtn'),rw=document.getElementById('s3RequestWrap');
    rb.onclick=()=>{rw.classList.toggle('open');rb.textContent=rw.classList.contains('open')?tt('close_request'):tt('request');if(rw.classList.contains('open'))rw.scrollIntoView({behavior:'smooth',block:'nearest'});};
    document.getElementById('s3SaveDraft').onclick=()=>{const n=$('#reqName').value.trim(),co=$('#reqCountry').value.trim(),wa=$('#reqWhatsapp').value.trim();if(!n||!co||!wa){document.getElementById('requestSuccess').textContent=lang==='fr'?'Veuillez remplir le nom, le pays et WhatsApp.':'Please complete name, country and WhatsApp.';document.getElementById('requestSuccess').classList.add('show');return;}safeStore.set('bcsLastRequest',JSON.stringify({vehicleId:c.id,sourceId:c.sourceId,source:c.source,vehicle:(c.year||'')+' '+c.make+' '+c.model,listedPriceKrw:c.price,dealerFeeKrw:DEALER_FEE_KRW,fxKrwPerUsd:FX_KRW_PER_USD,transportKrw:cb.transportKrw,handlingUsd:HANDLING_USD,estimatedTotalUsd:Math.round(cb.totalUsd),name:n,country:co,whatsapp:wa,notes:$('#reqNotes').value}));document.getElementById('requestSuccess').textContent=tt('saved');document.getElementById('requestSuccess').classList.add('show');};
  };

  fetch('./fx.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(x=>{
    if(x && Number(x.krw_per_usd)>0){FX_KRW_PER_USD=Number(x.krw_per_usd);FX_AS_OF=x.as_of||FX_AS_OF;FX_SOURCE=x.source||FX_SOURCE;try{renderCars();}catch(e){}}
  }).catch(()=>{});

  const oldSet = setI18n;
  setI18n = function(){oldSet(); try{renderCars();}catch(e){}};
})();