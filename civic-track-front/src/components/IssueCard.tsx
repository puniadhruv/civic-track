import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { Clock, MapPin, Camera, Flag, Eye } from 'lucide-react';
import { formatDistance } from '@/utils/distance';
import { Link } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
  onFlag?: (issueId: string) => void;
}

const IssueCard = ({ issue, onFlag }: IssueCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
              {issue.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {issue.description}
            </p>
          </div>
          {issue.flagged && (
            <Flag className="h-4 w-4 text-destructive flex-shrink-0" />
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Image preview */}
        {issue.images.length > 0 && (
          <div className="mb-4">
            <img 
              src={issue.images[0]} 
              alt="Issue"
              className="w-full h-32 object-cover rounded-md border border-border"
            />
            {issue.images.length > 1 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Camera className="h-3 w-3" />
                +{issue.images.length - 1} more image{issue.images.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Meta information */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{formatDate(issue.created_at)}</span>
            <span className="text-xs">• {issue.reporter_type}</span>
          </div>
          
          {issue.distance !== undefined && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{formatDistance(issue.distance)} away</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/issue/${issue.id}`} className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              View Details
            </Link>
          </Button>
          
          {onFlag && !issue.flagged && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFlag(issue.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueCard;