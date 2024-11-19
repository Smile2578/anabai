// lib/services/core/ImageService.ts
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { VALIDATION_RULES } from '@/lib/config/validation-rules';

export class ImageService {
  private cacheDir: string;
  
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'public', 'cache', 'images');
  }

  private async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private generateCacheKey(url: string): string {
    return createHash('md5').update(url).digest('hex').slice(0, 10);
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async validateImage(
    file: Buffer, 
    options = { maxSize: VALIDATION_RULES.images.maxSize }
  ): Promise<void> {
    if (file.length > options.maxSize) {
      throw new Error(`Image size exceeds maximum allowed (${options.maxSize} bytes)`);
    }
    
    // Ajoutez ici d'autres validations si nécessaire
    // Par exemple, vérification des dimensions, du format, etc.
  }

  async cacheImage(url: string): Promise<string> {
    await this.ensureCacheDir();

    const cacheKey = this.generateCacheKey(url);
    const extension = path.extname(url).split('?')[0] || '.jpg';
    const filename = `${cacheKey}${extension}`;
    const cachePath = path.join(this.cacheDir, filename);
    const publicPath = `/cache/images/${filename}`;

    try {
      // Vérifier si l'image existe déjà en cache
      await fs.access(cachePath);
      console.log(`Image already cached: ${publicPath}`);
      return publicPath;
    } catch {
      // L'image n'existe pas en cache, la télécharger
      const imageData = await this.downloadImage(url);
      await this.validateImage(imageData);
      await fs.writeFile(cachePath, imageData);
      console.log(`Image cached: ${publicPath}`);
      return publicPath;
    }
  }

  async clearCache(): Promise<void> {
    await this.ensureCacheDir();
    const files = await fs.readdir(this.cacheDir);
    await Promise.all(
      files.map(file => fs.unlink(path.join(this.cacheDir, file)))
    );
  }

  async getCacheSize(): Promise<{ files: number; size: number }> {
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
  }
}