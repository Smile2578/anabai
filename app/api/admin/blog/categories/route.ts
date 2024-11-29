import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogCategory from '@/models/blog-category.model';
import connectDB from '@/lib/db/connection';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();
    const categories = await BlogCategory.getTree();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/admin/blog/categories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    const category = new BlogCategory(data);
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/blog/categories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 