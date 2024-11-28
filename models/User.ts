// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  status: "active" | "inactive";
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  image?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  lastLogin: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury';
  status: "active" | "inactive";
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  image?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { 
      type: String, 
      enum: ['admin', 'editor', 'user', 'premium', 'luxury'],
      default: 'user' 
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive" // Changé à inactive par défaut jusqu'à la vérification
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    image: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastLogin: { type: Date, default: Date.now }
  },
  { timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
   }

);

// Relations virtuelles inchangées
UserSchema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'metadata.authors.id',
  justOne: false
});

UserSchema.virtual('questionnaires', {
  ref: 'Questionnaire',
  localField: '_id',
  foreignField: 'userId',
  justOne: false
});

// Pré-save hook pour le hachage du mot de passe
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Unknown error occurred'));
  }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;