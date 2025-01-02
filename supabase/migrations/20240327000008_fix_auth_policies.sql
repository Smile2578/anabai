-- Désactiver temporairement RLS pour la mise à jour initiale
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.users;

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre l'insertion lors de l'authentification
CREATE POLICY "Permettre l'insertion via auth" ON public.users
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Créer une politique pour la lecture
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'::user_role
        )
    );

-- Créer une politique pour la mise à jour
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Créer une politique pour les administrateurs
CREATE POLICY "Les administrateurs ont un accès complet" ON public.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'::user_role
        )
    );

-- S'assurer que l'administrateur a les bonnes permissions
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'name', split_part(email, '@', 1)
)
WHERE email = 'sbelissa@gmail.com';

-- Mettre à jour le statut et le rôle de l'administrateur
UPDATE public.users
SET 
    role = 'admin'::user_role,
    status = 'active'::user_status
WHERE email = 'sbelissa@gmail.com'; 