(() => {
  const API_BASE = './inventory.json';
  let demoMode = false;
  const PAGE_SIZE = 100;
  let liveLoading = false;
  let liveLoadedAt = null;

  Object.assign(TXT.en, {
    sample_note: 'Selected Encar listings, synced every six hours. Filters search this selection.',
    live_inventory: 'LIVE ENCAR INVENTORY',
    live_now: 'Live',
    loading_live: 'Loading live Encar vehicles…',
    live_error: 'Live inventory is temporarily unavailable.',
    retry: 'Retry',
    last_updated: 'Last updated',
    source: 'Source',
    photos_unavailable: 'Photo unavailable',
    live_test_note: 'Live test feed · availability must still be confirmed before purchase.'
  });
  Object.assign(TXT.fr, {
    sample_note: 'Sélection Encar synchronisée toutes les six heures. Les filtres recherchent dans cette sélection.',
    live_inventory: 'INVENTAIRE ENCAR EN DIRECT',
    live_now: 'En direct',
    loading_live: 'Chargement des véhicules Encar en direct…',
    live_error: 'L’inventaire en direct est temporairement indisponible.',
    retry: 'Réessayer',
    last_updated: 'Dernière mise à jour',
    source: 'Source',
    photos_unavailable: 'Photo indisponible',
    live_test_note: 'Flux de test en direct · la disponibilité doit toujours être confirmée avant achat.'
  });

  const style = document.createElement('style');
  style.textContent = `
    .car-photo img{width:100%;height:100%;object-fit:cover;display:block}
    .photo-fallback{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#dfeaf1,#f7fafc);color:#778492;font-weight:800}
    .live-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:12px;color:#697787}
    .live-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#e8f7f1;color:#137951;font-weight:900}
    .live-chip:before{content:'';width:7px;height:7px;border-radius:50%;background:#1ca36f}
    .loading-box{grid-column:1/-1;background:#fff;border:1px solid #e2e8ee;border-radius:18px;padding:42px;text-align:center;color:#657483}
    .spinner{width:28px;height:28px;border:3px solid #dce6ed;border-top-color:#10243b;border-radius:50%;margin:0 auto 14px;animation:bcsSpin .8s linear infinite}
    @keyframes bcsSpin{to{transform:rotate(360deg)}}
    .gallery{background:#eef4f8;min-height:420px;position:relative;display:grid;place-items:center;overflow:hidden}
    .gallery img{width:100%;height:100%;max-height:560px;object-fit:contain;background:#eef4f8}
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
  function normalizeCar(x) {
    const sourceId = String(pick(x,['id','Id','carId','car_id','vehicleId','vehicle_id','carid'],''));
    const rawPhotos = pick(x,['photos','images','photoUrls','imageUrls'],[]);
    let photos = arr(rawPhotos).map(cleanImage).filter(Boolean);
    const single = cleanImage(pick(x,['thumbnail','thumbnailUrl','thumbnail_url','image','imageUrl','image_url','photo','photoUrl','photo_url'],''));
    if (single && !photos.includes(single)) photos.unshift(single);
    const yearRaw = pick(x,['year','modelYear','model_year','Year','formYear','registrationYear'],'');
    const year = num(String(yearRaw).slice(0,4)) || num(yearRaw);
    const price = normalizePrice(pick(x,['priceWon','price_won','priceKRW','price_krw','price','Price','advertisement.price'],''));
    return {
      id: 'BCS-E-' + (sourceId || Math.random().toString(36).slice(2,10)),
      sourceId,
      source:'Encar',
      make:String(pick(x,['manufacturer','Manufacturer','make','Make','brand','maker'],'Encar')),
      model:String(pick(x,['model','Model','modelName','model_name'],'Vehicle')),
      trim:String(pick(x,['trim','badge','badgeDetail','badge_detail','grade','title','name'],'')).trim(),
      year,
      mileage:num(pick(x,['mileage','Mileage','mileageKm','mileage_km'],0)),
      fuel:titleFuel(pick(x,['fuel','fuelType','fuel_type','FuelType'],'—')),
      drive:String(pick(x,['drivetrain','drive','driveType','drive_type'],'—')),
      transmission:String(pick(x,['transmission','transmissionType','transmission_type'],'—')),
      engine:String(pick(x,['engine','engineSize','engine_size','displacement','engineCc','engine_cc'],'—')),
      color:String(pick(x,['color','Color','exteriorColor','exterior_color'],'—')),
      location:String(pick(x,['region','location','city','dealer.region','officeCity'],'Korea')),
      price,
      photos,
      listingUrl:String(pick(x,['encar_url','url','listingUrl','listing_url','detailUrl','detail_url'],''))
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
    return `<article class="card"><div class="car-photo"><span class="source-pill">${demoMode?'Demo':'Encar'}</span><span class="avail-pill">${demoMode ? (lang==='fr'?'Démonstration':'Demo') : (lang==='fr'?'Annonce lors de la synchronisation':'Listed at last sync')}</span>${imageMarkup(c)}</div><div class="card-body"><h3>${c.year || ''} ${c.make} ${c.model}</h3><div class="trim">${c.trim || '&nbsp;'}</div><div class="spec-row"><span class="spec">${(c.mileage||0).toLocaleString()} km</span><span class="spec">${tr(c.fuel)}</span><span class="spec">${c.drive}</span><span class="spec">${c.location}</span></div><div class="price-label">${t('vehicle_price')}</div><div class="price">${krw(c.price)}</div><div class="estimate"><span>${t('estimated_total')}</span><strong>${krw(total(c))}</strong></div><button class="btn btn-primary" data-car="${c.id}">${t('view_vehicle')}</button></div></article>`;
  };

  openVehicle = function(id) {
    let c=inventory.find(x=>x.id===id); if(!c)return; c=displayCar(c);
    const img = c.photos && c.photos[0]
      ? `<img src="${c.photos[0]}" alt="${c.year} ${c.make} ${c.model}" onerror="this.style.display='none'">`
      : `<div class="photo-fallback">${t('photos_unavailable')}</div>`;
    $('#detailContent').innerHTML=`<div class="detail-grid"><div class="gallery">${img}<div class="gallery-count">Encar · ${c.photos.length || 0} photo(s)</div></div><div class="detail-side"><div class="eyebrow">DIRECT PURCHASE · ${c.id}</div><h2>${c.year || ''} ${c.make} ${c.model}</h2><div class="detail-trim">${c.trim || ''}</div><div class="source-row"><span>${t('source')}:</span><b>Encar</b><span>·</span><span>${demoMode ? (lang==='fr'?'Démonstration':'Demo') : (lang==='fr'?'Annonce lors de la synchronisation':'Listed at last sync')}</span></div><div class="detail-specs"><div class="detail-spec"><span>${t('mileage')}</span><b>${(c.mileage||0).toLocaleString()} km</b></div><div class="detail-spec"><span>${t('fuel')}</span><b>${tr(c.fuel)}</b></div><div class="detail-spec"><span>${t('transmission')}</span><b>${tr(c.transmission)}</b></div><div class="detail-spec"><span>${t('drivetrain')}</span><b>${c.drive}</b></div><div class="detail-spec"><span>${t('engine')}</span><b>${c.engine}</b></div><div class="detail-spec"><span>${t('color')}</span><b>${c.color}</b></div><div class="detail-spec"><span>${t('location')}</span><b>${c.location}</b></div><div class="detail-spec"><span>${t('status')}</span><b>${demoMode ? (lang==='fr'?'Démonstration':'Demo') : (lang==='fr'?'Annonce lors de la synchronisation':'Listed at last sync')}</b></div></div><div class="cost-box"><b>${t('purchase_cost')}</b><div class="cost-row"><span>${t('vehicle_price')}</span><b>${krw(c.price)}</b></div><div class="cost-row"><span>${t('transport')}</span><b>${krw(fees.transport)}</b></div><div class="cost-row"><span>${t('documents')}</span><b>${krw(fees.documents)}</b></div><div class="cost-row"><span>${t('handling')}</span><b>${krw(fees.handling)}</b></div><div class="cost-total"><span>${t('estimated_total')}</span><b>${krw(total(c))}</b></div><div class="detail-note">${t('estimate_note')}</div></div><form class="request-form" id="requestForm"><h3>${t('request_title')}</h3><div class="form-grid"><input required placeholder="${t('name')}" id="reqName"><input required placeholder="${t('country')}" id="reqCountry"><input required placeholder="${t('whatsapp')}" id="reqWhatsapp"><textarea placeholder="${t('notes')}" id="reqNotes"></textarea></div><button class="btn btn-primary" style="width:100%;margin-top:10px" type="submit">${t('send_request')}</button><div class="request-success" id="requestSuccess">${t('request_success')}</div></form></div></div>`;
    $('#vehicleModal').classList.add('open'); $('#vehicleModal').setAttribute('aria-hidden','false');
    if(demoMode){$('#requestForm').innerHTML=lang==='fr'?'Véhicule de démonstration — achat indisponible.':'Demo vehicle — purchase unavailable.';return;}
    $('#requestForm').onsubmit=e=>{e.preventDefault();$('#requestSuccess').classList.add('show');safeStore.set('bcsLastRequest',JSON.stringify({vehicleId:c.id,sourceId:c.sourceId,source:'Encar',vehicle:`${c.year} ${c.make} ${c.model}`,price:c.price,estimatedTotal:total(c),name:$('#reqName').value,country:$('#reqCountry').value,whatsapp:$('#reqWhatsapp').value,notes:$('#reqNotes').value}))};
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
    metaNode().textContent=demoMode ? (lang==='fr'?'DÉMONSTRATION — annonces fictives, non disponibles à l’achat. Synchronisation en attente ou indisponible.':'DEMO — sample vehicles, not available to purchase. Sync pending or unavailable.') : `${inventory.length} Encar · ${t('last_updated')} ${tm} · ${t('live_test_note')}`;
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
      const mapped=rows.map(normalizeCar).filter(c=>c.sourceId && c.price>0 && c.make && c.model);
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

  const originalSetI18n=setI18n;
  setI18n=function(){originalSetI18n(); updateMeta();};

  $('#searchBtn').onclick=renderCars;
  $('#resetBtn').onclick=()=>{
    ['#makeFilter','#modelFilter','#yearFrom','#yearTo','#maxPrice','#maxMileage','#fuelFilter','#driveFilter'].forEach(s=>$(s).value='');
    updateModels(); renderCars();
  };
  $('#makeFilter').onchange=()=>{ updateModels(); renderCars(); };

  inventory=[];
  document.querySelector('.search-top p').textContent=t('sample_note');
  showLoading();
  loadLiveInventory(false);
})();