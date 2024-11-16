// components/admin/users/UsersManagement.tsx
"use client";

import { useState } from "react";
import { UsersTable } from "./users-table";
import { UserFilters } from "./users-filters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
  const { toast } = useToast();

  // Données simulées - À remplacer par un appel API
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2024-03-10",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      status: "active",
      createdAt: "2024-02-01",
      lastLogin: "2024-03-15",
    },
    // Ajoutez plus d'utilisateurs ici
  ];

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
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userToDelete = users.find(user => user.id === userId);
      if (!userToDelete) {
        throw new Error("Utilisateur non trouvé");
      }
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
      });
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utilisation de userData pour simuler la sauvegarde
      console.log('Sauvegarde des données:', userData);
      toast({
        title: editingUser ? "Utilisateur modifié" : "Utilisateur créé",
        description: editingUser 
          ? "Les modifications ont été enregistrées"
          : "Le nouvel utilisateur a été créé avec succès",
      });
      
      setIsDialogOpen(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
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

      <UsersTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <UserDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
      />
    </div>
  );
}