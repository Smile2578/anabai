'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, BlogPostSEO } from '@/types/blog';
import { useSession } from 'next-auth/react';
import { Loader2, ImageIcon } from 'lucide-react';
import useSWR from 'swr';
import Image from 'next/image';

type BlogPostForm = Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt'>;
type Params = Promise<{ id: string }>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditBlogPost(props: { params: Params }) {
  const params = use(props.params);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tinyMCEKey, setTinyMCEKey] = useState<string>('');
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);

  const { data: post, mutate } = useSWR<BlogPostForm>(
    `/api/admin/blog/${params.id}`,
    fetcher
  );

  useEffect(() => {
    setIsLoadingEditor(true);
    fetch('/api/admin/tinymce')
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) {
          setTinyMCEKey(data.apiKey);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération de la clé TinyMCE:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'éditeur de texte.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoadingEditor(false);
      });
  }, [toast]);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !post) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      await mutate({
        ...post,
        coverImage: {
          url: data.location,
          alt: file.name.split('.')[0],
        },
      }, false);

      toast({
        title: 'Image téléchargée',
        description: 'L\'image de couverture a été mise à jour.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger l\'image.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !post) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de l\'article');
      }

      toast({
        title: 'Article modifié',
        description: 'L\'article a été modifié avec succès.',
      });

      router.push('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la modification de l\'article.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = async (field: string, value: any) => {
    if (!post) return;
    await mutate({ ...post, [field]: value }, false);
  };

  const updateSEO = (data: Partial<BlogPostSEO>) => {
    if (!post) return;
    mutate({
      ...post,
      seo: {
        title: { fr: post.title.fr, en: post.title.en || '', ...post.seo?.title, ...data.title },
        description: { fr: post.excerpt.fr, en: post.excerpt.en || '', ...post.seo?.description, ...data.description },
        keywords: data.keywords || post.seo?.keywords || [],
      },
    });
  };

  const renderEditor = (lang: 'fr' | 'en') => (
    <Editor
      apiKey={tinyMCEKey}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
      }}
      value={post?.content?.[lang] || ''}
      onEditorChange={(content) => {
        updateField('content', { ...post?.content, [lang]: content });
      }}
    />
  );

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Modifier l'Article</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/blog/${params.id}/preview`)}
            disabled={isSubmitting}
          >
            Prévisualiser
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image de couverture */}
        <div className="space-y-4">
          <Label>Image de couverture</Label>
          <div className="flex items-center gap-4">
            {post.coverImage?.url ? (
              <div className="relative w-40 h-24">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ) : (
              <div className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="w-full"
              />
              <Input
                type="text"
                placeholder="Texte alternatif"
                value={post.coverImage?.alt || ''}
                onChange={(e) => updateField('coverImage', {
                  ...post.coverImage,
                  alt: e.target.value,
                })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="fr">
          <TabsList>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label htmlFor="title-fr">Titre</Label>
              <Input
                id="title-fr"
                value={post.title?.fr || ''}
                onChange={(e) => updateField('title', { ...post.title, fr: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt-fr">Extrait</Label>
              <Input
                id="excerpt-fr"
                value={post.excerpt?.fr || ''}
                onChange={(e) => updateField('excerpt', { ...post.excerpt, fr: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Contenu</Label>
              {renderEditor('fr')}
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <div>
              <Label htmlFor="title-en">Title</Label>
              <Input
                id="title-en"
                value={post.title?.en || ''}
                onChange={(e) => updateField('title', { ...post.title, en: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="excerpt-en">Excerpt</Label>
              <Input
                id="excerpt-en"
                value={post.excerpt?.en || ''}
                onChange={(e) => updateField('excerpt', { ...post.excerpt, en: e.target.value })}
              />
            </div>

            <div>
              <Label>Content</Label>
              {renderEditor('en')}
            </div>
          </TabsContent>
        </Tabs>

        {/* Métadonnées communes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={post.category}
              onChange={(e) => updateField('category', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={post.tags?.join(', ')}
              onChange={(e) => updateField('tags', e.target.value.split(',').map(tag => tag.trim()))}
            />
          </div>
        </div>

        {/* Section SEO */}
        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">SEO</h2>
          <Tabs defaultValue="fr">
            <TabsList>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr" className="space-y-4">
              <div>
                <Label htmlFor="seo-title-fr">Titre SEO</Label>
                <Input
                  id="seo-title-fr"
                  value={post.seo?.title?.fr || post.title?.fr || ''}
                  onChange={(e) => updateSEO({
                    title: {
                      fr: e.target.value,
                      en: post.seo?.title?.en || post.title?.en || '',
                    },
                  })}
                  placeholder={post.title?.fr}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommandé : 50-60 caractères
                </p>
              </div>

              <div>
                <Label htmlFor="seo-description-fr">Description SEO</Label>
                <textarea
                  id="seo-description-fr"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={post.seo?.description?.fr || post.excerpt?.fr || ''}
                  onChange={(e) => updateSEO({
                    description: {
                      fr: e.target.value,
                      en: post.seo?.description?.en || post.excerpt?.en || '',
                    },
                  })}
                  placeholder={post.excerpt?.fr}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommandé : 150-160 caractères
                </p>
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label htmlFor="seo-title-en">SEO Title</Label>
                <Input
                  id="seo-title-en"
                  value={post.seo?.title?.en || post.title?.en || ''}
                  onChange={(e) => updateSEO({
                    title: {
                      fr: post.seo?.title?.fr || post.title?.fr || '',
                      en: e.target.value,
                    },
                  })}
                  placeholder={post.title?.en}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seo-description-en">SEO Description</Label>
                <textarea
                  id="seo-description-en"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={post.seo?.description?.en || post.excerpt?.en || ''}
                  onChange={(e) => updateSEO({
                    description: {
                      fr: post.seo?.description?.fr || post.excerpt?.fr || '',
                      en: e.target.value,
                    },
                  })}
                  placeholder={post.excerpt?.en}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 150-160 characters
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="seo-keywords">Mots-clés SEO (séparés par des virgules)</Label>
            <Input
              id="seo-keywords"
              value={post.seo?.keywords?.join(', ') || ''}
              onChange={(e) => updateSEO({
                keywords: e.target.value.split(',').map(kw => kw.trim()),
              })}
              placeholder="exemple, mot-clé, référencement"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommandé : 5-10 mots-clés pertinents
            </p>
          </div>
        </div>
      </form>
    </div>
  );
} 