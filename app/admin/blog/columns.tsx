'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { DataTableRowActions } from '@/components/ui/data-table/row-actions';
import { Blog } from '@/types/blog';
import { Star } from 'lucide-react';

export const columns: ColumnDef<Blog>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => {
      const title = row.original.title.fr;
      return (
        <div className="flex space-x-2">
          <Link href={`/admin/blog/${row.original.id}/preview`} className="max-w-[500px] truncate font-medium hover:underline">
            {title}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? 'Publié' : status === 'draft' ? 'Brouillon' : 'Archivé'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'category_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catégorie" />
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <span className="max-w-[500px] truncate font-medium">
          {category?.name?.fr || 'Sans catégorie'}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auteur" />
    ),
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <span className="max-w-[500px] truncate">
          {author?.name || 'Auteur inconnu'}
        </span>
      );
    },
  },
  {
    accessorKey: 'is_featured',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mis en avant" />
    ),
    cell: ({ row }) => {
      const isFeatured = row.original.is_featured;
      return isFeatured ? (
        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
      ) : null;
    },
  },
  {
    accessorKey: 'published_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de publication" />
    ),
    cell: ({ row }) => {
      const date = row.original.published_at || row.original.created_at;
      return date ? format(new Date(date), 'dd MMMM yyyy', { locale: fr }) : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]; 