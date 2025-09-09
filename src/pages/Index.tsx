// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">FaturAI</h1>
        <p className="text-xl text-muted-foreground mb-8">Plataforma financeira para autônomos e agências</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/register">Criar Conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
