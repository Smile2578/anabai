// components/sections/Hero.tsx
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';


export default function Hero() {
 

  return (
    <section
      className={cn(
        'relative flex h-screen items-center justify-center',
        'bg-gradient-to-b from-primary to-secondary overflow-hidden'
      )}
    >
     
      {/* Image de fond */}
      <div className="absolute inset-0 z-1">
        <Image
          src="/images/sakura.jpg"
          alt="Japon"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
        />
      </div>

      {/* Contenu du Hero */}
      <div className="relative z-10 max-w-4xl px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className={cn(
            'text-5xl font-bold md:text-6xl lg:text-7xl'
          )}
        >
          Découvrez le Japon Authentique avec{' '}
          <span className="text-accent">Anaba</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 text-lg md:text-xl"
        >
          Planifiez votre voyage sur mesure grâce à notre assistant intelligent
          et explorez les trésors cachés du Japon.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 flex justify-center"
        >
          <Button
            size="lg"
            className="organiser-voyage-button px-8 py-4 text-lg"
            onClick={() => {
              // Action du bouton
            }}
          >
            Commencer votre voyage
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
