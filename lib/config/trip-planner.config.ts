// config/trip-planner.config.ts
import { Bot, Map, Clock, Heart, Compass, Star, Crown } from "lucide-react";

export const features = [
  {
    icon: Bot,
    title: "IA Avancée",
    description: "Création d'itinéraires personnalisés basés sur vos préférences",
  },
  {
    icon: Map,
    title: "Lieux Secrets",
    description: "Accès à notre collection de spots authentiques validés par des experts",
  },
  {
    icon: Clock,
    title: "Optimisation",
    description: "Planning optimisé selon les horaires, l'affluence et les transports",
  },
  {
    icon: Heart,
    title: "Expériences Uniques",
    description: "Recommandations basées sur votre style de voyage",
  },
];

export const plans = [
  {
    name: "Découverte",
    price: "0€",
    description: "Pour explorer et planifier simplement",
    icon: Compass,
    features: [
      "Création d'itinéraire basique",
      "Accès à la carte des lieux",
      "Recommandations générales",
      "Guides essentiels",
    ],
  },
  {
    name: "Premium",
    price: "250€",
    description: "Pour un voyage optimisé",
    icon: Star,
    popular: true,
    features: [
      "IA de planification avancée",
      "Spots secrets exclusifs",
      "Prédictions affluence et météo",
      "Support prioritaire",
      "Modifications illimitées",
      "Guides détaillés",
    ],
  },
  {
    name: "Luxury",
    price: "400€",
    description: "Pour une expérience sans compromis",
    icon: Crown,
    features: [
      "Concierge personnel",
      "Support WhatsApp 24/7",
      "Réservations prioritaires",
      "Accès VIP événements",
      "Assistance d'urgence",
      "Expériences exclusives",
    ],
  },
];

export const testimonials = [
  {
    content: "Grâce à AnabAI, j'ai découvert des endroits incroyables que je n'aurais jamais trouvés seul.",
    author: "Thomas D.",
    role: "Voyageur Premium",
  },
  {
    content: "La planification de mon voyage n'a jamais été aussi simple et personnalisée.",
    author: "Marie L.",
    role: "Voyageuse Luxury",
  },
  {
    content: "Un outil révolutionnaire qui a rendu mon voyage au Japon inoubliable.",
    author: "Pierre M.",
    role: "Voyageur Premium",
  },
];