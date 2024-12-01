// components/admin/places/import/ResultsPreview.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ImportPreview } from '@/types/import';
import { GooglePlace } from '@/types/google/place';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, Search, AlertCircle, ChevronDown, CheckCircle, Phone, Globe, MapPin, ImageIcon, Star 
} from 'lucide-react';
import { GooglePlaceSearch } from '../create/GooglePlaceSearch';
import { usePlaceCreate } from '@/hooks/usePlaceCreate';


function getDisplayName(place: { name: { fr?: string; ja?: string }; originalData?: { title?: string } }): string {
  if (place.name.fr) return place.name.fr;
  if (place.name.ja) return place.name.ja;
  return place.originalData?.title || 'Sans nom';
}

function getPriceRangeSymbol(priceLevel?: number): string {
  if (!priceLevel) return '';
  return '¥'.repeat(priceLevel);
}

function formatOpeningHours(weekdayTexts: Record<string, string>): string[] {
  if (!weekdayTexts) return [];
  if (weekdayTexts.fr) return weekdayTexts.fr.split('\n');
  if (weekdayTexts.ja) return weekdayTexts.ja.split('\n');
  return [];
}

interface ResultsPreviewProps {
  data: ImportPreview[];
  selectedRows: string[];
  onRowSelect: (index: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onUpdate?: (updatedData: ImportPreview[]) => void;
}

export function ResultsPreview({ 
  data, 
  selectedRows, 
  onRowSelect, 
  onSelectAll,
  onUpdate 
}: ResultsPreviewProps) {
  const [expandedRows, setExpandedRows] = React.useState<string[]>([]);
  const [searchDialogOpen, setSearchDialogOpen] = React.useState(false);
  const [currentPreview, setCurrentPreview] = React.useState<ImportPreview | null>(null);

  const {
    searchTerm,
    searchResults,
    isSearching,
    error: searchError,
    handleSearchChange,
  } = usePlaceCreate({
    onSuccess: () => {} // On n'utilise pas la création ici
  });

  const toggleRow = (index: string) => {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const successPreviews = data.filter(preview => preview.status === 'success');
  const errorPreviews = data.filter(preview => preview.status === 'error');

  const handleManualSearch = (preview: ImportPreview) => {
    setCurrentPreview(preview);
    handleSearchChange(preview.original.Title);
    setSearchDialogOpen(true);
  };

  const handlePlaceSelect = async (place: GooglePlace) => {
    if (!currentPreview) return;

    try {
      const response = await fetch('/api/admin/places/import/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewId: currentPreview.original.Title,
          placeId: place.id,
          noteAuthor: currentPreview.original.Note
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const { preview: updatedPreview } = await response.json();
      
      // Mettre à jour le preview dans la liste
      const newData = data.map(p => 
        p.original.Title === currentPreview.original.Title ? updatedPreview : p
      );
      
      // Notifier le composant parent de la mise à jour
      onUpdate?.(newData);
      
      setSearchDialogOpen(false);
      setCurrentPreview(null);
    } catch (error) {
      console.error('Error updating place:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {successPreviews.length}
              </div>
              <div className="text-xs text-muted-foreground">Succès</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {errorPreviews.length}
              </div>
              <div className="text-xs text-muted-foreground">Erreurs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections déroulantes */}
      <div className="space-y-4">
        {/* Section des succès */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Lieux trouvés ({successPreviews.length})</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent>
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedRows.length} sur {successPreviews.length} sélectionnés
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(selectedRows.length < successPreviews.length)}
                  >
                    {selectedRows.length < successPreviews.length ? "Tout sélectionner" : "Tout désélectionner"}
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Lieu trouvé</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {successPreviews.map((preview, index) => {
                        const isSelected = selectedRows.includes(index.toString());
                        const isExpanded = expandedRows.includes(index.toString());

                        return (
                          <React.Fragment key={index}>
                            <TableRow 
                              className={cn(
                                'cursor-pointer hover:bg-muted/50',
                                isSelected && 'bg-primary/10'
                              )}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => onRowSelect(index.toString())}
                                  aria-label={`Sélectionner ${preview.original.Title}`}
                                />
                              </TableCell>
                              <TableCell>
                                <CheckCircle className="h-4 w-4 text-success" />
                              </TableCell>

                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">{preview.original.Title}</p>
                                  {preview.original.Note && (
                                    <p className="text-sm text-muted-foreground">{preview.original.Note}</p>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                {preview.enriched?.success && preview.enriched.place && (
                                  <div className="space-y-1">
                                    <p>{getDisplayName(preview.enriched.place)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {preview.enriched.place.name.ja}
                                    </p>
                                  </div>
                                )}
                              </TableCell>

                              <TableCell>
                                {preview.enriched?.success && preview.enriched.place && (
                                  <div className="space-y-2">
                                    <Badge>{preview.enriched.place.category}</Badge>
                                    <div className="flex flex-wrap gap-1">
                                      {preview.enriched.place.subcategories?.map((sub, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {sub}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </TableCell>

                              <TableCell>
                                {preview.enriched?.success && preview.enriched.place?.location && (
                                  <div className="space-y-1">
                                    <p>{preview.enriched.place.location.address.full.fr}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {preview.enriched.place.location.address.prefecture}, 
                                      {preview.enriched.place.location.address.city}
                                    </p>  
                                  </div>
                                )}
                              </TableCell>

                              <TableCell>
                                {preview.enriched?.success && preview.enriched.place?.pricing && (
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {getPriceRangeSymbol(preview.enriched.place.pricing.level ?? 0)}
                                    </p>
                                  </div>
                                )}
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {preview.enriched?.success && preview.enriched.place?.metadata?.rating && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="flex items-center">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="ml-1">
                                              {preview.enriched.place.metadata.rating.toFixed(1)}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{preview.enriched.place.metadata.userRatingsTotal || 0} avis</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {preview.enriched?.success && preview.enriched.place?.images && preview.enriched.place.images.length > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <ImageIcon className="h-4 w-4 text-blue-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{preview.enriched.place.images.length} photo(s)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  <button
                                    onClick={() => toggleRow(index.toString())}
                                    className="focus:outline-none"
                                  >
                                    <ArrowRight 
                                      className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        isExpanded && "rotate-90"
                                      )}
                                    />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {isExpanded && preview.enriched?.success && preview.enriched.place && (
                              <TableRow>
                                <TableCell colSpan={8} className="p-0">
                                  <Collapsible open={isExpanded}>
                                    <CollapsibleContent className="p-4">
                                      <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                          <h3 className="font-medium">Contact</h3>
                                          {preview.enriched.place.contact && (
                                            <div className="space-y-2">
                                              {preview.enriched.place.contact.phone && (
                                                <p className="flex items-center gap-2">
                                                  <Phone className="h-4 w-4" />
                                                  {preview.enriched.place.contact.phone}
                                                </p>
                                              )}
                                              {preview.enriched.place.contact.website && (
                                                <p className="flex items-center gap-2">
                                                  <Globe className="h-4 w-4" />
                                                  <a 
                                                    href={preview.enriched.place.contact.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                    onClick={e => e.stopPropagation()}
                                                  >
                                                    Site web
                                                  </a>
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-4">
                                          <h3 className="font-medium">Horaires</h3>
                                          {preview.enriched.place.openingHours?.weekdayTexts && (
                                            <div className="space-y-1 text-sm">
                                              {formatOpeningHours(preview.enriched.place.openingHours.weekdayTexts as unknown as Record<string, string>).map((text, i) => (
                                                <p key={i}>{text}</p>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-4">
                                          <h3 className="font-medium">Accès</h3>
                                          {preview.enriched.place.location.access && (
                                            <div className="space-y-2">
                                              {preview.enriched.place.location.access.nearestStation && (
                                                <p className="flex items-center gap-2">
                                                  <MapPin className="h-4 w-4" />
                                                  <span>
                                                    {preview.enriched.place.location.access.nearestStation}
                                                    {preview.enriched.place.location.access.walkingTime && (
                                                      <span className="text-muted-foreground">
                                                        {' '}({preview.enriched.place.location.access.walkingTime} min)
                                                      </span>
                                                    )}
                                                  </span>
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Section des erreurs */}
        {errorPreviews.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Lieux non trouvés ({errorPreviews.length})</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                {errorPreviews.map((preview, index) => (
                  <div 
                    key={index}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-background"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{preview.original.Title}</p>
                      {preview.original.Note && (
                        <p className="text-sm text-muted-foreground">
                          Note: {preview.original.Note}
                        </p>
                      )}
                      <p className="text-sm text-destructive">
                        {preview.enriched.error}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleManualSearch(preview)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                ))}
              </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Dialog de recherche manuelle */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rechercher un lieu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentPreview && (
              <div className="space-y-2">
                <h4 className="font-medium">Lieu original</h4>
                <div className="p-4 rounded-lg border">
                  <p className="font-medium">{currentPreview.original.Title}</p>
                  {currentPreview.original.Note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Note: {currentPreview.original.Note}
                    </p>
                  )}
                </div>
              </div>
            )}
            <GooglePlaceSearch
              value={searchTerm}
              onChange={handleSearchChange}
              onSelect={handlePlaceSelect}
              results={searchResults}
              isLoading={isSearching}
              error={searchError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}