// components/admin/places/DataPreviewTable.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Image as ImageIcon,
  Ban,
  MapPin,
  Building2,
  Building,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Tag
} from 'lucide-react';
import { ImportPreview } from '@/types/place';
import { cn } from '@/lib/utils';

interface PlaceProcessingState {
  status: 'pending' | 'importing' | 'enriching' | 'validating' | 'completed' | 'error';
  message?: string;
}

interface DataPreviewTableProps {
  data: ImportPreview[];
  selectedRows?: string[];
  onRowSelect?: (index: number) => void;
  placesStatus?: Record<string, PlaceProcessingState>;
}

export function DataPreviewTable({ data, selectedRows = [], onRowSelect }: DataPreviewTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);

  const toggleRow = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getStatusIcon = (status: ImportPreview['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-semantic-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-semantic-error" />;
      default:
        return <AlertCircle className="h-4 w-4 text-semantic-warning" />;
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[50px]">État</TableHead>
            <TableHead className="min-w-[200px]">Données Originales</TableHead>
            <TableHead className="min-w-[200px]">Noms</TableHead>
            <TableHead className="min-w-[200px]">Adresse</TableHead>
            <TableHead className="min-w-[150px]">Ville</TableHead>
            <TableHead className="min-w-[150px]">Préfecture</TableHead>
            <TableHead className="min-w-[150px]">Catégories</TableHead>
            <TableHead className="min-w-[100px]">Budget</TableHead>
            <TableHead className="min-w-[100px]">Médias</TableHead>
            <TableHead className="min-w-[150px]">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <motion.tr
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'cursor-pointer hover:bg-muted/50',
                  selectedRows.includes(index.toString()) && 'bg-primary/10'
                )}
                onClick={() => onRowSelect?.(index)}
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => toggleRow(index, e)}
                  >
                    {expandedRows.includes(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusIcon(row.status)}
                </TableCell>

                {/* Original Data */}
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{row.original.Title}</p>
                    {row.original.Note && (
                      <p className="text-sm text-muted-foreground truncate">
                        {row.original.Note}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Names */}
                <TableCell>
                  {row.enriched?.success ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">FR</Badge>
                        <span>{row.enriched.place?.name?.fr}</span>
                      </div>
                      {row.enriched.place?.name?.ja && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">JA</Badge>
                          <span>{row.enriched.place.name.ja}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-semantic-error">
                      {row.enriched?.error || 'Erreur d\'enrichissement'}
                    </span>
                  )}
                </TableCell>

                {/* Address */}
                <TableCell>
                  {row.enriched?.success && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {row.enriched.place?.location?.address?.fr}
                      </span>
                    </div>
                  )}
                </TableCell>

                {/* City */}
                <TableCell>
                  {row.enriched?.success && row.enriched.place?.location?.address?.city && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{row.enriched.place.location.address.city}</span>
                    </div>
                  )}
                </TableCell>

                {/* Prefecture */}
                <TableCell>
                  {row.enriched?.success && row.enriched.place?.location?.address?.prefecture && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{row.enriched.place.location.address.prefecture}</span>
                    </div>
                  )}
                </TableCell>

                {/* Categories */}
                <TableCell>
                  {row.enriched?.success && row.enriched.place && (
                    <div className="space-y-2">
                      <Badge>{row.enriched.place.category}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {row.enriched.place?.subcategories?.map((sub, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TableCell>

                {/* Budget */}
                <TableCell>
                  {row.enriched?.success && row.enriched.place?.pricing && (
                    <div className="space-y-1">
                      {row.enriched.place.pricing.priceRange && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: row.enriched.place.pricing.priceRange }).map((_, i) => (
                            <DollarSign key={i} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      )}
                      {row.enriched.place.pricing.budget && (
                        <p className="text-sm text-muted-foreground">
                          {row.enriched.place.pricing.budget.min} - {row.enriched.place.pricing.budget.max} 
                          {row.enriched.place.pricing.currency}
                        </p>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Media */}
                <TableCell>
                  {row.enriched?.success && (
                    <div className="flex items-center gap-2">
                      {row.enriched.place?.images && row.enriched.place.images.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-semantic-success" />
                          <span className="text-sm text-semantic-success">
                            {row.enriched.place.images.length}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Ban className="h-4 w-4 text-semantic-error" />
                          <span className="text-sm text-semantic-error">Aucune</span>
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Contact */}
                <TableCell>
                  {row.enriched?.success && row.enriched.place?.contact && (
                    <div className="space-y-2">
                      {row.enriched.place.contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{row.enriched.place.contact.phone}</span>
                        </div>
                      )}
                      {row.enriched.place.contact.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">
                            {row.enriched.place.contact.website.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                
              </motion.tr>
              
              {expandedRows.includes(index) && (
                <TableRow>
                  <TableCell colSpan={11} className="p-4 bg-muted/5">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Informations détaillées */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Description</h4>
                        {row.enriched?.success && row.enriched.place?.description && (
                          <div className="space-y-2">
                            {row.enriched.place.description.fr && (
                              <div>
                                <Badge variant="outline">FR</Badge>
                                <p className="text-sm mt-1">{row.enriched.place.description.fr}</p>
                              </div>
                            )}
                            {row.enriched.place.description.ja && (
                              <div className="mt-2">
                                <Badge variant="outline">JA</Badge>
                                <p className="text-sm mt-1">{row.enriched.place.description.ja}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Horaires et accès */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Horaires et Accès</h4>
                        {row.enriched?.success && row.enriched.place && (
                          <div className="space-y-2">
                            {row.enriched.place.openingHours?.weekdayText && (
                              <div>
                                <Badge variant="outline" className="mb-2">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Horaires
                                </Badge>
                                <div className="text-sm space-y-1">
                                  {row.enriched.place.openingHours.weekdayText.fr.map((text, i) => (
                                    <p key={i}>{text}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                            {row.enriched.place?.location?.accessInfo && (
                              <div className="mt-4">
                                <Badge variant="outline" className="mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Accès
                                </Badge>
                                <div className="text-sm space-y-1">
                                  <p>Station: {row.enriched.place?.location?.accessInfo?.nearestStation}</p>
                                  <p>Temps de marche: {row.enriched.place?.location?.accessInfo?.walkingTime} min</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Métadonnées */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Métadonnées</h4>
                        {row.enriched?.success && row.enriched.place?.metadata && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Place ID:</span>
                                <p className="font-mono">{row.enriched.placeId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Source:</span>
                                <p>{row.enriched.place.metadata.source}</p>
                              </div>
                              {row.enriched.place?.metadata?.rating && (
                                <div>
                                  <span className="text-muted-foreground">Note:</span>
                                  <p>
                                    {row.enriched.place?.metadata?.rating}/5 
                                    {row.enriched.place?.metadata?.userRatingsTotal && 
                                      ` (${row.enriched.place?.metadata?.userRatingsTotal} avis)`}
                                  </p>
                                </div>
                              )}
                              {row.enriched.place.metadata.tags && row.enriched.place.metadata.tags.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {row.enriched.place.metadata.tags.map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Erreurs de validation */}
                        {row.validationErrors && row.validationErrors.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-semantic-error">Erreurs de validation</h4>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              {row.validationErrors.map((error, i) => (
                                <li key={i} className="text-sm text-semantic-error">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}