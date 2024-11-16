// components/sections/Services.tsx
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FaRobot, FaMapMarkedAlt, FaHeart } from 'react-icons/fa';

const services = [
  {
    icon: <FaRobot className="h-12 w-12 text-primary" />,
    title: 'Assistant Intelligent',
    description: 'Personnalisez votre voyage grâce à notre IA avancée qui comprend vos préférences.',
  },
  {
    icon: <FaMapMarkedAlt className="h-12 w-12 text-secondary" />,
    title: 'Cartes Interactives',
    description: 'Explorez des lieux authentiques avec nos cartes détaillées et intuitives.',
  },
  {
    icon: <FaHeart className="h-12 w-12 text-accent" />,
    title: 'Expériences Uniques',
    description: 'Découvrez des trésors cachés et vivez des moments inoubliables.',
  },
];

export default function Services() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className={cn('text-4xl font-bold', 'title')}>Nos Services</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          AnabAI vous offre une gamme de services pour rendre votre voyage au Japon exceptionnel.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="service-card hover:shadow-xl">
                <CardHeader className="flex flex-col items-center">
                  {service.icon}
                  <CardTitle className="mt-4 text-2xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
