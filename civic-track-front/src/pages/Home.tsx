import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Issue, FilterOptions } from '@/types';
import { apiService } from '@/services/api';
import { filterIssues, sortIssuesByDistance } from '@/utils/filters';
import { getUserLocation } from '@/utils/distance';
import IssueCard from '@/components/IssueCard';
import { Search, Filter, MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Home = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All',
    status: 'All',
    distance: 5,
    search: '',
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (issues.length > 0) {
      applyFilters();
    }
  }, [issues, filters, userLocation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, location] = await Promise.all([
        apiService.getIssues(),
        getUserLocation(),
      ]);
      
      setUserLocation(location);
      const issuesWithDistance = sortIssuesByDistance(issuesData, location);
      setIssues(issuesWithDistance);
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
    const filtered = filterIssues(issues, filters, userLocation || undefined);
    setFilteredIssues(filtered);
  };

  const handleFlag = async (issueId: string) => {
    try {
      await apiService.flagIssue(issueId);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, flagged: true } : issue
      ));
      toast({
        title: 'Issue flagged',
        description: 'The issue has been flagged for review.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to flag issue. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'Reported').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          CivicTrack Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Report and track civic issues in your neighborhood. Together, we can make our community better.
        </p>
        {userLocation && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Showing issues within {filters.distance}km of your location</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
            <Clock className="h-4 w-4 text-status-reported" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-reported">{stats.reported}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-in-progress">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-resolved">{stats.resolved}</div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.category || 'All'} onValueChange={(value) => setFilters({ ...filters, category: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Roads">Roads</SelectItem>
                <SelectItem value="Lighting">Lighting</SelectItem>
                <SelectItem value="Water Supply">Water Supply</SelectItem>
                <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                <SelectItem value="Public Safety">Public Safety</SelectItem>
                <SelectItem value="Obstructions">Obstructions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status || 'All'} onValueChange={(value) => setFilters({ ...filters, status: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.distance?.toString() || '5'} onValueChange={(value) => setFilters({ ...filters, distance: Number(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Within 1km</SelectItem>
                <SelectItem value="3">Within 3km</SelectItem>
                <SelectItem value="5">Within 5km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Local Issues ({filteredIssues.length})
          </h2>
          <Button asChild>
            <a href="/report">Report New Issue</a>
          </Button>
        </div>
        
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p className="text-muted-foreground">
                {issues.length === 0 
                  ? "No issues have been reported in your area yet." 
                  : "Try adjusting your filters to see more issues."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onFlag={handleFlag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;