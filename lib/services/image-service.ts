// lib/services/image-service.ts

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class ImageService {
  private readonly cacheDir: string;
  
  constructor() {
    // Le dossier de cache sera dans public/cache
    this.cacheDir = path.join(process.cwd(), 'public', 'cache');
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private generateCacheKey(url: string): string {
    // Création d'un nom de fichier unique basé sur l'URL
    const hash = Buffer.from(url).toString('base64url');
    return `${hash}.webp`;
  }

  async cacheImage(url: string): Promise<string> {
    try {
      const cacheKey = this.generateCacheKey(url);
      const cachePath = path.join(this.cacheDir, cacheKey);

      // Vérifier si l'image est déjà en cache
      try {
        await fs.access(cachePath);
        return `/cache/${cacheKey}`; // Retourne l'URL relative
      } catch {
        // L'image n'est pas en cache
      }

      // Télécharger l'image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const buffer = await response.arrayBuffer();

      // Optimiser et sauvegarder l'image
      await sharp(Buffer.from(buffer))
        .webp({ quality: 80 }) // Conversion en WebP avec compression
        .resize(800, 800, { // Redimensionnement max
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(cachePath);

      return `/cache/${cacheKey}`;
    } catch (error) {
      console.error('Error caching image:', error);
      return url; // En cas d'erreur, retourner l'URL originale
    }
  }

  async getPlaceImages(imageUrls: string[]): Promise<string[]> {
    try {
      // Limite à 3 images
      const limitedUrls = imageUrls.slice(0, 3);
      
      // Mettre en cache toutes les images
      const cachedUrls = await Promise.all(
        limitedUrls.map(url => this.cacheImage(url))
      );

      return cachedUrls;
    } catch (error) {
      console.error('Error processing place images:', error);
      return imageUrls.slice(0, 3); // Retourner les URLs originales en cas d'erreur
    }
  }
}

export const imageService = new ImageService();