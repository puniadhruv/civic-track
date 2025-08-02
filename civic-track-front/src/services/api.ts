import { Issue, User, StatusLog, Analytics } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Real Supabase API service
class ApiService {
  // Issues
  async getIssues(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getIssue(id: string): Promise<Issue | null> {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async createIssue(issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>): Promise<Issue> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('issues')
      .insert({
        ...issue,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateIssueStatus(id: string, status: Issue['status'], note?: string): Promise<Issue> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get the current issue to log status change
    const { data: currentIssue } = await supabase
      .from('issues')
      .select('status')
      .eq('id', id)
      .single();

    // Update the issue
    const { data, error } = await supabase
      .from('issues')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the status change
    if (currentIssue && user) {
      await supabase
        .from('status_logs')
        .insert({
          issue_id: id,
          old_status: currentIssue.status,
          new_status: status,
          note,
          updated_by: user.id,
        });
    }

    return data;
  }

  async flagIssue(id: string): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .update({ flagged: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Status logs
  async getStatusLogs(issueId: string): Promise<StatusLog[]> {
    const { data, error } = await supabase
      .from('status_logs')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    // Get total reports
    const { count: totalReports } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true });

    // Get resolved reports
    const { count: resolvedReports } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Resolved');

    // Get pending reports
    const { count: pendingReports } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'Resolved');

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('status_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get top categories (simplified for now)
    const { data: categoryData } = await supabase
      .from('issues')
      .select('category');

    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ 
        category: category as Issue['category'], 
        count 
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReports: totalReports || 0,
      resolvedReports: resolvedReports || 0,
      pendingReports: pendingReports || 0,
      topCategories,
      recentActivity: recentActivity || [],
    };
  }

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async banUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ banned: true })
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const apiService = new ApiService();