'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Blog, BlogCategory } from '@/types/blog';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';


type BlogForm = Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'author_id'>;

export default function CreateBlogPost() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tinyMCEKey, setTinyMCEKey] = useState<string>('');
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [post, setPost] = useState<BlogForm>({
    title: { fr: '' },
    content: { fr: '' },
    excerpt: { fr: '' },
    category_id: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    metadata: {
      readingTime: 0,
      wordCount: 0
    },
    seo: {
      title: { fr: '' },
      description: { fr: '' },
      keywords: [],
    },
    cover_image: {
      url: '',
      alt: '',
    },
    slug: '',
  });

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

  useEffect(() => {
    const loadCategories = async () => {
      const { data: categories, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name->fr');

      if (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les catégories',
          variant: 'destructive',
        });
        return;
      }

      setCategories(categories || []);
    };

    loadCategories();
  }, [supabase, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer un article',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Log pour debug
      console.log('User data:', {
        id: user.id,
        role: user.user_metadata?.role,
        email: user.email
      });

      // Calculer le nombre de mots et le temps de lecture
      const wordCount = post.content.fr.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute en moyenne

      // S'assurer que le slug est correctement généré
      const slug = generateSlug(post.title.fr);

      // Mettre à jour l'état avec le nouveau slug
      const updatedPost = {
        ...post,
        metadata: {
          wordCount,
          readingTime
        },
        slug
      };

      // Création de l'article avec les informations de l'utilisateur
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          ...updatedPost,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Détails de l\'erreur:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Erreur lors de la création de l'article: ${error.message}`);
      }

      if (data) {
        console.log('Article créé avec succès:', data);
      }

      toast({
        title: 'Succès',
        description: 'L\'article a été créé avec succès',
      });

      router.push('/admin/blog');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'article',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
  
      setPost(prev => ({
        ...prev,
        cover_image: {
          url: data.location,
          alt: file.name.split('.')[0],
        },
      }));
  
      toast({
        title: 'Image téléchargée',
        description: 'L\'image de couverture a été mise à jour.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de télécharger l\'image.',
        variant: 'destructive',
      });
    }
  };

  const renderEditor = (lang: 'fr' | 'en') => {
    if (isLoadingEditor) {
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
          
          // Configuration de l'upload d'images
          images_upload_url: '/api/admin/blog/upload',
          images_upload_credentials: true,
          images_reuse_filename: true,
          automatic_uploads: true,
          
          // Personnalisation de la boîte de dialogue d'image
          image_title: true,
          image_description: true,
          image_caption: true,
          image_dimensions: true,
          
          // Tailles d'images prédéfinies
          image_class_list: [
            { title: 'Responsive', value: 'img-fluid' },
            { title: 'Pleine largeur', value: 'img-fluid w-full' },
            { title: 'Aligné à gauche', value: 'img-fluid float-left mr-4' },
            { title: 'Aligné à droite', value: 'img-fluid float-right ml-4' }
          ],
          
          // Message personnalisé pendant l'upload
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
        value={post.content?.[lang] || ''}
        onEditorChange={(content) => {
          const newContent = { ...post.content, [lang]: content };
          setPost(prev => ({ ...prev, content: newContent }));
        }}
      />
    );
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD') // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Nouvel Article</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
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
            {post.cover_image?.url ? (
              <div className="relative w-40 h-24">
                <Image
                  src={post.cover_image.url}
                  alt={post.cover_image.alt || ''}
                  fill
                  className="w-full h-full object-cover rounded-md"
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
                value={post.cover_image?.alt || ''}
                onChange={(e) => setPost({
                  ...post,
                  cover_image: {
                    ...post.cover_image,
                    alt: e.target.value,
                  },
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
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newSlug = generateSlug(newTitle);
                  setPost({
                    ...post,
                    title: { ...post.title, fr: newTitle },
                    slug: newSlug,
                  });
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt-fr">Extrait</Label>
              <Input
                id="excerpt-fr"
                value={post.excerpt?.fr || ''}
                onChange={(e) => setPost({
                  ...post,
                  excerpt: { ...post.excerpt, fr: e.target.value },
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
                value={post.title?.en || ''}
                onChange={(e) => {
                  const newTitle = { ...post.title, en: e.target.value };
                  setPost(prev => ({ ...prev, title: newTitle }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="excerpt-en">Excerpt</Label>
              <Input
                id="excerpt-en"
                value={post.excerpt?.en || ''}
                onChange={(e) => {
                  const newExcerpt = { ...post.excerpt, en: e.target.value };
                  setPost(prev => ({ ...prev, excerpt: newExcerpt }));
                }}
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
            <select
              id="category"
              value={post.category_id}
              onChange={(e) => setPost(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.fr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={post.tags?.join(', ')}
              onChange={(e) => setPost(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()),
              }))}
            />
          </div>
        </div>
      </form>
    </div>
  );
} 