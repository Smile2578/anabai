// components/admin/places/form/ImagesSection.tsx
import { useState } from 'react';
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { X, Upload, Star, StarOff } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PlaceImage } from '@/types/places/base';

import Image from 'next/image';

interface ImagesSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

export const ImagesSection = ({ data, onChange, isSubmitting }: ImagesSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Fonction pour gérer l'upload des images
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      // Simulé pour l'instant - à remplacer par votre logique d'upload
      const newImages: PlaceImage[] = await Promise.all(
        files.map(async (file, index) => ({
          url: URL.createObjectURL(file),
          source: 'upload',
          isCover: data.images.length === 0 && index === 0, // Premier upload = cover
          name: `img_${(data.images.length + index + 1).toString().padStart(2, '0')}`,
          caption: {
            fr: file.name,
            ja: file.name
          }
        }))
      );

      onChange({
        images: [...data.images, ...newImages]
      });

      toast({
        title: "Images ajoutées",
        description: `${files.length} image(s) ajoutée(s) avec succès.`
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les images.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Configuration de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isSubmitting || uploading,
    onDrop: handleUpload
  });

  // Gestion du drag & drop pour réorganiser
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
  
    const items = Array.from(data.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    onChange({ images: items });
  };

  // Gestion de la suppression
  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    onChange({ images: newImages });
  };

  // Gestion de l'image de couverture
  const handleSetCover = (index: number) => {
    const newImages = data.images.map((img, i) => ({
      ...img,
      isCover: i === index
    }));
    onChange({ images: newImages });
  };

  // Mise à jour des légendes
  const handleCaptionChange = (index: number, lang: 'fr' | 'ja', value: string) => {
    const newImages = [...data.images];
    newImages[index] = {
      ...newImages[index],
      caption: {
        ...newImages[index].caption,
        [lang]: value
      }
    };
    onChange({ images: newImages });
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">
            Images
          </CardTitle>
          <Badge variant="outline">
            {data.images.length} image(s)
          </Badge>
        </div>
        <CardDescription>
          Gérez les images du lieu. La première image sera utilisée comme couverture.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zone de drop */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isSubmitting || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive
              ? "Déposez les images ici..."
              : "Glissez-déposez des images ou cliquez pour sélectionner"
            }
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            PNG, JPG ou WEBP jusqu&apos;à 10MB
          </p>
        </div>

        {/* Liste des images */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images">
            {(provided) => (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {data.images.map((image, index) => (
                    <Draggable
                      key={image.name || ''}
                      draggableId={image.name || ''}
                      index={index}
                      isDragDisabled={isSubmitting}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                        >
                          {/* Prévisualisation */}
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={image.url}
                              alt={image.caption?.fr || ''}
                              className="w-full h-full object-cover rounded-md"
                              width={96}
                              height={96}
                            />
                            {image.isCover && (
                              <Badge className="absolute -top-2 -right-2 bg-accent">
                                Cover
                              </Badge>
                            )}
                          </div>

                          {/* Informations */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>Légende FR</Label>
                              <Input
                                value={image.caption?.fr || ''}
                                onChange={(e) => handleCaptionChange(index, 'fr', e.target.value)}
                                placeholder="Légende en français"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label>Légende JA</Label>
                              <Input
                                value={image.caption?.ja || ''}
                                onChange={(e) => handleCaptionChange(index, 'ja', e.target.value)}
                                placeholder="キャプション"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetCover(index)}
                              disabled={isSubmitting || image.isCover}
                              title={image.isCover ? "Image de couverture" : "Définir comme couverture"}
                            >
                              {image.isCover ? <Star className="text-accent" /> : <StarOff />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveImage(index)}
                              disabled={isSubmitting}
                              className="text-destructive hover:text-destructive"
                            >
                              <X />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};