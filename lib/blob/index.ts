import { put } from '@vercel/blob';
import { PlaceImage } from '@/types/places/base';

export interface UploadImageResponse {
  success: boolean;
  image?: PlaceImage;
  error?: string;
}

export async function uploadImage(file: File, caption?: string): Promise<UploadImageResponse> {
  try {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Le fichier doit être une image'
      };
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'La taille de l\'image ne doit pas dépasser 10MB'
      };
    }

    // Upload vers Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Créer l'objet PlaceImage
    const image: PlaceImage = {
      url: blob.url,
      source: 'vercel_blob',
      isCover: false, // Par défaut, sera modifiable plus tard
      name: file.name,
      blobId: blob.url.split('/').pop() || '',
      blobUrl: blob.url,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      caption: {
        fr: caption || ''
      }
    };

    return {
      success: true,
      image
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'upload de l\'image'
    };
  }
} 