import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '@/services';
import type { AccountRow } from '@/services/accounts.service';

const KEY = (activeOnly:boolean)=>['accounts', activeOnly?'active':'all'];

export function useAccounts(activeOnly=true) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: KEY(activeOnly),
    queryFn: ()=>accountsService.list(activeOnly),
  });

  const create = useMutation({
    mutationFn: (payload: Omit<AccountRow,'id'|'created_at'|'updated_at'>)=>accountsService.create(payload),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: KEY(true) })
  });
  const update = useMutation({
    mutationFn: ({id, patch}:{id:string; patch: Partial<Omit<AccountRow,'id'>>})=>accountsService.update(id, patch),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: KEY(true) })
  });
  const remove = useMutation({
    mutationFn: (id: string)=>accountsService.delete(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: KEY(true) })
  });

  return {
    rows: data ?? [],
    loading: isLoading,
    error,
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: remove.mutateAsync,
  };
}