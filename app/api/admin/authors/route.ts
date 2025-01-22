// app/api/admin/authors/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier le rôle de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !['admin', 'editor'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    console.log('👤 [API/Authors] GET request by:', {
      user: user.email,
      role: userData.role
    });

    // Récupérer les auteurs (admin et editor)
    const { data: authors, error: authorsError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('role', ['admin', 'editor']);

    if (authorsError) {
      throw authorsError;
    }

    return NextResponse.json(authors);
    
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des auteurs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier le rôle de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !['admin', 'editor'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    console.log('👤 [API/Authors] POST request by:', {
      user: user.email,
      role: userData.role
    });

    const { placeId, authorId } = await req.json();

    if (!placeId || !authorId) {
      return NextResponse.json(
        { error: 'Place ID et Author ID sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'auteur existe et a le bon rôle
    const { data: author, error: authorError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', authorId)
      .in('role', ['admin', 'editor'])
      .single();

    if (authorError || !author) {
      return NextResponse.json(
        { error: 'Auteur non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Ajouter l'auteur au lieu
    const newAuthor = {
      id: author.id,
      name: author.name,
      role: author.role,
      addedAt: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('places')
      .update({
        authors: `array_append(authors, '${JSON.stringify(newAuthor)}'::jsonb)`
      })
      .eq('id', placeId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(author);
    
  } catch (error) {
    console.error('Error adding author:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'auteur" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier le rôle de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !['admin', 'editor'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    console.log('👤 [API/Authors] PATCH request by:', {
      user: user.email,
      role: userData.role
    });

    const { placeId, authors } = await req.json();

    if (!placeId || !authors) {
      return NextResponse.json(
        { error: 'Place ID et authors sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que tous les auteurs existent et ont les bons rôles
    const authorIds = authors.map((a: { id: string }) => a.id);
    const { data: validAuthors, error: authorsError } = await supabase
      .from('users')
      .select('id, name, role')
      .in('id', authorIds)
      .in('role', ['admin', 'editor']);

    if (authorsError || !validAuthors || validAuthors.length !== authors.length) {
      return NextResponse.json(
        { error: 'Certains auteurs sont invalides ou non autorisés' },
        { status: 400 }
      );
    }

    // Mettre à jour les auteurs du lieu
    const { data: updatedPlace, error: updateError } = await supabase
      .from('places')
      .update({
        authors: authors.map((author: { id: string; name: string; role: string }) => ({
          id: author.id,
          name: author.name,
          role: author.role,
          addedAt: new Date().toISOString()
        }))
      })
      .eq('id', placeId)
      .select('authors')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      authors: updatedPlace?.authors || []
    });

  } catch (error) {
    console.error('Error updating authors:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des auteurs" },
      { status: 500 }
    );
  }
}