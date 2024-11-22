// components/admin/places/form/DescriptionSection.tsx
import { useEffect, useState } from 'react';
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor } from '@tinymce/tinymce-react';
import { useToast } from '@/hooks/use-toast';

interface DescriptionSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

type LanguageType = 'fr' | 'ja';

export const DescriptionSection = ({ data, onChange, isSubmitting }: DescriptionSectionProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  const [activeLanguage, setActiveLanguage] = useState<LanguageType>('fr');
  const handleTabChange = (value: string) => {
    setActiveLanguage(value as LanguageType);
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/config?service=tinymce');
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch  {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'éditeur",
          variant: "destructive",
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  const handleEditorChange = (lang: 'fr' | 'ja', content: string) => {
    onChange({
      description: {
        ...data.description,
        [lang]: content
      }
    });
  };

  const editorConfig = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: `
      body { 
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 16px;
        color: #1a1a27;
      }
    `
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">
            Description
          </CardTitle>
          <Badge variant="outline" className="text-base">
            {activeLanguage === 'fr' ? 'Français' : '日本語'}
          </Badge>
        </div>
        <CardDescription>
          Description détaillée du lieu en plusieurs langues
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs 
          value={activeLanguage} 
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fr" disabled={isSubmitting}>
              Français
            </TabsTrigger>
            <TabsTrigger value="ja" disabled={isSubmitting}>
              日本語
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fr" className="mt-4">
            {apiKey && (
              <Editor
                apiKey={apiKey}
                initialValue={data.description.fr}
                init={editorConfig}
                onEditorChange={(content) => handleEditorChange('fr', content)}
                disabled={isSubmitting}
              />
            )}
          </TabsContent>

          <TabsContent value="ja" className="mt-4">
            {apiKey && (
              <Editor
                apiKey={apiKey}
                initialValue={data.description.ja || ''}
                init={{
                  ...editorConfig,
                  language: 'ja',
                  content_style: `
                    ${editorConfig.content_style}
                    body { font-family: 'Noto Sans JP', sans-serif; }
                  `
                }}
                onEditorChange={(content) => handleEditorChange('ja', content)}
                disabled={isSubmitting}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Prévisualisation */}
        <div className="mt-6 space-y-4">
          <Label className="text-lg font-semibold">Prévisualisation</Label>
          <div className="rounded-lg border p-4 prose prose-slate max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: data.description[activeLanguage] || '' 
              }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};