// components/admin/places/form/AuthorsSection.tsx
import { User, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuthors } from '@/hooks/useAuthors';
import { usePlaceAuthors } from '@/hooks/usePlaceAuthors';

// Utiliser l'interface PlaceMetadata
interface PlaceAuthor {
  id: string;
  name: string;
  role: 'admin' | 'editor';
  addedAt: Date;
}

interface AuthorsSectionProps {
  placeId: string;
  authors: PlaceAuthor[];
  onAuthorsChange: (authors: PlaceAuthor[]) => void;
  disabled?: boolean;
}

export function AuthorsSection({ 
  placeId,
  authors, 
  onAuthorsChange,
  disabled 
}: AuthorsSectionProps) {
  const { authors: availableAuthors, isLoading: isLoadingAuthors } = useAuthors();
  const { addAuthor, isAdding } = usePlaceAuthors();
  

  const handleAddAuthor = async (authorId: string) => {
    if (!authorId) return;

    try {
       addAuthor({ 
        placeId, 
        authorId, 
      });

      const author = availableAuthors.find(a => a.id === authorId);
      if (author) {
        const newAuthor: PlaceAuthor = {
          id: author.id,
          name: author.name,
          role: author.role,
          addedAt: new Date()
        };
        onAuthorsChange([...authors, newAuthor]);
      }
    } catch (error) {
      console.error('Error adding author:', error);
    }
  };

  const handleRemoveAuthor = (authorId: string) => {
    onAuthorsChange(authors.filter(a => a.id !== authorId));
  };

  if (isLoadingAuthors) {
    return <div>Chargement des auteurs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <h3 className="font-medium">Auteurs</h3>
      </div>

      <div className="flex items-center gap-2">
        <Select
          onValueChange={handleAddAuthor}
          disabled={disabled || isAdding}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ajouter un auteur" />
          </SelectTrigger>
          <SelectContent>
            {availableAuthors
              .filter(author => !authors.find(a => a.id === author.id))
              .map(author => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name} ({author.role})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[100px]">
        <div className="flex flex-wrap gap-2">
          {authors.map((author) => (
            <Badge
              key={author.id}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {author.name}
              <span className="text-xs text-muted-foreground">
                ({author.role})
              </span>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveAuthor(author.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}