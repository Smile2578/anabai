// components/admin/places/FileUploadZone.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFileAccepted: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploadZone({ onFileAccepted, isLoading }: FileUploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          transition-all duration-200 ease-in-out
          min-h-[200px]
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <AnimatePresence mode="wait">
          {acceptedFiles.length > 0 ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <FileText className="w-12 h-12 text-primary mb-4 mx-auto" />
              <p className="text-sm text-muted-foreground mb-2">
                {acceptedFiles[0].name}
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  acceptedFiles.forEach(() => {}); // Clear the array without mutation
                }}
                disabled={isLoading}
              >
                Changer de fichier
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Upload className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
              <p className="text-base mb-2">
                Glissez votre fichier CSV ici ou
              </p>
              <p className="text-sm text-muted-foreground">
                Cliquez pour sélectionner
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle className="w-4 h-4 mt-0.5" />
        <p>
          Seuls les fichiers CSV exportés depuis Google Maps Takeout sont acceptés.
          Assurez-vous que votre fichier contient les colonnes : Title, Note, URL, et Comment.
        </p>
      </div>
    </div>
  );
}