-- Link2Posts database init script (Supabase / Postgres)
-- Run in Supabase SQL Editor

-- Optional: clear all objects in public schema (tables, indexes, sequences, functions).
do $$
declare
  r record;
begin
  for r in (select tablename from pg_tables where schemaname = 'public') loop
    execute format('drop table if exists public.%I cascade', r.tablename);
  end loop;

  for r in (select sequence_name from information_schema.sequences where sequence_schema = 'public') loop
    execute format('drop sequence if exists public.%I cascade', r.sequence_name);
  end loop;

  for r in (
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  ) loop
    execute format('drop function if exists %s cascade', r.signature);
  end loop;
end $$;

-- user_profiles: app-side profile fields
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  login_count int not null default 0,
  points_balance int not null default 0,
  points_earned_total int not null default 0,
  points_spent_total int not null default 0,
  referral_code text unique,
  inviter_id uuid references auth.users(id),
  meta jsonb
);

create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_last_login_idx on public.user_profiles (last_login_at);

-- credits_balance: current balance
create table if not exists public.credits_balance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0,
  updated_at timestamptz not null default now()
);

-- product_settings: pricing config
create table if not exists public.product_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.product_settings (key, value)
values
  ('credit_value_usd', '0.01'),
  ('credits_per_generation', '12')
on conflict (key) do update
  set value = excluded.value,
      updated_at = now();

-- credit_plans: packages
create table if not exists public.credit_plans (
  id text primary key,
  title text not null,
  price_cents int not null,
  currency text not null default 'USD',
  credits int not null,
  bonus int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.credit_plans (id, title, price_cents, currency, credits, bonus, is_active)
values
  ('lite', 'Lite', 1000, 'USD', 100, 0, true),
  ('value', 'Value', 5000, 'USD', 500, 25, true),
  ('pro', 'Pro', 10000, 'USD', 1000, 80, true)
on conflict (id) do update
  set title = excluded.title,
      price_cents = excluded.price_cents,
      currency = excluded.currency,
      credits = excluded.credits,
      bonus = excluded.bonus,
      is_active = excluded.is_active;

-- credits_ledger: audit log of credit changes
create table if not exists public.credits_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  change_amount int not null,
  reason text not null,
  related_payment_id bigint,
  related_job_id bigint,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists credits_ledger_user_idx on public.credits_ledger (user_id);
create index if not exists credits_ledger_created_idx on public.credits_ledger (created_at);

-- payments: payment records
create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'creem',
  provider_payment_id text not null,
  amount_cents int not null,
  currency text not null default 'USD',
  status text not null,
  credits_granted int not null default 0,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payments_provider_id_idx
  on public.payments (provider, provider_payment_id);
create index if not exists payments_user_idx on public.payments (user_id);

-- generation_jobs: generation requests
create table if not exists public.generation_jobs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  youtube_url text,
  video_id text,
  output_language text,
  tone text,
  audience text,
  thread_count int,
  singles_count int,
  title_candidates int,
  cta text,
  credits_spent int not null default 0,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists generation_jobs_user_idx on public.generation_jobs (user_id);
create index if not exists generation_jobs_status_idx on public.generation_jobs (status);

-- generation_job_items: generated outputs
create table if not exists public.generation_job_items (
  id bigserial primary key,
  job_id bigint not null references public.generation_jobs(id) on delete cascade,
  item_type text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists generation_job_items_job_idx on public.generation_job_items (job_id);

-- new user trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    full_name,
    avatar_url,
    provider,
    created_at,
    last_login_at,
    login_count,
    points_balance,
    points_earned_total,
    points_spent_total
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider',
    now(),
    now(),
    1,
    0,
    0,
    0
  )
  on conflict (user_id) do nothing;

  insert into public.credits_balance (user_id, balance, updated_at)
  values (new.id, 12, now())
  on conflict (user_id) do nothing;

  insert into public.credits_ledger (user_id, change_amount, reason, note)
  values (new.id, 12, 'signup', 'signup bonus')
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies
alter table public.user_profiles enable row level security;
alter table public.credits_balance enable row level security;
alter table public.credits_ledger enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generation_job_items enable row level security;
alter table public.payments enable row level security;
alter table public.product_settings enable row level security;
alter table public.credit_plans enable row level security;

drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists credits_balance_select_own on public.credits_balance;
create policy credits_balance_select_own
on public.credits_balance
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists credits_ledger_select_own on public.credits_ledger;
create policy credits_ledger_select_own
on public.credits_ledger
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists generation_jobs_select_own on public.generation_jobs;
create policy generation_jobs_select_own
on public.generation_jobs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists generation_job_items_select_own on public.generation_job_items;
create policy generation_job_items_select_own
on public.generation_job_items
for select
to authenticated
using (
  exists (
    select 1
    from public.generation_jobs
    where generation_jobs.id = generation_job_items.job_id
      and generation_jobs.user_id = auth.uid()
  )
);

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists product_settings_select_all on public.product_settings;
create policy product_settings_select_all
on public.product_settings
for select
to anon, authenticated
using (true);

drop policy if exists credit_plans_select_all on public.credit_plans;
create policy credit_plans_select_all
on public.credit_plans
for select
to anon, authenticated
using (true);


-- Grant privileges to authenticated role
grant usage on schema public to authenticated;

grant select on table
  public.credits_balance,
  public.credits_ledger,
  public.generation_jobs,
  public.generation_job_items,
  public.user_profiles,
  public.payments,
  public.product_settings,
  public.credit_plans
to authenticated;

-- 如果你允许未登录读取公开配置
grant select on table
  public.product_settings,
  public.credit_plans
to anon;