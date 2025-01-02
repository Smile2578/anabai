-- Désactiver temporairement RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Permettre l'insertion via auth" ON public.users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Les administrateurs ont un accès complet" ON public.users;

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'authentification
CREATE POLICY "Permettre l'authentification"
    ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Accorder les permissions nécessaires
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO anon;

-- Mettre à jour le trigger pour utiliser service_role
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;

-- Nettoyer et réinitialiser l'utilisateur admin
DELETE FROM public.users WHERE email = 'sbelissa@gmail.com';
DELETE FROM auth.users WHERE email = 'sbelissa@gmail.com';

-- Réinitialiser les séquences si nécessaire
ALTER SEQUENCE IF EXISTS public.users_id_seq RESTART WITH 1;

-- S'assurer que la table users accepte les nouvelles insertions
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ajouter un index sur l'email pour de meilleures performances
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Mettre à jour la configuration de la table
ALTER TABLE public.users SET (autovacuum_analyze_threshold = 50);
ALTER TABLE public.users SET (autovacuum_vacuum_threshold = 50); 