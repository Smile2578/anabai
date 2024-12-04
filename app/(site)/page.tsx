// app/page.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, MapPin, Compass, Calendar, Coffee, Hotel, Utensils, ShoppingBag, Navigation } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pagode.jpg"
            alt="Temple japonais traditionnel"
            fill
            className="object-cover brightness-[0.85]"
            priority
            quality={100}
          />
          <div className={cn(
            "absolute inset-0",
            mounted && theme === "dark" 
              ? "bg-gradient-to-r from-background/90 via-background/50 to-transparent" 
              : "bg-white/5"
          )} />
        </div>

        <div className="container mx-auto px-4 pt-6 pb-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center sm:text-left sm:mx-0">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              Votre assistant voyage intelligent
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-10">
              Découvrez le Japon 
              <span className="block text-primary">authentique</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-xl mx-auto sm:mx-0">
              Explorez les trésors cachés du Japon grâce à notre IA et nos recommandations d&apos;experts locaux
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link href="/trip-planner">
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Créer mon itinéraire
                </Button>
              </Link>
              <Link href="/spots">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Découvrir les spots secrets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Anaba.IO combine intelligence artificielle et expertise locale pour créer votre voyage parfait
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <Card key={index} className="hover-card">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos sélections d&apos;experts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des lieux soigneusement choisis par notre communauté d&apos;experts locaux
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="group hover-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-background/80 dark:to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white">
                        <category.icon className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                      </div>
                      <p className="text-sm text-white/80 mt-1">
                        {category.count} lieux sélectionnés
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6">
                Intelligence Artificielle
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Votre assistant personnel avant et pendant le voyage
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Notre IA analyse vos préférences, la météo, les événements locaux et votre position pour vous offrir des recommandations personnalisées en temps réel.
              </p>
              <ul className="space-y-4">
                {aiFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center mt-1">
                      <feature.icon className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
              <Image
                src="/images/sakura.jpg"
                alt="Assistant IA AnabAI"
                width={800}
                height={400}
                className="rounded-lg shadow-2xl relative"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 japanese-pattern opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-black mb-6">
              Prêt à découvrir le vrai Japon ?
            </h2>
            <p className="text-xl dark:text-white/90 text-black mb-8">
              Commencez à planifier votre voyage unique avec AnabAI et explorez les trésors cachés du Japon
            </p>
            <Button size="lg" variant="secondary" className="dark:bg-white bg-primary dark:text-primary text-white dark:hover:bg-white/90 hover:bg-primary/90">
              Créer mon itinéraire gratuitement
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AnabAI</h3>
              <p className="text-sm text-muted-foreground">
                Votre assistant intelligent pour découvrir le Japon authentique
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/planner" className="text-sm text-muted-foreground hover:text-primary">
                    Planificateur IA
                  </Link>
                </li>
                <li>
                  <Link href="/spots" className="text-sm text-muted-foreground hover:text-primary">
                    Spots Secrets
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recevez nos conseils pour voyager au Japon
              </p>
              <div className="flex">
                <Input type="email" placeholder="Votre email" className="rounded-r-none" />
                <Button className="rounded-l-none">S&apos;inscrire</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AnabAI. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}

const howItWorks = [
  {
    icon: Bot,
    title: "Partagez vos envies",
    description: "Notre IA analyse vos préférences pour créer un voyage sur mesure"
  },
  {
    icon: MapPin,
    title: "Découvrez nos spots",
    description: "Accédez à notre sélection de lieux authentiques choisis par des experts"
  },
  {
    icon: Navigation,
    title: "Explorez sereinement",
    description: "Recevez des suggestions adaptées en temps réel pendant votre voyage"
  }
]

const categories = [
  {
    icon: Hotel,
    title: "Hébergements",
    count: 150,
    image: "/images/hotels.jpg"
  },
  {
    icon: Utensils,
    title: "Restaurants",
    count: 320,
    image: "/images/restaurants.jpg"
  },
  {
    icon: Compass,
    title: "À visiter",
    count: 280,
    image: "/images/visites.jpg"
  },
  {
    icon: ShoppingBag,
    title: "Shopping",
    count: 190,
    image: "/images/shopping.jpg"
  },
  {
    icon: Coffee,
    title: "Cafés & Bars",
    count: 190,
    image: "/images/cafe_bar.jpg"
  }
]

const aiFeatures = [
  {
    icon: Calendar,
    title: "Planification intelligente",
    description: "Création d'itinéraires optimisés selon vos centres d'intérêt"
  },
  {
    icon: MapPin,
    title: "Recommandations contextuelles",
    description: "Suggestions adaptées à votre position et au moment de la journée"
  },
  {
    icon: Coffee,
    title: "Spots secrets",
    description: "Accès à notre base de données de lieux authentiques"
  },
  {
    icon: ShoppingBag,
    title: "Expériences locales",
    description: "Découverte des meilleurs endroits recommandés par les locaux"
  }
]
