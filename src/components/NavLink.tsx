import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function NavLink({ to, icon: Icon, children, className }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn('w-full justify-start', className)}
    >
      <Link to={to}>
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {children}
      </Link>
    </Button>
  );
}