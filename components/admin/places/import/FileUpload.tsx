// components/admin/places/import/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileAccepted: (file: File) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function FileUpload({ onFileAccepted, isLoading, error }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);

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
    multiple: true
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8",
          "flex flex-col items-center justify-center",
          "transition-all duration-200 ease-in-out min-h-[200px]",
          isDragActive && "border-primary bg-primary/5",
          isLoading && "opacity-50 cursor-not-allowed",
          !isLoading && "cursor-pointer hover:border-primary/50"
        )}
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                  index < currentFileIndex && "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                  disabled={isLoading && index === currentFileIndex}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}