import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types';
import { apiService } from '@/services/api';
import { getUserLocation } from '@/utils/distance';
import StatusBadge from '@/components/StatusBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Filter, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Map = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, location] = await Promise.all([
        apiService.getIssues(),
        getUserLocation(),
      ]);
      
      setUserLocation(location);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issues. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = issues;
    if (statusFilter !== 'All') {
      filtered = issues.filter(issue => issue.status === statusFilter);
    }
    setFilteredIssues(filtered);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading map data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Issues Map
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          View all reported civic issues on an interactive map
        </p>
        {userLocation && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4" />
            <span>Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map placeholder and issue list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map placeholder */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Interactive Map</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Interactive map will be integrated here
              </p>
              <p className="text-sm text-muted-foreground">
                Consider integrating Mapbox or Google Maps for full functionality
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Issue details */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle>
              {selectedIssue ? 'Issue Details' : 'Issue List'}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            {selectedIssue ? (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedIssue(null)}
                >
                  ← Back to list
                </Button>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
                  
                  <div className="flex gap-2">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>Location: {selectedIssue.location_lat.toFixed(4)}, {selectedIssue.location_lng.toFixed(4)}</div>
                    {userLocation && (
                      <div>
                        Distance: {formatDistance(calculateDistance(
                          userLocation.lat, 
                          userLocation.lng, 
                          selectedIssue.location_lat, 
                          selectedIssue.location_lng
                        ))} away
                      </div>
                    )}
                    <div>Reported: {new Date(selectedIssue.created_at).toLocaleDateString()}</div>
                    <div>Reporter: {selectedIssue.reporter_type}</div>
                  </div>

                  {selectedIssue.images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssue.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Issue image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-auto">
                {filteredIssues.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No issues found with the current filters
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{issue.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{issue.description}</p>
                          <div className="flex gap-1 mt-2">
                            <CategoryBadge category={issue.category} />
                            <StatusBadge status={issue.status} />
                          </div>
                        </div>
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-reported">
                {issues.filter(i => i.status === 'Reported').length}
              </div>
              <div className="text-sm text-muted-foreground">Reported Issues</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-in-progress">
                {issues.filter(i => i.status === 'In Progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-resolved">
                {issues.filter(i => i.status === 'Resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Map;