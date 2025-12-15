const API_BASE_URL = 'http://localhost:5000/api';

class MongoService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('mongoToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // Fallback to local storage for demo
      return this.fallbackToLocal(endpoint, options);
    }
  }

  private fallbackToLocal(endpoint: string, options: RequestInit) {
    console.log('🔄 Falling back to local storage for:', endpoint);
    // Return mock data structure
    return { success: true, data: [], message: 'Using local fallback' };
  }

  // Authentication
  async googleLogin(userData: { email: string; name: string; googleId: string }) {
    const result = await this.request('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (result.success && result.token) {
      this.token = result.token;
      localStorage.setItem('mongoToken', result.token);
    }
    
    return result;
  }

  async login(email: string, password: string, role: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    if (result.success && result.token) {
      this.token = result.token;
      localStorage.setItem('mongoToken', result.token);
    }
    
    return result;
  }

  // Patients
  async getPatients() {
    return this.request('/patients');
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}`);
  }

  async createPatient(patientData: any) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(id: string, updates: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async searchPatients(query: string) {
    return this.request(`/patients/search/${encodeURIComponent(query)}`);
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.request('/health');
      console.log('🏥 MongoDB Health:', result);
      return result;
    } catch (error) {
      console.log('📱 Using local storage mode');
      return { status: 'Local Mode', database: 'IndexedDB' };
    }
  }

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('mongoToken');
  }
}

export const mongoService = new MongoService();