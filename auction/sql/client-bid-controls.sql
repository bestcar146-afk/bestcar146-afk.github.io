-- Applied to the hosted project on 2026-10-27.
-- Existing owner-only RLS checks enforce open auctions and server-side deadlines.
alter table public.bids add column if not exists status text not null default 'active'
  check (status in ('active','withdrawn'));
grant update(status) on public.bids to authenticated;
