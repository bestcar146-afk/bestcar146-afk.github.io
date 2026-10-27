# Auction countdowns (checked 2026-10-27)

Each countdown uses vehicles.bidding_closes_at, synced to database time via auction_server_time(). Demo deadlines are test values, not a live auction-house feed. Existing demo deadlines were preserved. HD-DEMO-1001 was assigned a fixed deadline 48 hours after creation. A page refresh does not extend it.

Public source findings:
- K Car: absentee bids/changes until noon on auction day; live auction timing differs. https://www.kcarauction.com/m/kcar/intro/userguide.do
- Kolon/Autohub: advertised next auction 28 October at 13:00. This is a session start, not every lot's close. https://www.sellcarauction.co.kr/
- Autobell: notices include special schedules and night post-auction consultations. Exact listing/stage deadlines require the member listing. https://autobell.co.kr/autoAuction/auctionNotice
- Lotte: regular Monday auction starts at 13:00, not a universal closing time. https://www.lotteautoauction.net/hp/pub/sell/auc/selectPubSellAucInfo.do
- Hey Dealer: official article describes 48-hour quotes and requests before bidding ends. Actual listing deadline takes precedence over any generic duration. https://www.heydealer.com/blog/used-car-sell-with-remaining-loan

Before real use, obtain the deadline for the actual lot and bidding stage from the authorized source. Never infer individual closing times from weekly session start times. No live auction feeds are connected. Hey Dealer fees are unverified and explicitly excluded from the demo estimate.
