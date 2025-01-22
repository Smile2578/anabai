// lib/actions/blog.actions.ts
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateBlogInput, UpdateBlogInput } from '@/types/blog';

export async function getBlogPosts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    throw error;
  }

  return data;
}

export async function getBlogPost(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_views (
        view_count
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    throw error;
  }

  return data;
}

export async function createBlogPost(input: CreateBlogInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    throw error;
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function updateBlogPost({ id, ...input }: UpdateBlogInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    throw error;
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    throw error;
  }

  revalidatePath('/blog');
}

export async function publishBlogPost(id: string, scheduledDate?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('publish_blog_post', {
    blog_id: id,
    scheduled_date: scheduledDate
  });

  if (error) {
    console.error('Erreur lors de la publication de l\'article:', error);
    throw error;
  }

  revalidatePath('/blog');
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }
  return data;
}

export async function archiveBlogPost(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'archivage de l\'article:', error);
    throw error;
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function getPublishedPosts(limit?: number) {
  const supabase = await createClient();
  
  let query = supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur lors de la récupération des articles publiés:', error);
    throw error;
  }

  return data;
}

export async function getPopularPosts(limit: number = 5) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_views (
        view_count
      )
    `)
    .eq('status', 'published')
    .order('blog_views(view_count)', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur lors de la récupération des articles populaires:', error);
    throw error;
  }

  return data;
}