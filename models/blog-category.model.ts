import mongoose, { Document, Model } from 'mongoose';
import { LocalizedString } from '@/types/common';

export interface BlogCategory {
  _id: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  parent?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  children?: BlogCategory[];
}

export interface BlogCategoryDocument extends Omit<BlogCategory, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  toObject(): BlogCategory;
}

interface BlogCategoryModel extends Model<BlogCategoryDocument> {
  getTree(): Promise<BlogCategory[]>;
}

const blogCategorySchema = new mongoose.Schema<BlogCategoryDocument>(
  {
    name: {
      fr: { type: String, required: true },
      en: { type: String },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      fr: { type: String },
      en: { type: String },
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Middleware pour générer le slug
blogCategorySchema.pre('save', function(next) {
  if (this.isModified('name.fr') && this.name?.fr) {
    this.slug = this.name.fr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Méthode pour récupérer l'arborescence complète
blogCategorySchema.statics.getTree = async function(): Promise<BlogCategory[]> {
  const categories = await this.find().sort('order name.fr');
  const tree: BlogCategory[] = [];
  const map = new Map<string, BlogCategory>();

  // Créer un map de toutes les catégories
  categories.forEach((cat: BlogCategoryDocument) => {
    map.set(cat._id.toString(), { ...cat.toObject(), children: [] });
  });

  // Construire l'arbre
  categories.forEach((cat: BlogCategoryDocument) => {
    const node = map.get(cat._id.toString());
    if (node) {
      if (cat.parent) {
        const parent = map.get(cat.parent.toString());
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
};

export default (mongoose.models.BlogCategory as BlogCategoryModel) || 
  mongoose.model<BlogCategoryDocument, BlogCategoryModel>('BlogCategory', blogCategorySchema); 