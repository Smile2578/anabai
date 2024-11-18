// lib/services/imageCache.ts

import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class ImageCacheService {
  private cacheDir: string;
  
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'public', 'cache', 'images');
  }

  getCachePath(url: string): string {
    const cacheKey = this.generateCacheKey(url);
    const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `${cacheKey}.${extension}`;
    return path.join(this.cacheDir, filename);
  }

  private async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private generateCacheKey(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async cacheImage(url: string): Promise<string> {
    try {
      await this.ensureCacheDir();

      const cacheKey = this.generateCacheKey(url);
      const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
      const filename = `${cacheKey}.${extension}`;
      const cachePath = path.join(this.cacheDir, filename);
      const publicPath = `/cache/images/${filename}`;

      try {
        // Vérifier si l'image existe déjà en cache
        await fs.access(cachePath);
        console.log(`Image already cached: ${publicPath}`);
        return publicPath;
      } catch {
        // L'image n'existe pas en cache, il faut la télécharger
        const imageData = await this.downloadImage(url);
        await fs.writeFile(cachePath, imageData);
        console.log(`Image cached: ${publicPath}`);
        return publicPath;
      }
    } catch (error) {
      console.error('Error caching image:', error);
      // En cas d'erreur, retourner l'URL originale
      return url;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.ensureCacheDir();
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getCacheSize(): Promise<{ files: number; size: number }> {
    try {
      await this.ensureCacheDir();
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;

      await Promise.all(
        files.map(async file => {
          const stats = await fs.stat(path.join(this.cacheDir, file));
          totalSize += stats.size;
        })
      );

      return {
        files: files.length,
        size: totalSize
      }; 
    } catch (error) {
      console.error('Error getting cache size:', error);
      return { files: 0, size: 0 };
    }
  }
}