import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Issue, User, StatusLog, Analytics } from '@/types';
import { apiService } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  Flag,
  Ban,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

const Admin = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updateNote, setUpdateNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, usersData, analyticsData] = await Promise.all([
        apiService.getIssues(),
        apiService.getUsers(),
        apiService.getAnalytics(),
      ]);
      
      setIssues(issuesData);
      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: Issue['status']) => {
    try {
      await apiService.updateIssueStatus(issueId, newStatus, updateNote);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
      setUpdateNote('');
      toast({
        title: 'Status Updated',
        description: `Issue status changed to ${newStatus}.`,
      });
      
      // Refresh status logs if viewing issue details
      if (selectedIssue?.id === issueId) {
        const logs = await apiService.getStatusLogs(issueId);
        setStatusLogs(logs);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFlagIssue = async (issueId: string) => {
    try {
      await apiService.flagIssue(issueId);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, flagged: true } : issue
      ));
      toast({
        title: 'Issue Flagged',
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

  const handleBanUser = async (userId: string) => {
    try {
      await apiService.banUser(userId);
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, banned: true } : user
      ));
      toast({
        title: 'User Banned',
        description: 'The user has been banned.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to ban user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadIssueDetails = async (issue: Issue) => {
    setSelectedIssue(issue);
    try {
      const logs = await apiService.getStatusLogs(issue.id);
      setStatusLogs(logs);
    } catch (error) {
      console.error('Error loading status logs:', error);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage civic issues, users, and system analytics
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-status-resolved" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-resolved">{analytics.resolvedReports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-status-in-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-in-progress">{analytics.pendingReports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Issue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues ({filteredIssues.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-auto">
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-3 border border-border rounded-lg cursor-pointer transition-colors ${
                        selectedIssue?.id === issue.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => loadIssueDetails(issue)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{issue.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{issue.description}</p>
                          <div className="flex gap-1 mt-2">
                            <CategoryBadge category={issue.category} />
                            <StatusBadge status={issue.status} />
                            {issue.flagged && <Badge variant="destructive" className="text-xs">Flagged</Badge>}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedIssue ? 'Issue Details' : 'Select an Issue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedIssue ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedIssue.description}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <CategoryBadge category={selectedIssue.category} />
                      <StatusBadge status={selectedIssue.status} />
                      {selectedIssue.flagged && <Badge variant="destructive">Flagged</Badge>}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>Location: {selectedIssue.location_lat.toFixed(4)}, {selectedIssue.location_lng.toFixed(4)}</div>
                      <div>Reporter: {selectedIssue.reporter_type}</div>
                      <div>Created: {new Date(selectedIssue.created_at).toLocaleString()}</div>
                      <div>Updated: {new Date(selectedIssue.updated_at).toLocaleString()}</div>
                    </div>

                    {/* Status Update */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Update Status</h4>
                      <Select
                        value={selectedIssue.status}
                        onValueChange={(value) => handleStatusUpdate(selectedIssue.id, value as Issue['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Reported">Reported</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Textarea
                        placeholder="Add a note about this status change..."
                        value={updateNote}
                        onChange={(e) => setUpdateNote(e.target.value)}
                        rows={2}
                      />

                      <div className="flex gap-2">
                        {!selectedIssue.flagged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlagIssue(selectedIssue.id)}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag Issue
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Status History */}
                    {statusLogs.length > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium">Status History</h4>
                        <div className="space-y-2 max-h-32 overflow-auto">
                          {statusLogs.map((log) => (
                            <div key={log.id} className="text-xs p-2 bg-muted rounded">
                              <div className="flex justify-between">
                                <span>{log.old_status} → {log.new_status}</span>
                                <span>{new Date(log.created_at).toLocaleDateString()}</span>
                              </div>
                              {log.note && <div className="text-muted-foreground mt-1">{log.note}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select an issue from the list to view details and manage it
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{user.name || 'Anonymous User'}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                        {user.banned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!user.banned && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBanUser(user.user_id)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topCategories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <CategoryBadge category={item.category} />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.count} issues</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Resolution Rate</span>
                    <span className="font-medium">
                      {analytics ? Math.round((analytics.resolvedReports / analytics.totalReports) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-medium">{users.filter(u => !u.banned).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flagged Issues</span>
                    <span className="font-medium">{issues.filter(i => i.flagged).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        Issue status changed from <StatusBadge status={log.old_status} /> to <StatusBadge status={log.new_status} />
                      </p>
                      {log.note && (
                        <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;