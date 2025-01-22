// types/blog.ts

// Types de base
export type Language = 'fr' | 'en';

export interface LocalizedString {
  fr: string;
  en?: string;
}

export type BlogStatus = 'draft' | 'published' | 'archived';

// Types pour les images
export interface BlogImage {
  url: string | null;
  alt: string | null;
}

// Types SEO
export interface BlogSEO {
  title: LocalizedString;
  description: LocalizedString;
  keywords: string[];
}

// Métadonnées
export interface BlogMetadata {
  readingTime: number;
  wordCount: number;
}

// Type pour les catégories
export interface BlogCategory {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  slug: string;
  parent_id: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Type principal pour les articles
export interface Blog {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  excerpt: LocalizedString;
  cover_image: {
    url: string;
    alt?: string;
  };
  author_id: string;
  author?: {
    name: string;
    email: string;
  };
  category_id: string;
  category?: BlogCategory;
  tags: string[];
  status: BlogStatus;
  is_featured: boolean;
  published_at: string | null;
  seo: BlogSEO;
  metadata: BlogMetadata;
  created_at: string;
  updated_at: string;
  slug: string;
}

// Type pour les versions
export interface BlogVersion {
  id: string;
  blog_id: string;
  version_data: {
    title: LocalizedString;
    content: LocalizedString;
    excerpt: LocalizedString;
    cover_image?: BlogImage;
    category: string;
    tags: string[];
    seo?: BlogSEO;
  };
  version_number: number;
  created_by: string;
  created_at: string;
}

// Type pour les vues
export interface BlogView {
  id: string;
  blog_id: string;
  view_count: number;
  last_viewed_at: string;
}

// Type pour les tâches programmées
export type BlogTaskType = 'publish' | 'unpublish' | 'process_images';
export type BlogTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BlogScheduledTask {
  id: string;
  blog_id: string;
  task_type: BlogTaskType;
  scheduled_for: string;
  status: BlogTaskStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Types pour les réponses API
export interface BlogListResponse {
  data: Blog[];
  count: number;
}

export interface BlogResponse {
  data: Blog | null;
  error: string | null;
}

// Types pour les filtres
export interface BlogFilters {
  status?: BlogStatus;
  category_id: string;
  tag?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateBlogInput {
  title: Record<string, string>;
  content: Record<string, string>;
  excerpt: Record<string, string>;
  coverImage?: string;
  author: string;
  category_id: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  seo?: {
    title?: Record<string, string>;
    description?: Record<string, string>;
    keywords?: string[];
  };
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {
  id: string;
}

// Types pour le tri
export type BlogSortField = 'created_at' | 'updated_at' | 'published_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface BlogSortOptions {
  field: BlogSortField;
  order: SortOrder;
}