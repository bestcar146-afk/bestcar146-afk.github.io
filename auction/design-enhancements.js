(()=>{
 const names={'K Car Auction':'K CAR','Autobell Smart Auction':'AUTO','Kolon Auto Auction':'KOLON','Lotte Auto Auction':'LOTTE','Others':'OTHER'};
 const imageFor=c=>{const key=(c.make+' '+c.model).toLowerCase();if(key.includes('mini')||key.includes('cooper'))return'mini.webp';if(key.includes('santa fe'))return'santafe.webp';if(key.includes('palisade')||key.includes('tiguan'))return'palisade.webp';if(key.includes('avante')||key.includes('k8'))return'sedan.webp';return'sorento.webp'};
 const decorateMarks=root=>root.querySelectorAll('.auction-mark:not([data-ready])').forEach(mark=>{mark.textContent=names[mark.dataset.auction]||'AUCTION';mark.setAttribute('aria-hidden','true');mark.dataset.ready='1'});
 window.BCSDesign={imageFor};
 const decorate=()=>{
  decorateMarks(document);
  document.querySelectorAll('#sourceTabs .source-tab').forEach(btn=>{const house=btn.dataset.source;if(!house||btn.querySelector('.auction-mark'))return;const mark=document.createElement('span');mark.className='auction-mark';mark.dataset.auction=house;btn.prepend(mark)});
  document.querySelectorAll('.vehicle-facts').forEach(dl=>{const terms=[...dl.querySelectorAll('dt')];const t=terms.find(x=>x.textContent.trim().toLowerCase()==='auction');if(!t)return;const dd=t.nextElementSibling;if(dd&&!dd.querySelector('.auction-mark')){const mark=document.createElement('span');mark.className='auction-mark';mark.dataset.auction=dd.textContent.trim();dd.prepend(mark);decorateMarks(dd)}});
  document.querySelectorAll('.condition-row').forEach(row=>{const label=row.querySelector('span')?.textContent||'';const value=row.querySelector('b');if(!value||value.querySelector('.status-sticker'))return;const ok=/available|no major/i.test(value.textContent);value.innerHTML='<span class="status-sticker '+(ok?'ok':'pending')+'">'+(ok?'✓':'!')+'</span> '+value.textContent});
 };
 const observer=new MutationObserver(decorate);observer.observe(document.body,{subtree:true,childList:true});decorate();
})();
