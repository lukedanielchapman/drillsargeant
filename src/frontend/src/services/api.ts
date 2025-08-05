import { auth } from '../config/firebase';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://us-central1-drillsargeant-19d36.cloudfunctions.net/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response;
  }

  private async makeFileRequest(endpoint: string, formData: FormData): Promise<Response> {
    const token = await this.getAuthToken();
    
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData - browser will set it with boundary
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response;
  }

  // Health check
  async getHealth(): Promise<any> {
    const response = await this.makeRequest('/health');
    return response.json();
  }

  // Projects
  async getProjects(): Promise<any[]> {
    const response = await this.makeRequest('/api/projects');
    return response.json();
  }

  async createProject(projectData: {
    name: string;
    description: string;
    repositoryUrl: string;
  }): Promise<any> {
    const response = await this.makeRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.json();
  }

  // Assessments
  async createAssessment(assessmentData: {
    projectId: string;
    assessmentType: string;
    configuration: any;
  }): Promise<any> {
    const response = await this.makeRequest('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
    return response.json();
  }

  async getAssessment(assessmentId: string): Promise<any> {
    const response = await this.makeRequest(`/api/assessments/${assessmentId}`);
    return response.json();
  }

  // Issues
  async getIssues(): Promise<any[]> {
    const response = await this.makeRequest('/api/issues');
    return response.json();
  }

  async getIssue(issueId: string): Promise<any> {
    const response = await this.makeRequest(`/api/issues/${issueId}`);
    return response.json();
  }

  async updateIssueStatus(issueId: string, status: string): Promise<any> {
    const response = await this.makeRequest(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.json();
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const response = await this.makeRequest('/api/analytics');
    return response.json();
  }

  async exportAnalytics(format: 'pdf' | 'excel' = 'pdf'): Promise<any> {
    const response = await this.makeRequest('/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format })
    });
    return response.json();
  }

  // Export functionality
  async downloadReport(exportId: string): Promise<Blob> {
    const response = await this.makeRequest(`/api/exports/${exportId}/download`);
    return response.blob();
  }

  async getExportStatus(exportId: string): Promise<any> {
    const response = await this.makeRequest(`/api/exports/${exportId}/status`);
    return response.json();
  }

  // Notifications API
  async getNotifications(limit = 50, unreadOnly = false): Promise<any[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });
    const response = await this.makeRequest(`/api/notifications?${params}`);
    return response.json();
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    const response = await this.makeRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    return response.json();
  }

  async deleteNotification(notificationId: string): Promise<any> {
    const response = await this.makeRequest(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // User Management API
  async getUsers(): Promise<any[]> {
    const response = await this.makeRequest('/api/users');
    return response.json();
  }

  async createUser(userData: any): Promise<any> {
    const response = await this.makeRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const response = await this.makeRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async deleteUser(userId: string): Promise<any> {
    const response = await this.makeRequest(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Team Management API
  async getTeams(): Promise<any[]> {
    const response = await this.makeRequest('/api/teams');
    return response.json();
  }

  async createTeam(teamData: any): Promise<any> {
    const response = await this.makeRequest('/api/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
    return response.json();
  }

  async updateTeam(teamId: string, teamData: any): Promise<any> {
    const response = await this.makeRequest(`/api/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    });
    return response.json();
  }

  async deleteTeam(teamId: string): Promise<any> {
    const response = await this.makeRequest(`/api/teams/${teamId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // File Upload and Analysis
  async uploadFiles(projectId: string, formData: FormData): Promise<any> {
    const response = await this.makeFileRequest(`/api/projects/${projectId}/upload-files`, formData);
    return response.json();
  }

  async getAnalysisProgress(progressId: string): Promise<any> {
    const response = await this.makeRequest(`/api/analysis-progress/${progressId}`);
    return response.json();
  }

  // Directory Analysis
  async analyzeDirectoryFiles(projectId: string, files: Array<{path: string, content: string, type: string}>): Promise<any> {
    const response = await this.makeRequest(`/api/projects/${projectId}/analyze-directory`, {
      method: 'POST',
      body: JSON.stringify({ files }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  // Auth test
  async testAuth(): Promise<any> {
    const response = await this.makeRequest('/api/auth/test');
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService; 