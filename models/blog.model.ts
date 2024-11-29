import mongoose, { Document, Model } from 'mongoose';
import { LocalizedString } from '@/types/common';

export interface BlogPost {
  _id: string;
  title: LocalizedString;
  slug: string;
  content: LocalizedString;
  excerpt: LocalizedString;
  coverImage?: {
    url: string;
    alt: string;
  };
  author: {
    id: string;
    name: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  seo?: {
    title: LocalizedString;
    description: LocalizedString;
    keywords: string[];
  };
  versions?: BlogPostVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostVersion {
  title: LocalizedString;
  content: LocalizedString;
  excerpt: LocalizedString;
  coverImage?: {
    url: string;
    alt: string;
  };
  category: string;
  tags: string[];
  seo?: {
    title: LocalizedString;
    description: LocalizedString;
    keywords: string[];
  };
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface BlogPostDocument extends Omit<BlogPost, '_id'>, Document {
  $skipVersioning?: boolean;
  restoreVersion(versionIndex: number): Promise<void>;
}

interface BlogPostModel extends Model<BlogPostDocument> {
  findBySlug(slug: string): Promise<BlogPostDocument | null>;
}

const blogPostSchema = new mongoose.Schema<BlogPostDocument>(
  {
    title: {
      fr: { type: String, required: true },
      en: { type: String },
    },
    slug: { type: String, required: true, unique: true },
    content: {
      fr: { type: String, required: true },
      en: { type: String },
    },
    excerpt: {
      fr: { type: String, required: true },
      en: { type: String },
    },
    coverImage: {
      url: { type: String },
      alt: { type: String },
    },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: { type: Date },
    seo: {
      title: {
        fr: { type: String },
        en: { type: String },
      },
      description: {
        fr: { type: String },
        en: { type: String },
      },
      keywords: [{ type: String }],
    },
    versions: [{
      title: {
        fr: { type: String, required: true },
        en: { type: String },
      },
      content: {
        fr: { type: String, required: true },
        en: { type: String },
      },
      excerpt: {
        fr: { type: String, required: true },
        en: { type: String },
      },
      coverImage: {
        url: { type: String },
        alt: { type: String },
      },
      category: { type: String, required: true },
      tags: [{ type: String }],
      seo: {
        title: {
          fr: { type: String },
          en: { type: String },
        },
        description: {
          fr: { type: String },
          en: { type: String },
        },
        keywords: [{ type: String }],
      },
      createdAt: { type: Date, default: Date.now },
      createdBy: {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Middleware pour générer le slug
blogPostSchema.pre('validate', function(this: BlogPostDocument, next) {
  if (this.isModified('title.fr') && this.title?.fr) {
    this.slug = this.title.fr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Middleware pour mettre à jour publishedAt lors de la publication
blogPostSchema.pre('save', function(this: BlogPostDocument, next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Middleware pour sauvegarder une version avant chaque modification
blogPostSchema.pre('save', function(this: BlogPostDocument, next) {
  if (!this.$skipVersioning && (
    this.isModified('title') || this.isModified('content') || this.isModified('excerpt') ||
    this.isModified('coverImage') || this.isModified('category') || this.isModified('tags') ||
    this.isModified('seo'))) {
    
    const version: BlogPostVersion = {
      title: this.title,
      content: this.content,
      excerpt: this.excerpt,
      coverImage: this.coverImage,
      category: this.category,
      tags: this.tags,
      seo: this.seo,
      createdAt: new Date(),
      createdBy: this.author,
    };

    if (!this.versions) {
      this.versions = [];
    }

    // Limiter à 10 versions maximum
    if (this.versions.length >= 10) {
      this.versions.shift(); // Supprimer la plus ancienne version
    }

    this.versions.push(version);
  }
  next();
});

// Méthode pour restaurer une version
blogPostSchema.methods.restoreVersion = async function(this: BlogPostDocument, versionIndex: number) {
  if (!this.versions || !this.versions[versionIndex]) {
    throw new Error('Version non trouvée');
  }

  const version = this.versions[versionIndex];
  
  this.title = version.title;
  this.content = version.content;
  this.excerpt = version.excerpt;
  this.coverImage = version.coverImage;
  this.category = version.category;
  this.tags = version.tags;
  this.seo = version.seo;

  // Sauvegarder sans créer une nouvelle version
  this.$skipVersioning = true;
  await this.save();
  this.$skipVersioning = false;
};

// Méthode statique pour trouver un article par son slug
blogPostSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

export default (mongoose.models.BlogPost as BlogPostModel) || 
  mongoose.model<BlogPostDocument, BlogPostModel>('BlogPost', blogPostSchema); 