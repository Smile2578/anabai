-- Créer l'utilisateur admin dans auth.users si nécessaire
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sbelissa@gmail.com',
    crypt('votre_mot_de_passe', gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO UPDATE
SET 
    email_confirmed_at = now(),
    raw_user_meta_data = '{"role": "admin"}'::jsonb,
    updated_at = now();

-- Attendre que le trigger crée l'entrée dans public.users
SELECT pg_sleep(1);

-- Mettre à jour le rôle et le statut dans public.users
UPDATE public.users
SET 
    role = 'admin'::user_role,
    status = 'active'::user_status
WHERE email = 'sbelissa@gmail.com'; 