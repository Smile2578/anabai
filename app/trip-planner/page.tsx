// app/trip-planner/page.tsx
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  Clock,
  Compass,
  Heart,
  Map,
  Shield,
  Star,
  Sparkles,
  Crown
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Bot,
    title: "Intelligence Artificielle Avancée",
    description:
      "Notre IA comprend vos préférences et crée des itinéraires personnalisés.",
  },
  {
    icon: Map,
    title: "Spots Secrets",
    description:
      "Accédez à notre collection de lieux authentiques validés par des experts.",
  },
  {
    icon: Clock,
    title: "Optimisation du Temps",
    description:
      "Itinéraires optimisés en fonction des horaires, de l'affluence et des transports.",
  },
  {
    icon: Heart,
    title: "Expériences Uniques",
    description:
      "Des recommandations basées sur vos centres d'intérêt et votre style de voyage.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    description: "Pour découvrir et planifier simplement",
    icon: Compass,
    features: [
      "Création d'itinéraire basique",
      "Accès à la carte des lieux",
      "Recommandations générales",
      "Guides de voyage essentiels",
    ],
  },
  {
    name: "Premium",
    price: "250€",
    description: "Pour un voyage optimisé et personnalisé",
    icon: Star,
    popular: true,
    features: [
      "IA de planification avancée",
      "Spots secrets exclusifs",
      "Prédictions affluence et météo",
      "Support prioritaire par email",
      "Modifications illimitées",
      "Guides détaillés et conseils d'experts",
    ],
  },
  {
    name: "Luxury",
    price: "400€",
    description: "Pour une expérience sans compromis",
    icon: Crown,
    features: [
      "Concierge personnel dédié",
      "Support WhatsApp 24/7",
      "Réservations prioritaires",
      "Accès VIP aux événements",
      "Assistance d'urgence",
      "Expériences exclusives",
      "Tout le contenu Premium",
    ],
  },
];

export default function TripPlannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ai-planning.jpg"
            alt="AI Planning Visualization"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Propulsé par l&apos;intelligence artificielle</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Planifiez votre voyage au Japon avec
              <span className="text-primary block">intelligence</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Laissez notre IA créer votre itinéraire parfait en fonction de vos préférences,
              du timing idéal et des pépites locales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Commencer la planification
              </Button>
              <Button size="lg" variant="outline">
                Voir une démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Une IA qui comprend vos envies</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez comment AnabAI rend votre planification plus intelligente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-card">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choisissez votre expérience</h2>
            <p className="text-lg text-muted-foreground">
              Un plan adapté à chaque style de voyage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={
                  "relative hover-card" +
                  (plan.popular ? " border-primary shadow-lg" : "")
                }
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <plan.icon className={
                      "h-8 w-8" +
                      (plan.popular ? " text-primary" : " text-muted-foreground")
                    } />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">par voyage</div>
                    </div>
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={
                      "w-full mt-6" +
                      (plan.popular ? " bg-primary" : " bg-secondary")
                    }
                  >
                    Choisir {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <h2 className="text-3xl font-bold mb-4">Processus</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Découvrez comment nous vous aidons à planifier votre voyage de manière efficace et personnalisée.
        </p>
        <ul className="list-disc list-inside mb-6">
          <li>Analyse de vos préférences et besoins.</li>
          <li>Création d&apos;itinéraires sur mesure.</li>
          <li>Assistance en temps réel pendant votre voyage.</li>
        </ul>
      </section>

      <section className="testimonials-section">
        <h2 className="text-3xl font-bold mb-4">Témoignages</h2>
        <div className="space-y-4">
          <blockquote className="border-l-4 border-primary pl-4">
            <p className="italic">Une expérience incroyable! J&apos;ai pu découvrir des endroits que je n&apos;aurais jamais trouvés seul.</p>
            <footer className="mt-2 text-sm text-muted-foreground">- Jean Dupont</footer>
          </blockquote>
          <blockquote className="border-l-4 border-primary pl-4">
            <p className="italic">L&apos;équipe a vraiment compris mes besoins et a créé un itinéraire parfait pour moi.</p>
            <footer className="mt-2 text-sm text-muted-foreground">- Marie Curie</footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}