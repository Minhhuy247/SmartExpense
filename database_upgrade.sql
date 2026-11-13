alter table public.transactions add column if not exists automation_processed_at timestamptz;
create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(15,2) not null check (amount > 0),
  day_of_month integer not null check (day_of_month between 1 and 28),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alert_near boolean not null default true,
  alert_exceeded boolean not null default true,
  alert_percent integer not null default 80 check (alert_percent between 1 and 100),
  monthly_summary boolean not null default false
);

alter table public.budgets add column if not exists note text;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('info', 'warning', 'success', 'custom'));

alter table public.recurring_rules enable row level security;
alter table public.user_preferences enable row level security;

revoke all on public.recurring_rules, public.user_preferences from anon, authenticated;
grant select, insert, update, delete on public.recurring_rules, public.user_preferences to authenticated;

drop policy if exists "Read own recurring rules" on public.recurring_rules;
create policy "Read own recurring rules" on public.recurring_rules for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own recurring rules" on public.recurring_rules;
create policy "Insert own recurring rules" on public.recurring_rules for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own recurring rules" on public.recurring_rules;
create policy "Update own recurring rules" on public.recurring_rules for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own recurring rules" on public.recurring_rules;
create policy "Delete own recurring rules" on public.recurring_rules for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Read own preferences" on public.user_preferences;
create policy "Read own preferences" on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own preferences" on public.user_preferences;
create policy "Insert own preferences" on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own preferences" on public.user_preferences;
create policy "Update own preferences" on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own preferences" on public.user_preferences;
create policy "Delete own preferences" on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists recurring_rules_user_idx on public.recurring_rules(user_id);
