import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';

interface MongoFilter {
  status: string;
  $or?: Array<{
    [key: `${string}.fr`]: {
      $regex: string;
      $options: string;
    }
  }>;
  tags?: {
    $all: string[];
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const tags = searchParams.getAll('tags[]');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Construire la requête MongoDB
    const filter: MongoFilter = { status: 'published' };

    // Recherche textuelle
    if (query) {
      filter.$or = [
        { 'title.fr': { $regex: query, $options: 'i' } },
        { 'excerpt.fr': { $regex: query, $options: 'i' } },
        { 'content.fr': { $regex: query, $options: 'i' } },
      ];
    }

    // Filtrage par tags
    if (tags.length > 0) {
      filter.tags = { $all: tags };
    }

    // Exécuter la requête
    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BlogPost.countDocuments(filter)
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche des articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche des articles' },
      { status: 500 }
    );
  }
}