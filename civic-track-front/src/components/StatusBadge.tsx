import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';
import { Clock, Wrench, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: Issue['status'];
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = {
    'Reported': {
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-status-reported text-warning-foreground',
    },
    'In Progress': {
      variant: 'default' as const,
      icon: Wrench,
      className: 'bg-status-in-progress text-info-foreground',
    },
    'Resolved': {
      variant: 'secondary' as const,
      icon: CheckCircle,
      className: 'bg-status-resolved text-success-foreground',
    },
  };

  const { icon: Icon, className: statusClassName } = config[status];

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 ${statusClassName} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export default StatusBadge;