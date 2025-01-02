-- Mise à jour de la fonction handle_new_user pour gérer le statut correctement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        status,
        role,
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::user_status
            ELSE 'pending_verification'::user_status
        END,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'user'::user_role
        ),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        status = CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::user_status
            ELSE 'pending_verification'::user_status
        END,
        role = COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            users.role
        ),
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajout d'une politique pour les administrateurs
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.users;
CREATE POLICY "Les administrateurs peuvent tout voir"
    ON public.users FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'::user_role
        )
    );

-- Mise à jour des utilisateurs existants
UPDATE public.users
SET status = 'active'::user_status
FROM auth.users
WHERE public.users.id = auth.users.id
AND auth.users.email_confirmed_at IS NOT NULL;

-- Mise à jour des métadonnées pour l'administrateur
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'sbelissa@gmail.com';

-- S'assurer que l'administrateur a le bon rôle dans la table users
UPDATE public.users
SET role = 'admin'::user_role,
    status = 'active'::user_status
WHERE email = 'sbelissa@gmail.com'; 