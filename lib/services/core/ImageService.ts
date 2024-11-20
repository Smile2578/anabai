// lib/services/core/ImageService.ts
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { VALIDATION_RULES } from '@/lib/config/validation-rules';

interface ImageDimensions {
 width: number;
 height: number;
}

interface ProcessedImage {
 buffer: Buffer;
 dimensions: ImageDimensions;
 format: string;
 size: number;
}


export class ImageService {
 private cacheDir: string;
 
 constructor() {
   this.cacheDir = path.join(process.cwd(), 'public', 'cache', 'images');
 }

 private async ensureCacheDir(): Promise<void> {
   try {
     await fs.access(this.cacheDir);
   } catch {
     await fs.mkdir(this.cacheDir, { recursive: true });
   }
 }

 private generateCacheKey(url: string): string {
   const hash = createHash('md5')
     .update(url)
     .digest('hex')
     .slice(0, 8);
   
   const timestamp = Date.now().toString(36).slice(-4);
   return `img_${hash}_${timestamp}`;
 }

 private async downloadImage(url: string): Promise<Buffer> {
   const response = await fetch(url);
   if (!response.ok) {
     throw new Error(`Failed to download image: ${response.statusText}`);
   }
   const arrayBuffer = await response.arrayBuffer();
   return Buffer.from(arrayBuffer);
 }

 private async processImage(buffer: Buffer): Promise<ProcessedImage> {
   const image = sharp(buffer);
   const metadata = await image.metadata();

   // Vérification du format
   if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
     throw new Error('Format image non supporté');
   }

   // Redimensionnement si nécessaire
   let processedImage = image;
   if (metadata.width && metadata.height) {
     const maxDimension = Math.max(metadata.width, metadata.height);
     if (maxDimension > VALIDATION_RULES.images.dimensions.minWidth) {
       processedImage = image.resize(
         VALIDATION_RULES.images.dimensions.minWidth,
         VALIDATION_RULES.images.dimensions.minHeight,
         {
           fit: 'inside',
           withoutEnlargement: true
         }
       );
     }
   }

   // Conversion en WebP pour optimisation
   const optimizedBuffer = await processedImage
     .webp({ quality: 80 })
     .toBuffer({ resolveWithObject: true });

   return {
     buffer: optimizedBuffer.data,
     dimensions: {
       width: optimizedBuffer.info.width,
       height: optimizedBuffer.info.height
     },
     format: 'webp',
     size: optimizedBuffer.data.length
   };
 }

 private async validateImage(
   processedImage: ProcessedImage,
   options = { maxSize: VALIDATION_RULES.images.maxSize }
 ): Promise<void> {
   const errors: string[] = [];

   // Vérification de la taille
   if (processedImage.size > options.maxSize) {
     errors.push(
       `Image size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
     );
   }

   // Vérification des dimensions minimales
   if (
     processedImage.dimensions.width < VALIDATION_RULES.images.dimensions.minWidth ||
     processedImage.dimensions.height < VALIDATION_RULES.images.dimensions.minHeight
   ) {
     errors.push(
       `Image dimensions too small (minimum ${VALIDATION_RULES.images.dimensions.minWidth}x${VALIDATION_RULES.images.dimensions.minHeight}px)`
     );
   }

   if (errors.length > 0) {
     throw new Error(errors.join(', '));
   }
 }
 
 async cachePrimaryImage(images: { url: string; isCover: boolean }[]): Promise<string> {
  await this.ensureCacheDir();

  if (images.length === 0) {
    console.warn('No images available, using placeholder.');
    return '/cache/images/placeholder.webp'; // Image par défaut
  }

  try {
    const coverImage = images.find(img => img.isCover) || images[0];
    const cachedPath = await this.cacheImage(coverImage.url);
    console.log(`Primary image cached at: ${cachedPath}`);
    return cachedPath;
  } catch (error) {
    console.error('Error caching primary image:', error);
    return '/cache/images/placeholder.webp'; // En cas d'erreur, utiliser un fallback
  }
}

 async cacheImage(url: string): Promise<string> {
   await this.ensureCacheDir();

   try {
     // Génération du nom de fichier
     const cacheKey = this.generateCacheKey(url);
     const filename = `${cacheKey}.webp`;
     const cachePath = path.join(this.cacheDir, filename);
     const publicPath = `/cache/images/${filename}`;

     // Vérifier si l'image existe déjà en cache
     try {
       await fs.access(cachePath);
       console.log(`Image already cached: ${publicPath}`);
       return publicPath;
     } catch {
       // L'image n'existe pas en cache, la traiter
       const imageBuffer = await this.downloadImage(url);
       const processedImage = await this.processImage(imageBuffer);
       
       await this.validateImage(processedImage);
       await fs.writeFile(cachePath, processedImage.buffer);
       
       console.log(`Image cached: ${publicPath}`);
       return publicPath;
     }
   } catch (error) {
     console.error('Error processing image:', error);
     throw error;
   }
 }

 async clearCache(olderThan?: Date): Promise<void> {
   await this.ensureCacheDir();
   const files = await fs.readdir(this.cacheDir);

   for (const file of files) {
     const filePath = path.join(this.cacheDir, file);
     try {
       const stats = await fs.stat(filePath);
       if (!olderThan || stats.mtime < olderThan) {
         await fs.unlink(filePath);
       }
     } catch (error) {
       console.error(`Error deleting file ${file}:`, error);
     }
   }
 }

 async getCacheStats(): Promise<{ 
   files: number; 
   totalSize: number;
   oldestFile?: Date;
   newestFile?: Date;
 }> {
   await this.ensureCacheDir();
   const files = await fs.readdir(this.cacheDir);
   let totalSize = 0;
   let oldestFile: Date | undefined;
   let newestFile: Date | undefined;

   for (const file of files) {
     const filePath = path.join(this.cacheDir, file);
     const stats = await fs.stat(filePath);
     
     totalSize += stats.size;
     
     if (!oldestFile || stats.mtime < oldestFile) {
       oldestFile = stats.mtime;
     }
     if (!newestFile || stats.mtime > newestFile) {
       newestFile = stats.mtime;
     }
   }

   return {
     files: files.length,
     totalSize,
     oldestFile,
     newestFile
   };
 }
}