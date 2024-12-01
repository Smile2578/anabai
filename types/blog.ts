import { LocalizedString } from './common';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPostImage {
  url?: string;
  alt: string;
}

export interface BlogPostAuthor {
  id: string;
  name: string;
}

export interface BlogPostSEO {
  title: LocalizedString;
  description: LocalizedString;
  keywords: string[];
}

export interface BlogPostVersion {
  title: LocalizedString;
  content: LocalizedString;
  excerpt: LocalizedString;
  coverImage?: BlogPostImage;
  category: string;
  tags: string[];
  seo?: BlogPostSEO;
  createdAt: Date;
  createdBy: BlogPostAuthor;
}

export interface BlogPost {
  _id: string;
  title: LocalizedString;
  slug: string;
  content: LocalizedString;
  excerpt: LocalizedString;
  coverImage?: BlogPostImage;
  author: BlogPostAuthor;
  category: string;
  tags: string[];
  status: BlogPostStatus;
  publishedAt?: Date;
  seo?: BlogPostSEO;
  versions?: BlogPostVersion[];
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  categories: string[];
  metadata: {
    readingTime: number;
    wordCount: number;
  };
}

// Types pour les formulaires et les requêtes
export interface CreateBlogPostData {
  title: LocalizedString;
  content: LocalizedString;
  excerpt: LocalizedString;
  coverImage?: BlogPostImage;
  category: string;
  tags: string[];
  seo?: BlogPostSEO;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  status?: BlogPostStatus;
}

// Types pour les réponses API
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

export interface BlogPostResponse {
  post: BlogPost;
}

// Types pour les filtres de recherche
export interface BlogPostFilters {
  status?: BlogPostStatus;
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

// Types pour le tri
export type BlogPostSortField = 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface BlogPostSortOptions {
  field: BlogPostSortField;
  order: SortOrder;
}

// Types pour la pagination
export interface BlogPostPaginationOptions {
  page: number;
  limit: number;
}

export type BlogPostPreview = Pick<BlogPost, '_id' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'author' | 'category' | 'publishedAt' | 'status'>; 