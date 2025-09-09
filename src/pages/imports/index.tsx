import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StagingTable } from '@/components/finance/StagingTable';
import { Upload, FileText } from 'lucide-react';

const ImportsPage = () => {
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