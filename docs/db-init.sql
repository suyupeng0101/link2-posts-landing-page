-- Link2Posts 数据库初始化脚本（Supabase / Postgres）
-- 在 Supabase SQL Editor 中执行
-- 说明：
-- - auth.users 由 Supabase Auth 管理，本表通过 user_id 关联。
-- - 保持脚本幂等，允许重复执行。

-- 用户资料表：存放应用侧字段（不在 auth.users 中保存的字段）。
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text, -- 最近一次登录邮箱
  full_name text, -- 显示名称
  avatar_url text, -- 头像地址
  provider text, -- 登录渠道（google / github 等）
  created_at timestamptz not null default now(), -- 记录创建时间（首次登录）
  last_login_at timestamptz, -- 最近一次登录时间
  login_count int not null default 0, -- 登录次数统计

  points_balance int not null default 0, -- 当前积分余额（兼容字段）
  points_earned_total int not null default 0, -- 累计获得积分（兼容字段）
  points_spent_total int not null default 0, -- 累计消耗积分（兼容字段）

  referral_code text unique, -- 用户邀请码
  inviter_id uuid references auth.users(id), -- 邀请人用户 id（可为空）
  meta jsonb -- 预留扩展字段
);

-- 便于按邮箱和最近登录查询。
create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_last_login_idx on public.user_profiles (last_login_at);

-- 用户积分余额表（读取余额的主表）。
create table if not exists public.credits_balance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0, -- 当前可用积分
  updated_at timestamptz not null default now() -- 最近一次余额更新时间
);

-- 产品配置表：全局计价与扣费参数。
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

-- 充值套餐表：支持按量包配置与赠送额度。
create table if not exists public.credit_plans (
  id text primary key,
  title text not null,
  price_cents int not null, -- 以分为单位的美元金额
  currency text not null default 'USD',
  credits int not null, -- 基础积分
  bonus int not null default 0, -- 赠送积分
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.credit_plans (id, title, price_cents, currency, credits, bonus, is_active)
values
  ('lite', '轻量包', 1000, 'USD', 100, 0, true),
  ('value', '进阶包', 5000, 'USD', 500, 25, true),
  ('pro', '高频包', 10000, 'USD', 1000, 80, true)
on conflict (id) do update
  set title = excluded.title,
      price_cents = excluded.price_cents,
      currency = excluded.currency,
      credits = excluded.credits,
      bonus = excluded.bonus,
      is_active = excluded.is_active;

-- 积分流水表：记录每一次积分变更，用于审计与对账。
create table if not exists public.credits_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  change_amount int not null, -- 正数=增加，负数=扣减
  reason text not null, -- payment / generation / invite / admin / refund
  related_payment_id bigint, -- 关联支付记录（可为空）
  related_job_id bigint, -- 关联生成任务（可为空）
  note text, -- 备注（便于后台记录）
  created_at timestamptz not null default now() -- 记录时间
);

-- 常用查询：按用户与时间查询。
create index if not exists credits_ledger_user_idx on public.credits_ledger (user_id);
create index if not exists credits_ledger_created_idx on public.credits_ledger (created_at);

-- 支付记录表：记录 creem 支付信息（可扩展为其他支付渠道）。
create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'creem',
  provider_payment_id text not null, -- 支付平台订单/支付 id
  amount_cents int not null, -- 金额（最小货币单位）
  currency text not null default 'USD',
  status text not null, -- pending / succeeded / failed / refunded
  credits_granted int not null default 0, -- 本次支付发放的积分
  raw_payload jsonb, -- 原始回调 payload 便于排查
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 保障 webhook 幂等，支持用户支付记录查询。
create unique index if not exists payments_provider_id_idx
  on public.payments (provider, provider_payment_id);
create index if not exists payments_user_idx on public.payments (user_id);

-- 生成任务主表：每次生成请求一条记录。
create table if not exists public.generation_jobs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null, -- queued / running / succeeded / failed
  youtube_url text,
  video_id text,
  output_language text,
  tone text,
  audience text,
  thread_count int,
  singles_count int,
  title_candidates int,
  cta text,
  credits_spent int not null default 0, -- 本次任务扣减积分
  created_at timestamptz not null default now(),
  finished_at timestamptz -- 任务完成时间
);

-- 便于查询用户历史与任务状态。
create index if not exists generation_jobs_user_idx on public.generation_jobs (user_id);
create index if not exists generation_jobs_status_idx on public.generation_jobs (status);

-- 生成内容详情表：用于历史回看与复制。
create table if not exists public.generation_job_items (
  id bigserial primary key,
  job_id bigint not null references public.generation_jobs(id) on delete cascade,
  item_type text not null, -- x_thread / x_single / youtube_seo / raw_caption
  content jsonb not null, -- 结构化输出内容
  created_at timestamptz not null default now()
);

-- 按任务快速查询生成内容。
create index if not exists generation_job_items_job_idx on public.generation_job_items (job_id);

-- 新用户注册时自动创建 user_profiles + 初始积分。
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
