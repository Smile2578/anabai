// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface pour les données de liaison de compte en attente
interface PendingLinkData {
  pendingLinkToken?: string;
  pendingLinkProvider?: string;
  pendingLinkEmail?: string;
  pendingLinkExpiry?: Date;
  pendingLinkId?: string;
  pendingLinkName?: string;
}

// Interface pour les métadonnées
interface UserMetadata extends PendingLinkData {
  signupIp?: string;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  lastFailedLogin?: Date;
}

// Interface principale de l'utilisateur
interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string | null;
  role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  status: 'active' | 'inactive' | 'pending_verification' | 'pending_setup';
  image?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  setupToken?: string;
  setupTokenExpiry?: Date;
  createdAt: Date;
  lastLogin: Date;
  lastLoginIp?: string;
  providers: {
    google?: {
      id: string;
      email: string;
      lastLogin: Date;
      isConfigured?: boolean;
    };
    credentials?: {
      lastLogin: Date;
    };
  };
  metadata?: UserMetadata;
}

// Interface du document Mongoose
export interface IUser extends Document, Omit<User, '_id'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schéma Mongoose
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false, default: null },
    role: { 
      type: String, 
      enum: ['admin', 'editor', 'user', 'premium', 'luxury'],
      default: 'user' 
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_verification', 'pending_setup'],
      default: 'pending_verification'
    },
    image: { type: String },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    setupToken: { type: String },
    setupTokenExpiry: { type: Date },
    lastLogin: { type: Date, default: Date.now },
    lastLoginIp: { type: String },
    providers: {
      google: {
        id: String,
        email: String,
        lastLogin: { type: Date },
        isConfigured: { type: Boolean, default: false }
      },
      credentials: {
        lastLogin: { type: Date }
      }
    },
    metadata: {
      signupIp: { type: String },
      lastPasswordChange: { type: Date },
      failedLoginAttempts: { type: Number, default: 0 },
      lastFailedLogin: { type: Date },
      pendingLinkToken: { type: String },
      pendingLinkProvider: { type: String },
      pendingLinkEmail: { type: String },
      pendingLinkExpiry: { type: Date },
      pendingLinkId: { type: String },
      pendingLinkName: { type: String }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.setupToken;
        delete ret.setupTokenExpiry;
        return ret;
      }
    }
  }
);

// Hook de pré-sauvegarde pour le hachage du mot de passe
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.isModified('password')) {
      this.metadata = {
        ...this.metadata,
        lastPasswordChange: new Date()
      };
    }
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Unknown error occurred'));
  }
});

// Méthode de comparaison des mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Création du modèle
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;