-- ════════════════════════════════════════════════════════════════════════════
-- Alphapine & Aromatics — CMS schema for Supabase
-- Run once in Supabase → SQL Editor (then run seed.sql to load current content).
-- Safe to re-run: every statement is idempotent.
--
--   products      catalogue + product pages      public reads published rows
--   faqs          FAQ section                    public reads published rows
--   site_content  section copy & form settings   public read
--   leads         every form submission          public can only INSERT; admins manage
--   admins        who may use /admin             admins only
--   admin_settings deploy hook, last publish     admins only
-- ════════════════════════════════════════════════════════════════════════════

-- ── admins ──────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- true when the signed-in user is listed in public.admins
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── updated_at helper ───────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$ begin new.updated_at := now(); return new; end $$;

-- ── products ────────────────────────────────────────────────────────────────
-- `data` holds one product object with exactly the shape of src/data/products.mjs.
create table if not exists public.products (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  published  boolean not null default true,
  data       jsonb   not null check (jsonb_typeof(data) = 'object' and data->>'slug' = slug),
  updated_at timestamptz not null default now()
);
create index if not exists products_order_idx on public.products (sort_order);

-- ── faqs ────────────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id         bigint generated always as identity primary key,
  question   text not null check (char_length(question) between 1 and 500),
  answer     text not null check (char_length(answer) between 1 and 5000),
  sort_order integer not null default 0,
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists faqs_order_idx on public.faqs (sort_order);

-- ── site_content ────────────────────────────────────────────────────────────
-- keys: catalogue, faq_section, quote_form, contact_form, tds_form, forms_common
create table if not exists public.site_content (
  key        text primary key check (key ~ '^[a-z_]+$'),
  value      jsonb not null check (jsonb_typeof(value) = 'object'),
  updated_at timestamptz not null default now()
);

-- ── leads (form submissions) ────────────────────────────────────────────────
create table if not exists public.leads (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  form         text not null check (form in ('quote', 'contact', 'tds-msds')),
  name         text not null check (char_length(name) between 1 and 200),
  email        text not null check (char_length(email) between 3 and 320 and email like '%_@_%'),
  company      text check (char_length(company) <= 200),
  phone        text check (char_length(phone) <= 60),
  country      text check (char_length(country) <= 100),
  inquiry_type text check (char_length(inquiry_type) <= 100),
  product      text check (char_length(product) <= 200),
  grade        text check (char_length(grade) <= 200),
  qty          text check (char_length(qty) <= 100),
  document     text check (char_length(document) <= 40),
  message      text check (char_length(message) <= 5000),
  page         text check (char_length(page) <= 300),
  consent      boolean,
  -- admin-only fields (the public cannot set these: see column grants below)
  status       text not null default 'new' check (status in ('new', 'in_progress', 'responded', 'closed', 'spam')),
  notes        text check (char_length(notes) <= 10000),
  updated_at   timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx  on public.leads (status);
create index if not exists leads_form_idx    on public.leads (form);

-- ── admin_settings ──────────────────────────────────────────────────────────
-- keys: deploy_hook_url (Vercel Deploy Hook), last_published_at
create table if not exists public.admin_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ── updated_at triggers ─────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['products', 'faqs', 'site_content', 'leads', 'admin_settings'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ════════════════════════════ access rules (RLS) ════════════════════════════
alter table public.admins         enable row level security;
alter table public.products       enable row level security;
alter table public.faqs           enable row level security;
alter table public.site_content   enable row level security;
alter table public.leads          enable row level security;
alter table public.admin_settings enable row level security;

-- table privileges: RLS below decides which rows
revoke all on public.admins, public.products, public.faqs, public.site_content, public.leads, public.admin_settings from anon, authenticated;
grant select on public.products, public.faqs, public.site_content to anon, authenticated;
grant insert, update, delete on public.products, public.faqs, public.site_content to authenticated;
grant select, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.admin_settings to authenticated;
grant select on public.admins to authenticated;
-- the public may insert leads, and only into these columns (never status / notes / id)
grant insert (form, name, email, company, phone, country, inquiry_type, product, grade, qty, document, message, page, consent)
  on public.leads to anon, authenticated;

-- products / faqs: everyone reads published rows; admins read and write everything
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (published or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs for select using (published or public.is_admin());
drop policy if exists faqs_admin_write on public.faqs;
create policy faqs_admin_write on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_public_read on public.site_content;
create policy content_public_read on public.site_content for select using (true);
drop policy if exists content_admin_write on public.site_content;
create policy content_admin_write on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- leads: anyone can submit; only admins can read, update or delete
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads for insert to anon, authenticated with check (status = 'new' and notes is null);
drop policy if exists leads_admin_read on public.leads;
create policy leads_admin_read on public.leads for select to authenticated using (public.is_admin());
drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads for delete to authenticated using (public.is_admin());

-- admins / admin_settings: admins only
drop policy if exists admins_admin_read on public.admins;
create policy admins_admin_read on public.admins for select to authenticated using (public.is_admin());
drop policy if exists settings_admin_all on public.admin_settings;
create policy settings_admin_all on public.admin_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
