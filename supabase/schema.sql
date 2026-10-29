create table if not exists public.wishes (
  id text primary key default gen_random_uuid()::text,
  author text not null check (char_length(btrim(author)) between 1 and 60),
  message text not null check (char_length(btrim(message)) between 1 and 280),
  flower_id text not null check (flower_id in (
    'daisy',
    'tulip',
    'cherry',
    'sunflower',
    'rose',
    'hibiscus',
    'blossom',
    'lotus',
    'lavender',
    'rose-bouquet'
  )),
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

drop policy if exists "Anyone can read wishes" on public.wishes;
create policy "Anyone can read wishes"
  on public.wishes for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can submit wishes" on public.wishes;
create policy "Anyone can submit wishes"
  on public.wishes for insert
  to anon, authenticated
  with check (true);

grant select, insert on table public.wishes to anon, authenticated;
revoke update, delete on table public.wishes from anon, authenticated;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'wishes'
  ) then
    alter publication supabase_realtime add table public.wishes;
  end if;
end
$$;
