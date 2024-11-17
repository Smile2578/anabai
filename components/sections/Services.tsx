'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Map, Heart } from 'lucide-react'

const services = [
  {
    icon: Bot,
    title: 'Assistant Intelligent',
    description: 'Personnalisez votre voyage grâce à notre IA avancée qui comprend vos préférences.',
    color: 'text-primary'
  },
  {
    icon: Map,
    title: 'Cartes Interactives',
    description: 'Explorez des lieux authentiques avec nos cartes détaillées et intuitives.',
    color: 'text-secondary'
  },
  {
    icon: Heart,
    title: 'Expériences Uniques',
    description: 'Découvrez des trésors cachés et vivez des moments inoubliables.',
    color: 'text-accent'
  },
]

export default function Services() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Nos Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AnabAI vous offre une gamme de services pour rendre votre voyage au Japon exceptionnel.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="service-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-col items-center">
                  <service.icon className={cn("h-12 w-12", service.color)} />
                  <CardTitle className="mt-4 text-2xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}