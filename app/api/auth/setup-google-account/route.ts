// app/api/auth/setup-google-account/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/auth/passwordUtils';
import { Error as MongooseError } from 'mongoose';

export async function POST(req: Request) {
  try {
    const { password, setupToken } = await req.json();

    if (!setupToken) {
      return NextResponse.json(
        { error: 'Token de configuration requis' },
        { status: 400 }
      );
    }

    // Validons d'abord le mot de passe
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    await dbConnect();

    // Recherche de l'utilisateur avec son token de setup
    const user = await User.findOne({ 
      setupToken,
      status: 'pending_setup'
    }).select('+providers +password');

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou compte déjà configuré' },
        { status: 404 }
      );
    }

    // Vérification des informations Google
    if (!user.providers?.google?.id || !user.providers?.google?.email) {
      return NextResponse.json(
        { error: 'Informations du compte Google manquantes' },
        { status: 400 }
      );
    }

    // Génération du hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Construction de l'objet providers avec le flag isConfigured
    const updatedProviders = {
      google: {
        id: user.providers.google.id,
        email: user.providers.google.email,
        lastLogin: user.providers.google.lastLogin || new Date(),
        isConfigured: true
      },
      credentials: {
        lastLogin: new Date()
      }
    };

    try {
      // Mise à jour de l'utilisateur avec toutes les nouvelles informations
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            status: 'active', // Changement du statut en active
            providers: updatedProviders,
            setupToken: undefined,
            setupTokenExpiry: undefined,
            'metadata.lastPasswordChange': new Date()
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!updatedUser) {
        throw new Error('Échec de la mise à jour de l\'utilisateur');
      }

      return NextResponse.json({
        message: 'Compte configuré avec succès',
        email: user.email,
        status: 'success'
      });
      
    } catch (saveError) {
      console.error('Erreur détaillée lors de la sauvegarde:', saveError);
      
      if (saveError instanceof MongooseError.ValidationError) {
        const validationErrors = Object.values(saveError.errors).map(err => 
          err.message || 'Erreur de validation'
        );
        
        return NextResponse.json(
          { 
            error: 'Erreur de validation des données',
            details: validationErrors
          },
          { status: 400 }
        );
      }

      throw saveError;
    }

  } catch (error) {
    console.error('❌ [API/Setup-Google-Account]:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la configuration du compte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}