-- Apply after foundation, only in the separate Obtura project.
-- Every business row carries organization_id; composite keys prevent cross-studio references.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);
create index clients_organization_created_idx on public.clients(organization_id, created_at desc);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid,
  title text not null check (char_length(trim(title)) between 2 and 160),
  status text not null default 'DRAFT' check (status in ('DRAFT','BOOKED','IN_PROGRESS','READY','DELIVERED','ARCHIVED')),
  description text,
  event_date timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id)
);
create index projects_organization_created_idx on public.projects(organization_id, created_at desc);
create index projects_organization_client_idx on public.projects(organization_id, client_id);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid,
  title text not null check (char_length(trim(title)) between 2 and 160),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'PENDING' check (status in ('PENDING','CONFIRMED','CANCELLED')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (organization_id, project_id) references public.projects(organization_id, id)
);
create index bookings_organization_start_idx on public.bookings(organization_id, starts_at);

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid,
  title text not null check (char_length(trim(title)) between 2 and 160),
  status text not null default 'DRAFT' check (status in ('DRAFT','READY','DELIVERED','ARCHIVED')),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id)
);
create index galleries_organization_created_idx on public.galleries(organization_id, created_at desc);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gallery_id uuid not null,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, storage_path),
  foreign key (organization_id, gallery_id) references public.galleries(organization_id, id) on delete cascade,
  check (storage_path like organization_id::text || '/%')
);
create index gallery_items_organization_gallery_idx on public.gallery_items(organization_id, gallery_id, display_order);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.bookings enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_items enable row level security;

-- No anonymous access. Members can read only their own studio's rows.
create policy clients_member_select on public.clients for select to authenticated
  using (public.is_organization_member(organization_id));
create policy projects_member_select on public.projects for select to authenticated
  using (public.is_organization_member(organization_id));
create policy bookings_member_select on public.bookings for select to authenticated
  using (public.is_organization_member(organization_id));
create policy galleries_member_select on public.galleries for select to authenticated
  using (public.is_organization_member(organization_id));
create policy gallery_items_member_select on public.gallery_items for select to authenticated
  using (public.is_organization_member(organization_id));

-- Only active production roles may add or change business data.
create policy clients_editor_insert on public.clients for insert to authenticated
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy clients_editor_update on public.clients for update to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy projects_editor_insert on public.projects for insert to authenticated
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy projects_editor_update on public.projects for update to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy bookings_editor_insert on public.bookings for insert to authenticated
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy bookings_editor_update on public.bookings for update to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy galleries_editor_insert on public.galleries for insert to authenticated
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy galleries_editor_update on public.galleries for update to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy gallery_items_editor_insert on public.gallery_items for insert to authenticated
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));
create policy gallery_items_editor_update on public.gallery_items for update to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']))
  with check (public.has_organization_role(organization_id, array['OWNER','ADMIN','MANAGER','CREATIVE']));

-- Destructive actions are reserved for studio owners/admins.
create policy clients_admin_delete on public.clients for delete to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN']));
create policy projects_admin_delete on public.projects for delete to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN']));
create policy bookings_admin_delete on public.bookings for delete to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN']));
create policy galleries_admin_delete on public.galleries for delete to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN']));
create policy gallery_items_admin_delete on public.gallery_items for delete to authenticated
  using (public.has_organization_role(organization_id, array['OWNER','ADMIN']));

revoke all on public.clients, public.projects, public.bookings, public.galleries, public.gallery_items from anon;
grant select, insert, update, delete on public.clients, public.projects, public.bookings, public.galleries, public.gallery_items to authenticated;

-- Public gallery links and facial search require a separate consent-aware delivery service.
-- They are intentionally NOT enabled by this migration.
