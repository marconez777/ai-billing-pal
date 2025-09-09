import { useState } from 'react';
import { AdminTable } from './AdminTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types';
import { Trash2, UserCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock data for development
const mockUsers: Profile[] = [
  {
    id: '1',
    user_id: '1',
    name: 'João Silva',
    role: 'user',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    user_id: '2',
    name: 'Maria Santos',
    role: 'admin',
    created_at: '2024-01-02T14:30:00Z',
    updated_at: '2024-01-02T14:30:00Z'
  }
];

export const UsersTab = () => {
  const [users] = useState<Profile[]>(mockUsers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Nome'
    },
    {
      key: 'role',
      label: 'Função',
      render: (value: string) => (
        <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
          {value === 'admin' ? 'Admin' : 'Usuário'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Profile) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Funcionalidade será implementada"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={row.role === 'admin'}
            onClick={() => {
              setSelectedUser(row);
              setDeleteDialogOpen(true);
            }}
            title={row.role === 'admin' ? 'Admins não podem ser excluídos' : 'Excluir usuário'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleDeleteUser = () => {
    if (selectedUser) {
      // TODO: Implement user deletion
      console.log('Deleting user:', selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuários</h3>
        <div className="text-sm text-muted-foreground">
          Total: {users.length} usuários
        </div>
      </div>

      <AdminTable
        data={users}
        columns={columns}
        searchPlaceholder="Buscar por nome..."
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{selectedUser?.name}"? 
              Esta ação não pode ser desfeita e todos os dados do usuário serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};