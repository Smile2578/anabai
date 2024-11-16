// components/navigation/NavBar.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { MenuIcon, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
    { text: "Accueil", href: "/", icon: "🏠" },
    { text: "Voyager avec AnabAI", href: "/voyage", icon: "🤖" },
    { text: "Anablog", href: "/anablog", icon: "📝" },
    { text: "Qui sommes-nous ?", href: "/about", icon: "👥" },
  ];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="lg"
        className={cn(
          "gap-2 rounded-full",
          "border-primary text-primary",
          "hover:bg-primary hover:text-white",
          "mt-6 md:mt-8"
        )}
      >
        <MenuIcon className="h-5 w-5" />
        <span className="font-medium">Menu</span>
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "mx-auto w-[90%] max-w-md rounded-t-3xl bg-primary p-6",
          "text-white shadow-lg md:w-[400px]"
        )}
      >
        <div className="relative text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 top-0 p-2"
            aria-label="Fermer le menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                "hover:bg-primary-dark",
                pathname === item.href ? "bg-primary-dark" : ""
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg">{item.text}</span>
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}