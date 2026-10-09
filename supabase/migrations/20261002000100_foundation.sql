-- Obtura 2.0 foundation. Apply ONLY to a new Obtura Supabase project.
-- Never apply this migration to the GRS Vision database.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 80),
  country_code text not null default 'GN',
  currency_code text not null default 'GNF',
  locale text not null default 'fr',
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('OWNER','ADMIN','MANAGER','CREATIVE','VIEWER')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INVITED','SUSPENDED')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index memberships_user_id_idx on public.memberships(user_id);

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships
    where organization_id = p_organization_id
      and user_id = (select auth.uid())
      and status = 'ACTIVE'
  );
$$;
revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.is_organization_member(uuid) from anon;
grant execute on function public.is_organization_member(uuid) to authenticated;

create or replace function public.has_organization_role(p_organization_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships
    where organization_id = p_organization_id
      and user_id = (select auth.uid())
      and status = 'ACTIVE'
      and role = any(p_roles)
  );
$$;
revoke all on function public.has_organization_role(uuid, text[]) from public;
revoke all on function public.has_organization_role(uuid, text[]) from anon;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;

create or replace function public.create_studio(p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_studio_id uuid := gen_random_uuid();
  v_name text := trim(p_name);
  v_slug text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if v_name is null or char_length(v_name) not between 2 and 80 then
    raise exception 'Studio name must contain 2 to 80 characters';
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'));
  if v_slug = '' then v_slug := 'studio'; end if;
  v_slug := left(v_slug, 45) || '-' || left(replace(v_studio_id::text, '-', ''), 8);
  insert into public.organizations(id, slug, name) values (v_studio_id, v_slug, v_name);
  insert into public.memberships(organization_id, user_id, role)
    values (v_studio_id, v_user_id, 'OWNER');
  return v_studio_id;
end;
$$;
revoke all on function public.create_studio(text) from public;
revoke all on function public.create_studio(text) from anon;
grant execute on function public.create_studio(text) to authenticated;

create or replace function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy organizations_member_select on public.organizations for select to authenticated
  using (public.is_organization_member(id));
create policy organizations_owner_update on public.organizations for update to authenticated
  using (public.has_organization_role(id, array['OWNER']))
  with check (public.has_organization_role(id, array['OWNER']));
create policy memberships_member_select on public.memberships for select to authenticated
  using (public.is_organization_member(organization_id));

-- No browser-side inserts/updates/deletes on memberships or organizations.
-- The create_studio RPC is the only studio creation path in this phase.
insert into storage.buckets(id, name, public, file_size_limit)
  values ('obtura-private', 'obtura-private', false, 104857600)
  on conflict (id) do update set public = false;

-- Studio media remain private; gallery delivery will use a server-side, short-lived URL.
create policy obtura_private_member_select on storage.objects for select to authenticated
  using (bucket_id = 'obtura-private'
    and public.is_organization_member((split_part(name, '/', 1))::uuid));
create policy obtura_private_member_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'obtura-private'
    and public.has_organization_role((split_part(name, '/', 1))::uuid, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy obtura_private_member_update on storage.objects for update to authenticated
  using (bucket_id = 'obtura-private'
    and public.has_organization_role((split_part(name, '/', 1))::uuid, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (bucket_id = 'obtura-private'
    and public.has_organization_role((split_part(name, '/', 1))::uuid, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy obtura_private_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'obtura-private'
    and public.has_organization_role((split_part(name, '/', 1))::uuid, array['OWNER','ADMIN']));
