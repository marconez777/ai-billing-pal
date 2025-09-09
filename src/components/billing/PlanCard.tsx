import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Plan } from '@/lib/types';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export const PlanCard = ({ plan, isCurrentPlan = false, onSelect, disabled = false }: PlanCardProps) => {
  return (
    <Card className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2" variant="default">
          Plano Atual
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          <span className="text-2xl font-bold">
            R$ {plan.price.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground">/mês</span>
          </span>
        </CardTitle>
        <CardDescription>
          {plan.name === 'Básico' && 'Ideal para freelancers iniciantes'}
          {plan.name === 'Profissional' && 'Para agências em crescimento'}
          {plan.name === 'Empresarial' && 'Para grandes volumes de transações'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className="w-full" 
          onClick={onSelect}
          disabled={disabled || isCurrentPlan}
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isCurrentPlan ? 'Plano Ativo' : disabled ? 'Em breve' : 'Selecionar Plano'}
        </Button>
      </CardContent>
    </Card>
  );
};