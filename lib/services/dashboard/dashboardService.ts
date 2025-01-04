import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { QuestionnaireData } from '@/types/questionnaire/questionnaire';
import { DashboardStats } from '@/types/dashboard/stats';

export class DashboardService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getLatestQuestionnaire(): Promise<QuestionnaireData | null> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await this.supabase
        .from('questionnaires')
        .select()
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du questionnaire:', error);
        return null;
      }

      return data ? this.convertQuestionnaireFromDb(data) : null;
    } catch (error) {
      console.error('Erreur du service dashboard:', error);
      return null;
    }
  }

  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const questionnaire = await this.getLatestQuestionnaire();
      if (!questionnaire) {
        return null;
      }

      // Convertir le rythme et le confort selon les nouveaux types
      const convertPace = (pace: QuestionnaireData['travelStyle']['pace']): DashboardStats['preferences']['pace'] => {
        switch (pace) {
          case 'slow':
            return 'relaxed';
          case 'moderate':
            return 'moderate';
          case 'fast':
            return 'intensive';
          default:
            return 'moderate';
        }
      };

      const convertComfort = (comfort: QuestionnaireData['travelStyle']['comfort']): DashboardStats['preferences']['comfort'] => {
        switch (comfort) {
          case 'backpacker':
            return 'budget';
          case 'standard':
            return 'standard';
          case 'comfort':
          case 'luxury':
            return 'luxury';
          default:
            return 'standard';
        }
      };

      return {
        budget: {
          total: questionnaire.budget.total,
          dailyLimit: questionnaire.budget.dailyLimit,
          priority: questionnaire.budget.priority
        },
        duration: {
          days: questionnaire.basicInfo.duration,
          startDate: questionnaire.basicInfo.dateRange.from,
          endDate: questionnaire.basicInfo.dateRange.to
        },
        preferences: {
          groupType: questionnaire.basicInfo.groupType,
          groupSize: questionnaire.basicInfo.groupSize,
          pace: convertPace(questionnaire.travelStyle.pace),
          comfort: convertComfort(questionnaire.travelStyle.comfort),
          interests: questionnaire.interests.mainInterests
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  private convertQuestionnaireFromDb(data: Database['public']['Tables']['questionnaires']['Row']): QuestionnaireData {
    return {
      basicInfo: {
        duration: data.duration || 0,
        dateRange: {
          from: new Date(data.date_range_from),
          to: new Date(data.date_range_to)
        },
        groupSize: data.group_size || 1,
        previousVisit: data.previous_visit,
        visitCount: data.visit_count || undefined,
        groupType: data.group_type as QuestionnaireData['basicInfo']['groupType'],
        hasChildren: data.has_children,
        childrenCount: data.children_count || undefined
      },
      travelStyle: {
        pace: data.pace as QuestionnaireData['travelStyle']['pace'],
        comfort: data.comfort as QuestionnaireData['travelStyle']['comfort'],
        flexibility: data.flexibility || 0,
        culturalImmersion: data.cultural_immersion || 0,
        preferences: data.preferences || []
      },
      interests: {
        mainInterests: data.main_interests,
        specificInterests: data.specific_interests || [],
        categories: data.categories,
        mustSeeSpots: data.must_see_spots || []
      },
      budget: {
        total: data.total_budget || 0,
        dailyLimit: data.daily_limit || 0,
        priority: data.budget_priority as QuestionnaireData['budget']['priority']
      },
      constraints: {
        mobility: data.mobility,
        language: data.language as QuestionnaireData['constraints']['language'],
        dietary: data.dietary || [],
        travelBudget: data.travel_budget as QuestionnaireData['constraints']['travelBudget'],
        dailyBudget: data.daily_budget as QuestionnaireData['constraints']['dailyBudget'],
        budgetPriority: data.budget_priority as QuestionnaireData['constraints']['budgetPriority']
      },
      status: data.status as QuestionnaireData['status'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
} 