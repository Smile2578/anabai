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

interface ResultsPreviewProps {
  data: ImportPreview[];
  selectedRows?: string[];
  onRowSelect?: (index: number) => void;
}

function getPriceRangeSymbol(priceRange?: number): string {
  if (!priceRange) return '';
  return '¥'.repeat(priceRange);
}

export function ResultsPreview({ data, selectedRows = [], onRowSelect }: ResultsPreviewProps) {
  const [expandedRows, setExpandedRows] = React.useState<string[]>([]);

  const toggleRow = (index: string) => {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">État</TableHead>
            <TableHead className="min-w-[200px]">Données originales</TableHead>
            <TableHead className="min-w-[200px]">Nom</TableHead>
            <TableHead className="min-w-[150px]">Catégorie</TableHead>
            <TableHead className="min-w-[200px]">Adresse</TableHead>
            <TableHead className="min-w-[100px]">Prix</TableHead>
            <TableHead className="min-w-[150px]">Infos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const isExpanded = expandedRows.includes(index.toString());
            return (
              <React.Fragment key={index}>
                <TableRow 
                  onClick={() => {
                    onRowSelect?.(index);
                    toggleRow(index.toString());
                  }}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    selectedRows.includes(index.toString()) && 'bg-primary/10'
                  )}
                >
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
                        <p>{row.enriched.place.name.fr}</p>
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
                          {getPriceRangeSymbol(row.enriched.place.pricing.level)}
                        </p>
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
                              <p>{row.enriched.place.metadata.userRatingsTotal} avis</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {row.enriched?.success && row.enriched.place?.images?.length && row.enriched.place.images.length > 0 && (
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
                        <ArrowRight 
                          className="h-4 w-4 cursor-pointer text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(index.toString());
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {isExpanded && row.enriched?.success && row.enriched.place && (
                  <TableRow className="bg-muted/5">
                    <TableCell colSpan={7} className="p-4">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Informations de contact */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Contact</h4>
                          {row.enriched.place.contact && (
                            <>
                              {row.enriched.place.contact.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{row.enriched.place.contact.phone}</span>
                                </div>
                              )}
                              {row.enriched.place.contact.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <a 
                                    href={row.enriched.place.contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    Site web
                                  </a>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Accès */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Accès</h4>
                          {row.enriched.place.location?.access && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {row.enriched.place.location.access.nearestStation}
                                {row.enriched.place.location.access.walkingTime && (
                                  <span className="text-muted-foreground">
                                    {' '}({row.enriched.place.location.access.walkingTime} min)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Horaires */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Horaires</h4>
                          <div className="text-sm">
                            {typeof row.enriched.place.openingHours?.weekdayTexts === 'object' ? (
                              Object.values(row.enriched.place.openingHours.weekdayTexts).map((text: string) => (
                                <p key={text}>{text}</p>
                              ))
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Erreurs de validation */}
                      {row.validationErrors && row.validationErrors.length > 0 && (
                        <div className="mt-4 p-4 bg-destructive/10 rounded-md">
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
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}