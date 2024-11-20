// components/admin/places/import/ResultsPreview.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ImportPreview } from '@/types/import';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import {
  Star,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface ResultsPreviewProps {
  data: ImportPreview[];
  selectedRows: string[];
  onRowSelect: (index: string) => void;
  onSelectAll?: (selected: boolean) => void;
}

function getPriceRangeSymbol(priceLevel?: number): string {
  if (!priceLevel) return '';
  return '¥'.repeat(priceLevel);
}

function getDisplayName(place: { name: { fr?: string; ja?: string }; originalData?: { title?: string } }): string {
  if (place.name.fr) return place.name.fr;
  if (place.name.ja) return place.name.ja;
  return place.originalData?.title || 'Sans nom';
}

function formatOpeningHours(weekdayTexts: Record<string, string>): string[] {
  if (!weekdayTexts) return [];
  if (weekdayTexts.fr) return weekdayTexts.fr.split('\n');
  if (weekdayTexts.ja) return weekdayTexts.ja.split('\n');
  return [];
}

export function ResultsPreview({ 
  data, 
  selectedRows, 
  onRowSelect,
  onSelectAll 
}: ResultsPreviewProps) {
  const [expandedRows, setExpandedRows] = React.useState<string[]>([]);

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

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="border rounded-lg">
      <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Sélectionner tous les lieux"
                />
              </TableHead>
              <TableHead>État</TableHead>
              <TableHead>Données originales</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Infos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {data.map((row, index) => {
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
                        aria-label={`Sélectionner ${row.original.Title}`}
                      />
                    </TableCell>
                    <TableCell>
                      {row.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : row.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{row.original.Title}</p>
                        {row.original.Note && (
                          <p className="text-sm text-muted-foreground">{row.original.Note}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {row.enriched?.success && row.enriched.place ? (
                        <div className="space-y-1">
                          <p>{getDisplayName(row.enriched.place)}</p>
                          <p className="text-sm text-muted-foreground">
                            {row.enriched.place.name.ja}
                          </p>
                        </div>
                      ) : (
                        <span className="text-destructive">
                          {row.enriched?.error || 'Non enrichi'}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.enriched?.success && row.enriched.place && (
                        <div className="space-y-2">
                          <Badge>{row.enriched.place.category}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {row.enriched.place.subcategories?.map((sub, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.enriched?.success && row.enriched.place?.location && (
                        <div className="space-y-1">
                          <p>{row.enriched.place.location.address.full.fr}</p>
                          <p className="text-sm text-muted-foreground">
                            {row.enriched.place.location.address.prefecture}, 
                            {row.enriched.place.location.address.city}
                          </p>  
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.enriched?.success && row.enriched.place?.pricing && (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {getPriceRangeSymbol(row.enriched.place.pricing.level ?? 0)}
                          </p>
                          {row.enriched.place.pricing.range && (
                            <p className="text-sm text-muted-foreground">
                              {row.enriched.place.pricing.range.min ?? 0} - 
                              {row.enriched.place.pricing.range.max} ¥
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.enriched?.success && row.enriched.place?.metadata?.rating && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1">
                                    {row.enriched.place.metadata.rating.toFixed(1)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                              <p>{row.enriched.place.metadata.userRatingsTotal || 0} avis</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {row.enriched?.success && row.enriched.place?.images && row.enriched.place.images.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{row.enriched.place.images.length} photo(s)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {row.status === 'success' && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && row.enriched?.success && row.enriched.place && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <Collapsible open={isExpanded}>
                          <CollapsibleContent className="p-4">
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h3 className="font-medium">Contact</h3>
                                {row.enriched.place.contact && (
                                  <div className="space-y-2">
                                    {row.enriched.place.contact.phone && (
                                      <p className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {row.enriched.place.contact.phone}
                                      </p>
                                    )}
                                    {row.enriched.place.contact.website && (
                                      <p className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <a 
                                          href={row.enriched.place.contact.website}
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
                                {row.enriched.place.openingHours?.weekdayTexts && (
                                  <div className="space-y-1 text-sm">
                                    {formatOpeningHours(row.enriched.place.openingHours.weekdayTexts as unknown as Record<string, string>).map((text, i) => (
                                      <p key={i}>{text}</p>
                                    ))}
                                  </div>
)}
                              </div>

                              <div className="space-y-4">
                                <h3 className="font-medium">Accès</h3>
                                {row.enriched.place.location.access && (
                                  <div className="space-y-2">
                                    {row.enriched.place.location.access.nearestStation && (
                                      <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                          {row.enriched.place.location.access.nearestStation}
                                          {row.enriched.place.location.access.walkingTime && (
                                            <span className="text-muted-foreground">
                                              {' '}({row.enriched.place.location.access.walkingTime} min)
                                            </span>
                                          )}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {row.validationErrors && row.validationErrors.length > 0 && (
                              <div className="mt-4 p-4 rounded-md bg-destructive/10">
                                <div className="flex items-center gap-2 text-destructive mb-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <h4 className="font-medium">Erreurs de validation</h4>
                                </div>
                                <ul className="list-disc list-inside space-y-1">
                                  {row.validationErrors.map((error, i) => (
                                    <li key={i} className="text-sm text-destructive">
                                      {error}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
      </div>
    </div>
  );
}