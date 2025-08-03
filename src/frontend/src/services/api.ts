import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://us-central1-drillsargeant-19d36.cloudfunctions.net/api';

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
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
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

  // Auth test
  async testAuth(): Promise<any> {
    const response = await this.makeRequest('/api/auth/test');
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService; 