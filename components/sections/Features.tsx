// components/sections/Features.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { Navigation, Map, Landmark } from 'lucide-react';

const features = [
  {
    title: "Itinéraires Personnalisés",
    description: "Notre IA analyse vos préférences, votre budget et votre temps disponible pour créer des voyages parfaitement adaptés à vos envies.",
    Icon: Navigation,
    color: "bg-primary/10",
    borderColor: "border-primary",
    image: "/images/visites.jpg"
  },
  {
    title: "Spots Secrets",
    description: "Accédez à notre collection exclusive de lieux cachés, restaurants traditionnels et expériences authentiques loin du tourisme de masse.",
    Icon: Map,
    color: "bg-secondary/10",
    borderColor: "border-secondary",
    image: "/images/tori.jpg"
  },
  {
    title: "Culture Locale",
    description: "Plongez dans la culture japonaise avec nos guides culturels détaillés et nos recommandations d'événements traditionnels.",
    Icon: Landmark,
    color: "bg-accent/10",
    borderColor: "border-accent",
    image: "/images/hotels.jpg"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Voyagez Différemment
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Découvrez comment AnabAI transforme votre expérience de voyage au Japon
            en utilisant les dernières technologies pour créer des moments inoubliables.
          </p>
        </motion.div>

        {/* Grille de fonctionnalités */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                "relative group rounded-2xl p-6 transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-2",
                feature.color
              )}
            >
              {/* Icône et titre */}
              <div className="flex items-center mb-4">
                <div className={cn("p-3 rounded-lg mr-4", feature.color)}>
                  <feature.Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">{feature.description}</p>

              {/* Image de la fonctionnalité */}
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}