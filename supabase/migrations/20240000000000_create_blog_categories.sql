-- Create blog_categories table
create table if not exists public.blog_categories (
  id uuid default gen_random_uuid() primary key,
  name_fr text not null,
  name_en text,
  description_fr text,
  description_en text,
  slug text not null unique,
  parent_id uuid references public.blog_categories(id),
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.blog_categories enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.blog_categories
  for select using (true);

create policy "Enable insert for authenticated users only" on public.blog_categories
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.blog_categories
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.blog_categories
  for delete using (auth.role() = 'authenticated');

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_blog_categories_updated_at
  before update on public.blog_categories
  for each row
  execute function public.handle_updated_at();

-- Insert some default categories
insert into public.blog_categories (name_fr, name_en, description_fr, description_en, slug, order_index)
values 
  ('Culture', 'Culture', 'Découvrez la culture japonaise', 'Discover Japanese culture', 'culture', 1),
  ('Voyage', 'Travel', 'Conseils et guides de voyage', 'Travel tips and guides', 'voyage', 2),
  ('Gastronomie', 'Food', 'La cuisine japonaise', 'Japanese cuisine', 'gastronomie', 3),
  ('Traditions', 'Traditions', 'Les traditions japonaises', 'Japanese traditions', 'traditions', 4),
  ('Langue', 'Language', 'Apprendre le japonais', 'Learn Japanese', 'langue', 5); 