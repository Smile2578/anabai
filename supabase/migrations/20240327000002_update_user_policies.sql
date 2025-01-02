-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Users are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can update own record."
  on public.users for update
  using ( auth.uid() = id );

create policy "Service role can insert users."
  on public.users for insert
  with check ( auth.jwt()->>'role' = 'service_role' OR auth.uid() = id ); 