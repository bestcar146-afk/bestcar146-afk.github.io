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
  buildChips("year-chips", year);
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
const inquiry = get('inquiry');
const selectedParts = new Map();
const quoteMessage = get('quote-message');
const destination = get('destination');
const inquiryStatus = get('inquiry-status');
function updateMessage() {
  const lines = [...selectedParts.values()].map(({item, quantity}) =>
    quantity + ' × ' + item.name + ' (' + item.code + ') — ' + item.vehicle + ' ' + formatYear(item.years));
  quoteMessage.value = ['Hello Best Car Star, could you quote the following accessories?',
    '', ...lines, '', destination.value.trim() && 'Delivery to: ' + destination.value.trim(),
    'Please confirm fitment, availability, shipping cost and estimated delivery.'].join('\n');
}
function updateInquiry() {
  const list = get('inquiry-items');
  list.replaceChildren();
  for (const [item, entry] of selectedParts) {
    const title = item.name + ' · ' + item.vehicle + ' · ' + item.code;
    const row = node('li', '', 'inquiry-item');
    const label = node('label', 'Quantity');
    const quantity = document.createElement('input');
    quantity.type = 'number';
    quantity.min = '1';
    quantity.max = '999';
    quantity.value = entry.quantity;
    quantity.setAttribute('aria-label', 'Quantity for ' + title);
    quantity.addEventListener('change', () => {
      entry.quantity = Math.max(1, Math.min(999, Math.round(Number(quantity.value) || 1)));
      quantity.value = entry.quantity;
      updateMessage();
    });
    label.append(quantity);
    const remove = node('button', 'Remove', 'secondary-button');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + title);
    remove.addEventListener('click', () => {
      selectedParts.delete(item);
      updateInquiry();
      render();
      inquiry.querySelector('.close').focus();
    });
    row.append(node('strong', title), label, remove);
    list.append(row);
  }
  get('view-inquiry').textContent = 'Inquiry (' + selectedParts.size + ')';
  get('inquiry-empty').hidden = selectedParts.size > 0;
  get('inquiry-draft').hidden = selectedParts.size === 0;
  inquiryStatus.textContent = '';
  updateMessage();
}
get('view-inquiry').addEventListener('click', () => { updateInquiry(); inquiry.showModal(); });
destination.addEventListener('input', updateMessage);
get('copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(quoteMessage.value);
    inquiryStatus.textContent = 'Inquiry copied.';
  } catch {
    quoteMessage.focus();
    quoteMessage.select();
    inquiryStatus.textContent = 'The message is selected. Copy it to share.';
  }
});
if (navigator.share) {
  const share = get('share-inquiry');
  share.hidden = false;
  share.addEventListener('click', async () => {
    try { await navigator.share({title:'Best Car Star accessory inquiry', text:quoteMessage.value}); }
    catch (error) {
      if (error.name !== 'AbortError') inquiryStatus.textContent = 'Use Copy inquiry to share this message.';
    }
  });
}
function buildChips(id, select) {
  const row = get(id);
  const scrollLeft = row.scrollLeft;
  row.replaceChildren();
  for (const option of select.options) {
    const button = node('button', option.text, 'filter-chip');
    button.type = 'button';
    button.dataset.value = option.value;
    button.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event(select === vehicle ? 'change' : 'input', {bubbles:true}));
      button.focus({preventScroll:true});
    });
    row.append(button);
  }
  row.scrollLeft = scrollLeft;
}
function syncChips(id, value) {
  for (const button of get(id).children) button.setAttribute('aria-pressed', String(button.dataset.value === value));
}
function render() {
  syncChips('vehicle-chips', vehicle.value);
  syncChips('year-chips', year.value);
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
    for (const [selector,value] of Object.entries({'.code':'Part '+item.code,'.fit':bounds(item.years) && !/current/i.test(item.years) ? '✓ Fits '+item.vehicle+' '+formatYear(item.years) : item.vehicle+' · '+formatYear(item.years)+' · Check fit',h3:item.name,'.location':item.location,'.price':usd.format(item.price)})) {
      card.querySelector(selector).textContent = value;
    }
    const source=window.accessoryPhotos?.[item.vehicle]?.[item.code];
    if(source) {
      const image=document.createElement('img');
      image.src=source;
      image.alt=item.name+' — '+item.vehicle+' ('+item.code+')';
      image.loading='lazy';
      card.querySelector('.part-photo').append(image);
    } else {
      card.querySelector('.part-photo').append(node('span', 'Photo unavailable'));
    }
    if (!bounds(item.years) || /current/i.test(item.years)) card.querySelector('.fit').classList.add('fit-unconfirmed');
    const add = card.querySelector('.add-inquiry');
    add.textContent = selectedParts.has(item) ? 'View inquiry' : 'Add to inquiry';
    add.addEventListener('click', () => {
      if (!selectedParts.has(item)) selectedParts.set(item, {item, quantity:1});
      add.textContent = 'View inquiry';
      updateInquiry();
      inquiry.showModal();
    });
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
buildChips('vehicle-chips', vehicle);
options(area,[...new Set(catalog.map(item=>item.area))]);
updateYears();
vehicle.addEventListener('change',updateYears);
filters.addEventListener('input',event=>{if(event.target!==vehicle){page=1;render();}});
vehicle.addEventListener('change',()=>{page=1;render();});
filters.addEventListener('submit',event=>event.preventDefault());
filters.addEventListener('reset',()=>setTimeout(()=>{sort.value='';updateYears();page=1;render();}));
sort.addEventListener('change',()=>{page=1;render();});
render();
