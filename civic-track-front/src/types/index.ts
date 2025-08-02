export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'Roads' | 'Lighting' | 'Water Supply' | 'Cleanliness' | 'Public Safety' | 'Obstructions';
  status: 'Reported' | 'In Progress' | 'Resolved';
  images: string[];
  location_lat: number;
  location_lng: number;
  reporter_type: 'Anonymous' | 'Verified';
  user_id: string | null;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  distance?: number; // calculated distance from user
}

export interface User {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  is_admin: boolean;
  location_lat: number | null;
  location_lng: number | null;
  banned: boolean;
  created_at: string;
}

export interface FilterOptions {
  category?: Issue['category'] | 'All';
  status?: Issue['status'] | 'All';
  distance?: number;
  search?: string;
}

export interface StatusLog {
  id: string;
  issue_id: string;
  old_status: Issue['status'];
  new_status: Issue['status'];
  note?: string | null;
  updated_by: string | null;
  created_at: string;
}

export interface Analytics {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  topCategories: Array<{
    category: Issue['category'];
    count: number;
  }>;
  recentActivity: StatusLog[];
}