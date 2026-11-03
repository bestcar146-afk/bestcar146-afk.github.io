window.BCSListing={isOpen(c){const end=Date.parse(c.close);return Number.isFinite(end)&&end>Date.now()&&(!c.bidStatus||c.bidStatus==='open');}};
