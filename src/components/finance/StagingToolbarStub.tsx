import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Search, Filter, Download, Upload, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StagingToolbarStubProps {
  totalItems: number;
  selectedItems: number;
  lockedBy?: string;
  onBulkApprove?: () => void;
  onBulkReject?: () => void;
  onExport?: () => void;
}

export const StagingToolbarStub = ({ 
  totalItems, 
  selectedItems, 
  lockedBy,
  onBulkApprove,
  onBulkReject,
  onExport 
}: StagingToolbarStubProps) => {
  return (
    <div className="space-y-4">
      {/* Lock Warning */}
      {lockedBy && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Esta importação está sendo editada por <strong>{lockedBy}</strong>. 
            Algumas ações podem estar indisponíveis.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Toolbar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {totalItems} transações
            </Badge>
            {selectedItems > 0 && (
              <Badge variant="secondary">
                {selectedItems} selecionadas
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                className="pl-10 w-64"
                disabled
              />
            </div>

            <Select disabled>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="high-confidence">Alta confiança</SelectItem>
                <SelectItem value="low-confidence">Baixa confiança</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={!onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
          >
            <Upload className="h-4 w-4 mr-2" />
            Nova Importação
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-primary">
            {selectedItems} transações selecionadas
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkReject}
              disabled={!onBulkReject || !!lockedBy}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar Selecionadas
            </Button>

            <Button
              size="sm"
              onClick={onBulkApprove}
              disabled={!onBulkApprove || !!lockedBy}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar Selecionadas
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-xs text-muted-foreground">Aprovadas</div>
        </div>
        <div className="bg-background rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{totalItems}</div>
          <div className="text-xs text-muted-foreground">Pendentes</div>
        </div>
        <div className="bg-background rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-xs text-muted-foreground">IA Sugeridas</div>
        </div>
        <div className="bg-background rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-xs text-muted-foreground">Regras Aplicadas</div>
        </div>
      </div>
    </div>
  );
};