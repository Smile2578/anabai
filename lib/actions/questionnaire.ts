import { createClient } from '@/lib/supabase/server';

export async function getQuestionnaire() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du questionnaire:', error);
      return null;
    }

    return questionnaire;
  } catch (error) {
    console.error('Erreur lors de la récupération du questionnaire:', error);
    return null;
  }
} 