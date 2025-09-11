import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  Upload, 
  Receipt, 
  Calendar, 
  ShieldCheck,
  RefreshCw,
  FileText,
  Users,
  Wallet
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    adminOnly: false
  },
  {
    title: 'Importações',
    href: '/imports',
    icon: Upload,
    adminOnly: false
  },
  {
    title: 'Transações',
    href: '/transactions',
    icon: Receipt,
    adminOnly: false
  },
  {
    title: 'Faturas',
    href: '/invoices',
    icon: FileText,
    adminOnly: false
  },
  {
    title: 'Recorrentes',
    href: '/recurring',
    icon: RefreshCw,
    adminOnly: false
  },
  {
    title: 'Regras',
    href: '/rules',
    icon: Settings,
    adminOnly: false
  },
  {
    title: 'Contas',
    href: '/accounts',
    icon: Wallet,
    adminOnly: false
  },
  {
    title: 'Entidades',
    href: '/entities',
    icon: Users,
    adminOnly: false
  },
  {
    title: 'Assinatura',
    href: '/billing',
    icon: CreditCard,
    adminOnly: false
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: ShieldCheck,
    adminOnly: true
  }
];

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="flex flex-col space-y-1 p-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};