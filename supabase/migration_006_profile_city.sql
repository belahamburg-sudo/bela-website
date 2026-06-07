alter table public.profiles
  add column if not exists city text;

create index if not exists profiles_city_idx
  on public.profiles (lower(city))
  where city is not null and city <> '';
