-- Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate function with better error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  provider text;
begin
  -- Get the provider from metadata
  provider := coalesce(new.app_metadata->>'provider', 'email');

  -- Log the incoming data for debugging
  raise notice 'Creating new user: ID=%, Email=%, Provider=%', new.id, new.email, provider;

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
    'user'::user_role,
    'pending_verification'::user_status,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'image'),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'signupIp', null,
      'lastPasswordChange', null,
      'failedLoginAttempts', 0,
      'lastFailedLogin', null
    ),
    case 
      when provider = 'google' then 
        jsonb_build_object(
          'google', jsonb_build_object(
            'id', new.id,
            'email', new.email,
            'lastLogin', now(),
            'isConfigured', true
          )
        )
      else 
        jsonb_build_object(
          'email', jsonb_build_object(
            'lastLogin', now()
          )
        )
    end
  );

  return new;
exception
  when others then
    raise notice 'Error creating user: %', SQLERRM;
    return new;
end;
$$;

-- Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 