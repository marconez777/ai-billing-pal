import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataGridVirtualized } from '@/components/finance/DataGridVirtualized';
import { StagingToolbarStub } from '@/components/finance/StagingToolbarStub';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { StagingTransaction } from '@/lib/types';

const ImportsPage = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock staging data
  const mockStagingData: StagingTransaction[] = [
    {
      id: '1',
      user_id: 'mock-user-id',
      account_id: '1',
      description: 'PIX RECEBIDO - CLIENTE SILVA LTDA',
      amount: 2500.00,
      date: '2024-01-15',
      suggested_category: 'Receita de Serviços',
      confidence: 0.95
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      account_id: '1',
      description: 'POSTO SHELL - COMBUSTIVEL',
      amount: -85.50,
      date: '2024-01-14',
      suggested_category: 'Combustível',
      confidence: 0.88,
      locked_at: '2024-01-15T10:30:00Z',
      lock_owner: 'admin@faturai.com'
    },
    {
      id: '3',
      user_id: 'mock-user-id',
      account_id: '2',
      description: 'TRANSFERENCIA DOC - CONTA POUPANCA',
      amount: -1000.00,
      date: '2024-01-13',
      suggested_category: 'Transferência Bancária',
      confidence: 0.92
    },
    {
      id: '4',
      user_id: 'mock-user-id',
      account_id: '1',
      description: 'PAGAMENTO FATURA CARTAO - NUBANK',
      amount: -1250.00,
      date: '2024-01-12',
      suggested_category: 'Pagamento de Fatura',
      confidence: 0.78
    }
  ];

  const columns = [
    {
      key: 'select',
      label: '',
      width: 50,
      render: (_: any, row: StagingTransaction) => (
        <input
          type="checkbox"
          checked={selectedItems.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems(prev => [...prev, row.id]);
            } else {
              setSelectedItems(prev => prev.filter(id => id !== row.id));
            }
          }}
          disabled={!!row.locked_at}
          className="rounded"
        />
      )
    },
    {
      key: 'date',
      label: 'Data',
      width: 100,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'description',
      label: 'Descrição',
      width: 300,
      render: (value: string, row: StagingTransaction) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          {row.locked_at && (
            <div className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Editando: {row.lock_owner}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 120,
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          R$ {Math.abs(value).toFixed(2)}
        </span>
      )
    },
    {
      key: 'suggested_category',
      label: 'Categoria Sugerida',
      width: 200,
      render: (value: string, row: StagingTransaction) => (
        <div className="space-y-1">
          <Badge variant="outline">{value}</Badge>
          {row.confidence && (
            <div className="text-xs text-muted-foreground">
              Confiança: {(row.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      width: 150,
      render: (_: any, row: StagingTransaction) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!!row.locked_at}
            title="Aprovar transação"
          >
            <CheckCircle className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!!row.locked_at}
            title="Rejeitar transação"
          >
            <XCircle className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Criar regra a partir desta linha"
          >
            Regra
          </Button>
        </div>
      )
    }
  ];

  const lockedBy = mockStagingData.find(item => item.locked_at)?.lock_owner;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importações</h1>
        <p className="text-muted-foreground">
          Importe e processe extratos bancários
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Nova Importação
          </CardTitle>
          <CardDescription>
            Faça upload de arquivos CSV ou OFX dos seus extratos bancários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Arraste arquivos aqui</h3>
            <p className="text-muted-foreground mb-4">
              Ou clique para selecionar arquivos CSV ou OFX
            </p>
            <Button disabled>
              Selecionar Arquivos (Em breve)
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium">Formatos Suportados:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV (separado por vírgula)</li>
                <li>OFX (Open Financial Exchange)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Tamanho Máximo:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>10MB por arquivo</li>
                <li>Máximo 5 arquivos por vez</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staging Area */}
      <Card>
        <CardHeader>
          <CardTitle>Transações para Triagem</CardTitle>
          <CardDescription>
            Revise e aprove as transações importadas antes da integração final
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StagingToolbarStub
            totalItems={mockStagingData.length}
            selectedItems={selectedItems.length}
            lockedBy={lockedBy}
            onBulkApprove={() => console.log('Bulk approve')}
            onBulkReject={() => console.log('Bulk reject')}
            onExport={() => console.log('Export')}
          />

          <DataGridVirtualized
            data={mockStagingData}
            columns={columns}
            height={400}
            rowHeight={60}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>
            Últimas importações processadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>Nenhuma importação realizada</p>
            <p className="text-sm">O histórico aparecerá aqui após a primeira importação</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportsPage;