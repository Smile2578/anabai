// components/admin/users/UsersManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { UsersTable } from "./users-table";
import { UserFilters } from "./users-filters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { UserDialog } from "./user-dialog";
import { useToast } from "@/hooks/use-toast";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
};

export default function UsersManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array to run only once on mount

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
      });
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const isEditing = !!editingUser;
      const url = isEditing ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      const savedUser = await response.json();

      // Mettre à jour la liste des utilisateurs
      if (isEditing) {
        setUsers(users.map(user => 
          user.id === savedUser.id ? savedUser : user
        ));
      } else {
        setUsers([savedUser, ...users]);
      }
      
      toast({
        title: isEditing ? "Utilisateur modifié" : "Utilisateur créé",
        description: isEditing 
          ? "Les modifications ont été enregistrées"
          : "Le nouvel utilisateur a été créé avec succès",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <Button onClick={handleCreateUser}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Nouvel utilisateur
        </Button>
      </div>

      <UserFilters />

      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      <UserDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
      />
    </div>
  );
}

