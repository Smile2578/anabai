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
import { StatusBadge } from './StatusBadge';
import { motion } from 'framer-motion';

interface DataPreviewTableProps {
  data: ImportPreview[];
  selectedRows?: string[];
  onRowSelect?: (index: number) => void;
}

export function DataPreviewTable({ data, selectedRows, onRowSelect }: DataPreviewTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">État</TableHead>
            <TableHead>Titre Original</TableHead>
            <TableHead>Nom Enrichi</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                cursor-pointer
                hover:bg-muted/50
                ${selectedRows?.includes(index.toString()) ? 'bg-primary/5' : ''}
              `}
              onClick={() => onRowSelect?.(index)}
            >
              <TableCell>
                <StatusCell status={row.status} />
              </TableCell>
              <TableCell>{row.original.Title}</TableCell>
              <TableCell>
                {row.enriched?.place?.name?.fr || row.enriched?.place?.name?.en || '-'}
              </TableCell>
              <TableCell>
                {row.enriched?.place?.category || '-'}
              </TableCell>
              <TableCell>
                {row.enriched?.place?.location?.address?.fr || 
                 row.enriched?.place?.location?.address?.en || '-'}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {row.original.Note || '-'}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusCell({ status }: { status: ImportPreview['status'] }) {
    const getStatusVariant = (): 'publié' | 'brouillon' | 'archivé' => {
      switch (status) {
        case 'success':
          return 'publié';
        case 'error':
          return 'archivé';
        default:
          return 'brouillon';
      }
    };
  
    return <StatusBadge status={getStatusVariant()} />;
  }