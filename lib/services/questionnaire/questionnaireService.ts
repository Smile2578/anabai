import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { 
  QuestionnaireData, 
  BasicInfo, 
  TravelStyle, 
  Interests, 
  Budget, 
  Constraints,
  BudgetPriority,
  BudgetType,
  Language,
  QuestionnaireStatus
} from '@/types/questionnaire/questionnaire';

type DbQuestionnaire = Database['public']['Tables']['questionnaires']['Row'];
type DbMetadata = {
  duration?: number;
  totalTravelers?: number;
  categories?: string[];
  hasSpecialNeeds?: boolean;
};

export class QuestionnaireService {
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
        throw error;
      }

      return data ? this.convertFromDbFormat(data) : null;
    } catch (error) {
      console.error('❌ [QuestionnaireService] Erreur:', error);
      throw error;
    }
  }

  async saveQuestionnaire(questionnaireData: QuestionnaireData): Promise<QuestionnaireData | null> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      const dataToSave = {
        ...this.convertToDbFormat(questionnaireData),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('questionnaires')
        .insert(dataToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data ? this.convertFromDbFormat(data) : null;
    } catch (error) {
      console.error('❌ [QuestionnaireService] Erreur:', error);
      throw error;
    }
  }

  private convertFromDbFormat(db: DbQuestionnaire): QuestionnaireData {
    const basicInfo: BasicInfo = {
      duration: db.duration || 0,
      dateRange: {
        from: new Date(db.date_range_from),
        to: new Date(db.date_range_to)
      },
      groupSize: db.group_size,
      previousVisit: db.previous_visit,
      visitCount: db.visit_count ?? undefined,
      groupType: db.group_type as BasicInfo['groupType'],
      hasChildren: db.has_children,
      childrenCount: db.children_count ?? undefined
    };

    const travelStyle: TravelStyle = {
      pace: db.pace as TravelStyle['pace'],
      comfort: db.comfort as TravelStyle['comfort'],
      flexibility: db.flexibility,
      culturalImmersion: db.cultural_immersion,
      preferences: db.preferences ?? []
    };

    const interests: Interests = {
      mainInterests: db.main_interests,
      specificInterests: db.specific_interests ? [...db.specific_interests] : undefined,
      categories: db.categories,
      mustSeeSpots: db.must_see_spots ? [...db.must_see_spots] : undefined
    };

    const budget: Budget = {
      total: db.total_budget,
      dailyLimit: db.daily_limit,
      priority: db.budget_priority as BudgetPriority
    };

    const constraints: Constraints = {
      mobility: db.mobility,
      language: db.language as Language,
      dietary: db.dietary ? [...db.dietary] : [],
      travelBudget: db.travel_budget as BudgetType,
      dailyBudget: db.daily_budget as BudgetType,
      budgetPriority: db.budget_priority as BudgetPriority
    };

    return {
      id: db.id,
      basicInfo,
      travelStyle,
      interests,
      budget,
      constraints,
      status: db.status as QuestionnaireStatus,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
      userId: db.user_id,
      metadata: (db.metadata || {}) as DbMetadata
    };
  }

  private convertToDbFormat(data: Partial<QuestionnaireData>): Partial<DbQuestionnaire> {
    if (!data.basicInfo) return {};

    return {
      duration: data.basicInfo.duration,
      date_range_from: data.basicInfo.dateRange.from.toISOString(),
      date_range_to: data.basicInfo.dateRange.to.toISOString(),
      group_size: data.basicInfo.groupSize,
      previous_visit: data.basicInfo.previousVisit,
      visit_count: data.basicInfo.visitCount ?? null,
      group_type: data.basicInfo.groupType,
      has_children: data.basicInfo.hasChildren,
      children_count: data.basicInfo.childrenCount ?? null,
      
      pace: data.travelStyle?.pace,
      comfort: data.travelStyle?.comfort,
      flexibility: data.travelStyle?.flexibility,
      cultural_immersion: data.travelStyle?.culturalImmersion,
      preferences: data.travelStyle?.preferences ?? [],
      
      main_interests: data.interests?.mainInterests ?? [],
      specific_interests: data.interests?.specificInterests ?? null,
      categories: data.interests?.categories ?? [],
      must_see_spots: data.interests?.mustSeeSpots ?? null,
      
      total_budget: data.budget?.total,
      daily_limit: data.budget?.dailyLimit,
      budget_priority: data.budget?.priority,
      
      mobility: data.constraints?.mobility,
      language: data.constraints?.language,
      dietary: data.constraints?.dietary ?? [],
      travel_budget: data.constraints?.travelBudget,
      daily_budget: data.constraints?.dailyBudget,
      
      status: data.status,
      metadata: data.metadata || {}
    };
  }
} 