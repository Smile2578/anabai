// components/sections/Testimonials.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';

const testimonials = [
  {
    id: 1,
    name: "Sophie Martin",
    avatar: "/images/avatars/sophie.jpg",
    location: "Paris, France",
    rating: 5,
    text: "AnabAI a complètement transformé mon voyage au Japon. Les recommandations personnalisées et les spots secrets ont rendu mon expérience vraiment unique et authentique.",
    date: "2024-01-15",
    tripType: "Solo"
  },
  {
    id: 2,
    name: "Marc Dubois",
    avatar: "/images/avatars/marc.jpg",
    location: "Lyon, France",
    rating: 5,
    text: "Grâce à AnabAI, notre voyage en famille a été parfaitement équilibré entre culture et divertissement. Les enfants ont adoré les activités suggérées !",
    date: "2024-02-20",
    tripType: "Famille"
  },
  {
    id: 3,
    name: "Julie Leroux",
    avatar: "/images/avatars/julie.jpg",
    location: "Bordeaux, France",
    rating: 5,
    text: "Une application indispensable pour découvrir le vrai Japon. Les itinéraires personnalisés m'ont permis de vivre des expériences uniques hors des sentiers battus.",
    date: "2024-03-05",
    tripType: "Couple"
  }
];

export default function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Motif japonais en arrière-plan */}
      <div className="absolute inset-0 opacity-5 pattern-japanese" />

      <div className="container mx-auto px-4 relative">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Ils Nous Font Confiance
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Découvrez les expériences authentiques de nos voyageurs à travers le Japon
          </p>
        </motion.div>

        {/* Carrousel de témoignages */}
        <div className="max-w-5xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex-[0_0_100%] min-w-0"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 mx-4 relative">
                    {/* Icône de citation */}
                    <Quote className="absolute -top-4 -left-4 w-8 h-8 text-primary/20" />
                    
                    {/* En-tête du témoignage */}
                    <div className="flex items-center mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                        <p className="text-gray-500 text-sm">{testimonial.location}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {testimonial.tripType}
                      </span>
                    </div>

                    {/* Texte du témoignage */}
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {testimonial.text}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-400">
                      {new Date(testimonial.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Points de navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === selectedIndex ? "bg-primary w-4" : "bg-gray-300"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}