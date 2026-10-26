# BEST CAR STAR auction client portal

Only `/auction/` is changed. Direct-purchase files at the repository root are independent.

## Build

Run `npm ci` and `npm run build` in this directory. Commit the bundled `portal.js` and `catalog.js` alongside source and lockfile. GitHub Pages serves these files directly. The public Supabase key is intentionally browser-visible; authorization is enforced by database RLS. Never add service-role keys here.

## Routes

- `/auction/`: public demo catalog and authenticated demo pre-bids.
- `/auction/login/`: registration, login, confirmation landing and password recovery.
- `/auction/account/`: own bids, edits until the database deadline, logout.

## Required Supabase email setup

Project: `wicormiabeufioouzwoa`.

In Authentication → URL Configuration, set Site URL to `https://bestcar146-afk.github.io/auction/login/` and add these exact redirect URLs:

- `https://bestcar146-afk.github.io/auction/login/`
- `https://bestcar146-afk.github.io/auction/login/?mode=recovery`

Keep email confirmations enabled. Configure custom SMTP under Authentication → Emails to deliver signup and recovery emails to clients outside the Supabase organization. Default SMTP only delivers to authorized team addresses. Do not add clients as Supabase organization members to work around this restriction.

The connector does not expose SMTP/auth URL configuration. These settings need an authenticated dashboard session. Browser forms and bid persistence can be tested with disposable confirmed QA accounts without sending email. Actual email delivery still needs separate verification after SMTP/redirect setup.

## Demo state and security

Nine explicitly marked demo vehicle records have a fixed testing deadline of November 30, 2026, 23:59 Korea time. The server owns minimum bids and closing times. A page reload never extends them. Demo bids are practice only and do not authorize purchases. Do not change `is_demo` to false without first completing real auction integration and customer terms.

Profiles are initialized from registration metadata after login. Metadata is never used to grant admin access. Clients can select only their own bids (administrators may read all); insert/update access remains ownership- and deadline-limited by RLS. No public admin enrollment exists. No admin client account has been designated yet.

Registration does not auto-submit pending bids: the client returns to the selected vehicle, reviews their restored amount, and clicks Save Demo Pre-Bid.
