-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    name,
    role,
    status,
    image,
    created_at,
    updated_at,
    last_login,
    metadata,
    providers
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')::user_role,
    coalesce(new.raw_user_meta_data->>'status', 'pending_verification')::user_status,
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now(),
    now(),
    jsonb_build_object(
      'signupIp', new.raw_user_meta_data->>'signupIp',
      'lastPasswordChange', null,
      'failedLoginAttempts', 0,
      'lastFailedLogin', null
    ),
    jsonb_build_object(
      new.app_metadata->>'provider', jsonb_build_object(
        'id', new.id,
        'email', new.email,
        'lastLogin', now(),
        'isConfigured', true
      )
    )
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 