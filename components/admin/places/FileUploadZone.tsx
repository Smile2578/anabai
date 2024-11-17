// components/admin/places/FileUploadZone.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileAccepted: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function FileUploadZone({ onFileAccepted, isLoading }: FileUploadZoneProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = React.useState<number>(-1);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = useCallback((indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (currentFileIndex >= indexToRemove) {
      setCurrentFileIndex(prev => Math.max(prev - 1, -1));
    }
  }, [currentFileIndex]);

  const processNextFile = useCallback(async () => {
    if (files.length === 0 || isLoading) return;
    
    const nextIndex = currentFileIndex + 1;
    if (nextIndex >= files.length) return;

    setCurrentFileIndex(nextIndex);
    await onFileAccepted(files[nextIndex]);
  }, [files, currentFileIndex, isLoading, onFileAccepted]);

  React.useEffect(() => {
    if (currentFileIndex === -1 && files.length > 0) {
      processNextFile();
    }
  }, [currentFileIndex, files.length, processNextFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  return (
    <div className="w-full space-y-4">
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
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-base mb-2">
          Glissez vos fichiers CSV ici ou
        </p>
        <p className="text-sm text-muted-foreground">
          Cliquez pour sélectionner
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Fichiers ({files.length})</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border",
                  index === currentFileIndex && "bg-primary/5 border-primary",
                  index < currentFileIndex && "bg-muted border-semantic-success",
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {index === currentFileIndex && isLoading && (
                    <span className="text-xs text-muted-foreground">
                      En cours...
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={isLoading && index === currentFileIndex}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle className="w-4 h-4 mt-0.5" />
        <p>
          Seuls les fichiers CSV exportés depuis Google Maps Takeout sont acceptés.
          Assurez-vous que vos fichiers contiennent les colonnes : Title, Note, URL, et Comment.
        </p>
      </div>
    </div>
  );
}