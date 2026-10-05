(() => {
  const LOGO = '/assets/best-car-star-logo.webp?v=4';
  const WHATSAPP='821068738852';
  const STEP_SEARCH='/assets/step-search.webp?v=1';
  const STEP_ESTIMATE='/assets/step-estimate.webp?v=1';
  const STEP_REQUEST='/assets/step-request.webp?v=1';
  const STEP_CONFIRM='/assets/step-confirm.webp?v=1';

  const style=document.createElement('style');
  style.id='bcs-premium-theme';
  style.textContent=`
  :root{
    --navy:#0f172a;--navy2:#090d16;--navy3:#1e293b;
    --accent:#2563eb;--cyan:#0ea5e9;--teal:#14b8a6;
    --line:#e2e8f0;--muted:#64748b;--bg:#f8fafc;--text:#0f172a;
    --shadow:0 20px 45px -20px rgba(15,23,42,.22);
  }
  body{background:var(--bg);color:var(--text);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
  .container{width:min(1240px,100%);padding-left:24px;padding-right:24px}
  .bcs-topbar{background:#090d16;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}
  .bcs-topbar-inner{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .bcs-topbar-left,.bcs-topbar-right{display:flex;align-items:center;gap:12px}
  .bcs-live-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 9px;border-radius:999px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.25);color:#7dd3fc;font-weight:800;letter-spacing:.04em}
  .bcs-live-badge:before{content:'';width:7px;height:7px;border-radius:50%;background:#22d3ee;box-shadow:0 0 12px #22d3ee}
  .bcs-topbar a{color:#e2e8f0;text-decoration:none;font-weight:700}.bcs-topbar a:hover{color:#7dd3fc}
  header{background:rgba(255,255,255,.96);border-bottom:1px solid #e2e8f0;box-shadow:0 4px 18px rgba(15,23,42,.04)}
  .header-inner{min-height:88px;gap:22px}
  .brand{min-width:190px;text-decoration:none}
  .bcs-brand-logo{width:176px;height:72px;object-fit:contain;display:block}
  .bcs-nav{display:flex;align-items:center;gap:26px;margin-left:auto}
  .bcs-nav a{font-size:13px;color:#475569;text-decoration:none;font-weight:750;transition:.2s}
  .bcs-nav a:hover{color:var(--accent)}
  .bcs-nav .bcs-nav-cta{padding:11px 14px;border-radius:12px;background:#0f172a;color:#fff}
  .bcs-nav .bcs-nav-cta:hover{background:#2563eb;color:#fff}
  .lang select{border:1px solid #d9e2ec;background:#fff;border-radius:12px;padding:11px 36px 11px 12px;font-weight:800;color:#0f172a;box-shadow:0 2px 7px rgba(15,23,42,.03)}
  .hero{position:relative;overflow:hidden;background:radial-gradient(circle at 75% 20%,rgba(14,165,233,.20),transparent 34%),radial-gradient(circle at 15% 90%,rgba(37,99,235,.18),transparent 32%),linear-gradient(135deg,#090d16 0%,#0f172a 58%,#172554 100%);padding:72px 0 126px;border:0;color:#fff}
  .hero:before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent 80%);pointer-events:none}
  .hero>.container{position:relative;z-index:1}
  .bcs-hero-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(330px,.75fr);gap:58px;align-items:center}
  .hero .eyebrow{color:#7dd3fc;letter-spacing:3.2px}
  .hero h1{color:#fff;font-size:clamp(44px,6vw,72px);line-height:1.02;letter-spacing:-.035em;font-weight:850;max-width:760px;margin:18px 0 20px}
  .hero p{color:#cbd5e1;font-size:19px;line-height:1.65;max-width:720px}
  .hero-actions{margin-top:30px;gap:12px}
  .hero .btn{border-radius:12px;padding:15px 22px;box-shadow:none;text-decoration:none}
  .hero .btn-primary{background:#2563eb;color:#fff;box-shadow:0 12px 30px rgba(37,99,235,.28)}
  .hero .btn-primary:hover{background:#1d4ed8;transform:translateY(-1px)}
  .hero .btn-secondary{background:rgba(255,255,255,.07);color:#fff;border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px)}
  .hero .btn-secondary:hover{background:rgba(255,255,255,.12)}
  .hero .status-note{color:#94a3b8;margin-top:25px}.hero .dot{background:#34d399;box-shadow:0 0 13px rgba(52,211,153,.8)}
  .bcs-hero-panel{background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:24px;backdrop-filter:blur(16px);box-shadow:0 25px 70px rgba(0,0,0,.28)}
  .bcs-panel-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,.10)}
  .bcs-panel-title{font-size:17px;font-weight:850;color:#fff}.bcs-panel-sub{font-size:11px;color:#94a3b8;margin-top:4px}
  .bcs-panel-live{font-size:10px;font-weight:900;letter-spacing:.08em;color:#86efac;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.24);padding:6px 9px;border-radius:8px}
  .bcs-panel-items{display:grid;gap:11px}
  .bcs-panel-item{display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(2,6,23,.42);border:1px solid rgba(148,163,184,.11);padding:13px;border-radius:14px}
  .bcs-panel-item-left{display:flex;align-items:center;gap:11px}
  .bcs-panel-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:rgba(37,99,235,.16);color:#7dd3fc;font-size:18px}
  .bcs-panel-label{font-size:11px;color:#94a3b8}.bcs-panel-value{font-size:13px;color:#fff;font-weight:800;margin-top:2px}
  .bcs-panel-check{color:#34d399;font-weight:900}
  .main{position:relative;z-index:5;margin-top:-66px;padding:0 0 72px}
  .search-shell{background:rgba(255,255,255,.98);border:1px solid rgba(226,232,240,.9);border-radius:24px;padding:26px;box-shadow:0 28px 60px -28px rgba(15,23,42,.35)}
  .search-top{padding-bottom:18px;border-bottom:1px solid #eef2f7;margin-bottom:22px}
  .search-top h2{font-size:29px;letter-spacing:-.02em}.search-top p{font-size:13px}
  .main .eyebrow{color:#2563eb;font-size:11px;letter-spacing:2.5px}
  .field label{text-transform:uppercase;letter-spacing:.08em;font-size:10px;color:#475569}
  .field select,.field input{background:#f8fafc;border-color:#dbe3ec;border-radius:11px;padding:13px 12px;transition:.2s}
  .field select:hover,.field input:hover{border-color:#b8c6d6}.field select:focus,.field input:focus{background:#fff;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
  .filter-actions .btn{border-radius:11px}.filter-actions .btn-primary{background:#0f172a}.filter-actions .btn-primary:hover{background:#2563eb}
  .results-head{margin-top:34px;padding:0 3px}.results-count strong{display:inline-grid;place-items:center;min-width:34px;height:28px;padding:0 9px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:14px}
  .sort-wrap select{border-color:#dbe3ec;border-radius:10px;background:#fff}
  .grid{gap:24px}
  .card{border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 8px 25px rgba(15,23,42,.06);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
  .card:hover{transform:translateY(-4px);box-shadow:0 22px 44px rgba(15,23,42,.12);border-color:#cbd5e1}
  .car-photo{background:linear-gradient(145deg,#eef2f7,#fff);border-bottom:1px solid #edf2f7}
  .car-photo img{transition:transform .45s ease}.card:hover .car-photo img{transform:scale(1.025)}
  .source-pill{background:rgba(15,23,42,.90)!important;color:#fff!important;border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);letter-spacing:.04em}
  .card-body{padding:19px 19px 18px}.card h3{font-size:19px;letter-spacing:-.015em}.trim{color:#64748b}
  .spec{background:#f1f5f9;color:#475569;border:1px solid #e8edf3}
  .price-label{text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:750}.price{font-size:23px;color:#0f172a}
  .estimate{margin-top:11px;padding:12px 13px;border:0;border-radius:12px;background:linear-gradient(135deg,#eff6ff,#f0fdfa);align-items:center}
  .estimate span{color:#475569}.estimate strong{color:#0f172a;font-size:18px}
  .card .btn-primary{background:#0f172a;border-radius:11px}.card .btn-primary:hover{background:#2563eb}
  .how{padding:80px 0;background:#fff;border-top:1px solid #eef2f7}.how h2{font-size:40px;letter-spacing:-.03em}
  .step{border:1px solid #e2e8f0;border-radius:18px;padding:24px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.04);transition:.2s}.step:hover{transform:translateY(-2px);box-shadow:0 18px 32px rgba(15,23,42,.08)}
  .bcs-step-art{height:178px;border-radius:16px;background:#f5f9fc;display:grid;place-items:center;margin:-4px -4px 18px;padding:10px;overflow:hidden}
  .bcs-step-art img{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
  .step-num{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#dbeafe;color:#2563eb;font-weight:900}
  .bcs-quick-nav{position:fixed;right:22px;bottom:22px;z-index:70;display:flex;align-items:center;gap:6px;padding:6px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 18px 45px rgba(15,23,42,.28);backdrop-filter:blur(14px);opacity:0;transform:translateY(12px);pointer-events:none;transition:.22s}
  .bcs-quick-nav.show{opacity:1;transform:translateY(0);pointer-events:auto}
  .bcs-quick-nav a{display:flex;align-items:center;gap:7px;padding:10px 12px;border-radius:11px;color:#cbd5e1;text-decoration:none;font-size:12px;font-weight:850;white-space:nowrap;transition:.18s}
  .bcs-quick-nav a:hover,.bcs-quick-nav a:focus{background:#2563eb;color:#fff;outline:none}
  .bcs-quick-nav .bcs-qn-icon{font-size:14px;line-height:1}
  footer{background:linear-gradient(180deg,#0f172a,#090d16);padding:58px 0 30px;border-top:1px solid #1e293b}
  .bcs-footer-brand{display:flex;align-items:center;gap:18px;margin-bottom:24px}.bcs-footer-logo{width:170px;height:92px;object-fit:contain;background:#fff;border-radius:18px;padding:7px}
  .footer-title{font-size:34px;letter-spacing:-.025em}.footer-copy{color:#94a3b8}.footer-bottom{border-top-color:rgba(148,163,184,.16)}
  .modal .backdrop{background:rgba(2,6,23,.78);backdrop-filter:blur(8px)}.dialog{border:1px solid rgba(255,255,255,.2);box-shadow:0 40px 120px rgba(0,0,0,.38)}
  .close{box-shadow:0 6px 20px rgba(15,23,42,.12);font-size:24px}
  .s3-info-pane{background:#fff}.s3-main-photo{box-shadow:0 16px 40px rgba(15,23,42,.08)}.s3-title{letter-spacing:-.025em}.s3-price{color:#0f172a}
  .s3-cost{background:#f8fafc;border-color:#e2e8f0}.s3-request-btn{background:#2563eb!important;box-shadow:0 12px 26px rgba(37,99,235,.20)}
  .s3-request-btn:hover{background:#1d4ed8!important}
  .s3-accordion summary{color:#0f172a}
  @media(max-width:1000px){.bcs-nav{display:none}.bcs-hero-grid{grid-template-columns:1fr;gap:34px}.bcs-hero-panel{max-width:760px}.hero{padding-bottom:112px}}
  @media(max-width:620px){
    .container{padding-left:16px;padding-right:16px}.bcs-topbar-inner{min-height:32px}.bcs-topbar-left>span:not(.bcs-live-badge){display:none}.bcs-topbar-right span{display:none}
    .header-inner{min-height:76px}.brand{min-width:0}.bcs-brand-logo{width:130px;height:58px}.lang select{font-size:13px;padding:10px 30px 10px 10px}
    .hero{padding:42px 0 96px}.hero h1{font-size:43px}.hero p{font-size:16px}.bcs-hero-grid{gap:26px}.bcs-hero-panel{padding:16px;border-radius:18px}
    .bcs-panel-item{padding:11px}.bcs-panel-icon{width:34px;height:34px}.main{margin-top:-48px}.search-shell{padding:17px;border-radius:19px}
    .search-top{padding-bottom:14px}.search-top h2{font-size:23px}.grid{gap:16px}.card-body{padding:16px}.how{padding:56px 0}.how h2{font-size:32px}.bcs-step-art{height:168px;margin-bottom:16px}
    footer{padding-top:44px}.bcs-footer-brand{align-items:flex-start;flex-direction:column}.bcs-footer-logo{width:145px;height:78px}
    .bcs-quick-nav{right:14px;left:14px;bottom:calc(84px + env(safe-area-inset-bottom));justify-content:center;border-radius:15px}
    .bcs-quick-nav a{flex:1;justify-content:center;padding:11px 10px;font-size:12px}
  }`;
  document.head.appendChild(style);

  if(!document.querySelector('.bcs-topbar')){
    const top=document.createElement('div');
    top.className='bcs-topbar';
    top.innerHTML=`<div class="container bcs-topbar-inner"><div class="bcs-topbar-left"><span class="bcs-live-badge">KOREAN MARKET FEED</span><span>Direct vehicle sourcing from South Korea</span></div><div class="bcs-topbar-right"><a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp <span>+82 10-6873-8852</span></a></div></div>`;
    document.body.insertBefore(top,document.querySelector('header'));
  }

  const header=document.querySelector('header');
  const brand=header?.querySelector('.brand');
  if(brand){
    brand.innerHTML=`<img class="bcs-brand-logo" src="${LOGO}" alt="BEST CARS STARS">`;
    brand.setAttribute('aria-label','BEST CAR STAR');
  }
  const hi=header?.querySelector('.header-inner');
  if(hi && !hi.querySelector('.bcs-nav')){
    const nav=document.createElement('nav');
    nav.className='bcs-nav';
    nav.innerHTML=`<a href="#cars">Inventory</a><a href="#how">How it works</a><a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener" class="bcs-nav-cta">WhatsApp</a>`;
    const langBox=hi.querySelector('.lang');
    hi.insertBefore(nav,langBox||null);
  }

  const hc=document.querySelector('.hero>.container');
  if(hc && !hc.querySelector('.bcs-hero-grid')){
    const kids=[...hc.children];
    const grid=document.createElement('div');grid.className='bcs-hero-grid';
    const copy=document.createElement('div');copy.className='bcs-hero-copy';
    kids.forEach(el=>copy.appendChild(el));
    const panel=document.createElement('aside');panel.className='bcs-hero-panel';
    panel.innerHTML=`
      <div class="bcs-panel-head"><div><div class="bcs-panel-title">Korean Market Access</div><div class="bcs-panel-sub">One point of access for overseas buyers</div></div><span class="bcs-panel-live">LIVE FEED</span></div>
      <div class="bcs-panel-items">
        <div class="bcs-panel-item"><div class="bcs-panel-item-left"><span class="bcs-panel-icon">🚘</span><div><div class="bcs-panel-label">Direct purchase inventory</div><div class="bcs-panel-value">Encar + KB ChaChaCha</div></div></div><span class="bcs-panel-check">✓</span></div>
        <div class="bcs-panel-item"><div class="bcs-panel-item-left"><span class="bcs-panel-icon">🌍</span><div><div class="bcs-panel-label">Buyer interface</div><div class="bcs-panel-value">English + Français</div></div></div><span class="bcs-panel-check">✓</span></div>
        <div class="bcs-panel-item"><div class="bcs-panel-item-left"><span class="bcs-panel-icon">💬</span><div><div class="bcs-panel-label">Vehicle booking</div><div class="bcs-panel-value">Direct WhatsApp request</div></div></div><span class="bcs-panel-check">✓</span></div>
      </div>`;
    grid.append(copy,panel);hc.appendChild(grid);
  }

  const stepImages=[
    {src:STEP_SEARCH,alt:'Search vehicles'},
    {src:STEP_ESTIMATE,alt:'Estimate vehicle purchase cost'},
    {src:STEP_REQUEST,alt:'Request a vehicle'},
    {src:STEP_CONFIRM,alt:'Confirm and purchase'}
  ];
  document.querySelectorAll('#how .step').forEach((step,i)=>{
    if(stepImages[i] && !step.querySelector('.bcs-step-art')){
      const art=document.createElement('div');
      art.className='bcs-step-art';
      const img=document.createElement('img');
      img.src=stepImages[i].src;
      img.alt=stepImages[i].alt;
      img.loading='lazy';
      art.appendChild(img);
      step.insertBefore(art,step.firstChild);
    }
  });

  const quickNav=document.createElement('nav');
  quickNav.className='bcs-quick-nav';
  quickNav.setAttribute('aria-label','Quick page navigation');
  quickNav.innerHTML=`
    <a href="#cars" class="bcs-qn-cars"><span class="bcs-qn-icon">🚘</span><span class="bcs-qn-label">Cars</span></a>
    <a href="#how" class="bcs-qn-how"><span class="bcs-qn-icon">↕</span><span class="bcs-qn-label">How it works</span></a>`;
  document.body.appendChild(quickNav);

  const updateQuickNavLabels=()=>{
    const fr=document.documentElement.lang==='fr' || (typeof lang!=='undefined' && lang==='fr');
    const cars=quickNav.querySelector('.bcs-qn-cars .bcs-qn-label');
    const how=quickNav.querySelector('.bcs-qn-how .bcs-qn-label');
    if(cars) cars.textContent=fr?'Voitures':'Cars';
    if(how) how.textContent=fr?'Étapes':'How it works';
  };
  updateQuickNavLabels();
  const langSelect=document.querySelector('#languageSelect');
  if(langSelect) langSelect.addEventListener('change',()=>setTimeout(updateQuickNavLabels,0));

  const toggleQuickNav=()=>{
    const threshold=Math.max(420,window.innerHeight*.65);
    quickNav.classList.toggle('show',window.scrollY>threshold);
  };
  window.addEventListener('scroll',toggleQuickNav,{passive:true});
  toggleQuickNav();

  const footer=document.querySelector('footer .container');
  if(footer && !footer.querySelector('.bcs-footer-brand')){
    const block=document.createElement('div');block.className='bcs-footer-brand';
    block.innerHTML=`<img class="bcs-footer-logo" src="${LOGO}" alt="BEST CARS STARS"><div><div style="color:#fff;font-size:18px;font-weight:850">BEST CAR STAR</div><div style="color:#64748b;font-size:12px;margin-top:4px">Korean Vehicle Sourcing · Incheon, South Korea</div></div>`;
    footer.insertBefore(block,footer.firstChild);
  }
})();