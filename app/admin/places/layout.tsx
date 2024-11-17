'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export default function PlacesLayout({ children }: LayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des lieux</h1>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
