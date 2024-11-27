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
      default: "active"
    },
    image: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true
   }
);

// Relation virtuelle avec les lieux (en tant qu'auteur)
UserSchema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'metadata.authors.id',
  justOne: false
});

// Hachage du mot de passe avant l'enregistrement
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(new Error('Unknown error occurred'));
  }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
