// components/admin/places/DataPreviewTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportPreview } from '@/types/place';
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface DataPreviewTableProps {
  data: ImportPreview[];
  selectedRows?: string[];
  onRowSelect?: (index: number) => void;
}

function getPriceRangeSymbol(priceRange: number): string {
  return '¥'.repeat(priceRange);
}

export function DataPreviewTable({ data, selectedRows = [], onRowSelect }: DataPreviewTableProps) {
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
                      <CheckCircle className="h-4 w-4 text-semantic-success" />
                    ) : row.status === 'error' ? (
                      <XCircle className="h-4 w-4 text-semantic-error" />
                    ) : (
                      <Clock className="h-4 w-4 text-semantic-warning" />
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
                        <p>{row.enriched.place.name?.fr}</p>
                        <p className="text-sm text-muted-foreground">
                          {row.enriched.place.name?.ja}
                        </p>
                      </div>
                    ) : (
                      <span className="text-semantic-error">
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
                    {row.enriched?.success && row.enriched.place && (
                      <div className="space-y-1">
                        <p>{row.enriched.place.location?.address.fr}</p>
                        <p className="text-sm text-muted-foreground">
                          {row.enriched.place.location?.address.city}, {row.enriched.place.location?.address.prefecture}
                        </p>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {row.enriched?.success && row.enriched.place?.pricing && (
                      <div className="space-y-1">
                        <p className="font-medium">
                          {getPriceRangeSymbol(row.enriched.place.pricing.priceRange ?? 0)}
                        </p>
                        {row.enriched.place.pricing.priceRange && row.enriched.place.pricing.priceRange > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {(row.enriched.place.pricing.priceRange * 1000).toLocaleString()} - 
                            {(row.enriched.place.pricing.priceRange * 5000).toLocaleString()} ¥
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Note */}
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

                      {/* Photos */}
                      {row.enriched?.success && row.enriched.place?.images && row.enriched.place.images.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{row.enriched.place.images?.length} photo(s)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Status */}
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

                {/* Ligne de détails */}
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
                          {row.enriched.place.location?.accessInfo && (
                            <>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {row.enriched.place.location?.accessInfo?.nearestStation}
                                  {row.enriched.place.location?.accessInfo?.walkingTime && (
                                    <span className="text-muted-foreground">
                                      {' '}({row.enriched.place.location.accessInfo.walkingTime} min)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Horaires */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Horaires</h4>
                          <div className="text-sm">
                            {row.enriched.place.openingHours?.weekdayText?.fr?.map((text, i) => (
                              <p key={i}>{text}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Erreurs de validation */}
                      {row.validationErrors && row.validationErrors.length > 0 && (
                        <div className="mt-4 p-4 bg-semantic-error/10 rounded-md">
                          <div className="flex items-center gap-2 text-semantic-error mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <h4 className="font-medium">Erreurs de validation</h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {row.validationErrors.map((error, i) => (
                              <li key={i} className="text-sm text-semantic-error">
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