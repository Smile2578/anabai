'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Users, MapPin, Star } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const stats = [
  { label: "Voyageurs", value: "10K+", icon: Users },
  { label: "Destinations", value: "100+", icon: MapPin },
  { label: "Satisfaction", value: "98%", icon: Star }
];

export default function CallToAction() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary">
      {/* Background avec effet de brillance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Titre animé */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-5xl font-bold mb-4">
              <TypeAnimation
                sequence={[
                  'Commencez Votre Voyage au Japon',
                  3000,
                  'Découvrez le Japon Authentique',
                  3000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </h2>
            <p className="text-xl text-white/90">
              Rejoignez plus de 10,000 voyageurs satisfaits et créez des souvenirs inoubliables
            </p>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm"
              >
                <stat.icon className="w-8 h-8 mb-3 text-white/90" />
                <span className="text-3xl font-bold mb-1">{stat.value}</span>
                <span className="text-white/80">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-4 bg-white text-primary rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors group">
              Planifier mon voyage
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-colors">
              En savoir plus
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}