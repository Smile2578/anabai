// components/admin/users/users-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User } from "./UsersManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useCallback } from "react";
import { toast, Toaster } from "sonner";

// Interface définissant les props du composant
interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onDeleteSuccess: (userId: string) => void;
}

// Configuration des notifications toast
const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-center' as const
};

export function UsersTable({ users, onEdit, onDeleteSuccess }: UsersTableProps) {
  // État pour gérer l'utilisateur à supprimer
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fonction de gestion de la suppression avec gestion des erreurs
  const handleDelete = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      // Appeler onDeleteSuccess pour mettre à jour l'état parent
      onDeleteSuccess(userId);
      setUserToDelete(null);
      toast.success('Utilisateur supprimé avec succès', TOAST_CONFIG);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression',
        TOAST_CONFIG
      );
    }
  }, [onDeleteSuccess]);

  // Fonction pour obtenir le badge approprié selon le rôle
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'user':
        return <Badge variant="secondary">Utilisateur</Badge>;
      case 'editor':
        return <Badge variant="default">Editeur</Badge>;
      case 'premium':
        return <Badge variant="outline">Premium</Badge>;
      case 'luxury':
        return <Badge variant="outline">Luxury</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  {user.createdAt 
                    ? format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr }) 
                    : 'Date invalide'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `mailto:${user.email}`;
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Contacter
                      </DropdownMenuItem>
                      {user.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => setUserToDelete(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de confirmation de suppression avec informations détaillées */}
      <AlertDialog 
        open={!!userToDelete} 
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Êtes-vous sûr de vouloir supprimer l&apos;utilisateur suivant ?</p>
              {userToDelete && (
                <div className="bg-muted p-3 rounded-md mt-2">
                  <p><strong>Nom :</strong> {userToDelete.name}</p>
                  <p><strong>Email :</strong> {userToDelete.email}</p>
                  <p><strong>Rôle :</strong> {userToDelete.role}</p>
                  <p><strong>Inscription :</strong> {userToDelete.createdAt ? format(new Date(userToDelete.createdAt), 'dd MMMM yyyy', { locale: fr }) : 'Date invalide'}</p>
                  <p><strong>Statut :</strong> {userToDelete.status}</p>
                  <p><strong>ID :</strong> {userToDelete.id}</p>
                </div>
              )}
              <p className="text-destructive font-semibold mt-4">
                Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (userToDelete) {
                  handleDelete(userToDelete.id);
                } else {
                  toast.error('Erreur: Utilisateur non sélectionné', TOAST_CONFIG);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}