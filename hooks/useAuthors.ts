// hooks/useAuthors.ts
import { useQuery } from '@tanstack/react-query';

interface Author {
  id: string;
  name: string;
  role: 'admin' | 'editor';
  email: string;
}

async function fetchAuthors(): Promise<Author[]> {
  const response = await fetch('/api/admin/authors', {
    credentials: 'include', // Ajout des credentials
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch authors');
  }
  return response.json();
}

export function useAuthors() {
  const { data: authors, isLoading, error } = useQuery<Author[], Error>({
    queryKey: ['authors'],
    queryFn: fetchAuthors,
    staleTime: 5 * 60 * 1000,
  });

  return {
    authors: authors || [],
    isLoading,
    error
  };
}

// hooks/usePlaceAuthors.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface AddAuthorParams {
  placeId: string;
  authorId: string;
}

export function usePlaceAuthors() {
  const addAuthor = useMutation({
    mutationFn: async ({ placeId, authorId }: AddAuthorParams) => {
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        credentials: 'include', // Ajout des credentials
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId, authorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add author');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        description: "Auteur ajouté avec succès",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'auteur",
      });
    },
  });

  return {
    addAuthor: addAuthor.mutate,
    isAdding: addAuthor.isPending,
  };
}