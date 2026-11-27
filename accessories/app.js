'use strict';
const {catalog, guides} = window;
const get = id => document.getElementById(id);
const filters = get('filters');
const vehicle = get('vehicle');
const year = get('year');
const area = get('area');
const query = get('query');
const sort = get('sort');
const grid = get('grid');
const details = get('details');
const pageSize = 18;
let page = 1;
const usd = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});
const formatYear = value => value.replace('~', '–').replace(/current/i, 'onward');
function options(select, values) {
  select.append(...values.map(value => new Option(value, value)));
}
function bounds(value) {
  const matches = (value.match(/\b(?:19|20)\d{2}\b/g) || []).map(Number);
  if (matches.length === 2 && matches[0] <= matches[1]) return matches;
  if (matches.length === 1 && /current/i.test(value)) return [matches[0], Infinity];
  if (matches.length === 1 && !value.includes('~')) return [matches[0], matches[0]];
  return null;
}
function yearFits(item, selected) {
  const range = bounds(item.years);
  return !selected || (range && selected >= range[0] && selected <= range[1]);
}
function updateYears() {
  const previous = year.value;
  const years = new Set();
  for (const item of catalog.filter(item => !vehicle.value || item.vehicle === vehicle.value)) {
    const range = bounds(item.years);
    if (!range) continue;
    const last = Number.isFinite(range[1]) ? range[1] : new Date().getFullYear();
    for (let y = range[0]; y <= last; y++) years.add(y);
  }
  year.replaceChildren(new Option('Any year', ''));
  options(year, [...years].sort((a,b)=>b-a));
  if (years.has(Number(previous))) year.value = previous;
}
function node(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}
function showDetails(item) {
  get('detail-title').textContent = item.name;
  const metadata = node('div', '', 'metadata');
  for (const text of [item.vehicle, formatYear(item.years), 'Code ' + item.code, item.pieces, usd.format(item.price)+' USD']) {
    if (text) metadata.append(node('span', text));
  }
  const content = get('detail-content');
  content.replaceChildren(metadata, node('p',item.location), node('p','Catalog fit: '+item.model),
    node('h3','Supplier fitting guide','guide-label'),node('p','Match the item code on the guide when shown. Select a guide to download it.','guide-note'));
  appendGuides(content,item.vehicle);
  details.showModal();
}
const guideLoads = new Map();
const assetOrder = ["media/guide-1.webp", "media/guide-2.webp", "media/guide-3.webp", "media/guide-4.webp", "media/guide-5.webp", "media/guide-6.webp", "media/guide-7.webp", "media/guide-8.webp", "media/guide-9.webp", "media/guide-10.webp", "media/guide-11.webp", "media/guide-12.webp", "media/guide-13.webp", "media/guide-14.webp", "media/guide-15.webp", "media/guide-16.webp", "media/guide-17.webp"];
function loadGuide(path) {
  if (!guideLoads.has(path)) {
    const index = assetOrder.indexOf(path);
    guideLoads.set(path,new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='asset'+index+'.js';
      script.onload=()=>resolve(window.guideImages[path]);
      script.onerror=()=>{guideLoads.delete(path);script.remove();reject(new Error('Guide unavailable'));};
      document.head.append(script);
    }));
  }
  return guideLoads.get(path);
}
function appendGuides(content, name) {
  for (const [index,path] of guides[name].entries()) {
    const holder=node('div','Loading guide…');
    content.append(holder);
    loadGuide(path).then(source=>{
      const image=document.createElement('img');
      image.className='guide';
      image.src=source;
      image.alt=name+' fitting guide '+(index+1);
      const link=document.createElement('a');
      link.href=source;
      link.download=name+' guide '+(index+1)+'.webp';
      link.title='Download fitting guide';
      link.append(image);
      holder.replaceChildren(link);
    }).catch(()=>{holder.textContent='This fitting guide could not load. Open it again to retry.';holder.className='guide-error';});
  }
}
function showVehicleGuide(name) {
  get('detail-title').textContent=name+' fitting guides';
  const content=get('detail-content');
  content.replaceChildren(node('p','Select a guide to download the full image.','guide-note'));
  appendGuides(content,name);
  details.showModal();
}
const vehicleButtons=new Map();
for(const name of Object.keys(guides).sort()) {
  const button=node('button','','vehicle-card');
  button.type='button';
  const img=document.createElement('img');
  img.src=window.vehicleImages[name];
  img.alt='';
  img.loading='lazy';
  button.append(img,node('span',name));
  button.addEventListener('click',()=>{
    vehicle.value=name;
    updateYears(); page=1; render();
    get('catalog').scrollIntoView({block:'start'});
  });
  vehicleButtons.set(name,button);
  get('vehicles').append(button);
}
get('hero-photo').src=window.vehicleImages.Sorento;
function render() {
  for(const [name,button] of vehicleButtons) button.setAttribute('aria-pressed',name===vehicle.value);
  const guidePanel=get('vehicle-guide');
  guidePanel.replaceChildren();
  if(vehicle.value) {
    const guideButton=node('button','View '+vehicle.value+' fitting guides ↗','vehicle-guide-button');
    guideButton.addEventListener('click',()=>showVehicleGuide(vehicle.value));
    guidePanel.append(guideButton);
  }
  const terms = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = catalog.filter(item => {
    const words = [item.name,item.code,item.vehicle,item.model,item.location].join(' ').toLowerCase();
    return (!vehicle.value || item.vehicle === vehicle.value) && (!area.value || item.area === area.value)
      && yearFits(item, Number(year.value)) && terms.every(term => words.includes(term));
  });
  results.sort((a,b)=> (sort.value === 'low' ? a.price-b.price : sort.value === 'high' ? b.price-a.price : 0)
    || a.vehicle.localeCompare(b.vehicle) || a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(results.length/pageSize));
  page = Math.min(page,pages);
  const first = (page-1)*pageSize;
  get('count').textContent = results.length ? `${first+1}–${Math.min(first+pageSize,results.length)} of ${results.length} accessories` : '0 accessories';
  grid.replaceChildren();
  for (const item of results.slice(first,first+pageSize)) {
    const card = get('card').content.cloneNode(true);
    for (const [selector,value] of Object.entries({'.area':item.area,'.code':item.code,'.fit':item.vehicle+' · '+formatYear(item.years),h3:item.name,'.location':item.location,'.price':usd.format(item.price)})) {
      card.querySelector(selector).textContent = value;
    }
    const source=window.accessoryPhotos?.[item.vehicle]?.[item.code];
    if(source) {
      const image=document.createElement('img');
      image.src=source;
      image.alt=item.name+' — '+item.vehicle+' ('+item.code+')';
      image.loading='lazy';
      card.querySelector('.part-photo').append(image);
    }
    const button = card.querySelector('.detail');
    button.setAttribute('aria-label','View fit details for '+item.name+' '+item.code);
    button.addEventListener('click',()=>showDetails(item));
    grid.append(card);
  }
  if (!results.length) grid.append(node('p','No accessories match these filters. Try a different year or clear a filter.','empty'));
  const navigation = get('pages');
  navigation.replaceChildren();
  if (pages > 1) {
    const previous = node('button','← Previous'), next = node('button','Next →');
    previous.disabled = page===1;
    next.disabled = page===pages;
    for (const [button,change] of [[previous,-1],[next,1]]) button.addEventListener('click',()=>{
      page+=change;
      render();
      get('catalog').scrollIntoView({block:'start'});
      get('count').setAttribute('tabindex','-1');
      get('count').focus({preventScroll:true});
    });
    navigation.append(previous,node('span',`Page ${page} of ${pages}`),next);
  }
}
options(vehicle,Object.keys(guides).sort());
options(area,[...new Set(catalog.map(item=>item.area))]);
updateYears();
vehicle.addEventListener('change',updateYears);
filters.addEventListener('input',event=>{if(event.target!==vehicle){page=1;render();}});
vehicle.addEventListener('change',()=>{page=1;render();});
filters.addEventListener('submit',event=>event.preventDefault());
filters.addEventListener('reset',()=>setTimeout(()=>{sort.value='';updateYears();page=1;render();}));
sort.addEventListener('change',()=>{page=1;render();});
render();
