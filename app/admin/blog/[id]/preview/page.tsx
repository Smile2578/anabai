import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';
import Image from 'next/image';
interface Props {
  params: {
    id: string;
  };
}

export default async function BlogPostPreview({ params }: Props) {
  const session = await auth();
  
  if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
    notFound();
  }

  await connectDB();
  const post = await BlogPost.findById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de prévisualisation */}
      <div className="sticky top-0 z-50 bg-blue-600 text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-medium">Mode Prévisualisation</span>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Statut : <span className="font-medium">{post.status}</span>
            </span>
            <a
              href={`/admin/blog/${params.id}/edit`}
              className="px-4 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Retour à l&apos;édition
            </a>
          </div>
        </div>
      </div>

      {/* Contenu de l'article */}
      <article className="container mx-auto py-10 px-4 bg-white shadow-sm mt-4 rounded-lg">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title.fr}</h1>
          <div className="flex items-center text-gray-600 mb-6">
            <span>{post.author.name}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt ? format(post.publishedAt, 'dd MMMM yyyy', { locale: fr }) : 'Non publié'}
            </time>
          </div>
          {post.coverImage?.url && (
            <div className="aspect-video relative mb-8">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt}
                fill
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.fr }}
        />

        <footer className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>

        {/* Informations SEO */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Informations SEO</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Titre SEO</h3>
              <p className="mt-1 p-2 bg-gray-50 rounded">
                {post.seo?.title?.fr || post.title.fr}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Description SEO</h3>
              <p className="mt-1 p-2 bg-gray-50 rounded">
                {post.seo?.description?.fr || post.excerpt.fr}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Mots-clés</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {post.seo?.keywords?.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
} 