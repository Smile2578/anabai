// components/sections/Destinations.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const destinations = [
  {
    id: 1,
    name: "Tokyo",
    description: "Mélange unique de tradition et modernité",
    image: "/images/shopping.jpg",
    category: "Métropole",
    popularity: 98,
    highlights: ["Shibuya", "Temples d'Asakusa", "Shopping à Harajuku"]
  },
  {
    id: 2,
    name: "Kyoto",
    description: "L'essence de la culture japonaise traditionnelle",
    image: "/images/pagode.jpg",
    category: "Culture",
    popularity: 95,
    highlights: ["Fushimi Inari", "Quartier de Gion", "Temples zen"]
  },
  {
    id: 3,
    name: "Osaka",
    description: "Capitale gastronomique et ville festive",
    image: "/images/restaurants.jpg",
    category: "Gastronomie",
    popularity: 92,
    highlights: ["Dotonbori", "Street Food", "Château d'Osaka"]
  },
  {
    id: 4,
    name: "Hakone",
    description: "Escapade naturelle avec vue sur le Mont Fuji",
    image: "/images/fuji pagode.jpg",
    category: "Nature",
    popularity: 89,
    highlights: ["Sources chaudes", "Mont Fuji", "Lac Ashi"]
  }
];

export default function Destinations() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Destinations Emblématiques
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explorez les lieux les plus fascinants du Japon, chacun offrant une expérience unique
            et des moments inoubliables.
          </p>
        </motion.div>

        {/* Carrousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {destinations.map((destination) => (
                <div key={destination.id} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-64">
                      <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-white">{destination.name}</h3>
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                            {destination.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">{destination.popularity}% de satisfaction</span>
                      </div>
                      <p className="text-gray-600 mb-4">{destination.description}</p>
                      <div className="space-y-2">
                        {destination.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons de navigation */}
          <button
            onClick={scrollPrev}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center",
              "hover:bg-white transition-colors",
              !canScrollPrev && "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={scrollNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center",
              "hover:bg-white transition-colors",
              !canScrollNext && "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollNext}
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Points de navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {destinations.map((_, index) => (
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