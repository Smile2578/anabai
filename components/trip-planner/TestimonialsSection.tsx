// components/trip-planner/TestimonialsSection.tsx

import Image from "next/image";
import { User } from "lucide-react";
import { testimonials } from "@/lib/config/trip-planner.config";


interface Testimonial {
    content: string;
    author: string;
    role: string;
    image?: string;
  }
  
  interface TestimonialsSectionProps {
    testimonials: Testimonial[];
  }
  
  export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Ce qu&apos;en pensent nos voyageurs
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez les expériences de ceux qui nous ont fait confiance
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center gap-4 mb-4">
                  {testimonial.image ? (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }