'use client';

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  );
}

export function LoadingDots() {
  return (
    <span className="space-x-1">
      {[1, 2, 3].map((dot) => (
        <motion.span
          key={dot}
          className="inline-block h-1 w-1 rounded-full bg-current"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: dot * 0.2,
          }}
        />
      ))}
    </span>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner className="h-8 w-8" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoadingButton({
  loading,
  children,
  loadingText = "Chargement",
}: {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      {loading ? (
        <>
          <LoadingSpinner />
          <span>{loadingText}<LoadingDots /></span>
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <LoadingSkeleton className="h-5 w-2/3" />
        <LoadingSkeleton className="h-4 w-4/5" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
} 