(() => {
  const API_BASE = './inventory.json';
  let demoMode = false;
  const PAGE_SIZE = 150;
  let liveLoading = false;
  let liveLoadedAt = null;

  Object.assign(TXT.en, {
    sample_note: 'Sales-driven Encar and KB ChaChaCha listings, refreshed every six hours. The selection prioritizes models and model years that BEST CAR STAR customers actually buy.',
    live_inventory: 'LIVE ENCAR INVENTORY',
    live_now: 'Live',
    loading_live: 'Loading marketplace listings…',
    live_error: 'Live inventory is temporarily unavailable.',
    retry: 'Retry',
    last_updated: 'Last updated',
    source: 'Source',
    photos_unavailable: 'Photo unavailable',
    live_test_note: 'Live test feed · availability must still be confirmed before purchase.'
  });
  Object.assign(TXT.fr, {
    sample_note: 'Annonces Encar et KB ChaChaCha sélectionnées selon les modèles et années réellement achetés par les clients BEST CAR STAR, puis actualisées toutes les six heures.',
    live_inventory: 'INVENTAIRE ENCAR EN DIRECT',
    live_now: 'En direct',
    loading_live: 'Chargement des annonces automobiles…',
    live_error: 'L’inventaire en direct est temporairement indisponible.',
    retry: 'Réessayer',
    last_updated: 'Dernière mise à jour',
    source: 'Source',
    photos_unavailable: 'Photo indisponible',
    live_test_note: 'Flux de test en direct · la disponibilité doit toujours être confirmée avant achat.'
  });

  Object.assign(TXT.en,{automatic:'Automatic',manual:'Manual',white:'White',black:'Black',gray:'Gray',silver:'Silver'});
  Object.assign(TXT.fr,{Gasoline:'Essence',Hybrid:'Hybride',Electric:'Électrique',LPG:'GPL',automatic:'Automatique',manual:'Manuelle',white:'Blanc',black:'Noir',gray:'Gris',silver:'Argent'});
  const regions={'서울':'Seoul','부산':'Busan','대구':'Daegu','인천':'Incheon','대전':'Daejeon','경기':'Gyeonggi','경남':'Gyeongnam','경북':'Gyeongbuk','충남':'Chungnam','충북':'Chungbuk','전북':'Jeonbuk','전남광주':'Jeonnam / Gwangju','강원':'Gangwon','제주':'Jeju','울산':'Ulsan','세종':'Sejong'};
  Object.assign(TXT.en,regions);Object.assign(TXT.fr,regions,{'서울':'Séoul'});
  Object.assign(TXT.en,{'수동':'Manual','자동':'Automatic','오토':'Automatic','갈대색':'Reed beige','흰색':'White','검정색':'Black','은색':'Silver','회색':'Gray','진주색':'Pearl white','청색':'Blue','쥐색':'Dark gray','검정투톤':'Black two-tone','은회색':'Silver gray'});
  Object.assign(TXT.fr,{'수동':'Manuelle','자동':'Automatique','오토':'Automatique','갈대색':'Beige roseau','흰색':'Blanc','검정색':'Noir','은색':'Argent','회색':'Gris','진주색':'Blanc nacré','청색':'Bleu','쥐색':'Gris foncé','검정투톤':'Noir bicolore','은회색':'Gris argent','drivetrain':'Roues motrices'});
  const style = document.createElement('style');
  style.textContent = `
    .car-photo{aspect-ratio:4/3;flex:none}
    .car-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
    .car-photo .source-pill{z-index:2;pointer-events:none}
    .photo-open{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;border-radius:0}
    .photo-open:focus-visible{outline:3px solid #6ba8c9;outline-offset:-4px}
    .card h3{font-size:19px;margin-bottom:12px}
    .card .spec-row{margin-bottom:12px}
    .card .price{margin-bottom:0}

    .photo-fallback{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#dfeaf1,#f7fafc);color:#778492;font-weight:800}
    .live-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:12px;color:#697787}
    .live-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#e8f7f1;color:#137951;font-weight:900}
    .live-chip:before{content:'';width:7px;height:7px;border-radius:50%;background:#1ca36f}
    .loading-box{grid-column:1/-1;background:#fff;border:1px solid #e2e8ee;border-radius:18px;padding:42px;text-align:center;color:#657483}
    .spinner{width:28px;height:28px;border:3px solid #dce6ed;border-top-color:#10243b;border-radius:50%;margin:0 auto 14px;animation:bcsSpin .8s linear infinite}
    @keyframes bcsSpin{to{transform:rotate(360deg)}}
    .history-box{border-top:1px solid #e2e8ee;margin-top:20px;padding-top:6px}.history-box h3{font-size:18px;margin:18px 0 8px}.history-box .cost-row{font-size:13px}.history-box b{text-align:right}.detail-grid{clear:both}.close{position:absolute;right:8px;top:8px;float:none}.detail-spec b{overflow-wrap:anywhere}
    .gallery{background:#eef4f8;min-height:420px;position:relative;display:grid;place-items:center;overflow:hidden}
    .gallery img{width:100%;height:100%;max-height:560px;object-fit:contain;background:#eef4f8}
    .gallery-controls{position:absolute;bottom:55px;display:flex;align-items:center;gap:14px;background:white;padding:8px;border-radius:12px}.gallery-controls button{border:1px solid #ccd6de;background:white;padding:10px 18px;border-radius:8px}
    .gallery-count{position:absolute;left:14px;bottom:14px;background:rgba(16,36,59,.88);color:#fff;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800}
    .source-row{display:flex;gap:8px;align-items:center;margin:8px 0 16px;color:#657483;font-size:12px}
    .source-row b{color:#10243b}
    @media(max-width:900px){.gallery{min-height:280px}}
  `;
  document.head.appendChild(style);

  function pick(obj, keys, fallback='') {
    for (const key of keys) {
      const parts = key.split('.');
      let v = obj;
      for (const p of parts) v = v && v[p];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return fallback;
  }
  function num(v) {
    if (typeof v === 'number') return v;
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^0-9.]/g,''));
    return Number.isFinite(n) ? n : 0;
  }
  function arr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
  function cleanImage(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.url || v.src || v.imageUrl || v.image_url || '';
  }
  function normalizePrice(raw) {
    let p = num(raw);
    if (p > 0 && p < 1000000) p *= 1;
    return Math.round(p);
  }
  function titleFuel(v) {
    const s = String(v || '').toLowerCase();
    if (s.includes('diesel') || s.includes('경유')) return 'Diesel';
    if (s.includes('hybrid') || s.includes('하이브리드') || s.includes('가솔린+전기')) return 'Hybrid';
    if (s.includes('electric') || s.includes('전기')) return 'Electric';
    if (s.includes('lpg')) return 'LPG';
    if (s.includes('gasoline') || s.includes('petrol') || s.includes('휘발유') || s.includes('가솔린')) return 'Gasoline';
    return v || '—';
  }
  function madagascarPreferenceScore(x){
    const supplied=num(pick(x,['preference_2026','preferenceScore'],0));
    if(supplied>0) return supplied;
    const s=[pick(x,['manufacturer','Manufacturer','make','Make','brand','maker'],''),
             pick(x,['model','Model','modelName','model_name'],''),
             pick(x,['trim','badge','badgeDetail','badge_detail','grade','title','name'],'')]
             .join(' ').toLowerCase().replace(/\s+/g,' ');
    const rules=[
      [48,['all new sorento']],[49,['new sorento r']],[31,['sorento r']],
      [27,['santa fe dm']],[27,['santafe dm']],[23,['sportage r']],
      [18,['grand starex']],[17,['all new carnival']],[14,['audi','q5']],
      [13,['all new tucson']],[12,['maxcruz']],[11,['mighty']],
      [10,['tiguan']],[10,['malibu']],[10,['rexton w']],[9,['bongo']],
      [8,['qm3']],[8,['audi','q7']],[8,['captiva']],[8,['i30']],
      [7,['bmw','x3']],[7,['tucson']],[7,['morning']],[7,['picanto']],
      [6,['santa fe']],[6,['santafe']],[6,['pride']],[5,['cruze']],
      [5,['wrangler','rubicon']],[4,['bmw','x5']],[4,['accent']],
      [4,['starex']],[4,['sportage']],[3,['orlando']],[3,['mohave']],
      [3,['kia','soul']],[3,['countryman','all4']],[3,['countryman']]
    ];
    for(const [score,tokens] of rules) if(tokens.every(t=>s.includes(t))) return score;
    return 0;
  }

  function normalizeMakeName(v){
    let s=String(v||'').trim();
    s=s.replace(/[_-]+/g,' ');
    s=s.replace(/([a-z])([A-Z])/g,'$1 $2');
    s=s.replace(/([A-Z]{2,})([A-Z][a-z])/g,'$1 $2');
    s=s.replace(/\s+/g,' ').trim();
    s=s.replace(/^Chevrolet\s*GM\s*Daewoo$/i,'Chevrolet GM Daewoo');
    s=s.replace(/^Chevrolet\s*DM\s*Daewoo$/i,'Chevrolet DM Daewoo');
    s=s.replace(/^Renault\s*Korea\s*Samsung$/i,'Renault Korea Samsung');
    s=s.replace(/^KG\s*Mobility\s*Ssangyong$/i,'KG Mobility Ssangyong');
    s=s.replace(/^Mercedes\s*Benz$/i,'Mercedes Benz');
    return s;
  }
  function simpleModelName(v){
    const raw=String(v||'').trim();
    const s=raw.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
    if(s.includes('sorento')) return 'Sorento';
    if(s.includes('sportage')) return 'Sportage';
    if(s.includes('santa fe')||s.includes('santafe')) return 'Santa Fe';
    if(s.includes('tucson')) return 'Tucson';
    if(s.includes('carnival')) return 'Carnival';
    if(s.includes('malibu')) return 'Malibu';
    if(s.includes('cruze')) return 'Cruze';
    if(s.includes('orlando')) return 'Orlando';
    if(s.includes('captiva')) return 'Captiva';
    if(s.includes('morning')||s.includes('picanto')) return 'Morning';
    if(s.includes('pride')) return 'Pride';
    if(s.includes('bongo')) return 'Bongo';
    if(s.includes('mohave')) return 'Mohave';
    if(s.includes('rexton')) return 'Rexton';
    if(s.includes('countryman')) return 'Countryman';
    if(s.includes('grand starex')) return 'Grand Starex';
    if(/^starex\b/i.test(raw)) return 'Starex';
    return raw
      .replace(/\([^)]*\)/g,'')
      .replace(/\b(?:All New|The New|New)\b/gi,'')
      .replace(/\b\d+\s*Gen(?:eration)?\b/gi,'')
      .replace(/\s+/g,' ')
      .trim() || raw;
  }
  function isVehicleImageUrl(u){
    const s=String(u||'').trim().toLowerCase();
    if(!/^https:\/\//.test(s)) return false;
    if(/img\.kbchachacha\.com\//.test(s)) return true;
    if(/(?:ci|fem|carpicture)[^/]*\.encar\.com\//.test(s)) return true;
    if(/encar\.com\/.*\.(?:jpe?g|png|webp)(?:\?|$)/.test(s)) return true;
    return /\.(?:jpe?g|png|webp)(?:\?|$)/.test(s) && !/\/car\/detail\./.test(s);
  }

  function normalizeCar(x) {
    const sourceId = String(pick(x,['id','Id','carId','car_id','vehicleId','vehicle_id','carid'],''));
    const rawPhotos = pick(x,['photos','images','photoUrls','imageUrls'],[]);
    let photos = arr(rawPhotos).map(cleanImage).filter(isVehicleImageUrl);
    if(!photos.length){
      photos = arr(pick(x,['details.photos'],[])).map(cleanImage).filter(isVehicleImageUrl);
    }
    const single = cleanImage(pick(x,['thumbnail','thumbnailUrl','thumbnail_url','image','imageUrl','image_url','photo','photoUrl','photo_url'],''));
    if (single && isVehicleImageUrl(single) && !photos.includes(single)) photos.unshift(single);
    // Encar's 001 preview may be a collage; lead with a supplied individual photo.
    if (String(pick(x,['source'],'Encar')) === 'Encar') {
      const main = photos.find(u => /_003\.[a-z]+(?:\?|$)/i.test(u)) || photos.find(u => !/_001\.[a-z]+(?:\?|$)/i.test(u));
      if (main) photos = [main, ...photos.filter(u => u !== main)];
    }
    const yearRaw = pick(x,['year','modelYear','model_year','Year','formYear','registrationYear'],'');
    const year = num(String(yearRaw).slice(0,4)) || num(yearRaw);
    const price = normalizePrice(pick(x,['priceWon','price_won','priceKRW','price_krw','price','Price','advertisement.price'],''));
    return {
      id: 'BCS-' + sourceId,
      sourceId,
      details:x.details || null,
      source:String(pick(x,['source'],'Encar')),
      make:normalizeMakeName(pick(x,['manufacturer','Manufacturer','make','Make','brand','maker'],'Encar')),
      model:String(pick(x,['model','Model','modelName','model_name'],'Vehicle')),
      simpleModel:simpleModelName(pick(x,['model','Model','modelName','model_name'],'Vehicle')),
      trim:String(pick(x,['trim','badge','badgeDetail','badge_detail','grade','title','name'],'')).trim(),
      year,
      mileage:pick(x,['mileage_km','mileage'],null) === null ? null : num(pick(x,['mileage_km','mileage'],0)),
      fuel:titleFuel(pick(x,['fuel','fuelType','fuel_type','FuelType'],'—')),
      drive:String(pick(x,['drivetrain','drive','driveType','drive_type'],'—')),
      transmission:String(pick(x,['details.spec.transmission','transmission','transmissionType','transmission_type'],'—')),
      engine:String(pick(x,['engine','engineSize','engine_size','displacement','engineCc','engine_cc'],'—')),
      color:String(pick(x,['color','Color','exteriorColor','exterior_color'],'—')),
      location:String(pick(x,['region','location','city','dealer.region','officeCity'],'Korea')),
      price,
      photos,
      listingUrl:String(pick(x,['encar_url','url','listingUrl','listing_url','detailUrl','detail_url'],''))
      ,preferenceScore:madagascarPreferenceScore(x)
    };
  }
  function extractCars(json) {
    const possible = [
      json && json.cars, json && json.items, json && json.results, json && json.vehicles,
      json && json.data && json.data.cars, json && json.data && json.data.items,
      json && json.data && json.data.results, json && json.data
    ];
    for (const p of possible) if (Array.isArray(p)) return p;
    return Array.isArray(json) ? json : [];
  }
  function imageMarkup(c) {
    return c.photos && c.photos[0]
      ? `<img src="${c.photos[0]}" alt="${c.year} ${c.make} ${c.model}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="photo-fallback" style="display:none">${t('photos_unavailable')}</div>`
      : `<div class="photo-fallback">${t('photos_unavailable')}</div>`;
  }

  function displayCar(c){return Object.fromEntries(Object.entries(c).map(([k,v])=>[k,typeof v==='string'?escapeHTML(v):k==='photos'?v.map(u=>/^https:\/\//.test(u)?escapeHTML(u):'').filter(Boolean):v]));}
  carCard = function(c) {
    c=displayCar(c);
    return `<article class="card"><div class="car-photo"><span class="source-pill">${demoMode?'Demo':c.source}</span>${imageMarkup(c)}<button type="button" class="photo-open" data-car="${c.id}" aria-label="${t('view_vehicle')} — ${c.make} ${c.model}"></button></div><div class="card-body"><h3>${c.year || ''} ${c.make} ${c.model}</h3><div class="spec-row"><span class="spec">${c.mileage == null ? '—' : c.mileage.toLocaleString()+' km'}</span><span class="spec">${tr(c.fuel)}</span></div><div class="price-label">${t('vehicle_price')}</div><div class="price">${krw(c.price)}</div><button class="btn btn-primary" data-car="${c.id}">${t('view_vehicle')}</button></div></article>`;

  };

  openVehicle = function(id) {
    let c=inventory.find(x=>x.id===id); if(!c)return;
    const d=c.details, sp=d?.spec || {};
    c={...c, transmission:sp.transmission || c.transmission,engine:sp.engine_cc ? Number(sp.engine_cc).toLocaleString()+' cc' : c.engine,color:sp.color || c.color,drive:sp.drive || c.drive,
       photos:[...new Set([...(c.photos || []),...(d?.photos || [])])]};
    c=displayCar(c);
    const missing=lang==='fr'?'Non fourni':'Not provided';
    for(const k of ['transmission','engine','color','drive'])if(!c[k]||c[k]==='—')c[k]=missing;
    const img = c.photos && c.photos[0]
      ? `<img src="${c.photos[0]}" alt="${c.year} ${c.make} ${c.model}" onerror="this.style.display='none'">`
      : `<div class="photo-fallback">${t('photos_unavailable')}</div>`;
    $('#detailContent').innerHTML=`<div class="detail-grid"><div class="gallery">${img}<div class="gallery-count">${c.source} · ${c.photos.length || 0} photo(s)</div></div><div class="detail-side"><div class="eyebrow">DIRECT PURCHASE · ${c.id}</div><h2>${c.year || ''} ${c.make} ${c.model}</h2><div class="detail-trim">${c.trim || ''}</div><div class="source-row"><span>${t('source')}:</span><b>${c.source}</b><span>·</span><span>${demoMode ? (lang==='fr'?'Démonstration':'Demo') : (lang==='fr'?'Annonce lors de la synchronisation':'Listed at last sync')}</span></div><div class="detail-specs"><div class="detail-spec"><span>${t('mileage')}</span><b>${c.mileage == null ? '—' : c.mileage.toLocaleString()+' km'}</b></div><div class="detail-spec"><span>${t('fuel')}</span><b>${tr(c.fuel)}</b></div><div class="detail-spec"><span>${t('transmission')}</span><b>${tr(c.transmission)}</b></div><div class="detail-spec"><span>${t('drivetrain')}</span><b>${c.drive}</b></div><div class="detail-spec"><span>${t('engine')}</span><b>${c.engine}</b></div><div class="detail-spec"><span>${t('color')}</span><b>${escapeHTML(tr(c.color))}</b></div><div class="detail-spec"><span>${t('location')}</span><b>${escapeHTML(tr(c.location))}</b></div><div class="detail-spec"><span>${t('status')}</span><b>${demoMode ? (lang==='fr'?'Démonstration':'Demo') : (lang==='fr'?'Annonce lors de la synchronisation':'Listed at last sync')}</b></div></div><div class="cost-box"><b>${t('purchase_cost')}</b><div class="cost-row"><span>${t('vehicle_price')}</span><b>${krw(c.price)}</b></div><div class="cost-row"><span>${t('transport')}</span><b>${krw(fees.transport)}</b></div><div class="cost-row"><span>${t('documents')}</span><b>${krw(fees.documents)}</b></div><div class="cost-row"><span>${t('handling')}</span><b>${krw(fees.handling)}</b></div><div class="cost-total"><span>${t('estimated_total')}</span><b>${krw(total(c))}</b></div><div class="detail-note">${t('estimate_note')}</div></div><form class="request-form" id="requestForm"><h3>${t('request_title')}</h3><div class="form-grid"><input required placeholder="${t('name')}" id="reqName"><input required placeholder="${t('country')}" id="reqCountry"><input required placeholder="${t('whatsapp')}" id="reqWhatsapp"><textarea placeholder="${t('notes')}" id="reqNotes"></textarea></div><button class="btn btn-primary" style="width:100%;margin-top:10px" type="submit">${t('send_request')}</button><div class="request-success" id="requestSuccess">${t('request_success')}</div></form></div></div>`;
    $('#vehicleModal').classList.add('open'); $('#vehicleModal').setAttribute('aria-hidden','false');
    if(c.photos.length>1){
      let photoIndex=0;
      const controls=document.createElement('div');controls.className='gallery-controls';
      controls.innerHTML='<button type="button" aria-label="Previous photo">←</button><span></span><button type="button" aria-label="Next photo">→</button>';
      document.querySelector('.gallery').appendChild(controls);
      function showPhoto(){const im=document.querySelector('.gallery img');im.src=c.photos[photoIndex].replace(/&amp;/g,'&');im.style.display='block';controls.querySelector('span').textContent=(photoIndex+1)+' / '+c.photos.length;}
      controls.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{photoIndex=(photoIndex+(i?1:-1)+c.photos.length)%c.photos.length;showPhoto();});showPhoto();
    }
    if(!demoMode){
      const note=document.createElement('p');note.className='detail-note';
      note.textContent=d ? (lang==='fr'?'Détails vérifiés le ':'Details checked ')+new Date(d.checked_at).toLocaleString(lang==='fr'?'fr-FR':'en-GB',{timeZone:'Asia/Seoul'})+' KST' : (lang==='fr'?'Détails temporairement indisponibles auprès du fournisseur.':'Provider details temporarily unavailable.');
      function addSpec(en,fr,value){const el=document.createElement('div');el.className='detail-spec';const label=document.createElement('span');label.textContent=lang==='fr'?fr:en;const b=document.createElement('b');b.textContent=value==null?missing:String(value);el.append(label,b);document.querySelector('.detail-specs').append(el);}
      addSpec('Seats','Places',sp.seats);addSpec('Power','Puissance',sp.power_ps ? sp.power_ps+' PS':null);
      if(sp.registration)addSpec('Registration month','Mois de mise en circulation',String(sp.registration).slice(0,4)+'-'+String(sp.registration).slice(4,6));
      const panel=document.createElement('section');panel.className='history-box';
      function heading(en,fr){const h=document.createElement('h3');h.textContent=lang==='fr'?fr:en;panel.append(h);}
      function row(en,fr,value,type='number'){
        const div=document.createElement('div');div.className='cost-row';const label=document.createElement('span');label.textContent=lang==='fr'?fr:en;
        const b=document.createElement('b');
        b.textContent=value==null?missing:type==='bool'?(value===true?(lang==='fr'?'Oui':'Yes'):value===false?(lang==='fr'?'Non':'No'):missing):type==='money'?krw(value):String(value);
        div.append(label,b);panel.append(div);
      }
      heading('Inspection report','Rapport d’inspection');
      const ins=d?.inspection;
      if(ins){row('Accident flagged by inspection','Accident signalé par l’inspection',ins.accdient,'bool');row('Simple repairs reported','Réparations simples signalées',ins.simpleRepair,'bool');}
      else row('Report','Rapport',null);
      heading('Insurance history','Historique d’assurance');const rec=d?.insurance;
      if(rec){
        row('Recorded claims / accidents','Sinistres / accidents enregistrés',rec.accidentCnt);
        row('Claims involving this car','Sinistres sur ce véhicule',rec.myAccidentCnt);
        row('Payouts for this car','Indemnités pour ce véhicule',rec.myAccidentCost,'money');
        row('Claims involving other vehicles','Sinistres causés à autrui',rec.otherAccidentCnt);
        row('Payouts for damage to others','Indemnités pour dommages à autrui',rec.otherAccidentCost,'money');
        row('Ownership changes','Changements de propriétaire',rec.ownerChangeCnt);
        row('Total-loss records','Cas de perte totale',rec.totalLossCnt);
        row('Flood total-loss records','Pertes totales par inondation',rec.floodTotalLossCnt);
        row('Partial flood-loss records','Dommages partiels par inondation',rec.floodPartLossCnt);
        row('Theft records','Cas de vol',rec.robberCnt);
      } else row('Insurance record','Relevé d’assurance',null);
      if(d?.kb_history){heading('KB public history','Historique public KB');for(const [key,en,fr] of [['totalLoss','Total loss','Perte totale'],['floodDamage','Flood damage','Inondation'],['commercialUse','Commercial use','Usage commercial']])row(en,fr,d.kb_history[key],'bool');row('Ownership changes','Changements de propriétaire',d.kb_history.ownershipChanges);}
      const caution=document.createElement('p');caution.className='detail-note';caution.textContent=lang==='fr'?'Données du fournisseur. Un champ non fourni ne signifie pas absence d’accident. La disponibilité et l’état doivent être confirmés avant achat.':'Provider records. Missing information does not mean accident-free. Availability and condition must be confirmed before purchase.';panel.append(caution);
      document.querySelector('.cost-box').before(panel);
      document.querySelector('.detail-specs').after(note);
      if(/^https:\/\//.test(c.listingUrl)){
        const a=document.createElement('a');a.href=c.listingUrl.replace(/&amp;/g,'&');a.target='_blank';a.rel='noopener noreferrer';
        a.textContent=lang==='fr'?"Voir l’annonce d’origine":"View original listing";note.after(a);
      }
      $('#requestSuccess').textContent=lang==='fr'?'Brouillon enregistré sur cet appareil uniquement — non envoyé à BEST CAR STAR.':'Draft saved on this device only — not sent to BEST CAR STAR.';
      $('#requestForm button').textContent=lang==='fr'?'Enregistrer le brouillon':'Save request draft';
    }
    if(demoMode){$('#requestForm').innerHTML=lang==='fr'?'Véhicule de démonstration — achat indisponible.':'Demo vehicle — purchase unavailable.';return;}
    $('#requestForm').onsubmit=e=>{e.preventDefault();$('#requestSuccess').classList.add('show');safeStore.set('bcsLastRequest',JSON.stringify({vehicleId:c.id,sourceId:c.sourceId,source:c.source,vehicle:`${c.year} ${c.make} ${c.model}`,price:c.price,estimatedTotal:total(c),name:$('#reqName').value,country:$('#reqCountry').value,whatsapp:$('#reqWhatsapp').value,notes:$('#reqNotes').value}))};
  };

  function metaNode() {
    let node = document.getElementById('liveMeta');
    if (!node) {
      node = document.createElement('div');
      node.id='liveMeta'; node.className='live-meta';
      const note = document.querySelector('.search-top p');
      if (note) note.insertAdjacentElement('afterend',node);
    }
    return node;
  }
  function showLoading() {
    $('#resultCount').textContent='…';
    $('#carGrid').innerHTML=`<div class="loading-box"><div class="spinner"></div>${t('loading_live')}</div>`;
    metaNode().innerHTML=`<span class="live-chip">${t('live_now')}</span><span>${t('live_test_note')}</span>`;
  }
  function showError(err) {
    $('#resultCount').textContent='0';
    $('#carGrid').innerHTML=`<div class="empty"><h3>${t('live_error')}</h3><p>${String(err && err.message || '')}</p><button class="btn btn-primary" id="liveRetry">${t('retry')}</button></div>`;
    const r=document.getElementById('liveRetry'); if(r) r.onclick=()=>loadLiveInventory(true);
  }
  function updateMeta() {
    const tm = liveLoadedAt ? liveLoadedAt.toLocaleString(lang==='fr'?'fr-FR':'en-GB', {timeZone:'Asia/Seoul'})+' KST' : '';
    metaNode().textContent=demoMode ? (lang==='fr'?'DÉMONSTRATION — annonces fictives, non disponibles à l’achat. Synchronisation en attente ou indisponible.':'DEMO — sample vehicles, not available to purchase. Sync pending or unavailable.') : `${inventory.filter(c=>c.source==='Encar').length} Encar + ${inventory.filter(c=>c.source==='KB ChaChaCha').length} KB ChaChaCha · ${t('last_updated')} ${tm} · ${t('live_test_note')}`;
  }
  function queryUrl() {
    const p=new URLSearchParams();
    const make=$('#makeFilter').value;
    const fuel=$('#fuelFilter').value;
    const yf=$('#yearFrom').value;
    const yt=$('#yearTo').value;
    if(make) p.set('manufacturer',make);
    if(fuel) p.set('fuel',String(fuel).toLowerCase());
    if(yf) p.set('yearFrom',yf);
    if(yt) p.set('yearTo',yt);
    p.set('page','0'); p.set('count',String(PAGE_SIZE));
    return API_BASE;
  }
  async function loadLiveInventory(fromSearch=false) {
    if(liveLoading) return;
    liveLoading=true; showLoading();
    try {
      const res=await fetch(queryUrl(),{headers:{'Accept':'application/json'},cache:'no-store'});
      if(!res.ok) throw new Error('Encar feed HTTP '+res.status);
      const json=await res.json();
      const rows=extractCars(json);
      const mapped=rows.map(normalizeCar).filter(c=>c.sourceId && c.price>0 && c.make && c.model && c.photos.length>0);
      if(!mapped.length) throw new Error('No valid vehicle records returned by the live feed.');
      inventory=mapped;
      liveLoadedAt=new Date(json.updated_at);
      if (!Number.isFinite(liveLoadedAt.getTime()) || Date.now()-liveLoadedAt.getTime()>48*3600000) throw new Error('Stale inventory');
      demoMode=false;
      const selectedMake=$('#makeFilter').value;
      const selectedFuel=$('#fuelFilter').value;
      populate();
      if(selectedMake && [...$('#makeFilter').options].some(o=>o.value===selectedMake)) $('#makeFilter').value=selectedMake;
      updateModels();
      if(selectedFuel && [...$('#fuelFilter').options].some(o=>o.value===selectedFuel)) $('#fuelFilter').value=selectedFuel;
      refreshLabels(); renderCars(); updateMeta();
    } catch(e) {
      demoMode=true; liveLoadedAt=null;
      inventory=MOCK_CARS.map(c=>({...c,photos:[],source:'Demo'}));
      populate(); refreshLabels(); renderCars(); updateMeta();
      console.error('BEST CAR STAR live Encar feed error',e);
    } finally { liveLoading=false; }
  }

  const baseUpdateModels=updateModels;
  updateModels=function(){
    const make=$('#makeFilter').value;
    const model=$('#modelFilter');
    if(!make){
      model.innerHTML=`<option value="">${t('select_make_first')}</option>`;
      model.disabled=true;
      return;
    }
    const current=model.value;
    const models=[...new Set(inventory.filter(c=>c.make===make).map(c=>c.simpleModel||simpleModelName(c.model)).filter(Boolean))].sort();
    fillSelect(model,models,t('all_models'));
    model.disabled=false;
    if(current&&models.includes(current)) model.value=current;
  };

  const originalFiltered=filtered;
  filtered=function(){
    const selectedModel=$('#modelFilter').value;
    const saved=$('#modelFilter').value;
    if(selectedModel) $('#modelFilter').value='';
    let cars=originalFiltered();
    if(selectedModel) {
      $('#modelFilter').value=saved;
      cars=cars.filter(c=>(c.simpleModel||simpleModelName(c.model))===selectedModel);
    }
    return cars;
  };

  const field=document.createElement('div');field.className='field';
  field.innerHTML='<label id="sourceLabel"></label><select id="sourceFilter"><option value=""></option><option>Encar</option><option>KB ChaChaCha</option></select>';
  document.querySelector('.filters').appendChild(field);
  const baseFiltered=filtered;
  filtered=function(){return baseFiltered().filter(c=>!$('#sourceFilter').value||c.source===$('#sourceFilter').value);};
  $('#sourceFilter').onchange=renderCars;
  function sourceLabels(){$('#sourceLabel').textContent=lang==='fr'?'Plateforme':'Marketplace';$('#sourceFilter').options[0].textContent=lang==='fr'?'Toutes les plateformes':'All marketplaces';}
  sourceLabels();
  const originalSetI18n=setI18n;
  setI18n=function(){originalSetI18n(); sourceLabels(); updateMeta();};

  $('#searchBtn').onclick=renderCars;
  $('#resetBtn').onclick=()=>{
    ['#makeFilter','#modelFilter','#yearFrom','#yearTo','#maxPrice','#maxMileage','#fuelFilter','#driveFilter','#sourceFilter'].forEach(s=>$(s).value='');
    updateModels(); renderCars();
  };
  $('#makeFilter').onchange=()=>{ updateModels(); renderCars(); };

  inventory=[];
  document.querySelector('.search-top p').textContent=t('sample_note');
  showLoading();
  loadLiveInventory(false);
})();

