'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/types/blog';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Props {
  id: string;
}

export default function EditBlogPostClient({ id }: Props) {
  const router = useRouter();
  const { user } = useSupabase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tinyMCEKey, setTinyMCEKey] = useState<string>('');
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('🔍 Fetching post with ID:', id);
        
        const response = await fetch(`/api/admin/blog/get/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement de l\'article');
        }

        console.log('✅ Article chargé avec succès:', data);
        setPost(data);
      } catch (error) {
        console.error('❌ Error in fetchPost:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'article. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, toast]);

  useEffect(() => {
    setIsLoadingEditor(true);
    fetch('/api/admin/tinymce')
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) {
          setTinyMCEKey(data.apiKey);
        } else if (data.error) {
          throw new Error(data.error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;

    try {
      setIsSubmitting(true);

      // Calculer le nombre de mots et le temps de lecture
      const wordCount = post.content.fr.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute en moyenne

      // Mettre à jour l'article via l'API
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          metadata: {
            ...post.metadata,
            wordCount,
            readingTime,
          },
          updated_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      toast({
        title: 'Article mis à jour',
        description: 'L\'article a été enregistré avec succès.',
      });

      router.push('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !post) return;
    
    const file = e.target.files[0];

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/blog/${id}/cover`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'image');
      }

      setPost({
        ...post,
        cover_image: {
          url: data.url,
          alt: file.name.split('.')[0],
        },
      });

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

  const renderEditor = (lang: 'fr' | 'en') => {
    if (isLoadingEditor || !post) {
      return (
        <div className="flex items-center justify-center h-[500px] border rounded-md">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!tinyMCEKey) {
      return (
        <div className="flex items-center justify-center h-[500px] border rounded-md">
          <p className="text-destructive">Erreur de chargement de l&apos;éditeur</p>
        </div>
      );
    }

    return (
      <Editor
        apiKey={tinyMCEKey}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 
            'image', 'link', 'lists', 'media', 'searchreplace', 
            'table', 'visualblocks', 'wordcount', 'fullscreen',
            'advlist', 'preview', 'help', 'code'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | ' +
            'link image media table | align lineheight | numlist bullist indent outdent | ' +
            'emoticons charmap | removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          images_upload_url: '/api/admin/blog/upload',
          images_upload_credentials: true,
          images_reuse_filename: true,
          automatic_uploads: true,
          image_title: true,
          image_description: true,
          image_caption: true,
          image_dimensions: true,
          image_class_list: [
            { title: 'Responsive', value: 'img-fluid' },
            { title: 'Pleine largeur', value: 'img-fluid w-full' },
            { title: 'Aligné à gauche', value: 'img-fluid float-left mr-4' },
            { title: 'Aligné à droite', value: 'img-fluid float-right ml-4' }
          ],
          images_upload_handler: (blobInfo) => new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());

            fetch('/api/admin/blog/upload', {
              method: 'POST',
              body: formData
            })
              .then(response => response.json())
              .then(result => {
                if (result.error) {
                  reject({ message: result.error, remove: true });
                } else {
                  resolve(result.location);
                }
              })
              .catch(error => {
                console.error('Erreur lors de l\'upload de l\'image:', error);
                reject({ message: 'Erreur lors de l\'upload de l\'image', remove: true });
              });
          })
        }}
        value={post.content[lang] || ''}
        onEditorChange={(content) => {
          setPost({
            ...post,
            content: {
              ...post.content,
              [lang]: content
            }
          });
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Modifier l&apos;article</h1>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              type="button"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="cover">Image de couverture</Label>
            <div className="mt-2">
              {post.cover_image?.url ? (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={post.cover_image.url}
                    alt={post.cover_image.alt || ''}
                    className="object-cover"
                    fill
                  />
                </div>
              ) : (
                <label
                  htmlFor="cover"
                  className="flex justify-center items-center h-48 w-full border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
                >
                  <div className="space-y-2 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Cliquez pour ajouter une image
                    </div>
                  </div>
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageUpload}
                  />
                </label>
              )}
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
                  value={post.title.fr}
                  onChange={(e) => setPost({
                    ...post,
                    title: { ...post.title, fr: e.target.value }
                  })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="excerpt-fr">Extrait</Label>
                <Input
                  id="excerpt-fr"
                  value={post.excerpt.fr}
                  onChange={(e) => setPost({
                    ...post,
                    excerpt: { ...post.excerpt, fr: e.target.value }
                  })}
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
                  value={post.title.en}
                  onChange={(e) => setPost({
                    ...post,
                    title: { ...post.title, en: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="excerpt-en">Excerpt</Label>
                <Input
                  id="excerpt-en"
                  value={post.excerpt.en}
                  onChange={(e) => setPost({
                    ...post,
                    excerpt: { ...post.excerpt, en: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Content</Label>
                {renderEditor('en')}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </div>
  );
} 