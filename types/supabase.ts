import { User } from '@supabase/supabase-js';

export interface SupabaseUser extends User {
  ban_duration?: string;
  user_metadata: {
    name?: string;
    role?: string;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          title: { fr: string; en: string };
          content: { fr: string; en: string };
          excerpt: { fr: string; en: string };
          slug: string;
          cover_image: { url: string; alt: string } | null;
          author_id: string;
          category_id: string;
          tags: string[];
          status: 'draft' | 'published' | 'archived';
          is_featured: boolean;
          seo: {
            title: { fr: string; en: string };
            description: { fr: string; en: string };
          };
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
      };
      blog_categories: {
        Row: {
          id: string;
          name: { fr: string; en: string };
          description: { fr: string; en: string };
          slug: string;
          parent_id: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'editor' | 'user';
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
} 