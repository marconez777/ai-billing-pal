import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/pnl';

export const StagingTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stagingData, setStagingData] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [stagingRes, entitiesRes, categoriesRes] = await Promise.all([
        supabase
          .from('staging_transactions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'skipped'])
          .order('created_at', { ascending: false }),
        supabase
          .from('entities')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
      ]);

      if (stagingRes.error) throw stagingRes.error;
      if (entitiesRes.error) throw entitiesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setStagingData(stagingRes.data || []);
      setEntities(entitiesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading staging data:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de triagem"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    setProcessing(prev => new Set(prev.add(id)));
    try {
      const { data, error } = await supabase.rpc('fn_staging_lock', { p_id: id });
      if (error) throw error;
      
      if (data) {
        toast({ title: "Item bloqueado", description: "Item bloqueado para edição" });
        loadData(); // Reload to show lock status
      } else {
        toast({
          variant: "destructive",
          title: "Erro no bloqueio",
          description: "Item pode estar bloqueado por outro usuário"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleUnlock = async (id: string) => {
    setProcessing(prev => new Set(prev.add(id)));
    try {
      const { data, error } = await supabase.rpc('fn_staging_unlock', { p_id: id });
      if (error) throw error;
      
      if (data) {
        toast({ title: "Item desbloqueado", description: "Item liberado para edição" });
        loadData();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReleaseStaleLocks = async () => {
    try {
      const { data, error } = await supabase.rpc('fn_staging_release_stale_locks', { p_max_minutes: 15 });
      if (error) throw error;
      
      toast({ 
        title: "Travas liberadas", 
        description: `${data || 0} travas antigas foram liberadas` 
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const handleApprove = async (stagingId: string, entityId: string, categoryId: string) => {
    if (!entityId || !categoryId) {
      toast({
        variant: "destructive",
        title: "Seleção incompleta",
        description: "Selecione entidade e categoria antes de aprovar"
      });
      return;
    }

    setProcessing(prev => new Set(prev.add(stagingId)));
    try {
      const { data, error } = await supabase.rpc('fn_staging_approve', {
        p_staging_id: stagingId,
        p_entity_id: entityId,
        p_category_id: categoryId
      });

      if (error) throw error;

      toast({ 
        title: "Lançamento criado", 
        description: `Transação ${data} criada com sucesso` 
      });
      
      // Remove from staging list
      setStagingData(prev => prev.filter(item => item.id !== stagingId));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na aprovação",
        description: error.message || "Item não é pending/skipped ou entidade inválida"
      });
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(stagingId);
        return next;
      });
    }
  };

  const columns = [
    {
      key: 'txn_date',
      label: 'Data',
      width: 100,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'description',
      label: 'Descrição',
      width: 250,
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 120,
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'suggested_entity',
      label: 'Entidade Sugerida',
      width: 150,
      render: (_: any, row: any) => {
        const entity = entities.find(e => e.id === row.suggested_entity_id);
        return entity ? (
          <Badge variant="outline" className="text-xs">
            {entity.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      }
    },
    {
      key: 'suggested_category',
      label: 'Categoria Sugerida', 
      width: 150,
      render: (_: any, row: any) => {
        const category = categories.find(c => c.id === row.suggested_category_id);
        return category ? (
          <Badge variant="outline" className="text-xs">
            {category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      }
    },
    {
      key: 'lock_status',
      label: 'Status',
      width: 120,
      render: (_: any, row: any) => {
        if (row.lock_owner) {
          return (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Bloqueado
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-xs">
            {row.status}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      width: 350,
      render: (_: any, row: any) => (
        <StagingRowActions
          row={row}
          entities={entities}
          categories={categories}
          processing={processing.has(row.id)}
          onLock={() => handleLock(row.id)}
          onUnlock={() => handleUnlock(row.id)}
          onApprove={(entityId: string, categoryId: string) => 
            handleApprove(row.id, entityId, categoryId)
          }
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{stagingData.length} itens pendentes</Badge>
          {selectedItems.size > 0 && (
            <Badge variant="secondary">{selectedItems.size} selecionados</Badge>
          )}
        </div>
        <Button onClick={handleReleaseStaleLocks} variant="outline" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Liberar Travas Antigas
        </Button>
      </div>

      <DataGridVirtualized
        data={stagingData}
        columns={columns}
        height={600}
        rowHeight={60}
      />
    </div>
  );
};

interface StagingRowActionsProps {
  row: any;
  entities: any[];
  categories: any[];
  processing: boolean;
  onLock: () => void;
  onUnlock: () => void;
  onApprove: (entityId: string, categoryId: string) => void;
}

const StagingRowActions = ({ 
  row, 
  entities, 
  categories, 
  processing, 
  onLock, 
  onUnlock, 
  onApprove 
}: StagingRowActionsProps) => {
  const [selectedEntity, setSelectedEntity] = useState(row.suggested_entity_id || '');
  const [selectedCategory, setSelectedCategory] = useState(row.suggested_category_id || '');

  return (
    <div className="flex items-center gap-2">
      {/* Lock/Unlock */}
      {row.lock_owner ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onUnlock}
          disabled={processing}
        >
          <Unlock className="h-3 w-3" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onLock}
          disabled={processing}
        >
          <Lock className="h-3 w-3" />
        </Button>
      )}

      {/* Entity Select */}
      <Select value={selectedEntity} onValueChange={setSelectedEntity}>
        <SelectTrigger className="w-24 h-8">
          <SelectValue placeholder="Entidade" />
        </SelectTrigger>
        <SelectContent>
          {entities.map(entity => (
            <SelectItem key={entity.id} value={entity.id}>
              {entity.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Select */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-24 h-8">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Approve */}
      <Button
        size="sm"
        onClick={() => onApprove(selectedEntity, selectedCategory)}
        disabled={processing || !selectedEntity || !selectedCategory || row.lock_owner}
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Aprovar
      </Button>
    </div>
  );
};