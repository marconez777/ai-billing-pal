import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StagingTable } from '@/components/finance/StagingTable';
import AccountsSelect from '@/components/finance/AccountsSelect';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createImport, insertStagingBatch } from '@/services/imports.supabase';
import Papa from 'papaparse';
import type { StagingPayload } from '@/services/imports.supabase';

interface ParsedRow {
  [key: string]: any;
}

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  external_id?: string;
}

const ImportsPage = () => {
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);  
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    amount: '',
    external_id: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const newFiles = Array.from(fileList).filter(file => 
      file.name.toLowerCase().endsWith('.csv') || 
      file.name.toLowerCase().endsWith('.ofx')
    );
    
    if (newFiles.length === 0) {
      toast({ title: 'Erro', description: 'Apenas arquivos CSV e OFX são suportados', variant: 'destructive' });
      return;
    }
    
    setFiles(newFiles);
    
    // Parse do primeiro arquivo para preview
    if (newFiles[0].name.toLowerCase().endsWith('.csv')) {
      parseCSV(newFiles[0]);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({ title: 'Erro ao processar CSV', description: results.errors[0].message, variant: 'destructive' });
          return;
        }
        
        const data = results.data as ParsedRow[];
        setParsedData(data.slice(0, 50)); // Preview apenas 50 linhas
        
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          setColumnOptions(columns);
          
          // Auto-detectar colunas comuns
          const autoMapping: ColumnMapping = {
            date: columns.find(col => /data|date/i.test(col)) || '',
            description: columns.find(col => /desc|descrição|historico|memo/i.test(col)) || '',
            amount: columns.find(col => /valor|amount|value/i.test(col)) || '',
            external_id: columns.find(col => /id|codigo|ref/i.test(col)) || ''
          };
          setMapping(autoMapping);
        }
      }
    });
  };

  const normalizeRowCSV = (row: ParsedRow): Omit<StagingPayload, 'import_id'> => {
    const dateStr = String(row[mapping.date] || '').trim();
    let txn_date: string;
    
    // Tentar diferentes formatos de data
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      txn_date = `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (dateStr.includes('-')) {
      txn_date = dateStr.slice(0, 10); // YYYY-MM-DD
    } else {
      txn_date = new Date().toISOString().slice(0, 10); // fallback para hoje
    }
    
    const description = String(row[mapping.description] || '').slice(0, 512);
    const amountStr = String(row[mapping.amount] || '0').replace(',', '.');
    const amount = parseFloat(amountStr) || 0;
    const external_id = mapping.external_id ? String(row[mapping.external_id]) : null;
    
    return {
      account_id: selectedAccount,
      txn_date,
      description,
      amount,
      external_id,
      metadata: { raw: row }
    };
  };

  const handleSubmit = async () => {
    if (!selectedAccount) {
      toast({ title: 'Erro', description: 'Selecione uma conta', variant: 'destructive' });
      return;
    }
    
    if (!mapping.date || !mapping.description || !mapping.amount) {
      toast({ title: 'Erro', description: 'Mapeie as colunas obrigatórias: Data, Descrição e Valor', variant: 'destructive' });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Criar registro de importação
      const fileName = files[0]?.name || 'Import manual';
      const importId = await createImport(selectedAccount, fileName, { 
        file_count: files.length,
        mapping 
      });
      
      // Re-processar todo o arquivo (não só preview)
      const file = files[0];
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const allData = results.data as ParsedRow[];
            
            // Converter para formato staging
            const stagingData: StagingPayload[] = allData.map(row => ({
              import_id: importId,
              ...normalizeRowCSV(row)
            }));
            
            // Inserir em lotes de 1000
            const batchSize = 1000;
            for (let i = 0; i < stagingData.length; i += batchSize) {
              const batch = stagingData.slice(i, i + batchSize);
              await insertStagingBatch(batch);
            }
            
            toast({ 
              title: 'Importação concluída!', 
              description: `${stagingData.length} transações enviadas para triagem` 
            });
            
            // Reset
            setFiles([]);
            setParsedData([]);
            setMapping({ date: '', description: '', amount: '', external_id: '' });
            setColumnOptions([]);
            
          } catch (error: any) {
            toast({ 
              title: 'Erro na importação', 
              description: error.message, 
              variant: 'destructive' 
            });
          } finally {
            setIsProcessing(false);
          }
        }
      });
      
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const canSubmit = selectedAccount && mapping.date && mapping.description && mapping.amount && files.length > 0;

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
            Faça upload de arquivos CSV dos seus extratos bancários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Conta de destino</label>
              <div className="mt-1">
                <AccountsSelect value={selectedAccount} onChange={setSelectedAccount} />
              </div>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecione arquivos CSV</h3>
            <p className="text-muted-foreground mb-4">
              Arquivos CSV com histórico bancário ou de cartão
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.ofx"
              onChange={handleFiles}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={!selectedAccount}>
                <span>Selecionar Arquivos</span>
              </Button>
            </label>
            {files.length > 0 && (
              <div className="mt-4 text-sm text-green-600">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                {files.length} arquivo(s) selecionado(s)
              </div>
            )}
          </div>
          
          {/* Mapeamento de colunas */}
          {parsedData.length > 0 && (
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-4">Mapeamento de Colunas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Data *</label>
                  <select 
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={mapping.date}
                    onChange={e => setMapping(prev => ({ ...prev, date: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {columnOptions.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição *</label>
                  <select 
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={mapping.description}
                    onChange={e => setMapping(prev => ({ ...prev, description: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {columnOptions.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor *</label>
                  <select 
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={mapping.amount}
                    onChange={e => setMapping(prev => ({ ...prev, amount: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {columnOptions.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">ID Externo</label>
                  <select 
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={mapping.external_id}
                    onChange={e => setMapping(prev => ({ ...prev, external_id: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {columnOptions.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium mb-2">Preview (primeiras 10 linhas)</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 border text-left">Data</th>
                        <th className="p-2 border text-left">Descrição</th>
                        <th className="p-2 border text-left">Valor</th>
                        <th className="p-2 border text-left">ID Externo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 border">{mapping.date ? row[mapping.date] : '-'}</td>
                          <td className="p-2 border">{mapping.description ? row[mapping.description] : '-'}</td>
                          <td className="p-2 border">{mapping.amount ? row[mapping.amount] : '-'}</td>
                          <td className="p-2 border">{mapping.external_id ? row[mapping.external_id] : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processando...' : `Enviar ${parsedData.length} transações para Triagem`}
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium">Formatos Suportados:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV (separado por vírgula)</li>
                <li>Encoding UTF-8 recomendado</li>
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
        <CardContent>
          <StagingTable />
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