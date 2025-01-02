-- Désactiver RLS temporairement
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Permettre l'authentification" ON public.users;
DROP POLICY IF EXISTS "Les administrateurs ont un accès complet" ON public.users;

-- Nettoyer les tables
TRUNCATE public.users CASCADE;

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour l'authentification
CREATE POLICY "Authentification de base"
    ON public.users
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Mettre à jour la fonction handle_new_user pour être plus permissive
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'user'::user_role
        ),
        CASE
            WHEN NEW.email = 'sbelissa@gmail.com' THEN 'active'::user_status
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::user_status
            ELSE 'pending_verification'::user_status
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 