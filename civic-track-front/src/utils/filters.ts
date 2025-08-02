import { Issue, FilterOptions } from '@/types';
import { calculateDistance } from './distance';

export function filterIssues(
  issues: Issue[],
  filters: FilterOptions,
  userLocation?: { lat: number; lng: number }
): Issue[] {
  return issues.filter((issue) => {
    // Category filter
    if (filters.category && filters.category !== 'All' && issue.category !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'All' && issue.status !== filters.status) {
      return false;
    }

    // Distance filter
    if (filters.distance && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        issue.location_lat,
        issue.location_lng
      );
      if (distance > filters.distance) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = issue.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = issue.description.toLowerCase().includes(searchTerm);
      const categoryMatch = issue.category.toLowerCase().includes(searchTerm);
      
      if (!titleMatch && !descriptionMatch && !categoryMatch) {
        return false;
      }
    }

    return true;
  });
}

export function sortIssuesByDistance(
  issues: Issue[],
  userLocation: { lat: number; lng: number }
): Issue[] {
  return issues
    .map((issue) => ({
      ...issue,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        issue.location_lat,
        issue.location_lng
      ),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}