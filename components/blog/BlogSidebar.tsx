'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlogCategory } from '@/types/blog';

interface BlogSidebarProps {
  categories: BlogCategory[];
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export function BlogSidebar({ 
  categories,
  onCategorySelect,
  selectedCategoryId 
}: BlogSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Catégories */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Catégories</h2>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            <Button
              variant={selectedCategoryId === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onCategorySelect?.(null)}
            >
              Toutes les catégories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategorySelect?.(category.id)}
              >
                {category.name.fr}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* À propos */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">À propos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Découvrez le Japon à travers nos articles, guides et conseils pour préparer votre voyage.
        </p>
        <Link href="/about">
          <Button variant="outline" className="w-full">
            En savoir plus
          </Button>
        </Link>
      </Card>

      {/* Newsletter */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Newsletter</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Abonnez-vous à notre newsletter pour recevoir nos derniers articles et conseils.
        </p>
        <Link href="/newsletter">
          <Button className="w-full">
            S&apos;abonner
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
} 