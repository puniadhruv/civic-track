import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';
import { Car, Lightbulb, Droplets, Trash2, Shield, AlertTriangle } from 'lucide-react';

interface CategoryBadgeProps {
  category: Issue['category'];
  className?: string;
}

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const config = {
    'Roads': {
      icon: Car,
      className: 'bg-category-roads/20 text-category-roads border-category-roads/30',
    },
    'Lighting': {
      icon: Lightbulb,
      className: 'bg-category-lighting/20 text-category-lighting border-category-lighting/30',
    },
    'Water Supply': {
      icon: Droplets,
      className: 'bg-category-water/20 text-category-water border-category-water/30',
    },
    'Cleanliness': {
      icon: Trash2,
      className: 'bg-category-cleanliness/20 text-category-cleanliness border-category-cleanliness/30',
    },
    'Public Safety': {
      icon: Shield,
      className: 'bg-category-safety/20 text-category-safety border-category-safety/30',
    },
    'Obstructions': {
      icon: AlertTriangle,
      className: 'bg-category-obstructions/20 text-category-obstructions border-category-obstructions/30',
    },
  };

  const { icon: Icon, className: categoryClassName } = config[category];

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${categoryClassName} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {category}
    </Badge>
  );
};

export default CategoryBadge;